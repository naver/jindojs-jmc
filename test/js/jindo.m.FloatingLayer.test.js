/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("FloatingLayer Test", {
	setup: function() {
		/** 객체 생성 */
		oFp1 = new jindo.m.FloatingLayer("layer1",{
			nTimeout : 2000,
			nFadeDuration : 100
		});
		oFp2 = new jindo.m.FloatingLayer("layer2",{
			 sPosition : "bottom",
			 sDirection : "up",
			 nSlideDuration : 500,
			 sSlideTimingFunction : "ease-in-out",
			 nFadeInDuration : 500,
			 sFadeInTimingFunction : "ease-in-out",
			 nFadeOutDuration : 500,
			 sFadeOutTimingFunction : "ease-in-out",
			 nTimeout : -1
		});
		oFp3 = new jindo.m.FloatingLayer("layer3",{
			nTimeout : 2000,
			nFadeDuration : 100,
			bActivateOnload : false
		});
	},
	teardown : function() {
		/** 객체 소멸 */
		oFp1.destroy();
		oFp1= null;
		oFp2.destroy();
		oFp2= null;
		oFp3.destroy();
		oFp3= null;
	}
} );

test("show, timer확인 ", function() {
	oFp1.attach("show", function(we) {
		equal( we.welLayer.visible(), true, "Layer가 보여지는가?");
		oFp1.resize(nWidth + 10,nHeight + 10);
		equal(wel.height(), nHeight +10 , "차이를 제외한 height가 동일한가?");
		equal(wel.width(), nWidth + 10 , "차이를 제외한 height가 동일한가?");
	}).attach("hide", function(we) {
		equal( we.welLayer.visible(), false, "Layer가 2초 후에는 안보여지는가?");
		start();
	});
	equal(jindo.$Element(oFp1.getLayer()).visible(), true, "Layer가 보여지는가?");
	var wel = oFp1._htWElement["viewElement"],
		nHeight = wel.height(),
		nWidth = wel.width();
	oFp1.show();
	setTimeout(function() {
		equal( wel.visible(), true, "Layer가 1초후에는 보여지는가?");
	},1000);
	stop();
});

test("FloatingLayer classname 확인", function() {
    oFp1.show();
    oFp2.show();

    var sFp1Classname = jindo.$Element(oFp1.getLayer()).parent().className();
    var sFp2Classname = jindo.$Element(oFp2.getLayer()).parent().className();
    equal( sFp1Classname != sFp2Classname , true, "Layer1 의 classname 과 Layer2 의 classname 이 다르다.");

});

test("hide 클릭시처리", function() {
	oFp2.attach("show", function(we) {
		oFp2.hide();
	}).attach("hide", function(we) {
		equal( we.welLayer.visible(), false, "Layer가 보여지는가? - 안보인다");
		start();
	});
	equal(jindo.$Element(oFp2.getLayer()).visible(), true, "Layer가 보여지는가? - 보인다");
	oFp2.show();
	stop();
});

test("상위 레이어 확인", function() {
	equal(oFp2._isLayer(jindo.$("layer1")), false, "다른 레이어는 false");
	equal(oFp2._isLayer(jindo.$("layer2")), true, "같은 레이어는 true");
});

test("fade-in Layer1 확인", function() {
	var wel = oFp1._htWElement["viewElement"];
	equal( wel.visible(), false, "Layer가 보여지는가?");
	oFp1._fadeIn();
	setTimeout(function() {
		equal( wel.visible(), true, "Layer가 사라졌는가?");
		start();
	},600);
	stop();
});

test("fade-in Layer2 확인", function() {
	var wel = oFp2._htWElement["viewElement"];
	equal( wel.visible(), false, "Layer가 보여지는가?");
	oFp2._fadeIn();
	setTimeout(function() {
		equal( wel.visible(), true, "Layer가 사라졌는가?");
		start();
	},600);
	stop();
});

test("다중 레이어 class name 확인", function() {
	var wel = oFp1._htWElement["viewElement"];
	equal( (/\d/).test(wel.className()), true, "숫자가 정의되어 있는지.");
	var wel2 = oFp2._htWElement["viewElement"];
	equal( wel.className() != wel2.className(), true, "랜덤 숫자가 정의로 인해 두 레이어의 classname 이 다른지.");
});

// https://github.com/naver/jindojs-jmc/issues/4
test("add exception handling code", function() {
	oFp3.show();
	oFp3.hide();
	oFp3.resize();
	ok("deactivate 시 방어코드 여부 확인");
	oFp3.activate();

	oFp3.attach("show", function(we) {
		equal( we.welLayer.visible(), true, "Layer가 보여지는가?");
		oFp3.resize(nWidth + 10,nHeight + 10);
		equal(wel.height(), nHeight +10 , "차이를 제외한 height가 동일한가?");
		equal(wel.width(), nWidth + 10 , "차이를 제외한 height가 동일한가?");
	}).attach("hide", function(we) {
		equal( we.welLayer.visible(), false, "Layer가 2초 후에는 안보여지는가?");
		start();
	});
	equal(jindo.$Element(oFp3.getLayer()).visible(), true, "Layer가 보여지는가?");
	var wel = oFp3._htWElement["viewElement"],
		nHeight = wel.height(),
		nWidth = wel.width();
	oFp3.show();
	setTimeout(function() {
		equal( wel.visible(), true, "Layer가 1초후에는 보여지는가?");
	},1000);
	stop();
});

// https://github.com/naver/jindojs-jmc/issues/9
test("'View' Element was removed when jindo.m.FloatingLayer was deactivated", function() {
	oFp3.activate();
	ok(oFp3._htWElement["viewElement"].parent() != null, "부모에 View엘리먼트가 존재해야한다.");
	oFp3.deactivate();
	ok(oFp3._htWElement["viewElement"].parent() != null, "부모에 View엘리먼트가 존재해야한다.");
	oFp3.activate();
	ok(oFp3._htWElement["viewElement"].parent() != null, "부모에 View엘리먼트가 존재해야한다.");
});