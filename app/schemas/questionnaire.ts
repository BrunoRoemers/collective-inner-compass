import { z } from "zod";

export const zQuestionnaireId = z.string().uuid().brand<"QuestionnaireId">();
export type QuestionnaireId = z.infer<typeof zQuestionnaireId>;
