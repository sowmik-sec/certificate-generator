# Routing System Documentation

## New URL Structure

The certificate generator now uses a Canva-like routing system for better user experience and SEO optimization.

### URL Pattern

```
/design/[templateId]/edit
```

Where `templateId` is the unique identifier for each template:

- `blank` - Blank Canvas
- `modern` - Modern Template
- `classic` - Classic Template
- `playful` - Playful Template
- `elegant` - Elegant Template
- `minimalist` - Minimalist Template
- `corporate` - Corporate Template
- `luxury` - Luxury Template
- `tech` - Tech Template
- `creative` - Creative Template
- `vintage` - Vintage Template
- `professional` - Professional Template
- `academic` - Academic Template
- `achievement` - Achievement Template
- `artistic` - Artistic Template

### Example URLs

```
https://yourapp.com/design/modern/edit
https://yourapp.com/design/classic/edit
https://yourapp.com/design/blank/edit
```

## Benefits

1. **Persistent URLs**: Users can bookmark specific templates and return to them
2. **Better UX**: Templates persist through page refreshes
3. **SEO Friendly**: Each template has its own URL and metadata
4. **Shareable Links**: Users can share specific templates
5. **Navigation History**: Browser back/forward buttons work correctly

## Route Structure

```
src/app/
├── page.tsx                          # Home page with template selection
├── design/
│   └── [templateId]/
│       └── edit/
│           ├── page.tsx              # Template editor page
│           ├── layout.tsx            # Dynamic metadata generation
│           └── not-found.tsx         # 404 page for invalid templates
└── middleware.ts                     # URL normalization and redirects
```

## Key Features

### 1. Template Selection (Home Page)

- Beautiful template gallery
- Quick actions for blank canvas
- Template previews
- Direct navigation to editor

### 2. Dynamic Editor Routes

- Each template has its own URL
- Template loads automatically based on URL
- Persistent state through page refreshes

### 3. URL Sharing

- Share button in header
- Copy template URL to clipboard
- Native sharing API support (mobile)

### 4. SEO Optimization

- Dynamic meta tags for each template
- Proper page titles and descriptions
- Static generation for better performance

### 5. Error Handling

- 404 page for invalid templates
- Auto-redirect to home page
- Graceful error recovery

## Implementation Details

### Template Map

Templates are centrally managed in `src/lib/templateMap.ts`:

```typescript
export const templateMap: Record<string, Template> = {
  modern: {
    id: "modern",
    name: "Modern",
    json: modernTemplate,
  },
  // ... other templates
};
```

### Navigation

Templates panel now uses Next.js router:

```typescript
const handleTemplateSelect = (templateId: string) => {
  router.push(`/design/${templateId}/edit`);
};
```

### URL Utilities

Helper functions for URL management in `src/lib/urlUtils.ts`:

- `generateTemplateUrl()` - Create template URLs
- `generateShareableText()` - Create shareable messages
- `copyToClipboard()` - Copy URLs to clipboard

### Middleware

URL normalization and redirects in `middleware.ts`:

- Lowercase template IDs
- Redirect old routes
- Clean URL handling

## Migration Guide

### For Users

- Old bookmarks to `/` will still work
- Templates now have permanent URLs
- Page refreshes won't lose progress

### For Developers

- Templates are now managed centrally
- Use router.push() for navigation
- Check `isValidTemplateId()` for validation

## Future Enhancements

1. **Custom Templates**: Support user-uploaded templates with unique IDs
2. **Version History**: Track template versions with URLs
3. **Collaboration**: Multi-user editing with shared URLs
4. **Analytics**: Track template popularity and usage
5. **Caching**: Implement template caching strategies

## Browser Support

- Modern browsers with JavaScript enabled
- Progressive Web App features
- Mobile-responsive design
- Touch-friendly interface
