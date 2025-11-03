const { formatDataForExport } = require('../../utils/analyticsUtils');

describe('Analytics Utils', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('formatDataForExport', () => {
    it('should format data as JSON string', () => {
      const data = [
        { id: 1, name: 'Test One' },
        { id: 2, name: 'Test Two' },
      ];

      const result = formatDataForExport(data);

      expect(result).toBe(JSON.stringify(data, null, 2));
      expect(console.log).toHaveBeenCalledWith('Formatting data for export...');
    });

    it('should handle empty array', () => {
      const data = [];
      const result = formatDataForExport(data);

      expect(result).toBe(JSON.stringify([], null, 2));
    });

    it('should handle complex nested objects', () => {
      const data = [
        {
          id: 1,
          user: { firstName: 'John', lastName: 'Doe' },
          metadata: { created: new Date('2024-01-01') },
        },
      ];

      const result = formatDataForExport(data);
      const parsed = JSON.parse(result);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].user.firstName).toBe('John');
    });

    it('should format with proper indentation', () => {
      const data = { key: 'value' };
      const result = formatDataForExport(data);

      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });
  });
});