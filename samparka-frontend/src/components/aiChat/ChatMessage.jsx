import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Copy, Check } from "lucide-react";
import SiriOrb from "./SiriOrb";
import "highlight.js/styles/github-dark.css";

export default function ChatMessage({ message, isDarkMode, index }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="w-full py-6 px-4">
        <div className="max-w-3xl mx-auto flex justify-end">
          <div
            className={`max-w-[80%] rounded-2xl rounded-tr-sm px-5 py-3 text-sm leading-relaxed ${
              isDarkMode ? "bg-green-600 text-white" : "bg-green-500 text-white"
            }`}
          >
            {message.text}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full py-6 px-4 ${
        isDarkMode
          ? index % 2 === 0
            ? "bg-[#343541]"
            : "bg-[#444654]"
          : index % 2 === 0
          ? "bg-white"
          : "bg-gray-50"
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-4 items-start">
        <div className="flex-shrink-0 mt-1">
          <SiriOrb size="small" isAnimating={true} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-medium mb-2 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Spark AI
          </p>
          <div
            className={`prose prose-sm max-w-none ${
              isDarkMode
                ? "prose-invert prose-pre:bg-[#1a1a1a] prose-pre:border prose-pre:border-gray-700"
                : "prose-gray prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-200"
            }`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeContent = String(children).replace(/\n$/, "");

                  if (!inline && match) {
                    return (
                      <CodeBlock
                        language={match[1]}
                        code={codeContent}
                        isDarkMode={isDarkMode}
                        {...props}
                      />
                    );
                  }

                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ language, code, isDarkMode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className={`absolute top-2 right-2 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
          isDarkMode
            ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        }`}
        aria-label="Copy code"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
      <pre>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
