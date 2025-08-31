const fs = require('fs');
const path = require('path');

const urls = [
  { url: 'https://www.samparka.info/', priority: 1.0 },
  { url: 'https://www.samparka.info/get-in-touch', priority: 0.8 },
  { url: 'https://www.samparka.info/smart-business-card', priority: 0.8 },
  { url: 'https://www.samparka.info/smart-review-stand', priority: 0.8 },
  { url: 'https://www.samparka.info/samparka-loyalty-solution', priority: 0.8 },
  { url: 'https://www.samparka.info/boost-your-business-with-n-f-c-e', priority: 0.8 },
  { url: 'https://www.samparka.info/enhance-customer-loyalty-with', priority: 0.8 },
  { url: 'https://www.samparka.info/upgrade-your-networking-with-s', priority: 0.8 },
];

const generateSitemap = (urls) => {
  const date = new Date().toISOString();
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  urls.forEach(({ url, priority }) => {
    sitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  sitemap += `
</urlset>`;

  const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');

  try {
    if (fs.existsSync(sitemapPath)) {
      fs.unlinkSync(sitemapPath);
      console.log('Previous sitemap.xml removed.');
    }
  
    fs.writeFileSync(sitemapPath, sitemap);
    console.log('New sitemap generated successfully!');
  } catch (err) {
    console.error('Error generating sitemap:', err);
  }
};

generateSitemap(urls);
