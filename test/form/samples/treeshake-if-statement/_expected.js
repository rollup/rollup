{
	assert.ok(true);
}

if (typeof parseInt === 'function' ?? 'a' === 'a') {
	assert.ok(true);
}

if (!(unknownGlobal ? 'asdf' : true)) ;

if (unknownGlobal ? 0 : false) ;

if (!(unknownGlobal ? 'a' === 'a' : true)) ;
