/** 
 * Module의 setup과 teardown은 각 테스트 마다 호출됨 
 */
module("jindo.m.Dialog 클래스", {
	setup : function() {
		// 객체 생성 
		var aTemplate = [];
		aTemplate.push('<div class="u_dsc u_dsc_n" style="background-color:white;border:2px solid #777777;">');
		aTemplate.push('<button type="button" class="dialog-close guioHeaderClose"><img src="../../../sample/im/btn_close.gif" width="18" height="18" alt="닫기"></button>');
		aTemplate.push('<h2 class="uc_h">{=text}</h2>');
		aTemplate.push('<div class="uc_area">');
		aTemplate.push('<a href="#" class="u_btn dialog-confirm" onClick="return false;"><span class="uc_ico_ck">확인</span></a> ');
		aTemplate.push('<a href="#" class="u_btn dialog-cancel" onClick="return false;">취소</a>');
		aTemplate.push('</div>');
		aTemplate.push('</div>');
		sTemplate = aTemplate.join("");

		oDialog = new jindo.m.Dialog();
		//oDialog.setTemplate(sTemplate);
	},
	teardown : function() {
		// 객체 소멸 
		oDialog.destroy();
		oDialog = null;
		sTemplate = null;
	}
});

asyncTest("show() / hide()", function() {
	oDialog.setTemplate(sTemplate);
	oDialog.show({text : "new jindo.m.Dialog();"});
	
	setTimeout(function(){
		ok(oDialog.isShown(), "show() 메소드를 수행하면 레이어가 보인다.");
		oDialog.hide();
		//stop();
			setTimeout(function(){
				ok(!oDialog.isShown(), "hide() 메소드를 수행하면 레이어가 보이지 않는다.");
				oDialog.hide();
				start();
			}, 1000);
	}, 1000);
});


asyncTest("show() & 확인버튼 클릭", function(){
	oDialog.setTemplate(sTemplate);
	ok(!oDialog.isShown(), "show() 수행전에는 레이어가 보이지 않는다. (isShow() 메소드가 false를 리턴한다.)");
	
	var sClickedButton = null;
	oDialog.show({text : "<strong class=\"uc_st\">확인</strong>하시겠습니까?"}, {
		confirm : function(e) {
			sClickedButton = "confirm";
		}
	});
	
	equal(sClickedButton, null, "confirm callback 수행전에 sClickedButton는  null값을 가진다.");
	
	setTimeout(function(){
		var welConfirm = jindo.$Element(jindo.$$.getSingle(".dialog-confirm", oDialog.getDialog()));
		welConfirm.fireEvent('click');
		equal(sClickedButton, "confirm", "confirm callback 수행후에 sClickedButton는  \"confirm\"값을 가진다.");
		setTimeout(function(){
			ok(!oDialog.isShown(), "확인버튼 클릭 후에는 레이어가 보이지 않는다.");
			start();
		}, 1000);
	}, 1000);
});

asyncTest("show() & 취소버튼 클릭", function(){
	oDialog.setTemplate(sTemplate);
	ok(!oDialog.isShown(), "show() 수행전에는 레이어가 보이지 않는다. (isShow() 메소드가 false를 리턴한다.)");
	
	var sClickedButton = null;
	oDialog.show({text : "<strong class=\"uc_st\">취소</strong>하시겠습니까?"}, {
		cancel : function(e) {
			sClickedButton = "cancel";
		}
	});
	
	equal(sClickedButton, null, "cancel callback 수행전에 sClickedButton는  null값을 가진다.");
	
	setTimeout(function(){
		jindo.$Element(jindo.$$.getSingle(".dialog-cancel", oDialog.getDialog())).fireEvent("click");
		equal(sClickedButton, "cancel", "cancel callback 수행후에 sClickedButton는  \"cancel\"값을 가진다.");
		setTimeout(function(){
			ok(!oDialog.isShown(), "취소버튼 클릭 후에는 레이어가 보이지 않는다.");
			start();
		}, 1000);
	}, 1000);
});

asyncTest("show() & 닫기버튼 클릭", function(){
	oDialog.setTemplate(sTemplate);
	ok(!oDialog.isShown(), "show() 수행전에는 레이어가 보이지 않는다. (isShow() 메소드가 false를 리턴한다.)");
	
	var sClickedButton = null;
	oDialog.show({text : "<strong class=\"uc_st\">닫기</strong>하시겠습니까?"}, {
		close : function(e) {
			sClickedButton = "close";
		}
	});
	
	equal(sClickedButton, null, "close callback 수행전에 sClickedButton는  null값을 가진다.");
	
	setTimeout(function(){
		jindo.$Element(jindo.$$.getSingle(".dialog-close", oDialog.getDialog())).fireEvent("click");
		equal(sClickedButton, "close", "close callback 수행후에 sClickedButton는  \"close\"값을 가진다.");
		setTimeout(function(){
			ok(!oDialog.isShown(), "닫기버튼 클릭 후에는 레이어가 보이지 않는다.");
			start();
		}, 1000);
	}, 1000);
});


asyncTest("beforeShow callback & show callback & beforeHide callback & hide callback", function(){
	oDialog.setTemplate(sTemplate);
	ok(!oDialog.isShown(), "show() 수행전에는 레이어가 보이지 않는다. (isShow() 메소드가 false를 리턴한다.)");
	
	equal(sLayerStatus, null, "beforeShow callback 수행전에 sLayerStatus은  null값을 가진다.");
	
	var sLayerStatus = null;
	oDialog.show({text : "<strong class=\"uc_st\">약속</strong>을 삭제하시겠습니까?"}, {
		beforeShow : function(e) {
			sLayerStatus = "beforeShow";
			equal(sLayerStatus, "beforeShow", "beforeShow callback 수행후에 sLayerStatus는  \"beforeShow\"값을 가진다.");
		},
		show : function(e) {
			sLayerStatus = "show";
			equal(sLayerStatus, "show", "show callback 수행후에 sLayerStatus는  \"show\"값을 가진다.");
		},
		beforeHide : function(e) {
			sLayerStatus = "beforeHide";
			equal(sLayerStatus, "beforeHide", "beforeHide callback 수행후에 sLayerStatus는  \"beforeHide\"값을 가진다.");
		},
		hide : function(e) {
			sLayerStatus = "hide";
			equal(sLayerStatus, "hide", "hide callback 수행후에 sLayerStatus는  \"hide\"값을 가진다.");
		}
	});
	
	setTimeout(function(){
		ok(oDialog.isShown(), "show() 메소드를 수행하면 레이어가 보인다.");
		oDialog.hide();
			setTimeout(function(){
				ok(!oDialog.isShown(), "hide() 메소드를 수행하면 레이어가 보이지 않는다.");
				oDialog.hide();
				start();
			}, 1000);
	}, 1000);
});

test("_setWrapperElement()", function() {
	ok(oDialog._htWElement["dialog_container"].hasClass("dialog-container") , "_setWrapperElement() 메소드를 수행하면 oDialog._htWElement['dialog_container']이 초기화된다.");
	ok(oDialog._htWElement["dialog_foggy"].hasClass("dialog-fog") , "_setWrapperElement() 메소드를 수행하면 oDialog._htWElement['dialog_foggy']이 초기화된다.");
	ok(oDialog._htWElement["dialog_layer"].hasClass("dialog-layer") , "_setWrapperElement() 메소드를 수행하면 oDialog._htWElement['dialog_layer']이 초기화된다.");
	ok(oDialog._htWElement["dialog_clone"].hasClass("dialog-clone") , "_setWrapperElement() 메소드를 수행하면 oDialog._htWElement['dialog_clone']이 초기화된다.");
});

test("_initVar()", function() {
	equal(oDialog._htDialogSize["width"], 0, "_initVar() 메소드를 수행하면 oDialog._htDialogSize['width']이 초기화된다.");
	equal(oDialog._sTemplate, null, "_initVar() 메소드를 수행하면 oDialog._sTemplate이 초기화된다.");
	equal(oDialog._bProcessingShow, false, "_initVar() 메소드를 수행하면 oDialog._bProcessingShow가 초기화된다.");
	equal(oDialog._bProcessingHide, false, "_initVar() 메소드를 수행하면 oDialog._bProcessingHide가 초기화된다.");
	
	jindo.m.getDeviceInfo = function() {
		var info = {};
		info.iphone = true;
		info.ipad = false;
		info.android = false;
		return info;
	}
	oDialog._initVar();
	equal(oDialog._bIOS, true, "단말기가 iphoned일 경우 _initVar() 메소드를 수행하면  oDialog._bIOS가 true로 초기화된다.");
	equal(oDialog._bAndroid, false, "단말기가 iphoned일 경우 _initVar() 메소드를 수행하면  oDialog._bAndroid가 false로 초기화된다.");
	
	jindo.m.getDeviceInfo = function() {
		var info = {};
		info.iphone = false;
		info.ipad = true;
		info.android = false;
		return info;
	}
	oDialog._initVar();
	equal(oDialog._bIOS, true, "단말기가 ipad일 경우 _initVar() 메소드를 수행하면  oDialog._bIOS가 true값으로 초기화된다.");
	equal(oDialog._bAndroid, false, "단말기가 iphoned일 경우 _initVar() 메소드를 수행하면  oDialog._bAndroid가 false로 초기화된다.");
	
	jindo.m.getDeviceInfo = function() {
		var info = {};
		info.iphone = false;
		info.ipad = false;
		info.android = true;
		return info;
	}
	oDialog._initVar();
	equal(oDialog._bIOS, false, "단말기가 android일 경우 _initVar() 메소드를 수행하면  oDialog._bIOS가 false값으로 초기화된다.");
	equal(oDialog._bAndroid, true, "단말기가 iphoned일 경우 _initVar() 메소드를 수행하면  oDialog._bAndroid가 true로 초기화된다.");
});

test("_setDeviceSize()", function() {
	ok(oDialog._htDeviceSize,"_setDeviceSize()메소드를 수행하면 디바이스의 가로세로 사이즈가 oDialog._htDeviceSize에 세팅된다.");
	ok(oDialog._htDeviceSize.width,"oDialog._htDeviceSize는 width값을 갖는다.");
	ok(oDialog._htDeviceSize.height, "oDialog._htDeviceSize는 height값을 갖는다.");
	equal(oDialog._htDeviceSize.width, jindo.$Document().clientSize().width, "모바일이 아닐경우 oDialog._htDeviceSize.width는 jindo.$Document().clientSize().width값을 갖는다.");
	equal(oDialog._htDeviceSize.height, jindo.$Document().clientSize().height, "모바일이 아닐경우 oDialog._htDeviceSize.height는 jindo.$Document().clientSize().height값을 갖는다.");
	
	oDialog._bIOS = true;
	oDialog._setDeviceSize();
	equal(oDialog._htDeviceSize.width, jindo.$Document().clientSize().width, "iOS일 경우 oDialog._htDeviceSize.width는 jindo.$Document().clientSize().width값을 갖는다.");
	equal(oDialog._htDeviceSize.height, jindo.$Document().clientSize().height, "iOS일 경우 oDialog._htDeviceSize.height는 jindo.$Document().clientSize().height값을 갖는다.");
	
	oDialog._bAndroid = true;
	oDialog._htDeviceInfo.version == "2.1";
	oDialog._setDeviceSize();
	equal(oDialog._htDeviceSize.width, jindo.$Document().clientSize().width, "안드로이드 2.1일 경우 oDialog._htDeviceSize.width는 jindo.$Document().clientSize().width값을 갖는다.");
	equal(oDialog._htDeviceSize.height, jindo.$Document().clientSize().height, "안드로이드 2.1일 경우 oDialog._htDeviceSize.height는 jindo.$Document().clientSize().height값을 갖는다.");
});

test("_initContainerTop()", function() {
	equal(oDialog._htWElement["dialog_container"].css("top"), "0px", "sEffectType이 \"slide-up\" or \"slide-down\"가 아닐 경우 oDialog._htWElement[\"dialog_container\"]는 top:0px로 초기화된다.");
	
	oDialog.option("sEffectType", "slide-up");
	oDialog._initContainerTop();
	equal(oDialog._htWElement["dialog_container"].css("top"), oDialog._htDeviceSize.height+"px", "sEffectType이 \"slide-up\"일 경우 oDialog._htWElement[\"dialog_container\"]는 화면 하단에 위치한다.");

	oDialog.option("sEffectType", "slide-down");
	oDialog._initContainerTop();
	equal(oDialog._htWElement["dialog_container"].css("top"), (oDialog._htDeviceSize.height * -1)+"px", "sEffectType이 \"slide-down\"일 경우 oDialog._htWElement[\"dialog_container\"]는 화면 상단에 위치한다.");
	
//	document.body.scrollTop = 100;
//	window.pageYOffset = 100;
//	oDialog._initContainerTop();
//	equal(oDialog._htWElement["dialog_container"].css("top"), (oDialog._htDeviceSize.height * -1) + 100 +"px", "sEffectType이 \"slide-down\"일 경우 oDialog._htWElement[\"dialog_container\"]는 화면 상단에 위치한다.");
	
});

test("_initElement()", function() {
	var elContainer = oDialog._htWElement["dialog_container"].$value(); 
	equal(oDialog._htWElement["dialog_foggy"].$value(), jindo.cssquery.getSingle(".dialog-fog", elContainer), "_initElement()메소드를 수행하면 oDialog._htWElement['dialog_foggy']가 container에 append된다.");
	
	equal(oDialog._htWElement["dialog_layer"].$value(), jindo.cssquery.getSingle(".dialog-layer", elContainer), "_initElement()메소드를 수행하면 oDialog._htWElement['dialog_layer']가 container에 append된다.");
	
	equal(oDialog._htWElement["dialog_container"].$value(), jindo.cssquery.getSingle(".dialog-container", document.body), "_initElement()메소드를 수행하면 oDialog._htWElement['dialog_container']가 body에 append된다.");
	equal(oDialog._htWElement["dialog_container"].visible(), false, "_initElement()메소드를 수행하면 oDialog._htWElement['dialog_container']가 hide된 상태로 초기화된다.");
	
	equal(oDialog._htWElement["dialog_clone"].$value(), jindo.cssquery.getSingle(".dialog-clone", document.body), "_initElement()메소드를 수행하면 oDialog._htWElement['dialog_clone']가 body에 append된다.");
	equal(oDialog._htWElement["dialog_clone"].visible(), false, "_initElement()메소드를 수행하면 oDialog._htWElement['dialog_clone']가 hide된 상태로 초기화된다.");
	oDialog._htWElement["dialog_clone"].show();
	equal(oDialog._htWElement["dialog_clone"].offset().top, -1000, "_initElement()메소드를 수행하면 oDialog._htWElement['dialog_clone']가 top:-1000 상태로 초기화된다.");
	equal(oDialog._htWElement["dialog_clone"].offset().left, -1000, "_initElement()메소드를 수행하면 oDialog._htWElement['dialog_clone']가 left:-1000 상태로 초기화된다.");
	
	ok(oDialog._oLayerEffect instanceof jindo.m.LayerEffect, "bUseEffect:true일때 _initElement()메소드를 수행하면 jindo.m.LayerEffect 인스턴스가 생성된다.");
	oDialog.destroy();
	oDialog = null;
	oDialog = new jindo.m.Dialog({"bUseEffect" : false});
	equal(typeof oDialog._oLayerEffect, "undefined", "bUseEffect:false일때  _initElement()메소드를 수행하면 jindo.m.LayerEffect 인스턴스가 생성되지 않는다.");
});

test("_getLayerEffect()", function() {
	ok(oDialog._getLayerEffect() instanceof jindo.m.LayerEffect, "_getLayerEffect() 메소드는 내부에서 생성된 jindo.m.LayerEffect 인스턴스를 리턴한다.");
});

test("_getContainer()", function() {
	equal(oDialog._getContainer(), oDialog._htWElement["dialog_container"].$value(), "_getContainer() 메소드는 dialog_container 엘리먼트를 반환한다.");
});

test("_getFoggy()", function() {
	equal(oDialog._getFoggy(), oDialog._htWElement["dialog_foggy"].$value(), "_getFoggy() 메소드는 dialog_foggy 엘리먼트를 반환한다.");
});

test("getDialog()", function() {
	equal(oDialog.getDialog(), oDialog._htWElement["dialog_layer"].$value(), "getDialog() 메소드는 dialog_layer 엘리먼트를 반환한다.");
});

test("setTemplate() / getTemplate()", function() {
	oDialog.setTemplate("<strong>{=text}</strong>");
	equal(oDialog.getTemplate(), "<strong>{=text}</strong>", "getTemplate()는 설정된 레이어 템플릿 문자열을 반환한다.");
});

test("_getDialogPosition()", function() {
	var nWidth = oDialog._htDeviceSize.width;
	var nHeight = oDialog._htDeviceSize.height;
	var nLayerWidth = oDialog._getDialogSize().width;
	var nLayerHeight = oDialog._getDialogSize().height;
	
	var htLayerPosition = oDialog._getDialogPosition();
	equal(htLayerPosition.top, parseInt((nHeight - nLayerHeight) / 2, 10), "_getDialogPosition() 메소드는 oDialog.option(\"sPosition\")에 따른  Dialog의 위치를 계산한다.");
	equal(htLayerPosition.left, parseInt((nWidth - nLayerWidth) / 2, 10), "_getDialogPosition() 메소드는 oDialog.option(\"sPosition\")에 따른  Dialog의 위치를 계산한다.");
	
	oDialog.setPosition("top");
	htLayerPosition = oDialog._getDialogPosition();
	equal(htLayerPosition.top, 0, "_getDialogPosition() 메소드는 oDialog.option(\"sPosition\")에 따른  Dialog의 위치를 계산한다.");
	equal(htLayerPosition.left, parseInt((nWidth - nLayerWidth) / 2, 10), "_getDialogPosition() 메소드는 oDialog.option(\"sPosition\")에 따른  Dialog의 위치를 계산한다.");
	
	oDialog.setPosition("bottom");
	htLayerPosition = oDialog._getDialogPosition();
	equal(htLayerPosition.top,  parseInt(nHeight - nLayerHeight,10), "_getDialogPosition() 메소드는 oDialog.option(\"sPosition\")에 따른  Dialog의 위치를 계산한다.");
	equal(htLayerPosition.left, parseInt((nWidth - nLayerWidth) / 2, 10), "_getDialogPosition() 메소드는 oDialog.option(\"sPosition\")에 따른  Dialog의 위치를 계산한다.");
	
	oDialog.setPosition("all");
	htLayerPosition = oDialog._getDialogPosition();
	equal(htLayerPosition.top, 0, "_getDialogPosition() 메소드는 oDialog.option(\"sPosition\")에 따른  Dialog의 위치를 계산한다.");
	equal(htLayerPosition.left, 0, "_getDialogPosition() 메소드는 oDialog.option(\"sPosition\")에 따른  Dialog의 위치를 계산한다.");
});

test("setPosition()", function() {
	oDialog.setPosition("top");
	equal(oDialog.option("sPosition"), "top", "setPosition() 메소드는 option(\"sPosition\")값을 설정한다.");
	oDialog.setPosition("center");
	equal(oDialog.option("sPosition"), "center", "setPosition() 메소드는 option(\"sPosition\")값을 설정한다.");
	oDialog.setPosition("bottom");
	equal(oDialog.option("sPosition"), "bottom", "setPosition() 메소드는 option(\"sPosition\")값을 설정한다.");
	oDialog.setPosition("all");
	equal(oDialog.option("sPosition"), "all", "setPosition() 메소드는 option(\"sPosition\")값을 설정한다.");
	oDialog.setPosition("test");
	equal(oDialog.option("sPosition"), "all", "all/top/center/bottom외의 값으로 설정할 경우 option(\"sPosition\")값은 설정되지 " +
			"않는다. (기존값 유지)");
});

test("_getLayerEffect()", function() {
	ok(oDialog._getLayerEffect() instanceof jindo.m.LayerEffect, "_getLayerEffect() 메소드는 내부에서 생성된 jindo.m.LayerEffect 인스턴스를 리턴한다.");
});


test("useEffect() / unuseEffect()", function() {
	oDialog.unuseEffect();
	equal(oDialog.option("bUseEffect"), false, "unuseEffect() 메소드는 option(\"bUseEffect\")값을 false로 설정한다.");
	oDialog.useEffect();
	equal(oDialog.option("bUseEffect"), true, "useEffect() 메소드는 option(\"bUseEffect\")값을 true로 설정한다.");
});

test("setEffectType()", function() {
	oDialog.setEffectType("slide-up");
	equal(oDialog.option("sEffectType"), "slide-up", "setEffectType() 메소드는 option(\"sEffectType\")값을 설정한다.");
	oDialog.setEffectType("slide-down");
	equal(oDialog.option("sEffectType"), "slide-down", "setEffectType() 메소드는 option(\"sEffectType\")값을 설정한다.");
	oDialog.setEffectType("flip");
	equal(oDialog.option("sEffectType"), "flip", "setEffectType() 메소드는 option(\"sEffectType\")값을 설정한다.");
	oDialog.setEffectType("pop");
	equal(oDialog.option("sEffectType"), "pop", "setEffectType() 메소드는 option(\"sEffectType\")값을 설정한다.");
	oDialog.setEffectType("test");
	equal(oDialog.option("sEffectType"), "pop", "pop/slide-up/slide-down/flip외의 값으로 설정할 경우 option(\"sEffectType\")값은 설정되지 않는다. (기존값 유지)");
});

test("setEffectDuration()", function() {
	oDialog.setEffectDuration(1000);
	equal(oDialog.option("nEffectDuration"), 1000, "setEffectDuration() 메소드는 option(\"nEffectDuration\")값을 설정한다.");
	oDialog.setEffectDuration(0);
	equal(oDialog.option("nEffectDuration"), 1000, "nEffectDuration이 100보다 작은 값이 올 경우 option(\"nEffectDuration\")값은 설정되지 않는다. (기존값 유지)");
	oDialog.setEffectDuration(-100);
	equal(oDialog.option("nEffectDuration"), 1000, "nEffectDuration이 100보다 작은 값이 올 경우 option(\"nEffectDuration\")값은 설정되지 않는다. (기존값 유지)");
	oDialog.setEffectDuration(99);
	equal(oDialog.option("nEffectDuration"), 1000, "nEffectDuration이 100보다 작은 값이 올 경우 option(\"nEffectDuration\")값은 설정되지 않는다. (기존값 유지)");
});

test("setEffect()", function() {
	oDialog.setEffect({"type" : "slide-up", "duration" : 1000});
	equal(oDialog.option("sEffectType"), "slide-up", "setEffect() 메소드는 option(\"sEffectType\")값을 설정한다.");
	equal(oDialog.option("nEffectDuration"), 1000, "setEffectDuration() 메소드는 option(\"nEffectDuration\")값을 설정한다.");
	oDialog.setEffect({"type" : "slide-down"});
	equal(oDialog.option("sEffectType"), "slide-down", "setEffect() 메소드는 option(\"sEffectType\")값을 설정한다.");
	equal(oDialog.option("nEffectDuration"), 1000, "duration을 설정하지 않을경우 option(\"sEffectType\")값만 설정된다. (option(\"nEffectDuration\") 기존값 유지)");
	oDialog.setEffect({"duration" : 500});
	equal(oDialog.option("sEffectType"), "slide-down", "type을 설정하지 않을경우 option(\"nEffectDuration\")값만 설정된다. (option(\"sEffectType\") 기존값 유지)");
	equal(oDialog.option("nEffectDuration"), 500, "setEffectDuration() 메소드는 option(\"nEffectDuration\")값을 설정한다.");
});

test("isShown()", function() {
	equal(oDialog.isShown(), oDialog._bIsShown, "isShown() 메소드는 oDialog._bIsShown값을 리턴한다.");
});


