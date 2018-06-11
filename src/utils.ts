export const cons = <T>(x: T, xs: T[]): T[] => [x].concat(xs);

export const contains = <T>(x: T, xs: T[]): boolean => xs.indexOf(x) !== -1;

export const map = <T, U>(f: ((element: T) => U)) => (xs: T[]): U[] =>
  xs.map(f);

export const prop = <T, K extends keyof T>(key: K) => (object: T): T[K] =>
  object[key];

export const remove = <T>(x: T, xs: T[]): T[] => {
  const i = xs.indexOf(x);

  return i === -1 ? xs : [...xs.slice(0, i), ...xs.slice(i + 1)];
};

export const uniqueCons = <T>(x: T, xs: T[]): T[] =>
  contains(x, xs) ? xs : cons(x, xs);
