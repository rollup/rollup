import 'external';
import 'external?type=foo' assert { type: 'foo' };
import 'external?type=bar&foo=baz' assert { type: 'bar', foo: 'baz' };

import('external');
import('external?type=foo', { assert: { type: 'foo' } });
import('external?type=bar&foo=baz', { assert: { type: 'bar', foo: 'baz' } });
