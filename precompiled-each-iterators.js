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

    var constructInUse = forDown,
        // @TODO This lookup table will be more accurate once we have more test data
        constructLookup = {
            'Chrome': forDown,
            'Firefox': forDown,
            'IE': forDown,
            'Android': whileDown,
            'IE Browser 7': whileDown,
            'Opera': whileDown,
            'Safari': whileDown
        };

    // utility which decorates a function with methods for accessing it's source code and
    // named parameters.
    // ====================================================================================

    function inspectableFn(fn)
    {
        var source,
            paramNames,
            body;

        /**
         * @returns {String} All source code for the function
         * @example
         * function someFn (a,b) { return a * b; }
         * someFn.getSource();
         * >> "function someFn (a,b) { return a * b; }"
         */
        fn.getSource = function()
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
            source = fn.getSource();
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

            var parts = fn.getSource().split(/\{|\}/g);
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
        } (eval));
    }

    /**
     * @returns {String} Writes the source code for compiled iterator
     */
    function getSource(paramNames, bodyOfLoop, timesToUnroll)
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
        return paramNames.element + '=' + paramNames.list + '[' + paramNames.i + '++];\n' + bodyOfFunction;
    }

    /**
     * @returns {Array} Ensures the param names of the compiled iterator match those of the original and that all 3 we require are all set.
     */
    function getParamNames(iterator)
    {
        var paramNames = iterator.getParamNames();

        return {
            element: paramNames[0] || 'element',
            i: paramNames[1] || 'index',
            list: paramNames[2] || 'list'
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

        var params = getParamNames(iterator),
            bodyOfLoop = getLoopBody(params, iterator.getBody()),
            compiledSource = getSource(params, bodyOfLoop, timesToUnroll || 8);

        return iteratorWrapper(createFunction(compiledSource));
    }

    // Public methods to configure unroll()
    // ====================================================================================

    /**
     * @param {Object} JSON data returned from useragentstring.com API (http://useragentstring.com/pages/api.php)
     */
    eachIteratorCompiler.setUserAgent = function(uaJson)
    {
        var searchVendor = uaJson.agent_name,
            searchVendorAndPlatform = searchVendor + ' ' + uaJson.agent_type,
            searchVendorPlatformAndExactVersion = searchVendorAndPlatform + ' ' + uaJson.agent_version,
            searchVendorPlatformAndMajorVersion = searchVendorAndPlatform + ' ' + uaJson.agent_version.charAt(0);

        if (searchVendorPlatformAndExactVersion in constructLookup)
        {
            constructInUse = constructLookup[searchVendorPlatformAndExactVersion];
        }
        else if (searchVendorPlatformAndMajorVersion in constructLookup)
        {
            constructInUse = constructLookup[searchVendorPlatformAndMajorVersion];
        }
        else if (searchVendorAndPlatform in constructLookup)
        {
            constructInUse = constructLookup[searchVendorAndPlatform];
        }
        else if (searchVendor in constructLookup)
        {
            constructInUse = constructLookup[searchVendor];
        }
    };

    return eachIteratorCompiler;
}());
