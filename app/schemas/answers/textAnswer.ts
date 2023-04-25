import { z } from "zod";
import type { TextFieldParams } from "../fields/textField";

export const textAnswer = (params: TextFieldParams) =>
  z.object({
    content: z.object({
      value: z.string(),
    }),
  });

export type TextAnswer = z.infer<ReturnType<typeof textAnswer>>;
