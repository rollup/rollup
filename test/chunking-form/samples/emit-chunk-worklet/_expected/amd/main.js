define(['module', './chunks/chunk'], function (module, __chunk_1) { 'use strict';

	CSS.paintWorklet.addModule(new URL(module.uri + '/../chunks/worklet.js', document.baseURI).href);

	document.body.innerHTML += `<h1 style="background-image: paint(vertical-lines);">color: ${__chunk_1.color}, size: ${__chunk_1.size}</h1>`;

});
