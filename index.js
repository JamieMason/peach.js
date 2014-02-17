var esprima = require('esprima');
var escodegen = require('escodegen');

var all = require('./iterator/all');
var bodyBefore = require('./iterator/body-before');
var bodyAfter = require('./iterator/body-after');

/**
 * @param {Function|String} fn
 * @return {SyntaxTree}
 */
function parseFunction(fn) {
  var source = typeof fn === 'function' ? fn.toString() : fn;
  source = 'var fn = ' + source + ';';
  source = esprima.parse(source);
  return source.body[0].declarations[0].init;
}

/**
 * @param {SyntaxTree} fn
 * @param {SyntaxTree} before
 * @param {SyntaxTree} after
 * @return {SyntaxTree} fn
 */
function wrapLoopBody(fn, before, after) {
  fn.body.body = [].concat(before, fn.body.body, after);
  return fn;
}

/**
 * @param {SyntaxTree} fnBody
 * @return {SyntaxTree[]}
 */
function getReturnStatements(fnBody) {
  return fnBody.reduce(function(memo, member) {
    if (member.type === 'ReturnStatement') {
      memo.push(member);
    } else if (member.type === 'IfStatement') {
      memo = memo.concat(getReturnStatements(member.consequent.body));
    }
    return memo;
  }, []);
}

/**
 * @param {SyntaxTree} fnBody
 */
function handleReturnStatements(fnBody) {
  if (getReturnStatements(fnBody).length > 0) {
    throw new Error('return statements are not yet supported by peach');
  }
}

/**
 * @param {SyntaxTree} treeAll
 * @param {Number} unrollCount
 */
function setUnrollCount(treeAll, unrollCount) {
  treeAll.body.body.some(function(el) {
    if (el.type === 'VariableDeclaration' && el.declarations[0].id.name === '_unrollCount') {
      el.declarations[0].init.value = unrollCount;
      return true;
    }
  });
}

/**
 * @param {SyntaxTree} treeAll
 * @param {SyntaxTree} treeFn
 * @param {Number} unrollCount
 */
function populateLoops(treeAll, treeFn, unrollCount) {
  setUnrollCount(treeAll, unrollCount);
  treeAll.body.body.forEach(function(el) {
    if (el.type !== 'ForStatement') {
      return;
    }
    var bodyType = el.body.body[0].expression.value;
    if (bodyType === 'FUNCTION_BODY') {
      el.body.body = treeFn.body.body;
    } else if (bodyType === 'UNROLLED_FUNCTION_BODY') {
      el.body.body = [];
      for (; unrollCount > 0; unrollCount--) {
        el.body.body = el.body.body.concat(treeFn.body.body);
      }
    }
  });
}

/**
 * @param  {String} fnTemplate
 * @param  {SyntaxTree} treeFn
 * @return {String}
 */
function setVariableNames(fnTemplate, treeFn) {
  return fnTemplate.toString()
    .split('ITEM_VAR').join(treeFn.params[0].name)
    .split('INDEX_VAR').join(treeFn.params[1].name)
    .split('ARRAY_VAR').join(treeFn.params[2].name);
}

/**
 * @param  {String} code
 * @return {Function}
 */
function evaluate(code) {
  return eval('(' + code + ')');
}

module.exports = function(fn, unrollCount) {
  unrollCount = unrollCount || 8;

  var treeFn = parseFunction(fn);
  var tplAll = setVariableNames(all.toString(), treeFn);
  var tplBodyBefore = setVariableNames(bodyBefore.toString(), treeFn);
  var tplBodyAfter = setVariableNames(bodyAfter.toString(), treeFn);
  var treeAll = parseFunction(tplAll);
  var treeBodyBefore = parseFunction(tplBodyBefore).body.body;
  var treeBodyAfter = parseFunction(tplBodyAfter).body.body;

  handleReturnStatements(treeFn.body.body);
  wrapLoopBody(treeFn, treeBodyBefore, treeBodyAfter);
  populateLoops(treeAll, treeFn, unrollCount);

  return evaluate(escodegen.generate(treeAll));
}
