export default function addJsExtension(name: string): string {
	return name.endsWith('.js') ? name : name + '.js';
}
