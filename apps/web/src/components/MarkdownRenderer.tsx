"use client";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDPreview = dynamic(
  () => import("@uiw/react-markdown-preview").then((mod) => mod.default),
  { ssr: false }
);

export default function MarkdownRenderer({ source }: { source: string }) {
  if (!source) return null;
  return (
    <div data-color-mode="dark" className="w-full">
      <MDPreview source={source} style={{ backgroundColor: 'transparent' }} />
    </div>
  );
}
