import 'register-paint-worklet:./worklet.js';
import { color, size } from './shared';

document.body.innerHTML += `<h1 style="background-image: paint(vertical-lines);">color: ${color}, size: ${size}</h1>`;
