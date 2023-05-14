import { Form } from "@remix-run/react";
import type { User } from "~/schemas/user";

interface Props {
  user: User;
}

const Header = ({ user }: Props) => {
  return (
    <header className="bg-blue-300 px-2">
      You're logged in as: <span className="font-bold">{user.email}</span>{" "}
      <Form action="/logout" method="post" className="inline-block">
        (
        <button type="submit" className="button hover:underline">
          Logout
        </button>
        )
      </Form>
    </header>
  );
};

export default Header;
