import { z } from "zod";
import {
  includeParams as includeNumberParams,
  numberField,
} from "./numberField";
import { includeParams as includeTextParams, textField } from "./textField";
import {
  explainerField,
  includeParams as includeExplainerParams,
} from "./explainerField";

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
