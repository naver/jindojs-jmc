/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("ToggleSlider Component", {
	setup: function() {
		/** 객체 생성 */
		oToggle = new jindo.m.ToggleSlider('toggleSlider1');
		
		
	},
	teardown : function() {
		/** 객체 소멸 */
		oToggle.destroy();
	}
} );

test("on/off 세팅", function() {
	oToggle.on();
	
	elOn = jindo.$('on');
	elOff = jindo.$('off');
	
	ok(oToggle.isOn() == true, '현재 상태 on');
	ok(elOn.checked, 'form element update' );
	ok(!elOff.checked, 'form element update' );
	
	oToggle.off();
	ok(oToggle.isOn() == false, '현재 상태  off');
	ok(!elOn.checked, 'form element update' );
	ok(elOff.checked, 'form element update' );
	
	oToggle.toggle();
	
	ok(oToggle.isOn(), 'toggle 이후 on');
	
	oToggle.toggle();
	ok(!oToggle.isOn(), 'toggle 이후 off');	
});



test('move', function(){
	oToggle.off();
	var elThumb = jindo.$$.getSingle('.tslider-thumb');
	
	//on일 경우 left가 50%
	var sCurrent = elThumb.style.left;
	var sAnother = (sCurrent == '50%')? '0%': '50%';
	
	var htCustomEvt = {
		nDistanceX : 10,
		oEvent : {stop: function(){}
		}	
	};

	htCustomEvt.nDistanceX = 200;
	oToggle._onMove(htCustomEvt);
	equal(elThumb.style.left , sAnother , sCurrent,htCustomEvt.nDistanceX +'오른쪽 움직임 처리');
	
	htCustomEvt.nDistanceX = -200;
	oToggle._onMove(htCustomEvt);
	equal(elThumb.style.left , sCurrent ,sCurrent,htCustomEvt.nDistanceX +'왼쪽 움직임 처리');

});

test('end 이벤트', function(){
	oToggle.on();
	
	var htCustomEvt = {
			sMoveType :'tap',
			oEvent : {stop: function(){}
			}	
	};

	oToggle._onEnd(htCustomEvt);
	ok(!oToggle.isOn(),'tap에 대한 이벤트 발생시 토글됨');
	
	oToggle._onEnd(htCustomEvt);
	ok(oToggle.isOn(),'tap에 대한 이벤트 발생시 토글됨');	
	
});

test('_getPosition', function(){
	oToggle.off();
	
	equal(oToggle._getPosition() , 0 ,'off일 경우 left');
	
	oToggle.on();
	equal(oToggle._getPosition() , 50 ,'on일 경우 left');
})

