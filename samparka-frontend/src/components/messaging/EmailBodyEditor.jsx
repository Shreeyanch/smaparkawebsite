import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Link, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function ToolbarBtn({ onMouseDown, title, children, isDarkMode, isActive }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={onMouseDown}
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? "bg-[#016e49] text-white"
          : isDarkMode
          ? "text-gray-200 hover:bg-white/10"
          : "text-gray-700 hover:bg-black/10"
      }`}
    >
      {children}
    </button>
  );
}

function Divider({ isDarkMode }) {
  return <div className={`w-px h-4 mx-1 ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`} />;
}

const EmailBodyEditor = forwardRef(function EmailBodyEditor({ value, onChange }, ref) {
  const { isDarkMode } = useTheme();
  const editorRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false });

  // Reads current selection's active formats from the browser
  const updateActiveFormats = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  }, []);

  // Set content once on mount — never again (prevents cursor jumps)
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || "";
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // External reset: when parent clears value after form submit
  useEffect(() => {
    if (!value && editorRef.current && editorRef.current.innerHTML) {
      editorRef.current.innerHTML = "";
    }
  }, [value]);

  // Track selection changes so toolbar buttons reflect current cursor position
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.addEventListener("keyup", updateActiveFormats);
    editor.addEventListener("mouseup", updateActiveFormats);
    document.addEventListener("selectionchange", updateActiveFormats);
    return () => {
      editor.removeEventListener("keyup", updateActiveFormats);
      editor.removeEventListener("mouseup", updateActiveFormats);
      document.removeEventListener("selectionchange", updateActiveFormats);
    };
  }, [updateActiveFormats]);

  const exec = useCallback(
    (command, arg = null) => (e) => {
      e.preventDefault(); // keep focus in editor
      editorRef.current?.focus();
      document.execCommand(command, false, arg);
      onChange(editorRef.current?.innerHTML || "");
      updateActiveFormats();
    },
    [onChange, updateActiveFormats]
  );

  const handleLink = useCallback(
    (e) => {
      e.preventDefault();
      editorRef.current?.focus();
      const url = window.prompt("Enter URL (e.g. https://example.com or [store_link]):");
      if (url) {
        document.execCommand("createLink", false, url);
        onChange(editorRef.current?.innerHTML || "");
      }
    },
    [onChange]
  );

  const handleInput = useCallback(() => {
    onChange(editorRef.current?.innerHTML || "");
  }, [onChange]);

  useImperativeHandle(
    ref,
    () => ({
      insertVariable(text) {
        editorRef.current?.focus();
        document.execCommand("insertText", false, text);
        onChange(editorRef.current?.innerHTML || "");
        updateActiveFormats();
      },
    }),
    [onChange, updateActiveFormats]
  );

  const iconSize = "w-3.5 h-3.5";

  return (
    <div className={`rounded-lg border overflow-hidden ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}>
      {/* Toolbar */}
      <div className={`flex items-center gap-0.5 px-2 py-1.5 border-b ${
        isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
      }`}>
        <ToolbarBtn isDarkMode={isDarkMode} title="Bold (Ctrl+B)" isActive={activeFormats.bold} onMouseDown={exec("bold")}>
          <Bold className={iconSize} />
        </ToolbarBtn>
        <ToolbarBtn isDarkMode={isDarkMode} title="Italic (Ctrl+I)" isActive={activeFormats.italic} onMouseDown={exec("italic")}>
          <Italic className={iconSize} />
        </ToolbarBtn>
        <ToolbarBtn isDarkMode={isDarkMode} title="Underline (Ctrl+U)" isActive={activeFormats.underline} onMouseDown={exec("underline")}>
          <Underline className={iconSize} />
        </ToolbarBtn>

        <Divider isDarkMode={isDarkMode} />

        <ToolbarBtn isDarkMode={isDarkMode} title="Numbered list" onMouseDown={exec("insertOrderedList")}>
          <ListOrdered className={iconSize} />
        </ToolbarBtn>
        <ToolbarBtn isDarkMode={isDarkMode} title="Bullet list" onMouseDown={exec("insertUnorderedList")}>
          <List className={iconSize} />
        </ToolbarBtn>

        <Divider isDarkMode={isDarkMode} />

        <ToolbarBtn isDarkMode={isDarkMode} title="Insert link" onMouseDown={handleLink}>
          <Link className={iconSize} />
        </ToolbarBtn>
        <ToolbarBtn isDarkMode={isDarkMode} title="Clear formatting" onMouseDown={exec("removeFormat")}>
          <X className={iconSize} />
        </ToolbarBtn>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className={`ebd-content min-h-[180px] px-4 py-3 text-sm leading-relaxed focus:outline-none ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      />

      <style>{`
        .ebd-content:empty::before {
          content: 'Write your email message here...';
          color: ${isDarkMode ? "#6b7280" : "#9ca3af"};
          pointer-events: none;
        }
        .ebd-content ul, .ebd-content ol {
          margin-left: 1.25rem;
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }
        .ebd-content ul { list-style-type: disc; }
        .ebd-content ol { list-style-type: decimal; }
        .ebd-content a { color: #016e49; text-decoration: underline; }
      `}</style>
    </div>
  );
});

export default EmailBodyEditor;
