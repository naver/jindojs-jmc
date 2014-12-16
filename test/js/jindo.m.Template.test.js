/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("Test Template", {
	setup: function() {
		/** 객체 생성 */
	},
	teardown : function() {
		/** 객체 소멸 */
	}
} );

test("Test", function() {
	ok(true, "test ok");
});
