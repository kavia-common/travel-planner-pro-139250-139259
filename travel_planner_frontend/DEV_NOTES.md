# Development Notes

If you see a build error like:
Module not found: Error: Can't resolve 'react-leaflet'

Run:
npm install react-leaflet leaflet

These packages are declared in package.json, but your environment may need to install them.

If CSS resolution errors occur for Leaflet, we use a local shim (src/leaflet.css) that imports the official CDN stylesheet.

Environment Variables (CRA):
- Place .env in the project root (same dir as package.json).
- Variables must be prefixed with REACT_APP_ to be available in the app.
- Restart the dev server after changing .env.

No authentication flows:
- This app intentionally includes no login/signup screens.
- All features work without user accounts.
