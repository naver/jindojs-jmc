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


module("Validation Test", {
	setup: function() {		
	},
	teardown : function() {
	}
});

test("기본Validator 타입 반환", function() {
	var ht=jindo.m.Validation._htValidatorType;
	equal(ht["email"], "jindo.m.EmailValidator", "email 은 EmailValidator 이다");
	equal(ht["url"], "jindo.m.UrlValidator", "url 은 UrlValidator 이다");
	equal(ht["tel"], "jindo.m.TelValidator", "tel 은 TelValidator 이다");
	equal(ht["date"], "jindo.m.DateValidator", "url 은 DateValidator 이다");
	equal(ht["number"], "jindo.m.NumberValidator", "number 은 NumberValidator 이다");
	equal(ht["currency"], "jindo.m.CurrencyValidator", "currency 은 CurrencyValidator 이다");
	equal(ht["require"], "jindo.m.RequireValidator", "require 은 RequireValidator 이다");
});

test("Validator 관리", function() {
	var ht=jindo.m.Validation._htValidatorType;
	equal(ht["custom1"], undefined, "custom 은 없다");
	jindo.m.Validation.add("custom1","jindo.m.Custom1Validator");
	jindo.m.Validation.add("custom2","jindo.m.Custom2Validator");
	jindo.m.Validation.add("custom3","jindo.m.Custom3Validator");
	equal(ht["custom1"], "jindo.m.Custom1Validator", "custom1");
	equal(ht["custom2"], "jindo.m.Custom2Validator", "custom2");
	equal(ht["custom3"], "jindo.m.Custom3Validator", "custom3");
	jindo.m.Validation.remove("custom1");
	jindo.m.Validation.add("custom3");
	equal(ht["custom1"], undefined, "custom1");
	equal(ht["custom2"], "jindo.m.Custom2Validator", "custom2");
	equal(ht["custom3"], undefined, "custom3");
});

test("Validator parsing and createValidator", function() {
	var ht=jindo.m.Validation._htValidatorType;
	var sValidate = "require;date:yyyy.mm.dd;;;tel:-";
    equal(jindo.m.Validation._htValidator["require"], undefined,  "require instanceof  미존재");
	equal(jindo.m.Validation._htValidator["date"],  undefined,  "date instanceof  미존재");
	equal(jindo.m.Validation._htValidator["tel"],  undefined,  "tel instanceof  미존재");
    var htResult = jindo.m.Validation._parse(sValidate);
	equal(htResult["require"], null, "require 존재");
	equal(htResult["date"], "yyyy.mm.dd", "date 존재");
	equal(htResult["tel"], "-", "tel 존재");
	equal(jindo.m.Validation._htValidator["require"] instanceof jindo.m.RequireValidator, true,  "require instanceof  존재");
	equal(jindo.m.Validation._htValidator["date"] instanceof jindo.m.DateValidator, true,  "date instanceof  존재");
	equal(jindo.m.Validation._htValidator["tel"] instanceof jindo.m.TelValidator, true,  "tel instanceof  존재");
});

test("validate", function() {
	var ht=jindo.m.Validation._htValidatorType;
	var sValidate = "date:yyyy.mm.dd;;;tel:-";
    var htResult = jindo.m.Validation.validate(sValidate, "    ");
    equal(htResult, null, "require를 제외하고, 검증할 값이 공백만 또는 없는 경우에는 null을 반환");
	
	sValidate = "require;date:yyyy.mm.dd;;;tel:-";
    htResult = jindo.m.Validation.validate(sValidate, "    ");
    equal(htResult.sType, "require", "require실패 여부 확인");
    equal(htResult.bValid, false, "require실패 여부 확인");
    equal(htResult.sPreValue, "    ", "이전 값 확인");
	
	sValidate = "require;date:yyyy.mm.dd";
    htResult = jindo.m.Validation.validate(sValidate, "20111231 ");
    equal(htResult.sType, undefined, "성공시에 sType은 반환하지 않는다.");
    equal(htResult.bValid, true, "성공여부는 bValid");
    equal(htResult.sPreValue, "20111231 ", "이전 값 확인");

	sValidate = "require;date:yyyy.mm.dd";
    htResult = jindo.m.Validation.validate(sValidate, "20111232 ");
	equal(htResult.sType, "date", "실패한 경우, sType반환.");
    equal(htResult.bValid, false, "성공여부는 bValid");
    equal(htResult.sPreValue, "20111232 ", "이전 값 확인");
});
