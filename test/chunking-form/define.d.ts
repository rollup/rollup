import type { TestConfigChunkingForm } from '../types';

declare global {
	function defineTest(config: TestConfigChunkingForm): TestConfigChunkingForm;
}
