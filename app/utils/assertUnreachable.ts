const assertUnreachable = (_: never) => {
  throw new Error(
    `This code branch should be unreachable. A compile-time error should have warned about this.`
  );
};

export default assertUnreachable;
