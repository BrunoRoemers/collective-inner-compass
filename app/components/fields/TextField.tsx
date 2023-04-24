import { z } from "zod";
import FormRow from "../FormRow";

// NOTE: we need a parser because this data is coming as JSON from the backend and/or database
export const textParamsParser = z.object({
  label: z.string(),
});

export type TextParams = z.infer<typeof textParamsParser>;

// NOTE: we need a parser because this data is coming as JSON from the backend and/or database
export const getTextDataParser = (params: TextParams) =>
  z.object({
    value: z.string(),
  });

export type TextData = z.infer<ReturnType<typeof getTextDataParser>>;

// NOTE: we need a parser because this data is coming from the user
export const getTextInputParser = (params: TextParams) =>
  z.string().nonempty({ message: "Required" });

export type TextInput = z.infer<ReturnType<typeof getTextInputParser>>;

export interface Props {
  id: string;
  params: TextParams;
  defaultValue?: string;
  errors?: string[];
}

const TextField = ({ id, params, defaultValue, errors }: Props) => {
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
