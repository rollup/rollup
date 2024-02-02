const renderStart = new URL('assets/renderStart-B4XObdBk.txt', import.meta.url).href;
const renderStartNamed = new URL('renderStart.txt', import.meta.url).href;
const renderStartNamedImmediately = 'renderStart.txt';
const bannerNamed = new URL('banner.txt', import.meta.url).href;
const footerNamed = new URL('footer.txt', import.meta.url).href;
const introNamed = new URL('intro.txt', import.meta.url).href;
const outroNamed = new URL('outro.txt', import.meta.url).href;
const renderChunkNamed = new URL('renderChunk.txt', import.meta.url).href;
const generateBundleNamed = new URL('generateBundle.txt', import.meta.url).href;

export { bannerNamed, footerNamed, generateBundleNamed, introNamed, outroNamed, renderChunkNamed, renderStart, renderStartNamed, renderStartNamedImmediately };
