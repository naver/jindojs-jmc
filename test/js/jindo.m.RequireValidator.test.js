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


module("RequireValidator Test", {
	setup: function() {		
		oValidator = new jindo.m.RequireValidator();
	},
	teardown : function() {
		oValidator = null;
	}
});

test("필수여부 확인", function() {
	var sText = "sculove";
	var htResult = oValidator.validate(sText);
	equal(htResult.bValid, true, "유효성 검사. 성공");
	equal(htResult.sCorrectedValue, null, "sCorrectedValue는 항상 null");
});

test("공백 테스트", function() {
	var sText = "   ";
	var htResult = oValidator.validate(sText);
	equal(htResult.bValid, false, "유효성 검사. 성공");
	equal(htResult.sCorrectedValue, null, "sCorrectedValue는 항상 null");
});

test("탭 테스트", function() {
	var sText = "	";
	var htResult = oValidator.validate(sText);
	equal(htResult.bValid, false, "유효성 검사. 성공");
	equal(htResult.sCorrectedValue, null, "sCorrectedValue는 항상 null");
});
