/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("InfiniteCard Test", {
	setup: function() {
		oInfinite = new jindo.m.InfiniteCard("now",{
			nExpandSize: window.innerHeight / 3,
			sClassName: "wrp_cds",
			nCardCount: 20
		});
	},
	teardown : function() {
		/** 객체 소멸 */
		oInfinite.destroy();
		oInfinite = null;
	}
} );

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/61
// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/69
test("bUseRecyle option test", function() {
	oInfinite = new jindo.m.InfiniteCard("now",{
		nExpandSize: window.innerHeight / 3,
		sClassName: "wrp_cds",
		bUseRecycle : false
	});
	equal(jindo.$$("." + jindo.m.InfiniteCard.FOR_SIZE_CLASS).length, 1, "사이즈 계산하는 카드가 추가로 1개 더 생성됨");
	equal(oInfinite.isCached(), false, "캐시가 안되어있음");
	oInfinite.repaint();

	setTimeout(function() {
		equal(oInfinite.isCached(), true, "캐시가 되어있음");
		var welCards = jindo.$$(".wrp_cds").filter(function(v,i,a) {
			return !jindo.$Element(v).hasClass(jindo.m.InfiniteCard.FOR_SIZE_CLASS);
		});
		equal(welCards.length, 20, "nCardCount 개수와 동일하게 카드가 생성됨");
		equal(jindo.$$("." + jindo.m.InfiniteCard.FOR_SIZE_CLASS).length, 1, "사이즈 계산하는 카드가 추가로 1개 더 생성됨");
		oInfinite.repaint();
		setTimeout(function() {
			for(var i=0; i<100; i++) {
				oInfinite.append(aNow[0]);
			}
			equal(oInfinite.isCached(), false, "캐시가 안되어있음");
			oInfinite.repaint();
			setTimeout(function() {
				welCards = jindo.$$(".wrp_cds").filter(function(v,i,a) {
					return !jindo.$Element(v).hasClass(jindo.m.InfiniteCard.FOR_SIZE_CLASS);
				});
				equal(oInfinite.isCached(), true, "캐시가 되어있음");
				equal(welCards.length, 120, "nCardCount 개수와 동일하게 카드가 생성됨");
				start();
			},300);
		},300);
	},300);
	stop();
});


test("InfiniteCard 순환 DOM 생성 테스트", function() {
	var welCards = jindo.$$(".wrp_cds").filter(function(v,i,a) {
		return !jindo.$Element(v).hasClass(jindo.m.InfiniteCard.FOR_SIZE_CLASS);
	});
	equal(welCards.length, 20, "nCardCount 개수와 동일하게 카드가 생성됨");
	equal(jindo.$$("." + jindo.m.InfiniteCard.FOR_SIZE_CLASS).length, 1, "사이즈 계산하는 카드가 추가로 1개 더 생성됨");
	oInfinite.repaint();
});


test("InfiniteCard view size 가 윈도우 전체가 아닌경우 처리", function() {
   	jindo.$Element("now").width(300);
	oInfinite = new jindo.m.InfiniteCard("now",{
		nExpandSize: window.innerHeight / 3,
		sClassName: "wrp_cds",
		nCardCount: 15
	});
	equal(jindo.$$("." + jindo.m.InfiniteCard.FOR_SIZE_CLASS).length, 1, "사이즈 계산하는 카드가 추가로 1개 더 생성됨");
	equal(oInfinite._htSizeInfo.width, 300, "view 영역의 넓이만큼 처리되어야 한다.");
	oInfinite.repaint();
	jindo.$Element("now").css("width" ,"");
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/83
test("check if fire 'update' event", function() {
	oInfinite.attach("update", function(we) {
		ok("fire update event!");
		start();
	});
	equal(jindo.$$("." + jindo.m.InfiniteCard.FOR_SIZE_CLASS).length, 1, "사이즈 계산하는 카드가 추가로 1개 더 생성됨");
	oInfinite.repaint();
	setTimeout(function() {
		oInfinite.update();
	},100);
	stop();
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/62
test("control 'update' event", function() {
	oInfinite.attach("update", function(we) {
		ok("fire update event!");
		start();
	});
	equal(jindo.$$("." + jindo.m.InfiniteCard.FOR_SIZE_CLASS).length, 1, "사이즈 계산하는 카드가 추가로 1개 더 생성됨");
	oInfinite.repaint();
	setTimeout(function() {
		oInfinite.repaint({bUpdate: true});
	},100);
	stop();
});
