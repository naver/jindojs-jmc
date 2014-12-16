/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
 var aAjaxData = [
    '<p>Layer1</p>',
    '<p>Layer2</p>',
    '<p>Layer3</p>',
    '<p>Layer4</p>',
    '<p>Layer5</p>',
    '<p>Layer6</p>',
    '<p>Layer7</p>'
];

module("jindo.m.CoverFlicking", {
	setup: function() {
		/** 객체 생성 */
        oFlicking1 = new jindo.m.CoverFlicking('mflick1', {
            "bUseCircular" : false,
            "nDefaultIndex" : 2
        });
		oFlicking2 = new jindo.m.CoverFlicking('mflick2', {
		    "nTotalContents" : aAjaxData.length,
		    "bUseMomentum" : true,
		    "bUseCircular" : true
		}).attach({
		    'flicking' : function(oCustomEvt){
                if(oCustomEvt.bCorrupt) {
                    // 전체 panel의 정보가 바뀔경우. 즉, nMoveCount가 1보다 클경우, 3개 panel의 모든 정보를 바꾼다.
                    this.getElement().html(aAjaxData[this.getContentIndex()]);
                    this.getNextElement().html(aAjaxData[this.getNextIndex()]);
                    this.getPrevElement().html(aAjaxData[this.getPrevIndex()]);

                } else {
                    //플리킹 효과를 통해 현재 화면을 움직였을 경우
                    if(oCustomEvt.bNext){
                        //왼쪽으로 움직였을 경우 오른쪽 panel만 업데이트
                        this.getNextElement().html(aAjaxData[this.getNextIndex()]);
                    } else {
                        //오른쪽으로 움직였을 경우 왼쪽 panel만 업데이트
                        this.getPrevElement().html(aAjaxData[this.getPrevIndex()]);
                    }

                }
    		}
		});
	},
	teardown : function() {
		/** 객체 소멸 */
        oFlicking1.destroy();
		oFlicking2.destroy();
	}
} );


test("기본설정", function() {
	stop();
	setTimeout(function(){
        // 비순환
        ok(oFlicking1.getContentIndex() == 2, 'nDefaultIndex 설정 옵션은 2번째 컨텐트');
        ok(oFlicking1.getTotalContents() == 5, "전체 플리킹 개수 ");
        ok(oFlicking1.getNextIndex() == 3, "다음 컨텐츠의 인덱스 정보 = 3 ");
        ok(oFlicking1.getPrevIndex() == 1, "이전 컨텐츠의 인덱스 정보 = 1 ");
        oFlicking1.moveTo(0,0);
        ok(oFlicking1.getContentIndex() == 0, '현재 index는 0번째 컨텐트');
        ok(oFlicking1.getPrevIndex() == 0, "이전 컨텐츠의 인덱스 정보 = 0 ");
        ok(oFlicking1.getNextIndex() == 1, "다음 컨텐츠의 인덱스 정보 = 1 ");
        oFlicking1.moveTo(4,0);
        ok(oFlicking1.getContentIndex() == 4, '현재 index는 4번째 컨텐트');
        ok(oFlicking1.getPrevIndex() == 3, "이전 컨텐츠의 인덱스 정보 = 3 ");
        ok(oFlicking1.getNextIndex() == 4, "다음 컨텐츠의 인덱스 정보 = 4 ");

        // 순환
    	ok(oFlicking2.getContentIndex() == 0, '기본 설정 옵션은 0번째 컨텐트');
    	ok(oFlicking2.getTotalContents() == aAjaxData.length, "전체 플리킹 개수 ");
    	ok(oFlicking2.getNextIndex() == 1, "다음 컨텐츠의 인덱스 정보 = 1 ");
    	ok(oFlicking2.getPrevIndex() == 6, "이전 컨텐츠의 인덱스 정보 = 6 ");
    	ok(oFlicking2.getTotalContents() == aAjaxData.length, "전체 플리킹 개수 ");
        start();
    },500);
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/29
test('순환/비순환 moveTo()', function(){
    oFlicking2.moveTo(3, 1000);
    stop();

    setTimeout(function(){
        equal(oFlicking2.getContentIndex(), 3 ,'moveTo() 3번째 컨텐츠 이동');
        oFlicking2.moveTo(-1,0);
        equal(oFlicking2.getContentIndex(), 3 ,'moveTo() -1일 경우 이동하지 않음');
        oFlicking2.moveTo(10,0);
        equal(oFlicking2.getContentIndex(), 3 ,'moveTo() 초과일 경우 이동하지 않음');
        start();
    },1500);
});


// test('비순환 moveNext()', function(){
//     oFlicking1.moveTo(2,0);
//     oFlicking1.moveNext();
//     stop();

//     setTimeout(function(){
//         equal(oFlicking1.getContentIndex(), 3 ,'moveNext() 3번째 컨텐츠 이동');
//         oFlicking1.moveNext();
//         setTimeout(function(){
//             equal(oFlicking1.getContentIndex(), 4 ,'moveNext() 4번째 컨텐츠 이동');
//             oFlicking1.moveNext();
//             setTimeout(function(){
//                 equal(oFlicking1.getContentIndex(), 4 ,'moveNext() 4번째 컨텐츠 이동');
//               oFlicking1.moveNext();
//                 setTimeout(function(){
//                     equal(oFlicking1.getContentIndex(), 4 ,'moveNext() 4번째 컨텐츠 이동');
//                   start();
//                 },500);
//             },500);
//         },500);
//     },500);
// });

test('순환 moveNext()', function(){
    oFlicking2.moveTo(5,0);
    oFlicking2.moveNext();
	stop();

	setTimeout(function(){
		equal(oFlicking2.getContentIndex(), 6 ,'moveNext() 6번째 컨텐츠 이동');
        oFlicking2.moveNext();
        setTimeout(function(){
    		equal(oFlicking2.getContentIndex(), 0 ,'moveNext() 0번째 컨텐츠 이동');
		    oFlicking2.moveNext();
            setTimeout(function(){
                equal(oFlicking2.getContentIndex(), 1 ,'moveNext() 1번째 컨텐츠 이동');
              oFlicking2.moveNext();
                setTimeout(function(){
                    equal(oFlicking2.getContentIndex(), 2 ,'moveNext() 2번째 컨텐츠 이동');
                  start();
                },500);
            },500);
        },500);
	},500);
});

// test('비순환 movePrev()', function(){
//     oFlicking1.moveTo(3,0);
//     oFlicking1.movePrev();
//     stop();

//     setTimeout(function(){
//         equal(oFlicking1.getContentIndex(), 2 ,'movePrev() 2번째 컨텐츠 이동');
//         oFlicking1.movePrev();
//         setTimeout(function(){
//             equal(oFlicking1.getContentIndex(), 1 ,'movePrev() 1번째 컨텐츠 이동');
//             oFlicking1.movePrev();
//             setTimeout(function(){
//                 equal(oFlicking1.getContentIndex(), 0 ,'movePrev() 0번째 컨텐츠 이동');
//               oFlicking1.movePrev();
//                 setTimeout(function(){
//                     equal(oFlicking1.getContentIndex(), 0 ,'movePrev() 0번째 컨텐츠 이동');
//                   start();
//                 },500);
//             },500);
//         },500);
//     },500);
// });

test('순환 movePrev()', function(){
    oFlicking2.moveTo(2,0);
    oFlicking2.movePrev();
    stop();

    setTimeout(function(){
        equal(oFlicking2.getContentIndex(), 1 ,'movePrev() 1번째 컨텐츠 이동');
        oFlicking2.movePrev();
        setTimeout(function(){
            equal(oFlicking2.getContentIndex(), 0 ,'movePrev() 0번째 컨텐츠 이동');
            oFlicking2.movePrev();
            setTimeout(function(){
                equal(oFlicking2.getContentIndex(), 6 ,'movePrev() 6번째 컨텐츠 이동');
              oFlicking2.movePrev();
                setTimeout(function(){
                    equal(oFlicking2.getContentIndex(), 5 ,'movePrev() 5번째 컨텐츠 이동');
                  start();
                },500);
            },500);
        },500);
    },500);
});

test('isPlaying()', function(){
	oFlicking2.moveTo(1, 1000);
	ok(oFlicking2.isPlaying(), '현재 움직이고 있어요.');

	stop()
	setTimeout(function(){
		ok(!oFlicking2.isPlaying(), '움직임이 끝난 이후에는 false로 리턴');
		start();
	},2000);
});