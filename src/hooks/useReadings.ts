import { useEffect, useState, useCallback } from 'react';
import { listReadings, addReading as dbAdd, Reading } from '../db/repositories';

export function useReadings() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  // useCallback mantiene la misma referencia de `refresh` entre renders,
  // lo que permite usarla en useFocusEffect sin causar bucles infinitos.
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listReadings(2000);
      setReadings(rows);
    } catch (e) {
      console.warn('Error cargando mediciones:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (r: Omit<Reading, 'id' | 'category_id'>) => {
    await dbAdd(r);
    await refresh();
  }, [refresh]);

  return { readings, loading, add, refresh };
}
