import type { ReactNode } from "react";

interface Props {
  label: string;
  errorMessages?: string[];
  children: ReactNode;
  htmlFor?: string;
}

const FormRow = ({ label, children, errorMessages, htmlFor }: Props) => {
  const hasErrors = errorMessages !== undefined && errorMessages.length > 0;

  return (
    <label htmlFor={htmlFor} className="block mb-4">
      <div>{label}</div>
      <div>{children}</div>
      {hasErrors ? (
        <ul className="text-red-600">
          {errorMessages.map((errorMessage, i) => (
            <li key={1}>{errorMessage}</li>
          ))}
        </ul>
      ) : null}
    </label>
  );
};

export default FormRow;
