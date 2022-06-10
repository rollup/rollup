export function isValidUrl(url: string): boolean {
	try {
		new URL(url);
	} catch (_) {
		return false;
	}
	return true;
}
