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


module("DateValidator Test", {
	setup: function() {		
		oValidator = new jindo.m.DateValidator();
	},
	teardown : function() {
		oValidator = null;
	}
});

test("Date 유효성 검사, 포맷이 지정안된 경우", function() {
	var sDate,sFormat,htResult;
	sDate = "2011-12-31";
	htResult = oValidator.validate(sDate);
	equal(htResult.bValid, true, "포맷없는 유효성 검사. 성공");
	equal(htResult.sCorrectedValue, null, "수정된 값이 없는 경우 null");
	
	sDate = "2011-12-32";
	htResult = oValidator.validate(sDate);
	equal(htResult.bValid, false, "일 틀린경우. 실패");
	equal(htResult.sCorrectedValue, null, "수정된 값이 없는 경우 null");
	
	sDate = "2011-13-31";
	htResult = oValidator.validate(sDate);
	equal(htResult.bValid, false, "월 틀린경우. 실패");
	equal(htResult.sCorrectedValue, null, "수정된 값이 없는 경우 null");
});

test("Date 유효성 검사, 포맷 지정된 경우", function() {
	var sDate,sFormat,htResult;
	sDate = "2011.12.31";
	htResult = oValidator.validate(sDate, "yyyy.mm.dd");
	equal(htResult.bValid, true, "포맷없는 유효성 검사. 성공");
	equal(htResult.sCorrectedValue, null, "수정된 값이 없는 경우 null");
	
	sDate = "2011-12.32";
	htResult = oValidator.validate(sDate, "yyyy.mm.dd");
	equal(htResult.bValid, false, "일 틀린경우. 실패");
	equal(htResult.sCorrectedValue, "2011.12.32", "수정된 값");
	
	sDate = "2011-13.31";
	htResult = oValidator.validate(sDate, "yyyy.mm.dd");
	equal(htResult.bValid, false, "월 틀린경우. 실패");
	equal(htResult.sCorrectedValue, "2011.13.31", "수정된 값");

	sDate = "2011-13.31222=2929201";
	htResult = oValidator.validate(sDate, "yyyy.mm.dd");
	equal(htResult.bValid, false, "월 틀린경우. 실패");
	equal(htResult.sCorrectedValue, "2011.13.31", "수정된 값");
});

test("Date 유효성 검사, 포맷 지정된 경우", function() {
	var sDate,sFormat,htResult;
	sDate = "12.31.2011";
	htResult = oValidator.validate(sDate, "mm.dd.yyyy");
	equal(htResult.bValid, true, "포맷없는 유효성 검사. 성공");
	equal(htResult.sCorrectedValue, null, "수정된 값이 없는 경우 null");
	
	sDate = "12.32-2011";
	htResult = oValidator.validate(sDate, "mm.dd.yyyy");
	equal(htResult.bValid, false, "일 틀린경우. 실패");
	equal(htResult.sCorrectedValue, "12.32.2011", "수정된 값");
	
	sDate = "13-31-2011";
	htResult = oValidator.validate(sDate, "mm.dd.yyyy");
	equal(htResult.bValid, false, "월 틀린경우. 실패");
	equal(htResult.sCorrectedValue, "13.31.2011", "수정된 값");
	
	sDate = "13-31-2012222112-2222-222/222.221";
	htResult = oValidator.validate(sDate, "mm.dd.yyyy");
	equal(htResult.bValid, false, "월 틀린경우. 실패");
	equal(htResult.sCorrectedValue, "13.31.2012", "수정된 값");
});