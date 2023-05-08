import { z } from "zod";

export const zQuestionnaireId = z.string().uuid().brand<"QuestionnaireId">();
export type QuestionnaireId = z.infer<typeof zQuestionnaireId>;

export const zQuestionnaire = z.object({
  id: zQuestionnaireId,
  name: z.string(),
});

export type Questionnaire = z.infer<typeof zQuestionnaire>;