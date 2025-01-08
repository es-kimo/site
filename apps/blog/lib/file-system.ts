import fs from "fs";

export const getFolderNames = async (path: string) => {
  let folderNames: string[] = [];

  try {
    const items = await fs.promises.readdir(path, { withFileTypes: true });
    folderNames = items.filter((item) => item.isDirectory()).map((folder) => folder.name);
  } catch (e) {
    console.error("컨텐츠 경로가 잘못 되었습니다.", e);
  }

  return folderNames;
};
