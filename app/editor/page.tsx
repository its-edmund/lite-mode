"use client";
import { useState, useRef, useCallback, useEffect } from "react";

export default function Editor() {
  const [content, setContent] = useState("");
  const [mode, setMode] = useState("normal");
  const [cursorPos, setCursorPos] = useState(0);
  const [cursorCoords, setCursorCoords] = useState({ left: 0, top: 0 });
  const [charSize, setCharSize] = useState({ width: 0, height: 0 });
  const textareaRef = useRef(null);

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

  // Update cursor position calculations
  const updateCursorPosition = useCallback(() => {
    if (!textareaRef.current || !charSize.width) return;

    const text = content.slice(0, cursorPos);
    const lines = text.split("\n");
    const currentLine = lines.length - 1;
    const currentColumn = lines[currentLine].length;

    const top = currentLine * charSize.height;
    const left = currentColumn * charSize.width;

    setCursorCoords({
      left: left + 15, // Account for textarea padding
      top: top + 15, // Account for textarea padding
    });
  }, [content, cursorPos, charSize]);

  const handleKeyDown = useCallback(
    (e) => {
      if (mode === "normal") {
        e.preventDefault();
        const { key } = e;
        const text = e.target.value;
        let newPos = cursorPos;

        switch (key) {
          case "i":
            setMode("insert");
            break;
          case "h":
            newPos = Math.max(0, cursorPos - 1);
            break;
          case "l":
            newPos = Math.min(text.length, cursorPos + 1);
            break;
          case "j": {
            const lines = calculateLines(text);
            const before = text.slice(0, cursorPos);
            const currentLine = (before.match(/\n/g) || []).length;
            if (currentLine < lines.length - 1) {
              const lineLengths = lines.map((line) => line.length);
              let pos = 0;
              for (let i = 0; i <= currentLine; i++) {
                pos += lineLengths[i] + 1;
              }
              const nextLineCol = Math.min(
                cursorPos - (pos - lineLengths[currentLine] - 1),
                lines[currentLine + 1].length,
              );
              newPos = pos + nextLineCol;
            }
            break;
          }
          case "k": {
            const lines = calculateLines(text);
            const before = text.slice(0, cursorPos);
            const currentLine = (before.match(/\n/g) || []).length;
            if (currentLine > 0) {
              const lineLengths = lines.map((line) => line.length);
              let pos = 0;
              for (let i = 0; i < currentLine - 1; i++) {
                pos += lineLengths[i] + 1;
              }
              const prevLineCol = Math.min(
                cursorPos - (pos + lineLengths[currentLine - 1] + 1),
                lines[currentLine - 1].length,
              );
              newPos = pos + prevLineCol;
            }
            break;
          }
          case "x":
            if (text.length > 0 && cursorPos < text.length) {
              const newText =
                text.slice(0, cursorPos) + text.slice(cursorPos + 1);
              setContent(newText);
            }
            break;
          default:
            break;
        }

        if (newPos !== cursorPos) {
          setCursorPos(newPos);
        }
      } else if (mode === "insert" && e.key === "Escape") {
        e.preventDefault();
        setMode("normal");
        setCursorPos(Math.max(0, textareaRef.current.selectionStart - 1));
      }
      updateCursorPosition();
    },
    [mode, cursorPos, updateCursorPosition],
  );

  useEffect(updateCursorPosition, [updateCursorPosition]);

  const handleChange = useCallback((e) => {
    setContent(e.target.value);
    setCursorPos(e.target.selectionStart);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.selectionStart = cursorPos;
      textareaRef.current.selectionEnd = cursorPos;
    }
  }, [cursorPos, mode]);

  useEffect(() => {
    if (mode === "insert" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [mode]);

  return (
    <div className="h-screen flex flex-col font-mono">
      <div className="status-bar">Mode: {mode.toUpperCase()}</div>
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-screen h-full resize-none flex-grow caret-transparent text-neutral-200 outline-none"
        readOnly={mode === "normal"}
        spellCheck={false}
      />
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
    </div>
  );
}
