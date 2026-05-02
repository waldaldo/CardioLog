jest.mock('expo-sqlite', () => {
  const rows: any[] = [];
  const mockDb = {
    execAsync: jest.fn(),
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1 }),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn().mockResolvedValue(rows),
  };
  return { openDatabaseAsync: jest.fn().mockResolvedValue(mockDb) };
});

import { getDb } from '../client';

describe('repositories', () => {
  it('getDb retorna una instancia de BD', async () => {
    const db = await getDb();
    expect(db).toBeDefined();
    expect(db.getAllAsync).toBeDefined();
    expect(db.runAsync).toBeDefined();
    expect(db.getFirstAsync).toBeDefined();
  });
});
