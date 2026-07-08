export function merge<T extends Record<string, any>>(...objects: Partial<T>[]) {
  return Object.assign({}, ...objects) as T;
}
