/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("jindo.m.PreviewFlicking", {
    setup: function() {
        /** 객체 생성 */
        oPreviewFlicking = new jindo.m.PreviewFlicking('previewFlick');
    },
    teardown : function() {
        /** 객체 소멸 */
        oPreviewFlicking.destroy();
    }
} );




test("기본설정", function() {
    ok(oPreviewFlicking.getContentIndex() == 0, '기본 설정 옵션은 0번째 컨텐트');   
    ok(oPreviewFlicking.getTotalContents() == 5, "전체 플리킹 개수 ");
    stop();
    setTimeout(function(){
        start();
    }, 300);
});


test('moveTo()', function(){
    oPreviewFlicking.moveTo(2, 0);
    stop();
    
    setTimeout(function(){
        equal(oPreviewFlicking.getContentIndex() , 2,'moveTo() 2번째 컨텐츠 이동');
        start();
    }, 500);
});


test('getContentIndex()', function(){
    oPreviewFlicking.moveTo(3, 0);
    stop();
    
    setTimeout(function(){
        equal(oPreviewFlicking.getContentIndex(), 3,'getContentIndex() 3번째 컨텐츠');
        start();
    }, 500);
});

test('moveNext()', function(){
    // var nNext = oPreviewFlicking.getNextIndex();
    // oPreviewFlicking.moveTo(1, 0);
    oPreviewFlicking.moveNext();
    stop();
    
    setTimeout(function(){      
        equal(oPreviewFlicking.getContentIndex(), 1 ,'moveNext() 1번째 컨텐츠 이동');      
        start();
    },500);     
});

test('movePrev()', function(){
    oPreviewFlicking.moveTo(3, 0);
    stop();
    setTimeout(function(){
        oPreviewFlicking.movePrev(0);
    }, 300);
    
    setTimeout(function(){
        equal(oPreviewFlicking.getContentIndex(), 2,'movePrev() 2번째 컨텐츠 이동');
        start();
    },500); 

});




