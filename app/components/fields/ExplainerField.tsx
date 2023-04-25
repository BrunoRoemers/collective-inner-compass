import { z } from "zod";
import type { FieldProps } from "./Field";
import type Field from "./Field";
import type { ExplainerFieldParams } from "~/schemas/fields/explainerField";

// NOTE: hack to fulfil the interface
const getInputParser = (params: ExplainerFieldParams) => z.never();

const Element = ({ id, params }: FieldProps<ExplainerFieldParams, Input>) => {
  return <div>{params.text}</div>;
};

const field: Field<ExplainerFieldParams, Input> = {
  getInputParser,
  Element,
};

export default field;
export type Input = z.infer<ReturnType<typeof getInputParser>>;
