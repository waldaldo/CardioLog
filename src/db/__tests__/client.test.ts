jest.mock('expo-sqlite', () => {
  const mockDb = {
    execAsync: jest.fn(),
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1 }),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    getAllAsync: jest.fn().mockResolvedValue([]),
  };
  return { openDatabaseAsync: jest.fn().mockResolvedValue(mockDb) };
});

import { getDb } from '../client';

describe('client', () => {
  it('getDb abre la base de datos y ejecuta el schema', async () => {
    const db = await getDb();
    expect(db).toBeDefined();
    expect(db.execAsync).toHaveBeenCalled();
    expect(db.runAsync).toHaveBeenCalled();
  });
});
