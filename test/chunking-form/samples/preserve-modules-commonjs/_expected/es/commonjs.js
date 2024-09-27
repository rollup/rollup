import require$$0 from 'external';
import { __require as requireOther } from './other.js';

var commonjs;
var hasRequiredCommonjs;

function requireCommonjs () {
	if (hasRequiredCommonjs) return commonjs;
	hasRequiredCommonjs = 1;
	const external = require$$0;
	const { value } = requireOther();

	console.log(external, value);

	commonjs = 42;
	return commonjs;
}

export { requireCommonjs as __require };
