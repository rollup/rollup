import at from './wrapperAt.js';
import chain from './chain.js';
import commit from './commit.js';
import lodash from './wrapperLodash.js';
import next from './next.js';
import plant from './plant.js';
import reverse from './wrapperReverse.js';
import tap from './tap.js';
import thru from './thru.js';
import toIterator from './toIterator.js';
import valueOf$2 from './toJSON.js';
import valueOf$2 from './wrapperValue.js';
import valueOf$2 from './valueOf.js';
import wrapperChain from './wrapperChain.js';

var seq = {
  at, chain, commit, lodash, next,
  plant, reverse, tap, thru, toIterator,
  toJSON: valueOf$2, value: valueOf$2, valueOf: valueOf$2, wrapperChain
};

export default seq;
