import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const questionnaire1 = await prisma.questionnaire.create({
    data: {
      name: "hello world",
    },
  });

  const questionnaire2 = await prisma.questionnaire.create({
    data: {
      name: "beautiful world",
    },
  });

  console.log({ questionnaire1, questionnaire2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
