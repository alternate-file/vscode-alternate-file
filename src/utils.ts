export const cons = <T>(x: T, xs: T[]): T[] => [x].concat(xs);

export const contains = <T>(x: T, xs: T[]): boolean => xs.indexOf(x) !== -1;

export const map = <T, U>(f: (element: T) => U) => (xs: T[]): U[] => xs.map(f);

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

export const find = <T>(f: (element: T) => boolean, xs: T[]): T | null => {
  if (xs.length === 0) return null;

  const [head, ...tail] = xs;

  return f(head) ? head : find(f, tail);
};

export const findValue = <T, U>(f: (element: T) => U, xs: T[]): U | null => {
  if (xs.length === 0) return null;

  const [head, ...tail] = xs;

  const value = f(head);

  return value ? value : findValue(f, tail);
};

export const exists = (x: any): boolean =>
  !(x === undefined || x === null || x === false);

export const compact = <T>(xs: (T | null)[]): T[] => xs.filter(exists) as T[];

export const flatten = <T>(xss: T[][]): T[] =>
  ([] as T[]).concat.apply([], xss);
