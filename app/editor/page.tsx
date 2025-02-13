"use client";
import { useState, useRef, useCallback, useEffect } from "react";

export default function Editor() {
  const [content, setContent] = useState("");
  const [mode, setMode] = useState("normal");
  const [cursorPos, setCursorPos] = useState(0);
  const [cursorCoords, setCursorCoords] = useState({ left: 0, top: 0 });
  const [charSize, setCharSize] = useState({ width: 0, height: 0 });
  const editorRef = useRef(null);
  const cursorRef = useRef(null);

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

  useEffect(() => {
    console.log(cursorCoords);
    updateCursor();
  }, [cursorCoords, mode]);

  // Track cursor position
  const updateCursor = useCallback(() => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();

    if (cursorRef.current) {
      cursorRef.current.style.height = `${charSize.height}px`;
      cursorRef.current.style.width = `${charSize.width}px`;
      cursorRef.current.style.left = `${rect.left - editorRect.left + cursorCoords.left * charSize.width}px`;
      cursorRef.current.style.top = `${rect.top - editorRect.top + cursorCoords.top * charSize.height}px`;
      cursorRef.current.style.display = mode === "normal" ? "block" : "none";
    }
  }, [mode]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (mode === "normal") {
        e.preventDefault();
        switch (e.key) {
          case "i":
            setMode("insert");
            setTimeout(() => editorRef.current?.focus(), 0);
            break;
          case "h":
            setCursorCoords((old) => {
              return { left: old.left - 1, top: old.top };
            });
            break;
          case "l":
            setCursorCoords((old) => {
              return { left: old.left + 1, top: old.top };
            });
            break;
        }
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
      <div
        className="absolute pointer-events-none z-2 bg-white"
        ref={cursorRef}
      />
      <div className="status-bar">Mode: {mode.toUpperCase()}</div>
    </div>
  );
}
