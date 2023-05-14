import { z } from "zod";
import type { NumberFieldParams } from "../fields/numberField";
import { zUserId } from "../user";

/////////////////////
// Base Definition //
/////////////////////

export const zNumberAnswer = (params: NumberFieldParams) =>
  z.object({
    content: z.object({
      value: z.number().min(params.min).max(params.max),
    }),
  });

export type NumberAnswer = z.infer<ReturnType<typeof zNumberAnswer>>;

///////////////////
// Merge Options //
///////////////////

export const zIncludeUserId = (params: NumberFieldParams) =>
  z.object({
    userId: zUserId,
  });
