import { FieldType } from "@prisma/client";
import { z } from "zod";
import type { AnyFieldWithAnswer } from "~/schemas/fields/anyField";
import { parseAnyFieldWithZeroOrOneAnswers } from "~/schemas/fields/anyField";
import type {
  NumberFieldWithAnswer,
  NumberFieldWithAnswers,
} from "~/schemas/fields/numberField";
import { parseNumberFieldWithZeroOrManyAnswers } from "~/schemas/fields/numberField";
import { parseNumberFieldWithZeroOrOneAnswers } from "~/schemas/fields/numberField";
import type { UpdatableField } from "~/schemas/fields/updatableField";
import { zUpdatableField } from "~/schemas/fields/updatableField";
import type { Questionnaire, QuestionnaireId } from "~/schemas/questionnaire";
import { zQuestionnaire } from "~/schemas/questionnaire";
import type { UserId } from "~/schemas/user";
import { db } from "~/utils/db.server";

export const getAllQuestionnaires = async (): Promise<Questionnaire[]> => {
  const rawQs = await db.questionnaire.findMany();

  return z.array(zQuestionnaire).parse(rawQs);
};

export const getUpdatableFields = async (
  questionnaireId: QuestionnaireId
): Promise<UpdatableField[]> => {
  const rawFields = await db.field.findMany({
    where: { questionnaireId, type: { notIn: [FieldType.EXPLAINER] } },
    select: {
      id: true,
      type: true,
      params: true,
    },
  });

  const parsedFields = z.array(zUpdatableField).parse(rawFields);

  return parsedFields;
};

export const getAllFieldsAndAnswers = async (
  userId: UserId,
  questionnaireId: QuestionnaireId
): Promise<AnyFieldWithAnswer[]> => {
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
    orderBy: {
      order: "asc",
    },
  });

  const parsedFields = rawFields.map((field) =>
    parseAnyFieldWithZeroOrOneAnswers(field)
  );

  return parsedFields;
};

export const getNumberFieldsAndAnswersByUserAndQuestionnaire = async (
  userId: UserId,
  questionnaireId: QuestionnaireId
): Promise<NumberFieldWithAnswer[]> => {
  const rawFields = await db.field.findMany({
    where: { questionnaireId, type: FieldType.NUMBER },
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
    parseNumberFieldWithZeroOrOneAnswers(field)
  );

  return parsedFields;
};

export const getNumberFieldsAndAnswersByQuestionnaire = async (
  questionnaireId: QuestionnaireId
): Promise<NumberFieldWithAnswers[]> => {
  const rawFields = await db.field.findMany({
    where: { questionnaireId, type: FieldType.NUMBER },
    select: {
      id: true,
      type: true,
      params: true,
      answers: {
        // NOTE: expecting 0 or many answers (one for each user)
        select: {
          content: true,
          userId: true,
        },
      },
    },
  });

  const parsedFields = rawFields.map((field) =>
    parseNumberFieldWithZeroOrManyAnswers(field)
  );

  return parsedFields;
};
