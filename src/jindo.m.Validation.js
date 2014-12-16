/**
	@fileOverview 유효성을 처리할 수 있는 각각의 Validator들을 관리하고, 각각의 Validator의 유효성을 검증하는 유틸성 모듈
	@author sculove
	@version #__VERSION__#
	@since 2011. 11. 23.
**/
/**
	유효성을 처리할 수 있는 각각의 Validator들을 관리하고, 각각의 Validator의 유효성을 검증하는 유틸성 모듈

	@class jindo.m.Validation
	@keyword validation
	@uses jindo.m.CurrencyValidator, jindo.m.DateValidator, jindo.m.EmailValidator, jindo.m.NumberValidator, jindo.m.RequireValidator, jindo.m.TelValidator, jindo.m.UrlValidator {1,}
	@group Component

	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 1.0.0 Release 최초 릴리즈
**/
jindo.m.Validation = jindo.$Class({
	/* @lends jindo.m.Validation.prototype */
	/**
		초기화 함수

		@constructor
	**/
	$init : function() {},

	$static : {
		_htValidator : {},
		_htValidatorType : {
			"email" : "jindo.m.EmailValidator",
			"url" : "jindo.m.UrlValidator",
			"tel" : "jindo.m.TelValidator",
			"date" : "jindo.m.DateValidator",
			"number" : "jindo.m.NumberValidator",
			"currency" : "jindo.m.CurrencyValidator",
			"require" : "jindo.m.RequireValidator"
		},

		/**
			sType에 맞는 Validatior를 생성한다.
		**/
		_createValidator : function(sType) {
			if(jindo.m.Validation._htValidatorType[sType] && !jindo.m.Validation._htValidator[sType]) {
				//console.log("객체 생성 : new " + jindo.m.Validation._htValidatorType[sType] + "()");
				jindo.m.Validation._htValidator[sType] = eval("new " + jindo.m.Validation._htValidatorType[sType] + "()");
			}
		},

		/**
			@static
			sType의 Validatior를 추가 또는 갱신한다.
			@param {String} sType validatior 타입
			@param {String} sClassName validatior 클래스명
		**/
		add : function(sType, sClassName) {
			jindo.m.Validation._htValidatorType[sType] = sClassName;
		},

		/**
			@static
			sType의 Validatior 를 삭제한다.
			@param {String} sType validatior 타입
		**/
		remove : function(sType) {
			delete jindo.m.Validation._htValidatorType[sType];
		},

		/**
			validation문자열을 분석하여 HashTab로 결과를 반환한다
			parse 된 Validation Type은 자동으로 Validator를 생성한다.

			@param {String} sValidate validation문자열
			@return {Object} htValidateData key : value = "Validator타입" : sFormat""
		**/
		_parse : function(sValidate) {
			var aValidate = sValidate.split(";");
			var sType, sValue, htValidateData = {};
			for(var i=0, nLength = aValidate.length; i<nLength; i++) {
				var aTemp = aValidate[i].split(":");
				if(aTemp) {
					sType = aTemp[0];
					sValue = aTemp.length >1 ? aTemp[1] : null;
					htValidateData[sType] = htValidateData[sType] || sValue;
					// static으로 Validator들 생성하여 저장
					jindo.m.Validation._createValidator(sType);
				}
			}
			return htValidateData;
		},

		/**
			sValidate에 대해 Validation 한다.

			@static
			@param {String} sValidate validation문법
			@param {String} sValue validate할 문장,내용
			@param {Object} {bValid : 성공여부, sCorrectedValue : 수정된 값, sPreValue : 이전 값, sType : validation type}
		**/
		validate : function(sValidate, sValue) {
			var htResult, htValidateData = jindo.m.Validation._parse(sValidate);

			/*require인 경우 예외처리*/
			if("require" in htValidateData) {
				htResult = jindo.m.Validation._htValidator["require"].validate(sValue);
				if(!htResult.bValid) {
					return {
						bValid : false,
						sType : "require",
						sPreValue : sValue
					};
				} else {
					delete htValidateData["require"];
				}
			}
			/*값이 없는 경우 null */
			if(jindo.$S(sValue).trim() == "") {
				return null;
			}
			for(var sType in htValidateData) {
				htResult = jindo.m.Validation._htValidator[sType].validate(sValue, htValidateData[sType]);
				if(!htResult.bValid) {
					htResult.sType = sType;
					htResult.sPreValue = sValue;
					return htResult;
				}
			}
			htResult.bValid = true;
			htResult.sPreValue = sValue;
			return htResult;
		}
	}
});