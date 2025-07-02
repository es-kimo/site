import { promises as fs } from "fs";
import { join, dirname } from "path";

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  const dir = dirname(filePath);
  await ensureDirectoryExists(dir);
  await fs.writeFile(filePath, content, "utf-8");
}

export async function saveMDXFile(outputDir: string, slug: string, content: string): Promise<string> {
  const filePath = join(outputDir, `${slug}.mdx`);
  await writeFile(filePath, content);
  return filePath;
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
