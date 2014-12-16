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


module("UrlValidator Test", {
	setup: function() {		
		oValidator = new jindo.m.UrlValidator();
	},
	teardown : function() {
		oValidator = null;
	}
});

test("URL 유효성 검사", function() {
	var sUrl = "http://www.naver.com손/sculove찬/uk욱";
	var htResult = oValidator.validate(sUrl);
	equal(htResult.bValid, true, "유효성 검사는 성공");
	notEqual(htResult.sCorrectedValue, sUrl, "수정된 값과 원본 값이 다르다.");	
});

test("URL 유효성 검사 - http가 없는 경우", function() {
	var sUrl = "www.naver.com손/sculove찬/uk욱";
	var htResult = oValidator.validate(sUrl);
	equal(htResult.bValid, true, "유효성 검사는 성공");
	notEqual(htResult.sCorrectedValue, sUrl, "수정된 값과 원본 값이 다르다.");	
});

test("URL 유효성 검사 - https인 경우", function() {
	var sUrl = "https://www.naver.com손/sculove찬/uk욱";
	var htResult = oValidator.validate(sUrl);
	equal(htResult.bValid, true, "유효성 검사는 성공");
	notEqual(htResult.sCorrectedValue, sUrl, "수정된 값과 원본 값이 다르다.");	
});

test("URL 유효성 검사 - /로 시작하는 경우", function() {
	var sUrl = "/www.naver.com손/sculove찬/uk욱";
	var htResult = oValidator.validate(sUrl);
	equal(htResult.bValid, false, "유효성 검사는 실패");
	notEqual(htResult.sCorrectedValue, sUrl, "수정된 값과 원본 값이 다르다.");	
});

test("URL 불필요한 값 제거 여부", function() {
	var sUrl = "www.naver.com@손/@sculove찬/uk욱";
	var htResult = oValidator.validate(sUrl);
	equal(htResult.bValid, true, "유효성 검사는 성공");
	equal(htResult.sCorrectedValue, "www.naver.com/sculove/uk", "영문,숫자를 제외한 값은 제외되고 호출됨 (구분자 /도 제외)");
	
	sUrl = "www.naver.com/sculove/uk";
	htResult = oValidator.validate(sUrl);
	equal(htResult.sCorrectedValue, null, "수정된 값이 없는 경우 null");	
});
