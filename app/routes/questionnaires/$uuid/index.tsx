import { z } from "zod";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { FieldType } from "@prisma/client";
import assertUnreachable from "~/utils/assertUnreachable";
import { zNumberFieldInput } from "~/schemas/fields/numberField";
import { zTextFieldInput } from "~/schemas/fields/textField";
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
import { db } from "~/utils/db.server";

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

  // build parser
  const parser = z.object(
    Object.fromEntries(
      fields.map((field) => {
        const type = field.type;
        switch (type) {
          case FieldType.NUMBER:
            return [field.id, zNumberFieldInput(field.params)];
          case FieldType.TEXT:
            return [field.id, zTextFieldInput(field.params)];
          default:
            return assertUnreachable(type);
        }
      })
    )
  );

  // build data structure
  const rawData = Object.fromEntries(
    fields.map((field): [string, FormDataEntryValue | null] => {
      return [field.id, formData.get(field.id)];
    })
  );

  const result = parser.safeParse(rawData);

  // handle errors
  if (!result.success) {
    const errors = result.error.flatten();
    return json(errors, { status: 400 });
  }

  // store results in db
  db.$transaction(
    Object.entries(result.data).map(([fieldId, value]) => {
      return db.answer.upsert({
        where: {
          userId_fieldId: {
            userId: userId,
            fieldId: fieldId,
          },
        },
        update: {
          content: { value: value },
        },
        create: {
          userId: userId,
          fieldId: fieldId,
          content: { value: value },
        },
      });
    })
  );

  return redirect(`results`);
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
