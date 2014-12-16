/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("SlideTab Test", {
	setup: function() {
		/** 객체 생성 */
		oTab = new jindo.m.SlideTab("tabComponent", {
            nSlideDuration : 500
        });
	},
	teardown : function() {
		/** 객체 소멸 */
		oTab.destroy();
		oTab = null;
	}
} );

test("nCountPerView 옵션 적용 테스트", function(){
    oTab.option("nCountPerVeiw", 2);
    oTab._initData();
    oTab.resize();
    oTab.activate();

    equal(oTab._nPageWidth/2, oTab._aTab[0].width() , "탭의 넓이가 화면사이즈에 맞게 처리되어야 한다.");
});

test("page 데이터 테스트", function() {
	var nTab = oTab.getTab().length;
	var nViewTab = oTab.option("nCountPerVeiw");
	var pageCount = parseInt(nTab/nViewTab,10);
	if(nTab%nViewTab > 0) {
		pageCount++;
	}
	equal(pageCount, oTab.getTotalPage(), "페이지 총 개수여부 확인");
});

test("page next 작동 테스트", function() {
	var nPage = oTab.getCurrentPage();
	oTab.attach("next", function() {
		equal(oTab.getCurrentPage(), ++nPage, "다음일 경우 증가");
		start();
	});
	equal(oTab.getCurrentPage(), nPage, "초기 페이지값은 1");
	oTab.next();
	stop();
});

test("page prev 작동 테스트", function() {
	var nPage = oTab.getCurrentPage();
	oTab.attach("prev", function() {
		equal(oTab.getCurrentPage(), 1, "전 일 경우 감소");
		start();
	});
	equal(oTab.getCurrentPage(), nPage, "초기 페이지값은 1");
	oTab._nCurrentPage = 2;
	oTab.prev();
	stop();
});

test("select 테스트", function() {
	equal(oTab.getCurrentIndex(), 0, "0번 선택됨");
	oTab.select(3);
	equal(oTab.getCurrentIndex(), 3, "3번 선택됨");
	oTab.select(03);
	equal(oTab.getCurrentIndex(), 3, "3번 선택됨");
	oTab.select("s2");
	equal(oTab.getCurrentIndex(), 3, "오류로 선택안되어 3번 선택됨");
	oTab.select(0);
	equal(oTab.getCurrentIndex(), 0, "0번 선택됨");
});
