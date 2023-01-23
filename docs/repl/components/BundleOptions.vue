<template>
	<div class="options">
		<section v-for="option in optionsStore.options" :key="option.name">
			<h3>{{ option.name }}</h3>
			<StringSelectOption
				v-if="option.type === 'string-select'"
				:values="option.options"
				:selected="option.value"
				@select="selected => optionsStore.set(option.name, selected)"
			/>
			<BooleanOption
				v-else-if="option.type === 'boolean'"
				:selected="option.value"
				@select="selected => optionsStore.set(option.name, selected)"
			/>
			<input
				v-else-if="option.type === 'string'"
				:value="option.value"
				:placeholder="option.placeholder"
				@input="optionsStore.set(option.name, $event.target.value)"
			/>
			<div
				v-else-if="option.type === 'string-mapping'"
				v-for="imported in option.keys"
				:key="imported"
				class="input-with-label"
			>
				<input
					:value="option.value[imported]"
					@input="
						optionsStore.set(option.name, { ...option.value, [imported]: $event.target.value })
					"
				/>
				<code>'{{ imported }}'</code>
			</div>
		</section>
	</div>
	<select
		v-if="optionsStore.additionalAvailableOptions.length > 0"
		@input="optionsStore.addOption($event.target.value)"
	>
		<option disabled selected value="">More...</option>
		<option v-for="option in optionsStore.additionalAvailableOptions" :key="option" :value="option">
			{{ option }}
		</option>
	</select>
</template>

<script setup lang="ts">
import { useOptions } from '../stores/options';
import BooleanOption from './BooleanOption.vue';
import StringSelectOption from './StringSelectOption.vue';

const optionsStore = useOptions();
</script>

<style scoped>
.options {
	--bg-inactive: var(--vp-c-gray-light-3);
	--bg-active: var(--vp-c-bg);
	--bg-default: var(--vp-c-gray-light-5);
	border: 1px solid var(--vp-c-divider-light);
	margin: 0 0 8px 0;
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
	border-radius: 7px;
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
