import { z } from "zod";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import FormRow from "~/components/FormRow";
import { zErrors } from "~/schemas/errors";
import { getOrCreateUser } from "~/models/user.server";
import { createToken, consumeExistingTokens } from "~/models/token.server";
import { zUserEmail } from "~/schemas/user";
import { zTokenIdAndSecret } from "~/schemas/token";

export const action = async ({ request }: DataFunctionArgs) => {
  const formData = await request.formData();
  const rawData = {
    email: formData.get("email"),
  };

  const formParser = z.object({
    email: zUserEmail,
  });

  const result = formParser.safeParse(rawData);

  // handle errors
  if (!result.success) {
    const errors = result.error.flatten();
    return json(errors, { status: 400 });
  }

  const user = await getOrCreateUser(result.data.email);

  // TODO rate-limit creation of tokens

  await consumeExistingTokens(user.id);
  const { tokenId, secret } = await createToken(user.id);

  // TEMP as soon as sending emails is implemented, DO NOT RETURN THE TOKEN TO THE CLIENT
  return json({
    doNotSendMeToTheClient: {
      tokenId,
      secret,
    },
  });
};

export default () => {
  const actionData = z
    .union([
      zErrors,
      z.object({
        doNotSendMeToTheClient: zTokenIdAndSecret,
      }),
      z.undefined(),
    ])
    .parse(useActionData());

  if (actionData === undefined || "fieldErrors" in actionData) {
    return (
      <div className="p-2">
        <Form method="post">
          <FormRow label="email" errorMessages={actionData?.fieldErrors.email}>
            <input type="text" name="email" className="block w-full" />
          </FormRow>
          <button type="submit" name="submit" className="hover:underline">
            Submit
          </button>
        </Form>
      </div>
    );
  }

  const link = `/tokens/${actionData.doNotSendMeToTheClient.tokenId}?t=${actionData.doNotSendMeToTheClient.secret}`;

  return (
    <div className="p-2">
      <h1>Welcome!</h1>
      <p>We've sent a magic link to your mailbox.</p>
      <div className="bg-red-400 p-2">
        <p className="font-bold">
          Warning: email functionality not yet implemented!
        </p>
        <p>
          You can find the single-use login link below. Consider your account
          accessible by anyone on the internet!
        </p>
        <a href={link}>{link}</a>
      </div>
    </div>
  );
};
