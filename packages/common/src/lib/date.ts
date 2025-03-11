export const formatPostDate = (lastModified: string) => {
  const lastModifiedDate = new Date(lastModified);
  const year = lastModifiedDate.getFullYear();
  const month = String(lastModifiedDate.getMonth() + 1).padStart(2, "0");
  const day = String(lastModifiedDate.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};
