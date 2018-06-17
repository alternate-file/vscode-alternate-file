export interface t<O, E> {
  ok?: O;
  error?: E;
}

export interface Ok<T> {
  ok: T;
}

export interface Error<T> {
  error: T;
}

export const isOk = <T>(result: t<T, any>): result is Ok<T> =>
  Boolean(result.ok);
export const isError = <T>(result: t<any, T>): result is Error<T> =>
  Boolean(result.error);
export const either = <O, E, T, U>(
  ifOk: ((ok: O) => T),
  ifError: ((error: E) => U),
  result: t<O, E>
): T | U => {
  if (isOk(result)) {
    return ifOk(result.ok);
  }
  if (isError(result)) {
    return ifError(result.error);
  }
  throw new Error("invalid result");
};
