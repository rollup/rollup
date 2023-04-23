import type { TestConfigBase } from '../types';

declare global {
	function defineTest(config: TestConfigBase): TestConfigBase;
}
