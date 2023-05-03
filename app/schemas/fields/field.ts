import { FieldType } from "@prisma/client";
import { z } from "zod";

export const zField = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(FieldType),
});

export type Field = z.infer<typeof zField>;
