const { success, error, paginated } = require('../../src/responseHelpers');

describe('Shared Utils - Response Helpers', () => {
  describe('success', () => {
    it('should create success response with default values', () => {
      const data = { id: 1, name: 'Test' };
      const response = success(data);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Success');
      expect(response.data).toEqual(data);
      expect(response.timestamp).toBeDefined();
    });

    it('should create success response with custom message', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Custom success message';
      const response = success(data, message);

      expect(response.success).toBe(true);
      expect(response.message).toBe(message);
      expect(response.data).toEqual(data);
    });
  });

  describe('error', () => {
    it('should create error response with default values', () => {
      const message = 'Something went wrong';
      const response = error(message);

      expect(response.success).toBe(false);
      expect(response.error).toBe(message);
      expect(response.timestamp).toBeDefined();
      expect(response.details).toBeUndefined();
    });

    it('should create error response with details', () => {
      const message = 'Validation failed';
      const details = ['Name is required', 'Email is invalid'];
      const response = error(message, 400, details);

      expect(response.success).toBe(false);
      expect(response.error).toBe(message);
      expect(response.details).toEqual(details);
    });
  });

  describe('paginated', () => {
    it('should create paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const page = 1;
      const limit = 10;
      const total = 25;
      const response = paginated(data, page, limit, total);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: false
      });
    });

    it('should calculate pagination correctly for last page', () => {
      const data = [{ id: 21 }, { id: 22 }];
      const page = 3;
      const limit = 10;
      const total = 22;
      const response = paginated(data, page, limit, total);

      expect(response.pagination).toEqual({
        page: 3,
        limit: 10,
        total: 22,
        totalPages: 3,
        hasNext: false,
        hasPrev: true
      });
    });

    it('should handle single page results', () => {
      const data = [{ id: 1 }];
      const page = 1;
      const limit = 10;
      const total = 1;
      const response = paginated(data, page, limit, total);

      expect(response.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
    });
  });
});