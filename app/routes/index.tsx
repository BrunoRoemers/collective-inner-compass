import { z } from "zod";
import type { DataFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { requireAuthenticatedUser } from "~/models/session.server";
import { zUser } from "~/schemas/user";
import { getUserById } from "~/models/user.server";
import Header from "~/components/Header";

export const loader = async ({ request }: DataFunctionArgs) => {
  const userId = await requireAuthenticatedUser(request);
  return getUserById(userId);
};

export default function Index() {
  const user = zUser.parse(useLoaderData());

  return (
    <div>
      <Header user={user} />
      <div className="p-2">
        <ul>
          <li>
            <Link to="questionnaires" className="hover:underline block">
              Questionnaires
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
