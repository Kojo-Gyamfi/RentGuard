const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkUserProfile(id) {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseUserId: id },
    });
    console.log("User found:", !!user);
    if (user) console.log(JSON.stringify(user, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkUserProfile("e6a12d8c-249e-4ddd-8a9d-76cf8522235c");
