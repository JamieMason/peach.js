var peach = (function (create)
{
  /* ==================================================================================== *\
   * Private Loop Constructs
   * -----------------------
   * You shouldn't try to use Peach's variables, but for info this is what they are.
   * The names have been obfuscated to make clashes with your code less likely;
   *
   * _n   number tested and incremented in the loop's header
   * _x   number of times the loop should run
   * _e   element/value of the collection member at this pass of the loop
   * _i   index/identifier/key of the collection member at this pass of the loop
   * _c   collection being iterated over
   * _k   array of property names found on the Object, not including it's prototype
  \* ==================================================================================== */

  function forDown (paramNames, bodyOfLoop, unrolledBodyOfLoop, timesToUnroll)
  {
    return [
    'for (_n = _x % ', timesToUnroll, '; _n > 0; _n--) {',
      bodyOfLoop,
    '}',
    'for (_n = (_x / ', timesToUnroll, ') ^ 0; _n > 0; _n--) {',
      unrolledBodyOfLoop,
    '}'].join('');
  }

  function whileDown (paramNames, bodyOfLoop, unrolledBodyOfLoop, timesToUnroll)
  {
    return [
    '_n = _x % ', timesToUnroll, ';',
    'while (_n--) {',
      bodyOfLoop,
    '}',
    '_n = (_x / ', timesToUnroll, ') ^ 0;',
    'while (_n--) {',
      unrolledBodyOfLoop,
    '}'].join('');
  }

  /* ==================================================================================== *\
   * Lookup table for which loop construct performed best for the given user agent in
   * tests done at http://jsperf.com/different-kinds-of-loop/2#run
  \* ==================================================================================== */

  var constructInUse = forDown
    // @TODO This lookup table will be more accurate once we have more test data
    , constructLookup = {
      'Android 2': whileDown // whileDown 3
      , 'Camino 2': whileDown // whileDown 3
      , 'Chrome 12': forDown
      , 'Chrome 13': whileDown // while i < arr.length without caching
      , 'Chrome 14': forDown
      , 'Chrome 15': whileDown
      , 'Fennec 6': whileDown // whileDown 2
      , 'Firefox 3': forDown
      , 'Firefox 3.0.18': whileDown // whileDown 3
      , 'Firefox 5.0': forDown
      , 'Firefox 5.0.1': whileDown // while i < arr.length with caching
      , 'Firefox 6': whileDown
      , 'Firefox 7': forDown
      , 'Firefox 8': forDown
      , 'IE 5.5': forDown
      , 'IE 7': whileDown // whileDown 3
      , 'IE 8': whileDown // whileDown 3
      , 'IE 9': forDown
      , 'iPad 4': forDown
      , 'iPhone 4': whileDown
      , 'Opera 10': whileDown // whileDown 2
      , 'Opera 11': whileDown // whileDown 2
      , 'Opera Mobile 11': whileDown // whileDown 3
      , 'Safari 3.2.2': whileDown // whileDown 2
      , 'Safari 4': forDown
      , 'Safari 5.0.3': whileDown // whileDown 3
      , 'Safari 5.0.5': forDown // forUp
      , 'Safari 5.1': forDown
    }
    , arrayCompiler
    , objectCompiler;

  /* ==================================================================================== *\
   * utility which decorates a function with methods for accessing it's source code and
   * named parameters.
  \* ==================================================================================== */

  function inspectableFn (fn)
  {
    var source
      , paramNames
      , body;

    /**
     * @returns {String} All source code for the function
     * @example
     * function someFn (a,b) { return a * b; }
     * someFn.source();
     * >> "function someFn (a,b) { return a * b; }"
     */
    fn.source = function ()
    {
      return source || (source = Function.prototype.toString.apply(fn));
    };

    /**
     * @returns {Array} The names of a function's parameters
     * @example
     * function someFn (a,b) {}
     * someFn.params();
     * >> ["a","b"]
     * function someOtherFn () {}
     * someOtherFn.params();
     * >> []
     */
    fn.params = function ()
    {
      source = fn.source();
      return paramNames || (paramNames = source.split(/\(|\)/g)[1].replace(/\s*/g, '').split(','));
    };

    /**
     * @returns {String} The source code for the executing body of the function
     * @example
     * function someFn (a,b) { return a * b; }
     * someFn.body();
     * >> " return a * b; "
     */
    fn.body = function ()
    {
      if (body)
      {
        return body;
      }

      var parts = fn.source().split(/\{|\}/g);
      parts.shift();

      if (parts.length === 3)
      {
        parts.pop();
      }

      return (body = (parts.join('') + '\n').replace(/^\s+|\s+$/g, ''));
    };

    return fn;
  }

  /* ==================================================================================== *\
   * Compiler Methods
  \* ==================================================================================== */

  /**
   * @returns {Array} Ensures the param names of the compiled iterator match those of the
   * original and that all 3 we require are all set.
   */
  function nameParams ()
  {
    var params = this.fn.params();
    params[0] = params[0] || '_e';
    params[1] = params[1] || '_i';
    params[2] = params[2] || '_c';
    return params;
  }

  /**
   * @returns {String} Writes the source code for the code to be run during each pass of
   * the loop
   */
  function body ()
  {
    var params = this.nameParams();
    return [
      this.setValue(params)
      , this.fn.body()
      , params[1] + '++;'
    ].join('\n');
  }

  /**
   * @returns {Function} Converts the iterators source code into a function and combines it
   * with a router
   */
  function compile ()
  {
    return create(this.source());
  }

  function returnVars () {
    return [
      'return {',
        this.nameParams().join(',').replace(/([^,]+)/g, '$1:$1'),
      '};'
    ].join('');
  }

  /* ==================================================================================== *\
   * Code common to both Array and Object iterators
  \* ==================================================================================== */

  function abstractIteratorCompiler (fn, xUnroll)
  {
    return {
      fn: inspectableFn(fn)
      , xUnroll: xUnroll || 8
      , nameParams: nameParams
      , body: function (){}
      , source: function (){}
      , compile: compile
      , returnVars: returnVars
    };
  }

  /* ==================================================================================== *\
   * Compiler for iterators to be used with Arrays
  \* ==================================================================================== */

  function arrayIteratorCompiler (fn, xUnroll)
  {
    var base = abstractIteratorCompiler(fn, xUnroll);

    /**
     * @returns {String} Writes the source code for the code to be run during each pass of
     * the loop
     */
    base.body = function ()
    {
      var params = this.nameParams();
      return [
        params[0] + '=' + params[2] + '[' + params[1] + '];'
        , this.fn.body()
        , params[1] + '++;'
      ].join('\n');
    };

    /**
     * @returns {String} Writes the source code for compiled iterator
     */
    base.source = function ()
    {
      var loopData = this.nameParams()
        , loopBody = this.body()
        , element = loopData[0]
        , index = loopData[1]
        , array = loopData[2]
        , params = [].concat(loopData)
        , xUnroll = this.xUnroll;

      // params is an array starting from array, plus the names of any additional params
      // should they exist
      params.splice(0, 2);

      return [
      'function (', params.join(','), ') {',
        'var _x = ', array, '.length', ',',
          index, ' = 0', ',',
          '_n', ',',
          element, ';',
        constructInUse(loopData, loopBody, new Array(xUnroll + 1).join(loopBody), xUnroll),
        this.returnVars(),
      '}'].join('');
    };

    return base;
  }

  /* ==================================================================================== *\
   * @TODO Compiler for iterators to be used with Objects
  \* ==================================================================================== */

  function objectIteratorCompiler (fn, xUnroll)
  {
    var base = abstractIteratorCompiler(fn, xUnroll);

    /**
     * @returns {String} Writes the source code for the code to be run during each pass of
     * the loop
     */
    base.body = function ()
    {
      var params = this.nameParams();
      return [
        params[0] + '=' + params[2] + '[', params[1], '=_k[_i]];'
        , this.fn.body()
        , '_i++;'
      ].join('\n');
    };

    /**
     * @returns {String} Writes the source code for compiled iterator
     */
    base.source = function ()
    {
      var loopData = this.nameParams()
        , loopBody = this.body()
        , element = loopData[0]
        , index = loopData[1]
        , object = loopData[2]
        , params = [].concat(loopData)
        , xUnroll = this.xUnroll;

      // params is an object starting from object, plus the names of any additional params
      // should they exist
      params.splice(0, 2);

      return [
      'function (', params.join(','), ') {',
        'var _k = Object.keys(', object, '),',
          '_x = _k.length,',
          '_i = 0,',
          index, ',',
          '_n', ',',
          element, ';',
        constructInUse(loopData, loopBody, new Array(xUnroll + 1).join(loopBody), xUnroll),
        this.returnVars(),
      '}'].join('');
    };

    return base;
  }

  /* ==================================================================================== *\
   * The function called each time the iterator is run, inspects the collection and forwards
   * the arguments to an iterator optimised for either and Array or Object
  \* ==================================================================================== */

  function router (arrayIterator, objectIterator)
  {
    /**
     * @param {Array|Object} collection The collection to be iterated over. @TODO Add support for Objects
     * plus additional arguments depending on your iterator
     */
    return function (collection)
    {
      return (Object.prototype.toString.call(collection) === "[object Object]"
        ? objectIterator
        : arrayIterator).apply(this, arguments);
    };
  }

  function compiler (fn, xUnroll)
  {
    var arrayIterator = arrayIteratorCompiler(fn, xUnroll)
      , objectIterator = objectIteratorCompiler(fn, xUnroll);

    return router(arrayIterator.compile(), objectIterator.compile());
  }

  /**
   * @param {string} reconciledUa eg: "IE Mobile 7", "Chrome 7.0.503"
   */
  compiler.tune = function (reconciledUa)
  {
     if (constructLookup[reconciledUa])
     {
       constructInUse = constructLookup[reconciledUa];
       return;
     }

     var vendorAndVersion = reconciledUa.split(/ (?=[0-9])/)
       , vendor = vendorAndVersion[0]
       , version = vendorAndVersion[1]
       , majorVersionNumber = version.split('.')[0]
       , vendorAndMajorVersion = vendor + ' ' + majorVersionNumber;

     constructInUse = constructLookup[vendorAndMajorVersion] || constructLookup[vendor] || forDown;
   };

  return compiler;
}(
  function (s) {
    return (function (ev) {
      var f;
      return (f = ev('(' + s + ')'));
    }(eval));
  }
));
