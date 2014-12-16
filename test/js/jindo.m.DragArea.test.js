/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
var isMobile = (jindo.m.getDeviceInfo().android || jindo.m.getDeviceInfo().iphone || jindo.m.getDeviceInfo().ipad);
var isIos = (jindo.m.getDeviceInfo().iphone || jindo.m.getDeviceInfo().ipad);

module("jindo.m.DragArea Template", {
	setup: function() {
		/** 객체 생성 */
		oDrag = new jindo.m.DragArea(jindo.$("parent"));
		welBase = jindo.$Element(jindo.$("parent"));
	},
	teardown : function() {
		/** 객체 소멸 */
		oDrag.destroy();
	}
} );

test("_initVar()", function() {
	equal(welBase.$value(), oDrag._htWElement.base.$value(), "base 엘리먼트");
	ok(oDrag._oTouch != null, 'touch이벤트');
	if(isIos){
		equal(oDrag._aAnchor.length, 1, 'ios 전용  a링크 array');
	}
});

test("touchStart" , function() {
    var welDragging1 = jindo.$Element("dragging1");
    var htBeforeOffset = welDragging1.offset();
    welDragging1.css("position", "absolute");
    welDragging1.offset(100, 50);
    // welDragging1.fireEvent("touchStart");
    var htAfterOffset = welDragging1.offset();
    equal(htAfterOffset.top, 100, 'offset 값이 100이다.');
});

test('_onReCalculateOffset()', function(){
	var htInfo = {
		top: welBase.offset().top,
		left : welBase.offset().left,
		bottom : welBase.offset().top + welBase.height(),
		right : welBase.offset().left + welBase.width()
	}


	var nX = htInfo.left-50;
	var nY = htInfo.bottom +50 ;

	var welDrag = jindo.$Element(jindo.$('dragging1'));
	var nOffset = oDrag._onReCalculateOffset(jindo.$('dragging1'), nX, nY );

	equal(htInfo.left, nOffset.nX, '기준레이어를 벗어 날 수 없음 nX');
	equal(htInfo.bottom-welDrag.height(), nOffset.nY, '기준레이어를 벗어 날 수 없음 nY');

	nX = htInfo.left;
	nY = htInfo.bottom - welDrag.height() -10;

	nOffset = oDrag._onReCalculateOffset(jindo.$('dragging1'), nX, nY );

	equal(nY, nOffset.nY, '기준 레이어 안에 있다면 그 값을 리턴 nY');
	equal(nX, nOffset.nX, '기준 레이어 안에 있다면 그 값을 리턴 nX');

});


test('_getDragElement()', function(){
	var elNonDrag = jindo.$('noDrag');
	var htElement = oDrag._getDragElement(elNonDrag);

	ok(htElement.elDrag ==  null, '드래깅안되는 엘리먼트');
	ok(htElement.elHandle ==  null, '드래깅안되는 엘리먼트');

	var elDrag1 = jindo.$('dragging1');

	var htElement = oDrag._getDragElement(elDrag1);
	equal(htElement.elDrag, elDrag1, '드래깅 엘리먼트');
	equal(htElement.elHandle, null, '핸들은 없음');

	var elDrag2 = jindo.$('dragging2');
	var elHandle = jindo.$$.getSingle('.drag-handle', elDrag2);
	var htElement = oDrag._getDragElement(elDrag2);
	equal(htElement.elHandle, elHandle, '핸들이 있는 엘리먼트');

	var elA = jindo.$$.getSingle('a', elDrag1);
	var htElement = oDrag._getDragElement(elA);
	equal(htElement.elDrag, elDrag1, '드래깅 엘리먼트');
	equal(htElement.elHandle, null, '핸들은 없음');

});
