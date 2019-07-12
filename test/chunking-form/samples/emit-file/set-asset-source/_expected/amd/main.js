define(['require', 'exports'], function (require, exports) { 'use strict';

	const renderStart = new URL(require.toUrl('./assets/renderStart-66600c78.txt'), document.baseURI).href;
	const banner = new URL(require.toUrl('./assets/banner-2b65cc0c.txt'), document.baseURI).href;
	const footer = new URL(require.toUrl('./assets/footer-e1d2fccb.txt'), document.baseURI).href;
	const intro = new URL(require.toUrl('./assets/intro-520a8116.txt'), document.baseURI).href;
	const outro = new URL(require.toUrl('./assets/outro-21f77720.txt'), document.baseURI).href;

	exports.banner = banner;
	exports.footer = footer;
	exports.intro = intro;
	exports.outro = outro;
	exports.renderStart = renderStart;

	Object.defineProperty(exports, '__esModule', { value: true });

});
