import type { TestConfigBrowser } from '../types';

declare global {
	function defineTest(config: TestConfigBrowser): TestConfigBrowser;
}
