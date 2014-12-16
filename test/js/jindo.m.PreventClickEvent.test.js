/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("jindo.m.PreventClickEvent", {
	setup: function() {
		/** 객체 생성 */
		oPcEvent1 = new jindo.m.PreventClickEvent("layer1");
		oPcEvent2 = new jindo.m.PreventClickEvent("layer1", {
			bActivateOnload : false
		});
	},
	teardown : function() {
		/** 객체 소멸 */
		oPcEvent1.destroy();
		oPcEvent1=null;
		oPcEvent2.destroy();
		oPcEvent2=null;
	}
} );

test("PreventClickEvent 생성과 소멸 확인", function() {
	equal((oPcEvent1 instanceof jindo.m.PreventClickEvent), true, "jindo.m.PreventClickEvent 인스턴스 생성.");
});

test("Activate 테스트", function() {
	equal(typeof oPcEvent1._htEvent, "object", "Object 이다");
	equal(typeof oPcEvent2._htEvent, "undefined", "undefined 이다");
});

