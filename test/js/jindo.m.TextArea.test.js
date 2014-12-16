/**
* @(#)jindo.m.TextArea.test.js 2011. 9. 28.
*
* Copyright NHN Corp. All rights Reserved.
* NHN PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
*/
/**
* @author sshyun
* @since 2011. 9. 28.
* @description 
*/

module("TextArea Basic Test", {
	setup: function() {		
		oTextArea = new jindo.m.TextArea("textarea",{bUseRadius : true, nMaxHeight : 100, bUseAutoHeight : true});
		nTaHeight = jindo.$Element("textarea").height();
		
	},
	teardown : function() {
		/** 객체 소멸 */
		oTextArea.deleteValue();
		oTextArea.destroy();
		oTextArea = null;		
		jindo.$Element("textarea").height(nTaHeight);
	}
});

test("jindo.m.TextArea 인스턴스 테스트", function() {	
	equal((oTextArea instanceof jindo.m.TextArea), true, "jindo.m.TextArea 인스턴스 생성.");		
});

test("jindo.m.TextArea focus / blur 테스트", function() {
	var welTextArea = jindo.$Element("textarea");
	
	welTextArea.$value().focus();	
	equal((welTextArea.hasClass("fta-textarea-focus")), true, "focus 시 fta-focus 클래스 삽입.");
	welTextArea.$value().blur();	
	equal((welTextArea.hasClass("fta-textarea-focus")), false, "blur 시 fta-focus 클래스 제거.");
	
});

test("jindo.m.TextArea 활성화 / 비활성화  테스트", function() {
	var welTextArea = jindo.$Element("textarea");
	oTextArea.disable();	
	equal((welTextArea.hasClass("fta-textarea-disable")), true, "disable시  fta_disable 클래스 삽입");
	equal(welTextArea.$value().disabled, true, "disable시  textarea 비활성화");
	
	oTextArea.enable();
	
	equal((welTextArea.hasClass("fta-textarea-disable")), false, "enable 시 fta_disable 클래스 제거.");
	equal(welTextArea.$value().disabled, false, "enable시  textarea 활성화");
	
});

test("jindo.m.TextArea 입력 확장 테스트", function() {
	var welTextArea = jindo.$Element("textarea");	
	welTextArea.$value().focus();	
	welTextArea.$value().value = "tes\n\r test\n\r test\n\r테스\n\r테스트... 으마하하\n\r테스";
	setTimeout(function(){		
		if(jindo.m.getDeviceInfo().android || parseInt(jindo.m.getDeviceInfo().version,10) !== 3) {
		    welTextArea.fireEvent("input");
			equal((jindo.$Element("textarea").height() > nTaHeight), true, "글자 입력후 높이값 변화.");		
		}
		oTextArea.deleteValue();
		equal(oTextArea.getValue(), "", "Clear 후 값 확인.");		
		start();
	},100);	
	stop();
});

test("jindo.m.TextArea Max Height 확장 테스트", function() {
	var welTextArea = jindo.$Element("textarea");
	
	oTextArea.setValue("test\n test\n test\n test\n test\n test\n");
	welTextArea.fireEvent("input");	
	setTimeout(function(){		
		equal(jindo.$Element("textarea").height(), 102, "여러줄 입력후 Max 높이값 확인.");		
		welTextArea.$value().blur();
		start();
	},100);	
	stop();
});


test("jindo.m.TextArea 입력 Expand Height 변경 테스트", function() {
	var nExpandHeight = oTextArea.getExpandHeight();
	equal(nExpandHeight, 30, "확장 단위 높이 30px");
	oTextArea.setExpandHeight(50);
	nExpandHeight = oTextArea.getExpandHeight();
	equal(nExpandHeight, 50, "확장 단위 높이 50px");
});

test("jindo.m.TextArea 입력 Max Height 변경 테스트", function() {
	var nMaxHeight = oTextArea.getMaxHeight();
	equal(nMaxHeight, 100, "최대 높이값 100px");
	oTextArea.setMaxHeight(150);
	nMaxHeight = oTextArea.getMaxHeight();
	equal(nMaxHeight, 150, "최대 높이값 150px");
});

