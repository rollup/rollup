import('./components/button').then(({ default: button }) => console.log(button));
import('./components/other').then(({ default: other }) => console.log(other));
import('./single.js').then(({ name }) => console.log(name));
import('without-directory').then(({ default: withoutDirectory }) => console.log(withoutDirectory));
