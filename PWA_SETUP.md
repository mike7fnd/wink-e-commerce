# E-Moorm PWA Setup Guide

This guide explains the Progressive Web App (PWA) configuration for E-Moorm.

## ✅ Completed PWA Features

### 1. **Web App Manifest** (`/public/manifest.json`)
- Defines app name, description, display mode (standalone)
- Specifies theme colors and icons
- Includes app shortcuts for quick access to key pages
- Enables app installation on home screen

### 2. **Service Worker** (`/public/sw.js`)
- Caches essential assets for offline functionality
- Implements network-first strategy for better performance
- Provides offline fallback page
- Handles cache updates and cleanup

### 3. **Offline Support** (`/public/offline.html`)
- Graceful offline page when connection is lost
- Users can retry connection or navigate back

### 4. **Safe Area Support**
- Full viewport-fit=cover for notched devices (iPhone X, etc.)
- Safe area insets applied to bottom navigation
- CSS classes for safe area padding on any element:
  - `.safe-area-bottom`
  - `.safe-area-top`
  - `.safe-area-left`
  - `.safe-area-right`

### 5. **Meta Tags & Configuration**
- Apple web app support
- Mobile web app capable
- Theme colors for address bar
- Viewport configuration for all devices

## 📋 Next Steps: Add App Icons

To fully enable PWA installation, replace placeholder icons in `/public/`:

### Required Icons:

```
/public/
├── icon-192.png          (192x192 px) - Main icon
├── icon-512.png          (512x512 px) - Large icon
├── icon-192-maskable.png (192x192 px) - Maskable icon for themed backgrounds
├── icon-512-maskable.png (512x512 px) - Maskable icon for themed backgrounds
├── shortcut-192.png      (192x192 px) - Products shortcut
├── shortcut-cart-192.png (192x192 px) - Cart shortcut
├── shortcut-account-192.png (192x192 px) - Account shortcut
├── screenshot-540.png    (540x720 px)  - Mobile screenshot
└── screenshot-1080.png   (1080x1440 px) - Desktop screenshot
```

### Icon Guidelines:
- Use PNG format with transparent background
- App icons: Include app logo/branding
- Maskable icons: Area around icon (safe zone) should be transparent
- Shortcuts: Specific page icons
- Screenshots: Showcase key app features

## 🚀 Installation & Usage

### On Mobile Browser:
1. Visit the app URL
2. Tap "Share" menu
3. Select "Add to Home Screen"
4. App installs with offline support

### On Desktop:
1. Visit the app
2. Click "Install" button in browser address bar
3. App opens in standalone window

## 🔌 Service Worker Features

- **Offline Mode**: View cached pages when offline
- **Background Sync**: Queue actions when offline (future enhancement)
- **Push Notifications**: Support ready (future enhancement)
- **Cache Management**: Auto-cleans old caches
- **Update Detection**: Checks for app updates every 60 seconds

## 🎨 Customization

### Update manifest.json:
```json
{
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "name": "Your App Name",
  "short_name": "Short Name"
}
```

### Update theme color:
Edit `src/app/layout.tsx`:
```tsx
themeColor: '#your-color',
```

### Update safe area in CSS:
Add to `src/app/globals.css`:
```css
.safe-area-bottom {
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
}
```

## 📊 Testing

### Chrome DevTools:
1. Open DevTools (F12)
2. Lighthouse tab → Run audit
3. Check PWA score

### Service Worker Debug:
1. DevTools → Application → Service Workers
2. Check registration and cache storage

### Test Offline:
1. DevTools → Network tab
2. Select "Offline"
3. App should show offline page or cached content

## 🔒 HTTPS Required

PWA features (service workers, manifest) require HTTPS in production.

- Development: http://localhost works fine
- Production: HTTPS is mandatory

## 📱 Browser Support

✅ Chrome/Edge (All modern versions)
✅ Firefox (Version 44+)
✅ Safari (iOS 11.3+, macOS 11.1+)
✅ Samsung Internet (6.0+)

## 🐛 Troubleshooting

**App not installing:**
- Ensure HTTPS is used (production)
- Verify manifest.json is valid
- Check that all icons are valid PNG files
- Clear browser cache and try again

**Service worker not caching:**
- Check DevTools → Application → Service Workers
- Verify sw.js is properly registered
- Check cache storage in DevTools

**Safe areas not working:**
- Verify viewport meta tag includes `viewport-fit=cover`
- Check CSS includes safe-area- classes
- Test on actual notched device or use Chrome DevTools emulation

## 📚 Resources

- [MDN Web Docs - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA Checklist](https://web.dev/pwa-checklist/)
- [Manifest Format Spec](https://www.w3.org/TR/appmanifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
