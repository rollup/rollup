import { a as color, b as size } from './chunks/chunk.js';

CSS.paintWorklet.addModule(new URL('chunks/worklet.js', import.meta.url).href);

document.body.innerHTML += `<h1 style="background-image: paint(vertical-lines);">color: ${color}, size: ${size}</h1>`;
