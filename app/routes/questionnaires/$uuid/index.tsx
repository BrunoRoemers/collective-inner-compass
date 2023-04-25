import { z } from "zod";
import { db } from "~/utils/db.server";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import zErrorsParser from "~/utils/zErrorsParser";
import { FieldType } from "@prisma/client";
import assertUnreachable from "~/utils/assertUnreachable";
import {
  parseNumberField,
  parseNumberFieldWithZeroOrOneAnswers,
} from "~/schemas/fields/numberField";
import {
  parseTextField,
  parseTextFieldWithZeroOrOneAnswers,
} from "~/schemas/fields/textField";
import { parseExplainerField } from "~/schemas/fields/explainerField";
import numberField from "~/components/fields/NumberField";
import textField from "~/components/fields/TextField";
import explainerField from "~/components/fields/ExplainerField";

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

  const parsedFields = rawFields.map((field) => {
    switch (field.type) {
      case FieldType.NUMBER:
        return parseNumberFieldWithZeroOrOneAnswers(field);
      case FieldType.TEXT:
        return parseTextFieldWithZeroOrOneAnswers(field);
      case FieldType.EXPLAINER:
        return parseExplainerField(field);
      default:
        return assertUnreachable(field.type);
    }
  });

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

  const parsedFields = rawFields.map((field) => {
    switch (field.type) {
      case FieldType.NUMBER:
        return parseNumberField(field);
      case FieldType.TEXT:
        return parseTextField(field);
      case FieldType.EXPLAINER:
        throw new Error("explainer fields are not updatable");
      default:
        return assertUnreachable(field.type);
    }
  });

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
            return [field.id, numberField.getInputParser(field.params)]; // TODO move to schema?
          case FieldType.TEXT:
            return [field.id, textField.getInputParser(field.params)]; // TODO move to schema?
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
          <numberField.Element
            key={field.id}
            id={field.id}
            params={field.params}
            defaultValue={field.answer?.content.value}
            errors={rowErrors}
          ></numberField.Element>
        );
      case FieldType.TEXT:
        return (
          <textField.Element
            key={field.id}
            id={field.id}
            params={field.params}
            defaultValue={field.answer?.content.value}
            errors={rowErrors}
          ></textField.Element>
        );
      case FieldType.EXPLAINER:
        return (
          <explainerField.Element
            key={field.id}
            id={field.id}
            params={field.params}
          ></explainerField.Element>
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
