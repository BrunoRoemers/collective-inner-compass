import { z } from "zod";
import { db } from "~/utils/db.server";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import objectToBase64 from "~/utils/objectToBase64.server";
import Field from "~/components/Field";
import {
  getNumberInputParser,
  numberParamsParser,
} from "~/components/fields/NumberField";

const getFieldsOfQuestionnaire = (questionnaireId: string) =>
  db.field.findMany({
    where: { questionnaireId },
    select: {
      id: true,
      type: true,
      params: true,
    },
  });

export const loader = async ({ params }: DataFunctionArgs) => {
  const uuid = z.string().uuid().parse(params.uuid);

  return json({
    uuid,
    fields: await getFieldsOfQuestionnaire(uuid),
  });
};

export const action = async ({ params, request }: DataFunctionArgs) => {
  const uuid = z.string().uuid().parse(params.uuid);
  const fields = await getFieldsOfQuestionnaire(uuid);
  const formData = await request.formData();

  // TODO this can potentially be simplified if I construct a composite zod object
  // TODO e.g. https://github.com/colinhacks/zod/blob/master/ERROR_HANDLING.md#error-handling-for-forms
  const parserResults = fields.map(
    (
      field
    ): [string, z.SafeParseSuccess<unknown> | z.SafeParseError<unknown>] => {
      const submittedValue = formData.get(field.id);

      switch (field.type) {
        case "NUMBER":
          const numberParams = numberParamsParser.parse(field.params);
          return [
            field.id,
            getNumberInputParser(numberParams).safeParse(submittedValue),
          ];
        default:
          throw new Error(
            `type '${field.type}' of field '${field.id}' is not supported`
          );
      }
    }
  );

  const errors = parserResults.filter(
    ([id, result]) => result.success === false
  ) as [string, z.SafeParseError<unknown>][];

  if (errors.length > 0) {
    const issues = Object.fromEntries(
      errors.map(([id, result]) => [id, result.error.issues])
    );

    return json(issues, { status: 400 });
  }

  const data = {
    labels: ["Openness", "Passion", "Collaboration"], // TODO
    datasets: [
      {
        label: "My First Dataset",
        data: [], // TODO
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

const errorsParser = z.optional(
  z.record(
    z.array(
      z.object({
        code: z.string(),
        message: z.string(),
      })
    )
  )
);

export default () => {
  const { uuid, fields } = useLoaderData<typeof loader>();
  const errors = errorsParser.parse(useActionData());

  if (fields.length < 1) {
    throw new Error(`questionnaire '${uuid}' does not have any fields`);
  }

  const formRows = fields.map((field) => {
    return <Field key={field.id} field={field} errors={errors?.[field.id]} />;
  });

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
