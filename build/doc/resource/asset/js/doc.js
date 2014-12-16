/**
* @(#)common.js 2011. 10. 02.
*
* Copyright NHN Corp. All rights Reserved.
* NHN PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
*/
/**
* @author sculove
* @since 2011. 10. 02.
* @description 
*/
window.onload = function() {
	/* QR 코드 처리 소스 */
	var welQrBtn = jindo.$Element('qr_btn');
	var welQrView = jindo.$Element('QRView');
	var oQRCode = new jindo.QRCode(welQrView.$value(), {
		nWidth : 120,
		nHeight : 120,
		nCorrectLevel : jindo.QRCode.CorrectLevel.H
	});
	oQRCode.makeCode(document.URL);
	
	/* btn open/close attach */
	if(jindo.$("btnUITemplate") && jindo.$("btnComponent") && jindo.$("btnComingSoon") ) {
		jindo.$Fn(function(we) {
			we.stop();
			var wel = jindo.$Element(we.element);
			if( wel.hasClass("opn") ) {
				wel.removeClass("opn");
			} else {
				wel.addClass("opn");
			}
			if(wel.attr("id") === "btnUITemplate") {
				jindo.$Element("uitemplate").toggle();	
			} else if(wel.attr("id") === "btnComponent") {
				jindo.$Element("component").toggle();	
			} else {
				jindo.$Element("comingSoon").toggle();	
			}
		}, this).attach("btnUITemplate" , "click").attach("btnComponent" , "click").attach("btnComingSoon" , "click");
	}
	
	/* 선택 박스 지정 */
	var sTitle = jindo.$$.getSingle(".h_cont",jindo.$("content"));
	if(sTitle) {
		var sName = sTitle.innerHTML;
		sName = sName.substring(8);
		
		var aLinks = jindo.$$("#release li a");
		var sText, wel =  null;
		for(var nIdx in aLinks) {
			wel = jindo.$Element(aLinks[nIdx]);
			sText = jindo.$S(wel.text()).trim().$value();
			if(sText === sName) {
				wel.className("selected");
				break;
			}
		}
	}
	
	var elCustomEventTable = jindo.$$.getSingle("table.customevent");
	if (elCustomEventTable) {
		jindo.$Element(elCustomEventTable).delegate("click", "tr.title", function(we){
			var welNext = jindo.$Element(we.element).next();
			if (welNext.test("tr.desc")) {
				welNext.toggle();
			}
		});
	}
	
	var elMethodTable = jindo.$$.getSingle("table.method");
	if (elMethodTable) {
		jindo.$Element(elMethodTable).delegate("click", "tr.title", function(we){
			var welNext = jindo.$Element(we.element).next();
			if (welNext.test("tr.desc")) {
				welNext.toggle();
			}
		});
	}	
}