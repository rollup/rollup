<template>
	<!-- eslint-disable vue/no-mutating-props -->
	<article class="module" :class="{ 'entry-module': isMain || module.isEntry }">
		<header>
			<span v-if="isMain" class="entry-module-name">
				main.js
				<span class="entry-module-label">(entry module)</span>
			</span>
			<span v-else>
				<input
					ref="input"
					v-model="module.name"
					class="module-name"
					@focus="selectName"
					placeholder="foo.js"
				/>
				<button class="remove" @click="emit('remove')">
					<span class="label">remove</span>
					<span class="icon-cancel"></span>
				</button>
				<button class="toggle-entry" @click="module.isEntry = !module.isEntry">
					<span class="label">(entry&nbsp;module)</span>
					<span v-if="module.isEntry" class="icon-minus"></span>
					<span v-else class="icon-plus"></span>
				</button>
			</span>
		</header>
		<ReplEditor v-model:code="module.code" :moduleName="module.name" />
	</article>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Module } from '../stores/modules';
import ReplEditor from './ReplEditor.vue';

defineProps<{
	isMain: boolean;
	module: Module;
}>();
const emit = defineEmits<{ (event: 'remove'): void }>();
const input = ref<HTMLInputElement | null>(null);

const selectName = (event: FocusEvent) => {
	const { value } = event.target as HTMLInputElement;
	const [name] = value.split('.');
	input.value?.setSelectionRange(0, name.length);
};
</script>

<style scoped>
.module {
	margin: 0 0 0.5rem 0;
	border: 1px solid #f4f4f4;
}

header {
	width: 100%;
	border-bottom: 1px solid #f4f4f4;
	position: relative;
}

.entry-module {
	border: 1px solid #ccc;
}

.entry-module-name {
	display: block;
	padding: 0.5em;
}

.entry-module-label {
	color: #555;
	opacity: 0.6;
	position: absolute;
	right: 0;
	padding-right: 0.5em;
}

input {
	padding: 0.75em 0.5em;
}

button {
	position: absolute;
	display: block;
	right: 0;
	font-family: inherit;
	font-size: inherit;
	padding: 0.2em;
	margin: 0;
	background-color: transparent;
	border: none;
	cursor: pointer;
	outline: none;
	opacity: 0.4;
	-webkit-transition: opacity 0.2s;
	transition: opacity 0.2s;
	line-height: 1rem;
}

.toggle-entry {
	bottom: 0;
	color: #555;
}

.remove {
	top: 0;
	color: #e94c43;
}

button:hover,
button:active,
.entry-module .toggle-entry:hover,
.entry-module .toggle-entry:active {
	opacity: 1;
	background-color: transparent;
}

button .label {
	position: absolute;
	right: 100%;
	opacity: 0;
	-webkit-transition: opacity 0.2s;
	transition: opacity 0.2s;
}

.entry-module .toggle-entry .label {
	opacity: 1;
}

.entry-module button.toggle-entry {
	opacity: 0.6;
}

button:hover .label,
button:active .label {
	opacity: 0.6;
}

.icon-cancel,
.icon-plus,
.icon-minus {
	font-size: 0.8em;
}
</style>
