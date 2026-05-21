import { useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useTheme } from "../../context/ThemeContext";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }], // Header options
    [{ font: [] }], // Font styles
    [{ size: ["small", false, "large", "huge"] }], // Font size
    ["bold", "italic", "underline", "strike"], // Text formatting
    [{ list: "ordered" }, { list: "bullet" }], // Ordered & Unordered lists
    [{ indent: "-1" }, { indent: "+1" }], // Indentation
    [{ align: [] }], // Text alignment
    ["blockquote", "code-block"], // Blockquote & Code block
    ["link", "image"], // Insert links, images & videos
    ["clean"], // Remove formatting
  ],
};

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "background",
  "list",
  "bullet",
  "indent",
  "align",
  "blockquote",
  "code-block",
  "link",
  "image",
];

const TextEditor = ({ message, setMessage }) => {
  const quillRef = useRef(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (quillRef.current) {
      console.log("Quill instance: ", quillRef.current.getEditor());
    }
  }, []);

  return (
    <div className={`${isDarkMode ? 'dark-quill' : ''} rounded-lg overflow-hidden`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        placeholder="Type your message here..."
        value={message}
        onChange={setMessage}
        modules={modules}
        formats={formats}
        className={`${isDarkMode ? 'dark-theme' : 'light-theme'}`}
        style={{
          backgroundColor: isDarkMode ? '#374151' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
          borderRadius: '0.5rem',
        }}
      />
      <style jsx>{`
        .dark-quill .ql-toolbar {
          background-color: #4B5563 !important;
          border-color: #6B7280 !important;
          border-top-left-radius: 0.5rem !important;
          border-top-right-radius: 0.5rem !important;
          border-bottom: 1px solid #6B7280 !important;
        }
        .dark-quill .ql-toolbar button {
          color: #E5E7EB !important;
        }
        .dark-quill .ql-toolbar button:hover {
          background-color: #6B7280 !important;
          border-radius: 0.25rem !important;
        }
        .dark-quill .ql-toolbar button.ql-active {
          background-color: #10B981 !important;
          color: #ffffff !important;
        }
        .dark-quill .ql-toolbar .ql-stroke {
          stroke: #E5E7EB !important;
        }
        .dark-quill .ql-toolbar .ql-fill {
          fill: #E5E7EB !important;
        }
        .dark-quill .ql-toolbar .ql-picker-label {
          color: #E5E7EB !important;
        }
        .dark-quill .ql-toolbar .ql-picker-options {
          background-color: #4B5563 !important;
          border-color: #6B7280 !important;
        }
        .dark-quill .ql-toolbar .ql-picker-item {
          color: #E5E7EB !important;
        }
        .dark-quill .ql-toolbar .ql-picker-item:hover {
          background-color: #6B7280 !important;
        }
        .dark-quill .ql-container {
          background-color: #374151 !important;
          border-color: #6B7280 !important;
          color: #ffffff !important;
          border-bottom-left-radius: 0.5rem !important;
          border-bottom-right-radius: 0.5rem !important;
          min-height: 200px !important;
        }
        .dark-quill .ql-editor {
          background-color: #374151 !important;
          color: #ffffff !important;
          min-height: 180px !important;
        }
        .dark-quill .ql-editor::before {
          color: #9CA3AF !important;
        }
        .dark-quill .ql-editor p,
        .dark-quill .ql-editor h1,
        .dark-quill .ql-editor h2,
        .dark-quill .ql-editor h3,
        .dark-quill .ql-editor h4,
        .dark-quill .ql-editor h5,
        .dark-quill .ql-editor h6 {
          color: #ffffff !important;
        }
        .dark-quill .ql-editor blockquote {
          background-color: #4B5563 !important;
          border-left: 4px solid #10B981 !important;
          color: #E5E7EB !important;
        }
        .dark-quill .ql-editor code {
          background-color: #1F2937 !important;
          color: #F9FAFB !important;
          border-radius: 0.25rem !important;
        }
        .dark-quill .ql-editor pre {
          background-color: #1F2937 !important;
          color: #F9FAFB !important;
          border-radius: 0.5rem !important;
        }
        
        /* Light theme improvements */
        .light-theme .ql-toolbar {
          border-top-left-radius: 0.5rem !important;
          border-top-right-radius: 0.5rem !important;
        }
        .light-theme .ql-container {
          border-bottom-left-radius: 0.5rem !important;
          border-bottom-right-radius: 0.5rem !important;
          min-height: 200px !important;
        }
        .light-theme .ql-editor {
          min-height: 180px !important;
        }
        .light-theme .ql-toolbar button.ql-active {
          background-color: #10B981 !important;
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
};

export default TextEditor;

// import { Editor } from "@tinymce/tinymce-react";

// const TextEditor = ({ message, setMessage }) => {
//   return (
//     <Editor
//       apiKey="ize97xdydr7ma54y0mijjpbro47ckar0kkdpwbbyxf812n4v"
//       value={message}
//       onEditorChange={(newContent) => setMessage(newContent)}
//       init={{
//         height: 400,
//         menubar: true,
//         directionality: "ltr",
//         plugins: [
//           "advlist autolink lists link image charmap preview anchor",
//           "searchreplace visualblocks code fullscreen",
//           "insertdatetime media table paste code help wordcount",
//         ],
//         toolbar:
//           "undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor | " +
//           "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
//           "blockquote code | link image media table | preview fullscreen help",
//         image_title: true,
//         automatic_uploads: false,
//         file_picker_types: "image",
//         image_advtab: true,
//       }}
//     />
//   );
// };

// export default TextEditor;
