import { z } from "zod";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";

const response = z.object({
  user: z.union([
    z.null(),
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
    }),
  ]),
});

type Response = z.infer<typeof response>;

export const loader = async ({ request }: DataFunctionArgs) => {
  const userId = await getUserId(request);

  if (userId === undefined) {
    return json<Response>({
      user: null,
    });
  }

  const user = await db.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  return json<Response>({
    user: {
      id: user.id,
      name: user.name ?? "Anon",
      email: user.email,
    },
  });
};

export default function Index() {
  const { user } = response.parse(useLoaderData());

  return (
    <div>
      <ul>
        <li>
          <Link to="questionnaires" className="hover:underline block">
            Questionnaires
          </Link>
        </li>
      </ul>
      <div>
        (
        {user === null
          ? "not logged in"
          : `logged in as: ${user.name} (${user.email})`}
        )
      </div>
    </div>
  );
}
