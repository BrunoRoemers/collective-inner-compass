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
import { getNumberFieldsAndAnswersByQuestionnaire } from "~/models/questionnaire.server";
import { requireAuthenticatedUser } from "~/models/session.server";
import { getUserById } from "~/models/user.server";
import { parseNumberFieldWithZeroOrManyAnswers } from "~/schemas/fields/numberField";
import { zQuestionnaireId } from "~/schemas/questionnaire";
import { average } from "~/utils/math";

ChartJS.register(RadialLinearScale, PointElement, LineElement);

export const loader = async ({ params, request }: DataFunctionArgs) => {
  const userId = await requireAuthenticatedUser(request);
  const questionnaireId = zQuestionnaireId.parse(params.uuid);

  return json({
    user: await getUserById(userId),
    fields: await getNumberFieldsAndAnswersByQuestionnaire(questionnaireId),
  });
};

export default () => {
  const rawLoaderData = useLoaderData<typeof loader>();
  // const user = zUser.parse(rawLoaderData.user);
  const fields = rawLoaderData.fields.map((field) =>
    parseNumberFieldWithZeroOrManyAnswers(field)
  );

  const data = {
    labels: fields.map((field) => field.params.chartLabel),
    datasets: [
      {
        label: "Results",
        data: fields.map((field) => {
          const avg = average(field.answers.map((ans) => ans.content.value));
          console.log(avg);
          return avg;
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
        ticks: {
          stepSize: 20,
        },
      },
    },
  };

  return (
    <div>
      <Radar data={data} options={options} />
    </div>
  );
};
