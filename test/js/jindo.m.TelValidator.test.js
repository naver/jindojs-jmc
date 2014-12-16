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

module("TelValidator Test", {
	setup: function() {		
		oValidator = new jindo.m.TelValidator();
	},
	teardown : function() {
		oValidator = null;
	}
});

test("전화번호 유효성 검사. 포맷여부 확인", function() {
	var sTel1 = "01056136248";
	var sTel2 = "010-5613-6248";
	var htResult = oValidator.validate(sTel1);
	equal(htResult.bValid, true, "포맷없는 유효성 검사. 성공");
	equal(htResult.sCorrectedValue, sTel2, "수정된 값은 포맷이 적용된 값");
	htResult = oValidator.validate(sTel2);
	equal(htResult.bValid, true, "포맷있는 유효성 검사. 성공");
	equal(htResult.sCorrectedValue, null, "수정된 값이 없는 경우 null");	
});

test("전화번호 불필요한 문자 제거 여부 확인", function() {
	var sTel = "01056ㅁㄴ13v6d223 .. / d48";
	htResult = oValidator.validate(sTel);
	equal(htResult.sCorrectedValue, "010-5613-6223", "불필요한 문자 제거된 문자 반환. 성공");
});

test("전화번호 유형별 포맷 변환 확인", function() {
	var htResult = oValidator.validate("026634897");
	equal(htResult.sCorrectedValue, "02-663-4897", "불필요한 문자 제거된 문자 반환. 성공");
	htResult = oValidator.validate("01056136248");
	equal(htResult.sCorrectedValue, "010-5613-6248", "불필요한 문자 제거된 문자 반환. 성공");	
	htResult = oValidator.validate("0106136248");
	equal(htResult.sCorrectedValue, "010-613-6248", "불필요한 문자 제거된 문자 반환. 성공");	
	htResult = oValidator.validate("07016136248");
	equal(htResult.sCorrectedValue, "070-1613-6248", "불필요한 문자 제거된 문자 반환. 성공");	
	htResult = oValidator.validate("070161362489");
	equal(htResult.sCorrectedValue, "070-1613-6248", "불필요한 문자 제거된 문자 반환. 성공");
	htResult = oValidator.validate("05051613624");
	equal(htResult.sCorrectedValue, "0505-161-3624", "불필요한 문자 제거된 문자 반환. 성공");	
});
