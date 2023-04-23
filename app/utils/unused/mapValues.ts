// Given an object, loop over each key and call the callback. Store the result of the callback in a new object, while keeping the keys intact.
export default <T>(
  obj: { [key: string]: T },
  fn: (value: T, key: string, obj: { [key: string]: T }) => any
) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value, key, obj)])
  );
