import './generated-existing.js';
import './direct-relative-external';
import 'to-indirect-relative-external';
import 'direct-absolute-external';
import 'to-indirect-absolute-external';

// nested
import('./generated-existing.js');
import('./direct-relative-external');
import('to-indirect-relative-external');
import('direct-absolute-external');
import('to-indirect-absolute-external');

//main
import('./generated-existing.js');
import('./direct-relative-external');
import('to-indirect-relative-external');
import('direct-absolute-external');
import('to-indirect-absolute-external');

import('dynamic-direct-external' + unknown);
import('to-dynamic-indirect-external');
import('./generated-existing.js');
import('my' + 'replacement');
