export type Heading = {
  value: string;
  depth: number;
  id: string;
};

export type SubCategoryData = {
  subCategory: string;
  hasSlug: boolean;
  headings: Heading[] | null;
};

export type CategoryData = {
  category: string;
  subCategories: SubCategoryData[];
};

export type NavigationData = {
  categories: CategoryData[];
};
