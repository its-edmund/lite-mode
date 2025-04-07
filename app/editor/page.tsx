"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import Editable from "@/components/editable";

export default function Editor() {
  const [content, setContent] = useState("");
  const [mode, setMode] = useState("normal");
  const [cursorCoords, setCursorCoords] = useState({ line: 0, column: 0 });
  const [charSize, setCharSize] = useState({ width: 8, height: 16 }); // default values for monospace
  const editorRef = useRef(null);
  const cursorRef = useRef(null);

  const getLines = (text) => text.split("\n");

  useEffect(() => {
    const measure = document.createElement("pre");
    measure.style.visibility = "hidden";
    measure.style.position = "absolute";
    measure.style.fontFamily = "monospace";
    measure.textContent = "A";
    document.body.appendChild(measure);
    setCharSize({ width: measure.offsetWidth, height: measure.offsetHeight });
    document.body.removeChild(measure);
  }, []);

  useEffect(() => {
    updateCursorPosition();
  }, [cursorCoords, charSize, mode]);

  const updateCursorPosition = useCallback(() => {
    if (!editorRef.current || !cursorRef.current) return;

    cursorRef.current.style.width = `${charSize.width}px`;
    cursorRef.current.style.height = `${charSize.height}px`;
    cursorRef.current.style.display = mode === "normal" ? "block" : "none";
    cursorRef.current.style.position = "absolute";
    cursorRef.current.style.backgroundColor = "white";
    cursorRef.current.style.pointerEvents = "none";

    cursorRef.current.style.left = `${cursorCoords.column * charSize.width}px`;
    cursorRef.current.style.top = `${cursorCoords.line * charSize.height}px`;
  }, [cursorCoords, charSize, mode]);

  // const handleInput = (e) => {
  //   console.log(e.currentTarget.innerText);
  //   setContent(e.currentTarget.innerText);
  //   const selection = window.getSelection();
  //   if (selection.rangeCount > 0) {
  //     const range = selection.getRangeAt(0);
  //     setCursorCoords({
  //       line:
  //         range.startContainer.textContent
  //           .slice(0, range.startOffset)
  //           .split("\n").length - 1,
  //       column: range.startOffset,
  //     });
  //   }
  // };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mode === "normal") {
        e.preventDefault();
        const lines = getLines(content);
        setCursorCoords((coords) => {
          let { line, column } = coords;
          switch (e.key) {
            case "i":
              setMode("insert");
              setTimeout(() => editorRef.current?.focus(), 0);
              break;
            case "h":
              if (column > 0) column--;
              break;
            case "l":
              if (column < (lines[line]?.length || 0)) column++;
              break;
            case "j":
              if (line < lines.length - 1) {
                line++;
                column = Math.min(column, lines[line].length);
              }
              break;
            case "k":
              if (line > 0) {
                line--;
                column = Math.min(column, lines[line].length);
              }
              break;
          }
          console.log({ line, column });
          return { line, column };
        });
      } else if (mode === "insert" && e.key === "Escape") {
        setMode("normal");
        e.preventDefault();
        editorRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mode, content]);

  return (
    <div className="relative h-screen flex flex-col font-mono bg-neutral-800 text-white">
      <div
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => {
          const lineBreaks = (e.currentTarget.textContent.match(/\n/g) || [])
            .length;
          console.log(lineBreaks);
          console.log(JSON.stringify(e.currentTarget.textContent));
          setContent(e.currentTarget.innerText);
        }}
        className="outline-none whitespace-pre"
        ref={editorRef}
      ></div>
      <div ref={cursorRef}></div>
      <div className="absolute bottom-0 left-0 w-full bg-neutral-700 text-sm px-2">
        Mode: {mode.toUpperCase()}
      </div>
    </div>
  );
}
