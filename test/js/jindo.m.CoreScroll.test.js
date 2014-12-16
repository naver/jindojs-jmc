/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
var isMobile = (jindo.$Agent().navigator().mobile);
var isIos = (isMobile && (jindo.m.getDeviceInfo().iphone || jindo.m.getDeviceInfo().ipad));
module("CoreScroll Test", {
	setup: function() {
		oScroll1 = new jindo.m.CoreScroll("view1",{
		});
		oScroll2 = new jindo.m.CoreScroll("view2",{
			bUseTransition : false,
			nWidth : 400
		});
	},
	teardown : function() {
		/** 객체 소멸 */
		oScroll1.destroy();
		oScroll1 = null;
		oScroll2.destroy();
		oScroll2 = null;
	}
} );

test("스크롤 생성 테스트", function() {
	oScroll1.refresh();
	var wleWrapper = oScroll1._htWElement["wrapper"];
	var welScroller = oScroll1._htWElement["scroller"];
	equal(wleWrapper.css("position"), "relative", "wrapper의 초기 속성은 position:relative 입니다");
	equal(wleWrapper.css("overflow"), "hidden", "wrapper의 초기 속성은 overflow:hidden 입니다");
	equal(welScroller.css("position"), "absolute", "scroller의 초기 속성은 position:absolute 입니다");
});

test("스크롤 위치 반환 테스트", function() {
	equal(oScroll1.nMinScrollTop, -oScroll1.option("nOffsetTop"), "스크롤 위쪽의 최소값");
	equal(oScroll1.nMaxScrollTop, oScroll1._htWElement["wrapper"].height() - oScroll1._htWElement["scroller"].height(), "스크롤 아래쪽의 값");
});

test("스크롤 boundary 반환 테스트", function() {
	equal(oScroll1.getPosTop(-999999999999), oScroll1._htWElement["wrapper"].height() - oScroll1._htWElement["scroller"].height(), "스크롤 아래쪽의 최대값 반환");
});

test("스크롤1 이동중 중지 테스트", function() {
	oScroll1.attach("afterScroll", function(we) {
				equal(oScroll1.isMoving(), false, " 움직임 완료");
				ok(we.nTop !== oScroll1.nMaxScrollTop, "최하단 위치 검증");
				start();
			}
	);
	equal(oScroll1.isMoving(), false, " 움직임 전");
	oScroll1.scrollTo(0,oScroll1.nMaxScrollTop,2000);	
	setTimeout(function() {
		equal(oScroll1.isMoving(), true, " 움직이는 중");				
		oScroll1._stopScroll();		
	},1000);
	stop();
});

test("스크롤2 이동중 여부 테스트", function() {
	oScroll2.attach("afterScroll", function(we) {
				equal(oScroll2.isMoving(), false, " 움직임 완료");
				equal(we.nTop, oScroll2.nMaxScrollTop, "최하단 위치 검증");
				start();
			}
	);
	equal(oScroll2.isMoving(), false, " 움직임 전");
	oScroll2.scrollTo(0,oScroll1.nMaxScrollTop,2000);	
	setTimeout(function() {
		equal(oScroll2.isMoving(), true, " 움직이는 중");			
	},1000);
	stop();
});

test("스크롤 getStyleOffset  반환 테스트", function() {
	var htStyleOffset = oScroll1.getStyleOffset(oScroll1._htWElement["wrapper"]);
	equal(htStyleOffset.left, 0 , "android를 제외하고 모두 0");
	equal(htStyleOffset.top, 0 , "android를 제외하고 모두 0");
});

test("스크롤 click clear/restore 테스트", function() {
	if(isIos){
		equal(oScroll1._aAnchor.length, 37, "anchor가 37개 존재한다");
		oScroll1._clearAnchorForIos(); 
		equal(oScroll1._bBlocked, true, "block는 true이다.");
		oScroll1._clearAnchorForIos();
		equal(oScroll1._bBlocked, true, "초기 block는 true이다.");
		oScroll1._restoreAnchorForIos();
		equal(oScroll1._bBlocked, false, "block는 false이다.");
		oScroll1._restoreAnchorForIos();
		equal(oScroll1._bBlocked, false, "block는 false이다.");
		oScroll1._clearAnchorForIos(); 
		equal(oScroll1._bBlocked, true, "block는 true이다.");	
	}else{
		equal(true, true, "ios전용 테스트이므로 PASS");	
	}
});

test("스크롤 모멘텀 확인 테스트", function() {
	var htMomentum = oScroll1._getMomentum(174,0.8969072164948454,0.4022212775002657,505,74.5 , 2822.5);
	equal(htMomentum.nDist , -670.3687958337763, "주어진 값의 모멘텀거리를 계산한다");
	equal(htMomentum.nTime , 1495, "주어진 값의 모멘텀 시간을 계산한다");
	htMomentum = oScroll1._getMomentum(-174,0.8969072164948454,0.4022212775002657,505,74.5 , 2822.5);
	equal(htMomentum.nDist , 112.24484536082474, "주어진 값의 모멘텀거리를 계산한다");
	equal(htMomentum.nTime , 250, "주어진 값의 모멘텀 시간을 계산한다");
	htMomentum = oScroll1._getMomentum(174,0.8969072164948454,0.4022212775002657,505,74.5 , 200);
	equal(htMomentum.nDist ,  -237.74484536082474, "주어진 값의 모멘텀거리를 계산한다");
	equal(htMomentum.nTime , 530, "주어진 값의 모멘텀 시간을 계산한다");
});


