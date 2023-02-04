<template>
	<InputHeader />

	<div class="modules" ref="modulesReference">
		<ReplModule
			v-for="(module, i) in modulesStore.modules"
			:key="i"
			:module="module"
			:editable-header="i > 0"
			editable
			show-header
			@remove="removeModule(i)"
		/>
	</div>

	<button class="new-module" @click="createModule">
		<span class="icon icon-plus"></span>
		add module
	</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useModules } from '../stores/modules';
import InputHeader from './InputHeader.vue';
import ReplModule from './ReplModule.vue';

const modulesStore = useModules();
let uid = 1;
const modulesReference = ref<HTMLElement | null>(null);

const removeModule = (index: number) => modulesStore.modules.splice(index, 1);

function createModule() {
	modulesStore.modules.push({
		code: '',
		isEntry: false,
		name: `module_${uid++}.js`
	});
	setTimeout(() => {
		const inputs = modulesReference.value?.querySelectorAll('input');
		if (inputs) {
			const input = inputs[inputs.length - 1];
			input.focus();
		}
	});
}
</script>

<style scoped>
.new-module {
	display: block;
	width: 100%;
	color: var(--vp-button-alt-text);
	border: 1px solid var(--vp-button-alt-border);
	background-color: var(--vp-button-alt-bg);
	border-radius: 20px;
	padding: 0;
	margin-bottom: 0;
	line-height: 38px;
	transition: all 0.2s;
}

.new-module:hover {
	color: var(--vp-button-alt-hover-text);
	border-color: var(--vp-button-alt-hover-border);
	background-color: var(--vp-button-alt-hover-bg);
}

.new-module:active {
	color: var(--vp-button-alt-active-text);
	border-color: var(--vp-button-alt-active-border);
	background-color: var(--vp-button-alt-active-bg);
}
</style>
