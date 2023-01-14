<template>
	<!-- eslint-disable vue/no-mutating-props -->
	<article
		class="module"
		:class="{ 'entry-module': isMain || module.isEntry, 'has-input': !isMain }"
	>
		<header>
			<span v-if="isMain" class="module-name">
				main.js
				<span class="entry-module-label">(entry module)</span>
			</span>
			<span v-else>
				<input ref="input" v-model="module.name" @focus="selectName" placeholder="foo.js" />
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
	border-radius: 8px;
	border: 2px solid var(--vp-c-bg-mute);
	background-color: var(--vp-c-bg-mute);
	color: var(--vp-c-text-1);
	transition: all 0.2s;
}

.module.entry-module {
	border-color: var(--vp-c-brand);
}

header {
	width: 100%;
	border-radius: 6px;
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
	position: relative;
}

.module-name {
	display: block;
	padding: 0.5em;
}

.entry-module-label {
	position: absolute;
	right: 0;
	padding-right: 0.5em;
	color: var(--vp-c-brand);
}

input {
	padding: 0.75em 0.5em;
	border-radius: 6px;
}

.has-input header:hover,
input:focus {
	background-color: var(--vp-c-bg-alt);
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
}

.remove {
	top: 0;
	color: var(--vp-custom-block-danger-text);
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
	transition: all 0.2s;
}

.entry-module .toggle-entry .label {
	color: var(--vp-c-brand);
	opacity: 1;
}

.entry-module button.toggle-entry {
	opacity: 1;
}

.entry-module button.toggle-entry .icon-minus {
	opacity: 0.6;
}

.entry-module button.toggle-entry:hover .icon-minus {
	opacity: 1;
}

button:hover .label,
button:active .label {
	opacity: 0.6;
}

.icon-cancel,
.icon-plus,
.icon-minus {
	font-size: 0.8em;
	transition: opacity 0.2s;
}
</style>
