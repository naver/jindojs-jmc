/**
    @fileOverview  TelValidator 플러그인 
    @author "sculove"
    @version #__VERSION__#
    @since  2011. 11. 23.
    
**/
/**
   TelValidator 플러그인 

    @class jindo.m.TelValidator
    @invisible
    @extends jindo.m.Validator
    @group Component
    @keyword tel, telvalidator
**/
jindo.m.TelValidator = jindo.$Class({
	/** @lends jindo.m.TelValidator.prototype */
	/**
	 * @description 초기화 함수
	 * @constructs
	 */
	rx : /^(\d{2,3})(\d{3,4})(\d{4})$/,
	
	_isValid : function(sValue) {
		sValue = sValue.replace(/[^\d]/g, "");
		if(this.rx.test(sValue)) {
			var nLength = sValue.length,
				bResult = false;
			if(sValue.charAt(0) === "0") {
				// 02-123-4567
				// 02-1234-5678
				// 01X-123-4567, 07X-123-4567, 지역번호-123-4567
				// 01X-1234-5678, 07X-1234-5678, 0505-123-4567, 지역번호-1234-5678
				if( (nLength === 9 && sValue.substring(0,2) === "02") || nLength === 10 || nLength === 11 ) {
					bResult = true;			
				}	
			}
			return bResult;
		} else {
			return false;
		}
	},
		
	/**
	 * @description 유효문자로 변경
	 * @param sValue 검증할 메일주소
	 */
	_getCorrectedValue : function(sValue,sFormat){
		sValue = sValue.replace(/[^\d]/g, "");
		sValue = (sValue.length > 11 ? sValue.substr(0,11) : sValue);
		return this._applyFormat(sValue, sFormat);
	},
	
	/**
	 * @description 포맷을 적용함
	 */
	_applyFormat : function(sValue, sFormat) {
		sFormat = sFormat || "-";
		var nLength = sValue.length;
		if(sValue.charAt(0) === "0") {
			if(nLength === 9 && sValue.substring(0,2) === "02") {
				// 02-123-4567
				sValue = sValue.substr(0,2) + sFormat + sValue.substr(2,3) +  sFormat + sValue.substr(5,4);
			} else if(nLength === 10) {
				if(sValue.substr(0,2) === "02") {
					// 02-1234-5678
					sValue = sValue.substr(0,2) + sFormat + sValue.substr(2,4) +  sFormat + sValue.substr(6,4);		
				} else {
					// 01X-123-4567, 07X-123-4567,  지역번호-123-4567
					sValue = sValue.substr(0,3) + sFormat + sValue.substr(3,3) +  sFormat + sValue.substr(6,4);			
				}
			} else if(nLength === 11) {
				// 01X-1234-5678, 07X-1234-5678, 0505-123-4567, 지역번호-1234-5678
				if(sValue.substr(0,4) === "0505") {
					sValue = sValue.substr(0,4) + sFormat + sValue.substr(4,3) +  sFormat + sValue.substr(7,4);
				} else {
					sValue = sValue.substr(0,3) + sFormat + sValue.substr(3,4) +  sFormat + sValue.substr(7,4);
				}
			}	
		}		
		return sValue;
	}	
}).extend(jindo.m.Validator);