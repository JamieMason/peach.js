
**`pEach(iterator:Function, [timesToUnroll:Number]):Function` takes functions you would pass to an iterator such as [_.each()](http://documentcloud.github.com/underscore/#each) or [Array.forEach](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach) and returns another which is optimised for runtime performance.**

Please run the [speed test suite at jsperf.com](http://jsperf.com/precompiled-each-iterators/10).

### How?

1. [Loop unwinding](http://en.wikipedia.org/wiki/Loop_unwinding) is applied.
1. The contents of your function are extracted and combined with the unrolled loop.
1. The loop construct used is the [fastest loop for the browser the user is using](http://jsperf.com/different-kinds-of-loop/2).

### Example

Take an iterator that you would pass to something like _.each

    _.each(['foo','bar','baz'], function (num, key, collection) {
      console.log(num, key, collection, this);
    });

Pass it to pEach

    var optimised = pEach(function (num, key, collection) {
      console.log(num, key, collection, this);
    });

and use the optimised function instead

    // Array
    optimised(['foo','bar','baz']);

    // Object
    optimised({
      foo: 'foo',
      bar: 'bar',
      baz: 'baz'
    });
