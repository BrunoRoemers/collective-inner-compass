import { z } from "zod";
import type { FieldProps } from "./Field";
import type Field from "./Field";

// NOTE: we need a parser because this data is coming as JSON from the backend and/or database
const paramsParser = z.object({
  title: z.string(),
  text: z.string(),
});

// NOTE: hack to fulfil the interface
const getContentParser = (params: Params) => z.never();

// NOTE: hack to fulfil the interface
const getInputParser = (params: Params) => z.never();

const Element = ({ id, params }: FieldProps<Params, Input>) => {
  return <div>{params.text}</div>;
};

const field: Field<Params, Content, Input> = {
  paramsParser,
  getContentParser,
  getInputParser,
  Element,
};

export default field;
export type Params = z.infer<typeof paramsParser>;
export type Content = z.infer<ReturnType<typeof getContentParser>>;
export type Input = z.infer<ReturnType<typeof getInputParser>>;

