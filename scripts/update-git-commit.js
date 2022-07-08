import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

let revision;
try {
	revision = execSync('git rev-parse HEAD').toString().trim();
} catch (e) {
	console.warn('Could not determine git commit when building Rollup.');
	revision = '(could not be determined)';
}
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), '../.commithash'), revision);
