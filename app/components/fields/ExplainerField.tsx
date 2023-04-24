import { z } from "zod";

// NOTE: we need a parser because this data is coming as JSON from the backend and/or database
export const explainerParamsParser = z.object({
  title: z.string(),
  text: z.string(),
});

export type ExplainerParams = z.infer<typeof explainerParamsParser>;

export interface Props {
  id: string;
  params: ExplainerParams;
  defaultValue?: string;
  errors?: string[];
}

const ExplainerField = ({ id, params, defaultValue, errors }: Props) => {
  return <div>{params.text}</div>;
};

export default ExplainerField;
