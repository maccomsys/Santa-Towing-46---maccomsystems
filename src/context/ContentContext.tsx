import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import defaultSiteContent from '../data/site-content.json';
import { santaLogo, resolveAssetTree, resolveAssetUrl } from '../assets/images';
import {
  getContent,
  saveContent,
  saveMultiple,
  resetContent,
  resetAll,
  subscribeToContent
} from '../lib/contentStorage';
import {
  isDangerousKey,
  sanitizeHexColor,
  sanitizeImageUrl,
  sanitizeObjectTree,
} from '../lib/security';

const RESOLVED_DEFAULT_SITE_CONTENT = resolveAssetTree(defaultSiteContent);

interface ContentContextType {
  get: <T = any>(key: string, fallback?: T) => T;
  set: (key: string, value: any) => boolean;
  saveContent: (key: string, value: any) => boolean;
  setMultiple: (entries: Record<string, any>) => boolean;
  saveMultiple: (entries: Record<string, any>) => boolean;
  reset: (key: string) => boolean;
  resetContent: (key: string) => boolean;
  resetAll: () => boolean;
  rawOverrides: Record<string, any>;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    dark: string;
    background: string;
    white: string;
    black: string;
  };
}

const ContentContext = createContext<ContentContextType | null>(null);

/**
 * Traverse nested object by dot notation path (e.g., 'global.links.phone' or 'home.hero.slides.0.headline')
 */
export function getByDotPath(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  if (typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, path) && !isDangerousKey(path)) {
    return obj[path];
  }
  const parts = path.split('.');
  if (parts.some(isDangerousKey)) return undefined;
  let curr = obj;
  for (const part of parts) {
    if (
      curr === null ||
      curr === undefined ||
      typeof curr !== 'object' ||
      !Object.prototype.hasOwnProperty.call(curr, part)
    ) {
      return undefined;
    }
    curr = curr[part];
  }
  return curr;
}

/**
 * Set value on a nested object/array by dot notation path
 */
function setByDotPath(obj: any, path: string, value: any): void {
  if (!obj || !path) return;
  const parts = path.split('.');
  if (parts.some(isDangerousKey)) return;
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];
    if (
      !Object.prototype.hasOwnProperty.call(curr, part) ||
      curr[part] === undefined ||
      curr[part] === null ||
      typeof curr[part] !== 'object'
    ) {
      curr[part] = /^\d+$/.test(nextPart) ? [] : {};
    }
    curr = curr[part];
  }
  const leaf = parts[parts.length - 1];
  if (!isDangerousKey(leaf)) {
    curr[leaf] = sanitizeObjectTree(value);
  }
}

function buildMergedContent(base: any, overrides: Record<string, any>): any {
  const cloned = sanitizeObjectTree(JSON.parse(JSON.stringify(base)));
  for (const [k, v] of Object.entries(overrides)) {
    if (v !== undefined && !isDangerousKey(k)) {
      setByDotPath(cloned, k, v);
    }
  }
  return cloned;
}

/**
 * Apply CSS variables to root element for runtime Tailwind v4 theme styling
 */
function applyThemeToDocument(theme: Record<string, string>) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  const primary = sanitizeHexColor(theme.primary, '#015557');
  const secondary = sanitizeHexColor(theme.secondary, '#192e2e');
  const accent = sanitizeHexColor(theme.accent, '#d80000');
  const dark = sanitizeHexColor(theme.dark, '#131514');
  const background = sanitizeHexColor(theme.background, '#ffffff');
  const white = sanitizeHexColor(theme.white, '#ffffff');
  const black = sanitizeHexColor(theme.black, '#000000');

  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-secondary', secondary);
  root.style.setProperty('--color-accent', accent);
  root.style.setProperty('--color-dark', dark);
  root.style.setProperty('--color-background', background);
  document.body.style.backgroundColor = background;
  root.style.setProperty('--color-white', white);
  root.style.setProperty('--color-black', black);
}

/**
 * Updates browser favicon link in head dynamically
 */
export function updateFavicon(url: string) {
  if (typeof document === 'undefined' || !url) return;
  const safeUrl = sanitizeImageUrl(url, '');
  if (!safeUrl) return;
  let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  if (link.href !== safeUrl) {
    link.href = safeUrl;
  }
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, any>>(() => getContent());

  useEffect(() => {
    // Subscribe to content storage changes (same tab & cross-tab)
    const unsubscribe = subscribeToContent(() => {
      setOverrides({ ...getContent() });
    });
    return unsubscribe;
  }, []);

  const mergedContent = useMemo(() => {
    return buildMergedContent(RESOLVED_DEFAULT_SITE_CONTENT, overrides);
  }, [overrides]);

  // Compute active theme colors
  const activeTheme = useMemo(() => {
    const themeObj = mergedContent.theme || {};
    return {
      primary: sanitizeHexColor(overrides['theme.primary'] || themeObj.primary, '#015557'),
      secondary: sanitizeHexColor(overrides['theme.secondary'] || themeObj.secondary, '#192e2e'),
      accent: sanitizeHexColor(overrides['theme.accent'] || themeObj.accent, '#d80000'),
      dark: sanitizeHexColor(overrides['theme.dark'] || themeObj.dark, '#131514'),
      background: sanitizeHexColor(overrides['theme.background'] || themeObj.background, '#ffffff'),
      white: sanitizeHexColor(overrides['theme.white'] || themeObj.white, '#ffffff'),
      black: sanitizeHexColor(overrides['theme.black'] || themeObj.black, '#000000'),
    };
  }, [overrides, mergedContent]);

  // Synchronize CSS variables whenever theme updates
  useEffect(() => {
    applyThemeToDocument(activeTheme);
  }, [activeTheme]);

  // Synchronize browser favicon whenever logo updates
  const activeLogoUrl = useMemo(() => {
    const raw = overrides['global.logo.url'] || mergedContent.global?.logo?.url || santaLogo;
    return typeof raw === 'string' ? sanitizeImageUrl(resolveAssetUrl(raw), santaLogo) : santaLogo;
  }, [overrides, mergedContent]);

  useEffect(() => {
    updateFavicon(activeLogoUrl);
  }, [activeLogoUrl]);

  /**
   * Resolution hierarchy:
   * 1. Edited value from storage (overrides[key] or merged tree)
   * 2. Default value from site-content.json
   * 3. Fallback provided by caller
   */
  const get = useCallback(<T = any>(key: string, fallback?: T): T => {
    if (Object.prototype.hasOwnProperty.call(overrides, key) && !isDangerousKey(key) && overrides[key] !== undefined) {
      const val = overrides[key];
      return (typeof val === 'string' ? resolveAssetUrl(val) : val) as T;
    }
    const fromMerged = getByDotPath(mergedContent, key);
    if (fromMerged !== undefined) {
      return (typeof fromMerged === 'string' ? resolveAssetUrl(fromMerged) : fromMerged) as T;
    }
    return fallback as T;
  }, [overrides, mergedContent]);

  const set = useCallback((key: string, value: any): boolean => {
    return saveContent(key, value);
  }, []);

  const setMultiple = useCallback((entries: Record<string, any>): boolean => {
    return saveMultiple(entries);
  }, []);

  const reset = useCallback((key: string): boolean => {
    return resetContent(key);
  }, []);

  const handleResetAll = useCallback((): boolean => {
    return resetAll();
  }, []);

  const contextValue = useMemo(() => ({
    get,
    set,
    saveContent: set,
    setMultiple,
    saveMultiple: setMultiple,
    reset,
    resetContent: reset,
    resetAll: handleResetAll,
    rawOverrides: overrides,
    theme: activeTheme,
  }), [get, set, setMultiple, reset, handleResetAll, overrides, activeTheme]);

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  );
}

/**
 * Custom hook to get editable content value.
 * Order of precedence:
 * 1. Edited value in storage
 * 2. site-content.json value
 * 3. Fallback provided in component
 */
export function useContent<T = any>(key: string, fallback?: T): T {
  const context = useContext(ContentContext);
  if (!context) {
    // Graceful fallback if invoked outside of provider (e.g. testing or static init)
    const stored = getContent();
    if (key in stored && stored[key] !== undefined) {
      const val = stored[key];
      return (typeof val === 'string' ? resolveAssetUrl(val) : val) as T;
    }
    const fromDefault = getByDotPath(RESOLVED_DEFAULT_SITE_CONTENT, key);
    if (fromDefault !== undefined) {
      return (typeof fromDefault === 'string' ? resolveAssetUrl(fromDefault) : fromDefault) as T;
    }
    return fallback as T;
  }
  return context.get<T>(key, fallback);
}

export function useContentManager() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContentManager must be used within a ContentProvider');
  }
  return context;
}
