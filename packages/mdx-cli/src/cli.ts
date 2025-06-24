#!/usr/bin/env node

import { Command } from "commander";
import { mkdirSync, readdirSync, statSync, writeFileSync, existsSync } from "fs";
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

// 서브메뉴 목록 가져오기
const getSubMenus = (projectPath: string, menu: string) => {
  const menuPath = join(projectPath, "content", menu);
  try {
    return readdirSync(menuPath)
      .filter((file) => statSync(join(menuPath, file)).isDirectory())
      .map((dir) => ({
        name: dir,
        value: dir,
      }));
  } catch (error) {
    return [];
  }
};

// 디렉토리 생성 유틸리티 함수
const createDirectory = (basePath: string, menu: string, submenu?: string) => {
  const paths = [basePath, "content", menu];
  if (submenu) {
    paths.push(submenu);
  }
  const dirPath = join(...paths);
  mkdirSync(dirPath, { recursive: true });
  return dirPath;
};

program.name("mdx-cli").description("MDX 파일과 메타데이터를 생성하는 CLI 도구").version("1.0.0");

program
  .command("create")
  .description("새로운 MDX 파일과 메타데이터를 생성합니다")
  .argument("[project]", "프로젝트 이름")
  .argument("[menu]", "메뉴 이름")
  .argument("[submenu]", "서브메뉴 이름 (선택사항)")
  .action(async (projectArg?: string, menuArg?: string, submenuArg?: string) => {
    try {
      let project: string;
      let menu: string;
      let submenu: string | undefined;

      // 1. 프로젝트 선택 또는 사용
      const projects = getProjects();
      if (projectArg && projects.includes(projectArg)) {
        project = projectArg;
      } else {
        const answer = await inquirer.prompt([
          {
            type: "list",
            name: "project",
            message: "프로젝트를 선택하세요:",
            choices: projects,
          },
        ]);
        project = answer.project;
      }

      const projectPath = join(process.cwd(), "apps", project);
      const menus = getMenus(projectPath);
      const menuValues = menus.map((m) => m.value);

      // 2. 메뉴 선택 또는 사용
      if (menuArg && menuValues.includes(menuArg)) {
        menu = menuArg;
      } else {
        const answer = await inquirer.prompt([
          {
            type: "list",
            name: "menu",
            message: "메뉴를 선택하세요:",
            choices: menus,
          },
        ]);
        menu = answer.menu;
      }

      // 3. 서브메뉴 확인 및 선택
      const submenus = getSubMenus(projectPath, menu);
      // 콩팥질환 강좌 메뉴에서만 서브메뉴 사용
      if (menu === "3.콩팥질환 강좌") {
        if (submenuArg) {
          // 서브메뉴가 지정된 경우
          submenu = submenuArg;
          createDirectory(projectPath, menu, submenu);
        } else {
          // 서브메뉴 선택
          const { selectedSubmenu } = await inquirer.prompt([
            {
              type: "list",
              name: "selectedSubmenu",
              message: "서브메뉴를 선택하세요:",
              choices: submenus,
            },
          ]);
          submenu = selectedSubmenu;
        }
      }

      // 4. 페이지 정보 입력
      const validateTitle = async (input: string) => {
        if (!input.length) return "제목을 입력해주세요.";
        if (input.includes("?")) return "제목에 물음표(?)를 포함할 수 없습니다.";

        const folderName = input.toLowerCase();
        const contentPath = [projectPath, "content", menu];
        if (submenu) {
          contentPath.push(submenu);
        }
        contentPath.push(folderName);

        const targetDir = join(...contentPath);
        const filePath = join(targetDir, "page.mdx");

        if (existsSync(filePath)) {
          return `이미 존재하는 페이지입니다: ${filePath}`;
        }

        return true;
      };

      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "title",
          message: "페이지 제목을 입력하세요:",
          validate: validateTitle,
        },
        {
          type: "input",
          name: "description",
          message: "페이지 설명을 입력하세요 (선택사항, 검색엔진 최적화 용도) :",
          validate: (input: string) => !input.includes("?"),
        },
        {
          type: "input",
          name: "keywords",
          message: "키워드를 쉼표로 구분하여 입력하세요 (선택사항, 검색엔진 최적화 용도) :",
        },
      ]);

      // 콩팥질환정보 메뉴인 경우 카테고리 선택
      let category: string | undefined;
      if (menu === "3.콩팥질환 강좌" && submenu === "2.콩팥질환 정보") {
        const categoryAnswer = await inquirer.prompt([
          {
            type: "list",
            name: "category",
            message: "카테고리를 선택하세요:",
            choices: [
              { name: "예방·관리", value: "예방·관리" },
              { name: "영양·식생활", value: "영양·식생활" },
              { name: "연구·통계", value: "연구·통계" },
            ],
          },
        ]);
        category = categoryAnswer.category;
      }

      // 게시판 메뉴인 경우 공지글 여부 확인
      let isPinned = false;
      if (menu === "4.게시판") {
        const pinnedAnswer = await inquirer.prompt([
          {
            type: "confirm",
            name: "pinned",
            message: "이 글을 공지글로 설정하시겠습니까?",
            default: false,
          },
        ]);
        isPinned = pinnedAnswer.pinned;
      }

      const keywords = answers.keywords
        ? answers.keywords
            .split(",")
            .map((k: string) => k.trim())
            .filter(Boolean)
        : [];

      const metadata = {
        title: answers.title,
        description: answers.description,
        keywords,
        other: {
          status: "ready",
          createdAt: new Date().toISOString(),
        },
        ...(category && { category }),
        ...(isPinned && { pinned: true }),
      };

      const content = `export const metadata = ${JSON.stringify(metadata, null, 2)};

# ${answers.title}

`;

      // 파일 경로 생성
      const folderName = answers.title.toLowerCase();
      const contentPath = [projectPath, "content", menu];
      if (submenu) {
        contentPath.push(submenu);
      }
      contentPath.push(folderName);

      const targetDir = join(...contentPath);
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
