/**
 * Defines a Result type that can be either {ok: data} or {error: message}.
 * @module Result
 */

/**
 * Represents the result of an operation that could succeed or fail.
 */
export type Result<OkData, ErrorMessage> = Ok<OkData> | Error<ErrorMessage>;

export type P<OkData, ErrorMessage> = Promise<Result<OkData, ErrorMessage>>;

/**
 * Represents the result of a successful operation.
 */
export interface Ok<Data> {
  ok: Data;
}

/**
 * Represents the result of an unsuccessful operation.
 */
export interface Error<Message> {
  error: Message;
}

/**
 * Type guard to check if a Result is Ok
 * @param result - The result to check
 */
export const isOk = (result: Result<any, any>): result is Ok<any> =>
  (result as Ok<any>).ok !== undefined;

/**
 * Type guard to check if a Result is an Error
 * @param result - The result to check
 */
export const isError = (result: Result<any, any>): result is Error<any> =>
  (result as Error<any>).error !== undefined;

/**
 * Type guard to check if an object is a Result.
 * @param result - The object to check
 */
export const isResult = (
  result: Result<any, any> | any
): result is Result<any, any> => isOk(result) || isError(result);

/**
 * Wraps data in an Ok.
 * @param data The success payload
 */
export const ok = <T>(data: T): Ok<T> => ({ ok: data });

/**
 * Wraps a message in an Error.
 * @param data The success payload
 */
export const error = <T>(message: T): Error<T> => ({ error: message });

/**
 * Edits a value that's wrapped in an {ok: data}
 *
 * Takes a Result and a mapping function.
 * If the result is an Ok, applies the function to the data.
 * If the result is an Error, passes the Result through unchanged.
 *
 * Wraps the return value of f in an {ok: new_data}.
 * @param f - the function to run on the ok data
 * @param result - The result to match against
 */
export const mapOk = <OkData, ErrorMessage, OkOutput>(
  f: (ok: OkData) => OkOutput
) => (result: Result<OkData, ErrorMessage>): Result<OkOutput, ErrorMessage> => {
  if (isError(result)) {
    return result;
  }

  return { ok: f(result.ok) };
};

/**
 * Chains together operations that may succeed or fail
 *
 * Takes a Result and a mapping function.
 * If the result is an Ok, applies the function to the data.
 * If the result is an Error, passes the Result through unchanged.
 *
 * @param f - the function to run on the ok data
 * @param result - The result to match against
 * @returns - The Result from function f or the Error
 */
export const chainOk = <OkData, ErrorMessage, OkOutput, ErrorOutput>(
  f: (ok: OkData) => Result<OkOutput, ErrorOutput>
) => (
  result: Result<OkData, ErrorMessage>
): Result<OkOutput, ErrorMessage | ErrorOutput> => {
  if (isError(result)) {
    return result;
  }

  return f(result.ok);
};

/**
 * Chains together async operations that may succeed or fail
 *
 * Takes a Result and a mapping function.
 * If the result is an Ok, applies the function to the data.
 * If the result is an Error, passes the Result through unchanged.
 *
 * @param f - the function to run on the ok data
 * @param result - The result to match against
 * @returns - The Result from function f or the Error
 */
export const asyncChainOk = <OkData, ErrorMessage, OkOutput, ErrorOutput>(
  f: (ok: OkData) => P<OkOutput, ErrorOutput>
) => async (
  result: Result<OkData, ErrorMessage>
): P<OkOutput, ErrorMessage | ErrorOutput> => {
  if (isError(result)) {
    return result;
  }

  return f(result.ok);
};

/**
 * Replaces a value that's wrapped in an {ok: data}
 * Useful if you don't care about the data, just the fact that previous call succeeded.
 *
 * Takes a Result and a mapping function.
 * If the result is an Error, applies the function to the message.
 * If the result is an Ok, passes the Result through unchanged.
 *
 * It wraps the return value in an {error: new_message}.
 * @param f - the function to run on the ok data
 * @param result - The result to match against
 */
export const replaceOk = <OkData, ErrorMessage, OkOutput>(
  newData: OkOutput
) => (result: Result<OkData, ErrorMessage>): Result<OkOutput, ErrorMessage> => {
  if (isError(result)) {
    return result;
  }

  return ok(newData);
};

/**
 * Edits a value that's wrapped in an {error: data}
 *
 * Takes a Result and a mapping function.
 * If the result is an Error, applies the function to the message.
 * If the result is an Ok, passes the Result through unchanged.
 *
 * It wraps the return value in an {error: new_message}.
 * @param f - the function to run on the ok data
 * @param result - The result to match against
 */
export const mapError = <OkData, ErrorMessage, ErrorOutput>(
  f: (error: ErrorMessage) => ErrorOutput
) => (result: Result<OkData, ErrorMessage>): Result<OkData, ErrorOutput> => {
  if (isOk(result)) {
    return result;
  }

  return { error: f(result.error) };
};

/**
 * Chains together operations that may succeed or fail
 *
 * Takes a Result and a mapping function.
 * If the result is an Error, applies the function to the data and returns the new result.
 * If the result is an Ok, passes the Result through unchanged.
 *
 * @param f - the function to run on the error message
 * @param result - The result to match against
 * @returns - The Result from function f or the Ok result
 */
export const chainError = <OkData, ErrorMessage, OkOutput, ErrorOutput>(
  f: (ok: ErrorMessage) => Result<OkOutput, ErrorOutput>
) => (
  result: Result<OkData, ErrorMessage>
): Result<OkData | OkOutput, ErrorOutput> => {
  if (isOk(result)) {
    return result;
  }

  return f(result.error);
};

/**
 * Chains together async operations that may succeed or fail
 *
 * Takes a Result and a mapping function.
 * If the result is an Error, applies the function to the data and returns the new promise-wrapped result.
 * If the result is an Ok, passes the Result through unchanged.
 *
 * @param f - the function to run on the error message
 * @param result - The result to match against
 * @returns - The Result from function f or the Ok result
 */
export const asyncChainError = <OkData, ErrorMessage, OkOutput, ErrorOutput>(
  f: (ok: ErrorMessage) => P<OkOutput, ErrorOutput>
) => async (
  result: Result<OkData, ErrorMessage>
): P<OkData | OkOutput, ErrorOutput> => {
  if (isOk(result)) {
    return result;
  }

  return f(result.error);
};

/**
 * Replaces a value that's wrapped in an {error: data}
 * Useful if you don't care about the data, just the fact that previous call failed.
 *
 * Takes a Result and a mapping function.
 * If the result is an Error, applies the function to the message.
 * If the result is an Ok, passes the Result through unchanged.
 *
 * It wraps the return value in an {error: new_message}.
 * @param f - the function to run on the ok data
 * @param result - The result to match against
 */
export const replaceError = <OkData, ErrorMessage, ErrorOutput>(
  newError: ErrorOutput
) => (result: Result<OkData, ErrorMessage>): Result<OkData, ErrorOutput> => {
  if (isOk(result)) {
    return result;
  }

  return error(newError);
};

/**
 * Takes a result, and runs either an ifOk or ifError function on it.
 * @param ifOk - Function to run if the result is an Ok
 * @param ifError - Function to run if the result is an Error
 * @param result - Result to match against
 * @returns The return value of the function that gets run.
 */
export const either = <OkData, ErrorMessage, OkOutput, ErrorOutput>(
  result: Result<OkData, ErrorMessage>,
  ifOk: (ok: OkData) => OkOutput,
  ifError: (error: ErrorMessage) => ErrorOutput
): OkOutput | ErrorOutput => {
  if (isOk(result)) {
    return ifOk(result.ok);
  }
  if (isError(result)) {
    return ifError(result.error);
  }
  throw new Error("invalid result");
};

/**
 * Converts a result to a boolean.
 * @param result
 * @returns true if Ok, false if Error
 */
export const toBoolean = (result: Result<any, any>): boolean =>
  isOk(result) ? true : false;

export const firstOk = <OkData>(
  results: Result<OkData, any>[]
): Result<OkData, null> => results.find(isOk) || error(null);

/**
 * Awaits a promise, and returns a result based on the outcome
 * @param promise
 * @returns Ok if the promise resolved, Error if it was rejected.
 */
export const fromPromise = <OkData, ErrorMessage>(
  promise: Promise<OkData>
): P<OkData, ErrorMessage> =>
  promise
    .then((data: OkData) => ({
      ok: data
    }))
    .catch((message: ErrorMessage) => ({
      error: message
    }));

/**
 * Converts a function that returns a promise to one that always resolved to a Result
 * @param f A function that returns a promise
 * @returns a resolved Ok if the the promise resolved, a resolved Error if the promise was rejected.
 */
export const resultify = <Args extends any[], OkData, ErrorMessage>(
  f: (...args: Args) => Promise<OkData>
) => (...args: Args): P<OkData, ErrorMessage> => fromPromise(f(...args));
