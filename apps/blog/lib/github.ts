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
