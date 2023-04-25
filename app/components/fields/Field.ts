import type { z } from "zod";

export interface FieldProps<Params, Input> {
  id: string;
  params: Params;
  defaultValue?: Input;
  errors?: string[];
}

export default interface Field<Params, Input> {
  (props: FieldProps<Params, Input>): JSX.Element;
}
