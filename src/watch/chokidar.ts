import * as chokidarType from 'chokidar';
import relative from 'require-relative';

let chokidar: typeof chokidarType;

try {
	chokidar = relative('chokidar', process.cwd());
} catch (err) {
	chokidar = null;
}

export default chokidar;
