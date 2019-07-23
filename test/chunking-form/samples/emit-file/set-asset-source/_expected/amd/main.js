define(['require', 'exports'], function (require, exports) { 'use strict';

	const renderStart = new URL(require.toUrl('./assets/renderStart-66600c78.txt'), document.baseURI).href;
	const renderStartNamed = new URL(require.toUrl('./renderStart.txt'), document.baseURI).href;
	const renderStartNamedImmediately = 'renderStart.txt';
	const banner = new URL(require.toUrl('./assets/banner-2b65cc0c.txt'), document.baseURI).href;
	const bannerNamed = new URL(require.toUrl('./banner.txt'), document.baseURI).href;
	const footer = new URL(require.toUrl('./assets/footer-e1d2fccb.txt'), document.baseURI).href;
	const footerNamed = new URL(require.toUrl('./footer.txt'), document.baseURI).href;
	const intro = new URL(require.toUrl('./assets/intro-520a8116.txt'), document.baseURI).href;
	const introNamed = new URL(require.toUrl('./intro.txt'), document.baseURI).href;
	const outro = new URL(require.toUrl('./assets/outro-21f77720.txt'), document.baseURI).href;
	const outroNamed = new URL(require.toUrl('./outro.txt'), document.baseURI).href;

	exports.banner = banner;
	exports.bannerNamed = bannerNamed;
	exports.footer = footer;
	exports.footerNamed = footerNamed;
	exports.intro = intro;
	exports.introNamed = introNamed;
	exports.outro = outro;
	exports.outroNamed = outroNamed;
	exports.renderStart = renderStart;
	exports.renderStartNamed = renderStartNamed;
	exports.renderStartNamedImmediately = renderStartNamedImmediately;

	Object.defineProperty(exports, '__esModule', { value: true });

});
