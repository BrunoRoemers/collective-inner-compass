import { z } from "zod";

export default z.optional(
  z.object({
    formErrors: z.array(z.string()),
    fieldErrors: z.record(z.array(z.string())),
  })
);
