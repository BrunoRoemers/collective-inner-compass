import { z } from "zod";
import {
  includeParams as includeNumberParams,
  numberField,
  parseNumberFieldWithZeroOrOneAnswers,
} from "./numberField";
import {
  includeParams as includeTextParams,
  parseTextFieldWithZeroOrOneAnswers,
  textField,
} from "./textField";
import {
  explainerField,
  includeParams as includeExplainerParams,
  parseExplainerField,
} from "./explainerField";
import { FieldType } from "@prisma/client";
import assertUnreachable from "~/utils/assertUnreachable";

export const anyField = z.discriminatedUnion("type", [
  numberField.merge(includeNumberParams),
  textField.merge(includeTextParams),
  explainerField.merge(includeExplainerParams),
]);

export type AnyField = z.infer<typeof anyField>;

export const updatableField = z.discriminatedUnion("type", [
  numberField.merge(includeNumberParams),
  textField.merge(includeTextParams),
]);

export type UpdatableField = z.infer<typeof updatableField>;

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
