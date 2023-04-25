import { z } from "zod";
import { db } from "~/utils/db.server";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import zErrorsParser from "~/utils/zErrorsParser";
import { FieldType } from "@prisma/client";
import assertUnreachable from "~/utils/assertUnreachable";
import { numberFieldInput } from "~/schemas/fields/numberField";
import { textFieldInput } from "~/schemas/fields/textField";
import NumberField from "~/components/fields/NumberField";
import TextField from "~/components/fields/TextField";
import ExplainerField from "~/components/fields/ExplainerField";
import {
  parseAnyFieldWithZeroOrOneAnswers,
  updatableField,
} from "~/schemas/fields/anyField";

const getUserId = async () => {
  const firstUser = await db.user.findFirstOrThrow();
  return firstUser.id;
};

const getFieldsAndAnswersOfQuestionnaire = async (
  userId: string,
  questionnaireId: string
) => {
  const rawFields = await db.field.findMany({
    where: { questionnaireId },
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
    parseAnyFieldWithZeroOrOneAnswers(field)
  );

  return parsedFields;
};

export const loader = async ({ params }: DataFunctionArgs) => {
  const userId = await getUserId();
  const questionnaireId = z.string().uuid().parse(params.uuid);

  return json({
    uuid: questionnaireId,
    fields: await getFieldsAndAnswersOfQuestionnaire(userId, questionnaireId),
  });
};

const getUpdatableFields = async (userId: string, questionnaireId: string) => {
  const rawFields = await db.field.findMany({
    where: { questionnaireId, type: { notIn: [FieldType.EXPLAINER] } },
    select: {
      id: true,
      type: true,
      params: true,
    },
  });

  const parsedFields = z.array(updatableField).parse(rawFields);

  return parsedFields;
};

export const action = async ({ params, request }: DataFunctionArgs) => {
  // inputs
  const userId = await getUserId();
  const questionnaireId = z.string().uuid().parse(params.uuid);
  const fields = await getUpdatableFields(userId, questionnaireId);
  const formData = await request.formData();

  // build parser
  const parser = z.object(
    Object.fromEntries(
      fields.map((field) => {
        const type = field.type;
        switch (type) {
          case FieldType.NUMBER:
            return [field.id, numberFieldInput(field.params)];
          case FieldType.TEXT:
            return [field.id, textFieldInput(field.params)];
          default:
            return assertUnreachable(type);
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
  const errors = zErrorsParser.parse(useActionData());

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
