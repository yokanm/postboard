import { PrismaClient } from './generated/prisma/client.ts';

const p = new PrismaClient();
try {
  const rows = await p.$queryRawUnsafe(
    `SELECT id, email, "emailVerifyToken", "emailVerifyExpiresAt", "emailVerifiedAt", "createdAt", "updatedAt" FROM "User" ORDER BY "createdAt" DESC LIMIT 10`
  );
  console.log(JSON.stringify(rows, null, 2));
} catch (e) {
  console.error(e);
} finally {
  await p.$disconnect();
}
