import { z } from "zod";

/////////////////////
// Base Definition //
/////////////////////

import { FieldType } from "@prisma/client";
import { zField } from "./field";

export const zExplainerField = zField.extend({
  type: z.literal(FieldType.EXPLAINER),
});

export type ExplainerField = z.infer<typeof zExplainerField>;

///////////////////////
// Params Definition //
///////////////////////

export const zExplainerFieldParams = z.object({
  title: z.string(),
  text: z.string(),
});

export type ExplainerFieldParams = z.infer<typeof zExplainerFieldParams>;

///////////////////
// Merge Options //
///////////////////

export const zIncludeParams = z.object({
  params: zExplainerFieldParams,
});

/////////////////////////
// Common Combinations //
/////////////////////////

export const parseExplainerField = (field: unknown & { params: unknown }) => {
  return zExplainerField.merge(zIncludeParams).parse(field);
};
export type ExplainerFieldWithParams = ReturnType<typeof parseExplainerField>;
