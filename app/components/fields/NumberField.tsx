import { z } from "zod";
import FormRow from "../FormRow";
import type Field from "./Field";
import type { FieldProps } from "./Field";
import type { NumberFieldParams } from "~/schemas/fields/numberField";

// NOTE: we need a parser because this data is coming from the user
const getInputParser = (params: NumberFieldParams) =>
  z
    .union([z.string().nonempty({ message: "Required" }), z.number()])
    .pipe(z.coerce.number().min(params.min).max(params.max));

const Element = ({
  id,
  params,
  defaultValue,
  errors,
}: FieldProps<NumberFieldParams, Input>) => {
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

const field: Field<NumberFieldParams, Input> = {
  getInputParser,
  Element,
};

export default field;
export type Input = z.infer<ReturnType<typeof getInputParser>>;
