/**
* @(#)common.js 2011. 10.04
*
* Copyright NHN Corp. All rights Reserved.
* NHN PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
*/
/**
* @author oyang2, icebelle
* @since 2011. 10. 04.
* @description
*/

var welConsole;
window.__message_index_value__ = 1;

/* AddLog 처리 */
window.addConsole = function(s){
	welConsole = jindo.$Element('txtConsole');
	var sText = welConsole.text();
	sText = sText + "\n" + "[" + window.__message_index_value__++ + "] " + s;

	welConsole.text(sText);
	welConsole.$value().scrollTop = welConsole.$value().scrollHeight;
}


jindo.$Fn(function(){
    /* DeleteLog 처리 */
    var welConDel = jindo.$Element('delConsole');
    welConsole = jindo.$Element('txtConsole');
    if(welConDel){
        welConDel.css("margin-top", "-30px");
        jindo.$Fn(function(evt){
            evt.stop();
            welConsole.text('');
            window.__message_index_value__ = 1;
        }).attach(welConDel.$value(),'click');
    }

    if(welConsole) {
        welConsole.attr("disabled", true);
    }
    /* 이전 버튼에 대한 처리 */
    var elGoBack = jindo.$$.getSingle('#hd a._prev');
    if(elGoBack){
        jindo.$Fn(function(evt){
            evt.stop();
            history.back();
        }).attach(elGoBack, 'click');
    }

    /* ViewSource 처리 */
    var elCode = jindo.$('view_source');
    var welCode = jindo.$Element(jindo.$$.getSingle('._view_code', elCode));
    var welStatus = jindo.$Element(jindo.$$.getSingle('._view_status', elCode));
    if(elCode){
        jindo.$Fn(function(evt){
            evt.stop();
            welCode.toggle();
            welStatus.toggleClass("vs_on", "vs");
        },this).attach(elCode,'click');
    }
},this).attach(window,'load');
