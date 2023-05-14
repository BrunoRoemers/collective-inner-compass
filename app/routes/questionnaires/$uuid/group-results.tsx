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
import { getNumberFieldsAndAnswers } from "~/models/questionnaire.server";
import { requireAuthenticatedUser } from "~/models/session.server";
import { parseNumberFieldWithAnswer } from "~/schemas/fields/numberField";
import { zQuestionnaireId } from "~/schemas/questionnaire";

ChartJS.register(RadialLinearScale, PointElement, LineElement);

export const loader = async ({ params, request }: DataFunctionArgs) => {
  const userId = await requireAuthenticatedUser(request);
  const questionnaireId = zQuestionnaireId.parse(params.uuid);

  return json({
    // TODO multiple fields, by user of questionnaire
    fields: await getNumberFieldsAndAnswers(userId, questionnaireId),
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
