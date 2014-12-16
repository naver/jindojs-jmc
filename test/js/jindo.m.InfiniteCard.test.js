/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("InfiniteCard Test", {
	setup: function() {
		oInfinite = null;
	},
	teardown : function() {
		/** 객체 소멸 */
		// oInfinite.destroy();
		oInfinite = null;
	}
} );

test("InfiniteCard 순환 DOM 생성 테스트", function() {
	oInfinite = new jindo.m.InfiniteCard("now",{
		nExpandSize: window.innerHeight / 3,
		sClassName: "wrp_cds",
		nCardCount: 100
	});
	var welCards = jindo.$$(".wrp_cds").filter(function(v,i,a) {
		return !jindo.$Element(v).hasClass(jindo.m.InfiniteCard.FOR_SIZE_CLASS);
	});
	equal(welCards.length, 100, "nCardCount 개수와 동일하게 카드가 생성됨");
	equal(jindo.$$("." + jindo.m.InfiniteCard.FOR_SIZE_CLASS).length, 1, "사이즈 계산하는 카드가 추가로 1개 더 생성됨");
	oInfinite.repaint();
});


test("InfiniteCard view size 가 윈도우 전체가 아닌경우 처리", function() {
    jindo.$Element("now").width(300);
	oInfinite = new jindo.m.InfiniteCard("now",{
		nExpandSize: window.innerHeight / 3,
		sClassName: "wrp_cds",
		nCardCount: 100
	});

	equal(oInfinite._htSizeInfo.width, 300, "view 영역의 넓이만큼 처리되어야 한다.");
	oInfinite.repaint();
});