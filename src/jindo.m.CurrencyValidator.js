/**
    @fileOverview  Currency Validator 플러그인 
    @author "sculove"
    @version #__VERSION__#
    @since  2011. 12. 24.
    
**/
/**
   Currency Validator 플러그인 

    @class jindo.m.CurrencyValidator
    @invisible
    @extends jindo.m.NumberValidator
    @group Component
    @keyword Currency, CurrencyValidator
**/
jindo.m.CurrencyValidator = jindo.$Class({
	/** @lends jindo.m.CurrencyValidator.prototype */
	/**
	 * @description 초기화 함수
	 * @constructs
	 */
	rx :  /^[+\-]?[^\s\t\v\d]+(\d{1,3},)?(\d{3},)*(\d)+(\.\d+)?$/,
	
	_getCorrectedValue : function(sValue, sFormat) {
		// 숫자 형식 필터링, 콤마적용 
		sValue = this._applyComma(this._filterNumber(sValue));
		sFormat = sFormat || "\\";
		sValue = ( sValue.charAt(0) === "-" ?  "-" + sFormat + sValue.substring(1) : sFormat + sValue ); 
		return sValue;
	}

}).extend(jindo.m.NumberValidator);