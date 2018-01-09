import relative from 'require-relative';
import * as chokidarType from 'chokidar';

let chokidar: typeof chokidarType;

try {
	chokidar = relative('chokidar', process.cwd());
} catch (err) {
	chokidar = null;
}

export default chokidar;
