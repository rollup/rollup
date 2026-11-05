import('./components/button').then(({ default: button }) => console.log(button));
import('./components/other').then(({ default: other }) => console.log(other));
import('./single.js').then(({ name }) => console.log(name));
import('without-directory').then(({ default: withoutDirectory }) => console.log(withoutDirectory));
import('root-index').then(({ default: root }) => console.log(root));
import('drive-index').then(({ default: drive }) => console.log(drive));
import('./..components').then(({ default: dotDotPrefix }) => console.log(dotDotPrefix));
