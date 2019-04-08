import asset2 from 'resolved';
import asset3 from 'unresolved';

import('solved').then(result => console.log(result, asset2, asset3));
