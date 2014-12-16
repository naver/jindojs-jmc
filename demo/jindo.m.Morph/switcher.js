var USE_TRANSITION = (function() {

	var bUseTransition = (/useTransition=([a-z]+)/.test(location.search) && RegExp.$1) !== 'false';

	var elSwitcher = jindo.$('<select>');

	jindo.$Element(elSwitcher)
		.html('<option value="true">useTransition : true</option><option value="false">useTransition : false</option>')
		.css({
			zIndex : 32000,
			position : 'absolute',
			right : '10px',
			top : '82px',
			fontSize : '1.2em'
		});

	jindo.$Fn(function() {
		location.href = location.href.replace(/\?.*$/, '') + '?useTransition=' + elSwitcher.value;
	}).attach(elSwitcher, 'change');

	elSwitcher.value = bUseTransition;

	document.body.insertBefore(elSwitcher, document.body.firstChild);

	return bUseTransition;

})();
