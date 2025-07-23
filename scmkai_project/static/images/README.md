# SCM-KAI Images Directory

This directory contains essential images for the SCM-KAI AI Companion application.

## Included Images:

### 1. scm_kai_logo.png
- **Purpose:** Main application logo
- **Usage:** Navigation bar, branding, marketing materials
- **Dimensions:** Square format (suitable for various sizes)
- **Style:** Professional blue robot icon with "SCM-KAI AI COMPANION" text

### 2. dashboard_hero.png
- **Purpose:** Dashboard illustration for hero sections
- **Usage:** Homepage, dashboard landing, marketing materials
- **Dimensions:** Landscape format
- **Style:** Modern supply chain dashboard with charts and KPIs

### 3. favicon.png
- **Purpose:** Browser favicon and app icon
- **Usage:** Browser tabs, bookmarks, mobile app icons
- **Dimensions:** Square format (optimized for small sizes)
- **Style:** Minimalist blue robot head icon

### 4. ai_chat_illustration.png
- **Purpose:** AI chat feature illustration
- **Usage:** Chat page, feature explanations, marketing
- **Dimensions:** Landscape format
- **Style:** Professional chat interface with supply chain conversations

## Usage in Templates:

To use these images in your templates, reference them as:

```html
<!-- Logo in navigation -->
<img src="{{ url_for('static', filename='images/scm_kai_logo.png') }}" alt="SCM-KAI Logo" height="40">

<!-- Hero image on homepage -->
<img src="{{ url_for('static', filename='images/dashboard_hero.png') }}" alt="Dashboard" class="img-fluid">

<!-- Favicon in head section -->
<link rel="icon" type="image/png" href="{{ url_for('static', filename='images/favicon.png') }}">

<!-- Chat illustration -->
<img src="{{ url_for('static', filename='images/ai_chat_illustration.png') }}" alt="AI Chat" class="img-fluid">
```

## Adding More Images:

To add additional images:
1. Place image files in this directory
2. Use descriptive filenames (e.g., `supplier_performance_chart.png`)
3. Reference them in templates using the Flask `url_for` function
4. Update this README with new image descriptions

## Image Optimization:

For production deployment:
- Optimize images for web (compress without losing quality)
- Use appropriate formats (PNG for logos/icons, JPG for photos)
- Consider responsive images for different screen sizes
- Implement lazy loading for better performance

## Branding Guidelines:

All images follow the SCM-KAI branding:
- **Primary Color:** #0d6efd (Bootstrap primary blue)
- **Secondary Colors:** White, light grays
- **Style:** Professional, modern, clean
- **Theme:** AI, technology, supply chain, analytics

