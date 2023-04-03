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
import zErrorsParser from "~/utils/zErrorsParser";

const getUserUuid = async () => {
  const firstUser = await db.user.findFirstOrThrow();
  return firstUser.id;
};

const getFieldsAndAnswersOfQuestionnaire = (
  questionnaireId: string,
  userId: string
) =>
  db.field.findMany({
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
  const uuid = z.string().uuid().parse(params.uuid);

  return json({
    uuid,
    fields: await getFieldsAndAnswersOfQuestionnaire(uuid, await getUserUuid()),
  });
};

export const action = async ({ params, request }: DataFunctionArgs) => {
  // inputs
  const uuid = z.string().uuid().parse(params.uuid);
  const fields = await getFieldsAndAnswersOfQuestionnaire(
    uuid,
    await getUserUuid()
  );
  const formData = await request.formData();

  // build parser
  const parser = z.object(
    Object.fromEntries(
      fields.map((field) => {
        switch (field.type) {
          case "NUMBER":
            const numberParams = numberParamsParser.parse(field.params);
            return [field.id, getNumberInputParser(numberParams)];
          default:
            throw new Error(
              `type '${field.type}' of field '${field.id}' is not supported`
            );
        }
      })
    )
  );

  // build data structure
  const data = Object.fromEntries(
    fields.map((field): [string, FormDataEntryValue | null] => {
      return [field.id, formData.get(field.id)];
    })
  );

  const result = parser.safeParse(data);

  // handle errors
  if (!result.success) {
    const errors = result.error.flatten();
    return json(errors, { status: 400 });
  }

  // TODO store in database!
  console.log(result.data);

  const oldData = {
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

  return redirect(`../chart?data=${objectToBase64(oldData)}`);
};

export default () => {
  const { uuid, fields } = useLoaderData<typeof loader>();
  const errors = zErrorsParser.parse(useActionData());

  if (fields.length < 1) {
    throw new Error(`questionnaire '${uuid}' does not have any fields`);
  }

  const formRows = fields.map((field) => {
    return (
      <Field
        key={field.id}
        field={field}
        errors={errors?.fieldErrors?.[field.id]}
      />
    );
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
