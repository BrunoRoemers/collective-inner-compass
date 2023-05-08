import { FieldType } from "@prisma/client";
import { z } from "zod";
import { zField } from "./field";
import type { NumberAnswer } from "../answers/numberAnswer";
import { zNumberAnswer } from "../answers/numberAnswer";

/////////////////////
// Base Definition //
/////////////////////

export const zNumberField = zField.extend({
  type: z.literal(FieldType.NUMBER),
});

export type NumberField = z.infer<typeof zNumberField>;

///////////////////////
// Params Definition //
///////////////////////

export const zNumberFieldParams = z.object({
  label: z.string(),
  chartLabel: z.string(),
  min: z.number(),
  max: z.number(),
});

export type NumberFieldParams = z.infer<typeof zNumberFieldParams>;

//////////////////////
// Input Validation //
//////////////////////

export const zNumberFieldInput = (params: NumberFieldParams) =>
  z
    .union([z.string().nonempty({ message: "Required" }), z.number()])
    .pipe(z.coerce.number().min(params.min).max(params.max));

export type NumberFieldInput = z.infer<ReturnType<typeof zNumberFieldInput>>;

///////////////////
// Merge Options //
///////////////////

export const zIncludeParams = z.object({
  params: zNumberFieldParams,
});

export const zIncludeAnswers = (params: NumberFieldParams) =>
  z.object({
    answers: z.array(zNumberAnswer(params)),
  });

export const zIncludeZeroOrOneAnswers = (params: NumberFieldParams) =>
  z.object({
    answers: z.array(zNumberAnswer(params)).min(0).max(1),
  });

export const zIncludeAnswer = (params: NumberFieldParams) =>
  z.object({
    answer: zNumberAnswer(params).optional(),
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
  return zNumberField.merge(zIncludeParams).parse(field);
};
export type NumberFieldWithParams = ReturnType<typeof parseNumberField>;

export const parseNumberFieldWithAnswer = (
  field: unknown & { params: unknown }
) => {
  const params = zNumberFieldParams.parse(field.params);
  return zNumberField
    .merge(zIncludeParams)
    .merge(zIncludeAnswer(params))
    .parse(field);
};
export type NumberFieldWithAnswer = ReturnType<
  typeof parseNumberFieldWithAnswer
>;

export const parseNumberFieldWithZeroOrOneAnswers = (
  field: unknown & { params: unknown }
): NumberFieldWithAnswer => {
  const params = zNumberFieldParams.parse(field.params);
  return zNumberField
    .merge(zIncludeParams)
    .merge(zIncludeZeroOrOneAnswers(params))
    .transform(keepFirstAnswer)
    .parse(field);
};
