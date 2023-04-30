export default (rawUrl: string, param: string) => {
  const url = new URL(rawUrl);
  return url.searchParams.get(param);
};
