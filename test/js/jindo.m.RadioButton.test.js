/**
* @(#)jindo.m.RadioButton.test.js 2011. 9. 28.
*
* Copyright NHN Corp. All rights Reserved.
* NHN PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
*/
/**
* @author sshyun
* @since 2011. 9. 28.
* @description 
*/
var isMobile = (jindo.m.getDeviceInfo().android || jindo.m.getDeviceInfo().iphone || jindo.m.getDeviceInfo().ipad);

sClickEvent = "click";
var sClickEvent = (jindo.$Agent().navigator().mobile) ? "touchstart" : "click";
module("RadioButton Basic Test", {
	setup: function() {		
		oRadioButton = new jindo.m.RadioButton("radioBtn",{bConerRadius : true});
		
	},
	teardown : function() {
		/** 객체 소멸 */
		oRadioButton.destroy();
		oRadioButton = null;
	}
});

test("jindo.m.RadioButton 인스턴스 테스트", function() {	
	equal((oRadioButton instanceof jindo.m.RadioButton), true, "jindo.m.RadioButton 인스턴스 생성.");		
});

test("jindo.m.RadioButton Check 테스트", function() {	
	
	var welRadio = jindo.$Element("radio2");
	if(!isMobile){
		welRadio.fireEvent(sClickEvent);
	}else{
		oRadioButton._onCheck({element : welRadio.$value()})
	}
	
	equal(jindo.$("fruit2").checked, true, "두번째 체크박스 선택");	
});

test("jindo.m.RadioButton 값 가져오기 테스트", function() {	
	var welRadio = jindo.$Element("radio3");
	if(!isMobile){
		welRadio.fireEvent(sClickEvent);
	}else{
		oRadioButton._onCheck({element : welRadio.$value()})
	}
	
	var sValue = oRadioButton.getCheckedValue();
	equal(sValue, "Orange", "선택된 값은  Orange");	
});

test("jindo.m.RadioButton Element 가져오기 테스트", function() {	
	
	var welRadioUnit = jindo.$Element("radio3");
	var elRadio = jindo.$("fruit3");
	
	var elRadioButtonUnit = oRadioButton.getElementByIndex(2).elRadioButtonUnit;
	var elRadioButton = oRadioButton.getElementByIndex(2).elRadioButton;
	equal((welRadioUnit.$value()=== elRadioButtonUnit), true, "3번째 List Unit 을 가져옴");
	equal((elRadioButton=== elRadio), true, "3번째 RadioButton 엘리먼트를 가져옴");
});

test("jindo.m.RadioButton Select 테스트", function() {
	
	oRadioButton.setCheckedButton(jindo.$("fruit1"));
	var sValue = oRadioButton.getCheckedValue();
		
	equal(sValue, "Apple", "선택된 값은 Apple");	
});

test("jindo.m.RadioButton 활성화 / 비활성화 테스트", function() {
	
	oRadioButton.disable([jindo.$("fruit1"),jindo.$("fruit3")]);
	equal((jindo.$("fruit1").disabled && jindo.$("fruit3").disabled), true, "Apple,Orange 비활성화.");
	
	oRadioButton.enable([jindo.$("fruit1"),jindo.$("fruit3")]);
	equal((!jindo.$("fruit1").disabled && !jindo.$("fruit3").disabled), true, "Apple,Orange  활성화.");
});

test("jindo.m.RadioButton all 활성화 / 비활성화 테스트", function() {
	
	oRadioButton.disable();
	equal((jindo.$("fruit1").disabled && 
			jindo.$("fruit2").disabled && 
			jindo.$("fruit3").disabled &&
			jindo.$("fruit4").disabled &&
			jindo.$("fruit5").disabled), true, "모든 RadioButton 비활성화.");
	
	oRadioButton.enable();
	equal((!jindo.$("fruit1").disabled && 
			!jindo.$("fruit2").disabled && 
			!jindo.$("fruit3").disabled &&
			!jindo.$("fruit4").disabled &&
			!jindo.$("fruit5").disabled), true, "모든 RadioButton 활성화.");
});