import('external1', undefined);
import('external2', global);
import('external3', { with: 'invalid' });
import('external4', { with: { foo } });
import('external5', { with: { foo: bar } });
import('external6', { with: { foo() {} } });
import('external7', { with: { [invalid]: 'foo' } });
import('external8', { with: { foo: 'valid' } });
