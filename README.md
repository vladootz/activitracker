# Activitracker

A lightweight, privacy-focused activity tracking web application built with vanilla JavaScript. Track your daily activities, visualize trends with interactive charts, and analyze your time usage - all while keeping your data 100% local.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- ✅ **Activity Tracking** - Add, edit, and delete activities with duration logging
- 🔍 **Real-time Search** - Find activities instantly with debounced search
- 📊 **Multi-line Analytics** - Visualize each activity type separately with Chart.js
- 📈 **Statistics Dashboard** - View total activities, time spent, and averages
- 📄 **Pagination** - Handle large datasets efficiently (50 items per page)
- 🔒 **Security** - XSS protection and comprehensive input validation
- 💾 **Data Management** - Export/import JSON, bulk rename/delete operations
- 🎨 **Modern UI** - Sleek gray/silver theme with responsive design
- 🔐 **Privacy-First** - All data stored locally in browser, no server required

## Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Charts:** Chart.js v4.4.0
- **Storage:** Browser LocalStorage
- **Build:** None - static files only

## Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/vladootz/activitracker.git
cd activitracker

# Open in browser (no build step required!)
open index.html

# Or use a local server
python3 -m http.server 8000
# Navigate to http://localhost:8000
```

## Deployment

### Cloudflare Pages

This app is perfect for Cloudflare Pages deployment - zero build configuration needed!

#### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/vladootz/activitracker.git
   git push -u origin main
   ```

2. **Deploy on Cloudflare:**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Click "Create a project"
   - Connect your GitHub repository
   - Configure build settings:
     - **Framework preset:** None
     - **Build command:** (leave empty)
     - **Build output directory:** `/`
   - Click "Save and Deploy"

3. **Done!** Your app will be live at `https://activitracker.pages.dev`

#### Option 2: Direct Upload (Wrangler)

```bash
# Install Wrangler (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy directly
wrangler pages deploy . --project-name=activitracker
```

#### Option 3: Direct Upload (Dashboard)

1. Go to Cloudflare Pages dashboard
2. Click "Create a project" → "Direct Upload"
3. Upload these files:
   - `index.html`
   - `script.js`
   - `style.css`
   - `chart.umd.min.js` (if you have it locally, otherwise it loads from CDN)
4. Deploy!

### Other Hosting Options

**Netlify:**
- Drag and drop the project folder
- No configuration needed

**Vercel:**
```bash
npm install -g vercel
vercel
```

**GitHub Pages:**
```bash
# In your repository settings, enable GitHub Pages
# Choose main branch, root directory
```

**Any Static Host:**
Just upload the files - works anywhere that serves HTML!

## File Structure

```
activitracker/
├── index.html              # Main HTML structure
├── script.js               # Application logic (~1240 lines)
├── style.css               # Styling (~750 lines)
├── chart.umd.min.js        # Chart.js library (optional local copy)
├── package.json            # Project metadata
├── .gitignore              # Git ignore rules
├── README.md               # This file
└── TECHNICAL_OVERVIEW.md   # Detailed technical documentation
```

## Configuration

All configuration is in `script.js` at the `APP_CONFIG` and `VALIDATION_CONFIG` objects:

```javascript
const APP_CONFIG = {
    EDIT_THRESHOLD_YEARS: 1,      // Edit restriction (1 year)
    DURATION_ADJUSTMENT_STEP: 10, // ±10 minute buttons
    DEFAULT_DURATION: 30,          // Default duration value
    ACTIVITIES_PER_PAGE: 50,       // Pagination size
    STORAGE_KEY: 'activities',     // LocalStorage key
    CHART_COLORS: { /* ... */ }    // Chart color scheme
};
```

## Browser Support

- Chrome/Edge 90+ (April 2021)
- Firefox 88+ (April 2021)
- Safari 14+ (September 2020)

Requires ES6+, LocalStorage, FileReader, and Chart.js v4 compatibility.

## Privacy & Security

- **100% Client-Side:** No server, no database, no tracking
- **XSS Protection:** All user input sanitized and escaped
- **Input Validation:** Comprehensive validation on all fields
- **Local Storage Only:** Data never leaves your browser
- **No Cookies:** No tracking or analytics
- **Open Source:** Audit the code yourself

## Data Model

Each activity is stored as:

```javascript
{
  id: "uuid-v4",                    // Unique identifier
  activity: "running",               // Activity name (lowercase)
  startDateTime: "2025-12-22T10:30:00.000Z", // ISO 8601 UTC
  durationMinutes: 45,               // Duration in minutes
  details: "Morning run in the park" // Optional notes
}
```

## Documentation

- **README.md** - This file (deployment & quick start)
- **TECHNICAL_OVERVIEW.md** - Complete technical documentation
  - Architecture & data flow
  - Security implementation
  - Performance optimizations
  - Development guidelines

## Development

No build tools or dependencies required! Just edit the files:

- **HTML:** Edit `index.html` for structure
- **CSS:** Edit `style.css` for styling
- **JavaScript:** Edit `script.js` for functionality

All code is vanilla JavaScript with JSDoc comments.

## Contributing

This is a personal project, but feel free to fork and customize!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please review:
1. **TECHNICAL_OVERVIEW.md** - Comprehensive technical documentation
2. **GitHub Issues** - Check existing issues or create new one

## Changelog

### Version 2.0.0 (Current)
- ✅ Fixed XSS security vulnerabilities
- ✅ Added search with debouncing
- ✅ Added statistics dashboard
- ✅ Added pagination (50 items/page)
- ✅ Added multi-line analytics charts
- ✅ Added bulk delete functionality
- ✅ Optimized chart rendering
- ✅ Gray/silver color theme
- ✅ Comprehensive input validation
- ✅ Complete documentation

### Version 1.0.0
- Basic activity tracking
- Chart.js analytics
- Export/import JSON
- Bulk rename

---

**Built with ❤️ using Vanilla JavaScript**

No frameworks. No build tools. Just simple, secure, privacy-focused code.
