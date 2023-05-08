import type { DataFunctionArgs } from "@remix-run/node";
import { Form, Outlet, useLoaderData } from "@remix-run/react";
import { requireAuthenticatedUser } from "~/models/session.server";
import { getUserById } from "~/models/user.server";
import { zUser } from "~/schemas/user";

export const loader = async ({ request }: DataFunctionArgs) => {
  const userId = await requireAuthenticatedUser(request);
  return getUserById(userId);
};

export default () => {
  const user = zUser.parse(useLoaderData());

  return (
    <div>
      <header className="bg-blue-300">
        You're logged in as: <span className="font-bold">{user.email}</span>{" "}
        <Form action="/logout" method="post" className="inline-block">
          (
          <button type="submit" className="button hover:underline">
            Logout
          </button>
          )
        </Form>
      </header>
      <Outlet />
    </div>
  );
};
