import { z } from "zod";

/////////////////////
// Base Definition //
/////////////////////

import { FieldType } from "@prisma/client";
import { field } from "./field";

export const explainerField = field.extend({
  type: z.literal(FieldType.EXPLAINER),
});

export type ExplainerField = z.infer<typeof explainerField>;

///////////////////////
// Params Definition //
///////////////////////

export const explainerFieldParams = z.object({
  title: z.string(),
  text: z.string(),
});

export type ExplainerFieldParams = z.infer<typeof explainerFieldParams>;

///////////////////
// Merge Options //
///////////////////

export const includeParams = z.object({
  params: explainerFieldParams,
});

/////////////////////////
// Common Combinations //
/////////////////////////

export const parseExplainerField = (field: unknown & { params: unknown }) => {
  return explainerField.merge(includeParams).parse(field);
};
