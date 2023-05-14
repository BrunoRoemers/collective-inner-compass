import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAllQuestionnaires } from "~/models/questionnaire.server";
import { requireAuthenticatedUser } from "~/models/session.server";

export const loader = async ({ request }: DataFunctionArgs) => {
  await requireAuthenticatedUser(request);
  return json({
    questionnaires: await getAllQuestionnaires(),
  });
};

export default () => {
  const { questionnaires } = useLoaderData<typeof loader>();
  return (
    <div className="p-2">
      <ul>
        {questionnaires.map((q) => (
          <li key={q.id}>
            <Link to={q.id} className="hover:underline">
              {q.name}
            </Link>{" "}
            (<span>results:</span>{" "}
            <Link to={`${q.id}/group-results`} className="hover:underline">
              separate
            </Link>
            ,{" "}
            <Link to={`${q.id}/group-results-2`} className="hover:underline">
              aggregated
            </Link>
            )
          </li>
        ))}
      </ul>
    </div>
  );
};
