"use client";

import { useState, useEffect } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
} from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";
import { Code2 } from "lucide-react";

interface PlaygroundProps {
  /** 메인 App.js 코드 */
  code: string;
  /** 추가 파일들 (e.g. { "/src/utils.js": "export ..." }) */
  files?: Record<string, string>;
  /** sandpack 템플릿 (기본: "react") */
  template?: "react" | "react-ts" | "vanilla" | "vanilla-ts";
  /** 콘솔 표시 여부 */
  showConsole?: boolean;
  /** 에디터 높이 */
  editorHeight?: number;
  /** 프리뷰 높이 */
  previewHeight?: number;
}

export function Playground({
  code,
  files,
  template = "react",
  showConsole = false,
  editorHeight = 350,
  previewHeight = 150,
}: PlaygroundProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const allFiles: Record<string, string> = {
    "/App.js": code,
    ...files,
  };

  if (!mounted) {
    return (
      <div className="my-4 overflow-hidden rounded-lg border border-[var(--markdown-soft-border)] bg-[var(--markdown-panel-background)] shadow-sm">
        <PlaygroundHeader />
        <div
          className="animate-pulse bg-[var(--markdown-soft-surface)]"
          style={{ height: editorHeight + previewHeight }}
        />
      </div>
    );
  }

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-[var(--markdown-soft-border)] bg-[var(--markdown-panel-background)] shadow-sm">
      <PlaygroundHeader />
      <SandpackProvider
        template={template}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        files={allFiles}
        options={{
          initMode: "lazy",
          initModeObserverOptions: { rootMargin: "1000px 0px" },
        }}
      >
        <SandpackLayout
          style={{
            borderRadius: 0,
            border: "none",
            flexDirection: "column",
          }}
        >
          <SandpackCodeEditor
            showLineNumbers
            showInlineErrors
            wrapContent
            style={{ height: editorHeight, flexGrow: 0, flexBasis: "auto" }}
          />
          <SandpackPreview
            showOpenInCodeSandbox={false}
            showRefreshButton
            style={{ height: previewHeight, flexGrow: 0, flexBasis: "auto" }}
          />
        </SandpackLayout>
        {showConsole && (
          <SandpackConsole
            style={{
              height: 150,
              borderTop: "1px solid var(--sp-colors-surface2)",
            }}
          />
        )}
      </SandpackProvider>
    </div>
  );
}

function PlaygroundHeader() {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--markdown-soft-border)] px-3 py-2">
      <span className="flex items-center gap-2 text-xs font-medium text-foreground/70">
        <Code2 aria-hidden="true" className="size-3.5 text-[var(--markdown-link)]" strokeWidth={1.8} />
        직접 실행해보기
      </span>
      <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500/80" />
        코드를 바꿔볼 수 있어요
      </span>
    </div>
  );
}
