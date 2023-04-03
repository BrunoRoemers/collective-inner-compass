import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { z } from "zod";
import {
  getNumberDataParser,
  numberParamsParser,
} from "~/components/fields/NumberField";
import { db } from "~/utils/db.server";

ChartJS.register(RadialLinearScale, PointElement, LineElement);

const getUserId = async () => {
  const firstUser = await db.user.findFirstOrThrow();
  return firstUser.id;
};

const getFieldsAndAnswersOfQuestionnaire = (
  userId: string,
  questionnaireId: string
) =>
  db.field.findMany({
    // TODO actually we only have to deal with the "number" fields here
    where: { questionnaireId },
    select: {
      id: true,
      type: true,
      params: true,
      answers: {
        // NOTE: expecting 0 or 1 answers
        where: { userId },
        select: { data: true },
      },
    },
  });

export const loader = async ({ params }: DataFunctionArgs) => {
  const userId = await getUserId();
  const questionnaireId = z.string().uuid().parse(params.uuid);

  return json({
    fields: await getFieldsAndAnswersOfQuestionnaire(userId, questionnaireId),
  });
};

export default () => {
  const { fields } = useLoaderData<typeof loader>();

  const data = {
    labels: fields.map((field) => {
      switch (field.type) {
        case "NUMBER":
          const numberParams = numberParamsParser.parse(field.params);
          return numberParams.label;
        default:
          throw new Error(
            `type '${field.type}' of field '${field.id}' is not supported`
          );
      }
    }),
    datasets: [
      {
        label: "Results",
        data: fields.map((field) => {
          switch (field.type) {
            case "NUMBER":
              const numberParams = numberParamsParser.parse(field.params);
              const numberData = getNumberDataParser(numberParams).parse(
                field.answers?.[0]?.data
              );
              return numberData?.value ?? 0;
            default:
              throw new Error(
                `type '${field.type}' of field '${field.id}' is not supported`
              );
          }
        }),
        fill: true,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgb(255, 99, 132)",
        pointBackgroundColor: "rgb(255, 99, 132)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 99, 132)",
      },
    ],
  };

  const options = {
    scales: {
      r: {
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div>
      <Radar data={data} options={options} />
    </div>
  );
};
