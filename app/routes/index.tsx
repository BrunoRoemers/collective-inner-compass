import { z } from "zod";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getIdOfAuthenticatedUser } from "~/models/session.server";
import { zUser } from "~/schemas/user";
import { getUserById } from "~/models/user.server";

const response = z.object({
  user: z.union([z.null(), zUser]),
});

type Response = z.infer<typeof response>;

export const loader = async ({ request }: DataFunctionArgs) => {
  const userId = await getIdOfAuthenticatedUser(request);

  if (userId === undefined) {
    return json<Response>({ user: null });
  }

  const user = await getUserById(userId);

  return json<Response>({ user: user });
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
          : `logged in as: ${user.name ?? "Anon"} (${user.email})`}
        )
      </div>
    </div>
  );
}
