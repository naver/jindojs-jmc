/**
* @(#)jindo.m.CheckBox.test.js 2011. 9. 27.
*
* Copyright NHN Corp. All rights Reserved.
* NHN PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
*/
/**
* @author sshyun
* @since 2011. 9. 27.
* @description 
*/
var isMobile = (jindo.m.getDeviceInfo().android || jindo.m.getDeviceInfo().iphone || jindo.m.getDeviceInfo().ipad);
var sClickEvent = "click";
module("CheckBox Basic Test", {
	setup: function() {		
		oCheckBox = new jindo.m.CheckBox("checkbox",{bUseRadius : true});
		
	},
	teardown : function() {		
		oCheckBox.setCheckedBox(false);
		/** 객체 소멸 */
		oCheckBox.destroy();
		oCheckBox = null;
	}
});

test("jindo.m.CheckBox 인스턴스 테스트", function() {	
	equal((oCheckBox instanceof jindo.m.CheckBox), true, "jindo.m.CheckBox 인스턴스 생성.");		
});

test("jindo.m.CheckBox Check 테스트", function() {	
	var welCheck1 = jindo.$Element("check1");
	var welCheck2 = jindo.$Element("check2");
	if(!isMobile){		
		welCheck1.fireEvent(sClickEvent);
		welCheck2.fireEvent(sClickEvent);				
	}else{
		oCheckBox._onCheck({element : welCheck1.$value()});
		oCheckBox._onCheck({element : welCheck2.$value()});
	}
	equal(jindo.$("news").checked, true, "첫번째 체크박스 선택");
	equal(welCheck1.hasClass("fcb-checkbox-on"), true, "첫번째 체크박스 on 스타일 적용");
	equal(jindo.$("weather").checked, true, "두번째 체크박스 선택");
	equal(welCheck2.hasClass("fcb-checkbox-on"), true, "두번째 체크박스 on 스타일 적용");
});

test("jindo.m.CheckBox 값 가져오기 테스트", function() {
	var welCheck1 = jindo.$Element("check1");
	var welCheck2 = jindo.$Element("check2");
	if(!isMobile){
		welCheck1.fireEvent(sClickEvent);
		welCheck2.fireEvent(sClickEvent);		
		
	}else{
		oCheckBox._onCheck({element : welCheck1.$value()});
		oCheckBox._onCheck({element : welCheck2.$value()});
	}
	var aValues = oCheckBox.getCheckedValue();
	equal(aValues.length, 2, "2 개의 값이 선택");
	equal(aValues.join(), "뉴스,날씨", "선택된 값은 뉴스,날씨");
});

test("jindo.m.CheckBox Element 가져오기 테스트", function() {	
	
	var welCheck3 = jindo.$Element("check3");
	var elCheckbox3 = jindo.$("sports");
	
	var elCheckboxUnit = oCheckBox.geElementtByIndex(2).elCheckBoxUnit;
	var elCheckbox = oCheckBox.geElementtByIndex(2).elCheckBox;
	equal((welCheck3.$value()=== elCheckboxUnit), true, "3번째 체크박스 List Unit 을 가져옴");
	equal((elCheckbox3=== elCheckbox), true, "3번째 체크박스 엘리먼트를 가져옴");
});

test("jindo.m.CheckBox Select 테스트", function() {
	
	oCheckBox.setCheckedBox(true,[jindo.$("news"),jindo.$("stock")]);
	var aValues = oCheckBox.getCheckedValue();
	
	equal(aValues.length, 2, "2 개의 값이 선택");
	equal(aValues.join(), "뉴스,증권", "선택된 값은 뉴스,증권");
	
	oCheckBox.setCheckedBox(false,[jindo.$("news"),jindo.$("stock")]);
	aValues = oCheckBox.getCheckedValue();
	
	equal(aValues.length, 0, "값이 선택 되지 않음");	
});

test("jindo.m.CheckBox all Select 테스트", function() {
	
	oCheckBox.setCheckedBox(true);
	var aValues = oCheckBox.getCheckedValue();
	
	equal(aValues.length, 5, "5 개의 값이 선택");
	equal(aValues.join(), "뉴스,날씨,스포츠,증권,연예", "선택된 값은 뉴스,날씨,스포츠,증권,연예");
	
	oCheckBox.setCheckedBox(false);
	aValues = oCheckBox.getCheckedValue();
	
	equal(aValues.length, 0, "값이 선택 되지 않음");
});

test("jindo.m.CheckBox 활성화 / 비활성화 테스트", function() {
	
	oCheckBox.disable([jindo.$("news"),jindo.$("stock")]);
	equal((jindo.$("news").disabled && jindo.$("stock").disabled), true, "뉴스,증권 비활성화.");
	
	oCheckBox.enable([jindo.$("news"),jindo.$("stock")]);
	equal((!jindo.$("news").disabled && !jindo.$("stock").disabled), true, "뉴스,증권 활성화.");
});

test("jindo.m.CheckBox all 활성화 / 비활성화 테스트", function() {
	
	oCheckBox.disable();
	equal((jindo.$("news").disabled && 
			jindo.$("weather").disabled && 
			jindo.$("sports").disabled &&
			jindo.$("stock").disabled &&
			jindo.$("entertain").disabled), true, "모든 체크 박스 비활성화.");
	
	oCheckBox.enable();
	equal((!jindo.$("news").disabled && 
			!jindo.$("weather").disabled && 
			!jindo.$("sports").disabled &&
			!jindo.$("stock").disabled &&
			!jindo.$("entertain").disabled), true, "모든 체크 박스 활성화.");
});

