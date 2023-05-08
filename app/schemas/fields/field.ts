import { FieldType } from "@prisma/client";
import { z } from "zod";

export const zFieldId = z.string().uuid().brand<"FieldId">();
export type FieldId = z.infer<typeof zFieldId>;

export const zField = z.object({
  id: zFieldId,
  type: z.nativeEnum(FieldType),
});

export type Field = z.infer<typeof zField>;
