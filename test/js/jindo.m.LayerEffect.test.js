/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */

window.nDuration = null;

module("LayerEffect Test", {
	setup: function() {
		/** 객체 생성 */
		wel.offset();
		wel.offset(0,0);
		oLayerEffect = new jindo.m.LayerEffect();
		oLayerEffect.attach({
			'afterEffect' : function(oCustomEvt){
				window.nDuration = oCustomEvt.nDuration;
			}
		});
		
		
		
	},
	teardown : function() {
		/** 객체 소멸 */
		oLayerEffect.destroy();
		oLayerEffect = null; 
		//initPosition();
	}
} );


var wel = jindo.$Element('layer1');
var welBase = jindo.$Element('wrapper');
var htBaseOffset = welBase.offset();
var nH = wel.height();
var nW = wel.width();
var nBaseH = welBase.height();
var nBaseW = welBase.width();

/*
test('_getCssRotate', function(){
	var htTemp = oLayerEffect._getCssRotate('');
	
	ok(htTemp.X == 0,'cssrotate가 설정되어 있지 않을 경우 ');
	ok(htTemp.Y == 0,'cssrotate가 설정되어 있지 않을 경우 ');
	
	var htTemp = oLayerEffect._getCssRotate('rotateX(0deg)');
	ok(htTemp.X == 0,'x만  설정되어 있지 않을 경우 ');
	ok(htTemp.Y == 0,'x만  설정되어 있지 않을 경우 ');
	
	var htTemp = oLayerEffect._getCssRotate('rotateX(90deg)');
	ok(htTemp.X == 90,'x만  설정되어 있지 않을 경우 ');
	ok(htTemp.Y == 0,'x만  설정되어 있지 않을 경우 ');
	
	var htTemp = oLayerEffect._getCssRotate('rotateX(-180deg)');
	ok(htTemp.X == -180,'x만  설정되어 있지 않을 경우 ');
	ok(htTemp.Y == 0,'x만  설정되어 있지 않을 경우 ');
	
	var htTemp = oLayerEffect._getCssRotate('rotateX(540deg)');
	ok(htTemp.X == 540,'x만  설정되어 있지 않을 경우 ');
	ok(htTemp.Y == 0,'x만  설정되어 있지 않을 경우 ');
	
	
	var htTemp = oLayerEffect._getCssRotate('rotateY(0deg)');
	ok(htTemp.X == 0,'y만  설정되어 있지 않을 경우 ');
	ok(htTemp.Y == 0,'y만  설정되어 있지 않을 경우 ');
	
	var htTemp = oLayerEffect._getCssRotate('rotateY(90deg)');
	ok(htTemp.Y == 90,'y만  설정되어 있지 않을 경우 ');
	ok(htTemp.X == 0,'y만  설정되어 있지 않을 경우 ');
	
	var htTemp = oLayerEffect._getCssRotate('rotateY(-180deg)');
	ok(htTemp.Y == -180,'y만  설정되어 있지 않을 경우 ');
	ok(htTemp.X == 0,'y만  설정되어 있지 않을 경우 ');
	
	var htTemp = oLayerEffect._getCssRotate('rotateY(540deg)');
	ok(htTemp.Y== 540,'y만  설정되어 있지 않을 경우 ');
	ok(htTemp.X == 0,'y만  설정되어 있지 않을 경우 ');
	
	
	var htTemp = oLayerEffect._getCssRotate('rotateY(0deg)rotateX(0deg)');
	ok(htTemp.Y== 0,'x, y 설정되어 있지 않을 경우 ');
	ok(htTemp.X == 0,'x, y 설정되어 있지 않을 경우 ');
	
	var htTemp = oLayerEffect._getCssRotate('rotateY(90deg)rotateX(0deg)');
	ok(htTemp.Y== 90,'x, y 설정되어 있지 않을 경우 ');
	ok(htTemp.X == 0,'x, y 설정되어 있지 않을 경우 ');
	
	var htTemp = oLayerEffect._getCssRotate('rotateY(180deg)rotateX(-90deg)');
	ok(htTemp.Y== 180,'x, y 설정되어 있지 않을 경우 ');
	ok(htTemp.X == -90,'x, y 설정되어 있지 않을 경우 ');
	
	var htTemp = oLayerEffect._getCssRotate('rotateY(-360deg)rotateX(540deg)');
	ok(htTemp.Y == 0,'x, y 설정되어 있지 않을 경우 ');
	ok(htTemp.X == 540,'x, y 설정되어 있지 않을 경우 ');
	
});
*/

test('fadeIn', function(){
	oLayerEffect.fade(jindo.$('layer1'), "in", {nDuration : 100});
	
	stop();
	setTimeout(function(){
		ok(wel.opacity() == 1, 'opacity 1');
		ok(getDuration() == 100, 'Duration 설정');
		start();
	}, 500);		
	
});

test('fadeOut', function(){
	oLayerEffect.fade(jindo.$('layer1'), "out", {nDuration : 0});
	
	stop();
	setTimeout(function(){
		equal(wel.opacity(),  1, 'opacity');
		ok(getDuration() == 0, 'Duration 설정');
		start();
		
		oLayerEffect.fade(jindo.$('layer1'), "in", {nDuration : 0});
	}, 500);	
	
	
});

test('popOut', function(){
	oLayerEffect.pop(jindo.$('layer1'), "out", { nDuration : 100});

	stop();
	setTimeout(function(){
		//ok(!wel.visible(), 'popout 이후에 visible false');
		ok(getDuration() == 100, 'Duration 설정');
		start();
	},500);	
});

test('popIn', function(){
	oLayerEffect.pop(jindo.$('layer1'), "in", {nDuration : 100});
	
	stop();
	setTimeout(function(){
		//alert(getScale());
		equal(parseInt(getScale(),10) , 1, 'scale 설정 1');
		
		//ok(getDuration() == 100, 'Duration 설정');
		start();
	},500);	
});


test("slideUp", function(){

	//wel.offset(0,0);
	var htElOffset = wel.offset();
	var nDuration = 100;
	oLayerEffect.slide(jindo.$('layer1'), "up", {nDuration : nDuration, nDistance : 100});	
	stop();
	
	setTimeout(function(){
		//var htOffset = getCssOffset();
		var htOffset = wel.offset();
		//equal(htOffset.top , nH*-1, 'top Position');
		equal(htOffset.top, htElOffset.top - nH, 'top position');
		
		//equal(htOffset.left , 0, 'left Position');
		equal(htOffset.left, htElOffset.left, 'left position');
		//console.log(window.nDuration);
		equal(getDuration() , nDuration, 'duration 설정');
		start();	
		
	}, 1000);
});

test('slideRight', function(){
	//wel.offset(0,0);
	//var htCurrent = getCssOffset();	
	var htCurrent = wel.offset();
	//alert(htCurrent.left);
	var nDuration = 100;
	
	oLayerEffect.slide(jindo.$('layer1'), "right");
	stop();
	
	setTimeout(function(){
		var htOffset = getCssOffset();
		//console.log(htCurrent,htOffset);
		//equal(htOffset.top ,htCurrent.top,'top Position');
		equal(wel.offset().top ,htCurrent.top,'top Position');
		
		//equal(htOffset.left ,htCurrent.left + nW ,'left Position');		
		equal(wel.offset().left ,htCurrent.left + nW ,'left Position');
		start();
		
	}, 1000);
	
});

test('slideDown', function(){
	//wel.offset(0,0);
	var htCurrent = getCssOffset();
	var nDuration = 100;
	oLayerEffect.slide(jindo.$('layer1'), "down");
	stop();
		
	setTimeout(function(){
		var htOffset = getCssOffset();
		equal(htOffset.top ,htCurrent.top + nH,'top Position');
		equal(htOffset.left ,htCurrent.left ,'left Position');
		equal(getDuration(), 250, '디폴트 duration');
		
		start();
		
	}, 1000);
});


test('slideLeft', function(){
	//wel.offset(0,0);
	var htCurrent = getCssOffset();
	var nDuration = 100;
	oLayerEffect.slide(jindo.$('layer1'), "left");
	stop();
		
	setTimeout(function(){
		var htOffset = getCssOffset();
		
		equal(htOffset.top , htCurrent.top ,'top Position');
		equal(htOffset.left ,htCurrent.left + (nW*-1),'left Position');		
		start();
		
	}, 1000);
});


test('slideRight(파라미터 nDistance)', function(){
	var htCurrent = getCssOffset();
	oLayerEffect.slide(jindo.$('layer1'), "left", {nDistance : 100});
	stop();
	
	setTimeout(function(){
		var htOffset = getCssOffset();
		
		equal(htOffset.top , htCurrent.top ,'top Position');
		equal(htOffset.left ,htCurrent.left -100,'left Position');		
		start();
	}, 1000);
});



test('expand/contract Up', function(){
	//oLayerEffect.slide({sDirection : 'down', elBaseLayer: welBase.$value(), nDuration: 0});
	 //wel.css()
	
	oLayerEffect.expand(jindo.$('layer1'), "up", {nDistance : nH});
	
	stop();
	
	setTimeout(function(){
		equal(wel.height(), nH, 'expand height');			
		
    	oLayerEffect.contract(jindo.$('layer1'), "up", {nDuration : 0});
			
		setTimeout(function(){
		equal(wel.height(), 0, 'contract height');
			equal(getDuration(), 0, 'duration time');
			equal(parseInt(wel.css('marginTop'),10), 0, 'margin-top');
			start();			
		}, 100);
		
	}, 500);	
	
});

test('expand/contract down', function(){
	oLayerEffect.expand(jindo.$('layer1'), "down" , {nDistance : nH});
	
	stop();
	setTimeout(function(){
		equal(wel.height(), nH, 'expand hegiht');
    	oLayerEffect.contract(jindo.$('layer1'), "down", {nDuration : 0});
		
		setTimeout(function(){
    		equal(wel.height(), 0, 'contract hegiht');
			
			start();			
		}, 100);		
		
	}, 500);
});

test('expand/contract left', function(){
	oLayerEffect.expand(jindo.$('layer1'), "left", { nDistance : nW, nDuration : 100});
	
	stop();
	setTimeout(function(){
		equal(wel.width(), nW, 'expand width');
		equal(getDuration(), 100, 'duration');		
    	oLayerEffect.contract(jindo.$('layer1'), "left", { nDuration: 0});
		
		setTimeout(function(){
    		equal(wel.width(), 0, 'contract width');
			start();
			
		}, 100);
		
	}, 500);
	
});

test('expand/contract right', function(){
	oLayerEffect.expand(jindo.$('layer1'), "right", {nDistance : nW,  nDuration : 100});
	stop();
	
	setTimeout(function(){
		equal(wel.width(), nW, 'expand width');
    	oLayerEffect.contract(jindo.$('layer1'), "right", {nDuration: 0});	
		
		setTimeout(function(){
    		equal(wel.width(), 0, 'contract width');
			start();
			
		}, 100);
		
	}, 500);
});





function initPosition(){
	wel.offset(0,0);
}

function getScale(){
	var s = wel.css('-webkit-transform');
	var a = s.match(/scale[XY]?(.*\s)/);
	if(a && a.length > 1){
		return a[1].replace(/\(/,'').replace(/\)/,'');
	}
	
	return null;
};

function getCssOffset(){
//	var s = wel.css('-webkit-transform');	
//	s = s.match(/\(.*\)/)[0].replace("(",'').replace(")",'');
//	var a = s.split(",");
	
	var nTop = isNaN(wel.css('top').replace('px','')*1)? 0 : wel.css('top').replace('px','')*1;
	var nLeft = isNaN(wel.css('left').replace('px','')*1)? 0 : wel.css('left').replace('px','')*1;
	
	return {
		top : nTop,
		left: nLeft
	}
	
	
}


function getOffset(){
	return wel.offset();
}

function getDuration(){
	
	return window.nDuration;
}

function getEaseing(){
	var s = wel.css('-webkit-transition-timing-function');
		
	return s.replace(/ /gi, "");
}

