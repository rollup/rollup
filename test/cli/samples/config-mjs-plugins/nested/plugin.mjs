import { relative } from 'path';
import { fileURLToPath } from 'url';

export default () => ({
	transform(code) {
		return `#!/usr/bin/env node\nconsole.log('${relative(process.cwd(), fileURLToPath(import.meta.url)).replace(
			'\\',
			'/'
		)}');\n${code}`;
	}
});
