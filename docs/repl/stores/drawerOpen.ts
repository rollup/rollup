import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDrawerOpen = defineStore('drawerOpen', () => {
	const isOpen = ref(false);
	const toggle = () => {
		isOpen.value = !isOpen.value;
	};
	const close = () => {
		isOpen.value = false;
	};
	return { close, isOpen, toggle };
});
