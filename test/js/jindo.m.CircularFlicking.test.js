/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("jindo.m.CircularFlicking", {
	setup: function() {
		/** 객체 생성 */
		oCircularFlicking = new jindo.m.CircularFlicking('mflick',{
			nTotalContents: 10
		});
	},
	teardown : function() {
		/** 객체 소멸 */
		oCircularFlicking.destroy();
	}
} );

test("getContentIndex", function() {
	ok(oCircularFlicking.getPanelIndex()== 0, '현재 0번째 컨텐츠');	
	ok(oCircularFlicking.getContentIndex()== 0, '현재 0번째 아이템 인덱스');	
});

test('setContentIndex()', function(){
	ok(oCircularFlicking.getPanelIndex()== 0, '현재 0번째 컨텐츠');
	
	ok(oCircularFlicking.getContentIndex()== 0, '현재 0번째 아이템 인덱스');
	
	var n = 7;
	oCircularFlicking.setContentIndex(n);
	
	equal(oCircularFlicking.getPanelIndex(), n%3, '7번째 아이템 이동시 콘텐츠 영역의 인덱스');
	equal(oCircularFlicking.getContentIndex(), n, '7번째 아이템 이동시  아이템 인덱스');
	
});
