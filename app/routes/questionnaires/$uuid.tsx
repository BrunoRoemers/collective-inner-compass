import { z } from "zod";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import FormRow from "~/components/FormRow";
import objectToBase64 from "~/utils/objectToBase64.server";

export const loader: LoaderFunction = async ({ params }) => {
  return json({ uuid: z.string().uuid().parse(params.uuid) });
};

export const action: ActionFunction = async ({ params, request }) => {
  const formData = await request.formData();

  // TODO use ZOD: https://www.npmjs.com/package/zod

  // TODO repeating too much code...
  const openness = parseInt(String(formData.get("openness")), 10);
  const passion = parseInt(String(formData.get("passion")), 10);
  const collaboration = parseInt(String(formData.get("collaboration")), 10);

  console.log(openness, passion, collaboration);

  const errors = {
    openness:
      isNaN(openness) || openness < 0 || openness > 100
        ? "should be a number between 0 and 100"
        : null,
    passion:
      isNaN(passion) || passion < 0 || passion > 100
        ? "should be a number between 0 and 100"
        : null,
    collaboration:
      isNaN(collaboration) || collaboration < 0 || collaboration > 100
        ? "should be a number between 0 and 100"
        : null,
  };

  const hasErrors = Object.values(errors).some((v) => v);
  if (hasErrors) {
    return json(errors);
  }

  const data = {
    labels: ["Openness", "Passion", "Collaboration"],
    datasets: [
      {
        label: "My First Dataset",
        data: [openness, passion, collaboration],
        fill: true,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgb(255, 99, 132)",
        pointBackgroundColor: "rgb(255, 99, 132)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 99, 132)",
      },
    ],
  };

  return redirect(`../chart?data=${objectToBase64(data)}`);
};

export default () => {
  const { uuid } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <div className="p-2">
      <span>questionnaire uuid: {uuid}</span>
      <Form method="post">
        <FormRow
          label={`Rate alignment on value "openness"`}
          errorMessages={[errors?.openness]}
        >
          <input type="number" name="openness" className="block w-full" />
        </FormRow>
        <FormRow
          label={`Rate alignment on value "passion"`}
          errorMessages={[errors?.passion]}
        >
          <input type="number" name="passion" className="block w-full" />
        </FormRow>
        <FormRow
          label={`Rate alignment on value "collaboration"`}
          errorMessages={[errors?.collaboration]}
        >
          <input type="number" name="collaboration" className="block w-full" />
        </FormRow>
        <button type="submit" name="submit" className="hover:underline">
          Submit
        </button>
      </Form>
    </div>
  );
};
