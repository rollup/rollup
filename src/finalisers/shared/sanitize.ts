export const keypath = (keypath: string, getPropertyAccess: (name: string) => string): string =>
	keypath.split('.').map(getPropertyAccess).join('');
