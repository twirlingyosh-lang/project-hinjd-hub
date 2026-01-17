import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ModuleName = 'aggregate_ops';

interface ModuleAccess {
  active: boolean;
  activatedAt: string | null;
  expiresAt: string | null;
}

interface ModuleAccessState {
  modules: Record<ModuleName, ModuleAccess>;
  isLoading: boolean;
  error: string | null;
}

const defaultModuleAccess: ModuleAccess = {
  active: false,
  activatedAt: null,
  expiresAt: null,
};

export const useModuleAccess = () => {
  const { user } = useAuth();
  const [state, setState] = useState<ModuleAccessState>({
    modules: {
      aggregate_ops: defaultModuleAccess,
    },
    isLoading: true,
    error: null,
  });

  const checkModuleAccess = useCallback(async () => {
    if (!user) {
      setState({
        modules: { aggregate_ops: defaultModuleAccess },
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Query user_modules table directly
      const { data, error } = await supabase
        .from('user_modules')
        .select('module_name, active, activated_at, expires_at')
        .eq('user_id', user.id);

      if (error) throw error;

      const modules: Record<ModuleName, ModuleAccess> = {
        aggregate_ops: defaultModuleAccess,
      };

      if (data) {
        data.forEach((row) => {
          const moduleName = row.module_name as ModuleName;
          if (moduleName in modules) {
            // Check if expired
            const isExpired = row.expires_at && new Date(row.expires_at) < new Date();
            modules[moduleName] = {
              active: row.active && !isExpired,
              activatedAt: row.activated_at,
              expiresAt: row.expires_at,
            };
          }
        });
      }

      setState({
        modules,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error checking module access:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to check module access',
      }));
    }
  }, [user]);

  useEffect(() => {
    checkModuleAccess();
  }, [checkModuleAccess]);

  // Refresh every 60 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkModuleAccess, 60000);
    return () => clearInterval(interval);
  }, [user, checkModuleAccess]);

  const hasAccess = useCallback((moduleName: ModuleName): boolean => {
    return state.modules[moduleName]?.active ?? false;
  }, [state.modules]);

  return {
    ...state,
    hasAccess,
    hasAggregateOpsAccess: state.modules.aggregate_ops.active,
    checkModuleAccess,
  };
};
