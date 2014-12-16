/**
* @(#)jindo.m.TextInput.test.js 2011. 12. 16.
*
* Copyright NHN Corp. All rights Reserved.
* NHN PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
*/
/**
* @author sculove
* @since 2011. 12. 16.
* @description 
*/
var isMobile = (jindo.$Agent().navigator().mobile || jindo.$Agent().os().ipad); 
module("TextInput Basic Test", {
	setup: function() {		
		oTextInput = new jindo.m.TextInput("form_base");
	},
	teardown : function() {
		/** 객체 소멸 */
		oTextInput.destroy();
		oTextInput = null;
	}
});

test("jindo.m.TextInput 인스턴스 테스트", function() {	
	equal((oTextInput instanceof jindo.m.TextInput), true, "jindo.m.TextInput 인스턴스 생성.");		
	equal(oTextInput.getLength(), 10, "추가된 input개수는 10");
});

test("jindo.m.TextInput  삭제 버튼 테스트", function() {	
	var elInput = jindo.$("currencyInput");
	var welDel = oTextInput.getDelElement(oTextInput.getLength()-1);
	elInput.focus();
	equal(welDel.visible(), false, "삭제버튼은 없다");
	elInput.value = "232손찬욱";
	
	// 아래 fireEvent 처리한 부분은 interval -> onInput 이벤트로 변경함에 있어 처리. 
	jindo.$Element(elInput).fireEvent("input");

	if(jindo.m.getDeviceInfo().android || parseInt(jindo.m.getDeviceInfo().version,10) !== 3) {
			setTimeout(function() {
			equal(welDel.visible(), true, "삭제버튼 있다");
			elInput.value = "";
			jindo.$Element(elInput).fireEvent("input");
			setTimeout(function() {
				equal(welDel.visible(), false, "삭제버튼은 없다");
				elInput.value = "232손찬211욱";
				jindo.$Element(elInput).fireEvent("input");
				setTimeout(function() {
					equal(welDel.visible(), true, "삭제버튼 있다");
					equal(elInput.value, "232손찬211욱", "삭제버튼클릭 이전 값은 있다");
					jindo.$Element(elInput).fireEvent("input");
					//mouse이벤트는 모바일에서는 touch가 발생해야 하는 이벤트 이므로 임의로 발생시킬수없다.
					if(!isMobile){
						welDel.fireEvent("mousedown");
						equal(welDel.visible(), false, "삭제버튼은 없다");
						equal(elInput.value, "", "삭제버튼클릭 이후 값은 없다");				
					}
					start();				
				},300);
			},300);
		},300);
		stop();
	}
});

if(jindo.m.getDeviceInfo().android) {
test("focus/blur 테스트", function() {
	var nCountFocus = 0;
	var nCountBlur = 0;
	oTextInput.attach({
		"blur" :  function() {
			nCountBlur++;
		},	
		"focus" : function() {
			nCountFocus++;
		}
	});
	var elInput = jindo.$("currencyInput");
	oTextInput._onFocus({
		element : elInput
	});
	setTimeout(function() {
		oTextInput._onBlur({
			element : elInput
		});
		setTimeout(function() {
			jindo.m.getDeviceInfo().android = true;
			oTextInput._onFocus({
				element : elInput
			});
			setTimeout(function() {
				oTextInput._onBlur({
					element : elInput
				});	
				setTimeout(function() {
					equal(nCountBlur, 2, "blur은 2번 타야한다");
					equal(nCountFocus, 2, "focus는 2번 타야한다");
					jindo.m.getDeviceInfo().android = false;
					start();		
				},400);	
			},400);
		},400);	
	},400);
	stop();
});
} 

test("jindo.m.TextInput 부분 활성화 비활성화 테스트", function() {	
	var elInput1 = jindo.$("currencyInput");
	var elInput2 = jindo.$("numberInput");
	oTextInput.disable([elInput1, elInput2]);
	equal(elInput1.disabled, true, "두번째 Input 비활성화");	
	equal(elInput2.disabled, true, "세번째 Input 비활성화");
	oTextInput.enable([elInput1, elInput2]);
	equal(elInput1.disabled, false, "두번째 Input 활성화");
	equal(elInput2.disabled, false, "세번째 Input 활성화");
});

test("jindo.m.TextInput 전체 활성화 비활성화 테스트", function() {	
	oTextInput.disable();
	var aBaseList = jindo.$$(".fit-textinput-unit");
	var bDisable = false;
	var elInput;
	for ( var i = 0; i < aBaseList.length; i++) {
		elInput = jindo.$$.getSingle("input", aBaseList[i]);
		bDisable = elInput.disabled;
		if(!bDisable){
			break;
		}
	}	
	equal(bDisable, true, "모든 Input 비활성화");
	oTextInput.enable();
	for ( var i = 0; i < aBaseList.length; i++) {
		elInput = jindo.$$.getSingle("input", aBaseList[i]);
		bDisable = elInput.disabled;
		if(bDisable){
			break;
		}
	}	
	equal(bDisable, false, "모든 Input 활성화");
});

test("jindo.m.TextInput 엘리먼트 선택", function() {	
	var elInput1 = jindo.$("currencyInput");
	var nIdx1 = oTextInput.getIndex(elInput1);
	var elInput2 = jindo.$("numberInput");
	var nIdx2 = oTextInput.getIndex(elInput2);
	equal(oTextInput.getElement(nIdx1).html(),  jindo.$Element("currencyUnit").html(), "getElement로 unit 얻기");
	equal(oTextInput.getInputElement(nIdx1).html(),  jindo.$Element(elInput1).html(), "getInputElement로 Input 얻기");
	equal(oTextInput.getDelElement(nIdx1).html(),  jindo.$Element("currencyDel").html(), "getDelElement로 del 얻기");
	equal(oTextInput.getElement(nIdx2).html(),  jindo.$Element("numberUnit").html(), "getElement로 unit 얻기");
	equal(oTextInput.getInputElement(nIdx2).html(),  jindo.$Element(elInput2).html(), "getInputElement로 Input 얻기");
	equal(oTextInput.getDelElement(nIdx2), undefined, "getDelElement가 없을 경우");
});

test("Validate 확인", function() {
	expect(0);
	oTextInput.option("bUseValidate", true);
	oTextInput.attach({
		"valid" : function(we) {
			equal(we.htValidate.sCorrectedValue,  "-$22,223,232.22323222", "valid에서 통화가 필터링되어 input값이 변경된다");
			oTextInput.detachAll("valid");
			setTimeout(function() {
				elInput.value="-2222손찬욱3232.";
			},400);
		},
		"invalid" : function(we) {
			equal(we.htValidate.sCorrectedValue,  "-$22,223,232.", "invalid에서 통화가 필터링되어 input값이 변경된다");
			oTextInput.detachAll("invalid");
			setTimeout(function() {
				start();
			},400);			
		}
	});
	var elInput = jindo.$("currencyInput");
	oTextInput._onFocus({
		element : elInput
	});
	if(jindo.m.getDeviceInfo().android || parseInt(jindo.m.getDeviceInfo().version,10) !== 3) {
	setTimeout(function() {
		elInput.value="-2222손찬욱3232.22323가인ㄴ222";
		start();
	},400);
	stop();
	}
});