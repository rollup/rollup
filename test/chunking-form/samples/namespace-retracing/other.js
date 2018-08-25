import { Broken } from './broken';

Broken.doSomething();

export class Other {
}

Other.doSomething = function() { console.log('other'); }