"use client";

import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview, SandpackConsole } from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";

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
}

export function Playground({ code, files, template = "react", showConsole = false, editorHeight = 350 }: PlaygroundProps) {
  const { resolvedTheme } = useTheme();

  const allFiles: Record<string, string> = {
    "/App.js": code,
    ...files,
  };

  return (
    <div className="my-8 rounded-lg overflow-hidden border border-border shadow-sm">
      <SandpackProvider
        template={template}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        files={allFiles}
        options={{
          initMode: "user-visible",
          initModeObserverOptions: { rootMargin: "1000px 0px" },
        }}
      >
        <SandpackLayout
          style={{
            borderRadius: 0,
            border: "none",
          }}
        >
          <SandpackCodeEditor showLineNumbers showInlineErrors wrapContent style={{ height: editorHeight }} />
          <SandpackPreview showOpenInCodeSandbox={false} showRefreshButton style={{ height: editorHeight }} />
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
