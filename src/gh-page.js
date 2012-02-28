/*global Benchmark, _, pEach*/
function double_normal(array) {
  for (var i = 0; i < array.length; i++) {
    array[i] = array[i] * 2;
  }
}

var double_pEach = pEach(function(num, i, array) {
  array[i] = num * 2;
});

var getTestArray = (function() {
  var testArray = [];
  for (var i = 0; i < 500; i++) {
    testArray[i] = Math.floor(Math.random() * 100);
  }

  return function() {
    return testArray.slice(0);
  };
}());

function runSuite() {
  var suite = new Benchmark.Suite(),
      logContent = '',
      logEl = document.getElementById('log');

  function log(msg) {
    logContent = logContent + '<li><p>' + msg + '</p></li>';
  }

  suite
  .add('double_normal', function() {
    double_normal(getTestArray());
  })
  .add('double_pEach', function() {
    double_pEach(getTestArray());
  })
  .on('cycle', function(event, bench) {
    log(bench);
  })
  .on('complete', function() {
    log('<strong>Fastest is ' + this.filter('fastest').pluck('name') + '</strong>');
    logEl.innerHTML = logContent;
  })
  .run({
    'async': false
  });
}
