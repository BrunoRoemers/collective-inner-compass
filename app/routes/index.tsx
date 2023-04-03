import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div>
      <ul>
        <li>
          <Link to="questionnaires" className="hover:underline block">
            Questionnaires
          </Link>
        </li>
      </ul>
    </div>
  );
}
