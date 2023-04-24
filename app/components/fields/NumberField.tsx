import { z } from "zod";
import FormRow from "../FormRow";
import type Field from "./Field";
import type { FieldProps } from "./Field";

// NOTE: we need a parser because this data is coming as JSON from the backend and/or database
const paramsParser = z.object({
  label: z.string(),
  min: z.number(),
  max: z.number(),
});

// NOTE: we need a parser because this data is coming as JSON from the backend and/or database
const getContentParser = (params: Params) =>
  z.object({
    value: z.number().min(params.min).max(params.max),
  });

// NOTE: we need a parser because this data is coming from the user
const getInputParser = (params: Params) =>
  z
    .union([z.string().nonempty({ message: "Required" }), z.number()])
    .pipe(z.coerce.number().min(params.min).max(params.max));

const Element = ({
  id,
  params,
  defaultValue,
  errors,
}: FieldProps<Params, Input>) => {
  return (
    <FormRow label={params.label} errorMessages={errors}>
      <input
        type="number"
        name={id}
        defaultValue={defaultValue}
        className="block w-full"
      />
    </FormRow>
  );
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
