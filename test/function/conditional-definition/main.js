import { env } from './env';

assert.equal( env(), 'node' );
assert.equal( env(), 'node' ); // to check that the env Declaration is only tested once
