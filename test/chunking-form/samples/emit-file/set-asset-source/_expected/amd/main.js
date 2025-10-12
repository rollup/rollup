define(['module', 'require', 'exports'], (function (module, require, exports) { 'use strict';

	const renderStart = new URL(require.toUrl('./assets/renderStart-B4XObdBk.txt'), new URL(module.uri, document.baseURI).href).href;
	const renderStartNamed = new URL(require.toUrl('./renderStart.txt'), new URL(module.uri, document.baseURI).href).href;
	const renderStartNamedImmediately = 'renderStart.txt';
	const bannerNamed = new URL(require.toUrl('./banner.txt'), new URL(module.uri, document.baseURI).href).href;
	const footerNamed = new URL(require.toUrl('./footer.txt'), new URL(module.uri, document.baseURI).href).href;
	const introNamed = new URL(require.toUrl('./intro.txt'), new URL(module.uri, document.baseURI).href).href;
	const outroNamed = new URL(require.toUrl('./outro.txt'), new URL(module.uri, document.baseURI).href).href;
	const renderChunkNamed = new URL(require.toUrl('./renderChunk.txt'), new URL(module.uri, document.baseURI).href).href;
	const generateBundleNamed = new URL(require.toUrl('./generateBundle.txt'), new URL(module.uri, document.baseURI).href).href;

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
