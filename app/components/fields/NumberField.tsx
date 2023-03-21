import { z } from "zod";
import FormRow from "../FormRow";

// NOTE: we need a parser because this data is coming as JSON from the backend and/or database
export const numberParamsParser = z.object({
  label: z.string(),
  min: z.number(),
  max: z.number(),
});

export type NumberParams = z.infer<typeof numberParamsParser>;

interface Props {
  fieldId: string;
  params: NumberParams;
}

const NumberField = ({ fieldId, params }: Props) => {
  return (
    <FormRow
      label={params.label}
      errorMessages={[]} // TODO
    >
      <input type="number" name={fieldId} className="block w-full" />
    </FormRow>
  );
};

export default NumberField;
