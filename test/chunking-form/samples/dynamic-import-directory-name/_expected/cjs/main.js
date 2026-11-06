'use strict';

Promise.resolve().then(function () { return require('./generated-button.js'); }).then(({ default: button }) => console.log(button));
Promise.resolve().then(function () { return require('./generated-other.js'); }).then(({ default: other }) => console.log(other));
Promise.resolve().then(function () { return require('./generated-single.js'); }).then(({ name }) => console.log(name));
Promise.resolve().then(function () { return require('./generated-index.js'); }).then(({ default: withoutDirectory }) => console.log(withoutDirectory));
Promise.resolve().then(function () { return require('./generated-index2.js'); }).then(({ default: root }) => console.log(root));
Promise.resolve().then(function () { return require('./generated-index3.js'); }).then(({ default: drive }) => console.log(drive));
Promise.resolve().then(function () { return require('./generated-index4.js'); }).then(({ default: dotDotPrefix }) => console.log(dotDotPrefix));
