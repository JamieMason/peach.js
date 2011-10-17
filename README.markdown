> `unroll(iterator:Function, [timesToUnroll:Number]):Function` is a small utility to take functions you would pass to an iterator function such as [`_.each()`](http://documentcloud.github.com/underscore/#each) and returns a `someIterator(list:Array)`, which is tested to run faster.

###How ~~does~~ will it work?###

1. We provide [JavaScript loop speed tests](http://jsperf.com/different-kinds-of-loop/2#run) to measure which of the many ways of writing loops are the fastest *per browser*.
1. [Loop unwinding](http://en.wikipedia.org/wiki/Loop_unwinding) is performed on the code in your function for better performance.
1. The looping construct used as part of the unrolled/unwound version is the one proven to be the [fastest loop for the browser the user is using](http://jsperf.com/different-kinds-of-loop/2#run).

###The project only started recently, so...###

1. The current version only iterates over indexed Arrays, the full functionality of [`_.each()`](http://documentcloud.github.com/underscore/#each) though will be supported.

The looping construct in use is the one known to be fastest in the browser you're using, see a [performance comparison of the current version -vs jQuery and underscore.js](http://jsperf.com/precompiled-each-iterators/5#run) at jsperf.com.

###Example###

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

###Things some may wince at, at first###

####1) It uses UA Sniffing####

> [Modernizr aims to] bring an end to the UA sniffing practice. Using feature detection is a more reliable mechanic to establish what you can and cannot do in the current browser
> [@paulirish](https://github.com/paulirish) at [http://www.modernizr.com/docs](http://www.modernizr.com/docs)

Great advice, the important distinction in this specific case is that we're not trying to find out **what the browser can do** but genuinely, **which one is it?**. How can I find out which loop construct is fastest any other way? If you know, please tell us via a [new issue](https://github.com/JamieMason/Precompiled-each-Iterators/issues/new). 

####2) it uses eval()####

Everyone's heard ["eval is evil"](http://blogs.msdn.com/b/ericlippert/archive/2003/11/01/53329.aspx) - there are plenty of examples of misuse. If you [use eval for what it's intended for](http://berniesumption.com/software/eval-considered-useful/) (as we are doing) then it's all good, right? Wrong? please let us know via a [new issue](https://github.com/JamieMason/Precompiled-each-Iterators/issues/new).

Please help out by [reporting issues and ideas](https://github.com/JamieMason/Precompiled-each-Iterators/issues).