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
    
module("jindo.m.CubeFlicking", {
	setup: function() {

		/** 객체 생성 */
		oFlicking = new jindo.m.CubeFlicking('mflick', {
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
		oFlicking.destroy();
	}
} );




test("기본설정", function() {
	stop();
	setTimeout(function(){      
	    // console.log(oFlicking.getPrevIndex() );
    	ok(oFlicking.getContentIndex() == 0, '기본 설정 옵션은 0번째 컨텐트');	
    	ok(oFlicking.getTotalContents() == aAjaxData.length, "전체 플리킹 개수 ");
    	ok(oFlicking.getNextIndex() == 1, "다음 컨텐츠의 인덱스 정보 = 1 ");
    	ok(oFlicking.getPrevIndex() == 6, "이전 컨텐츠의 인덱스 정보 = 6 ");
    	ok(oFlicking.getTotalContents() == aAjaxData.length, "전체 플리킹 개수 ");
        start();
    },500);
});


test('moveTo()', function(){
    
    oFlicking.moveTo(3, 0);
    stop();

    setTimeout(function(){      
        equal(oFlicking.getContentIndex(), 3 ,'moveNext() 3번째 컨텐츠 이동');     
        start();
    },500);     
});

test('moveNext()', function(){
    
	var nNext = oFlicking.getNextIndex();
	oFlicking.moveNext();
	stop();

	setTimeout(function(){		
		equal(oFlicking.getContentIndex(), 1 ,'moveNext() 1번째 컨텐츠 이동');		
		start();
	},500);		
});
test('순환 플리킹 테스트 moveNext()', function(){
    // var nNext = oFlicking.getNextIndex();
    oFlicking.moveTo(4, 0);
        equal(oFlicking.getContentIndex(), 4 ,'4번째 컨텐츠 이동');     
    stop();

    setTimeout(function(){
        oFlicking.moveNext(0);
        equal(oFlicking.getContentIndex(), 5 ,'moveNext() 5번째 컨텐츠 이동');     
        start();
    },500);     
});
test('순환 플리킹 마지막 영역에서 moveNext()', function(){
    // var nNext = oFlicking.getNextIndex();
    oFlicking.moveTo(6, 0);
        equal(oFlicking.getContentIndex(), 6 ,'6번째 컨텐츠 이동');     
    // oFlicking.refresh();
    stop();

    setTimeout(function(){
        oFlicking.moveNext(0);
        equal(oFlicking.getContentIndex(), 0 ,'moveNext() 0번째 컨텐츠 이동');     
        start();
    },500);     
});

test('movePrev()', function(){
	oFlicking.moveTo(1,0);
	equal(oFlicking.getContentIndex(), 1,'1번째 컨텐츠로 이동 ');
	var nPrev = oFlicking.getPrevIndex();
	oFlicking.movePrev(0);
	stop();

	setTimeout(function(){
		equal(oFlicking.getContentIndex(), 0,'movePrev() 0번째 컨텐츠 이동');
		start();
	},500);	
});

test('마지막 영역에서 movePrev()', function(){
    // oFlicking.moveTo(0,0);
    // var nPrev = oFlicking.getPrevIndex();
    oFlicking.movePrev(0);
    stop();

    setTimeout(function(){
        equal(oFlicking.getContentIndex(), 6,'movePrev() 6번째 컨텐츠 이동');
        start();
    },500); 
});

test('isPlaying()', function(){
	oFlicking.moveTo(1, 1000);
	ok(oFlicking.isPlaying(), '현재 움직이고 있어요.');
	
	stop()
	setTimeout(function(){
		ok(!oFlicking.isPlaying(), '움직임이 끝난 이후에는 false로 리턴');
		start();
	},2000);
});

// 
// test('_getSnap()', function(){
	// var welCt = jindo.$Element(jindo.$$.getSingle('.flick-ct'));
// 	
	// var htInfo = oFlicking._getSnap(-100,0, -100,0,0,0);
// 	
// 	
	// equal(htInfo.nContentIndex, 1, '첫번째 인덱스로 계산됨');
	// equal(htInfo.sDirection, "next", "이후플리킹 됨 ");
	// //equal(htInfo.nX,(welCt.width()*-1), '첫번째 인덱스  X 좌표' );
// 	
// });

