import React, { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import { getPostBySlug, getRelatedPosts } from '../components/blogPosts';
import Footer from '../components/Footer';
import BlogPostSidebar from '../components/BlogPostSidebar';

const BlogPost = () => {
  const { slug } = useParams();
  const contentRef = useRef(null);

  const post = getPostBySlug(slug);
  const suggestedPosts = post ? getRelatedPosts(post.id, 3) : [];

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-blue-600 hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        <title>{post.title} | Samparka</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`https://samparka.co/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://samparka.co/blog/${post.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={post.image} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt,
          "image": post.image,
          "author": { "@type": "Person", "name": post.author },
          "publisher": {
            "@type": "Organization",
            "name": "Samparka",
            "logo": { "@type": "ImageObject", "url": "https://samparka.co/images/logo/logo_white.png" }
          },
          "datePublished": post.date,
          "url": `https://samparka.co/blog/${post.slug}`,
          "mainEntityOfPage": `https://samparka.co/blog/${post.slug}`
        })}</script>
      </Helmet>
      {/* ======================================= */}

      <style>{`
        .blog-content h2 { font-size: 1.35rem !important; margin-top: 2rem !important; margin-bottom: 0.75rem !important; }
        .blog-content h3 { font-size: 1.1rem !important; margin-top: 1.5rem !important; margin-bottom: 0.5rem !important; }
        .blog-content p  { font-size: 0.9rem !important; line-height: 1.75 !important; margin-bottom: 1rem !important; }
        .blog-content li { font-size: 0.9rem !important; line-height: 1.75 !important; }
        .blog-content td, .blog-content th { font-size: 0.82rem !important; }
      `}</style>

      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto pt-24 md:pt-32 pb-8 md:pb-12 px-4 md:px-6 lg:px-8">

          <Link
            to="/blog"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors text-sm"
          >
            ← Back to Blog
          </Link>

          <div className="flex gap-12 items-start">
            {/* Main content */}
            <article className="min-w-0 flex-1">
              <div className="mb-3">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {post.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-5 leading-tight">
                {post.title}
              </h1>

              <p className="text-base md:text-lg text-gray-600 mb-7 leading-relaxed">
                {post.excerpt}
              </p>

              <div className="mb-10">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>

              <div
                ref={contentRef}
                className="blog-content prose max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900
                  prose-p:text-gray-700 prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>

            {/* Sticky sidebar */}
            <BlogPostSidebar post={post} contentRef={contentRef} />
          </div>
        </div>

        {suggestedPosts.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">More Stories</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {suggestedPosts.map((p) => (
                  <Link key={p.id} to={`/blog/${p.slug}`} className="group">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-700">
                      {p.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default BlogPost;
