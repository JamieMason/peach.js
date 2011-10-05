
var each = (function ()
{
    function inspectableFn (fn)
    {
    	var source, paramNames, body;

    	fn.getSource = function ()
        {
    		return source || (source = Function.prototype.toString.apply(fn));
        };

    	fn.getParamNames = function ()
    	{
    		source = fn.getSource();
    		return paramNames || (paramNames = source.split(/\(|\)/g)[1].replace(/\s*/g, '').split(','));
    	};

    	fn.getBody = function ()
    	{
    		if (body)
    		{
    			return body;
    		}

    		var parts = fn.getSource().split(/\{|\}/g);
    		parts.pop();
    		parts.shift();
    		return (body = (parts.join('') + '\n'));
    	};

    	return fn;
    }

    each = typeof each === 'object' ? each : {};

    each.compile = function (iterator, timesToUnroll)
    {
    	iterator = inspectableFn(iterator);

    	var params = this.getParamNames(iterator),
    	    elementParamName = params[0],
    	    indexParamName = params[1],
    	    listParamName = params[2],
    	    bodyOfLoop = this.getLoopBody(elementParamName, listParamName, iterator.getBody());

    	return this.merge(elementParamName, indexParamName, listParamName, bodyOfLoop, timesToUnroll);
    };

    each.merge = function (elementParamName, indexParamName, listParamName, bodyOfLoop, timesToUnroll)
    {
    	return eval([
    	'(function compiledIterator (', listParamName, ')',
    	'{',
    		'var ', indexParamName, ' = 0,',
    		    'iterations = ', listParamName, '.length,',
    		    'n = iterations % ', timesToUnroll, ';',

    		'while (n--)',
    		'{',
    		    bodyOfLoop,
    		'}',
    		'n = (iterations * 0.125) ^ 0;',
    		'while (n--)',
    		'{',
    		    new Array(timesToUnroll).join(bodyOfLoop),
    		'}',
    	'})'].join(''));
    };

    each.getLoopBody = function (elementParamName, listParamName, bodyOfFunction)
    {
    	return elementParamName + '=' + listParamName + '[index++];\n' + bodyOfFunction;
    };

    each.getParamNames = function (iterator)
    {
    	var params = iterator.getParamNames();
    	return [params[0] || 'element', params[1] || 'index', params[2] || 'list'];
    };

    return each;

}());
