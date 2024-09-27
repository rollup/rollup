import { __exports as other } from './_virtual/other.js';

var hasRequiredOther;

function requireOther () {
	if (hasRequiredOther) return other;
	hasRequiredOther = 1;
	other.value = 43;
	return other;
}

export { requireOther as __require };
