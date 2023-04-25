import FormRow from "../FormRow";
import type Field from "./Field";
import type { FieldProps } from "./Field";
import type {
  TextFieldInput,
  TextFieldParams,
} from "~/schemas/fields/textField";

const Element = ({
  id,
  params,
  defaultValue,
  errors,
}: FieldProps<TextFieldParams, TextFieldInput>) => {
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

const field: Field<TextFieldParams, TextFieldInput> = {
  Element,
};

export default field;
