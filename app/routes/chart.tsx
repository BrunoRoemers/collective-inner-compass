import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import base64ToObject from "~/utils/base64ToObject.server";

ChartJS.register(RadialLinearScale, PointElement, LineElement);

export const loader: LoaderFunction = ({ request }) => {
  const url = new URL(request.url);
  const data = url.searchParams.get("data");
  if (data === null) {
    throw new Error("no data provided");
  }

  const json = base64ToObject(data);

  console.log("json", json);

  return json;
};

export default () => {
  const data = useLoaderData();

  return (
    <div>
      <Radar data={data} />
    </div>
  );
};
