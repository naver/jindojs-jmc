/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("jindo.m.oLoading", {
	setup: function() {
		/** 객체 생성 */
		oLoading1 = new jindo.m.Loading(null, {
			sLoadingText : null
		});
		oLoading2 = new jindo.m.Loading('target');
	},
	teardown : function() {
		/** 객체 소멸 */
		oLoading1.destroy();
		oLoading2.destroy();
		oLoading1 = null;
		oLoading2 = null;
	}
} );

test("Element 위치확인", function() {
	equal(oLoading1._htWElement["base"].$value(), document.body, "전체로딩의 부모는 document.body이다");
	equal(oLoading2._htWElement["base"].attr("id"), "target", "부분로딩의 부모는 target 이다");
});

test("Animation 존재여부", function() {
	var elStyle = jindo.$(jindo.m.Loading.ANIMATION_STYLE);
	ok(elStyle, "애니메이션 스타일이 존재한다.");
});

test("전체 show 테스트", function() {
	ok(oLoading1._htWElement["foggy"], "기본값은 foggy가 있다");
	equal(oLoading1._htWElement["container"].visible(), false, "초기는 안보인다");
	oLoading1.show();
	equal(oLoading1._htWElement["container"].visible(), true, "show이후 보인다");
	setTimeout(function() {
		oLoading1.hide();
		equal(oLoading1._htWElement["container"].visible(), false, "hide이후 안보인다");
		start();
	},1000);
	stop();
});

test("부분 show 테스트", function() {
	ok(!oLoading2._htWElement["foggy"], "기본값은 foggy가 다");
	equal(oLoading2._htWElement["container"].visible(), false, "초기는 안보인다");
	oLoading2.show();
	equal(oLoading2._htWElement["container"].visible(), true, "show이후 보인다");
	setTimeout(function() {
		oLoading2.hide();
		equal(oLoading2._htWElement["container"].visible(), false, "hide이후 안보인다");
		start();
	},1000);
	stop();
});


