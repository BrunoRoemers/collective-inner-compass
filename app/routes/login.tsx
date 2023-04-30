import { z } from "zod";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import FormRow from "~/components/FormRow";
import { zErrors } from "~/schemas/zErrors";
import { db } from "~/utils/db.server";
import getRandomSecureToken from "~/utils/getRandomSecureToken.server";
import bcrypt from "bcryptjs";
import config from "~/config";

export const action = async ({ request }: DataFunctionArgs) => {
  const formData = await request.formData();
  const rawData = {
    email: formData.get("email"),
  };

  const formParser = z.object({
    email: z.string().email(),
  });

  const result = formParser.safeParse(rawData);

  // handle errors
  if (!result.success) {
    const errors = result.error.flatten();
    return json(errors, { status: 400 });
  }

  // fetch/insert user
  const user = await db.user.upsert({
    where: {
      email: result.data.email,
    },
    update: {},
    create: {
      email: result.data.email,
    },
  });

  // TODO rate-limit creation of tokens

  // invalidate any existing tokens for the user
  await db.authToken.updateMany({
    where: {
      userId: user.id,
    },
    data: {
      invalidatedAt: new Date(),
    },
  });

  // generate a secure token
  const token = getRandomSecureToken(config.tokenSizeInBytes);
  const tokenHash = await bcrypt.hash(token, config.hashSaltLength);
  const tokenRow = await db.authToken.create({
    data: {
      userId: user.id,
      hash: tokenHash,
    },
  });

  // TEMP as soon as sending emails is implemented, DO NOT RETURN THE TOKEN TO THE CLIENT
  return json({
    doNotSendMeToTheClient: {
      tokenId: tokenRow.id,
      tokenValue: token,
    },
  });
};

export default () => {
  const actionData = z
    .union([
      zErrors,
      z.object({
        doNotSendMeToTheClient: z.object({
          tokenId: z.string(),
          tokenValue: z.string(),
        }),
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

  const link = `/tokens/${actionData.doNotSendMeToTheClient.tokenId}?t=${actionData.doNotSendMeToTheClient.tokenValue}`;

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
