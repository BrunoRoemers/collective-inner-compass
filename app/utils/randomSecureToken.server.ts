import { webcrypto } from "node:crypto";

export default (sizeInBytes: number) => {
  const byteArray = webcrypto.getRandomValues(new Uint8Array(sizeInBytes));
  return Buffer.from(byteArray).toString("base64url");
};
