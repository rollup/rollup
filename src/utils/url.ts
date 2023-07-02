export function isValidUrl(url: string): boolean {
	try {
		new URL(url);
	} catch {
		return false;
	}
	return true;
}

export function getRollupUrl(snippet: string) {
	return `https://rollupjs.org/${snippet}`;
}

export function addTrailingSlashIfMissed(url: string) {
	if (!url.endsWith('/')) {
		return url + '/';
	}
	return url;
}
