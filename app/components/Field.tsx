import type { Prisma } from "@prisma/client";
import { FieldType } from "@prisma/client";
import NumberField, {
  numberParamsParser,
  getNumberDataParser,
} from "./fields/NumberField";

interface Props {
  field: {
    id: string;
    type: FieldType;
    params: Prisma.JsonValue;
    answers: {
      content: Prisma.JsonValue;
    }[];
  };
  errors?: string[];
}

const Field = ({ field, errors }: Props) => {
  switch (field.type) {
    case FieldType.NUMBER:
      const numberParams = numberParamsParser.parse(field.params);

      const answer = field.answers[0];
      const defaultValue = answer
        ? getNumberDataParser(numberParams).parse(answer.content).value
        : 0;

      return (
        <NumberField
          id={field.id}
          params={numberParams}
          defaultValue={defaultValue}
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
