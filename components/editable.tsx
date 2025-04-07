import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";

export type EditableProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
} & React.ComponentPropsWithRef<"div">;

const Editable = forwardRef<HTMLDivElement, EditableProps>(
  ({ value, onChange, placeholder, ...props }, ref) => {
    const innerRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

    useImperativeHandle(ref, () => innerRef.current!);

    const updateCursor = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !innerRef.current) return;

      const range = selection.getRangeAt(0);
      const clonedRange = range.cloneRange();
      clonedRange.collapse(true);

      const tempSpan = document.createElement("span");
      clonedRange.insertNode(tempSpan);

      const spanRect = tempSpan.getBoundingClientRect();
      const editorRect = innerRef.current.getBoundingClientRect();

      setCursorPosition({
        x: spanRect.left - editorRect.left,
        y: spanRect.top - editorRect.top,
      });

      tempSpan.parentNode?.removeChild(tempSpan);
      innerRef.current.normalize();
    };

    useEffect(() => {
      document.addEventListener("selectionchange", updateCursor);
      return () =>
        document.removeEventListener("selectionchange", updateCursor);
    }, []);

    return (
      <div className="relative">
        <div
          ref={innerRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange(e.currentTarget.innerText)}
          className="outline-none whitespace-pre caret-transparent"
          style={{ caretColor: "transparent" }}
          {...props}
        >
          {value || placeholder}
        </div>
      </div>
    );
  },
);

export default Editable;
