import React, { useEffect, useRef, useState } from "react";
import { Link2, Linkedin } from "lucide-react";

const BlogPostSidebar = ({ post, contentRef }) => {
  const [headings, setHeadings] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!contentRef?.current) return;
    const h2s = contentRef.current.querySelectorAll("h2");
    const items = Array.from(h2s).map((el, i) => {
      if (!el.id) el.id = `toc-heading-${i}`;
      return { id: el.id, text: el.textContent };
    });
    setHeadings(items);
  }, [contentRef]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;

  return (
    <aside className="hidden lg:block w-64 shrink-0 self-start sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="space-y-6 pr-1">
        {headings.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Table of contents
            </p>
            <ul className="space-y-2">
              {headings.map((h) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    className="text-sm text-gray-500 hover:text-gray-900 leading-snug block transition-colors"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-gray-100 pt-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Recent update
          </p>
          <p className="text-sm text-gray-600">{post.date}</p>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Share this post
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              title="Copy link"
            >
              <Link2 size={15} />
              {copied ? "Copied!" : "Copy link"}
            </button>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              title="Share on LinkedIn"
            >
              <Linkedin size={15} />
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default BlogPostSidebar;
