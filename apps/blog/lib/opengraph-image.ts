export const fetchOgImage = async (url: string) => {
  let ogImage = null;

  try {
    const response = await fetch(url);
    const html = await response.text();

    // TODO: 최적화
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"\/?>/);
    console.log("ogImageMatch", ogImageMatch);
    if (ogImageMatch && ogImageMatch[1]) {
      ogImage = ogImageMatch[1];
      console.log("ogImage", ogImage);
    }
  } catch (error) {
    console.error("OG 이미지를 가져오는 과정에서 에러가 발생했습니다.", error);
  }

  return ogImage;
};
