const mockDb = {
  execAsync: jest.fn(),
  runAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn(),
};

const mockSQLite = {
  openDatabaseAsync: jest.fn().mockResolvedValue(mockDb),
};

module.exports = mockSQLite;
