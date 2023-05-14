import { z } from "zod";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import FormRow from "~/components/FormRow";
import { zErrors } from "~/schemas/errors";
import { getOrCreateUser } from "~/models/user.server";
import { createToken, consumeExistingTokens } from "~/models/token.server";
import { zUserEmail } from "~/schemas/user";
import { zBaseUrl, zRedirect } from "~/schemas/url";
import getSearchParam from "~/utils/getSearchParam";
import config from "~/config";
import { sendMagicLinkEmail } from "~/models/email.server";

const zResponse = z.union([
  zErrors,
  z.undefined(),
  z.object({ success: z.literal(true) }),
]);
type Response = z.infer<typeof zResponse>;

export const action = async ({ request }: DataFunctionArgs) => {
  const baseUrl = zBaseUrl.parse(request.url);
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

  const success = await sendMagicLinkEmail(
    user,
    baseUrl,
    tokenId,
    secret,
    redirectTo
  );
  if (success) {
    return json<Response>({ success: true }, 200);
  } else {
    throw new Error("failed to send email");
  }
};

export default () => {
  const actionData = zResponse.parse(useActionData());

  if (actionData && "success" in actionData) {
    return (
      <div className="p-2">
        A login link has been sent and will arrive in your mailbox shortly.
      </div>
    );
  }

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
};
