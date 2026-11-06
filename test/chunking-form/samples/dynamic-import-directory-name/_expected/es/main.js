import('./generated-button.js').then(({ default: button }) => console.log(button));
import('./generated-other.js').then(({ default: other }) => console.log(other));
import('./generated-single.js').then(({ name }) => console.log(name));
import('./generated-index.js').then(({ default: withoutDirectory }) => console.log(withoutDirectory));
import('./generated-index2.js').then(({ default: root }) => console.log(root));
import('./generated-index3.js').then(({ default: drive }) => console.log(drive));
import('./generated-index4.js').then(({ default: dotDotPrefix }) => console.log(dotDotPrefix));
