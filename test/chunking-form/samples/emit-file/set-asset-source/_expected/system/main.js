System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const renderStart = exports("renderStart", new URL('assets/renderStart-eFzm3QZM.txt', module.meta.url).href);
			const renderStartNamed = exports("renderStartNamed", new URL('renderStart.txt', module.meta.url).href);
			const renderStartNamedImmediately = exports("renderStartNamedImmediately", 'renderStart.txt');
			const bannerNamed = exports("bannerNamed", new URL('banner.txt', module.meta.url).href);
			const footerNamed = exports("footerNamed", new URL('footer.txt', module.meta.url).href);
			const introNamed = exports("introNamed", new URL('intro.txt', module.meta.url).href);
			const outroNamed = exports("outroNamed", new URL('outro.txt', module.meta.url).href);
			const renderChunkNamed = exports("renderChunkNamed", new URL('renderChunk.txt', module.meta.url).href);
			const generateBundleNamed = exports("generateBundleNamed", new URL('generateBundle.txt', module.meta.url).href);

		})
	};
}));
