import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from "@sendinblue/client";
import type { User } from "~/schemas/user";
import ReactDOMServer from "react-dom/server";
import MagicLinkEmail from "~/components/emails/MagicLinkEmail";
import type { BaseUrl, Redirect } from "~/schemas/url";
import type { Secret, TokenId } from "~/schemas/token";

const sendInBlueApiKey = process.env.SENDINBLUE_API;
if (!sendInBlueApiKey) {
  throw new Error("SENDINBLUE_API must be set");
}

const sendApi = new TransactionalEmailsApi();
sendApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, sendInBlueApiKey);

export const sendMagicLinkEmail = async (
  user: User,
  baseUrl: BaseUrl,
  tokenId: TokenId,
  secret: Secret,
  redirectTo: Redirect
) => {
  return sendApi.sendTransacEmail({
    sender: {
      name: "Collective Inner Compass",
      email: "no-reply@cic.roemers.io",
    },
    to: [
      {
        name: user.name ?? "Anon",
        email: user.email,
      },
    ],
    subject: "Login to Collective Inner Compass",
    htmlContent: ReactDOMServer.renderToString(
      MagicLinkEmail({ user, baseUrl, tokenId, secret, redirectTo })
    ),
  });
};
