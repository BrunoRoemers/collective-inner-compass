import { z } from "zod";
import {
  zIncludeParams as includeNumberParams,
  zNumberField,
  parseNumberFieldWithZeroOrOneAnswers,
} from "./numberField";
import {
  zIncludeParams as includeTextParams,
  parseTextFieldWithZeroOrOneAnswers,
  zTextField,
} from "./textField";
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

export const zUpdatableField = z.discriminatedUnion("type", [
  zNumberField.merge(includeNumberParams),
  zTextField.merge(includeTextParams),
]);

export type UpdatableField = z.infer<typeof zUpdatableField>;

export const parseAnyFieldWithZeroOrOneAnswers = (
  field: unknown & { type: FieldType; params: unknown }
) => {
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
