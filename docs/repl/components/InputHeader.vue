<template>
	<header>
		<select :value="modulesStore.selectedExample" @input="handleInput">
			<option disabled selected value="">Select an example...</option>
			<option v-for="(example, id) in examplesById" :key="id" :value="id">
				{{ example.title }}
			</option>
		</select>
		<button class="start-over" @click="startOver">Start over</button>
	</header>
</template>

<script setup lang="ts">
import { useModules } from '../stores/modules';
import { examplesById } from '../stores/examples';

const modulesStore = useModules();
const handleInput = (event: InputEvent) =>
	modulesStore.selectExample((event.target as HTMLSelectElement).value);
const startOver = () => modulesStore.set([{ code: '', isEntry: true, name: 'main.js' }], '');
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
	font-size: inherit;
	font-family: inherit;
	position: relative;
	border: none;
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
	border-radius: 0;
	padding: 0 2.5rem 0 0.5rem;
	background: #eee url(../images/select-arrow.svg) no-repeat 100% 50%;
	background-size: auto 100%;
	outline: none;
	line-height: 2.25rem;
}

select,
.start-over {
	margin-bottom: 0.25rem;
}

@media (min-width: 400px) {
	.start-over {
		float: right;
	}
}
</style>
