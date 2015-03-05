var nCnt = 0;
//var welDot, inst = null;

module("MovableCoord", {
	setup: function() {
		welDot = jindo.$Element('dot');

        inst = new jindo.m.MovableCoord([ 200, 200 ], {
            aMin : [ 0, 0 ],
            aMax : [ 300, 400 ],
            aBounce : [ 100, 100, 100, 100 ],
            aMargin : [ 0, 100, 100, 0 ],
            nDeceleration : 0.0024
        }).attach({

            'change' : function(oCustomEvent) {
                var pos = oCustomEvent.aPos;

                welDot.css({
                    transition : '0',
                    transform : 'translate(' + (pos[0]) + 'px,' + (pos[1]) + 'px)'
                });
            },

            'release' : function(oCustomEvent) {
                nCnt++;
            }

        });
	},
	teardown : function() {
	    nCnt = 0;
		/** 객체 소멸 */
	}
} );

test("setBy 함수 호출시 release 이벤트 발생여부 확인", function() {
	inst.setBy(100, 100);
	ok(nCnt== 0 , 'release 이벤트 발생하지 않음');
});

test("setTo 함수 호출시 release 이벤트 발생여부 확인", function() {
	inst.setTo(100, 100);
	ok(nCnt== 0 , 'release 이벤트 발생하지 않음');
});



