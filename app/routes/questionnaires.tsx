import type { DataFunctionArgs } from "@remix-run/node";
import { Form, Outlet, useLoaderData } from "@remix-run/react";
import Header from "~/components/Header";
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
      <Header user={user} />
      <Outlet />
    </div>
  );
};
