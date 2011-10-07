To see the code in action, please  [run the performance tests at jsperf.com](http://jsperf.com/precompiled-each-iterators/4#run).

`unroll(iterator:Function, [timesToUnroll:Number]):Function` is a small utility to take functions you would pass to an iterator function such as [`_.each()`](http://documentcloud.github.com/underscore/#each) and returns a `someIterator(list:Array)`, which is tested to be more performant.

**Please Note:** Work only recently started on this project, so only iterating over indexed Arrays is supported so far. I aim though to support the full functionality of [`_.each()`](http://documentcloud.github.com/underscore/#each).

Depending on how positive the performance gains might be, it'd be interesting to see whether this utility can be applied to [`jQuery.each()`](http://api.jquery.com/each/) combined with some memoization.

	var someCollection = ['a','b','c','d','e','f','g','h','i'];

	function ouputArguments (member, i, array) {
		console.log(member, i, array, this);
	}

	// take a function you could pass to _.each like this
	// _.each(ouputArguments, someCollection);
	
	// ...but instead precompile it (just once), into a faster version
	var iteratorUnrolled16x = unroll(ouputArguments, 16);
	
	// and call that instead
	iteratorUnrolled16x(someCollection);
	
	// as many times as you like
	iteratorUnrolled16x(someCollection);

Please help out by [reporting issues and ideas](https://github.com/JamieMason/Precompiled-each-Iterators/issues).
