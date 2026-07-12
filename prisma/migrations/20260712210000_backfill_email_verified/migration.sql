-- Existing password accounts predate email OTP; mark them verified so they are not locked out.
UPDATE "User"
SET "emailVerified" = CURRENT_TIMESTAMP
WHERE "passwordHash" IS NOT NULL
  AND "emailVerified" IS NULL;
