<template>
	<div class="options">
		<section>
			<h3>output.format</h3>
			<div class="option-buttons">
				<button
					v-for="format in formats"
					:key="format"
					:class="{ selected: format === optionsStore.options.format }"
					@click="optionsStore.options.format = format"
				>
					{{ format }}
				</button>
			</div>
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
	margin: 0 0 1.5rem 0;
	line-height: 2rem;
	background-color: var(--bg-default);
	border-radius: 8px;
}

.dark .options {
	--bg-inactive: var(--vp-c-gray-dark-3);
	--bg-default: var(--vp-c-gray-dark-5);
	background-color: var(--bg-default);
}

.option-buttons {
	background-color: var(--bg-inactive);
	border: 1px solid var(--bg-default);
	border-radius: 8px;
	padding: 2px;
	display: flex;
}

button {
	display: block;
	border-radius: 6px;
	font-size: 0.8rem;
	margin: 0;
	flex-basis: 0;
	flex-grow: 1;
	line-height: 2rem;
}

.selected {
	background-color: var(--bg-active);
	font-weight: bold;
}

h3 {
	padding: 0 0.5rem;
	margin: 0;
	font-size: 1em;
	font-weight: 700;
	line-height: 2rem;
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
