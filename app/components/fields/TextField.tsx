import FormRow from "../FormRow";
import type Field from "./Field";
import type {
  TextFieldInput,
  TextFieldParams,
} from "~/schemas/fields/textField";

const TextField: Field<TextFieldParams, TextFieldInput> = ({
  id,
  params,
  defaultValue,
  errors,
}) => {
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

export default TextField;
