import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { requireAuthenticatedUser } from "~/models/session.server";

export const loader = async ({ request }: DataFunctionArgs) => {
  await requireAuthenticatedUser(request);
  return json({
    questionnaires: await db.questionnaire.findMany(),
  });
};

export default () => {
  const { questionnaires } = useLoaderData<typeof loader>();
  return (
    <ul>
      {questionnaires.map((q) => (
        <li key={q.id}>
          <Link to={q.id} className="hover:underline block">
            {q.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};
