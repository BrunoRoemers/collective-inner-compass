import { PrismaClient } from "@prisma/client";
import type { NumberParams } from "~/components/fields/NumberField";
const prisma = new PrismaClient();

const createNumberField = async (
  questionnaireId: string,
  params: NumberParams
) =>
  prisma.field.create({
    data: {
      questionnaireId,
      type: "NUMBER",
      params,
    },
  });

async function main() {
  const user1 = await prisma.user.create({
    data: {
      name: "Bruno",
      email: "bruno@example.com",
    },
  });

  console.log("seeded users:", {
    user1,
  });

  const questionnaire1 = await prisma.questionnaire.create({
    data: {
      name: "Regens Unite",
    },
  });

  const questionnaire2 = await prisma.questionnaire.create({
    data: {
      name: "Impactopia",
    },
  });

  console.log("seeded questionnaires:", { questionnaire1, questionnaire2 });

  const field11 = await createNumberField(questionnaire1.id, {
    label: `Rate alignment on value "openness"`,
    min: 0,
    max: 100,
  });

  const field12 = await createNumberField(questionnaire1.id, {
    label: `Rate alignment on value "passion"`,
    min: 0,
    max: 100,
  });

  const field13 = await createNumberField(questionnaire1.id, {
    label: `Rate alignment on value "collaboration"`,
    min: 0,
    max: 100,
  });

  const field21 = await createNumberField(questionnaire2.id, {
    label: `Rate alignment on value "effectiveness"`,
    min: 0,
    max: 100,
  });

  console.log("seeded fields:", {
    field11,
    field12,
    field13,
    field21,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
