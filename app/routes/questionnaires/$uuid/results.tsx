import { FieldType } from "@prisma/client";
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
  parseNumberFieldWithAnswer,
  parseNumberFieldWithZeroOrOneAnswers,
} from "~/schemas/fields/numberField";
import { db } from "~/utils/db.server";

ChartJS.register(RadialLinearScale, PointElement, LineElement);

const getUserId = async () => {
  const firstUser = await db.user.findFirstOrThrow();
  return firstUser.id;
};

const getNumericResultsFromQuestionnaire = async (
  userId: string,
  questionnaireId: string
) => {
  const rawFields = await db.field.findMany({
    where: { questionnaireId, type: FieldType.NUMBER },
    select: {
      id: true,
      type: true,
      params: true,
      answers: {
        // NOTE: expecting 0 or 1 answers
        where: { userId },
        select: { content: true },
      },
    },
  });

  const parsedFields = rawFields.map((field) =>
    parseNumberFieldWithZeroOrOneAnswers(field)
  );

  return parsedFields;
};

export const loader = async ({ params }: DataFunctionArgs) => {
  const userId = await getUserId();
  const questionnaireId = z.string().uuid().parse(params.uuid);

  return json({
    fields: await getNumericResultsFromQuestionnaire(userId, questionnaireId),
  });
};

export default () => {
  const loaderData = useLoaderData<typeof loader>();
  const fields = loaderData.fields.map((field) =>
    parseNumberFieldWithAnswer(field)
  );

  const data = {
    labels: fields.map((field) => field.params.chartLabel),
    datasets: [
      {
        label: "Results",
        data: fields.map((field) => field.answer?.content.value ?? 0),
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
