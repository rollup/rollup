'use strict';

import('external', { assert: { type: 'special' } });
import(globalThis.unknown, { with: { type: 'special' } });
import('resolvedString', { with: { type: 'special' } });
import('resolved-id', { assert: { type: 'special' } });
import('resolved-different', { assert: { type: 'special' } });
import('unresolved', { assert: { type: 'special' } });
