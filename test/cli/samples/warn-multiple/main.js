'use stuff';

import url from 'url';
import assert from 'assert';
import 'external';
import {doesNotExist} from './dep.js';

console.log(this);

export {url, assert as default};
