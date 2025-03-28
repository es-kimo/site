export const decodeURIS = (...uris: (string | undefined)[]) => {
  return uris.map((uri) => uri && decodeURI(uri));
};
