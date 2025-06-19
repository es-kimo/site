interface GitHubContentItem {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
  url: string;
  git_url: string;
  html_url: string;
  download_url: string | null;
}

interface GitHubApiResponse {
  type: string;
  size: number;
  name: string;
  path: string;
  content?: string;
  encoding?: string;
  url: string;
  git_url: string;
  html_url: string;
  download_url: string | null;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

// 블로그 렌더링을 위한 새로운 타입들
interface Course {
  name: string;
  path: string;
  readmeContent: string;
  readmeUrl: string;
}

interface Lecture {
  name: string;
  path: string;
  topics: string[];
  courses: Course[];
}

interface ArchiveStructure {
  lectures: Lecture[];
}

export async function getOssuLectureList(): Promise<string[]> {
  try {
    const owner = "es-kimo";
    const repo = "computer-science";
    const path = "archive";
    const branch = "es-kimo";

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Mozilla/5.0 (compatible; MyApp/1.0)",
      },
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data: GitHubApiResponse[] = await response.json();

    // depth1 폴더만 필터링 (type이 "dir"인 항목들)
    const folders = data.filter((item) => item.type === "dir").map((item) => item.name);

    return folders;
  } catch (error) {
    console.error("Error fetching archive folders:", error);
    return [];
  }
}

// 특정 폴더의 내용을 가져오는 함수 (필요시 사용)
export async function getFolderContents(folderName: string): Promise<GitHubContentItem[]> {
  try {
    const owner = "es-kimo";
    const repo = "computer-science";
    const path = `archive/${folderName}`;
    const branch = "es-kimo";

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Mozilla/5.0 (compatible; MyApp/1.0)",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data: GitHubApiResponse[] = await response.json();

    return data.map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type as "file" | "dir",
      size: item.size,
      url: item.url,
      git_url: item.git_url,
      html_url: item.html_url,
      download_url: item.download_url,
    }));
  } catch (error) {
    console.error(`Error fetching folder contents for ${folderName}:`, error);
    return [];
  }
}

// 특정 파일의 내용을 가져오는 함수
export async function getFileContent(filePath: string): Promise<string> {
  try {
    const owner = "es-kimo";
    const repo = "computer-science";
    const branch = "es-kimo";

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Mozilla/5.0 (compatible; MyApp/1.0)",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data: GitHubApiResponse = await response.json();

    if (data.content && data.encoding === "base64") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }

    return "";
  } catch (error) {
    console.error(`Error fetching file content for ${filePath}:`, error);
    return "";
  }
}

// 강의의 토픽을 가져오는 함수
export async function getLectureTopics(lectureName: string): Promise<string[]> {
  try {
    const topicContent = await getFileContent(`archive/${lectureName}/.topics`);
    return topicContent.split("\n").filter((topic) => topic.trim() !== "");
  } catch (error) {
    console.error(`Error fetching topics for lecture ${lectureName}:`, error);
    return [];
  }
}

// 강의의 코스들을 가져오는 함수
export async function getLectureCourses(lectureName: string): Promise<Course[]> {
  try {
    const courses: Course[] = [];
    const lectureContents = await getFolderContents(lectureName);

    // 강의 폴더 내의 하위 폴더들 (코스들)
    const courseFolders = lectureContents.filter((item) => item.type === "dir");

    for (const courseFolder of courseFolders) {
      const courseContents = await getFolderContents(`${lectureName}/${courseFolder.name}`);
      const readmeFile = courseContents.find((item) => item.name === "README.md");

      if (readmeFile) {
        const readmeContent = await getFileContent(readmeFile.path);
        courses.push({
          name: courseFolder.name,
          path: courseFolder.path,
          readmeContent,
          readmeUrl: readmeFile.html_url,
        });
      }
    }

    return courses;
  } catch (error) {
    console.error(`Error fetching courses for lecture ${lectureName}:`, error);
    return [];
  }
}

// 전체 archive 구조를 가져오는 메인 함수
export async function getArchiveStructure(): Promise<ArchiveStructure> {
  try {
    const lectures: Lecture[] = [];
    const lectureNames = await getOssuLectureList();

    for (const lectureName of lectureNames) {
      const [topics, courses] = await Promise.all([getLectureTopics(lectureName), getLectureCourses(lectureName)]);

      lectures.push({
        name: lectureName,
        path: `archive/${lectureName}`,
        topics,
        courses,
      });
    }

    return { lectures };
  } catch (error) {
    console.error("Error fetching archive structure:", error);
    return { lectures: [] };
  }
}

// 특정 강의의 구조만 가져오는 함수
export async function getLectureStructure(lectureName: string): Promise<Lecture | null> {
  try {
    const [topics, courses] = await Promise.all([getLectureTopics(lectureName), getLectureCourses(lectureName)]);

    return {
      name: lectureName,
      path: `archive/${lectureName}`,
      topics,
      courses,
    };
  } catch (error) {
    console.error(`Error fetching lecture structure for ${lectureName}:`, error);
    return null;
  }
}

export async function getCourse(lectureName: string, courseName: string): Promise<Course | null> {
  try {
    const courses = await getLectureCourses(lectureName);
    const course = courses.find((course) => course.name === courseName);

    if (!course) {
      throw new Error(`Course ${courseName} not found in lecture ${lectureName}`);
    }

    return course;
  } catch (error) {
    console.error(`Error fetching readme for course ${courseName} in lecture ${lectureName}:`, error);
    return null;
  }
}
