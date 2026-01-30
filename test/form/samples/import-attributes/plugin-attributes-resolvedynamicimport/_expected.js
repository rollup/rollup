import('a', { with: { type: 'changed' } });
import('resolved-b', { with: { type: 'changed', extra: 'changed' } });
import('b');
import('resolved-a');
