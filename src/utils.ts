export type Unary<T, U> = (a: T) => U;

/**
 * Composes functions left-to-right.
 * @param fs A variadic set of unary functions, that will be piped together
 * @param x The seed value to pipe into the first function.
 */
export function pipe<T1, T2, U>(
  f1: Unary<T1, T2>,
  f2: Unary<T2, U>
): Unary<T1, U>;
export function pipe<T1, T2, T3, U>(
  f1: Unary<T1, T2>,
  f2: Unary<T2, T3>,
  f3: Unary<T3, U>
): Unary<T1, U>;
export function pipe<T1, T2, T3, T4, U>(
  f1: Unary<T1, T2>,
  f2: Unary<T2, T3>,
  f3: Unary<T3, T4>,
  f4: Unary<T4, U>
): Unary<T1, U>;
export function pipe<T, U>(...fs: ((a: any) => any)[]) {
  return (x: T): U => reduce(pipeReducer)(x)(fs);
}

export const cons = <T>(x: T, xs: T[]): T[] => [x].concat(xs);

export const contains = <T>(x: T, xs: T[]): boolean => xs.indexOf(x) !== -1;

export const map = <T, U>(f: ((element: T) => U)) => (xs: T[]): U[] =>
  xs.map(f);

export const toPairs = <T, U extends keyof T>(obj: T): [U, T[U]][] => {
  const keys: U[] = Object.keys(obj) as U[];

  return map((key: U): [U, T[U]] => [key, obj[key]])(keys);
};

export const prop = <T, K extends keyof T>(key: K) => (object: T): T[K] =>
  object[key];

export const remove = <T>(x: T, xs: T[]): T[] => {
  const i = xs.indexOf(x);

  return i === -1 ? xs : [...xs.slice(0, i), ...xs.slice(i + 1)];
};

export const uniqueCons = <T>(x: T, xs: T[]): T[] =>
  contains(x, xs) ? xs : cons(x, xs);

export const identity = <T>(x: T): T => x;

export const find = <T>(f: ((element: T) => boolean), xs: T[]): T | null => {
  if (xs.length === 0) return null;

  const [head, ...tail] = xs;

  return f(head) ? head : find(f, tail);
};

/**
 * Apply f to each element in xs. The first time f returns a defined value, return that value.
 * @param f Mapping function
 * @param xs List
 * @returns The first defined return value from f
 */
export const findValue = <T, U>(f: ((element: T) => U), xs: T[]): U | null => {
  if (xs.length === 0) return null;

  const [head, ...tail] = xs;

  const value = f(head);

  return value ? value : findValue(f, tail);
};

export const exists = (x: any): boolean =>
  !(x === undefined || x === null || x === false);

export const compact = <T>(xs: (T | null)[]): T[] => xs.filter(exists) as T[];

export const has = <T, P extends keyof T>(prop: P, obj: T): T[P] =>
  Object.prototype.hasOwnProperty.call(obj, prop);

export const flatten = <T>(xss: T[][]): T[] => [].concat.apply([], xss);

export const flatMap = <T, U>(f: Unary<T, U[]>) => (xs: T[]): U[] =>
  pipe(
    map(f),
    flatten
  )(xs);

export const reduce = <T, U>(f: (acc: U, x: T) => U) => (acc: U) => (
  xs: T[]
): U => {
  if (xs.length === 0) return acc;

  const [head, ...tail] = xs;

  return reduce(f)(f(acc, head))(tail);
};

const pipeReducer = (acc: any, f: Unary<any, any>): any => f(acc);
