import type { User, UserEmail, UserId } from "~/schemas/user";
import { zUser } from "~/schemas/user";
import { db } from "~/utils/db.server";

export const getOrCreateUser = async (
  email: UserEmail,
  name: string | undefined = undefined
): Promise<User> => {
  const rawUser = await db.user.upsert({
    where: {
      email,
    },
    update: {},
    create: {
      name,
      email,
    },
  });

  return zUser.parse(rawUser);
};

export const getUserById = async (userId: UserId): Promise<User> => {
  const rawUser = await db.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return zUser.parse(rawUser);
};
