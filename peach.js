var peach = (function(create)
{
    /* ==================================================================================== *\
     * Loop Construct Compilers
    \* ==================================================================================== */

    function forDown(paramNames, bodyOfLoop, unrolledBodyOfLoop, timesToUnroll)
    {
        return [
        'for (n = iterations % ', timesToUnroll, '; n > 0; n--) {',
            bodyOfLoop,
        '}',
        'for (n = (iterations / ', timesToUnroll, ') ^ 0; n > 0; n--) {',
            unrolledBodyOfLoop,
        '}'].join('');
    }

    function whileDown(paramNames, bodyOfLoop, unrolledBodyOfLoop, timesToUnroll)
    {
        return [
        'n = iterations % ', timesToUnroll, ';',
        'while (n--) {',
            bodyOfLoop,
        '}',
        'n = (iterations / ', timesToUnroll, ') ^ 0;',
        'while (n--) {',
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

    /* ==================================================================================== *\
     * utility which decorates a function with methods for accessing it's source code and
     * named parameters.
    \* ==================================================================================== */

    function inspectableFn(fn)
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
        fn.source = function()
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
        fn.params = function()
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
        fn.body = function()
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

    // Private methods used by peach()
    // ====================================================================================

    /**
     * @returns {String} Writes the source code for compiled iterator
     */
    function compileIteratorSource(paramNames, bodyOfLoop, timesToUnroll)
    {
        var element = paramNames[0]
            , index = paramNames[1]
            , list = paramNames[2]
            , paramsClone = [].concat(paramNames);

        // paramsClone is now an array starting from list, plus the names of any additional params should they exist
        paramsClone.splice(0,2);

        return [
        'function (', paramsClone.join(','), ') {',
            'var iterations = ', list, '.length', ',',
                index, ' = 0', ',',
                'n', ',',
                element, ';',

            constructInUse(paramNames, bodyOfLoop, new Array(timesToUnroll + 1).join(bodyOfLoop), timesToUnroll),
        '}'].join('');
    }

    /**
     * @returns {String} Writes the source code for the code to be run during each pass of the loop
     */
    function getLoopBody(paramNames, bodyOfFunction)
    {
        return [
            paramNames[0] + '=' + paramNames[2] + '[' + paramNames[1] + '];'
            , bodyOfFunction
            , paramNames[1] + '++;'
        ].join('\n');
    }

    /**
     * @returns {Array} Ensures the param names of the compiled iterator match those of the original and that all 3 we require are all set.
     */
    function getParamNames(iterator)
    {
        var paramNames = iterator.params();
        paramNames[0] = paramNames[0] || 'element';
        paramNames[1] = paramNames[1] || 'index';
        paramNames[2] = paramNames[2] || 'list';
        return paramNames;
    }

    /**
     * @returns {Boolean} Whether the value supplied is an Object
     */
    function isObject (value)
    {
        return Object.prototype.toString.call(value) === "[object Object]";
    }

    /**
     * @returns {Function} The function returned to the compiler caller
     */
    function iteratorWrapper(compiledIterator)
    {
        /**
         * @param {Array} list The collection to be iterated over. @TODO Add support for Objects
         * @param {Object} [context] Optionally define what 'this' should reference within the iterator
         */
        return function(list, context)
        {
            if (!context)
            {
                return compiledIterator(list);
            }

            var args = Array.prototype.slice.call(arguments);
            args.splice(1, 1);
            return compiledIterator.apply(context || {}, args);
        };
    }

    /**
     * @returns {Function} Returns a new function with the original functionality and optimised iteration combined.
     */
    function eachIteratorCompiler(iterator, timesToUnroll)
    {
        iterator = inspectableFn(iterator);

        var params = getParamNames(iterator)
            , bodyOfLoop = getLoopBody(params, iterator.body())
            , compiledSource = compileIteratorSource(params, bodyOfLoop, timesToUnroll || 8);

        return iteratorWrapper(create(compiledSource));
    }

    // Public methods to configure peach()
    // ====================================================================================

    /**
     * @param {string} reconciledUa eg: "IE Mobile 7", "Chrome 7.0.503"
     */
    function setUserAgent(reconciledUa)
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
    }

    eachIteratorCompiler.setUserAgent = setUserAgent;

    return eachIteratorCompiler;
}(function (s)
{
    return (function(ev) {
        var f;
        return (f = ev('(f=' + s + ')'));
    }(eval));
}));
