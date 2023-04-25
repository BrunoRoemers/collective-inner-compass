import type { z } from "zod";

export interface FieldProps<Params, Input> {
  id: string;
  params: Params;
  defaultValue?: Input;
  errors?: string[];
}

export default interface Field<Params, Input> {
  // TODO how can I get rid of this, and incorporate it into content?
  // parser for user input
  getInputParser: (params: Params) => z.ZodType<Input, z.ZodTypeDef, unknown>;

  Element: (props: FieldProps<Params, Input>) => JSX.Element;
}
