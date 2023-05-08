import type { FieldId } from "~/schemas/fields/field";
import type { UpdatableFieldInput } from "~/schemas/fields/updatableField";
import type { UserId } from "~/schemas/user";
import { db } from "~/utils/db.server";

export const upsertAnswers = async (
  userId: UserId,
  data: {
    [k: FieldId]: UpdatableFieldInput;
  }
): Promise<void> => {
  await db.$transaction(
    Object.entries(data).map(([fieldId, value]) => {
      return db.answer.upsert({
        where: {
          userId_fieldId: {
            userId: userId,
            fieldId: fieldId,
          },
        },
        update: {
          content: { value: value },
        },
        create: {
          userId: userId,
          fieldId: fieldId,
          content: { value: value },
        },
      });
    })
  );
};
