var unroll = (function()
{
    // Loop Construct Compilers
    // ====================================================================================

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

    // Lookup table for which loop construct performed best for the given user agent in
    // tests done at http://jsperf.com/different-kinds-of-loop/2#run
    // ====================================================================================

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
        };

    // utility which decorates a function with methods for accessing it's source code and
    // named parameters.
    // ====================================================================================

    function inspectableFn(fn)
    {
        var source
            , paramNames
            , body;

        /**
         * @returns {String} All source code for the function
         * @example
         * function someFn (a,b) { return a * b; }
         * someFn.compileIteratorSource();
         * >> "function someFn (a,b) { return a * b; }"
         */
        fn.compileIteratorSource = function()
        {
            return source || (source = Function.prototype.toString.apply(fn));
        };

        /**
         * @returns {Array} The names of a function's parameters
         * @example
         * function someFn (a,b) {}
         * someFn.getParamNames();
         * >> ["a","b"]
         * function someOtherFn () {}
         * someOtherFn.getParamNames();
         * >> []
         */
        fn.getParamNames = function()
        {
            source = fn.compileIteratorSource();
            return paramNames || (paramNames = source.split(/\(|\)/g)[1].replace(/\s*/g, '').split(','));
        };

        /**
         * @returns {String} The source code for the executing body of the function
         * @example
         * function someFn (a,b) { return a * b; }
         * someFn.getBody();
         * >> " return a * b; "
         */
        fn.getBody = function()
        {
            if (body)
            {
                return body;
            }

            var parts = fn.compileIteratorSource().split(/\{|\}/g);
            parts.shift();

            if (parts.length === 3)
            {
                parts.pop();
            }

            return (body = (parts.join('') + '\n'));
        };

        return fn;
    }

    // Private methods used by unroll()
    // ====================================================================================

    /**
     * @returns {Function} The newly compiled iterator
     */
    function createFunction(compiledSource)
    {
        return (function(eval_ref) {
            var fn;
            return (fn = eval_ref('(fn = ' + compiledSource + ')'));
        }(eval));
    }

    /**
     * @returns {String} Writes the source code for compiled iterator
     */
    function compileIteratorSource(paramNames, bodyOfLoop, timesToUnroll)
    {
        return [
        'function (', paramNames.list, ') {',
            'var iterations = ', paramNames.list, '.length', ',',
                paramNames.i, ' = 0', ',',
                'n', ',',
                paramNames.element, ';',

            constructInUse(paramNames, bodyOfLoop, new Array(timesToUnroll + 1).join(bodyOfLoop), timesToUnroll),
        '}'].join('');
    }

    /**
     * @returns {String} Writes the source code for the code to be run during each pass of the loop
     */
    function getLoopBody(paramNames, bodyOfFunction)
    {
        return [
        paramNames.element + '=' + paramNames.list + '[' + paramNames.i + '];'
            , bodyOfFunction
            , paramNames.i + '++;'
        ].join('\n');
    }

    /**
     * @returns {Array} Ensures the param names of the compiled iterator match those of the original and that all 3 we require are all set.
     */
    function getParamNames(iterator)
    {
        var paramNames = iterator.getParamNames();

        return {
            element: paramNames[0] || 'element'
            , i: paramNames[1] || 'index'
            , list: paramNames[2] || 'list'
        };
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
            !context ? compiledIterator(list) : compiledIterator.apply(context, [list]);
        };
    }

    /**
     * @returns {Function} Returns a new function with the original functionality and optimised iteration combined.
     */
    function eachIteratorCompiler(iterator, timesToUnroll)
    {
        iterator = inspectableFn(iterator);

        var params = getParamNames(iterator)
            , bodyOfLoop = getLoopBody(params, iterator.getBody())
            , compiledSource = compileIteratorSource(params, bodyOfLoop, timesToUnroll || 8);
console.log(compiledSource);
        return iteratorWrapper(createFunction(compiledSource));
    }

    // Public methods to configure unroll()
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
}());
