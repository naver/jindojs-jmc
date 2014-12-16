/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("Scroll Test", {
	setup: function() {
		oScrollHorizon = new jindo.m.Scroll("viewHorizon",{
			bUseHScroll : true,
	 		bUseVScroll : false,
			bUseScrollbar : true,
			bUseFixedScrollbar : false,
			bUsePullDown : true,
			bUsePullUp : true,
			bUseMomentum : true,
			nHeight: 110,
			nDeceleration : 0.0005
		});
		oScrollVertical = new jindo.m.Scroll("viewVertical",{
			bUseHScroll : false,
	 		bUseVScroll : true,
			bUseScrollbar : true,
			bUseFixedScrollbar : true,
			bUsePullDown : true,
			bUsePullUp : true,
			bUseMomentum : true,
			nHeight : 450,
			nDeceleration : 0.0005	,
			bAutoResize : true
		});

		oScrollSame = new jindo.m.Scroll("sameScroll",{
			bUseHScroll : true,
	 		bUseVScroll : false,
			nHeight : 110,
			bAutoResize : true
		});
	},
	teardown : function() {
		/** 객체 소멸 */
		oScrollHorizon.destroy();
		oScrollHorizon = null;
		oScrollVertical.destroy();
		oScrollVertical = null;
		oScrollSame.destroy();
		oScrollSame = null;
	}
} );

test("스크롤 생성 테스트", function() {
	oScrollVertical.refresh();
	oScrollHorizon.refresh();
	var wleWrapper = oScrollVertical._htWElement["wrapper"];
	var welScroller = wleWrapper.first();
	equal(wleWrapper.css("position"), "relative", "wrapper의 초기 속성은 position:relative 입니다");
	equal(wleWrapper.css("overflow"), "hidden", "wrapper의 초기 속성은 overflow:hidden 입니다");
	equal(welScroller.css("position"), "absolute", "scroller의 초기 속성은 position:absolute 입니다");
});

test("스크롤바 생성 테스트", function() {
	var wleVScrollbar = oScrollVertical._htWElement["Vscrollbar"];
	var wleVIndicator = wleVScrollbar.first();
	equal(wleVScrollbar.css("position"), "absolute", "수직 스크롤영역의 position 초기 속성은 absolute입니다");
	equal(wleVIndicator.css("position"), "absolute", "수직 스크롤바의 position 초기 속성은 absolute입니다");
	equal(oScrollVertical._nPropVScroll, (wleVScrollbar.height() - wleVIndicator.height()) / oScrollVertical.nMaxScrollTop, "Scroll포지션 비율의 화면에 따라 계산되어진다");
	equal(wleVScrollbar.opacity(), 1, "fixedScrollbar 적용시 1이다");
});


test("스크롤 pull down 사용여부 제어 테스트", function() {
	equal(oScrollVertical._inst("pull")._isPullDown, true, "스크롤 pull down 사용가능");
	oScrollVertical.setUsePullDown(false);
	equal(oScrollVertical._inst("pull")._isPullDown, false, "스크롤 pull down 사용 불가능");
	oScrollVertical.setUsePullDown(true);
	equal(oScrollVertical._inst("pull")._isPullDown, true, "스크롤 pull down 사용가능");
});

test("스크롤 pull up 사용여부 제어 테스트", function() {
	equal(oScrollVertical._inst("pull")._isPullUp, true, "스크롤 pull up 사용가능");
	oScrollVertical.setUsePullUp(false);
	equal(oScrollVertical._inst("pull")._isPullUp, false, "스크롤 pull up 사용 불가능");
	oScrollVertical.setUsePullUp(true);
	equal(oScrollVertical._inst("pull")._isPullUp, true, "스크롤 pull up 사용가능");
});

test("스크롤바 hide 테스트", function() {
	var wleVScrollbar = jindo.$Element(oScrollVertical._htWElement["Vscrollbar"]);
	equal(wleVScrollbar.visible(), true, "fixedScrollBar 적용시 1이다");
	oScrollVertical._hideScrollBar("V");
	equal(wleVScrollbar.visible(), false, "fixedScrollBar를 숨기다");
});

test("스크롤 위치 반환 테스트", function() {
	equal(oScrollVertical.getRight(), oScrollVertical.nMaxScrollLeft, "스크롤 우측의 값을 스크롤의 최대값");
	equal(oScrollVertical.getLeft(), 0, "스크롤 좌측의 값을 0");
	equal(oScrollVertical.getBottom(), oScrollVertical.nMaxScrollTop, "스크롤 아래측의 값을 스크롤의 최대값");
	equal(oScrollVertical.getTop(), oScrollVertical.nMinScrollTop, "스크롤 위측의 최소값");
});

test("pull - down 호출 테스트", function() {
	// equal(oScrollVertical._htWElement["pullDown"]._isReady_, "false", "초기 pullDown은 false");
	oScrollVertical._htWElement["pullDown"]._isReady_ = true;
	equal(oScrollVertical._htWElement["pullDown"]._isReady_, true, "pullDown이 ready로 변경");
	// oScrollVertical._onEnd();
//
	// oScrollVertical._inst("pull").touchMoveForUpdate({
		// nTop : 200
	// }) ;

});

test("pull - up  호출 테스트", function() {
	// equal(oScrollVertical._inst("pull")._htWElement["pullUp"]._isReady_, false, "초기 pullUp은 false");
	oScrollVertical._inst("pull")._htWElement["pullUp"]._isReady_ = true;
	equal(oScrollVertical._inst("pull")._htWElement["pullUp"]._isReady_, true, "pullUp이 ready로 변경");
	// oScrollVertical._onTouchEnd ();


	// oScrollVertical._touchMoveForUpdate({
		// nTop : -40000
	// }) ;

});

test("width 설정, 반환 테스트", function() {
	var nWidth = oScrollHorizon.width();
	equal(oScrollHorizon._htWElement["wrapper"].width(), nWidth, "width 반환값 테스트");
	oScrollHorizon.width(600);
	equal(oScrollHorizon._htWElement["wrapper"].width(), 600,"width 변경 테스트");
});

test("height 설정, 반환 테스트", function() {
	var nHeight = oScrollVertical.height();
	equal(oScrollVertical._htWElement["wrapper"].height(), nHeight, "height 반환값 테스트");
	oScrollVertical.height(700);
	equal(oScrollVertical._htWElement["wrapper"].height(), 700,"height 변경 테스트");
});

test("스크롤 이동중 여부 확인 테스트", function() {
	oScrollVertical.attach("afterScroll", function(we) {
			equal(oScrollVertical.isMoving(), false, " 움직임 완료");
			start();
		}
	);
	equal(oScrollVertical.isMoving(), false, " 움직임 전");
	oScrollVertical.scrollTo(0,oScrollVertical.getBottom(),1000);
	setTimeout(function() {
		equal(oScrollVertical.isMoving(), true, " 움직이는 중");
	},500);
	stop();
});

test("스크롤 activate/deactivate 테스트", function() {
	equal(oScrollVertical.isActivating(), true, " activateing - true");
	equal(oScrollVertical.isActivating(), true, " oCore activateing - true");

	oScrollVertical.deactivate();

	equal(oScrollVertical.isActivating(), false, " activateing - false");
	equal(oScrollVertical.isActivating(), false, " oCore activateing - false");

	oScrollVertical.activate();

	equal(oScrollVertical.isActivating(), true, " activateing - true");
	equal(oScrollVertical.isActivating(), true, " oCore activateing - true");
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/36
test("beforePosition, position 이벤트 속성 미노출 문제", function() {
	oScrollHorizon.attach({
		"beforePosition": function(we) {
			notEqual(we.nLeft, undefined, "속성값이 존재해야한다." + we.nLeft);
			notEqual(we.nTop, undefined, "속성값이 존재해야한다." + we.nTop);
			notEqual(we.nNextLeft, undefined, "속성값이 존재해야한다." + we.nNextLeft);
			notEqual(we.nNextTop, undefined, "속성값이 존재해야한다." + we.nNextTop);
			notEqual(we.nVectorX, undefined, "속성값이 존재해야한다." + we.nVectorX);
			notEqual(we.nVectorY, undefined, "속성값이 존재해야한다." + we.nVectorY);
			notEqual(we.nMaxScrollLeft, undefined, "속성값이 존재해야한다." + we.nMaxScrollLeft);
			notEqual(we.nMaxScrollTop, undefined, "속성값이 존재해야한다." + we.nMaxScrollTop);
		},
		"position" : function(we) {
			notEqual(we.nLeft, undefined, "속성값이 존재해야한다." + we.nLeft);
			notEqual(we.nTop, undefined, "속성값이 존재해야한다." + we.nTop);
			notEqual(we.nMaxScrollLeft, undefined, "속성값이 존재해야한다." + we.nMaxScrollLeft);
			notEqual(we.nMaxScrollTop, undefined, "속성값이 존재해야한다." + we.nMaxScrollTop);
		},
		"afterScroll" : function(we) {
			start();
		}
	});
	stop();
	oScrollHorizon.scrollTo(9999,0,1000);
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/22
asyncTest("beforePosition 이벤트에서 stop 을 해도 updater 가 계속 동작되는 오류", function() {
	var nUpdaterId = 0;
	var nCount =0;
	oScrollHorizon = new jindo.m.Scroll("viewHorizon",{
		bUseHScroll : true,
		bUseVScroll : false,
		bUseScrollbar : true,
		bUseFixedScrollbar : false,
		bUseMomentum : true,
		nHeight: 110,
		nDeceleration : 0.0005,
		bUseTransition : false
	});
	oScrollHorizon.scrollTo(99999,0,2000);

	setTimeout(function() {
		oScrollHorizon.attach({
			"beforePosition": function(we) {
				// 계속 update가 돌경우에는 값이 계속 바뀌지만.
				// 애니메이션이 종료 되었을 경우 update가 -1로 유지되는지를 3번 확인
				setTimeout(function() {
				    equal(oScrollHorizon._nUpdater, -1, "update의 아이디가 계속 변경되면 안된다");
					setTimeout(function() {
					    equal(oScrollHorizon._nUpdater, -1, "update의 아이디가 계속 변경되면 안된다");
						setTimeout(function() {
						    equal(oScrollHorizon._nUpdater, -1, "update의 아이디가 계속 변경되면 안된다");
							start();
						},1000);
					},1000);
				},1000);
				start();
				we.stop();
			},
			"position" : function(we) {
				throw e;
			},
			"afterScroll" : function(we) {
				throw e;
			}
		});
		oScrollHorizon.scrollTo(0,0,1000);
	},2500);
	stop();
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/47
test("동일 엘리먼트에 인스턴스를 계속 생성할 경우, 계속 scrollbar가 생성되는 문제 수정", function() {
	oScrollHorizon.refresh();
	// console.log(oScrollHorizon._htWElement["wrapper"].queryAll("div." + jindo.m.Scroll.SCROLLBAR_CLASS));
	equal(oScrollHorizon._htWElement["wrapper"].queryAll("div." + jindo.m.Scroll.SCROLLBAR_CLASS).length, 1, "스크롤바는 매번 생성하고 refresh해도 1이다");

	oScrollHorizon = new jindo.m.Scroll("viewHorizon",{
		bUseHScroll : true,
 		bUseVScroll : false,
		bUseScrollbar : true,
		bUseFixedScrollbar : false,
		bUseMomentum : true,
		nHeight: 110,
		nDeceleration : 0.0005
	});
	oScrollHorizon.refresh();

	equal(oScrollHorizon._htWElement["wrapper"].queryAll("div." + jindo.m.Scroll.SCROLLBAR_CLASS).length, 1, "스크롤바는 매번 생성하고 refresh해도 1이다");

	oScrollHorizon = new jindo.m.Scroll("viewHorizon",{
		bUseHScroll : true,
 		bUseVScroll : false,
		bUseScrollbar : true,
		bUseFixedScrollbar : false,
		bUseMomentum : true,
		nHeight: 110,
		nDeceleration : 0.0005
	});
	oScrollHorizon.refresh();

	equal(oScrollHorizon._htWElement["wrapper"].queryAll("div." + jindo.m.Scroll.SCROLLBAR_CLASS).length, 1, "스크롤바는 매번 생성하고 refresh해도 1이다");
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/38
test("refresh 이후 스크롤바가 계속 보이는 문제", function() {
	oScrollHorizon.refresh();
	var welScrollbar = jindo.$Element(oScrollHorizon._htWElement["wrapper"].query("div." + jindo.m.Scroll.SCROLLBAR_CLASS)),
		welScrollbarIndicator = welScrollbar.first();
	oScrollHorizon.refresh();
	equal(welScrollbar.visible(), false, "refresh 이후 스크롤바는 안보인다.");
	oScrollHorizon.refresh();
	equal(welScrollbar.visible(), false, "refresh 이후 스크롤바는 안보인다.");
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/48
test("킷켓 하이라이트 문제 확인 모듈", function() {
	jindo.m.patch(jindo.m.Component.VERSION).add({
		"_hasKitkatHighlightBug" : function() {
			return 1;
		}
	});
	oScrollHorizon = new jindo.m.Scroll("viewHorizon",{
		bUseHScroll : true,
 		bUseVScroll : false,
		bUseScrollbar : true,
		bUseFixedScrollbar : false,
		bUseMomentum : true,
		nHeight: 110,
		nDeceleration : 0.0005,
		bUseTransition : false
	});
	oScrollHorizon.refresh();
	equal(oScrollHorizon._hasKitkatHighlightBug, true, "킷켓 하이라이트 버그가 존재하는 경우");
	equal(oScrollHorizon._htWElement["wrapper"].hasClass(jindo.m.KITKAT_HIGHLIGHT_CLASS), true, "킷켓 하이라이트 잔상을 방지하기 위해, -webkit-tap-highlight-color: rgba(0,0,0,0) 으로 하위를 설정");
	oScrollHorizon._tapHighlight();
	equal(oScrollHorizon._htWElement["wrapper"].hasClass(jindo.m.KITKAT_HIGHLIGHT_CLASS), false, "클릭시 -webkit-tap-highlight-color: rgba(0,0,0,0) 을 제거");
	stop();
	setTimeout(function() {
		equal(oScrollHorizon._htWElement["wrapper"].hasClass(jindo.m.KITKAT_HIGHLIGHT_CLASS), true, "킷켓 하이라이트 잔상을 방지하기 위해, -webkit-tap-highlight-color: rgba(0,0,0,0) 으로 하위를 설정");
		start();
	},300);
});


test("scrollTo 호출시 beforePosition, position 이벤트 중복 발생 확인", function() {
    var nBeforePosition = nPosition = 0;
	oScrollHorizon = new jindo.m.Scroll("viewHorizon",{
		bUseHScroll : true,
 		bUseVScroll : false,
		bUseScrollbar : true,
		bUseFixedScrollbar : false,
		bUseMomentum : true,
		nHeight: 110,
		nDeceleration : 0.0005,
		bUseTransition : false
	}).attach({
	    "beforePosition" : function(){
	        nBeforePosition++;
	    },
	    "position" : function(){
	        nPosition++;
	    }
	});

	oScrollHorizon.scrollTo(100, 0);
	stop();

	setTimeout(function(){
	    equal(nBeforePosition, 1, "beforePosition 이벤트 한번 발생");
	    equal(nPosition, 1, "nPosition 이벤트 한번 발생");
	    start();
	}, 200);
});


test("동일한 위치로 중복 이동시 custom event 발생 확인", function() {
    var nBeforePosition = nPosition = 0;
	oScrollHorizon = new jindo.m.Scroll("viewHorizon",{
		bUseHScroll : true,
 		bUseVScroll : false,
		bUseScrollbar : true,
		bUseFixedScrollbar : false,
		bUseMomentum : true,
		nHeight: 110,
		nDeceleration : 0.0005,
		bUseTransition : false
	}).attach({
	    "beforePosition" : function(){
	        nBeforePosition++;
	    },
	    "position" : function(){
	        nPosition++;
	    }
	});

	oScrollHorizon.scrollTo(100, 0);
	oScrollHorizon.scrollTo(100, 0);
	stop();

	setTimeout(function(){
	    equal(nBeforePosition, 1, "beforePosition 이벤트 한번 발생");
	    equal(nPosition, 1, "nPosition 이벤트 한번 발생");
	    start();
	}, 200);
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/10
test("스크롤이 멈추었을 때 스크롤바가 노출되는 문제 수정", function() {
	var welScrollbar = jindo.$Element(oScrollHorizon._htWElement["wrapper"].query("div." + jindo.m.Scroll.SCROLLBAR_CLASS)),
		welScrollbarIndicator = welScrollbar.first();

	oScrollHorizon.scrollTo(0,0,0);
	oScrollHorizon.scrollTo(300,0,1000);
	stop();

	setTimeout(function() {
		equal(welScrollbar.visible(), true, "이동중 스크롤바가 보인다.");
		setTimeout(function() {
			equal(welScrollbar.visible(), false, "이동 후 스크롤바가 안보인다.");
			start();
		},1500);
	},500);
});


// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/21
test("view와 scroller의 크기가 같고, 스크롤바를 사용할 경우", function() {
	equal(oScrollSame._htWElement["wrapper"].width(), oScrollSame._htWElement["scroller"].width(), "view와 scroller가 동일한가?");
	equal(oScrollSame.hasHScroll(), true, "view와 scroller가 동일할 경우, 스크롤은 됨");
	oScrollHorizon.scrollTo(300,0,500);
	stop();

	setTimeout(function() {
		// script 에러가 발생하지 않는다.
		start();
	},1000);
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/39
test("회전시, view size보다 scroller size가 작아서 스크롤이 안되는 경우 위치 오류 수정", function() {
	var orgWidth = oScrollSame._htWElement["wrapper"].width();
	equal(orgWidth, oScrollSame._htWElement["scroller"].width(), "view와 scroller가 동일한가?");
	equal(oScrollSame.hasHScroll(), true, "view size보다 scroller size가 작을 경우, 스크롤 됨");

	// view size 크게 변경
	jindo.$Element("sameScroll").width(orgWidth + 100);
	oScrollSame.refresh();
	ok(oScrollSame._htWElement["wrapper"].width() > oScrollSame._htWElement["scroller"].width(), "view size보다 scroller size 보다 작은가?");
	oScrollHorizon.scrollTo(300,0,500);
	stop();

	setTimeout(function() {
		// script 에러가 발생하지 않는다.
		jindo.$Element("sameScroll").width(orgWidth);
		start();
	},1000);
});



// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/11
test("스크롤이 멈추었을 때 스크롤바가 노출되는 문제 수정", function() {
	oScrollHorizon = new jindo.m.Scroll("viewHorizon",{
		bUseHScroll : true,
 		bUseVScroll : false,
		bUseScrollbar : true,
		bUseFixedScrollbar : false,
		bUseMomentum : true,
		nHeight: 110,
		nDeceleration : 0.0005,
		bUseTimingFunction : true
	});
	var welScrollbar = jindo.$Element(oScrollHorizon._htWElement["wrapper"].query("div." + jindo.m.Scroll.SCROLLBAR_CLASS)),
		welScrollbarIndicator = welScrollbar.first();

	oScrollHorizon.scrollTo(0,0,0);

	var htBefore = jindo.m.getTranslateOffset(welScrollbarIndicator);
	equal(htBefore.left, 0, "왼쪽 0");
	equal(htBefore.top, 0, "위쪽 0");

	oScrollHorizon.attach("afterScroll", function(we) {
		equal(oScrollHorizon.isMoving(), false, " 움직임 완료");
		var aResult = welScrollbarIndicator.css("-webkit-transform").match(/translate(3d)?\((\d+)px.?,.?(\d+)px/),

			nLeft = aResult[2],
			nTop = aResult[3];
		ok(nLeft > 0, "이동후 스크롤바의 위치는 초기 값 0 보다 큰값");
		equal(nTop, 0, "이동후 스크롤바의 위치는 0");
		oScrollHorizon.detachAll();
		start();
	});
	oScrollHorizon.scrollTo(300,0,500);
	stop();
});
