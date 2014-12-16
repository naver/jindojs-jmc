/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("Test Template", {
	setup: function() {
		/** 객체 생성 */
		oRevealSidebarUI = new jindo.m.RevealSidebarUI().attach({
        "beforeSlide" : function(we) {
            // console.log(we.sType, we.sStatus);
        },
        "slide" : function(we) {
            // console.log(we.sType, we.sStatus);
        },
        "beforeRestore" : function(we) {
            // console.log(we.sType, we.sStatus);
        },
        "restore" : function(we) {
            // console.log(we.sType, we.sStatus);
        }
    });
	},
	teardown : function() {
		/** 객체 소멸 */
		oRevealSidebarUI.destroy();
		oRevealSidebarUI = null;
	}
} );

test("jindo.m.RevealSidebarUI 인스턴스 테스트", function() {	
	equal((oRevealSidebarUI instanceof jindo.m.RevealSidebarUI), true, "jindo.m.RevealSidebarUI 인스턴스 생성.");		
});

test("jindo.m.RevealSidebarUI 인스턴스 테스트", function() {	
	equal(oRevealSidebarUI._sStatus, "main", "이동전 중앙");
	stop();
	setTimeout(function(){
    	oRevealSidebarUI.toggleSlide();
    	setTimeout(function(we) {
    		oRevealSidebarUI.toggleSlide();
    		setTimeout(function(we) {
    			oRevealSidebarUI.toggleSlide(true);
    			setTimeout(function(we) {
    				oRevealSidebarUI.toggleSlide(true);
    				setTimeout(function(we) {
    					oRevealSidebarUI.toggleSlide(true);
    					start();
    				},300);
    			},300);
    		},300);
    	},300);
	}, 300);
});

