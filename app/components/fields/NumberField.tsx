import { z } from "zod";
import FormRow from "../FormRow";

// NOTE: we need a parser because this data is coming as JSON from the backend and/or database
export const numberParamsParser = z.object({
  label: z.string(),
  min: z.number(),
  max: z.number(),
});

export type NumberParams = z.infer<typeof numberParamsParser>;

// NOTE: we need a parser because this data is coming as JSON from the backend and/or database
export const getNumberDataParser = (params: NumberParams) =>
  z.optional(z.object({
    value: z.number().min(params.min).max(params.max),
  }));

export type NumberData = z.infer<ReturnType<typeof getNumberDataParser>>;

// NOTE: we need a parser because this data is coming from the user
export const getNumberInputParser = (params: NumberParams) =>
  z
    .union([z.string().nonempty({ message: "Required" }), z.number()])
    .pipe(z.coerce.number().min(params.min).max(params.max));

export type NumberInput = z.infer<ReturnType<typeof getNumberInputParser>>;

export interface Props {
  id: string;
  params: NumberParams;
  defaultValue?: number;
  errors?: string[];
}

const NumberField = ({ id, params, defaultValue, errors }: Props) => {
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
