<template>
	<div class="select">
		<button
			v-for="value in values"
			:key="String(value)"
			class="repl-button"
			:class="{ selected: value === selected }"
			@click="emit('select', value)"
		>
			{{ String(value) }}
		</button>
	</div>
</template>

<script setup lang="ts">
defineProps<{ selected: unknown; values: unknown[] }>();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{ (event: 'select', selected: unknown): void }>();
</script>

<style scoped>
.select {
	background-color: var(--bg-inactive);
	border: 1px solid var(--bg-default);
	border-radius: 7px;
	padding: 2px;
	display: flex;
}

button {
	display: block;
	border-radius: 6px;
	border: 1px solid transparent;
	font-size: 0.8rem;
	margin: 0;
	padding: 0;
	flex-basis: 0;
	flex-grow: 1;
	line-height: 2rem;
	transition: all 0.2s;
}

.selected {
	background-color: var(--bg-active);
	font-weight: bold;
	border-color: var(--vp-c-brand);
}
</style>
