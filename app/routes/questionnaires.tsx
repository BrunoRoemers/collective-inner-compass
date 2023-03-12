import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

export const loader = async () => {
  return json({
    questionnaires: await db.questionnaire.findMany(),
  });
};

export default () => {
  const { questionnaires } = useLoaderData<typeof loader>();
  console.log(questionnaires);
  return (
    <ul>
      {questionnaires.map((q) => (
        <li key={q.id}>{q.name}</li>
      ))}
    </ul>
  );
};
