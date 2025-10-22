import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from '../AuthContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentEntity, setCurrentEntity] = useState(null);
  const [entityType, setEntityType] = useState(null); // 'TEACHER' or 'STUDENT'
  const [loading, setLoading] = useState(false);

  // Function to decode JWT token and get user roles
  const getUserRoles = useCallback(() => {
    if (!user?.token) return null;
    try {
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
      return payload.roles || null;
    } catch (error) {
      console.error('Error decoding JWT for roles:', error);
      return null;
    }
  }, [user]);

  // Function to decode JWT token and get user ID (or teacherId if present)
  const getUserId = useCallback(() => {
    if (!user?.token) return null;
    try {
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
      // Prefer domain ids when available
      return payload.teacherId || payload.sub || payload.id || payload.userId || null;
    } catch (error) {
      console.error('Error decoding JWT for user ID:', error);
      return null;
    }
  }, [user]);

  // Function to determine entity type based on user roles
  const determineEntityType = useCallback(() => {
    const roles = getUserRoles();
    if (!roles || !Array.isArray(roles)) return null;
    
    // Priority: ADMIN > TEACHER > STUDENT
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('TEACHER')) return 'TEACHER';
    if (roles.includes('STUDENT')) return 'STUDENT';
    
    return null;
  }, [getUserRoles]);

  // Function to get current entity based on user role
  const getCurrentEntity = useCallback(async (dataProvider) => {
    if (!user?.token || !dataProvider) return null;
    
    setLoading(true);
    try {
      const roles = getUserRoles();
      const userId = getUserId();
      const detectedEntityType = determineEntityType();
      
      if (!roles || !Array.isArray(roles) || !userId || !detectedEntityType) {
        setCurrentEntity(null);
        setEntityType(null);
        return null;
      }

      // Persist detected entity type immediately so consumers can react to it
      setEntityType(detectedEntityType);

      let entity = null;
      // Also decode payload to attempt richer matching (email/teacherId)
      let emailFromToken = null;
      let teacherIdFromToken = null;
      try {
        const parts = user.token.split('.');
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(json);
        emailFromToken = payload.email || payload.username || null;
        teacherIdFromToken = payload.teacherId || null;
      } catch (e) {
        // ignore
      }
      
      // For TEACHER role, get teacher entity
      if (detectedEntityType === 'TEACHER' || detectedEntityType === 'ADMIN') {
        try {
          // Prefer direct endpoint by userId when available
          if (userId) {
            try {
              const teacher = await dataProvider.getTeacherByUserId(userId);
              if (teacher) entity = teacher;
            } catch (e) {
              // fall back to list search below
            }
          }

          if (!entity) {
            const teachersRes = await dataProvider.getList('teachers', { 
              pagination: { page: 1, perPage: 100 } 
            });
            // Try multiple matching strategies
            entity = teachersRes.data.find(teacher => teacher.id === teacherIdFromToken) 
              || teachersRes.data.find(teacher => teacher.userId === userId || teacher.id === userId)
              || teachersRes.data.find(teacher => (
                (teacher.email && teacher.email === emailFromToken) ||
                (teacher.userEmail && teacher.userEmail === emailFromToken) ||
                (teacher.login && teacher.login === emailFromToken)
              ));
          }
          if (entity) {
            setEntityType('TEACHER');
          }
        } catch (error) {
          console.error('Error fetching teacher entity:', error);
        }
      }
      
      // For STUDENT role, get student entity
      if (detectedEntityType === 'STUDENT' && !entity) {
        try {
          // Prefer direct endpoint by userId when available
          if (userId) {
            try {
              const student = await dataProvider.getStudentByUserId(userId);
              if (student) entity = student;
            } catch (e) {
              // fall back to list search below
            }
          }
          
          if (!entity) {
            const studentsRes = await dataProvider.getList('students', { 
              pagination: { page: 1, perPage: 100 } 
            });
            entity = studentsRes.data.find(student => 
              student.userId === userId || student.id === userId
            );
          }
          if (entity) {
            setEntityType('STUDENT');
            console.log('Current student entity:', entity);
          }
        } catch (error) {
          console.error('Error fetching student entity:', error);
        }
      }

      setCurrentEntity(entity);
      return entity;
      
    } catch (error) {
      console.error('Error getting current entity:', error);
      setCurrentEntity(null);
      // Keep previously detected entity type to avoid flicker
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, getUserRoles, getUserId, determineEntityType]);

  // Function to set current entity manually
  const setCurrentEntityManually = useCallback((entity, type) => {
    setCurrentEntity(entity);
    setEntityType(type);
    console.log('Manually set entity:', entity, 'Type:', type);
  }, []);

  // Function to clear current entity
  const clearCurrentEntity = useCallback(() => {
    setCurrentEntity(null);
    setEntityType(null);
    console.log('Cleared current entity');
  }, []);

  // Helper function to check if user has any of the specified roles
  const hasAnyRole = useCallback((requiredRoles) => {
    const roles = getUserRoles();
    if (!roles || !Array.isArray(roles) || !Array.isArray(requiredRoles)) return false;
    return requiredRoles.some(role => roles.includes(role));
  }, [getUserRoles]);

  // Helper function to check if user has all of the specified roles
  const hasAllRoles = useCallback((requiredRoles) => {
    const roles = getUserRoles();
    if (!roles || !Array.isArray(roles) || !Array.isArray(requiredRoles)) return false;
    return requiredRoles.every(role => roles.includes(role));
  }, [getUserRoles]);

  // Helper function to check if user has specific role
  const hasRole = useCallback((role) => {
    const roles = getUserRoles();
    if (!roles || !Array.isArray(roles)) return false;
    return roles.includes(role);
  }, [getUserRoles]);

  // Function to check if user can perform action based on role
  const canPerformAction = useCallback((action) => {
    const roles = getUserRoles();
    if (!roles || !Array.isArray(roles)) return false;
    
    switch (action) {
      case 'CREATE_LESSONS':
      case 'CREATE_STUDENTS':
      case 'MANAGE_LESSONS':
        return hasAnyRole(['TEACHER', 'ADMIN']);
      
      case 'VIEW_LESSONS':
      case 'VIEW_STUDENTS':
        return hasAnyRole(['TEACHER', 'ADMIN', 'STUDENT']);
      
      case 'VIEW_OWN_LESSONS':
        return hasRole('STUDENT');
      
      case 'ADMIN_ACTIONS':
        return hasRole('ADMIN');
      
      default:
        return false;
    }
  }, [getUserRoles, hasAnyRole, hasRole]);

  // Function to get entity-specific data
  const getEntitySpecificData = useCallback(async (dataProvider, dataType) => {
    if (!currentEntity || !entityType || !dataProvider) return [];
    
    try {
      switch (dataType) {
        case 'LESSONS':
          if (hasRole('TEACHER')) {
            // Get lessons for this teacher
            const lessonsRes = await dataProvider.getList('lessons', { 
              pagination: { page: 1, perPage: 100 } 
            });
            return lessonsRes.data.filter(lesson => lesson.teacherId === currentEntity.id);
          } else if (hasRole('STUDENT')) {
            // Get lessons for this student
            const lessonsRes = await dataProvider.getList('lessons', { 
              pagination: { page: 1, perPage: 100 } 
            });
            return lessonsRes.data.filter(lesson => lesson.studentId === currentEntity.id);
          }
          break;
          
        case 'STUDENTS':
          if (hasRole('TEACHER')) {
            // Get students for this teacher
            return await dataProvider.getStudentsByTeacher(currentEntity.id);
          }
          break;
          
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error getting ${dataType} for ${entityType}:`, error);
      return [];
    }
    
    return [];
  }, [currentEntity, entityType, hasRole]);

  const value = {
    currentEntity,
    entityType,
    loading,
    getCurrentEntity,
    setCurrentEntityManually,
    clearCurrentEntity,
    canPerformAction,
    getEntitySpecificData,
    getUserRoles,
    getUserId,
    determineEntityType,
    hasAnyRole,
    hasAllRoles,
    hasRole
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
