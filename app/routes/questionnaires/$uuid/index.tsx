import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { FieldType } from "@prisma/client";
import assertUnreachable from "~/utils/assertUnreachable";
import NumberField from "~/components/fields/NumberField";
import TextField from "~/components/fields/TextField";
import ExplainerField from "~/components/fields/ExplainerField";
import { zErrors } from "~/schemas/errors";
import { requireAuthenticatedUser } from "~/models/session.server";
import { zQuestionnaireId } from "~/schemas/questionnaire";
import {
  getAllFieldsAndAnswers,
  getUpdatableFields,
} from "~/models/questionnaire.server";
import { zUpdatableFieldInputs } from "~/schemas/fields/updatableField";
import { upsertAnswers } from "~/models/answer.server";

export const loader = async ({ params, request }: DataFunctionArgs) => {
  const userId = await requireAuthenticatedUser(request);
  const questionnaireId = zQuestionnaireId.parse(params.uuid);

  return json({
    uuid: questionnaireId,
    fields: await getAllFieldsAndAnswers(userId, questionnaireId),
  });
};

export const action = async ({ params, request }: DataFunctionArgs) => {
  // inputs
  const userId = await requireAuthenticatedUser(request);
  const questionnaireId = zQuestionnaireId.parse(params.uuid);
  const fields = await getUpdatableFields(questionnaireId);
  const formData = await request.formData();

  // build data structure
  const rawData = Object.fromEntries(
    fields.map((field): [string, FormDataEntryValue | null] => {
      return [field.id, formData.get(field.id)];
    })
  );

  // parse user inputs
  const result = zUpdatableFieldInputs(fields).safeParse(rawData);

  // handle errors
  if (!result.success) {
    const errors = result.error.flatten();
    return json(errors, { status: 400 });
  }

  // store results in db
  await upsertAnswers(userId, result.data);

  return redirect(`my-results`);
};

export default () => {
  const { uuid, fields } = useLoaderData<typeof loader>();
  const errors = zErrors.optional().parse(useActionData());

  if (fields.length < 1) {
    throw new Error(`questionnaire '${uuid}' does not have any fields`);
  }

  const formRows = fields.map((field) => {
    const type = field.type;
    const rowErrors = errors?.fieldErrors?.[field.id];

    switch (type) {
      case FieldType.NUMBER:
        return (
          <NumberField
            key={field.id}
            id={field.id}
            params={field.params}
            defaultValue={field.answer?.content.value}
            errors={rowErrors}
          ></NumberField>
        );
      case FieldType.TEXT:
        return (
          <TextField
            key={field.id}
            id={field.id}
            params={field.params}
            defaultValue={field.answer?.content.value}
            errors={rowErrors}
          ></TextField>
        );
      case FieldType.EXPLAINER:
        return (
          <ExplainerField
            key={field.id}
            id={field.id}
            params={field.params}
          ></ExplainerField>
        );
      default:
        return assertUnreachable(type);
    }
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
