/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("Test Template", {
	setup: function() {
		oSlider = new jindo.m.Slider("slider");
	},
	teardown : function() {
		/** 객체 소멸 */
		oSlider.destroy();
		oSlider = null;
	}
} );

test("setPosition/getPosition", function() {
	oSlider.setPosition(100);

	equal(oSlider.getPosition(), 100, '100% 설정하였을때');
	equal(oSlider.getValue(), oSlider.option('nMaxValue'), '100% 설정하였을때  Value 값');

	oSlider.setPosition(0);
	equal(oSlider.getPosition(), 0, '100% 설정하였을때');
	equal(oSlider.getValue(), oSlider.option('nMinValue'), '0으로 설정하였을때  Value 값');

	oSlider.setPosition(50);
	equal(oSlider.getPosition(), 50 ,'50% 설정하였을때');

	var nValue =  (oSlider.option('nMaxValue')- oSlider.option('nMinValue'))/2;

	equal(oSlider.getValue(), nValue, '0으로 설정하였을때  Value 값');

});


test('setValue/getValue', function(){
	oSlider.setValue(oSlider.option('nMaxValue'));

	equal(oSlider.getValue(), oSlider.option('nMaxValue'), 'nMaxValue 값으로 설정');
	equal(oSlider.getPosition(), 100 , 'nMaxValue 값으로 설정 Position 값');


	oSlider.setValue(oSlider.option('nMinValue'));
	equal(oSlider.getValue(), oSlider.option('nMinValue'), 'nMinValue 값으로 설정');

	equal(oSlider.getPosition(), 0 , 'nMinValue 값으로 설정 Position 값');


	var nValue = (oSlider.option('nMaxValue') - oSlider.option('nMinValue')) / 4;
	oSlider.setValue(nValue);

	equal(oSlider.getValue(), nValue, nValue+'값으로 설정');
	equal(oSlider.getPosition(), 25, nValue+'값으로 설정 했을때 Position값');

});

test('커스텀이벤트', function(){
	var nValue = oSlider.option('nMinValue')+10.5;

	oSlider.attach({
		'beforeChange' : function(oCustomEvt){
			equal(nValue, oCustomEvt.nValue, 'beforeChange 이벤트 발생');

			oCustomEvt.nAdjustValue = (nValue + 0.5);

		},
		'change' : function(oCustomEvt){
			equal(oCustomEvt.nAdjustValue,(nValue +0.5) ,'Change 이벤트 발생');
		}
	});

	oSlider.setValue(nValue);
});


test('동일한 value 셋팅시 커스텀 이벤트 발생여부 확인', function(){
	var nValue = oSlider.option('nMinValue')+10.5;
	var nCount = 0;
	oSlider.attach({
		'change' : function(oCustomEvt){
			nCount++;
		}
	});

	oSlider.setValue(nValue);
	oSlider.setValue(nValue);

    stop();

	setTimeout(function(){
	    equal(nCount,1 ,'한번의 커스텀 이벤트가 발생된다.');
	    start();
	}, 500);
});

test('Thumb 버튼 tab 시 위치 이동이 되지 않는다.', function(){
	var nCount = 0;
	oSlider.attach({
		'change' : function(oCustomEvt){
			nCount++;
		}
	});

    var welThumb = jindo.$Element(jindo.$$.getSingle(".slider-thumb"));

    welThumb.fireEvent("mousedown");
    welThumb.fireEvent("mouseup");

    stop();

	setTimeout(function(){
	    equal(nCount,0 ,'한번의 커스텀 이벤트가 발생된다.');
	    start();
	}, 500);
});

