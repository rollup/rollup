import x from 'external';

export default true ? {
	a: x.totallyMutated = true,
	makeSureThisIsAnObject: true
} : null;
