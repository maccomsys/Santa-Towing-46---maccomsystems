import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useEditMode } from '@/context/EditModeContext';
import { isAdmin } from '@/lib/auth';
import FloatingEditToolbar from '../editable/FloatingEditToolbar';

/**
 * Administrator-only Live Site Editor Controller.
 * Never rendered or loaded for public visitors or non-admin staff accounts.
 */
export default function EditModeBanner() {
  const location = useLocation();
  const { isOwner, isEditMode, setEditMode } = useEditMode();
  const canEditSite = isOwner && isAdmin();

  useEffect(() => {
    if (canEditSite && !isEditMode) {
      const params = new URLSearchParams(location.search);
      if (params.get('edit') === 'true') {
        setEditMode(true);
      }
    }
  }, [location.search, canEditSite, isEditMode, setEditMode]);

  if (!canEditSite) {
    return null;
  }

  return <FloatingEditToolbar />;
}

