// docs:
// - https://docs.netlify.com/integrations/build-plugins/create-plugins/#utilities
// - https://github.com/netlify/build/blob/main/packages/run-utils/README.md

export const onPreBuild = async function ({ utils: { build, run } }) {
  // TODO error handling?
  await run.command(`npx prisma migrate deploy`);
};
