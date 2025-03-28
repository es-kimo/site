import fs from "fs";

export const getFolderNames = async (path: string): Promise<string[]> => {
  try {
    const items = await fs.promises.readdir(path, { withFileTypes: true });
    return items.filter((item) => item.isDirectory()).map((folder) => folder.name);
  } catch (e) {
    console.error("경로가 잘못되었습니다.", e);
    return [];
  }
};

export const getFolderNamesSync = (path: string): string[] => {
  try {
    const items = fs.readdirSync(path, { withFileTypes: true });
    return items.filter((item) => item.isDirectory()).map((folder) => folder.name);
  } catch (e) {
    console.error("경로가 잘못되었습니다.", e);
    return [];
  }
};

export const getFileNames = async (path: string): Promise<string[]> => {
  try {
    const items = await fs.promises.readdir(path);
    return items;
  } catch (e) {
    console.error("경로가 잘못되었습니다.", e);
    return [];
  }
};

export const getFileNamesSync = (path: string): string[] => {
  try {
    const items = fs.readdirSync(path);
    return items;
  } catch (e) {
    console.error("경로가 잘못되었습니다.", e);
    return [];
  }
};

export const removeNumbering = (str: string) => str.split(".").pop() || "";
