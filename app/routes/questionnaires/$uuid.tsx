import { z } from "zod";
import { db } from "~/utils/db.server";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import objectToBase64 from "~/utils/objectToBase64.server";
import Field from "~/components/Field";

export const loader = async ({ params }: DataFunctionArgs) => {
  const uuid = z.string().uuid().parse(params.uuid);

  const fields = await db.field.findMany({
    where: { questionnaireId: uuid },
    select: {
      id: true,
      type: true,
      params: true,
    },
  });

  return json({
    uuid,
    fields,
  });
};

export const action = async ({ params, request }: DataFunctionArgs) => {
  const formData = await request.formData();

  // TODO use ZOD: https://www.npmjs.com/package/zod

  // TODO repeating too much code...
  const openness = parseInt(String(formData.get("openness")), 10);
  const passion = parseInt(String(formData.get("passion")), 10);
  const collaboration = parseInt(String(formData.get("collaboration")), 10);

  console.log(openness, passion, collaboration);

  const errors = {
    openness:
      isNaN(openness) || openness < 0 || openness > 100
        ? "should be a number between 0 and 100"
        : null,
    passion:
      isNaN(passion) || passion < 0 || passion > 100
        ? "should be a number between 0 and 100"
        : null,
    collaboration:
      isNaN(collaboration) || collaboration < 0 || collaboration > 100
        ? "should be a number between 0 and 100"
        : null,
  };

  const hasErrors = Object.values(errors).some((v) => v);
  if (hasErrors) {
    return json(errors);
  }

  const data = {
    labels: ["Openness", "Passion", "Collaboration"],
    datasets: [
      {
        label: "My First Dataset",
        data: [openness, passion, collaboration],
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

  return redirect(`../chart?data=${objectToBase64(data)}`);
};

export default () => {
  const { uuid, fields } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();
  // TODO render errors

  if (fields.length < 1) {
    throw new Error(`questionnaire '${uuid}' does not have any fields`);
  }

  const formRows = fields.map((field) => (
    <Field key={field.id} field={field} />
  ));

  return (
    <div className="p-2">
      <Form method="post">
        {formRows}
        <button type="submit" name="submit" className="hover:underline">
          Submit
        </button>
      </Form>
    </div>
  );
};
