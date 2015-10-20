/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
var isMobile = (jindo.m.getDeviceInfo().android || jindo.m.getDeviceInfo().iphone || jindo.m.getDeviceInfo().ipad);
module("jindo.m.AjaxHistory Template", {
	setup: function() {
		/** 객체 생성 */

		oAjaxHistory = new jindo.m.AjaxHistory();		
		aHistoryData = [];		
		oAjaxHistory.attach({
			'load' : function(oCustomEvent){
				//console.log('load');
			},
			'change' : function(oCustomEvent){
				window.sType = oCustomEvent.htHistoryData.type;
			}
		});
		oAjaxHistory.initialize();
		
	
			
	},
	teardown : function() {
		/** 객체 소멸 */
		location.hash = '';
		oAjaxHistory.destroy();
		aHistoryData =null;
	}
} );



test("addHistory", function() {
	var htData = {type: 1};
	oAjaxHistory.addHistory(htData);
	equal(oAjaxHistory._htLastState.type, htData.type, '저장데이터 확인');
	
	htData.type = 2;
	oAjaxHistory.addHistory(htData);
	equal(oAjaxHistory._htLastState.type, htData.type, '저장데이터 확인');
});

test("_isEncoded", function(){
	equal(oAjaxHistory._isEncoded("{a:1}"), false);
	equal(oAjaxHistory._isEncoded(encodeURIComponent("{a:1}")), true);
});

test('cloneObject', function(){
	var htData = {data : 'abc'};
	
	var htNewData = oAjaxHistory._cloneObject(htData);
	
	equal(htNewData.data, htData.data, '복사 완료');
	
	var htTemp = oAjaxHistory._cloneObject();
	equal(isEmpty(htTemp), isEmpty({}), '빈object 넘겨줌');
	
});

test('_getEncodeData', function(){
	var htTest = {type : 'abcd'};
	
	var sEncode = oAjaxHistory._getEncodedData(htTest);
	
	var sEquals = encodeURIComponent(jindo.$Json(htTest).toString());	
	
	equal(sEncode, sEquals, '인코딩데이터 확인');	
});

test('_getDecodeData', function(){
	var htData = {type : 'zfe'};
	
	var sData = oAjaxHistory._getEncodedData(htData);	
	var htDecode  = oAjaxHistory._getDecodedData(sData);
	
	
	equal(jindo.$Json(decodeURIComponent(sData)).toObject().type, htDecode.type, '디코딩데이터 확인');
	
});

test('_addHistory & history.back()', function(){
	if(!isMobile){
		var htData = {type : 1};
	
		oAjaxHistory.addHistory(htData);
		htData.type = 2;
		oAjaxHistory.addHistory(htData);
		htData.type = 3;
		oAjaxHistory.addHistory(htData);
		
		history.back();
		stop();
		setTimeout(function(){
			equal(window.sType, 2, 'history.back()');
			start();
		},1000);
	}else{
		ok(true, 'mobile이 아닌환경에서만 실행합니다');
	}

});


//test('pushState', function(){
//	oAjaxHistory.bPushState = false;
//	
//	var htData = {type : 'a'};
//	oAjaxHistory.addHistory(htData);
//	htData.type = 'b';
//	oAjaxHistory.addHistory(htData);
//	htData.type = 'c';
//	oAjaxHistory.addHistory(htData);
//	
//	history.back();
//	
//	stop();
//	
//	setTimeout(function(){
//		equal(window.sType, 'b', 'history.back()');
//		start();
//	},1000);	
//	
//});

function isEmpty(ob){
	   for(var i in ob){ return false;}
	  return true;
}
