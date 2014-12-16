/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("IndexScroll Test", {
	setup: function() {
		oScroll = new jindo.m.IndexScroll("view1",{
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
	},
	teardown : function() {
		/** 객체 소멸 */
		oScroll.destroy();
		oScroll = null;
	}
} );

test("스크롤 생성 테스트", function() {
	oScroll._refreshIndexView();
	oScroll.refresh();

	var wleWrapper = oScroll._htWElement["wrapper"];
	var welScroller = wleWrapper.first();
	equal(wleWrapper.css("position"), "relative", "wrapper의 초기 속성은 position:relative 입니다");
	equal(wleWrapper.css("overflow"), "hidden", "wrapper의 초기 속성은 overflow:hidden 입니다");
	equal(welScroller.css("position"), "absolute", "scroller의 초기 속성은 position:absolute 입니다");
});

test("IndexScroll 개수 확인", function() {
	var aIndexInfo = oScroll._aIndexInfo;
	equal(aIndexInfo.length, 4, "index의 개수는 총 4개입니다.");
	equal(oScroll._htWElement["index_top"] != null, true, "더미 index top이 있다.");
	equal(oScroll._htWElement["index_bottom"] != null, true, "더미 index bottom이 있다.");
});

test("IndexScroll Top에 따른 인덱스 번호 확인", function() {
	var aIndexInfo = oScroll._aIndexInfo;
	;
	equal(oScroll._getCurrentIdx(aIndexInfo[0].nTop-10), -1, (aIndexInfo[0].nTop-10) + "의 index 번호는 -1");
	equal(oScroll._getCurrentIdx(aIndexInfo[1].nTop-10), 0, (aIndexInfo[1].nTop-10) + "의 index 번호는 0");
	equal(oScroll._getCurrentIdx(aIndexInfo[2].nTop-10), 1, (aIndexInfo[2].nTop-10) + "의 index 번호는 1");
	equal(oScroll._getCurrentIdx(aIndexInfo[3].nTop-10), 2, (aIndexInfo[3].nTop-10) + "의 index 번호는 2");
	equal(oScroll._getCurrentIdx(aIndexInfo[3].nTop+10), 3, (aIndexInfo[3].nTop+10) + "의 index 번호는 3");
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/12
test("useTimingFunction이 true일 경우, 인덱스 정보가 정확하지 않는 문제 수정", function() {
	oScroll = new jindo.m.IndexScroll("view1",{
		bUseHScroll : true,
 		bUseVScroll : false,
		bUseScrollbar : true,
		bUseFixedScrollbar : false,
		bUsePullDown : true,
		bUsePullUp : true,
		bUseMomentum : true,
		nHeight: 110,
		nDeceleration : 0.0005,
		bUseTimingFunction : true
	});
	var aIndexInfo = oScroll._aIndexInfo;
	;
	equal(oScroll._getCurrentIdx(aIndexInfo[0].nTop-10), -1, (aIndexInfo[0].nTop-10) + "의 index 번호는 -1");
	equal(oScroll._getCurrentIdx(aIndexInfo[1].nTop-10), 0, (aIndexInfo[1].nTop-10) + "의 index 번호는 0");
	equal(oScroll._getCurrentIdx(aIndexInfo[2].nTop-10), 1, (aIndexInfo[2].nTop-10) + "의 index 번호는 1");
	equal(oScroll._getCurrentIdx(aIndexInfo[3].nTop-10), 2, (aIndexInfo[3].nTop-10) + "의 index 번호는 2");
	equal(oScroll._getCurrentIdx(aIndexInfo[3].nTop+10), 3, (aIndexInfo[3].nTop+10) + "의 index 번호는 3");
});

test("스크롤 이동중 여부 확인 테스트", function() {
	equal(oScroll.isMoving(), false, " 움직임 전");
	oScroll.scrollTo(0,100,0);
});
