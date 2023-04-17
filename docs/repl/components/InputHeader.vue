<template>
	<header>
		<select :value="modulesStore.selectedExample" @input="handleInput">
			<option disabled selected value="">Select an example...</option>
			<option v-for="(example, id) in examplesById" :key="id" :value="id">
				{{ example.title }}
			</option>
		</select>
		<button class="repl-button start-over" @click="startOver">Start over</button>
	</header>
</template>

<script setup lang="ts">
import examplesById from 'examples.json';
import { useModules } from '../stores/modules';
import { useOptions } from '../stores/options';

const modulesStore = useModules();
const optionsStore = useOptions();
const handleInput = (event: InputEvent) =>
	modulesStore.selectExample((event.target as HTMLSelectElement).value);
const startOver = () => {
	modulesStore.set([{ code: '', isEntry: true, name: 'main.js' }], '');
	optionsStore.setAll({});
};
</script>

<style scoped>
header {
	margin-bottom: 1.25rem;
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	column-gap: 0.5rem;
}

select {
	font-family: inherit;
	font-size: 14px;
	font-weight: 500;
	position: relative;
	cursor: pointer;
	appearance: none;
	border-radius: 8px;
	padding: 0 48px 0 8px;
	background: var(--vp-button-alt-bg) url(../images/select-arrow.svg) no-repeat 100% 50%;
	background-size: auto 100%;
	line-height: 38px;
}

.dark select {
	background: var(--vp-button-alt-bg) url(../images/select-arrow-dark.svg) no-repeat 100% 50%;
}

select,
.start-over {
	margin-bottom: 0.25rem;
}

button {
	border-radius: 20px;
	background-color: var(--vp-button-alt-bg);
	padding: 0 16px;
	height: 40px;
	font-size: 14px;
	font-weight: 500;
}

select,
button {
	border: 1px solid var(--vp-button-alt-border);
	color: var(--vp-button-alt-text);
}

select:hover,
button:hover {
	background-color: var(--vp-button-alt-hover-bg);
	border-color: var(--vp-button-alt-hover-border);
	color: var(--vp-button-alt-hover-text);
}

select:active,
button:active {
	background-color: var(--vp-button-alt-active-bg);
	border-color: var(--vp-button-alt-active-border);
	color: var(--vp-button-alt-active-text);
}

@media (min-width: 400px) {
	.start-over {
		float: right;
	}
}
</style>
