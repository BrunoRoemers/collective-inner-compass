interface AuthConfig {
  tokenMaxAgeInMs: number;
  tokenSizeInBytes: number;
  hashSaltLength: number;
  urlParams: {
    secret: string;
    redirect: string;
  };
}

interface EmailConfig {
  defaultFrom: {
    name: string;
    email: string;
  };
}

interface Config {
  auth: AuthConfig;
  email: EmailConfig;
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
  email: {
    defaultFrom: {
      name: "Collective Inner Compass",
      email: "no-reply@cic.roemers.io",
    },
  },
};

export default config;
