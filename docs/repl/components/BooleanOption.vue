<template>
	<StringSelectOption
		:values="values"
		:selected="selected ? VALUE_TRUE : VALUE_FALSE"
		@select="value => emit('select', value === VALUE_TRUE)"
	/>
</template>

<script setup lang="ts">
import StringSelectOption from './StringSelectOption.vue';

defineProps<{ selected: boolean }>();
const emit = defineEmits<{ (event: 'select', selected: boolean): void }>();

const VALUE_TRUE = 'true';
const VALUE_FALSE = 'false';
const values = [VALUE_FALSE, VALUE_TRUE];
</script>
