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


module("EmailValidator Test", {
	setup: function() {		
		oValidator = new jindo.m.EmailValidator();
	},
	teardown : function() {
		oValidator = null;
	}
});

test("Email 유효성 검사", function() {
	var sEmail,htResult;
	sEmail = "sculove@gmail.com";
	htResult = oValidator.validate(sEmail);
	equal(htResult.bValid, true, "유효성 검사. 성공");
		
	sEmail = "sculove@@@gmail.com";
	htResult = oValidator.validate(sEmail);
	equal(htResult.bValid, true, "유효성 검사. 성공");
		
	sEmail = "sculove@@@gma...il.com";
	htResult = oValidator.validate(sEmail);
	equal(htResult.bValid, true, "유효성 검사. 성공");
		
		
	sEmail = "sculove@gmail.com.ke.rk";
	htResult = oValidator.validate(sEmail);
	equal(htResult.bValid, true, "유효성 검사. 성공");
		
});

test("Email  불필요한 문자 제거 여부 확인", function() {
	var sEmail,htResult;
	sEmail = "sculove@gmail.com";
	htResult = oValidator.validate(sEmail);
	equal(htResult.sCorrectedValue, null, "수정할것이 없으면 null");
		
	sEmail = "sculove@@@gmail.com";
	htResult = oValidator.validate(sEmail);
	equal(htResult.sCorrectedValue, "sculove@gmail.com", "불필요한 문자 제거된 문자 반환. 성공");
		
	sEmail = "sculove@@@gma...il.com";
	htResult = oValidator.validate(sEmail);
	equal(htResult.sCorrectedValue, "sculove@gma.il.com", "불필요한 문자 제거된 문자 반환. 성공");
		
	sEmail = "sculove@g손찬mail..com.ke.rk.@ke";
	htResult = oValidator.validate(sEmail);
	equal(htResult.sCorrectedValue, "sculove@gmail.com.ke.rk.ke", "불필요한 문자 제거된 문자 반환. 성공");
});