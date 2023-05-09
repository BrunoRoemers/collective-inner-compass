import config from "~/config";
import type { Secret, TokenId } from "~/schemas/token";
import type { BaseUrl, Redirect } from "~/schemas/url";
import type { User } from "~/schemas/user";

interface Props {
  user: User;
  baseUrl: BaseUrl;
  tokenId: TokenId;
  secret: Secret;
  redirectTo: Redirect;
}

const MagicLinkEmail = ({
  user,
  baseUrl,
  tokenId,
  secret,
  redirectTo,
}: Props) => {
  const searchParams = new URLSearchParams({
    [config.auth.urlParams.secret]: secret,
    [config.auth.urlParams.redirect]: redirectTo,
  });
  const link = `${baseUrl}/tokens/${tokenId}?${searchParams}`;

  console.debug(`magic link for ${user.email}: ${link}`);

  return (
    <html>
      <head></head>
      <body>
        <h1>Magic Link for Collective Inner Compass</h1>
        Use the following link to sign in: <a href={link}>{link}</a>
      </body>
    </html>
  );
};

export default MagicLinkEmail;
