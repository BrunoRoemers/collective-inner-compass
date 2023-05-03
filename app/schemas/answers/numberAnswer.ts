import { z } from "zod";
import type { NumberFieldParams } from "../fields/numberField";

export const zNumberAnswer = (params: NumberFieldParams) =>
  z.object({
    content: z.object({
      value: z.number().min(params.min).max(params.max),
    }),
  });

export type NumberAnswer = z.infer<ReturnType<typeof zNumberAnswer>>;
