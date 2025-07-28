import { paragraphSchema } from "./blocks/paragraph";
import { headingSchema } from "./blocks/heading";
import { listSchema } from "./blocks/list";
import { imageSchema } from "./blocks/image";
import { tableSchema } from "./blocks/table";
import { dividerSchema } from "./blocks/divider";
import { embedSchema } from "./blocks/embed";
import { faqItemSchema } from "./blocks/faq_item";
import { accordionGroupSchema } from "./blocks/accordion_group";
import { ctaSchema } from "./blocks/cta";
import { infoCardSchema } from "./blocks/info_card";
import { sectionSchema } from "./blocks/section";
import { columnsSchema } from "./blocks/columns";

export const blockSchemas = {
  paragraph: paragraphSchema,
  heading: headingSchema,
  list: listSchema,
  image: imageSchema,
  table: tableSchema,
  divider: dividerSchema,
  embed: embedSchema,
  faq_item: faqItemSchema,
  accordion_group: accordionGroupSchema,
  cta: ctaSchema,
  info_card: infoCardSchema,
  section: sectionSchema,
  columns: columnsSchema,
} as const;

export type BlockType = keyof typeof blockSchemas;

// children 허용 타입(실제 children 필드 사용)
export const containerTypesUsingChildren = new Set<BlockType>(["section"]);

// props 내부에 BlockTree가 있는 타입
export const typesWithNestedTreesInProps = new Set<BlockType>(["faq_item", "accordion_group", "info_card", "columns"]);
