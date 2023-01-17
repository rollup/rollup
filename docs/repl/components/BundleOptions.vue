<template>
	<div class="options">
		<section>
			<h3>output.format</h3>
			<OptionsSelect
				:values="formats"
				:selected="optionsStore.options.format"
				@select="selected => (optionsStore.options.format = selected)"
			/>
		</section>
		<div v-if="!rollupOutputStore.output.error">
			<section
				v-if="optionsStore.options.format === 'amd' || optionsStore.options.format === 'umd'"
			>
				<h3>output.amd.id</h3>
				<input
					v-model="optionsStore.options.amd.id"
					placeholder="leave blank for anonymous module"
				/>
			</section>
			<div
				v-if="
					rollupOutputStore.output.output[0] &&
					(optionsStore.options.format === 'iife' || optionsStore.options.format === 'umd')
				"
			>
				<section v-if="rollupOutputStore.output.output[0].exports.length > 0">
					<h3>output.name</h3>
					<input v-model="optionsStore.options.name" />
				</section>
				<section v-if="sortedImports.length > 0">
					<h3>output.globals</h3>
					<div v-for="x in sortedImports" :key="x" class="input-with-label">
						<input v-model="optionsStore.options.globals[x]" />
						<code>'{{ x }}'</code>
					</div>
				</section>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useOptions } from '../stores/options';
import { useRollupOutput } from '../stores/rollupOutput';
import OptionsSelect from './OptionsSelect.vue';

const rollupOutputStore = useRollupOutput();
const optionsStore = useOptions();

const sortedImports = computed(() => {
	const { output } = rollupOutputStore.output;
	const { format } = optionsStore.options;
	if ((format !== 'iife' && format !== 'umd') || output.length === 0) return [];
	return output[0].imports.sort((a, b) => (a < b ? -1 : 1));
});

const formats = ['es', 'amd', 'cjs', 'iife', 'umd', 'system'];
</script>

<style scoped>
.options {
	--bg-inactive: var(--vp-c-gray-light-3);
	--bg-active: var(--vp-c-bg);
	--bg-default: var(--vp-c-gray-light-5);
	border: 1px solid var(--vp-c-divider-light);
	margin: 0.5rem 0;
	line-height: 2rem;
	background-color: var(--bg-default);
	border-radius: 8px;
}

.dark .options {
	--bg-inactive: var(--vp-c-gray-dark-3);
	--bg-default: var(--vp-c-bg);
	background-color: var(--bg-default);
}

h3 {
	padding: 0 0.5rem;
	color: var(--vp-c-text-2);
	margin: 6px 0 2px;
	font-size: 14px;
	font-weight: 500;
	line-height: 20px;
}

input {
	font-size: 0.8rem;
	padding: 0 0.5rem;
	line-height: 2rem;
	background-color: var(--bg-inactive);
	border: 1px solid var(--bg-default);
	border-radius: 8px;
}

.input-with-label {
	position: relative;
}

section code {
	font-size: 0.8rem;
	line-height: 2rem;
	position: absolute;
	display: block;
	right: 0;
	top: 0;
	padding: 0 0.5rem 0 1.5rem;
}
</style>
