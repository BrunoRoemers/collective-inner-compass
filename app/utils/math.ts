export const sum = (arr: number[]): number =>
  arr.reduce((acc, nr) => acc + nr, 0);

export const average = (arr: number[]): number => sum(arr) / arr.length;
