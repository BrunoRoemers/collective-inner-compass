interface AuthConfig {
  tokenMaxAgeInMs: number;
  tokenSizeInBytes: number;
  hashSaltLength: number;
  urlParams: {
    secret: string;
    redirect: string;
  };
}

interface Config {
  auth: AuthConfig;
}

const config: Config = {
  auth: {
    tokenMaxAgeInMs: 1000 * 60 * 10,
    tokenSizeInBytes: 32,
    hashSaltLength: 10,
    urlParams: {
      secret: "t",
      redirect: "r",
    },
  },
};

export default config;
