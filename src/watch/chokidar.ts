import relative from 'require-relative';

let chokidar;

try {
	chokidar = relative('chokidar', process.cwd());
} catch (err) {
	chokidar = null;
}

export default chokidar;
