import { z } from "zod";
import {
  zNumberField,
  zIncludeParams as includeNumberParams,
} from "./numberField";
import { zTextField, zIncludeParams as includeTextParams } from "./textField";

export const zUpdatableField = z.discriminatedUnion("type", [
  zNumberField.merge(includeNumberParams),
  zTextField.merge(includeTextParams),
]);
export type UpdatableField = z.infer<typeof zUpdatableField>;
