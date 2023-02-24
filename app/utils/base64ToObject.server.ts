const base64ToObject = (str: string) => {
  return JSON.parse(Buffer.from(str, "base64url").toString());
};

export default base64ToObject;
