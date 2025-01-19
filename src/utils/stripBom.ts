export default function stripBom(content: string): string {
	if (content.charCodeAt(0) === 0xfe_ff) {
		return stripBom(content.slice(1));
	}
	return content;
}
