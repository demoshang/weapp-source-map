function filterUndefined<T>(value?: T): value is T {
  return value !== undefined;
}

function filterNull<T>(value?: T): value is T {
  return value !== null;
}

function filterNil<T>(value?: T): value is Exclude<T, null | undefined> {
  return value !== null && value !== undefined;
}

export { filterUndefined, filterNull, filterNil };
