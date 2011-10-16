(function ()
{
    var oHead = document.getElementsByTagName('head')[0]
        , sProtocol = document.location.protocol === 'https:' ? 'https:' : 'http:'
        , sBrowserScopeUrl = sProtocol + '//www.browserscope.org/ua?o=js'
        , hideBrowserscopeDiv = '#bs-ua{display:none}'
        , oStyle = document.createElement('style')
        , oScript = document.createElement('script');

    // http://www.browserscope.org/ua?o=js gives us up to date UA detection

    // 1. There's some UI code baked in with the UA data though, but for now
    // we can add a CSS rule to hide them. A feature request has been added
    // to see if the UI code can be removed;
    // http://code.google.com/p/browserscope/issues/detail?id=314
    oStyle.type = 'text/css';

    oStyle.styleSheet ?
        (oStyle.styleSheet.cssText = hideBrowserscopeDiv)
        :
        oStyle.appendChild(document.createTextNode(hideBrowserscopeDiv));

    oHead.appendChild(oStyle);

    // 2. Request the UA data from Browserscope and feed it to the Precompiler
	oScript.setAttribute('src', sBrowserScopeUrl);
	oScript.setAttribute('type', 'text/javascript');

    function passUaDataToCompiler()
    {
        var browserscopeDiv = document.getElementById('bs-ua')
            , userAgentElement = browserscopeDiv ? browserscopeDiv.getElementsByTagName('strong')[0] : null
            , userAgentString = userAgentElement ? userAgentElement.innerHTML : '';

        if (userAgentString)
        {
            unroll.setUserAgent(userAgentString);
        }
    }

	function onReadyStateChangeForIe()
	{
		if (this.readyState == 'complete' || this.readyState == 'loaded')
		{
			passUaDataToCompiler();
		}
	}

	oScript.onreadystatechange = onReadyStateChangeForIe;
	oScript.onload = passUaDataToCompiler;
	oHead.appendChild(oScript);
}());
