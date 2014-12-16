/**
    @fileOverview  Date Validator 플러그인 
    @author "sculove"
    @version #__VERSION__#
    @since  2011. 11. 23.
    
**/
/**
   Date Validator 플러그인 

    @class jindo.m.DateValidator
    @invisible
    @extends jindo.m.Validator
    @group Component
    @keyword Date, DateValidator
**/
jindo.m.DateValidator = jindo.$Class({
	/** @lends jindo.m.DateValidator.prototype */
	/**
	 * @description 초기화 함수
	 * @constructs
	 */
	
	_isValid : function(sValue, sFormat) {
		sFormat = sFormat || "yyyy-mm-dd";
		sValue = sValue.replace(/[\.\-]/g,"");
		var sFormatData = sFormat.replace(/[\d\.\-]/g,""),
			nYear = sValue.substr(sFormatData.indexOf("yyyy"),4) * 1, 
			nMonth = sValue.substr(sFormatData.indexOf("mm"),2) * 1,
			nDay = sValue.substr(sFormatData.indexOf("dd"),2) * 1;
		//console.log("년도 : " + nYear + ":"+ nMonth + ":"+ nDay + "==" + sValue + "__" + sFormatData.length+ "__" + sValue.length);
		if((nMonth >= 1 && nMonth <= 12) && (nDay >= 1 && nDay <= 31) && (nYear >= 1000)) {
			return true;
		}
		return false;
	},
	
	_getCorrectedValue : function(sValue, sFormat) {
		sFormat = sFormat || "yyyy-mm-dd";
		var sFormatData = sFormat.replace(/[\d\.\-]/g,"");
		
		// 불필요한 문자 제거
		sValue = sValue.replace(/[^\d]/g,"").substr(0,sFormatData.length);
		if(sValue.length >= (sFormatData.length-1) ) {
			sValue = this._getFormatted(sValue, sFormat);
		}
		return sValue;
	},
	
	/**
	 * @description 입력 문자열을 지정한 date 포맷 값으로 변경.
	 * @param {String} sFormat 포맷 형식.
	 * @param {String} sDateStr 포맷 변경 문자열.
	 */
	_getFormatted : function(sDateStr, sFormat){
		var sFormatData = sFormat.replace(/[\.\-]/g,""),
			sYear = sDateStr.substr(sFormatData.indexOf("yyyy"),4),
			sMonth = sDateStr.substr(sFormatData.indexOf("mm"),2),
			sDay = sDateStr.substr(sFormatData.indexOf("dd"),2);
		return sFormat.replace(/(yyyy|mm|dd)/gi,
	        function($1){
	            switch ($1){
	                case 'yyyy': return sYear;
	                case 'mm': return sMonth;
	                case 'dd':   return sDay;
	            }
	        } 
	    );
	}
}).extend(jindo.m.Validator);