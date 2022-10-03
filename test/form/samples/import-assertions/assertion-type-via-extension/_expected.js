import 'external.json';
import 'external.css' assert { type: 'css' };
import 'external.foo' assert { type: 'special' };
import 'external' assert { type: 'empty' };
import 'external.ignored';

import('external.json');
import('external.css', { assert: { type: 'css' } });
import('external.foo', { assert: { type: 'special' } });
import('external', { assert: { type: 'empty' } });
import('external.ignored');
