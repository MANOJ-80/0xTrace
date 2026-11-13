"use client";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { safeUrlTransform } from "@/lib/safe-url";

const MDPreview = dynamic(
  () => import("@uiw/react-markdown-preview").then((mod) => mod.default),
  { ssr: false }
);

export default function MarkdownRenderer({ source }: { source: string }) {
  if (!source) return null;
  return (
    <div data-color-mode="light" className="markdown-preview w-full">
      <MDPreview
        source={source}
        style={{ backgroundColor: "transparent" }}
        skipHtml
        urlTransform={safeUrlTransform}
      />
    </div>
  );
}
