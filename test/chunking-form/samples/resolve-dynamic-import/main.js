import './nested/nested.js';

import 'existing-name';
import './direct-relative-external';
import './indirect-relative-external';
import 'direct-absolute-external';
import 'indirect-absolute-external';

//main
import(`existing-name`);
import('./direct-relative-external');
import('./indirect-relative-external');
import('direct-absolute-external');
import('indirect-absolute-external');

import('dynamic-direct-external' + unknown);
import('dynamic-indirect-external' + unknown);
import('dynamic-indirect-existing' + unknown);
import('dynamic-replaced' + unknown);
