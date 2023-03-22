import { z } from "zod";
import FormRow from "../FormRow";

// NOTE: we need a parser because this data is coming as JSON from the backend and/or database
export const numberParamsParser = z.object({
  label: z.string(),
  min: z.number(),
  max: z.number(),
});

export type NumberParams = z.infer<typeof numberParamsParser>;

export const getNumberInputParser = (params: NumberParams) =>
  z
    .union([z.string().nonempty({ message: "Required" }), z.number()])
    .pipe(z.coerce.number().min(params.min).max(params.max));

interface Props {
  id: string;
  params: NumberParams;
  errors?: string[];
}

const NumberField = ({ id, params, errors }: Props) => {
  return (
    <FormRow label={params.label} errorMessages={errors}>
      <input type="number" name={id} className="block w-full" />
    </FormRow>
  );
};

export default NumberField;
