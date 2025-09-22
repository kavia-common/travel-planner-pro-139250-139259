# Development Notes

If you see a build error like:
Module not found: Error: Can't resolve 'react-leaflet'

Run:
npm install react-leaflet leaflet

These packages are declared in package.json, but your environment may need to install them.

If CSS resolution errors occur for Leaflet, we use a local shim (src/leaflet.css) that imports the official CDN stylesheet.
