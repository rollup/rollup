import('./generated-button.js').then(({ default: button }) => console.log(button));
import('./generated-other.js').then(({ default: other }) => console.log(other));
import('./generated-single.js').then(({ name }) => console.log(name));
import('./generated-index.js').then(({ default: withoutDirectory }) => console.log(withoutDirectory));
