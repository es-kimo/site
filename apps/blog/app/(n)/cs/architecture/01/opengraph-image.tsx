import { generateOGImageData } from "@/components/opengraph-image";

const title = "컴퓨터 구조 시작하기";
const { Image, alt, contentType, size } = generateOGImageData({ title, alt: title });

export default Image;
export { alt, contentType, size };
