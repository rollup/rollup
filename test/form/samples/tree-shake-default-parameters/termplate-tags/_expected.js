const templateTag = (_, a = 'retained', b = 'retained', c, d = 'retained') => {
	console.log(a, b, c);
};

templateTag`${isUndefined}${'b'}${'c'}`;
templateTag`${'a'}${globalThis.unknown}${'c'}`;
