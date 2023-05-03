import type { User } from "@prisma/client";
import { db } from "~/utils/db.server";

export const getOrCreateUser = async (
  email: string,
  name: string | undefined = undefined
): Promise<User> => {
  return db.user.upsert({
    where: {
      email,
    },
    update: {},
    create: {
      name,
      email,
    },
  });
};

export const getUserById = (userId: string) => {
  return db.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });
};
