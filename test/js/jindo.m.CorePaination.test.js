/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("CorePagination Test", {
	setup: function() {
		oPaination = new jindo.m.CorePagination({
			nItem : 123,
			nItemPerPage : 7,
			nPage : 1
		});
	},
	teardown : function() {
		/** 객체 소멸 */
	}
} );

test("getItemCount", function() {
	equal(oPaination.getItemCount(), 123, "getter");
	oPaination.setItemCount(200);
	ok(oPaination.getItemCount()== 200, "setter");
	
});

test("getItemPerPage", function() {
	ok(oPaination.getItemPerPage()== 7, "getter");
	oPaination.setItemPerPage(11);
	ok(oPaination.getItemPerPage()== 11, "setter");
	
});

test("getCurrentPage", function() {
	ok(oPaination.getCurrentPage()== 1, "getter");
	oPaination.movePageTo(3);
	ok(oPaination.getCurrentPage()== 3, "setter");	
});

test('nextPageTo', function(){
	oPaination.movePageTo(6);
	oPaination.nextPageTo();
	ok(oPaination.getCurrentPage()== 7, "nextPage");
	var nMax = oPaination.getTotalPages();
	oPaination.movePageTo(nMax);
	oPaination.nextPageTo();
	ok(oPaination.getCurrentPage()== nMax, "마지막페이지에서 호출");
	
});

test('previousPageTo', function(){
	oPaination.movePageTo(3);
	oPaination.previousPageTo();
	ok(oPaination.getCurrentPage()== 2, "nextPage");
	oPaination.movePageTo(1);
	oPaination.previousPageTo();
	ok(oPaination.getCurrentPage()== 1, "1페이지에서 메소드 호출");
});


test('hasNextPage', function(){
	ok(oPaination.hasNextPage(), '다음페이지 있음');
	var nMax = oPaination.getTotalPages();
	oPaination.movePageTo(nMax);
	ok(!oPaination.hasNextPage(), '마지막페이지 이므로 다음페이지 없음');	
});

test('hasNextPage', function(){
	oPaination.movePageTo(4);
	ok(oPaination.hasPreviousPage(), '이전페이지 있음');
	oPaination.movePageTo(1);
	ok(!oPaination.hasPreviousPage(), '1페이지 이므로 이전페이지 없음');	
});

test('getTotalPages', function(){
	var nTotal = oPaination.getTotalPages();
	ok(nTotal == 18, '페이지 개수');	
});

test('getPageItemIndex', function(){
	var htIndex = oPaination.getPageItemIndex(4);
	ok(htIndex.nStart == 21, '4번째 페이지의 시작 인덱스');
	ok(htIndex.nEnd == 27, '4번째 페이지의 마지막 인덱스');
});

test('getPageOfItem', function(){
	ok(oPaination.getPageOfItem(25) == 4, '25번째 아이템은 4페이지');
	ok(oPaination.getPageOfItem(1) == 1, '1번째 아이템은 1페이지');
});