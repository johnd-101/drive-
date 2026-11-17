import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL! 
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const raw = fs.readFileSync("./questions.json", "utf-8");
  const questions = JSON.parse(raw);
  console.log(`Seeding ${questions.length} questions...`);
  await prisma.question.deleteMany();
  for (const q of questions) {
    await prisma.question.create({ data: q });
  }
  console.log(`Seeded ${questions.length}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
