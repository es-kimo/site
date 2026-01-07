export const formatPostDate = (lastModified: string, format: "dot" | "korean" = "dot") => {
  const lastModifiedDate = new Date(lastModified);

  if (format === "korean") {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(lastModifiedDate);
  }

  // default: dot format (YYYY.MM.DD)
  const year = lastModifiedDate.getFullYear();
  const month = String(lastModifiedDate.getMonth() + 1).padStart(2, "0");
  const day = String(lastModifiedDate.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};
