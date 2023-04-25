import type { FieldProps } from "./Field";
import type Field from "./Field";
import type { ExplainerFieldParams } from "~/schemas/fields/explainerField";

const Element = ({ id, params }: FieldProps<ExplainerFieldParams, void>) => {
  return <div>{params.text}</div>;
};

const field: Field<ExplainerFieldParams, void> = {
  Element,
};

export default field;
