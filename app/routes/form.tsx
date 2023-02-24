import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import objectToBase64 from "~/utils/objectToBase64.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  // TODO repeating too much code...
  const openness = Number(formData.get("openness"));
  const passion = Number(formData.get("passion"));
  const collaboration = Number(formData.get("collaboration"));

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

  // TODO: show errors in UI

  console.log("errs:", errors);
  console.log("has errs?", hasErrors);

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
  return (
    <div>
      <Form method="post">
        <label>
          <span>Rate alignment on value "openness"</span>
          <input
            type="number"
            name="openness"
            id="openness"
            className="block"
          />
        </label>
        <label>
          <span>Rate alignment on value "passion"</span>
          <input type="number" name="passion" id="passion" className="block" />
        </label>
        <label>
          <span>Rate alignment on value "collaboration"</span>
          <input
            type="number"
            name="collaboration"
            id="collaboration"
            className="block"
          />
        </label>
        <button type="submit" name="submit" className="hover:underline">
          Submit
        </button>
      </Form>
    </div>
  );
};
