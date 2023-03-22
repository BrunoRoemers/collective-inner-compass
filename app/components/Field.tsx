import type { FieldType, Prisma } from "@prisma/client";
import NumberField, { numberParamsParser } from "./fields/NumberField";

interface Props {
  field: {
    id: string;
    type: FieldType;
    params: Prisma.JsonValue;
  };
  errors?: string[];
}

const Field = ({ field, errors }: Props) => {
  switch (field.type) {
    case "NUMBER":
      const numberParams = numberParamsParser.parse(field.params);
      return (
        <NumberField
          id={field.id}
          params={numberParams}
          errors={errors}
        ></NumberField>
      );
    default:
      return (
        <div className="text-red-600">
          Error: type '{field.type}' of field '{field.id}' is not supported
        </div>
      );
  }
};

export default Field;
