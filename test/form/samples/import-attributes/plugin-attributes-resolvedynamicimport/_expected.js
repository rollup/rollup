import('a', { assert: { type: 'changed' } });
import('resolved-b', { assert: { type: 'changed', extra: 'changed' } });
import('b');
import('resolved-a');
