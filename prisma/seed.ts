import { FieldType, PrismaClient } from "@prisma/client";
import type { ExplainerFieldParams } from "~/schemas/fields/explainerField";
import type { NumberFieldParams } from "~/schemas/fields/numberField";
import type { TextFieldParams } from "~/schemas/fields/textField";
const prisma = new PrismaClient();

type NumberFieldBlueprint = [typeof FieldType.NUMBER, NumberFieldParams];
type TextFieldBlueprint = [typeof FieldType.TEXT, TextFieldParams];
type ExplainerFieldBlueprint = [
  typeof FieldType.EXPLAINER,
  ExplainerFieldParams
];
type AnyFieldBlueprint =
  | NumberFieldBlueprint
  | TextFieldBlueprint
  | ExplainerFieldBlueprint;

const createFields = async (
  questionnaireId: string,
  blueprints: AnyFieldBlueprint[]
) => {
  return Promise.all(
    blueprints.map(([type, params], index) => {
      return prisma.field.create({
        data: {
          questionnaireId,
          type: type,
          params,
          order: index,
        },
      });
    })
  );
};

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

  const fields1 = await createFields(questionnaire1.id, [
    [
      FieldType.EXPLAINER,
      {
        title: "(re)connecting",
        text: "As humans, we are a part of nature. We are connected with our environment, with our bodies and with each other. We are aware of the environmental impact of our actions and act consciously. At the event we are reminded of that.",
      },
    ],
    [
      FieldType.TEXT,
      {
        label: `top 3 best practices (aligned with (re)connecting)`,
      },
    ],
    [
      FieldType.NUMBER,
      {
        label: `Rate alignment on value "(re)connecting"`,
        min: 0,
        max: 100,
      },
    ],
    [
      FieldType.EXPLAINER,
      {
        title: "participation",
        text: "Participants and organisers are all considered equal members and contributors to the event and the Regens Unite commons. All voices are equally important in the conversation and we share responsibility to hold a regenerative space. We are all crew.",
      },
    ],
    [
      FieldType.TEXT,
      {
        label: `top 3 best practices (aligned with participation)`,
      },
    ],
    [
      FieldType.NUMBER,
      {
        label: `Rate alignment on value "participation"`,
        min: 0,
        max: 100,
      },
    ],
    [
      FieldType.EXPLAINER,
      {
        title: "regeneration",
        text: "We all leave the event feeling fresh and rejuvenated. We leave the venue and location in a better state after our being there. We use our financial resources with a focus on minimalism, usefullness, recycling and supporting the local economy. We prioritize paying people over expensive venues and decorations.",
      },
    ],
    [
      FieldType.TEXT,
      {
        label: "top 3 best practices (aligned with regeneration)",
      },
    ],
    [
      FieldType.NUMBER,
      {
        label: `Rate alignment on value "regeneration"`,
        min: 0,
        max: 100,
      },
    ],
    [
      FieldType.EXPLAINER,
      {
        title: "diversity",
        text: "We invite people from a wide variety of regen backgrounds. We make the event accessible for ev- eryone to come, including locals, parents and people who need to travel and take time off to participate. The attendee list and schedule are curated to ensure balance, diversity and space for underrepresented voices.",
      },
    ],
    [
      FieldType.TEXT,
      {
        label: `top 3 best practices (aligned with diversity)`,
      },
    ],
    [
      FieldType.NUMBER,
      {
        label: `Rate alignment on value "diversity"`,
        min: 0,
        max: 100,
      },
    ],
    [
      FieldType.EXPLAINER,
      {
        title: "cross-pollination",
        text: "The focus of this event is to bring humans from various regenerative backgrounds & perspectives together for intimate, thought-provoking exchanges as well as rejuvenating experiences. We create a safe and curious atmosphere through nurturing the relational fabric and community-wide rituals. From this connection, we can bravely explore new ways to regenerate and meet each other beyond labels and biases.",
      },
    ],
    [
      FieldType.TEXT,
      {
        label: `top 3 best practices (aligned with cross-pollination)`,
      },
    ],
    [
      FieldType.NUMBER,
      {
        label: `Rate alignment on value "cross-pollination"`,
        min: 0,
        max: 100,
      },
    ],
  ]);

  console.log("seeded questionnaire for Regens Unite:");
  console.dir(
    {
      questionnaire1,
      fields1,
    },
    { depth: null }
  );

  ///////////////////////////////////////
  // SEED QUESTIONNAIRE FOR IMPACTOPIA //
  ///////////////////////////////////////

  const questionnaire2 = await prisma.questionnaire.create({
    data: {
      name: "Impactopia",
    },
  });

  const fields2 = await createFields(questionnaire2.id, [
    [
      FieldType.NUMBER,
      {
        label: `Rate alignment on value "openness"`,
        min: 0,
        max: 100,
      },
    ],
    [
      FieldType.NUMBER,
      {
        label: `Rate alignment on value "passion"`,
        min: 0,
        max: 100,
      },
    ],
    [
      FieldType.NUMBER,
      {
        label: `Rate alignment on value "collaboration"`,
        min: 0,
        max: 100,
      },
    ],
  ]);

  console.log("seeded questionnaire for Impactopia:");
  console.dir(
    {
      questionnaire2,
      fields2,
    },
    { depth: null }
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
