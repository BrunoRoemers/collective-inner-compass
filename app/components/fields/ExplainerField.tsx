import type Field from "./Field";
import type { ExplainerFieldParams } from "~/schemas/fields/explainerField";

const ExplainerField: Field<ExplainerFieldParams, void> = ({ params }) => {
  return (
    <div className="mb-4">
      <h1 className="font-bold text-lg">{params.title}</h1>
      {params.text}
    </div>
  );
};

export default ExplainerField;
