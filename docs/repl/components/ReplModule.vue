<template>
	<!-- eslint-disable vue/no-mutating-props -->
	<article class="module" :class="{ 'entry-module': module.isEntry }">
		<header>
			<span v-if="editableHeader">
				<input ref="input" v-model="module.name" @focus="selectName" placeholder="foo.js" />
				<button class="repl-button remove" @click="emit('remove')">
					<span class="label">remove</span>
					<span class="repl-icon-cancel"></span>
				</button>
				<button class="repl-button toggle-entry" @click="module.isEntry = !module.isEntry">
					<span class="label">(entry&nbsp;module)</span>
					<span v-if="module.isEntry" class="repl-icon-minus"></span>
					<span v-else class="repl-icon-plus"></span>
				</button>
			</span>
			<span v-else-if="showHeader" class="module-name">
				{{ module.name }}
				<span v-if="module.isEntry" class="entry-module-label">(entry module)</span>
			</span>
		</header>
		<ReplEditor v-model:code="module.code" :moduleName="module.name" :readonly="!editable" />
	</article>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Module } from '../../types';
import ReplEditor from './ReplEditor.vue';

defineProps<{
	editable?: boolean;
	editableHeader?: boolean;
	module: Module;
	showHeader: boolean;
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
	margin: 0 -16px 8px -16px;
	border-radius: 0;
	background-color: var(--vp-code-block-bg);
	color: var(--vp-c-text-1);
	transition: all 0.2s;
}

.module.entry-module {
	color: var(--vp-button-brand-text);
}

header {
	width: 100%;
	color: var(--vp-c-text-dark-1);
	position: relative;
	font-weight: 600;
}

.module-name {
	border: 1px solid transparent;
	display: block;
	padding: 0.5em;
}

.entry-module .module-name {
	border-color: var(--vp-button-brand-border);
	color: var(--vp-button-brand-text);
	background-color: var(--vp-button-brand-bg);
	display: block;
	padding: 0.5em;
}

.entry-module-label {
	position: absolute;
	right: 0;
	padding-right: 0.5em;
	color: var(--vp-button-brand-text);
	font-size: 14px;
	font-weight: 500;
}

input {
	border: 1px solid transparent;
	padding: 0.6em 0.5em;
	font-weight: 600;
	transition: all 0.2s;
}

input:hover {
	border-color: var(--vp-c-gray-dark-2);
	background-color: var(--vp-c-gray-dark-3);
}

input:focus {
	border-color: var(--vp-c-gray-dark-2);
	background-color: var(--vp-c-gray-dark-2);
}

.entry-module input {
	border-color: var(--vp-button-brand-border);
	color: var(--vp-button-brand-text);
	background-color: var(--vp-button-brand-bg);
}

button {
	position: absolute;
	display: block;
	right: 0;
	font-family: inherit;
	font-size: 14px;
	font-weight: 500;
	padding: 0.2em;
	margin: 0;
	background-color: transparent;
	border: none;
	cursor: pointer;
	outline: none;
	opacity: 0.6;
	transition: all 0.2s;
	line-height: 1rem;
}

.toggle-entry {
	bottom: 0;
}

.remove {
	top: 2px;
	color: var(--vp-c-brand);
}

button:hover,
button:active,
.toggle-entry:hover,
.toggle-entry:active {
	opacity: 1;
	background-color: transparent;
}

button .label {
	position: absolute;
	right: 100%;
	opacity: 0;
	transition: all 0.2s;
}

.entry-module .toggle-entry .label {
	color: var(--vp-button-brand-text);
	opacity: 1;
}

.entry-module button.toggle-entry {
	opacity: 1;
}

.entry-module button.toggle-entry .repl-icon-minus {
	opacity: 0.6;
}

.entry-module button.toggle-entry:hover .repl-icon-minus {
	opacity: 1;
}

.entry-module .remove {
	color: var(--vp-button-brand-text);
}

button:hover .label,
button:active .label {
	opacity: 1;
}

.repl-icon-cancel,
.repl-icon-plus,
.repl-icon-minus {
	font-size: 0.8em;
	transition: all 0.2s;
}

@media (min-width: 640px) {
	.module {
		margin: 0 0 0.5rem 0;
		border-radius: 8px;
	}

	.module-name {
		border-top-left-radius: 8px;
		border-top-right-radius: 8px;
	}

	input {
		border-top-left-radius: 8px;
		border-top-right-radius: 8px;
	}
}
</style>
