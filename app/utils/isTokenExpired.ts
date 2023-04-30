import config from "~/config";

// TODO write tests for this!
export default (createdAt: Date): boolean => {
  const now = new Date();
  const timeDifferenceInMs = now.getTime() - createdAt.getTime();
  console.log(timeDifferenceInMs);
  return timeDifferenceInMs < 0 || timeDifferenceInMs > config.tokenMaxAgeInMs;
};
