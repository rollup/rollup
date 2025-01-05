'use strict';

import('external', { assert: { type: 'special' } });
import(globalThis.unknown, { assert: { type: 'special' } });
import('resolvedString', { assert: { type: 'special' } });
import('resolved-id', { assert: { type: 'special' } });
import('resolved-different', { assert: { type: 'special' } });
import('unresolved', { assert: { type: 'special' } });
