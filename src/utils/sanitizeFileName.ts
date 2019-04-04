export function sanitizeFileName(name: string): string {
	return name.replace(/[\0]/g, '_');
}
