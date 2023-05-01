import type { TestConfigCli } from '../types';

declare global {
	function defineTest(config: TestConfigCli): TestConfigCli;
}
