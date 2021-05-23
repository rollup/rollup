let trueProp = 'old';
let falseProp = 'new';

function getClass() {
	return class {
		static [trueProp]() {
			return true;
		}
		static [falseProp]() {
			return false;
		}
	};
}

if (!getClass().old()) throw new Error('old missing');
if (getClass().new()) throw new Error('new present');
trueProp = 'new';
falseProp = 'old';
if (getClass().old()) throw new Error('old present');
if (!getClass().new()) throw new Error('new missing');
