/**
 * @author hooriza
 */
(function() {
	
	var ver = '0.1';
	
	var t = document.getElementsByTagName('script');
	var script = t[t.length - 1] || null;
	
	var basedir = script.src.replace(/\/[^\/]*$/, '/');
	var hash = /#(.*)$/.test(script.src) ? RegExp.$1 : 'header';
	
	if (hash === 'footer') {
		window.demojs && document.write('</div>');
		return;
	}
	
	var getMetaDescription = function() {
		
		var metas = document.getElementsByTagName('meta');
		
		for (var i = 0, len = metas.length; i < len; i++) {
			if (/^description$/i.test(metas[i].getAttribute('name'))) {
				return metas[i].getAttribute('content');				
			} 			
		}
		
		return null;
		
	};
	
	var getEvalString = function(str) {
		
		if (/^=/.test(str)) {
			return eval(str.substr(1));
		}
		
		return str;
		
	};
	
	var info = {
		disable : script.getAttribute('data-disable'),
		title : getEvalString(script.getAttribute('data-title')),
		subtitle : getEvalString(script.getAttribute('data-subtitle')),
		backbutton : script.getAttribute('data-backbutton'),
		viewsource : script.getAttribute('data-viewsource'),
		qrcode : script.getAttribute('data-qrcode'),
		description : getEvalString(script.getAttribute('data-description'))
	};
	
	(function(s) {
		
		s.replace(/(^|&)data\-(\w+)=(\w+)/g, function(_, _, key, val) {
			if (key in info) {
				info[key] = val;	
			}
		});
		
	})(location.search.replace(/^\?/, ''));
	
	info.disable = (t=info.disable) ? t === 'true' : false;
	info.title = info.title || 'Title';
	info.subtitle = info.subtitle || null;
	info.backbutton = (t=info.backbutton) ? t == 'true' : true;
	info.viewsource = (t=info.viewsource) ? t == 'true' : false;
	info.qrcode = (t=info.qrcode) ? t == 'true' : true;
	info.description = info.description || getMetaDescription();
	
	if (info.disable) { return; }
	
	window.demojs = ver;
	
	var gradient = function(color, pos) {
		
		var lists1 = [], lists2 = [];
		
		for (var i = 0, len = arguments.length; i < len - 1; i += 2) {
			
			var color = arguments[i];
			var pos = arguments[i+1];
			
			lists1.push(color + ' ' + (pos * 100) + '%');
			lists2.push('color-stop(' + pos + ', ' + color + ')');
		}
		
		return [
			'background-image: linear-gradient(top, ' + lists1.join(', ') + ');',
			'background-image: -o-inear-gradient(top, ' + lists1.join(', ') + ');',
			'background-image: -moz-linear-gradient(top, ' + lists1.join(', ') + ');',
			'background-image: -webkit-linear-gradient(top, ' + lists1.join(', ') + ');',
			'background-image: -ms-linear-gradient(top, ' + lists1.join(', ') + ');',
			'background-image: -webkit-gradient(linear, left top, left bottom,', lists2.join(', ') + ');'
		].join('\n');
		
	};

	var getClass = function(el, className) {
		return new RegExp('(^|\\s+)' + className.replace(/\-/g, '\\-') + '(\\s+|$)').test(el.className);
	};
	
	var setClass = function(el, className, flag) {
		if (flag) { el.className += ' ' + className; }
		else { el.className = el.className.replace(new RegExp('(^|\\s+)' + className.replace(/\-/g, '\\-') + '(\\s+|$)', 'g'), ' '); }
	};
	
	var randomId = function() { return new Date().getTime() + Math.ceil(100000 * Math.random()); }; 
	
	var viewsrcId = randomId();
	var viewsrcLayerId = randomId();

	var qrcodeId = randomId();
	var qrcodeLayerId = randomId();
	
	var codeJS = document.createElement('script');
	codeJS.type = 'text/javascript';
	codeJS.src = basedir + 'code.js';
	document.body.insertBefore(codeJS, document.body.firstChild);
	
	document.write([
		'<link href="' + basedir + 'demo.css" rel="stylesheet" type="text/css" />',
		'<link href="' + basedir + 'code.css" rel="stylesheet" type="text/css" />',
		'<div class="demo-header">',
			info.backbutton ? '<a href="javascript:history.back();" class="demo-header-back">이전</a>' : '',
			
			info.title ? [
				'<h1>',
					'<span class="demo-title">' + info.title + '</span>',
					info.viewsource ? '<a href="#" class="demo-header-viewsrc demo-button" id="' + viewsrcId + '" title="소스보기" style="right:' + (info.qrcode ? 32 : 0) + 'px;"><span class="demo-span">소스보기</span></a>' : '',
					info.viewsource ? (
						'<div class="demo-viewsrc-layer demo-hide" id="' + viewsrcLayerId + '"><div class="demo-content">' +
							'<code data-selector="*"></code>' +
						'</div></div>'
					) : '',
					info.qrcode ? '<a href="#" class="demo-header-qrcode demo-button" id="' + qrcodeId + '" title="QR 코드"><span class="demo-span">QR 코드</span></a>' : '',
					info.qrcode ? '<div id="' + qrcodeLayerId + '" class="demo-qrcode-layer demo-hide"><img src="http://chart.apis.google.com/chart?cht=qr&chs=220x220&chl=' + encodeURIComponent(location.href) + '&choe=UTF-8" /></div>' : '',
				'</h1>'
			].join('\n') : '',
			info.subtitle ? '<h2><span class="demo-span demo-subtitle">' + info.subtitle + '</span></h2>' : '',
			info.description ? '<p class="demo-desc">' + info.description + '</p>' : '',
		'</div>',
		'<div class="demo-body">'
	].join('\n'));
	
	var viewsourceBtn = document.getElementById(viewsrcId);
	var viewsourceLayer = document.getElementById(viewsrcLayerId);
	
	viewsourceBtn && (viewsourceBtn.onclick = function() {
		var s = getClass(viewsourceBtn, 'demo-header-viewsrc-on');
		setClass(viewsourceBtn, 'demo-header-viewsrc-on', !s);
		setClass(viewsourceLayer, 'demo-hide', s);
		return false;		
	});
	
	var qrcodeBtn = document.getElementById(qrcodeId);
	var qrcodeLayer = document.getElementById(qrcodeLayerId); 
	qrcodeBtn && (qrcodeBtn.onclick = function() {
		var s = getClass(qrcodeLayer, 'demo-hide');
		setClass(qrcodeLayer, 'demo-hide', !s);
		return false;
	});

})();