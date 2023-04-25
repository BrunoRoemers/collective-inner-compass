import type Field from "./Field";
import type { ExplainerFieldParams } from "~/schemas/fields/explainerField";

const ExplainerField: Field<ExplainerFieldParams, void> = ({ params }) => {
  return <div>{params.text}</div>;
};

export default ExplainerField;
