function getSelection(node) {
	if ('selectionStart' in node && ReactInputSelection.hasSelectionCapabilities(node)) {
		return {
			start: node.selectionStart,
			end: node.selectionEnd
		};
	} else if (window.getSelection) {
		const selection = window.getSelection();
		return {
			anchorNode: selection.anchorNode,
			anchorOffset: selection.anchorOffset,
			focusNode: selection.focusNode,
			focusOffset: selection.focusOffset
		};
	}
}

getSelection(null);
