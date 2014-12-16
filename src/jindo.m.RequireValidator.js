/**
    @fileOverview  RequireValidator 플러그인 
    @author "sculove"
    @version #__VERSION__#
    @since  2011. 11. 23.
    
**/
/**
   RequireValidator 플러그인 

    @class jindo.m.RequireValidator
    @invisible
    @extends jindo.m.Validator
    @group Component
    @keyword Require, RequireValidator
**/
jindo.m.RequireValidator = jindo.$Class({
	/** @lends jindo.m.RequireValidator.prototype */
	/**
	 * @description 초기화 함수
	 * @constructs
	 */
	/**
	 * @description validate 한다.
	 * @return {HashTable}  {bValid, sPreValue, sType, sCorrectedValue}
	 */	
	validate : function(sValue) {
		sValue = jindo.$S(sValue).trim().toString();
		var htResult = {
			bValid : false,
			sCorrectedValue : null
		};
		htResult.bValid = (sValue != "" ? true : false);
		return htResult;
	}
}).extend(jindo.m.Validator);