function loopWithLabel () {
	label2: {
		while ( true ) {
			if ( Math.random() < 0.5 ) {
				break label2;
			}
			assert.equal(42, 42);
		}
	}
}

loopWithLabel();
