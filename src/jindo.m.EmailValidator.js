/**
    @fileOverview  Email Validator 플러그인 
    @author "sculove"
    @version #__VERSION__#
    @since  2011. 11. 23.
    
**/
/**
   Email Validator 플러그인 

    @class jindo.m.EmailValidator
    @invisible
    @extends jindo.m.Validator
    @group Component
    @keyword Email, EmailValidator
**/
jindo.m.EmailValidator = jindo.$Class({
	/** @lends jindo.m.EmailValidator.prototype */
	/**
	 * @description 초기화 함수
	 * @constructs
	 */
	rx : /^(([\w\-]+\.)+[\w\-]+|([a-zA-Z]{1}|[\w\-]{2,}))@((([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\.([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\.([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\.([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])){1}|([a-zA-Z]+[\w\-]+\.)+[a-zA-Z]{2,4})$/,
	
	/**
	 * @description 유효성 검증
	 * @param sValue 검증할 메일주소
	 */
	_isValid : function(sValue) {
		if(this.rx.test(sValue)) {
			return true;
		} else {
			return false;
		}
	},	
	
 	/**
	 * @description 유효문자로 변경
	 * @param sValue 검증할 메일주소
	 */
	_getCorrectedValue : function(sValue){
		sValue = sValue.replace(/[^\w\.\@]/g,"").replace(/\.{2,}/g,".");
		var aEmail = sValue.split("@");
		if(aEmail.length > 2) {
			sValue = aEmail.shift() + "@" + aEmail.join("");
		}
		return sValue;
	}	
}).extend(jindo.m.Validator);