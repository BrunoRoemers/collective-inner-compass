import { z } from "zod";
import FormRow from "../FormRow";
import type Field from "./Field";
import type { FieldProps } from "./Field";
import type { TextFieldParams } from "~/schemas/fields/textField";

// NOTE: we need a parser because this data is coming from the user
const getInputParser = (params: TextFieldParams) =>
  z.string().nonempty({ message: "Required" });

const Element = ({
  id,
  params,
  defaultValue,
  errors,
}: FieldProps<TextFieldParams, Input>) => {
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

const field: Field<TextFieldParams, Input> = {
  getInputParser,
  Element,
};

export default field;
export type Input = z.infer<ReturnType<typeof getInputParser>>;
