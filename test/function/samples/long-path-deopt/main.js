let effect = false;
const obj = {
	a: {
		b: {
			c: {
				d: {
					e: {
						f: {
							g: {
								h: {
									i: {
										j: {
											k: () => ({ effect: () => (effect = true) })
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};

obj.a.b.c.d.e.f.g.h.i.j.k().effect();
assert.ok(effect);
