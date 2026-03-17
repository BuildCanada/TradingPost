"use client";

import { useRef, useCallback, useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

function ToolbarButton({
  label,
  onClick,
  title,
}: {
  label: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 font-mono select-none"
    >
      {label}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write here...",
  minHeight = "200px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync external value changes into the editor
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  function exec(command: string, val?: string) {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    handleInput();
  }

  function insertLink() {
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  }

  return (
    <div className="border border-gray-300 rounded overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <ToolbarButton label="B" onClick={() => exec("bold")} title="Bold" />
        <ToolbarButton label="I" onClick={() => exec("italic")} title="Italic" />
        <ToolbarButton label="U" onClick={() => exec("underline")} title="Underline" />
        <span className="w-px h-6 bg-gray-300 mx-0.5 self-center" />
        <ToolbarButton label="H1" onClick={() => exec("formatBlock", "h1")} title="Heading 1" />
        <ToolbarButton label="H2" onClick={() => exec("formatBlock", "h2")} title="Heading 2" />
        <ToolbarButton label="H3" onClick={() => exec("formatBlock", "h3")} title="Heading 3" />
        <ToolbarButton label="P" onClick={() => exec("formatBlock", "p")} title="Paragraph" />
        <span className="w-px h-6 bg-gray-300 mx-0.5 self-center" />
        <ToolbarButton label="UL" onClick={() => exec("insertUnorderedList")} title="Bullet List" />
        <ToolbarButton label="OL" onClick={() => exec("insertOrderedList")} title="Numbered List" />
        <span className="w-px h-6 bg-gray-300 mx-0.5 self-center" />
        <ToolbarButton label="Link" onClick={insertLink} title="Insert Link" />
        <ToolbarButton label="—" onClick={() => exec("insertHorizontalRule")} title="Horizontal Rule" />
        <span className="w-px h-6 bg-gray-300 mx-0.5 self-center" />
        <ToolbarButton label="↩" onClick={() => exec("removeFormat")} title="Remove Formatting" />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className="px-4 py-3 text-sm outline-none prose-bc bg-white [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400"
        style={{ minHeight }}
      />
    </div>
  );
}
