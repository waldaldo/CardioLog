import { useEffect, useState, useCallback } from 'react';
import { getProfile, saveProfile, Profile } from '../db/repositories';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setProfile(await getProfile());
    } catch (e) {
      console.warn('Error cargando perfil:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const save = useCallback(async (p: Profile) => {
    await saveProfile(p);
    await refresh();
  }, [refresh]);

  return { profile, loading, save, refresh };
}
