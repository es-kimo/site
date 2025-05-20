#!/usr/bin/env node

import { Command } from "commander";
import { mkdirSync, readdirSync, statSync, writeFileSync } from "fs";
import inquirer from "inquirer";
import { join } from "path";

const program = new Command();

// 프로젝트 목록 가져오기
const getProjects = () => {
  const appsDir = join(process.cwd(), "apps");
  return readdirSync(appsDir).filter((file) => statSync(join(appsDir, file)).isDirectory());
};

// 메뉴 목록 가져오기
const getMenus = (projectPath: string) => {
  const contentDir = join(projectPath, "content");
  return readdirSync(contentDir)
    .filter((file) => statSync(join(contentDir, file)).isDirectory())
    .map((dir) => ({
      name: dir,
      value: dir,
    }));
};

program.name("mdx-cli").description("MDX 파일과 메타데이터를 생성하는 CLI 도구").version("1.0.0");

program
  .command("create")
  .description("새로운 MDX 파일과 메타데이터를 생성합니다")
  .action(async () => {
    try {
      // 1. 프로젝트 선택
      const projects = getProjects();
      const { project } = await inquirer.prompt([
        {
          type: "list",
          name: "project",
          message: "프로젝트를 선택하세요:",
          choices: projects,
        },
      ]);

      const projectPath = join(process.cwd(), "apps", project);
      const menus = getMenus(projectPath);

      // 2. 메뉴 선택
      const { menu } = await inquirer.prompt([
        {
          type: "list",
          name: "menu",
          message: "메뉴를 선택하세요:",
          choices: menus,
        },
      ]);

      // 3. 페이지 정보 입력
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "title",
          message: "페이지 제목을 입력하세요:",
          validate: (input: string) => input.length > 0,
        },
        {
          type: "input",
          name: "description",
          message: "페이지 설명을 입력하세요:",
          validate: (input: string) => input.length > 0,
        },
        {
          type: "input",
          name: "keywords",
          message: "키워드를 쉼표로 구분하여 입력하세요:",
          transform: (input: string) => input.split(",").map((k: string) => k.trim()),
        },
        {
          type: "input",
          name: "canonical",
          message: "canonical URL을 입력하세요 (선택사항):",
          default: "",
        },
      ]);

      const metadata = {
        title: answers.title,
        description: answers.description,
        keywords: answers.keywords,
        ...(answers.canonical && {
          alternate: {
            canonical: answers.canonical,
          },
        }),
        other: {
          status: "ready",
          createdAt: new Date().toISOString(),
        },
      };

      const content = `export const metadata = ${JSON.stringify(metadata, null, 2)};

# ${answers.title}

`;

      // 파일 경로 생성
      const folderName = answers.title.toLowerCase().replace(/\s+/g, "-");
      const targetDir = join(projectPath, "content", menu, folderName);
      const filePath = join(targetDir, "page.mdx");

      // 디렉토리 생성
      mkdirSync(targetDir, { recursive: true });

      // 파일 생성
      writeFileSync(filePath, content);
      console.log(`✅ ${filePath} 파일이 생성되었습니다.`);
    } catch (error) {
      console.error("❌ 오류가 발생했습니다:", error);
      process.exit(1);
    }
  });

program.parse(process.argv);
