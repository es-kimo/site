import { formatPostDate } from "@workspace/common/lib/date";
import { cn } from "@workspace/ui/lib/utils";
import { cva } from "class-variance-authority";
import { Link as LinkIcon } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import dynamic from "next/dynamic";
import Image, { ImageProps } from "next/image";
import Link from "next/link";

const NaverMapWrapper = dynamic(() => import("./components/NaverMapWrapper"));
const ImageLightbox = dynamic(() => import("./components/ImageLightbox"));
const TheCarousel = dynamic(() => import("./components/TheCarousel"));

const gridCn = ["", "", "sm:grid-cols-2", "grid-cols-2 md:grid-cols-3", "sm:grid-cols-4"];

const imageVariants = cva("w-11/12 mx-auto my-5", {
  variants: {
    size: {
      default: "sm:w-4/5 sm:my-10",
      full: "",
      xs: "w-[130px] aspect-square object-cover mx-[initial]",
      icon: "w-[180px] aspect-square object-cover mx-[initial]",
      square: "w-full aspect-square object-cover mx-[initial]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children, ...props }) => (
      <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight animate-fadein py-2" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children }) => {
      const id = children?.toString().toLowerCase().replace(/\s+/g, "-");
      return (
        <h2 id={id} className="mt-10 scroll-m-20 border-b pb-2 text-2xl font-medium tracking-tight first:mt-0 text-primary">
          <Link href={`#${id}`} aria-label="Anchor link" className="inline-flex items-center gap-2 group">
            {children}
            <LinkIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </h2>
      );
    },
    h3: ({ children }) => {
      const id = children?.toString().toLowerCase().replace(/\s+/g, "-");
      return (
        <h3 id={id} className="mt-8 scroll-m-20 text-xl font-semibold tracking-tight text-primary">
          <Link href={`#${id}`} aria-label="Anchor link" className="inline-flex items-center gap-2 group">
            {children}
            <LinkIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </h3>
      );
    },
    h4: ({ children }) => {
      const id = children?.toString().toLowerCase().replace(/\s+/g, "-");
      return (
        <h4 id={id} className="mt-8 scroll-m-20 text-lg font-semibold tracking-tight text-primary">
          <Link href={`#${id}`} aria-label="Anchor link" className="inline-flex items-center gap-2 group">
            {children}
            <LinkIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </h4>
      );
    },
    a: ({ children, ...props }) => (
      <a {...props} className="text-primary underline">
        {children}
      </a>
    ),
    p: ({ children }) => <p className="readability [&:not(:first-child)]:mt-6">{children}</p>,
    blockquote: ({ children }) => <blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>,
    table: ({ children }) => (
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full">{children}</table>
      </div>
    ),
    tbody(properties) {
      return <tbody {...properties}></tbody>;
    },
    thead(properties) {
      return <thead {...properties}></thead>;
    },
    tr(properties) {
      return <tr {...properties} className="m-0 border-t p-0 even:bg-muted"></tr>;
    },
    th(properties) {
      return <th {...properties} className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"></th>;
    },
    td(properties) {
      return <td {...properties} className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"></td>;
    },
    ul(properties) {
      return <ul {...properties} className="my-4 ml-6 list-disc [&>li]:mt-2"></ul>;
    },
    ol(properties) {
      return <ol {...properties} className="my-4 ml-6 list-decimal [&>li]:mt-2"></ol>;
    },
    li(properties) {
      return <li {...properties} className="readability"></li>;
    },
    code(properties) {
      return <code {...properties} className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"></code>;
    },
    pre(properties) {
      return <pre {...properties}></pre>;
    },
    Image: ({ size, className, ...props }) => {
      return (
        <ImageLightbox grid={1} preserveSize>
          <Image {...(props as ImageProps)} className={cn(imageVariants({ size, className }))} />
        </ImageLightbox>
      );
    },
    ImageWithoutLightbox: ({ size = "full", className, ...props }) => {
      return <Image {...(props as ImageProps)} className={cn(imageVariants({ size, className }))} />;
    },
    Lead(properties) {
      return <p {...properties} className="text-xl text-muted-foreground"></p>;
    },
    Large(properties) {
      return <div {...properties} className="text-lg font-semibold"></div>;
    },
    Small(properties) {
      return <small {...properties} className="text-sm font-medium leading-none"></small>;
    },
    Muted(properties) {
      return <p {...properties} className="text-sm text-muted-foreground"></p>;
    },
    Callout({ children, ...properties }) {
      return (
        <div {...properties} className="mt-6 rounded p-4 bg-muted flex">
          <span className="mr-3">💡</span>
          {children}
        </div>
      );
    },
    PostDate({ children, ...properties }) {
      return (
        <div {...properties} className="text-muted-foreground mt-2 text-sm text-right border-b pb-2">
          작성일: {formatPostDate(children)}
        </div>
      );
    },
    Grid({ children, grid, preserveSize, className, ...props }) {
      const gridCols = grid ? gridCn[Math.min(4, grid)] : "sm:grid-cols-2";

      return (
        <div {...props} className={cn(`grid ${gridCols} ${!preserveSize && "[&>img]:aspect-square [&>img]:object-cover"}`, className)}>
          {children}
        </div>
      );
    },
    Carousel({ children }) {
      return <TheCarousel>{children}</TheCarousel>;
    },
    DescriptionList({ children, ...props }) {
      return (
        <dl {...props} className="flex flex-col">
          {children}
        </dl>
      );
    },
    DescriptionRow({ children, ...props }) {
      return (
        <div {...props} className="grid gap-2 py-4 sm:grid-cols-[0.2fr_0.8fr] sm:py-8 border-t">
          {children}
        </div>
      );
    },
    DescriptionTerm({ children, ...props }) {
      return (
        <dt {...props} className="font-bold">
          {children}
        </dt>
      );
    },
    DescriptionDetails({ children, ...props }) {
      return (
        <dd {...props} className="flex flex-col gap-2">
          {children}
        </dd>
      );
    },
    Video({ src, ...props }) {
      return (
        <iframe
          width="100%"
          src={src}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="mt-4 aspect-video"
          {...props}
        ></iframe>
      );
    },
    NaverMap({ zoom, width }) {
      return <NaverMapWrapper lat={37.5512848} lng={126.8487854} zoom={zoom} width={width} />;
    },
    ImageLightbox({ children, grid, preserveSize, ...props }) {
      return (
        <ImageLightbox grid={grid} preserveSize={preserveSize} {...props}>
          {children}
        </ImageLightbox>
      );
    },
    Link({ children, className, ...props }) {
      return (
        <Link {...props} className={cn("text-primary underline my-2", className)}>
          {children}
        </Link>
      );
    },
    ...components,
  };
}
