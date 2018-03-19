import { fn } from './chunk-b663d499.js';

function fn$1 () {
  console.log('dep1 fn');
}

class Main1 {
  constructor () {
    fn$1();
    fn();
  }
}

export default Main1;
//# sourceMappingURL=main1.js.map
