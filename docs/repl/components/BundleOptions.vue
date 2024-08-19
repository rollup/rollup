<template>
	<div class="options-panel">
		<div class="options">
			<section v-for="option in optionsStore.options" :key="option.name">
				<h3>
					<a :href="getLinkForOption(option.name)">{{ option.name }}</a>
					<button
						v-if="option.removable"
						class="repl-button remove"
						@click="optionsStore.set(option.name, undefined)"
					>
						<span class="label">remove</span>
						<span class="repl-icon-cancel"></span>
					</button>
				</h3>
				<SelectOption
					v-if="option.type === 'select'"
					:values="option.options"
					:selected="option.value"
					@select="selected => optionsStore.set(option.name, selected)"
				/>
				<input
					v-else-if="option.type === 'string'"
					:value="option.value"
					:placeholder="option.placeholder"
					@input="optionsStore.set(option.name, $event.target.value)"
				/>
				<input
					v-else-if="option.type === 'number'"
					:value="option.value"
					:placeholder="option.placeholder"
					type="number"
					min="0"
					step="1"
					@input="optionsStore.set(option.name, Number($event.target.value))"
				/>
				<div
					v-for="imported in option.keys"
					v-else-if="option.type === 'string-mapping'"
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
		<div v-if="optionsStore.additionalAvailableOptions.length > 0" class="add-option">
			<select
				@input="
					optionsStore.addOption($event.target.value);
					$event.target.value = '_';
				"
			>
				<option disabled selected value="_">add option</option>
				<option
					v-for="option in optionsStore.additionalAvailableOptions"
					:key="option"
					:value="option"
				>
					{{ option }}
				</option>
			</select>
			<span class="repl-icon-plus"></span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useOptions } from '../stores/options';
import SelectOption from './SelectOption.vue';

const optionsStore = useOptions();

const getLinkForOption = (option: string) =>
	`/configuration-options/#${option.toLowerCase().split('.').join('-')}`;
</script>

<style scoped>
.options-panel {
	margin-bottom: 8px;
}

.options {
	--bg-inactive: var(--vp-c-gray-light-3);
	--bg-active: var(--vp-c-bg);
	--bg-default: var(--vp-c-gray-light-5);
	border: 1px solid var(--vp-c-divider);
	line-height: 2rem;
	background-color: var(--bg-default);
	border-radius: 8px;
}

.dark .options {
	--bg-inactive: var(--vp-c-gray-dark-3);
	--bg-default: var(--vp-c-bg);
}

h3 {
	padding: 0 0 0 0.5rem;
	margin: 6px 0 2px;
	font-size: 14px;
	font-weight: 500;
	line-height: 20px;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
}

h3 a {
	color: var(--vp-c-text-2);
	transition: 0.2s all;
}

h3 a:hover {
	color: var(--vp-c-text-1);
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

.add-option {
	display: flex;
	flex-direction: row;
	justify-content: end;
	position: relative;
	color: var(--vp-c-text-2);
	transition: 0.2s all;
	margin-top: 4px;
}

.add-option:hover {
	color: var(--vp-c-text-1);
}

select {
	font-family: inherit;
	font-size: 14px;
	font-weight: 500;
	position: relative;
	cursor: pointer;
	appearance: none;
	background: var(--vp-c-bg);
	padding-right: 20px;
	width: 94px;
}

.repl-icon-plus {
	font-size: 0.8em;
	position: absolute;
	right: 0;
}

button.remove {
	color: var(--vp-c-brand);
	font-family: inherit;
	font-size: 14px;
	font-weight: 500;
	padding: 0.2em 0 0.2em 0.2em;
	margin: 0;
	background-color: transparent;
	border: none;
	cursor: pointer;
	outline: none;
	opacity: 0.6;
	transition: all 0.2s;
	line-height: 1rem;
}

button.remove .label {
	opacity: 0;
	transition: all 0.2s;
	padding-right: 0.2em;
}

button.remove:hover,
button.remove:active {
	opacity: 1;
}
button.remove:hover .label,
button.remove:active .label {
	opacity: 1;
}
</style>
