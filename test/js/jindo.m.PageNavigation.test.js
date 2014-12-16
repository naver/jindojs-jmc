/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("PageNavigation Template", {
	setup: function() {
		oPage = new jindo.m.PageNavigation(jindo.$('paging'),{
			sClassPrefix : 'page-',
			nItem : 75, //아이템 개수
			nItemPerPage : 6,
			nPage : 2
		});
	},
	teardown : function() {
		oPage.destroy();
		oPage = null;
	}
} );

var welPrev = jindo.$Element(jindo.$$.getSingle('.page-prev'));
var welNext = jindo.$Element(jindo.$$.getSingle('.page-next'));
var welPrevOff = jindo.$Element(jindo.$$.getSingle('.page-prev-off'));
var welNextOff = jindo.$Element(jindo.$$.getSingle('.page-next-off'));
var welInfo = jindo.$Element(jindo.$$.getSingle('.page-info'));

test("페이지이동", function() {
	ok(oPage.getCurrentPage() == 2, '현재 페이지 이동됨');
	oPage.movePageTo(1);
	ok(oPage.getCurrentPage() == 1, '1페이지로 이동');
	ok(!welPrev.visible(), '이전링크노드 hide');
	
	ok(!!welPrevOff.visible(), '이전텍스트 노드 show');
	ok(!!welNext.visible(), '다음링크노드 show');
	ok(!welNextOff.visible(), '다음텍스트노드 show');
	equal(welInfo.text(), '1 / 13', '페이지 정보업데이트');
	
	welNext.fireEvent('click');
	ok(oPage.getCurrentPage() == 2, '2페이지로 이동');
	ok(!!welPrev.visible(), '이전링크노드  show');
	ok(!welPrevOff.visible(), '이전텍스트 노드 hide');
	ok(!!welNext.visible(), '다음링크노드 show');
	ok(!welNextOff.visible(), '다음텍스트노드 show');
	equal(welInfo.text(), '2 / 13', '페이지 정보업데이트');
	
	var nLast = oPage.getTotalPages();
	oPage.movePageTo(nLast);
	ok(oPage.getCurrentPage() == nLast, '마지막 페이지로 이동');
	ok(!!welPrev.visible(), '이전링크노드  show');
	ok(!welPrevOff.visible(), '이전텍스트 노드  hide');
	ok(!welNext.visible(), '다음링크노드 show');
	ok(!!welNextOff.visible(), '다음텍스트노드 hide');
	equal(welInfo.text(), '13 / 13', '페이지 정보업데이트');
	
	welPrev.fireEvent('click');
	ok(oPage.getCurrentPage() == nLast-1, '이전 페이지로 이동');	
});

module("PageNavigation Info", {
	setup: function() {
		oPage = new jindo.m.PageNavigation(jindo.$('paging'),{
			sClassPrefix : 'page-',
			nItem : 75, //아이템 개수
			nItemPerPage : 6,
			nPage : 4,
			sInfoTemplate : '{=STARTINDEX}-{=ENDINDEX}/{=ITEMCOUT}'
		});
	},
	teardown : function() {
		oPage.destroy();
		oPage = null;
	}
} );

test("페이지이동", function() {
	oPage.movePageTo(4);
	ok(oPage.getCurrentPage() == 4, '4페이지로 이동');	
	ok(!!welPrev.visible(), '이전링크노드  show');
	ok(!welPrevOff.visible(), '이전텍스트 노드 hide');
	ok(!!welNext.visible(), '다음링크노드 show');
	ok(!welNextOff.visible(), '다음텍스트노드 show');
	equal(welInfo.text(), '19-24/75', '페이지 정보업데이트');
	
	welNext.fireEvent('click');
	ok(oPage.getCurrentPage() == 5, '다음페이지로 이동');	
	equal(welInfo.text(), '25-30/75', '페이지 정보업데이트');
	
	oPage.reset();
	ok(oPage.getCurrentPage() == 1, 'reset 함수 호출시에 1페이지로 이동');
	
});

test("ajax 통신의 querystring", function(){
	var htQuery = oPage._getQueryString(1);
	ok(htQuery.page == 1, '1페이지의 query string');
	
	htQuery = oPage._getQueryString(4);	
	ok(htQuery.page == 4, '4페이지의 query string');
	ok(htQuery.display == 6, '각 페이지는 6개의 아이템을 가진다');
});





