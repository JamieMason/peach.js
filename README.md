
**`pEach(iterator:Function, [timesToUnroll:Number]):Function` takes functions you would pass to an iterator such as [_.each()](http://documentcloud.github.com/underscore/#each) and returns another which is optimised for runtime performance.**

[![](https://raw.github.com/JamieMason/Precompiled-each-Iterators/master/static/peach-vs-jquery-vs-underscore.png)](http://www.browserscope.org/user/tests/table/agt1YS1wcm9maWxlcnINCxIEVGVzdBiq1u0JDA)

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

### Notes

#### 1) It uses UA Sniffing

> [Modernizr aims to] bring an end to the UA sniffing practice. Using feature detection is a more reliable mechanic to establish what you can and cannot do in the current browser
> [@paulirish](https://github.com/paulirish) at [http://www.modernizr.com/docs](http://www.modernizr.com/docs)

Great advice, the important distinction in this specific case is that we're not trying to find out **what the browser can do** but genuinely, **which one is it?**. How can I find out which loop construct is fastest any other way? If I messed up, please let me know via a [new issue](https://github.com/JamieMason/Precompiled-each-Iterators/issues/new).

#### 2) it uses eval()

Everyone's heard ["eval is evil"](http://blogs.msdn.com/b/ericlippert/archive/2003/11/01/53329.aspx) - there are plenty of examples of misuse. If you [use eval for what it's intended for](http://berniesumption.com/software/eval-considered-useful/) (as we are doing) then it's all good, right? Wrong? please let me know via a [new issue](https://github.com/JamieMason/Precompiled-each-Iterators/issues/new).

Please help out by [reporting issues and ideas](https://github.com/JamieMason/Precompiled-each-Iterators/issues).
