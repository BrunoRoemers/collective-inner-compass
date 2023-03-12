// docs:
// - https://docs.netlify.com/integrations/build-plugins/create-plugins/#utilities
// - https://github.com/netlify/build/blob/main/packages/run-utils/README.md

export const onBuild = async function ({ utils: { build, run } }) {
  console.log("before prisma deploy");
  await run.command(`npx prisma migrate deploy`);
  console.log("after prisma deploy");
};
