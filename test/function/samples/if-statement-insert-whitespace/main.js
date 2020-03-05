let works = false;
const makeItWork = () => works = true;

import value from 'external';

if (value) {} else"production"!=="local"?makeItWork():void 0;

assert.ok(works);
