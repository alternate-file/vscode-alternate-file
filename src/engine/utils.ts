export const log = (...args: any[]) => <T>(data: T): T => {
  const logArgs = args.concat([data]);
  console.log(...logArgs);
  return data;
};

export const sleep = (milliseconds: number): Promise<number> => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};