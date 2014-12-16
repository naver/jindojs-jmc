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


module("CurrencyValidator Test", {
	setup: function() {		
		oValidator = new jindo.m.CurrencyValidator();
	},
	teardown : function() {
		oValidator = null;
	}
});

test("숫자 유효성 검사. 포맷없는 경우", function() {
	var sNum = "\\124,578,951,501,515.154826";
	var htResult = oValidator.validate(sNum);
	equal(htResult.bValid, true, "포맷없는 유효성 검사. 성공");
	equal(htResult.sCorrectedValue, null, "수정된 값이 없는 경우 null");
	
	sNum = "1,24,578,9,51,501,515.1548dkss26";
	htResult = oValidator.validate(sNum);
	equal(htResult.bValid, true, "포맷없는 유효성 검사. 성공");
	equal(htResult.sCorrectedValue, "\\124,578,951,501,515.154826", "수정된 값은 포맷이 적용된 값");
	
	sNum = "-21211-22222110..154,8d..kss26";
	htResult = oValidator.validate(sNum);
	equal(htResult.bValid, true, "포맷없는 유효성 검사. 성공");
	equal(htResult.sCorrectedValue, "-\\2,121,122,222,110.154826", "수정된 값은 포맷이 적용된 값");
	
	sNum = "-212++11-22222110..154,8d..kss26";
	htResult = oValidator.validate(sNum);
	equal(htResult.bValid, true, "포맷없는 유효성 검사. 성공");
	equal(htResult.sCorrectedValue, "-\\2,121,122,222,110.154826", "수정된 값은 포맷이 적용된 값");
	
	sNum = "--087,88,99..1한글고 들어가고욘..54,,8d..kss26";
	htResult = oValidator.validate(sNum);
	equal(htResult.bValid, true, "포맷없는 유효성 검사. 성공");
	equal(htResult.sCorrectedValue, "-\\878,899.154826", "수정된 값은 포맷이 적용된 값");
});

test("숫자 유효성 검사. 포맷적용된 경우", function() {
	var sNum = "$124,578,951,501,515.154826";
	var htResult = oValidator.validate(sNum,"$");
	equal(htResult.bValid, true, "포맷없는 유효성 검사. 성공");
	equal(htResult.sCorrectedValue, null, "수정된 값이 없는 경우 null");
	
	sNum = "$1,24,578,9,51,501,515.1548dkss26";
	htResult = oValidator.validate(sNum,"$");
	equal(htResult.bValid, true, "포맷없는 유효성 검사. 성공");
	equal(htResult.sCorrectedValue, "$124,578,951,501,515.154826", "수정된 값은 포맷이 적용된 값");
	
	sNum = "-21211-22222110..154,8d..kss26";
	htResult = oValidator.validate(sNum,"$");
	equal(htResult.bValid, true, "포맷없는 유효성 검사. 성공");
	equal(htResult.sCorrectedValue, "-$2,121,122,222,110.154826", "수정된 값은 포맷이 적용된 값");
	
	sNum = "-$212++11-22222110..154,8d..kss26";
	htResult = oValidator.validate(sNum,"$");
	equal(htResult.bValid, true, "포맷없는 유효성 검사. 성공");
	equal(htResult.sCorrectedValue, "-$2,121,122,222,110.154826", "수정된 값은 포맷이 적용된 값");
	
	sNum = "--087,88,99..1한글고 들어가고욘..54,,8d..kss26";
	htResult = oValidator.validate(sNum,"$");
	equal(htResult.bValid, true, "포맷없는 유효성 검사. 성공");
	equal(htResult.sCorrectedValue, "-$878,899.154826", "수정된 값은 포맷이 적용된 값");
});
