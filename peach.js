var pEach = (function() {

  var tplForDown = 'for(_n=_x%TIMES_TO_UNROLL;_n>0;_n--){TARGET_BODY}for(_n=(_x/TIMES_TO_UNROLL)^0;_n>0;_n--){UNROLLED_TARGET_BODY}',
      tplWhileDown = '_n=_x%TIMES_TO_UNROLL;while(_n--){TARGET_BODY}_n=(_x/TIMES_TO_UNROLL)^0;while(_n--){UNROLLED_TARGET_BODY}',
      tplArrayFn = 'function(NAMED_PARAMS){COLLECTION=COLLECTION||[];var _x=COLLECTION.length,_n,ELEMENT;INDEX=0;LOOP_CONSTRUCT return RETURN;}',
      tplObjectFn = 'function(NAMED_PARAMS){COLLECTION=COLLECTION||{};var _k=Object.keys(COLLECTION),_x=_k.length,_i=0,INDEX,_n,ELEMENT;LOOP_CONSTRUCT return RETURN;}',
      tplArrayLoopBody = 'ELEMENT=COLLECTION[INDEX];SOURCE_BODY\nINDEX++;',
      tplObjectLoopBody = 'ELEMENT=COLLECTION[INDEX=_k[_i]];SOURCE_BODY\n_i++;';

  /**
   * A wrapper for window.eval that sustains var name compression when using UglifyJS
   * @param  {String} code
   * @return {Function}
   */
  function author(code) {
    return window['eval']('(' + code + ')');
  }

  /**
   * Remove leading and traling whitespace from a String
   * @param  {String} string
   * @return {String}
   */
  function trim(string) {
    return string.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  }


  function merge(string, subs) {
    for (var i in subs) {
      string = string.replace(new RegExp(i, 'g'), subs[i]);
    }
    return string;
  }

  /**
   * @returns {String} All source code for the function
   * @example
   * function someFn (a,b) { return a * b; }
   * someFn.source();
   * >> "function someFn (a,b) { return a * b; }"
   */

  function getFnSrc(fn) {
    return trim(Function.prototype.toString.apply(fn));
  }

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

  function getFnNamedArgs(fn) {
    return getFnSrc(fn).split(/\(|\)/g)[1].replace(/\s*/g, '').split(',');
  }

  /**
   * @returns {String} The source code for the executing body of the function
   * @example
   * function someFn (a,b) { return a * b; }
   * someFn.body();
   * >> " return a * b; "
   */

  function getFnBody(fn) {
    var all = getFnSrc(fn);
    return trim(all.substring(all.indexOf('{') + 1, all.lastIndexOf('}')));
  }

  // @TODO: need object versions of some of the above
  // =================
  // function isSet (value) {
  //   return typeof value !== 'undefined';
  // }
  // get the named arguments for the target

  function getTargetArgs(srcFn) {
    var args = getFnNamedArgs(srcFn);
    args[0] = args[0] || '_e';
    args[1] = args[1] || '_i';
    args[2] = args[2] || '_c';
    return args;
  }

  function getTargetApi(srcFn) {
    var args = getTargetArgs(srcFn);
    args.splice(0, 2);
    return args;
  }

  // write-in the argument names whereever they should be in a source code template

  function mergeArgsWithTemplate(template, element, index, collection) {
    return merge(template, {
      ELEMENT: element,
      INDEX: index,
      COLLECTION: collection
    });
  }

  // write args names into source code

  function insertTargetArgs(template, srcFn) {
    return mergeArgsWithTemplate.apply(mergeArgsWithTemplate, [template].concat(getTargetArgs(srcFn)));
  }

  // write code to be run in every iteration

  function getTargetLoopBody(srcFn, loopBodyTpl) {
    return merge(insertTargetArgs(loopBodyTpl, srcFn), {
      SOURCE_BODY: getFnBody(srcFn)
    });
  }

  function getUnrolledTargetLoopBody(srcFn, loopBodyTpl, xUnroll) {
    return new Array(xUnroll + 1).join(getTargetLoopBody(srcFn, loopBodyTpl));
  }

  // get code for an object literal of key value pairs for each parameter

  function getTargetArgsAsObject(srcFn) {
    return '{' + getTargetArgs(srcFn).join(',').replace(/([^,]+)/g, '$1:$1') + '}';
  }

  function getConstructTpl() {
    return compiler.construct;
  }

  function writeLoop(srcFn, loopBodyTpl, xUnroll) {
    return merge(getConstructTpl(), {
      TIMES_TO_UNROLL: xUnroll,
      UNROLLED_TARGET_BODY: getUnrolledTargetLoopBody(srcFn, loopBodyTpl, xUnroll),
      TARGET_BODY: getTargetLoopBody(srcFn, loopBodyTpl)
    });
  }

  function writeIterator(srcFn, iteratorTpl, loopBodyTpl, xUnroll) {
    return merge(insertTargetArgs(iteratorTpl, srcFn), {
      NAMED_PARAMS: getTargetApi(srcFn).join(','),
      LOOP_CONSTRUCT: writeLoop(srcFn, loopBodyTpl, xUnroll),
      RETURN: getTargetArgsAsObject(srcFn)
    });
  }

  function writeArrayIterator(srcFn, xUnroll) {
    return writeIterator(srcFn, tplArrayFn, tplArrayLoopBody, xUnroll);
  }

  function writeObjectIterator(srcFn, xUnroll) {
    return writeIterator(srcFn, tplObjectFn, tplObjectLoopBody, xUnroll);
  }

  function router(arrayIterator, objectIterator) {
    return function(collection) {
      return (Object.prototype.toString.call(collection) === "[object Object]" ? objectIterator : arrayIterator).apply(this, arguments);
    };
  }

  function compiler(srcFn, xUnroll) {
    xUnroll = xUnroll || 8;
    return router(author(writeArrayIterator(srcFn, xUnroll)), author(writeObjectIterator(srcFn, xUnroll)));
  }

  compiler.construct = tplForDown;

  return compiler;
}());
