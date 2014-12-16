/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */

module("jindo.m.CubeReveal", {
	setup: function() {

		/** 객체 생성 */
		oCubeReveal = new jindo.m.CubeReveal({
	            "sClassPrefix" : "reveal-",
                "nDuration" : 300,
                "sDirection" : "down"
		});
        
        oCubeReveal2 = new jindo.m.CubeReveal({
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
		oCubeReveal.destroy();
		oCubeReveal2.destroy();
	}
} );




test("기본설정", function() {
	stop();
	setTimeout(function(){
    	ok(oCubeReveal.getVisible() == false, 'navigation 은 현재 보여지지 않는다.');
    	start();
	    // oCubeReveal
	    // console.log(oFlicking.getPrevIndex() );
    	// ok(oFlicking.getContentIndex() == 0, '기본 설정 옵션은 0번째 컨텐트');	
    	// ok(oFlicking.getTotalContents() == aAjaxData.length, "전체 플리킹 개수 ");
    	// ok(oFlicking.getNextIndex() == 1, "다음 컨텐츠의 인덱스 정보 = 1 ");
    	// ok(oFlicking.getPrevIndex() == 6, "이전 컨텐츠의 인덱스 정보 = 6 ");
    	// ok(oFlicking.getTotalContents() == aAjaxData.length, "전체 플리킹 개수 ");t();
    },1000);
});


// 
test('hide()', function(){
    oCubeReveal.show(0);
    stop();
        // equal(oCubeReveal.getVisible() , true ,'현재 navigation 이 보인다.');     ;
    setTimeout(function(){
            oCubeReveal.hide(1);
            setTimeout(function(){
                equal(oCubeReveal.getVisible() , false ,'hide() 를 통해 현재 navigation 이 보이지 않는다.');     
                start();
            }, 500);
    }, 2000);
});
// 
test('show()', function(){
    oCubeReveal.show(0);
    stop();

    setTimeout(function(){      
        equal(oCubeReveal.getVisible() , true ,'show() 를 통해 현재 navigation 이 보인다.');
        start();     
        // equal(oCubeReveal.getVisible() , true ,'show() 를 통해 현재 navigation 이 보인다.');     
    },1000);     
});

test('toggle()', function(){
    oCubeReveal.show(0);
    
    stop();

    setTimeout(function(){
        oCubeReveal.toggle();
        setTimeout(function(){
            
            equal(oCubeReveal.getVisible() , false ,'toggle() 을 통해 현재 navigation 이 보이지 않는다.');     
            start();
        }, 2000);      
    },1000);     
});


test('햄버거 메뉴 show()', function(){
    oCubeReveal2.show(10);
    stop();

    setTimeout(function(){      
        equal(oCubeReveal2.getVisible() , true ,'show() 를 통해 현재 navigation 이 보인다.');
        start();     
        // equal(oCubeReveal.getVisible() , true ,'show() 를 통해 현재 navigation 이 보인다.');     
    },1000);     
});



test('햄버거 메뉴 hide()', function(){
    oCubeReveal2.show(10);
    stop();

    setTimeout(function(){
        oCubeReveal2.hide(10);
        setTimeout(function(){
            
            equal(oCubeReveal2.getVisible() , false ,'hide() 를 통해 현재 navigation 이 보이지 않는다.');
            start();     
        }, 1000);      
    },1000);     
});
