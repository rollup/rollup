define(['require', './chunks/chunk'], function (require, shared) { 'use strict';

	CSS.paintWorklet.addModule(new URL(require.toUrl('./chunks/worklet.js'), document.baseURI).href);

	document.body.innerHTML += `<h1 style="background-image: paint(vertical-lines);">color: ${shared.color}, size: ${shared.size}</h1>`;

});
