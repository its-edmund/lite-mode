"use client";
import { useState, useRef, useCallback, useEffect } from "react";

export default function Editor() {
  const [content, setContent] = useState("");
  const [mode, setMode] = useState("normal");
  const [cursorPos, setCursorPos] = useState(0);
  const [cursorCoords, setCursorCoords] = useState({ left: 0, top: 0 });
  const [charSize, setCharSize] = useState({ width: 0, height: 0 });
  const editorRef = useRef(null);

  const calculateLines = (text) => text.split("\n");

  // Measure character size once on mount
  useEffect(() => {
    const measure = document.createElement("pre");
    measure.style.position = "absolute";
    measure.style.visibility = "hidden";
    measure.style.font = "monospace";
    measure.textContent = "A";
    document.body.appendChild(measure);
    setCharSize({
      width: measure.offsetWidth,
      height: measure.offsetHeight,
    });
    document.body.removeChild(measure);
  }, []);

  // Track cursor position
  const updateCursor = useCallback(() => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();

    if (cursorRef.current) {
      cursorRef.current.style.left = `${rect.left - editorRect.left}px`;
      cursorRef.current.style.top = `${rect.top - editorRect.top}px`;
      cursorRef.current.style.display = mode === "normal" ? "block" : "none";
    }
  }, [mode]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (mode === "normal" && e.key === "i") {
        setMode("insert");
        e.preventDefault();
        setTimeout(() => editorRef.current?.focus(), 0);
      } else if (mode === "insert" && e.key === "Escape") {
        setMode("normal");
        e.preventDefault();
        editorRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [mode]);

  return (
    <div className="h-screen flex flex-col font-mono">
      <div
        ref={editorRef}
        contentEditable={mode == "insert"}
        className="h-full w-full outline-none bg-neutral-800 text-white"
        suppressContentEditableWarning
      >
        {content}
      </div>
      {mode === "normal" && (
        <div
          className="absolute pointer-events-none z-2 bg-white"
          style={{
            left: `${cursorCoords.left}px`,
            top: `${cursorCoords.top}px`,
            width: `${charSize.width}px`,
            height: `${charSize.height}px`,
          }}
        />
      )}
      <div className="status-bar">Mode: {mode.toUpperCase()}</div>
    </div>
  );
}
