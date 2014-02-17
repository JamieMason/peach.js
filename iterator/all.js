module.exports = function(ARRAY_VAR) {
  ARRAY_VAR = ARRAY_VAR || [];
  var _unrollCount = 8;
  var _totalIterations = ARRAY_VAR.length;
  var _blockIterations;
  var _map = [];
  var INDEX_VAR = 0;
  var ITEM_VAR;
  for (_blockIterations = _totalIterations % _unrollCount; _blockIterations > 0; _blockIterations--) {
    'FUNCTION_BODY';
  }
  for (_blockIterations = (_totalIterations / _unrollCount) ^ 0; _blockIterations > 0; _blockIterations--) {
    'UNROLLED_FUNCTION_BODY';
  }
  return _map;
};
