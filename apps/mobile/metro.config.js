/* Metro has to be told that the game is an asset.
 *
 * The whole game is one HTML file (1 MB, no external requests), and the app
 * ships it rather than fetching it: that is what makes the phone work on a
 * plane, and what makes the app and the single file the same game. Metro's
 * default asset list has images, fonts and media - not `.html` or
 * `.webmanifest` - so both are added here, and `expo-asset` then hands the
 * WebView a local URI. */
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('html', 'webmanifest', 'svg', 'png', 'md');
module.exports = config;
