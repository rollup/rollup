const { execSync } = require('child_process');
const { writeFileSync } = require('fs');
const { join } = require('path');

let revision;
try {
	revision = execSync('git rev-parse HEAD').toString().trim();
} catch (e) {
	console.warn('Could not determine git commit when building Rollup.');
	revision = '(could not be determined)';
}
writeFileSync(join(__dirname, '../.commithash'), revision);
