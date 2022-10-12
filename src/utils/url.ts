export function isValidUrl(url: string): boolean {
	try {
		new URL(url);
	} catch {
		return false;
	}
	return true;
}
