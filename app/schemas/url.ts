import { z } from "zod";

export const zRedirect = z
  .string()
  .regex(/^\/[a-z0-9/_-]*$/i)
  .brand<"Redirect">();

export type Redirect = z.infer<typeof zRedirect>;
