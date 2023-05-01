import type { TestConfigForm } from '../types';

declare global {
	function defineTest(config: TestConfigForm): TestConfigForm;
}
