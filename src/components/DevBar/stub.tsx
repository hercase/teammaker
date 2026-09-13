// Production stand-in for the dev bar. next.config.mjs swaps the real module for this one so the
// fixtures and the panel markup never reach the browser bundle.
const DevBar = () => null;

export default DevBar;
