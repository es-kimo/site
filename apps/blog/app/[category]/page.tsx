import { categories } from "@/constants/categories";

export async function generateStaticParams() {
  return categories.map((category) => ({
    category,
  }));
}

export default async function Page() {
  return <></>;
}
