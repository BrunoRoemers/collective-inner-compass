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
import { zRedirect } from "~/schemas/url";
import getSearchParam from "~/utils/getSearchParam";
import config from "~/config";

const zResponse = z.union([
  zErrors,
  z.object({
    doNotSendMeToTheClient: zTokenIdAndSecret.extend({ redirectTo: zRedirect }),
  }),
  z.undefined(),
]);
type Response = z.infer<typeof zResponse>;

export const action = async ({ request }: DataFunctionArgs) => {
  const redirectTo = zRedirect.parse(
    getSearchParam(request.url, config.auth.urlParams.redirect) ?? "/"
  );

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
    return json<Response>(errors, { status: 400 });
  }

  const user = await getOrCreateUser(result.data.email);

  // TODO rate-limit creation of tokens

  await consumeExistingTokens(user.id);
  const { tokenId, secret } = await createToken(user.id);

  // TEMP as soon as sending emails is implemented, DO NOT RETURN THE TOKEN TO THE CLIENT
  return json<Response>({
    doNotSendMeToTheClient: {
      tokenId,
      secret,
      redirectTo,
    },
  });
};

export default () => {
  const actionData = zResponse.parse(useActionData());

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

  const link = `/tokens/${actionData.doNotSendMeToTheClient.tokenId}?t=${actionData.doNotSendMeToTheClient.secret}&r=${actionData.doNotSendMeToTheClient.redirectTo}`;

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
