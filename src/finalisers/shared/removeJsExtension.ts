export default function removeJsExtension(name: string): string {
	return name.endsWith('.js') ? name.slice(0, -3) : name;
}
