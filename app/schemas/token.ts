import { z } from "zod";
import config from "~/config";

export const token = z
  .string()
  // base64url encoding outputs 4 bytes for every 3 bytes of input (and does not pad the result to get a multiple of four)
  .length(Math.ceil((config.tokenSizeInBytes / 3) * 4));
