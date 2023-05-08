import { z } from "zod";

export const zUserId = z.string().uuid().brand<"UserId">();
export type UserId = z.infer<typeof zUserId>;

export const zUserEmail = z.string().email().brand<"UserEmail">();
export type UserEmail = z.infer<typeof zUserEmail>;

export const zUser = z.object({
  id: zUserId,
  name: z.string().nullable(),
  email: zUserEmail,
});

export type User = z.infer<typeof zUser>;
