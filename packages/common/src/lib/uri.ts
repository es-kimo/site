type Decoded<T> = {
  [K in keyof T]: T[K] extends string ? string : undefined;
};

export function decodeURIS<const T extends readonly (string | undefined)[]>(...uris: T): Decoded<T> {
  const result = uris.map((uri) => (uri !== undefined ? decodeURI(uri) : undefined));
  return result as Decoded<T>;
}
