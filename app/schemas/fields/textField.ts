import { z } from "zod";
import { field } from "./field";
import { FieldType } from "@prisma/client";
import type { TextAnswer } from "../answers/textAnswer";
import { textAnswer } from "../answers/textAnswer";

/////////////////////
// Base Definition //
/////////////////////

export const textField = field.extend({
  type: z.literal(FieldType.TEXT),
});

export type TextField = z.infer<typeof textField>;

///////////////////////
// Params Definition //
///////////////////////

export const textFieldParams = z.object({
  label: z.string(),
});

export type TextFieldParams = z.infer<typeof textFieldParams>;

///////////////////
// Merge Options //
///////////////////

export const includeParams = z.object({
  params: textFieldParams,
});

export const includeAnswers = (params: TextFieldParams) =>
  z.object({
    answers: z.array(textAnswer(params)),
  });

export const includeZeroOrOneAnswers = (params: TextFieldParams) =>
  z.object({
    answers: z.array(textAnswer(params)).min(0).max(1),
  });

export const includeAnswer = (params: TextFieldParams) =>
  z.object({
    answer: textAnswer(params).optional(),
  });

///////////////////////
// Transform Options //
///////////////////////

export const keepFirstAnswer = <T extends { answers: TextAnswer[] }>(
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

export const parseTextField = (field: unknown & { params: unknown }) => {
  return textField.merge(includeParams).parse(field);
};

export const parseTextFieldWithAnswer = (
  field: unknown & { params: unknown }
) => {
  const params = textFieldParams.parse(field.params);
  return textField
    .merge(includeParams)
    .merge(includeAnswer(params))
    .parse(field);
};

export const parseTextFieldWithZeroOrOneAnswers = (
  field: unknown & { params: unknown }
) => {
  const params = textFieldParams.parse(field.params);
  return textField
    .merge(includeParams)
    .merge(includeZeroOrOneAnswers(params))
    .transform(keepFirstAnswer)
    .parse(field);
};
