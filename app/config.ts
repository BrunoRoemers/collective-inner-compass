interface Config {
  tokenMaxAgeInMs: number;
  tokenSizeInBytes: number;
  hashSaltLength: number;
}

const config: Config = {
  tokenMaxAgeInMs: 1000 * 60 * 10,
  tokenSizeInBytes: 32,
  hashSaltLength: 10,
};

export default config;
