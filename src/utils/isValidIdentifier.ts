const validIdentifier = /^(?!\d)[\w$]+$/;

export function isValidIdentifier(name: string): boolean {
	return validIdentifier.test(name);
}
