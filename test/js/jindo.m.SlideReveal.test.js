/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */

module("jindo.m.SlideReveal", {
	setup: function() {

		/** 객체 생성 */
		oSlideReveal = new jindo.m.SlideReveal({
	            "sClassPrefix" : "reveal-",
                "nDuration" : 300,
                "sDirection" : "down"
		});
        
        oSlideReveal2 = new jindo.m.SlideReveal({
                "sClassPrefix" : "reveal2-",
                "nMargin" : 60,
                "nDuration" : 300,
                "sDirection" : "left"
        }).attach({
            "beforeShow" : function(){
                 jindo.$Element("celeblist").show();  
            }, 
            "hide" : function(){
                 jindo.$Element("celeblist").hide();  
            }
        });
	},
	teardown : function() {
		/** 객체 소멸 */
		// oSlideReveal.destroy();
	}
} );




test("기본설정", function() {
	stop();
	setTimeout(function(){
    	ok(oSlideReveal.getVisible() == false, 'navigation 은 현재 보여지지 않는다.');
    	start();
	    // oSlideReveal
	    // console.log(oFlicking.getPrevIndex() );
    	// ok(oFlicking.getContentIndex() == 0, '기본 설정 옵션은 0번째 컨텐트');	
    	// ok(oFlicking.getTotalContents() == aAjaxData.length, "전체 플리킹 개수 ");
    	// ok(oFlicking.getNextIndex() == 1, "다음 컨텐츠의 인덱스 정보 = 1 ");
    	// ok(oFlicking.getPrevIndex() == 6, "이전 컨텐츠의 인덱스 정보 = 6 ");
    	// ok(oFlicking.getTotalContents() == aAjaxData.length, "전체 플리킹 개수 ");t();
    },500);
});

test('toggle()', function(){
    
    oSlideReveal.toggle();
    stop();

    setTimeout(function(){      
        equal(oSlideReveal.getVisible() , true ,'toggle() 을 통해 현재 navigation 이 보인다.');     
        start();
    },800);     
});

test('hide()', function(){
    oSlideReveal.show(0);
    stop();
        // equal(oSlideReveal.getVisible() , true ,'현재 navigation 이 보인다.');     ;
    setTimeout(function(){      
        oSlideReveal.hide(0);
        setTimeout(function(){
            equal(oSlideReveal.getVisible() , false ,'hide() 를 통해 현재 navigation 이 보이지 않는다.');     
        start();
        }, 200);
    },500);     
});

test('show()', function(){
    oSlideReveal.show(0);
    stop();

    setTimeout(function(){      
        equal(oSlideReveal.getVisible() , true ,'show() 를 통해 현재 navigation 이 보인다.');
        start();     
        // equal(oSlideReveal.getVisible() , true ,'show() 를 통해 현재 navigation 이 보인다.');     
    },500);     
});

test('햄버거 메뉴 toggle()', function(){
    oSlideReveal2.toggle();
    stop();

    setTimeout(function(){
            equal(oSlideReveal2.getVisible() , true ,'toggle() 를 통해 현재 navigation 이 보인다.');
            start();     
    },500);     
});

test('햄버거 메뉴 show()', function(){
    oSlideReveal2.show();
    stop();

    setTimeout(function(){      
        equal(oSlideReveal2.getVisible() , true ,'show() 를 통해 현재 navigation 이 보인다.');
        start();     
        // equal(oSlideReveal.getVisible() , true ,'show() 를 통해 현재 navigation 이 보인다.');     
    },500);     
});

test('햄버거 메뉴 hide()', function(){
    oSlideReveal2.show(0);
    stop();

    setTimeout(function(){
        oSlideReveal2.hide();
        setTimeout(function(){
            
            equal(oSlideReveal2.getVisible() , false ,'hide() 를 통해 현재 navigation 이 보이지 않는다.');
            start();     
        }, 400);      
    },500);     
});

