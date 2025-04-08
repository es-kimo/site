import { formatPostDate } from "@workspace/common/lib/date";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@workspace/ui/components/carousel";
import { cn } from "@workspace/ui/lib/utils";
import { cva } from "class-variance-authority";
import type { MDXComponents } from "mdx/types";
import Image, { ImageProps } from "next/image";
import { Children, isValidElement } from "react";

const gridCn = ["", "", "sm:grid-cols-2", "sm:grid-cols-3", "sm:grid-cols-4"];

const imageVariants = cva("w-11/12 mx-auto my-5", {
  variants: {
    size: {
      default: "sm:w-4/5 sm:my-10",
      full: "",
      xs: "w-[130px] mx-[initial]",
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
    h2: ({ children }) => <h2 className="mt-10 scroll-m-20 border-b pb-2 text-2xl font-medium tracking-tight first:mt-0 text-primary">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-8 scroll-m-20 text-xl font-semibold tracking-tight text-primary">{children}</h3>,
    h4: ({ children }) => <h4 className="mt-8 scroll-m-20 text-lg font-semibold tracking-tight text-primary">{children}</h4>,
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
    Grid({ children, grid, ...props }) {
      const gridCols = grid ? gridCn[Math.min(4, grid)] : "sm:grid-cols-2";

      return (
        <div {...props} className={`grid ${gridCols}`}>
          {children}
        </div>
      );
    },
    Carousel({ children, ...props }) {
      return (
        <Carousel className="w-4/6 sm:w-11/12 mx-auto" {...props}>
          <CarouselContent>{Children.map(children, (child, index) => (isValidElement(child) ? <CarouselItem key={index}>{child}</CarouselItem> : null))}</CarouselContent>
          <CarouselPrevious className="w-12 h-12 border-primary" />
          <CarouselNext className="w-12 h-12 border-primary" />
        </Carousel>
      );
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
    ...components,
  };
}
