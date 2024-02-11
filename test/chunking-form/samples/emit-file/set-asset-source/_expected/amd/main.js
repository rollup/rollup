define(['require', 'exports'], (function (require, exports) { 'use strict';

	const renderStart = new URL(require.toUrl('./assets/renderStart-B4XObdBk.txt'), document.baseURI).href;
	const renderStartNamed = new URL(require.toUrl('./renderStart.txt'), document.baseURI).href;
	const renderStartNamedImmediately = 'renderStart.txt';
	const bannerNamed = new URL(require.toUrl('./banner.txt'), document.baseURI).href;
	const footerNamed = new URL(require.toUrl('./footer.txt'), document.baseURI).href;
	const introNamed = new URL(require.toUrl('./intro.txt'), document.baseURI).href;
	const outroNamed = new URL(require.toUrl('./outro.txt'), document.baseURI).href;
	const renderChunkNamed = new URL(require.toUrl('./renderChunk.txt'), document.baseURI).href;
	const generateBundleNamed = new URL(require.toUrl('./generateBundle.txt'), document.baseURI).href;

	exports.bannerNamed = bannerNamed;
	exports.footerNamed = footerNamed;
	exports.generateBundleNamed = generateBundleNamed;
	exports.introNamed = introNamed;
	exports.outroNamed = outroNamed;
	exports.renderChunkNamed = renderChunkNamed;
	exports.renderStart = renderStart;
	exports.renderStartNamed = renderStartNamed;
	exports.renderStartNamedImmediately = renderStartNamedImmediately;

}));
