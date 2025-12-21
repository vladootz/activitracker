# Cloudflare Pages Deployment Guide

This guide covers deploying Activitracker to Cloudflare Pages using different methods.

## Prerequisites

- A Cloudflare account (free tier works fine)
- Git installed (for GitHub integration method)
- (Optional) Node.js 18+ and npm (for Wrangler CLI method)

---

## Method 1: GitHub Integration (Recommended)

This is the easiest method with automatic deployments on every push.

### Step 1: Push to GitHub

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Activitracker v2.0"

# Create main branch
git branch -M main

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/activitracker.git

# Push to GitHub
git push -u origin main
```

### Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** in the left sidebar
3. Click **Create a project**
4. Click **Connect to Git**
5. Select **GitHub** and authorize Cloudflare to access your repositories
6. Select your `activitracker` repository

### Step 3: Configure Build Settings

**Important:** This app requires NO build configuration!

- **Project name:** `activitracker` (or whatever you prefer)
- **Production branch:** `main`
- **Framework preset:** `None` (leave as default)
- **Build command:** (leave empty)
- **Build output directory:** `/` (just a forward slash)
- **Root directory:** (leave empty)
- **Environment variables:** (none needed)

### Step 4: Deploy

1. Click **Save and Deploy**
2. Wait 30-60 seconds for deployment
3. Your app will be live at: `https://activitracker.pages.dev`
   (or `https://your-project-name.pages.dev`)

### Step 5: Automatic Updates

From now on, every time you push to GitHub:
```bash
git add .
git commit -m "Update feature X"
git push
```
Cloudflare will automatically rebuild and deploy!

---

## Method 2: Direct Upload (Dashboard)

Perfect for quick deployments without Git.

### Step 1: Prepare Files

Ensure you have these files ready:
- `index.html`
- `script.js`
- `style.css`
- `chart.umd.min.js` (optional - if you want to host Chart.js locally)
- `_headers` (for security headers)

### Step 2: Upload to Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages**
3. Click **Create a project**
4. Click **Direct Upload**
5. Drag and drop your project folder OR click to browse
6. Select all files
7. Click **Deploy site**

### Step 3: Access Your Site

Your app will be live at: `https://[random-name].pages.dev`

You can customize the URL in project settings.

---

## Method 3: Wrangler CLI

For developers who prefer command-line deployments.

### Step 1: Install Wrangler

```bash
# Install globally
npm install -g wrangler

# Or use npx (no installation needed)
npx wrangler --version
```

### Step 2: Authenticate

```bash
wrangler login
```

This opens your browser to authenticate with Cloudflare.

### Step 3: Deploy

```bash
# Deploy to Cloudflare Pages
wrangler pages deploy . --project-name=activitracker
```

Or if you want to specify a custom project name:
```bash
wrangler pages deploy . --project-name=my-activity-tracker
```

### Step 4: Subsequent Deployments

```bash
# Just run the deploy command again
wrangler pages deploy .
```

### Configuration

The `wrangler.toml` file is already configured:
```toml
name = "activitracker"
compatibility_date = "2024-01-01"

[site]
bucket = "."

pages_build_output_dir = "."
```

---

## Custom Domain Setup

### Add Your Domain

1. Go to your Cloudflare Pages project
2. Click **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain (e.g., `tracker.yourdomain.com`)
5. Follow DNS configuration instructions

Cloudflare automatically provisions SSL certificates!

---

## Security Headers

The `_headers` file configures security headers:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

These are automatically applied by Cloudflare Pages.

---

## Environment-Specific Features

### Preview Deployments

With GitHub integration, every branch and PR gets a preview URL:
- Main branch: `https://activitracker.pages.dev`
- Branch: `https://[branch].[project].pages.dev`
- PR #123: `https://[pr-123].[project].pages.dev`

### Rollbacks

In Cloudflare Dashboard:
1. Go to your Pages project
2. Click **Deployments**
3. Find the deployment you want to rollback to
4. Click **Rollback to this deployment**

---

## Troubleshooting

### Chart.js Not Loading

**Problem:** Chart shows error or doesn't appear

**Solution 1:** Verify Chart.js CDN is accessible
- Check `index.html` line 248: `<script src="chart.umd.min.js"></script>`
- Should load from CDN or local file

**Solution 2:** Use CDN version
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

### LocalStorage Not Working

**Problem:** Data not persisting between sessions

**Cause:** Browser privacy settings or incognito mode

**Solution:**
- Don't use incognito/private mode
- Check browser privacy settings allow LocalStorage

### 404 Errors

**Problem:** Routes showing 404

**Note:** This is a single-page app - all routes should serve `index.html`

**Solution:** Cloudflare Pages handles this automatically. No configuration needed.

---

## Performance Optimization

### Caching Strategy

The `_headers` file configures caching:
- HTML: 1 hour cache
- JS/CSS: 1 year cache with immutable flag
- Chart.js: Cached via CDN

### Asset Optimization

For maximum performance:

1. **Minify JavaScript** (optional):
   ```bash
   npx terser script.js -o script.min.js -c -m
   ```
   Then update `index.html` to use `script.min.js`

2. **Minify CSS** (optional):
   ```bash
   npx clean-css-cli style.css -o style.min.css
   ```

3. **Use Local Chart.js** (optional):
   - Download Chart.js from CDN
   - Save as `chart.umd.min.js`
   - Update `index.html` to use local version

---

## Monitoring

### Analytics

Add Cloudflare Web Analytics (free):

1. Go to **Analytics** → **Web Analytics**
2. Create a site
3. Add the script tag to `index.html` before `</body>`:
   ```html
   <script defer src='https://static.cloudflareinsights.com/beacon.min.js'
           data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
   ```

### Deployment Notifications

Set up notifications:
1. Go to **Notifications** in Cloudflare Dashboard
2. Configure alerts for deployment failures/successes
3. Choose notification method (email, webhook, etc.)

---

## Cost

**Cloudflare Pages Free Tier:**
- ✅ Unlimited sites
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 500 builds per month
- ✅ 1 concurrent build

**This app fits comfortably within the free tier!**

---

## Best Practices

1. **Use GitHub Integration** - Enables automatic deployments
2. **Set up Custom Domain** - Professional appearance
3. **Enable Branch Previews** - Test before deploying
4. **Monitor Deployments** - Set up notifications
5. **Regular Backups** - Export activity data regularly (app has built-in export)

---

## Next Steps

After deployment:

1. ✅ Test the live site thoroughly
2. ✅ Set up custom domain (optional)
3. ✅ Share the URL with users
4. ✅ Monitor usage via Cloudflare Analytics
5. ✅ Regular git commits for updates

---

## Quick Reference

### Deploy Commands

```bash
# GitHub method
git push

# Wrangler method
wrangler pages deploy .

# Check deployment status
wrangler pages deployment list --project-name=activitracker
```

### URLs

- Production: `https://[project-name].pages.dev`
- Custom domain: `https://your-domain.com`
- Preview: `https://[branch].[project].pages.dev`

---

## Support

- **Cloudflare Docs:** https://developers.cloudflare.com/pages/
- **Cloudflare Discord:** https://discord.cloudflare.com
- **Project Issues:** GitHub Issues on your repository

---

**Happy Deploying! 🚀**

Your Activitracker is ready for the world!
