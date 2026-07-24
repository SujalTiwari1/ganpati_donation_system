process.env.NODE_ENV = "test";
process.env.PORT = "4000";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db?schema=public";
process.env.JWT_SECRET = "test-only-jwt-secret-32-chars-minimum-xxxx";
process.env.JWT_EXPIRES_IN = "1h";
process.env.BCRYPT_SALT_ROUNDS = "4"; // low cost factor: keeps the suite fast, still exercises real bcrypt
process.env.CORS_ORIGIN = "*";
process.env.LOG_LEVEL = "error"; // keep test output focused on assertions, not request logs
