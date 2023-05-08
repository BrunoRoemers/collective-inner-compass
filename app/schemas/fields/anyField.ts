import { z } from "zod";
import type { NumberFieldWithAnswer } from "./numberField";
import {
  zIncludeParams as includeNumberParams,
  zNumberField,
  parseNumberFieldWithZeroOrOneAnswers,
} from "./numberField";
import type { TextFieldWithAnswer } from "./textField";
import {
  zIncludeParams as includeTextParams,
  parseTextFieldWithZeroOrOneAnswers,
  zTextField,
} from "./textField";
import type { ExplainerFieldWithParams } from "./explainerField";
import {
  zExplainerField,
  zIncludeParams as includeExplainerParams,
  parseExplainerField,
} from "./explainerField";
import { FieldType } from "@prisma/client";
import assertUnreachable from "~/utils/assertUnreachable";

export const zAnyField = z.discriminatedUnion("type", [
  zNumberField.merge(includeNumberParams),
  zTextField.merge(includeTextParams),
  zExplainerField.merge(includeExplainerParams),
]);

export type AnyField = z.infer<typeof zAnyField>;

export type AnyFieldWithAnswer =
  | NumberFieldWithAnswer
  | TextFieldWithAnswer
  | ExplainerFieldWithParams;

export const parseAnyFieldWithZeroOrOneAnswers = (
  field: unknown & { type: FieldType; params: unknown }
): AnyFieldWithAnswer => {
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
};
