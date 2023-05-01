import type { TestConfigFileHash } from '../types';

declare global {
	function defineTest(config: TestConfigFileHash): TestConfigFileHash;
}
