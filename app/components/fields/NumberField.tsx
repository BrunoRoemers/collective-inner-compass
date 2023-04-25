import FormRow from "../FormRow";
import type Field from "./Field";
import type { FieldProps } from "./Field";
import type {
  NumberFieldInput,
  NumberFieldParams,
} from "~/schemas/fields/numberField";

const Element = ({
  id,
  params,
  defaultValue,
  errors,
}: FieldProps<NumberFieldParams, NumberFieldInput>) => {
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

const field: Field<NumberFieldParams, NumberFieldInput> = {
  Element,
};

export default field;
