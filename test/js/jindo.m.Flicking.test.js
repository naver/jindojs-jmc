/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("jindo.m.Flicking", {
	setup: function() {
		/** 객체 생성 */
		oSlideFlicking = new jindo.m.Flicking('mflick1', {
			sAnimation : "slide"
		});
		oCoverFlicking = new jindo.m.Flicking('mflick2', {
			sAnimation : "cover"
		});
		oFlipFlicking = new jindo.m.Flicking('mflick3', {
			sAnimation : "flip"
		});
		oAlignFlipFlicking = new jindo.m.Flicking('mflick4', {
			sAnimation : "alignFlip",
			nDuration : 1000
		});
	},
	teardown : function() {
		/** 객체 소멸 */
		oSlideFlicking.destroy();
		oCoverFlicking.destroy();
		oFlipFlicking.destroy();
		oAlignFlipFlicking.destroy();
	}
} );


test("기본설정", function() {
	ok(oSlideFlicking.getContentIndex() == 0, '기본 설정 옵션은 0번째 컨텐트');
	ok(oCoverFlicking.getContentIndex() == 0, '기본 설정 옵션은 0번째 컨텐트');
	ok(oFlipFlicking.getContentIndex() == 0, '기본 설정 옵션은 0번째 컨텐트');
	ok(oAlignFlipFlicking.getContentIndex() == 0, '기본 설정 옵션은 0번째 컨텐트');
	ok(oSlideFlicking.getTotalContents() == 3, "전체 플리킹 개수 ");
	ok(oCoverFlicking.getTotalContents() == 3, "전체 플리킹 개수 ");
	ok(oFlipFlicking.getTotalContents() == 3, "전체 플리킹 개수 ");
	ok(oAlignFlipFlicking.getTotalContents() == 3, "전체 플리킹 개수 ");
});


test('slide moveNext()', function(){
	var nNext = oSlideFlicking.getNextIndex();
	oSlideFlicking.moveNext(0);

	stop();
	setTimeout(function(){
		equal(oSlideFlicking.getContentIndex(), nNext ,'moveNext() 1번째 컨텐츠 이동');
		start();
	},100);
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/45
test('slide moveTo()', function(){
	var nNext = oSlideFlicking.getNextIndex();
	oSlideFlicking.moveTo(0, 0);
	oSlideFlicking.moveTo(nNext, 100);
	stop();
	setTimeout(function(){
		equal(oSlideFlicking.getContentIndex(), nNext ,'moveNext() 1번째 컨텐츠 이동');
		start();
	},200);
});

test('cover moveNext()', function(){
	var nNext = oCoverFlicking.getNextIndex();
	oCoverFlicking.moveNext(0);
	stop();
	setTimeout(function(){
		equal(oCoverFlicking.getContentIndex(), nNext ,'moveNext() 1번째 컨텐츠 이동');
		start();
	},100);
});


// 예전 플리킹은 moveXXXX에 duration 처리가 안되어 있음
test('flip moveNext()', function(){
	var nNext = oFlipFlicking.getNextIndex();
	oFlipFlicking.moveNext(0);
	stop();
	setTimeout(function(){
		equal(oFlipFlicking.getContentIndex(), nNext ,'moveNext() 1번째 컨텐츠 이동');
		start();
	},1500);
});

// 예전 플리킹은 moveXXXX에 duration 처리가 안되어 있음
test('alignflip moveNext()', function(){
	var nNext = oAlignFlipFlicking.getNextIndex();
	oAlignFlipFlicking.moveNext(0);
	stop();
	setTimeout(function(){
		equal(oAlignFlipFlicking.getContentIndex(), nNext ,'moveNext() 1번째 컨텐츠 이동');
		start();
	},1500);
});

// test('slide isAnimating()', function(){
// 	oSlideFlicking.moveNext(1000);
// 	ok(oSlideFlicking.isAnimating(), '현재 움직이고 있어요.');
// 	stop();
// 	setTimeout(function(){
// 		ok(!oSlideFlicking.isAnimating(), '움직임이 끝난 이후에는 false로 리턴');
// 		start();
// 	},1700);
// });

// test('cover isAnimating()', function(){
// 	oCoverFlicking.moveNext(1000);
// 	ok(oCoverFlicking.isAnimating(), '현재 움직이고 있어요.');
// 	stop();
// 	setTimeout(function(){
// 		ok(!oCoverFlicking.isAnimating(), '움직임이 끝난 이후에는 false로 리턴');
// 		start();
// 	},1700);
// });

// test('flip isAnimating()', function(){
// 	oFlipFlicking.moveNext(500);
// 	ok(oFlipFlicking.isAnimating(), '현재 움직이고 있어요.');
// 	stop();
// 	setTimeout(function(){
// 		ok(!oFlipFlicking.isAnimating(), '움직임이 끝난 이후에는 false로 리턴');
// 		start();
// 	},2000);
// });

// test('alignflip isAnimating()', function(){
// 	oAlignFlipFlicking.moveNext(500);
// 	ok(oAlignFlipFlicking.isAnimating(), '현재 움직이고 있어요.');
// 	stop();
// 	setTimeout(function(){
// 		ok(!oAlignFlipFlicking.isAnimating(), '움직임이 끝난 이후에는 false로 리턴');
// 		start();
// 	},2000);
// });

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/4
test('deactivate/activate 테스트', function(){
	equal(oSlideFlicking.isActivating(), true, "activate");
	equal(oSlideFlicking._oFlickingImpl.isActivating(), true, "activate");
	oSlideFlicking.deactivate();
	equal(oSlideFlicking.isActivating(), false, "deactivate");
	equal(oSlideFlicking._oFlickingImpl.isActivating(), false, "deactivate");
	oSlideFlicking.activate();
	equal(oSlideFlicking.isActivating(), true, "activate");
	equal(oSlideFlicking._oFlickingImpl.isActivating(), true, "activate");

	equal(oCoverFlicking.isActivating(), true, "activate");
	equal(oCoverFlicking._oFlickingImpl.isActivating(), true, "activate");
	oCoverFlicking.deactivate();
	equal(oCoverFlicking.isActivating(), false, "deactivate");
	equal(oCoverFlicking._oFlickingImpl.isActivating(), false, "deactivate");
	oCoverFlicking.activate();
	equal(oCoverFlicking.isActivating(), true, "activate");
	equal(oCoverFlicking._oFlickingImpl.isActivating(), true, "activate");

	equal(oFlipFlicking.isActivating(), true, "activate");
	equal(oFlipFlicking._oFlickingImpl.isActivating(), true, "activate");
	oFlipFlicking.deactivate();
	equal(oFlipFlicking.isActivating(), false, "deactivate");
	equal(oFlipFlicking._oFlickingImpl.isActivating(), false, "deactivate");
	oFlipFlicking.activate();
	equal(oFlipFlicking.isActivating(), true, "activate");
	equal(oFlipFlicking._oFlickingImpl.isActivating(), true, "activate");

	equal(oAlignFlipFlicking.isActivating(), true, "activate");
	equal(oAlignFlipFlicking._oFlickingImpl.isActivating(), true, "activate");
	oAlignFlipFlicking.deactivate();
	equal(oAlignFlipFlicking.isActivating(), false, "deactivate");
	equal(oAlignFlipFlicking._oFlickingImpl.isActivating(), false, "deactivate");
	oAlignFlipFlicking.activate();
	equal(oAlignFlipFlicking.isActivating(), true, "activate");
	equal(oAlignFlipFlicking._oFlickingImpl.isActivating(), true, "activate");
});