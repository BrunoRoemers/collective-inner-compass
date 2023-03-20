import type { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import objectToBase64 from "../utils/objectToBase64.server";

export const loader: LoaderFunction = ({ request }) => {
  return {
    demoDataBase64: objectToBase64({
      labels: [
        "Eating",
        "Drinking",
        "Sleeping",
        "Designing",
        "Coding",
        "Cycling",
        "Running",
      ],
      datasets: [
        {
          label: "My First Dataset",
          data: [65, 59, 90, 81, 56, 55, 40],
          fill: true,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgb(255, 99, 132)",
          pointBackgroundColor: "rgb(255, 99, 132)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgb(255, 99, 132)",
        },
        {
          label: "My Second Dataset",
          data: [28, 48, 40, 19, 96, 27, 100],
          fill: true,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgb(54, 162, 235)",
          pointBackgroundColor: "rgb(54, 162, 235)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgb(54, 162, 235)",
        },
      ],
    }),
  };
};

export default function Index() {
  const { demoDataBase64 } = useLoaderData();

  return (
    <div>
      <ul>
        <li>
          <Link
            to={`chart?data=${demoDataBase64}`}
            className="hover:underline block"
          >
            Demo Radar View
          </Link>
          <Link to="questionnaires" className="hover:underline block">
            Questionnaires
          </Link>
        </li>
      </ul>
    </div>
  );
}
