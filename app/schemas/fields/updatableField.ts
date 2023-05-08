import { z } from "zod";
import {
  zNumberField,
  zIncludeParams as includeNumberParams,
  zNumberFieldInput,
} from "./numberField";
import {
  zTextField,
  zIncludeParams as includeTextParams,
  zTextFieldInput,
} from "./textField";
import type { FieldId } from "./field";
import { FieldType } from "@prisma/client";
import assertUnreachable from "~/utils/assertUnreachable";

/////////////////////
// Base Definition //
/////////////////////

export const zUpdatableField = z.discriminatedUnion("type", [
  zNumberField.merge(includeNumberParams),
  zTextField.merge(includeTextParams),
]);
export type UpdatableField = z.infer<typeof zUpdatableField>;

//////////////////////
// Input Validation //
//////////////////////

type UpdatableFieldInputParser =
  | ReturnType<typeof zNumberFieldInput>
  | ReturnType<typeof zTextFieldInput>;

export const zUpdatableFieldInput = ({
  type,
  params,
}: UpdatableField): UpdatableFieldInputParser => {
  switch (type) {
    case FieldType.NUMBER:
      return zNumberFieldInput(params);
    case FieldType.TEXT:
      return zTextFieldInput(params);
    default:
      return assertUnreachable(type);
  }
};
export type UpdatableFieldInput = z.infer<
  ReturnType<typeof zUpdatableFieldInput>
>;

export const zUpdatableFieldInputs = (fields: UpdatableField[]) =>
  z.object(
    fields.reduce<{ [k: FieldId]: UpdatableFieldInputParser }>(
      (shape, field) =>
        Object.assign(shape, {
          [field.id]: zUpdatableFieldInput(field),
        }),
      {}
    )
  );