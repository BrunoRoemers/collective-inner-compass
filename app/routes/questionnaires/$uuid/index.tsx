import { z } from "zod";
import { db } from "~/utils/db.server";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import Field from "~/components/Field";
import {
  getNumberInputParser,
  numberParamsParser,
} from "~/components/fields/NumberField";
import zErrorsParser from "~/utils/zErrorsParser";

const getUserId = async () => {
  const firstUser = await db.user.findFirstOrThrow();
  return firstUser.id;
};

const getFieldsAndAnswersOfQuestionnaire = (
  userId: string,
  questionnaireId: string
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
  const userId = await getUserId();
  const questionnaireId = z.string().uuid().parse(params.uuid);

  return json({
    uuid: questionnaireId,
    fields: await getFieldsAndAnswersOfQuestionnaire(userId, questionnaireId),
  });
};

export const action = async ({ params, request }: DataFunctionArgs) => {
  // inputs
  const userId = await getUserId();
  const questionnaireId = z.string().uuid().parse(params.uuid);
  const fields = await getFieldsAndAnswersOfQuestionnaire(
    userId,
    questionnaireId
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
          data: { value: value },
        },
        create: {
          userId: userId,
          fieldId: fieldId,
          data: { value: value },
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
