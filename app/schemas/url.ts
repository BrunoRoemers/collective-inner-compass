import { z } from "zod";

export const zBaseUrl = z
  .string()
  .url()
  .transform((url) => new URL(url).origin)
  .brand<"BaseUrl">();
export type BaseUrl = z.infer<typeof zBaseUrl>;

export const zRedirect = z
  .string()
  .regex(/^\/[a-z0-9/_-]*$/i)
  .brand<"Redirect">();
export type Redirect = z.infer<typeof zRedirect>;
