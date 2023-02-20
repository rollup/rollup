export function getFileNameFromMessage({ id, loc }: { id?: string; loc?: { file?: string } }) {
	return (loc && loc.file) || id;
}
