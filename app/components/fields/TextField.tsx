import { z } from "zod";
import FormRow from "../FormRow";
import type Field from "./Field";
import type { FieldProps } from "./Field";

// NOTE: we need a parser because this data is coming as JSON from the backend and/or database
const paramsParser = z.object({
  label: z.string(),
});

// NOTE: we need a parser because this data is coming as JSON from the backend and/or database
const getContentParser = (params: Params) =>
  z.object({
    value: z.string(),
  });

// NOTE: we need a parser because this data is coming from the user
const getInputParser = (params: Params) =>
  z.string().nonempty({ message: "Required" });

const Element = ({
  id,
  params,
  defaultValue,
  errors,
}: FieldProps<Params, Input>) => {
  return (
    <FormRow label={params.label} errorMessages={errors}>
      <input
        type="text"
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
