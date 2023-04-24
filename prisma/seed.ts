import { FieldType, PrismaClient } from "@prisma/client";
import type { ExplainerParams } from "~/components/fields/ExplainerField";
import type { NumberParams } from "~/components/fields/NumberField";
import type { TextParams } from "~/components/fields/TextField";
const prisma = new PrismaClient();

const createNumberField = async (
  questionnaireId: string,
  params: NumberParams
) =>
  prisma.field.create({
    data: {
      questionnaireId,
      type: FieldType.NUMBER,
      params,
    },
  });

const createTextField = async (questionnaireId: string, params: TextParams) =>
  prisma.field.create({
    data: {
      questionnaireId,
      type: FieldType.TEXT,
      params,
    },
  });

const createExplainerField = async (
  questionnaireId: string,
  params: ExplainerParams
) =>
  prisma.field.create({
    data: {
      questionnaireId,
      type: FieldType.EXPLAINER,
      params,
    },
  });

async function main() {
  ////////////////
  // SEED USERS //
  ////////////////

  const user1 = await prisma.user.create({
    data: {
      name: "Bruno",
      email: "bruno@example.com",
    },
  });

  console.log("seeded users:", {
    user1,
  });

  /////////////////////////////////////////
  // SEED QUESTIONNAIRE FOR REGENS UNITE //
  /////////////////////////////////////////

  const questionnaire1 = await prisma.questionnaire.create({
    data: {
      name: "Regens Unite",
    },
  });

  const field11 = await createExplainerField(questionnaire1.id, {
    title: "(re)connecting",
    text: "As humans, we are a part of nature. We are connected with our environment, with our bodies and with each other. We are aware of the environmental impact of our actions and act consciously. At the event we are reminded of that.",
  });

  const field12 = await createTextField(questionnaire1.id, {
    label: `top 3 best practices (aligned with (re)connecting)`,
  });

  const field13 = await createNumberField(questionnaire1.id, {
    label: `Rate alignment on value "(re)connecting"`,
    min: 0,
    max: 100,
  });

  const field14 = await createExplainerField(questionnaire1.id, {
    title: "participation",
    text: "Participants and organisers are all considered equal members and contributors to the event and the Regens Unite commons. All voices are equally important in the conversation and we share responsibility to hold a regenerative space. We are all crew.",
  });

  const field15 = await createTextField(questionnaire1.id, {
    label: `top 3 best practices (aligned with participation)`,
  });

  const field16 = await createNumberField(questionnaire1.id, {
    label: `Rate alignment on value "participation"`,
    min: 0,
    max: 100,
  });

  const field17 = await createExplainerField(questionnaire1.id, {
    title: "regeneration",
    text: "We all leave the event feeling fresh and rejuvenated. We leave the venue and location in a better state after our being there. We use our financial resources with a focus on minimalism, usefullness, recycling and supporting the local economy. We prioritize paying people over expensive venues and decorations.",
  });

  const field18 = await createTextField(questionnaire1.id, {
    label: "top 3 best practices (aligned with regeneration)",
  });

  const field19 = await createNumberField(questionnaire1.id, {
    label: `Rate alignment on value "regeneration"`,
    min: 0,
    max: 100,
  });

  const field110 = await createExplainerField(questionnaire1.id, {
    title: "diversity",
    text: "We invite people from a wide variety of regen backgrounds. We make the event accessible for ev- eryone to come, including locals, parents and people who need to travel and take time off to participate. The attendee list and schedule are curated to ensure balance, diversity and space for underrepresented voices.",
  });

  const field111 = await createTextField(questionnaire1.id, {
    label: `top 3 best practices (aligned with diversity)`,
  });

  const field112 = await createNumberField(questionnaire1.id, {
    label: `Rate alignment on value "diversity"`,
    min: 0,
    max: 100,
  });

  const field113 = await createExplainerField(questionnaire1.id, {
    title: "cross-pollination",
    text: "The focus of this event is to bring humans from various regenerative backgrounds & perspectives together for intimate, thought-provoking exchanges as well as rejuvenating experiences. We create a safe and curious atmosphere through nurturing the relational fabric and community-wide rituals. From this connection, we can bravely explore new ways to regenerate and meet each other beyond labels and biases.",
  });

  const field114 = await createTextField(questionnaire1.id, {
    label: `top 3 best practices (aligned with cross-pollination)`,
  });

  const field115 = await createNumberField(questionnaire1.id, {
    label: `Rate alignment on value "cross-pollination"`,
    min: 0,
    max: 100,
  });

  console.log("seeded questionnaire for Regens Unite:", {
    questionnaire1,
    field11,
    field12,
    field13,
    field14,
    field15,
    field16,
    field17,
    field18,
    field19,
    field110,
    field111,
    field112,
    field113,
    field114,
    field115,
  });

  ///////////////////////////////////////
  // SEED QUESTIONNAIRE FOR IMPACTOPIA //
  ///////////////////////////////////////

  const questionnaire2 = await prisma.questionnaire.create({
    data: {
      name: "Impactopia",
    },
  });

  const field21 = await createNumberField(questionnaire2.id, {
    label: `Rate alignment on value "openness"`,
    min: 0,
    max: 100,
  });

  const field22 = await createNumberField(questionnaire2.id, {
    label: `Rate alignment on value "passion"`,
    min: 0,
    max: 100,
  });

  const field23 = await createNumberField(questionnaire2.id, {
    label: `Rate alignment on value "collaboration"`,
    min: 0,
    max: 100,
  });

  console.log("seeded questionnaire for Impactopia:", {
    questionnaire2,
    field21,
    field22,
    field23,
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
