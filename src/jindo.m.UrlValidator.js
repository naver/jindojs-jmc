/**
    @fileOverview  UrlValidator 플러그인 
    @author "sculove"
    @version #__VERSION__#
    @since  2011. 11. 23.
    
**/
/**
   UrlValidator 플러그인 

    @class jindo.m.UrlValidator
    @invisible
    @extends jindo.m.Validator
    @group Component
    @keyword url, urlvalidator
**/
jindo.m.UrlValidator = jindo.$Class({
	/** @lends jindo.m.UrlValidator.prototype */
	/**
	 * @description 초기화 함수
	 * @constructs
	 */
	rx : /(^(http:\/\/)|^(https:\/\/)|(^[A-Za-z0-9\.\-]+))+([A-Za-z0-9\.\-])*(\.[A-Za-z]{2,}(\/([A-Za-z0-9\.\-])*)*)$/,

	/*
	 * @description 유효성 검증
	 * @param sValue 검증할 메일주소
	 */
	_isValid : function(sValue, sFormat) {
		if(this.rx.test(sValue)) {
			return true;
		} else {
			return false;
		}
	},	
	
	/* @description 유효문자로 변경
	 * @param sValue 검증할 메일주소
	 */
	_getCorrectedValue : function(sValue){
		return sValue.replace(/[^A-Za-z0-9-\?&\.\:\/]/g,"").replace(/\.{2,}/g,"").replace(/\?{2,}/g,"").replace(/&{2,}/g,"").replace(/\:{3,}/g,"");
	}	
}).extend(jindo.m.Validator);