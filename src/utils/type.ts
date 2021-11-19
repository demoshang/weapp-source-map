type UndefinedKeys<T> = { [K in keyof T]-?: undefined extends T[K] ? K : never }[keyof T];

type ExcludeObjectUndefined<
  T extends { [K: string]: any } | undefined,
  M extends UndefinedKeys<T>,
> = Omit<Exclude<T, undefined>, M> & {
  [K in M]: Exclude<T[K], undefined>;
};

export type { UndefinedKeys, ExcludeObjectUndefined };
