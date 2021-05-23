let prop = 'old';

function getObj() {
	return {
		[prop]: true
	};
}

if (!getObj().old) throw new Error('old missing');
if (getObj().new) throw new Error('new present');
prop = 'new';
if (getObj().old) throw new Error('old present');
if (!getObj().new) throw new Error('new missing');
