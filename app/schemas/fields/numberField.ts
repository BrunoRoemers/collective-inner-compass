import { FieldType } from "@prisma/client";
import { z } from "zod";
import { field } from "./field";
import type { NumberAnswer } from "../answers/numberAnswer";
import { numberAnswer } from "../answers/numberAnswer";

/////////////////////
// Base Definition //
/////////////////////

export const numberField = field.extend({
  type: z.literal(FieldType.NUMBER),
});

export type NumberField = z.infer<typeof numberField>;

///////////////////////
// Params Definition //
///////////////////////

export const numberFieldParams = z.object({
  label: z.string(),
  min: z.number(),
  max: z.number(),
});

export type NumberFieldParams = z.infer<typeof numberFieldParams>;

///////////////////
// Merge Options //
///////////////////

export const includeParams = z.object({
  params: numberFieldParams,
});

export const includeAnswers = (params: NumberFieldParams) =>
  z.object({
    answers: z.array(numberAnswer(params)),
  });

export const includeZeroOrOneAnswers = (params: NumberFieldParams) =>
  z.object({
    answers: z.array(numberAnswer(params)).min(0).max(1),
  });

export const includeAnswer = (params: NumberFieldParams) =>
  z.object({
    answer: numberAnswer(params).optional(),
  });

///////////////////////
// Transform Options //
///////////////////////

export const keepFirstAnswer = <T extends { answers: NumberAnswer[] }>(
  field: T
) => {
  const { answers, ...rest } = field;
  return {
    ...rest,
    answer: answers.shift(),
  };
};

/////////////////////////
// Common Combinations //
/////////////////////////

export const parseNumberField = (field: unknown & { params: unknown }) => {
  return numberField.merge(includeParams).parse(field);
};

export const parseNumberFieldWithAnswer = (
  field: unknown & { params: unknown }
) => {
  const params = numberFieldParams.parse(field.params);
  return numberField
    .merge(includeParams)
    .merge(includeAnswer(params))
    .parse(field);
};

export const parseNumberFieldWithZeroOrOneAnswers = (
  field: unknown & { params: unknown }
) => {
  const params = numberFieldParams.parse(field.params);
  return numberField
    .merge(includeParams)
    .merge(includeZeroOrOneAnswers(params))
    .transform(keepFirstAnswer)
    .parse(field);
};
