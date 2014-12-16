/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("LayerPosition Test", {
	setup: function() {
		/** 객체 생성 */
		oLp = new jindo.m.LayerPosition("layer");
	},
	teardown : function() {
		/** 객체 소멸 */
		oLp.destroy();
		oLp = null;
	}
} ); 

test("top 확인", function() {
	var elLayer = oLp.getLayer(),
		welLayer = jindo.$Element(elLayer);
		welLayer.show();	
	
	var nLayerWidth = elLayer.offsetWidth,
		nLayerHeight = elLayer.offsetHeight,
		// View...
		oClientSize = jindo.$Document().clientSize(),
		nWidth = oClientSize.width,
		nHeight = oClientSize.height;
		
	//Layer에 마진이 있는경우 렌더링 보정.
	nLayerWidth += parseInt(welLayer.css('marginLeft'), 10) + parseInt(welLayer.css('marginRight'), 10) || 0;
	nLayerHeight += parseInt(welLayer.css('marginTop'), 10) + parseInt(welLayer.css('marginBottom'), 10) || 0;
	
	oLp.top();		
	oLp._onEvent();
	equal(oLp.getPosition(), "top", "포지션값은 top");
	equal(parseInt(elLayer.style.top,10), 0, "top인 경우 초기값은 0"); 
	equal(parseInt(elLayer.style.left,10),  parseInt((nWidth - nLayerWidth) / 2,10), "left인 경우 ClientView의 Width - layer의 width /2 의 값이다");

	oLp.top({
		nTop : 10,
		nLeft : 100,
		nBottom : 10,
		nRight : 20
	});
	// +마진을 줄경우
	equal(parseInt(elLayer.style.top,10), 10, "top인 경우 top마진"); 
	equal(parseInt(elLayer.style.left,10),  parseInt((nWidth - nLayerWidth) / 2 + 100,10), "left인 경우 ClientView의 Width - layer의 width /2 + left마진값이다");

	oLp.top({
		nTop : -10,
		nLeft : -100,
		nBottom : -10,
		nRight : -20
	});
	// -마진을 줄경우
	equal(parseInt(elLayer.style.top,10), -10, "top인 경우 top마진"); 
	equal(parseInt(elLayer.style.left,10),  parseInt((nWidth - nLayerWidth) / 2 - 100,10), "left인 경우 ClientView의 Width - layer의 width /2 + left마진값이다");
});

test("center 확인", function() {
	var elLayer = oLp.getLayer(),
		welLayer = jindo.$Element(elLayer);
		welLayer.show();	

	var nLayerWidth = elLayer.offsetWidth,
		nLayerHeight = elLayer.offsetHeight,
		// View...
		oClientSize = jindo.$Document().clientSize(),
		nWidth = oClientSize.width,
		nHeight = oClientSize.height;
		
	//Layer에 마진이 있는경우 렌더링 보정.
	nLayerWidth += parseInt(welLayer.css('marginLeft'), 10) + parseInt(welLayer.css('marginRight'), 10) || 0;
	nLayerHeight += parseInt(welLayer.css('marginTop'), 10) + parseInt(welLayer.css('marginBottom'), 10) || 0;
	
	
	equal(welLayer.visible(),true, "레이어를 숨기다");
	welLayer.hide();
	equal(welLayer.visible(),false, "레이어를 숨겼다");
	oLp.center();
	welLayer.show();
	equal(welLayer.visible(),true, "레이어를 보였다");
	oLp._onEvent();
	equal(oLp.getPosition(), "center", "포지션값은 center");
	equal(parseInt(elLayer.style.top,10),  parseInt((nHeight - nLayerHeight) / 2,10), "top인 경우 ClientView의 Height - layer의 height /2 의 값이다"); 
	equal(parseInt(elLayer.style.left,10),  parseInt((nWidth - nLayerWidth) / 2,10), "left인 경우 ClientView의 Width - layer의 width /2 의 값이다");

	// +마진을 줄경우
	oLp.center({
		nTop : 10,
		nLeft : 100,
		nBottom : 10,
		nRight : 20
	});
	equal(parseInt(elLayer.style.top,10), parseInt((nHeight - nLayerHeight) / 2 + 10,10), "top인 경우 ClientView의 Height - layer의 height /2 + top마진값이다"); 
	equal(parseInt(elLayer.style.left,10),  parseInt((nWidth - nLayerWidth) / 2 + 100,10), "left인 경우 ClientView의 Width - layer의 width /2 + left마진값이다");
		
	// -마진을 줄경우
	oLp.center({
		nTop : -10,
		nLeft : -100,
		nBottom : -10,
		nRight : -20
	});			
	equal(parseInt(elLayer.style.top,10),  parseInt((nHeight - nLayerHeight) / 2 - 10,10), "top인 경우 ClientView의 Height - layer의 height /2 + top마진값이다"); 
	equal(parseInt(elLayer.style.left,10),  parseInt((nWidth - nLayerWidth) / 2 - 100,10), "left인 경우 ClientView의 Width - layer의 width /2 + left마진값이다");
});


test("bottom 확인", function() {
	var elLayer = oLp.getLayer(),
		welLayer = jindo.$Element(elLayer);
		welLayer.show();	

	var nLayerWidth = elLayer.offsetWidth,
		nLayerHeight = elLayer.offsetHeight,
		// View...
		oClientSize = jindo.$Document().clientSize(),
		nWidth = oClientSize.width,
		nHeight = oClientSize.height;
		
	//Layer에 마진이 있는경우 렌더링 보정.
	nLayerWidth += parseInt(welLayer.css('marginLeft'), 10) + parseInt(welLayer.css('marginRight'), 10) || 0;
	nLayerHeight += parseInt(welLayer.css('marginTop'), 10) + parseInt(welLayer.css('marginBottom'), 10) || 0;
	
	oLp.bottom();
	oLp._onEvent();
	equal(oLp.getPosition(), "bottom", "포지션값은 bottom");
	
	if(oLp.isUseFixed()) {
		equal(parseInt(elLayer.style.bottom,10),  0, "bottom인 경우 0 이다");	
	} else {
		equal(parseInt(elLayer.style.top,10),  nHeight - nLayerHeight, "top인 경우 ClientView의 Height - layer의 height 의 값이다"); 
	}
	equal(parseInt(elLayer.style.left,10),  parseInt((nWidth - nLayerWidth) / 2,10), "left인 경우 ClientView의 Width - layer의 width /2 의 값이다");
			
	// +마진을 줄경우
	oLp.bottom({
		nTop : 10,
		nLeft : 100,
		nBottom : 40,
		nRight : 20
	});

	if(oLp.isUseFixed()) {
		equal(parseInt(elLayer.style.bottom,10),  40, "bottom인 경우 40 이다");	
	} else {
		equal(parseInt(elLayer.style.top,10), parseInt(nHeight - nLayerHeight - 40,10), "top인 경우 ClientView의 Height - layer의 height /2 - bottom마진값이다");
	} 
	equal(parseInt(elLayer.style.left,10),  parseInt((nWidth - nLayerWidth) / 2 + 100,10), "left인 경우 ClientView의 Width - layer의 width /2 + left마진값이다");
	
	// -마진을 줄경우
	oLp.bottom({
		nTop : -10,
		nLeft : -100,
		nBottom : -40,
		nRight : -20
	});			

	if(oLp.isUseFixed()) {
		equal(parseInt(elLayer.style.bottom,10),  -40, "bottom인 경우 -40 이다");	
	} else {
		equal(parseInt(elLayer.style.top,10),  parseInt(nHeight - nLayerHeight + 40,10), "top인 경우 ClientView의 Height - layer의 height /2 + bottom마진값이다");
	} 
	equal(parseInt(elLayer.style.left,10),  parseInt((nWidth - nLayerWidth) / 2 - 100,10), "left인 경우 ClientView의 Width - layer의 width /2 + left마진값이다");
});

test("all 확인", function() {
	var elLayer = oLp.getLayer(),
		welLayer = jindo.$Element(elLayer),
		nLayerWidth = elLayer.offsetWidth,
		nLayerHeight = elLayer.offsetHeight,
		// View...
		oClientSize = jindo.$Document().clientSize(),
		nWidth = oClientSize.width,
		nHeight = oClientSize.height,
		htPadding = {
			"padding-top" : parseInt(welLayer.css("padding-top"),10),
			"padding-bottom" : parseInt(welLayer.css("padding-bottom"),10), 
			"padding-left" : parseInt(welLayer.css("padding-left"),10),
			"padding-right" :	parseInt(welLayer.css("padding-right"),10)
		}, htBorder = {
			"border-top-width" : parseInt(welLayer.css("border-top-width"),10),
			"border-bottom-width" : parseInt(welLayer.css("border-bottom-width"),10),
			"border-left-width" : parseInt(welLayer.css("border-left-width"),10),
			"border-right-width" : parseInt(welLayer.css("border-right-width"),10)
		};
		 
	nWidth -= htPadding["padding-left"] + htPadding["padding-right"] + htBorder["border-left-width"] + htBorder["border-right-width"];
	nHeight -= htPadding["padding-top"] + htPadding["padding-bottom"] + htBorder["border-top-width"] + htBorder["border-bottom-width"];		
		
	oLp.all();
	oLp._onEvent();
	equal(oLp.getPosition(), "all", "포지션값은 all");
	equal(parseInt(elLayer.style.width,10),  nWidth, "전체화면 크기 동일"); 
	equal(parseInt(elLayer.style.height,10),  nHeight, "전체화면 크기 동일"); 
	elLayer.style.width = nLayerWidth + "px";
	elLayer.style.height = nLayerHeight + "px";
	
	// +마진을 줄경우
	oLp.all({
		nTop : 10,
		nLeft : 100, 
		nBottom : 0,
		nRight : 20
	});
	equal(parseInt(elLayer.style.width,10),  nWidth-100-20, "마진 제외한 전체화면 크기 동일"); 
	equal(parseInt(elLayer.style.height,10),  nHeight-10, "마진 제외한 전체화면 크기 동일");
	equal(parseInt(elLayer.style.left,10),  100, "마진의 left와 동일");
	equal(parseInt(elLayer.style.top,10),  10, "마진의 top와 동일");
	elLayer.style.width = nLayerWidth + "px";
	elLayer.style.height = nLayerHeight + "px";	
	welLayer.hide();
});
