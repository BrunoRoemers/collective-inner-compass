import { z } from "zod";
import config from "~/config";
import { zUserId } from "./user";

export const zTokenId = z.string().uuid().brand<"TokenId">();
export type TokenId = z.infer<typeof zTokenId>;

export const zTokenHash = z.string().brand<"TokenHash">();
export type TokenHash = z.infer<typeof zTokenHash>;

export const zToken = z.object({
  id: zTokenId,
  userId: zUserId,
  hash: zTokenHash,
  createdAt: z.date(),
  consumedAt: z.date().nullable(),
});
export type Token = z.infer<typeof zToken>;

export const zSecret = z
  .string()
  // base64url encoding outputs 4 bytes for every 3 bytes of input (and does not pad the result to get a multiple of four)
  .length(Math.ceil((config.tokenSizeInBytes / 3) * 4))
  .brand<"Secret">();
export type Secret = z.infer<typeof zSecret>;

export const zTokenIdAndSecret = z.object({
  tokenId: zTokenId,
  secret: zSecret,
});
export type TokenIdAndSecret = z.infer<typeof zTokenIdAndSecret>;
