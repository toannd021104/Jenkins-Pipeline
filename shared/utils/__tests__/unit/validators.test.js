const { commonSchemas, isValidUUID, isValidEmail, sanitizeString } = require('../../src/validators');

describe('Shared Utils - Validators', () => {
  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
      ];

      validUUIDs.forEach(uuid => {
        expect(isValidUUID(uuid)).toBe(true);
      });
    });

    it('should reject invalid UUIDs', () => {
      const invalidUUIDs = [
        '123e4567-e89b-12d3-a456-42661417400', // Too short
        '123e4567-e89b-12d3-a456-4266141740000', // Too long
        'not-a-uuid',
        '123e4567-e89b-12d3-a456-42661417400g', // Invalid character
        ''
      ];

      invalidUUIDs.forEach(uuid => {
        expect(isValidUUID(uuid)).toBe(false);
      });
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid emails', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello world  ')).toBe('hello world');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeString('hello<script>alert("xss")</script>world')).toBe('helloscriptalert("xss")/scriptworld');
    });

    it('should handle non-string inputs', () => {
      expect(sanitizeString(123)).toBe(123);
      expect(sanitizeString(null)).toBe(null);
      expect(sanitizeString(undefined)).toBe(undefined);
    });
  });

  describe('commonSchemas', () => {
    it('should validate email schema', () => {
      const { error: validError } = commonSchemas.email.validate('test@example.com');
      expect(validError).toBeUndefined();

      const { error: invalidError } = commonSchemas.email.validate('invalid-email');
      expect(invalidError).toBeDefined();
    });

    it('should validate name schema', () => {
      const { error: validError } = commonSchemas.name.validate('John Doe');
      expect(validError).toBeUndefined();

      const { error: shortError } = commonSchemas.name.validate('A');
      expect(shortError).toBeDefined();

      const { error: longError } = commonSchemas.name.validate('A'.repeat(101));
      expect(longError).toBeDefined();
    });

    it('should validate pagination schema', () => {
      const { error, value } = commonSchemas.pagination.validate({});
      expect(error).toBeUndefined();
      expect(value.page).toBe(1);
      expect(value.limit).toBe(10);

      const { error: customError, value: customValue } = commonSchemas.pagination.validate({
        page: 2,
        limit: 20
      });
      expect(customError).toBeUndefined();
      expect(customValue.page).toBe(2);
      expect(customValue.limit).toBe(20);
    });
  });
});