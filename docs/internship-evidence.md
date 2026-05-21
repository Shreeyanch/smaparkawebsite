# Samparka Internship Evidence

## Component Development Evidence

| Evidence Area | File / Location | What It Shows |
| --- | --- | --- |
| Blog listing logic | `samparka-frontend/src/landingPage/src/pages/Blog.jsx` | Blog data structure, featured post selection, blog card rendering, and SEO metadata. |
| Blog detail page | `samparka-frontend/src/landingPage/src/pages/BlogPost.jsx` | Slug-based post loading, structured metadata, related posts, and blog content rendering. |
| Blog sidebar component | `samparka-frontend/src/landingPage/src/components/BlogPostSidebar.jsx` | Reusable table-of-contents and sharing component logic. |
| Store selector component | `samparka-frontend/src/components/common/StoreSelector.jsx` | Store fetching, search filtering, sorting, selection, keyboard navigation, and local storage support. |
| Receipt upload form | `samparka-frontend/src/components/receipt/ReceiptUploadForm.jsx` | File input, image preview, outlet selector, validation, and submit handling. |

## Testing Evidence

| Aspect | Details |
| --- | --- |
| Application Tested | Samparka blog listing, blog detail page, store selector, and receipt upload flow. |
| Testing Type | Functional, UI, component-level, and usability testing during development. |
| Objective of Testing | To verify that blog navigation, reusable UI components, store selection, and receipt upload interactions worked correctly before final use. |
| Functionalities Tested | Blog post routing, SEO metadata display, table-of-contents generation, store search/filtering, dropdown selection, image upload preview, and receipt form submission state. |
| Expected Behaviour | Users should be able to open blog posts, navigate related content, search and select stores, upload receipt images, preview selected files, and submit forms without UI errors. |
| Testing Activities Performed | Repeated navigation, form interaction, search filtering, keyboard interaction, and upload-preview checks were performed across the related screens. |
| Issues / Observations Identified | Minor spacing, interaction, and state-handling observations were reviewed during testing to improve the user experience. |
| Evidence Collected | Screenshots of blog pages, store dropdown states, receipt upload preview, and selected-state UI. |
| Outcome | Testing confirmed that the selected Samparka components and user flows were working correctly for demonstration and report evidence. |

## Recommended Screenshot Ranges

| File | Lines | Evidence Purpose |
| --- | --- | --- |
| `samparka-frontend/src/landingPage/src/pages/Blog.jsx` | 6-62 | Blog data and featured post setup. |
| `samparka-frontend/src/landingPage/src/pages/BlogPost.jsx` | 30-60 | SEO metadata and structured blog schema. |
| `samparka-frontend/src/components/common/StoreSelector.jsx` | 87-143 | Store filtering, sorting, selection, and persistence logic. |
| `samparka-frontend/src/components/receipt/ReceiptUploadForm.jsx` | 1-120 | Receipt image upload, preview, validation, and submit handling. |
