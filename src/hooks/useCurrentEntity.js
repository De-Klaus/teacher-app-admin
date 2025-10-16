import { useUser } from '../contexts/UserContext';
import { useDataProvider } from 'react-admin';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../AuthContext';

/**
 * Custom hook to manage the current entity (teacher/student) and related permissions
 */
export const useCurrentEntity = () => {
  const dataProvider = useDataProvider();
  const { user } = useAuth();
  const {
    currentEntity,
    entityType,
    loading,
    getCurrentEntity,
    canPerformAction,
    getEntitySpecificData,
  } = useUser();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize entity on mount
  useEffect(() => {
    if (!isInitialized && dataProvider) {
      const initialize = async () => {
        await getCurrentEntity(dataProvider);
        setIsInitialized(true);
      };
      initialize();
    }
  }, [getCurrentEntity, dataProvider, isInitialized]);

  // Log when entityType becomes available
  useEffect(() => {
    if (entityType) {
    }
  }, [entityType]);

  // Expose readiness based on known entityType
  const isEntityTypeReady = Boolean(entityType);

  // Get current teacher ID
  const getCurrentTeacherId = useCallback(() => {
    if (entityType === 'TEACHER' && currentEntity) return currentEntity.id;
    // Fallback to JWT teacherId while entity resolves
    try {
      if (!user?.token) return null;
      const parts = user.token.split('.');
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(json);
      return payload.id || null;
    } catch {
      return null;
    }
  }, [entityType, currentEntity, user]);

  // Get current student ID
  const getCurrentStudentId = useCallback(() => {
    if (entityType === 'STUDENT' && currentEntity) return currentEntity.id;
    return null;
  }, [entityType, currentEntity]);

  // Permission checks
  const canCreateLessons = useCallback(() => canPerformAction('CREATE_LESSONS'), [canPerformAction]);
  const canCreateStudents = useCallback(() => canPerformAction('CREATE_STUDENTS'), [canPerformAction]);
  const canSeeStudents = useCallback(() => canPerformAction('VIEW_STUDENTS'), [canPerformAction]);
  const canManageLessons = useCallback(() => canPerformAction('MANAGE_LESSONS'), [canPerformAction]);

  // Fetch entity-specific lessons
  const getEntityLessons = useCallback(async () => {
    if (!currentEntity || !entityType || !dataProvider) return [];
    return getEntitySpecificData(dataProvider, 'LESSONS');
  }, [currentEntity, entityType, dataProvider, getEntitySpecificData]);

  // Fetch students for current teacher
  const getTeacherStudents = useCallback(async () => {
    if (entityType === 'TEACHER' && currentEntity && dataProvider) {
      return getEntitySpecificData(dataProvider, 'STUDENTS');
    }
    return [];
  }, [entityType, currentEntity, dataProvider, getEntitySpecificData]);

  // Display name of the entity
  const entityDisplayName = useMemo(() => {
    if (!currentEntity) return null;
    return `${currentEntity.firstName || ''} ${currentEntity.lastName || ''}`.trim();
  }, [currentEntity]);

  // Role display string
  const entityRoleDisplay = useMemo(() => {
    switch (entityType) {
      case 'TEACHER': return 'Учитель';
      case 'STUDENT': return 'Ученик';
      case 'ADMIN': return 'Администратор';
      default: return 'Пользователь';
    }
  }, [entityType]);

  return {
    // Data
    currentEntity,
    entityType,
    loading,
    isInitialized,
    isEntityTypeReady,

    // IDs
    getCurrentTeacherId,
    getCurrentStudentId,

    // Display
    entityDisplayName,
    entityRoleDisplay,

    // Permissions
    canCreateLessons,
    canCreateStudents,
    canSeeStudents,
    canManageLessons,

    // Data fetching
    getEntityLessons,
    getTeacherStudents,

    // Context functions
    getCurrentEntity,
    canPerformAction,
    getEntitySpecificData,
  };
};
