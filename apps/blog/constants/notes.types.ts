export type Category = string;

export type Notes = {
  [category: string]: {
    [sub: string]: string[];
  };
};
