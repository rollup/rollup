<template>
	<InputHeader />

	<div class="modules" ref="modulesReference">
		<InputModule
			v-for="(module, i) in modulesStore.modules"
			:key="module.name"
			:module="module"
			:is-main="i === 0"
			@remove="removeModule(i)"
		/>
	</div>

	<button class="new-module" @click="createModule">
		<span class="icon icon-plus"></span>
		add module
	</button>
</template>

<script setup lang="ts">
import { useModules } from '../stores/modules';
import InputModule from './InputModule.vue';
import InputHeader from './InputHeader.vue';
import { ref } from 'vue';

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
	color: #3d9970;
	border: none;
	padding: 0;
	margin-bottom: 0;
	line-height: 2.25rem;
}
</style>
