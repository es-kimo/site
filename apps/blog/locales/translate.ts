import { localeResources } from "@/locales/resources";

export const t = (key: string) => {
  return localeResources.ko.translation[key];
};
