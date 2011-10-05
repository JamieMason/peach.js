To see the code in action, please run and view my performance tests at [http://jsperf.com/precompiled-each-iterators](http://jsperf.com/precompiled-each-iterators).

This small utility is only a few hours old, but aims to take any function you would otherwise pass directly to an iterator function such as underscore.js' _.each and returns another (hopefully) more performant version.

After this first few hours work, only iterating over indexed Arrays is supported - but I aim to support the functionality of _.each in full.

For the moment it's exposed at each.compile - but this may change.

	<!DOCTYPE HTML>
	<html>
	<head>
		<meta charset="UTF-8">
		<title>each.compile(iterator);</title>
	</head>
	<body>
		<script type="text/javascript" src="precompiled-each-iterators.js"></script>
		<script type="text/javascript">
		function ouputArguments (element, index, list) {
			console.log(element, index, list);
		}
		var compiledIteratorUnrolled16Times = each.compile(ouputArguments, 16);
		compiledIteratorUnrolled16Times(['a','b','c','d','e']);
		</script>
	</body>
	</html>
