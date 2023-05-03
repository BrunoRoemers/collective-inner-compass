import { z } from "zod";
import { zField } from "./field";
import { FieldType } from "@prisma/client";
import type { TextAnswer } from "../answers/textAnswer";
import { zTextAnswer } from "../answers/textAnswer";

/////////////////////
// Base Definition //
/////////////////////

export const zTextField = zField.extend({
  type: z.literal(FieldType.TEXT),
});

export type TextField = z.infer<typeof zTextField>;

///////////////////////
// Params Definition //
///////////////////////

export const zTextFieldParams = z.object({
  label: z.string(),
});

export type TextFieldParams = z.infer<typeof zTextFieldParams>;

//////////////////////
// Input Validation //
//////////////////////

export const zTextFieldInput = (params: TextFieldParams) =>
  z.string().nonempty({ message: "Required" });

export type TextFieldInput = z.infer<ReturnType<typeof zTextFieldInput>>;

///////////////////
// Merge Options //
///////////////////

export const zIncludeParams = z.object({
  params: zTextFieldParams,
});

export const zIncludeAnswers = (params: TextFieldParams) =>
  z.object({
    answers: z.array(zTextAnswer(params)),
  });

export const zIncludeZeroOrOneAnswers = (params: TextFieldParams) =>
  z.object({
    answers: z.array(zTextAnswer(params)).min(0).max(1),
  });

export const zIncludeAnswer = (params: TextFieldParams) =>
  z.object({
    answer: zTextAnswer(params).optional(),
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
  return zTextField.merge(zIncludeParams).parse(field);
};

export const parseTextFieldWithAnswer = (
  field: unknown & { params: unknown }
) => {
  const params = zTextFieldParams.parse(field.params);
  return zTextField
    .merge(zIncludeParams)
    .merge(zIncludeAnswer(params))
    .parse(field);
};

export const parseTextFieldWithZeroOrOneAnswers = (
  field: unknown & { params: unknown }
) => {
  const params = zTextFieldParams.parse(field.params);
  return zTextField
    .merge(zIncludeParams)
    .merge(zIncludeZeroOrOneAnswers(params))
    .transform(keepFirstAnswer)
    .parse(field);
};
