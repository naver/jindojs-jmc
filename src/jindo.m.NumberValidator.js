/**
    @fileOverview  Number Validator 플러그인 
    @author "sculove"
    @version #__VERSION__#
    @since  2011. 11. 23.
    
**/
/**
   Number Validator 플러그인 

    @class jindo.m.NumberValidator
    @invisible
    @extends jindo.m.Validator
    @group Component
    @keyword Number, NumberValidator
**/
jindo.m.NumberValidator = jindo.$Class({
	/** @lends jindo.m.NumberValidator.prototype */
	/**
	 * @description 초기화 함수
	 * @constructs
	 */
	rx :  /^[+\-]?(\d{1,3},)?(\d{3},)*(\d)+(\.\d+)?$/,
	
	_isValid : function(sValue, sFormat) {
		return this.rx.test(sValue); 
	},
	
	_getCorrectedValue : function(sValue, sFormat) {
		// 숫자 형식 필터링
		sValue = this._filterNumber(sValue);
		// 포맷 적용		
		if(sFormat) {	
			sValue = this._applyComma(sValue);
		}
		return sValue;
	},
	
	/**
	 * @description 숫자에 ,를 붙이는 함수
	 */
	_applyComma : function(sValue) {
		var sResult = "",
			nIdx = 0,
			ch = null,
			chCode = null,
			nDotIdx = sValue.indexOf("."),
			sIntValue = ( nDotIdx !== -1  ? sValue.substring(0,nDotIdx) : sValue ),
			sPointValue = ( nDotIdx !== -1 ? sValue.substr(nDotIdx) : "");
		
//		console.log(sValue + " --" + sIntValue + " || " + sPointValue);
		if(sIntValue.length > 3) {
			for(var i=sIntValue.length-1; i>=0; i--, nIdx++) {
				ch = sIntValue.charAt(i); 
				chCode = sIntValue.charCodeAt (i); 
				sResult = (nIdx !==0 && nIdx %3 === 0 && (chCode > 47 && chCode < 58) ? ch + "," + sResult : ch + sResult); 
			}
			return (sPointValue !== "" ? sResult + sPointValue : sResult);
		} else {
			return sValue;
		}
	},
	
	/**
	 * @description 숫자를 추출하는 함수(-와 숫자로만 구성된값)
	 */
	_filterNumber : function(sValue) {
		var cFirst, aValue, sIntValue, sPointValue;
		// 불필요한 문자 제거
		sValue = sValue.replace(/[^\d\.\-]/g,"");
		//.replace(/\.{2,}/g,"").replace(/-{2,}/g,"");
		
		// 맞지 않는 - 제거
		cFirst = sValue.charAt(0);
		sValue = sValue.replace(/-/g,"");
		sValue = ( cFirst === "-" ? cFirst + sValue : sValue );
		if( sValue.length <= 0 || sValue === "-") {
			return sValue;
		}
		// 맞지 않는 . 제거, 정수부분 정수로 변경
		aValue = sValue.split('.');
		if(aValue.length > 1) {
			sIntValue = aValue.shift();
			//console.log(sIntValue);
			cFirst = sIntValue.charAt(0);
			sIntValue = (sIntValue === "" ? 0 : parseInt(sIntValue,10));
			if(cFirst === "-" && sIntValue === 0) {
				sIntValue = "-" + sIntValue;
			}
			sPointValue = aValue.join("");
			sValue = sIntValue + "." + sPointValue;	
		} else {
			sValue = String(parseFloat(aValue.join(""),10));
		}
		return sValue;
	}
}).extend(jindo.m.Validator);