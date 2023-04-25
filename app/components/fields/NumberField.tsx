import FormRow from "../FormRow";
import type Field from "./Field";
import type {
  NumberFieldInput,
  NumberFieldParams,
} from "~/schemas/fields/numberField";

const NumberField: Field<NumberFieldParams, NumberFieldInput> = ({
  id,
  params,
  defaultValue,
  errors,
}) => {
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

export default NumberField;
