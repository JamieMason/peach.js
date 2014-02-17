# peach.js

This branch is a version of peach.js which served as a playground for using
[Esprima](http://esprima.org) and [escodegen](https://github.com/Constellation/escodegen).

## Usage Example

```shell
git clone -b esprima git@github.com:JamieMason/peach.js.git peach
cd peach
```

Then create a JavaScript file, let's say `use-peach.js`.

```javascript
var peach = require('./index');

// prepare an optimised .forEach called double.
var double = peach(function(el, ix, list) {
  list[ix] = el * 5;
});

// create some collection to try it out
var sequence = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// give it a try
double(sequence);

console.log(sequence);
```

Running `node use-peach.js` should output `[ 2, 4, 6, 8, 10, 12, 14, 16, 18, 20 ]`.

## Unrolled Loop

Adding `console.log(double.toString());` to `use-peach.js` will show the unrolled function created
by peach.js.

```javascript
function(list) {
  list = list || [];
  var _unrollCount = 8;
  var _totalIterations = list.length;
  var _blockIterations;
  var _map = [];
  var ix = 0;
  var el;
  for (_blockIterations = _totalIterations % _unrollCount; _blockIterations > 0; _blockIterations--) {
    el = list[ix];
    list[ix] = el * 2;
    ix++;
  }
  for (_blockIterations = _totalIterations / _unrollCount ^ 0; _blockIterations > 0; _blockIterations--) {
    el = list[ix];
    list[ix] = el * 2;
    ix++;
    el = list[ix];
    list[ix] = el * 2;
    ix++;
    el = list[ix];
    list[ix] = el * 2;
    ix++;
    el = list[ix];
    list[ix] = el * 2;
    ix++;
    el = list[ix];
    list[ix] = el * 2;
    ix++;
    el = list[ix];
    list[ix] = el * 2;
    ix++;
    el = list[ix];
    list[ix] = el * 2;
    ix++;
    el = list[ix];
    list[ix] = el * 2;
    ix++;
  }
  return _map;
}
```
