
var unroll = (function ()
{
    // decorate function with methods to access portions of it's source code
	function inspectableFn (fn)
	{
		var source, paramNames, body;

        /**
         * @returns {String} All source code for the function
         * @example
         * function someFn (a,b) { return a * b; }
         * someFn.getSource();
         * >> "function someFn (a,b) { return a * b; }"
         */
		fn.getSource = function ()
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
		fn.getParamNames = function ()
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
		fn.getBody = function ()
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

    /**
     * @returns {Function} The newly compiled iterator
     */
	function createFunction (compiledSource)
	{
		return (function (eval_ref) {
			var fn;
			return (fn = eval_ref('(fn = ' + compiledSource + ')'));
		}(eval));
	}

    /**
     * @returns {String} Writes the source code for compiled iterator
     */
	function getSource (elementParamName, indexParamName, listParamName, bodyOfLoop, timesToUnroll)
	{
        return [
        'function (', listParamName, ') {',
            'var iterations = ', listParamName, '.length,',
                'n = iterations % ', timesToUnroll, ',',
                elementParamName, ',',
                indexParamName, ' = 0;',

            'while (n--) {',
                bodyOfLoop,
            '}',
            'n = (iterations / ', timesToUnroll, ') ^ 0;',
            'while (n--) {',
                new Array(++timesToUnroll).join(bodyOfLoop),
            '}',
        '}'].join('').replace(/([,\}\{\;}])/g, '$1\n');
	}

    /**
     * @returns {String} Writes the source code for the code to be run during each pass of the loop
     */
	function getLoopBody (elementParamName, indexParamName, listParamName, bodyOfFunction)
	{
		return elementParamName + '=' + listParamName + '[' + indexParamName + '++];\n' + bodyOfFunction;
	}

    /**
     * @returns {Array} Ensures the param names of the compiled iterator match those of the original and that all 3 we require are all set.
     */
	function getParamNames (iterator)
	{
		var params = iterator.getParamNames();
		return [params[0] || 'element', params[1] || 'index', params[2] || 'list'];
	}

    /**
     * @returns {Function} The function returned to the compiler caller
     */
	function iteratorWrapper (compiledIterator)
	{
	    /**
	     * @param {Array} list The collection to be iterated over. @TODO Add support for Objects
	     * @param {Object} [context] Optionally define what 'this' should reference within the iterator
	     */
        return function (list, context)
        {
            !context ? compiledIterator(list) : compiledIterator.apply(context, [list]);
        };
	}

    /**
     * @returns {Function} Returns a new function with the original functionality and optimised iteration combined.
     */
	function eachIteratorCompiler (iterator, timesToUnroll)
	{
		iterator = inspectableFn(iterator);

		var params = getParamNames(iterator),
			elementParamName = params[0],
			indexParamName = params[1],
			listParamName = params[2],
			bodyOfLoop = getLoopBody(elementParamName, indexParamName, listParamName, iterator.getBody()),
			compiledSource = getSource(elementParamName, indexParamName, listParamName, bodyOfLoop, timesToUnroll || 8);

		return iteratorWrapper(createFunction(compiledSource));
	}

	return eachIteratorCompiler;
}());
