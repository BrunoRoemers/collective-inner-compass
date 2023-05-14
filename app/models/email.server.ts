import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from "@sendinblue/client";
import type { User } from "~/schemas/user";
import ReactDOMServer from "react-dom/server";
import MagicLinkEmail from "~/components/emails/MagicLinkEmail";
import type { BaseUrl, Redirect } from "~/schemas/url";
import type { Secret, TokenId } from "~/schemas/token";
import config from "~/config";

const emailApiKey = process.env.EMAIL_API_KEY;
if (!emailApiKey) {
  throw new Error("EMAIL_API_KEY must be set");
}

const emailSendingDisabled = process.env.DISABLE_EMAIL_SENDING === "1";
if (emailSendingDisabled) {
  console.warn("⚠️  Sending emails is disabled");
} else {
  console.log("✅ Sending emails is enabled");
}

const sendApi = new TransactionalEmailsApi();
sendApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, emailApiKey);

export const sendMagicLinkEmail = async (
  user: User,
  baseUrl: BaseUrl,
  tokenId: TokenId,
  secret: Secret,
  redirectTo: Redirect
): Promise<boolean> => {
  const htmlContent = ReactDOMServer.renderToString(
    MagicLinkEmail({ user, baseUrl, tokenId, secret, redirectTo })
  );

  if (emailSendingDisabled) {
    console.debug(`intercepted email to ${user.email}:`, htmlContent);
    return true;
  }

  try {
    const { response } = await sendApi.sendTransacEmail({
      sender: {
        name: config.email.defaultFrom.name,
        email: config.email.defaultFrom.email,
      },
      to: [
        {
          name: user.name ?? undefined,
          email: user.email,
        },
      ],
      subject: "Login to Collective Inner Compass",
      htmlContent,
    });

    if (response.statusCode === 201 || response.statusCode === 202) {
      return true;
    } else {
      console.error(`error sending email: status code ${response.statusCode}`);
      return false;
    }
  } catch (e) {
    console.error("error sending email: thrown");
    return false;
  }
};
