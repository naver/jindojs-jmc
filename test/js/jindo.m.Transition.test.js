/** 
 * Module의 setup과 teardown은 각 테스트 마다 호출됨 
 */
module("jindo.m.Transition 클래스", {
	setup : function() {
		
		oTransition = new jindo.m.Transition();
		var el = jindo.$('layer1');
		var wel = jindo.$Element(el);
		wel.width(200).height(100);
		wel.css('opacity', 1);
	},
	teardown : function() {
		// 객체 소멸 
		oTransition.destroy();
		//oTransition.clear();
		//oTransition = null;
	}
});

test('transition task check', function(){
	ok(!oTransition.isExistTask(), "transition 다음 진행 테스크 없음");
	ok(!oTransition.isPlaying(), "현재 진행중 테스크 없음");
	oTransition.start();
	ok(!oTransition.isPlaying(), "start 메소드를 호출 했지만 현재 진행중 테스크 없음");
	
});


test("stop 메소드 호출 (bAfter false)", function(){
	var el = jindo.$('layer1');
	var wel = jindo.$Element(el);	
	
	oTransition.queue(el, 500, {
		htStyle : {
			"opacity" : 0.5
		}
	});
	
	oTransition.start();
	stop();
	
	setTimeout(function(){
		oTransition.stop();
		
		equal(wel.css('opacity'), 0.5, 'stop 메소드 호출시 인자를 주지 않으면  트랜지션 이후의 상태로 stop 한다');
		start();
	},600);
});

test("stop 메소드 호출 (bAfter false)", function(){
	var el = jindo.$('layer1');
	var wel = jindo.$Element(el);
//	wel.width(200).height(100);
//	wel.css('opacity', 1);
	
	
	oTransition.queue(el, 1000, {
		htStyle : {
			"opacity" : 0.5
		}
	});
	
	oTransition.start();
	stop();
	
	setTimeout(function(){
		oTransition.stop(false);
		
		equal(wel.css('opacity'),1 , 'stop 메소드 호출시 인자를 false로 주면   트랜지션 이전의 상태로 stop 한다');
		start();
	},200);
});

test("transition queueing()", function() {
	oTransition.queue(jindo.$('layer1'), 500, {
		htStyle : {
			"width" : "100px"
		}
	});
	
	ok(oTransition.isExistTask(), "transition 이 있음");
	ok(!oTransition.isPlaying(), "start 전이므로 현재 진행중인 테스크 없음");
	
	oTransition.start();
	ok(oTransition.isPlaying(), "start 했으므로 현재 테스크는 진행중");
	
	stop();
	
	setTimeout(function(){
		var nWidth = jindo.$Element(jindo.$('layer1')).width();
		
		equal(nWidth, 100, "width가 100으로 줄었음");
		
		ok(!oTransition.isPlaying(), "테스크가 끝났음으로 false 리턴");
		ok(!oTransition.isExistTask(), "다음 테스크는 없음");		
		start();		
	},1500);	
});


test("multi task queueing", function(){
	var el = jindo.$('layer1');
	var wel = jindo.$Element(el);
	
	oTransition.queue(el, 100, {
		htStyle : {
			"width" : "100px"
		}
	});
	
	oTransition.queue(el, 100, {
		htStyle : {
			"height" : "50px"
		}
	});
	
	oTransition.queue(el, 100, {
		htStyle : {
			"opacity" : 0.5
		}
	});
	
	oTransition.start();
	
	stop();
	
	setTimeout(function(){
		ok(!oTransition.isPlaying(), "테스크가 끝났음으로 false 리턴");
		ok(!oTransition.isExistTask(), "다음 테스크는 없음");
		
		equal(wel.width(), 100, "width는 100이 되었음");
		equal(wel.height(), 50, "height는  50이 되었음");
		equal(wel.css('opacity'), 0.5, 'opacity는 0.5가 되었음');
		
		start();
		
	}, 2000);	
});



