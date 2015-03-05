module("ScrollEnd Component Test", {
	setup: function() {
		oScrollEnd = new jindo.m.ScrollEnd();
	},
	teardown : function() {
		oScrollEnd.destroy();
		oScrollEnd = null;
	}
});

test("scrollEnd 생성, 소멸 테스트",function() {
	equal((oScrollEnd instanceof jindo.m.ScrollEnd), true, "jindo.m.oScrollEnd 인스턴스 생성.");
	jindo.m.getOsInfo().android = true;
	oScrollEnd.destroy();
	oScrollEnd = new jindo.m.ScrollEnd();
	equal((oScrollEnd instanceof jindo.m.ScrollEnd), true, "[Andoid] jindo.m.oScrollEnd 인스턴스 생성.");
	jindo.m.getOsInfo().android = false;
});

test("Observer",function() {
	oScrollEnd._isTouched = true;
	oScrollEnd._startObserver();
	ok(oScrollEnd._nObserver , "옵저버 실행중...");
	oScrollEnd._isTouched = false;
	oScrollEnd._stopObserver();
});

test("[Android] scrollEnd 이벤트 attach, detach  테스트",function() {
	oScrollEnd.destroy();
	oScrollEnd = new jindo.m.ScrollEnd();
	equal((oScrollEnd instanceof jindo.m.ScrollEnd), true, "jindo.m.oScrollEnd 인스턴스 생성.");
	jindo.m.getOsInfo().android = true;

	// window.scrollTo로 이벤트가 발생하는 안드로이드 계열만 처리
	if(jindo.m.getOsInfo().andoid) {
		oScrollEnd.attach("scrollEnd",function(we) {
			ok(true, "scrollEnd  이벤트 발생");
			jindo.m.getOsInfo().android = false;
			start();
		});
		window.scrollTo(0,20);
		stop();
	}
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/23
test("iOS에서 이벤트가 2번 타는 문제 수정",  function() {
	var fGd = jindo.m.getOsInfo;
	var isDuplicate = false;
	jindo.m.getOsInfo = function() {
		return {
			iphone : true,
			ipad : false,
			ios : true,
			android : false,
			version : 7,	// iOS7이하일 경우 확인
			win : false
		};
	}
	oScrollEnd.destroy();
	oScrollEnd = new jindo.m.ScrollEnd();
	oScrollEnd.attach("scrollEnd",function(we) {
		equal(isDuplicate, false, "중복호출 안한다.");
		ok(true, "scrollEnd  이벤트 발생");
		jindo.m.getOsInfo = fGd;
		isDuplicate = true;
		start();
	});
	window.scrollTo(0,20);
	stop();
});


// https://github.com/naver/jindojs-jmc/issues/8
test("jindo.m.ScrollEnd fired 'scrollEnd' event when a device was rotated on ChromeBrowser ",  function() {
	var fosInfo = jindo.m.getOsInfo;
	var fbInfo = jindo.m.getBrowserInfo;
	var isDuplicate = false;
	jindo.m.getOsInfo = function() {
		return {
			iphone : false,
			ipad : false,
			ios : false,
			android : true,
			version : 4,
			win : false
		};
	};
	jindo.m.getBrowserInfo = function() {
		return {
			bSBrowser : false,
			chrome : true,
		};
	}
	oScrollEnd.destroy();
	oScrollEnd = new jindo.m.ScrollEnd();
	equal(oScrollEnd._getDetectType(), 3, "크롬인 경우");
	jindo.m.getOsInfo = fosInfo;
	jindo.m.getBrowserInfo = fbInfo;
});