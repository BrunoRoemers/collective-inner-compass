import type { Prisma } from "@prisma/client";
import { FieldType } from "@prisma/client";
import NumberField, {
  numberParamsParser,
  getNumberDataParser,
} from "./fields/NumberField";
import TextField, {
  getTextDataParser,
  textParamsParser,
} from "./fields/TextField";
import ExplainerField, { explainerParamsParser } from "./fields/ExplainerField";

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

      const numberAnswer = field.answers[0];
      const numberDefaultValue = numberAnswer
        ? getNumberDataParser(numberParams).parse(numberAnswer.content).value
        : 0;

      return (
        <NumberField
          id={field.id}
          params={numberParams}
          defaultValue={numberDefaultValue}
          errors={errors}
        ></NumberField>
      );
    case FieldType.TEXT:
      const textParams = textParamsParser.parse(field.params);

      const textAnswer = field.answers[0];
      const textDefaultValue = textAnswer
        ? getTextDataParser(textParams).parse(textAnswer.content).value
        : "";

      return (
        <TextField
          id={field.id}
          params={textParams}
          defaultValue={textDefaultValue}
          errors={errors}
        ></TextField>
      );
    case FieldType.EXPLAINER:
      const explainerParams = explainerParamsParser.parse(field.params);

      return (
        <ExplainerField
          id={field.id}
          params={explainerParams}
          errors={errors}
        ></ExplainerField>
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
