import type { Prisma } from "@prisma/client";
import { FieldType } from "@prisma/client";
import numberField from "./fields/NumberField";
import textField from "./fields/TextField";
import explainerField from "./fields/ExplainerField";

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
      const numberParams = numberField.paramsParser.parse(field.params);

      const numberAnswer = field.answers[0];
      const numberDefaultValue = numberAnswer
        ? numberField.getContentParser(numberParams).parse(numberAnswer.content)
            .value
        : undefined;

      return (
        <numberField.Element
          id={field.id}
          params={numberParams}
          defaultValue={numberDefaultValue}
          errors={errors}
        ></numberField.Element>
      );
    case FieldType.TEXT:
      const textParams = textField.paramsParser.parse(field.params);

      const textAnswer = field.answers[0];
      const textDefaultValue = textAnswer
        ? textField.getContentParser(textParams).parse(textAnswer.content).value
        : "";

      return (
        <textField.Element
          id={field.id}
          params={textParams}
          defaultValue={textDefaultValue}
          errors={errors}
        ></textField.Element>
      );
    case FieldType.EXPLAINER:
      const explainerParams = explainerField.paramsParser.parse(field.params);

      return (
        <explainerField.Element
          id={field.id}
          params={explainerParams}
          errors={errors}
        ></explainerField.Element>
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
