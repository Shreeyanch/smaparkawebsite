import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Footer from "../components/Footer";

const Blog = () => {
  const blogPosts = [
    {
      id: 15,
      slug: "himalayan-java-express-loyalty-program-customer-segmentation-samparka",
      title: "How Himalayan Java Express Knows Every Customer Who Walks In",
      excerpt:
        "3000+ customers. 9,000 visits. A 51.8% repeat rate that outperforms most cafés globally. Here's exactly how Himalayan Java Express built a data-driven loyalty program — and what they do differently for every type of customer.",
      author: "Samparka Team",
      authorImage: "https://samparka.co/images/logo/logo_white.png",
      date: "Mar 24, 2026",
      readTime: "18 min read",
      category: "Customer Loyalty",
      image: "https://s3-np1.datahub.com.np/samparka/blogassets/himalayanjavaloyaltycasestudy.png",
      featured: false,
    },
    {
      id: 11,
      slug: "whatsapp-loyalty-program-businesses-guide-2026",
      title: "WhatsApp Loyalty Program for Businesses: The Complete Guide (2026)",
      excerpt:
        "WhatsApp has 3 billion active users and a 98% message open rate. Here's why small businesses are using it as a loyalty channel — and how it actually works.",
      author: "Shreeyanch Shrestha",
      authorImage: "https://s3-np1.datahub.com.np/samparka/shreeyanch.png",
      date: "Mar 23, 2026",
      readTime: "8 min read",
      category: "Customer Loyalty",
      image: "https://s3-np1.datahub.com.np/samparka/blogassets/whatsapp%20loyalty%20samparka.jpg",
      featured: false,
    },
    {
      id: 12,
      slug: "branded-loyalty-app-small-business-pwa-2026",
      title: "Your Own Branded Loyalty App Without the Cost: How PWAs Changed Everything",
      excerpt:
        "Having your own loyalty app used to cost a fortune and take months. PWA technology changed that. Here's how small businesses now get a fully branded loyalty app in 10 minutes.",
      author: "Shreeyanch Shrestha",
      authorImage: "https://s3-np1.datahub.com.np/samparka/shreeyanch.png",
      date: "Mar 23, 2026",
      readTime: "7 min read",
      category: "Customer Loyalty",
      image: "https://s3-np1.datahub.com.np/samparka/blogassets/your%20own%20branded%20loyalty%20app.png"
    },
    {
      id: 14,
      slug: "best-customer-loyalty-platforms-2026",
      title: "13 Loyalty Platforms Compared: App vs WhatsApp vs Points",
      excerpt:
        "We reviewed 13 leading customer loyalty platforms using real G2 and Capterra data. From enterprise API-first engines to WhatsApp-native loyalty for independent businesses — what each platform does, who it's for, and where it falls short.",
      author: "Samparka Team",
      authorImage: "https://samparka.co/images/logo/logo_white.png",
      date: "Mar 24, 2026",
      readTime: "18 min read",
      category: "Customer Loyalty",
      image: "https://s3-np1.datahub.com.np/samparka/blogassets/loyalty%20apps%20compared.png",
      featured: true,
    },
    
    {
      id: 1,
      slug: "kathmandu-coffee-map",
      title:
        "Kathmandu Coffee Map: A Curated Guide to the City’s Specialty Coffee Culture",
      excerpt:
        "Kathmandu Coffee Map is a curated visual guide to the city’s growing specialty coffee scene—helping coffee lovers discover cafés, support local brands, and explore Nepal’s evolving coffee culture.",
      author: "Shreeyanch Shrestha",
      authorImage: "https://s3-np1.datahub.com.np/samparka/shreeyanch.png",
      date: "Jan 14, 2026",
      readTime: "7 min read",
      category: "Community Engagement",
      image:
        "https://s3-np1.datahub.com.np/samparka/blogassets/kathamnducoffeemapbanner.png",
      featured: false,
    },
    {
      id: 2,
      slug: "caffeophilia-case-study",
      title: "How Caffeophilia Increased Customer Retention by 30%",
      excerpt:
        "Discover how Nepal's premier specialty coffee bar partnered with Samparka to transform customer loyalty, driving a 30% increase in repeat visits and 12% boost in sales through innovative customer retention system.",
      author: "Shreeyanch Shrestha",
      authorImage: "https://s3-np1.datahub.com.np/samparka/shreeyanch.png",
      date: "Apr 16, 2025",
      readTime: "6 min read",
      category: "Customer Loyalty",
      image:
        "https://s3-np1.datahub.com.np/samparka/caffeophiliafrontbanner.png",
      featured: false,
    },
    {
      id: 3,
      slug: "cinnamon-garden-loyalty-case-study",
      title: "How Cinnamon Garden Strengthened Customer Loyalty",
      excerpt:
        "Discover how Cinnamon Garden used Samparka's digital loyalty system to build deeper customer relationships, increase repeat visits, and turn community engagement into long-term loyalty—without changing its calm, inclusive café experience.",
      author: "Shreeyanch Shrestha",
      authorImage: "https://s3-np1.datahub.com.np/samparka/shreeyanch.png",
      date: "Aug 13, 2025",
      readTime: "5 min read",
      category: "Customer Loyalty",
      image: "https://s3-np1.datahub.com.np/samparka/cinnamon.png",
      featured: false,
    },
    {
      id: 4,
      slug: "mira-boulangerie-loyalty-case-study",
      title: "How Mira Boulangerie Builds Quiet Loyalty with Samparka",
      excerpt:
        "Mira Boulangerie partnered with Samparka to thoughtfully recognize regulars, understand repeat visits, and strengthen long-term relationships—without disturbing the calm, refined experience it is known for.",
      author: "Sweta Thapa",
      authorImage: "https://s3-np1.datahub.com.np/samparka/sweta.jpg",
      date: "July 4, 2025",
      readTime: "5 min read",
      category: "Customer Loyalty",
      image: "https://s3-np1.datahub.com.np/samparka/miraBanner.png",
      featured: false,
    },
    {
      id: 5,
      slug: "redefining-customer-loyalty-with-samparka",
      title: "Redefining Customer Loyalty for Modern Businesses",
      excerpt:
        "In a world where attention is fleeting, Samparka helps businesses stop shouting and start connecting—turning casual customers into long-term fans through meaningful, modern loyalty.",
      author: "Sweta Thapa",
      authorImage: "https://s3-np1.datahub.com.np/samparka/sweta.jpg",
      date: "Jul 2, 2025",
      readTime: "5 min read",
      category: "Customer Loyalty",
      image: "https://s3-np1.datahub.com.np/samparka/elevated.png",
      featured: false,
    },
    {
      id: 6,
      slug: "thenewbarber-digital-loyalty-grooming-success",
      title:
        "How TheNewBarber Transformed Modern Grooming with Digital Loyalty: A 45% Revenue Growth Story",
      excerpt:
        "Discover how Nepal's fastest-growing barbershop chain revolutionized the grooming industry through Samparka's digital loyalty platform, achieving 45% revenue growth and building a community of 5,000+ loyal clients across 4 locations.",
      author: "Saman Lama",
      authorImage: "https://s3-np1.datahub.com.np/samparka/samanlama.jpg",
      date: "Apr 11, 2025",
      readTime: "7 min read",
      category: "Customer Loyalty",
      image: "https://s3-np1.datahub.com.np/samparka/thenewbarbersbanner.png",
      featured: false,
    },
    {
      id: 7,
      slug: "gamification-loyalty-fun-engaging",
      title: "Gamification: Making Loyalty Fun and Engaging",
      excerpt:
        "How adding game-like elements to your loyalty program can boost customer engagement by up to 40%.",
      author: "Emma Davis",
      authorImage: "/landingPage/images/services-elements/team3.png",
      date: "Nov 3, 2025",
      readTime: "6 min read",
      category: "Gamification",
      image: "/landingPage/images/services-elements/allfeatures.png",
      featured: false,
    },
    {
      id: 9,
      slug: "reelo-alternative-samparka",
      title: "Reelo Alternatives for Businesses in India (2026)",
      excerpt:
        "Reelo is one of the most popular restaurant loyalty platforms around. But it's not the right fit for every business. Here's an honest breakdown of where it falls short.",
      author: "Shreeyanch Shrestha",
      authorImage: "https://s3-np1.datahub.com.np/samparka/shreeyanch.png",
      date: "Mar 23, 2026",
      readTime: "6 min read",
      category: "Customer Loyalty",
      image: "https://s3-np1.datahub.com.np/samparka/blogassets/reeloalternatives%20by%20samparka.png",
      featured: false,
    },
    
    
  ];

  const featuredPost = blogPosts.find((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured);

  return (
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        <title>Blog | Customer Loyalty & Retention Insights – Samparka</title>
        <meta
          name="description"
          content="Explore case studies, insights, and real-world stories on customer loyalty, retention, and building long-term customer relationships."
        />
        <link rel="canonical" href="https://samparka.co/blog" />
        <meta property="og:image" content="https://samparka.co/landingPage/images/hero/desktop.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Samparka Blog — Loyalty Program Insights for Restaurants &amp; Salons" />
        <meta name="twitter:description" content="Case studies, guides and tips on running loyalty programs for restaurants, cafés, salons and hotels in Nepal and India." />
        <meta name="twitter:image" content="https://samparka.co/landingPage/images/hero/desktop.png" />
      </Helmet>
      {/* ======================================= */}

      <div className="min-h-screen bg-[#F6F4F7] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-28 md:pt-32 pb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3">
              Blog
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl">
              Case studies, product insights, and real-world stories on building
              customer loyalty, retention, and long-term relationships.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-10">
            {/* Featured Post */}
            {featuredPost && (
              <Link to={`/blog/${featuredPost.slug}`}>
                <article className="mb-10 pb-10 border-b border-gray-200">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <span className="inline-block mb-3 text-xs font-semibold bg-gray-900 text-white px-3 py-1 rounded-full">
                        Featured
                      </span>
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {featuredPost.title}
                      </h2>
                      <p className="text-gray-600 mb-5">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-3">
                        <img
                          src={featuredPost.authorImage}
                          alt={featuredPost.author}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="text-sm text-gray-600">
                          <p className="font-medium text-gray-900">
                            {featuredPost.author}
                          </p>
                          <span>
                            {featuredPost.date} · {featuredPost.readTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                </article>
              </Link>
            )}

            {/* Regular Posts */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <article>
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{post.excerpt}</p>
                    <span className="text-sm text-gray-500">
                      {post.date} · {post.readTime}
                    </span>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Footer />

        {/* WhatsApp Floating Button */}
        <a
          href="https://wa.me/9779843742684"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 ease-in-out"
          aria-label="Chat on WhatsApp"
        >
          <img
            src="/landingPage/images/whatsapp.png"
            alt="WhatsApp"
            className="w-full h-full object-contain"
          />
        </a>
      </div>
    </>
  );
};

export default Blog;
