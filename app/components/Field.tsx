import type { FieldType, Prisma } from "@prisma/client";
import NumberField, { numberParamsParser } from "./fields/NumberField";

interface Props {
  field: {
    id: string;
    type: FieldType;
    params: Prisma.JsonValue;
  };
}

const Field = ({ field }: Props) => {
  switch (field.type) {
    case "NUMBER":
      const numberParams = numberParamsParser.parse(field.params);
      return (
        <NumberField fieldId={field.id} params={numberParams}></NumberField>
      );
    default:
      return (
        <div className="text-red-600">
          Error while rendering field <b>{field.id}</b>: type{" "}
          <b>{field.type}</b> is not supported.
        </div>
      );
  }
};

export default Field;
