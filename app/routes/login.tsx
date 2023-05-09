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

const zResponse = z.union([zErrors, z.undefined(), z.null()]);
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

  try {
    const status = await sendMagicLinkEmail(
      user,
      baseUrl,
      tokenId,
      secret,
      redirectTo
    );
    // TODO
    console.log("STATUS", status);
    return null;
  } catch (e) {
    console.error(e);
    // TODO
    return null;
  }
};

export default () => {
  const actionData = zResponse.parse(useActionData());

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

  // TODO clean up
  // const link = `/tokens/${actionData.doNotSendMeToTheClient.tokenId}?t=${actionData.doNotSendMeToTheClient.secret}&r=${actionData.doNotSendMeToTheClient.redirectTo}`;

  // return (
  //   <div className="p-2">
  //     <h1>Welcome!</h1>
  //     <p>We've sent a magic link to your mailbox.</p>
  //     <div className="bg-red-400 p-2">
  //       <p className="font-bold">
  //         Warning: email functionality not yet implemented!
  //       </p>
  //       <p>
  //         You can find the single-use login link below. Consider your account
  //         accessible by anyone on the internet!
  //       </p>
  //       <a href={link}>{link}</a>
  //     </div>
  //   </div>
  // );
};
