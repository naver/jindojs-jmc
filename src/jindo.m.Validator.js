/**
    @fileOverview  Validator 상위 클래스 
    @author "sculove"
    @version #__VERSION__#
    @since  2011. 11. 23.
    
**/
/**
   Validator 상위 클래스 

    @class jindo.m.Validator
    @invisible
    @keyword validator
    @group Component
**/
jindo.m.Validator = jindo.$Class({
	/** @lends jindo.m.Validator.prototype */
	/**
	 * @description 초기화 함수
	 * @constructs
	 */

	/**
	 * @description validate 한다.
	 * @return {HashTable}  {bValid, sCorrectedValue}
	 */	
	validate : function(sValue, sFormat) {
		var sCorrectedValue = this._getCorrectedValue(sValue, sFormat),
			htResult = {
				bValid : this._isValid(sCorrectedValue, sFormat),
				sCorrectedValue : null
			};
		if(sCorrectedValue !== sValue) {
			htResult.sCorrectedValue = sCorrectedValue;
		} 
		return htResult;
	}
});
