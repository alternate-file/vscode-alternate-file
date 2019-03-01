/**
 * Defines a Result type that can be either {ok: data} or {error: message}.
 * @module Result
 */

/**
 * Represents the result of an operation that could succeed or fail.
 */
export type t<OkData, ErrorMessage> = Ok<OkData> | Error<ErrorMessage>;

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
export const isOk = (result: t<any, any>): result is Ok<any> =>
  (result as Ok<any>).ok !== undefined;

/**
 * Type guard to check if a Result is an Error
 * @param result - The result to check
 */
export const isError = (result: t<any, any>): result is Error<any> =>
  (result as Error<any>).error !== undefined;

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
 * Type guard to check if an object is a Result.
 * @param result - The object to check
 */
export const isResult = (result: t<any, any> | any): result is t<any, any> =>
  isOk(result) || isError(result);

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
) => (result: t<OkData, ErrorMessage>): t<OkOutput, ErrorMessage> => {
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
export const flatMapOk = <OkData, ErrorMessage, OkOutput, ErrorOutput>(
  f: (ok: OkData) => t<OkOutput, ErrorOutput>
) => (
  result: t<OkData, ErrorMessage>
): t<OkOutput, ErrorMessage | ErrorOutput> => {
  if (isError(result)) {
    return result;
  }

  return f(result.ok);
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
) => (result: t<OkData, ErrorMessage>): t<OkData, ErrorOutput> => {
  if (isOk(result)) {
    return result;
  }

  return { error: f(result.error) };
};

/**
 * Chains together operations that may succeed or fail
 *
 * Takes a Result and a mapping function.
 * If the result is an Error, applies the function to the data.
 * If the result is an Ok, passes the Result through unchanged.
 *
 * @param f - the function to run on the error message
 * @param result - The result to match against
 * @returns - The Result from function f or the Ok result
 */
export const flatMapError = <OkData, ErrorMessage, OkOutput, ErrorOutput>(
  f: (ok: ErrorMessage) => t<OkOutput, ErrorOutput>
) => (result: t<OkData, ErrorMessage>): t<OkData | OkOutput, ErrorOutput> => {
  if (isOk(result)) {
    return result;
  }

  return f(result.error);
};

/**
 * Takes a result, and runs either an ifOk or ifError function on it.
 * @param ifOk - Function to run if the result is an Ok
 * @param ifError - Function to run if the result is an Error
 * @param result - Result to match against
 * @returns The return value of the function that gets run.
 */
export const either = <OkData, ErrorMessage, OkOutput, ErrorOutput>(
  ifOk: (ok: OkData) => OkOutput,
  ifError: (error: ErrorMessage) => ErrorOutput,
  result: t<OkData, ErrorMessage>
): OkOutput | ErrorOutput => {
  if (isOk(result)) {
    return ifOk(result.ok);
  }
  if (isError(result)) {
    return ifError(result.error);
  }
  throw new Error("invalid result");
};
