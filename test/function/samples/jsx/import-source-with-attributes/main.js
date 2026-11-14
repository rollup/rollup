import { jsx as jsxWithAttributes } from './jsx-runtime.js' with { type: 'custom' };

assert.equal(jsxWithAttributes('span'), 'span');
assert.equal(<div />, 'div');
