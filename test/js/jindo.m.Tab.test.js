/**
* @(#)jindo.m.Tab2.test.js 2011. 8. 25.
*
* Copyright NHN Corp. All rights Reserved.
* NHN PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
*/
/**
* @author sshyun
* @since 2011. 8. 25.
* @description 
*/
var sSelectEvent, sBeforeEvent;;
module("Tab Test", {
	setup: function() {
		/** 객체 생성 */
		oTab = new jindo.m.Tab("tabComponent");
		sSelectEvent = "";
		sBeforeEvent = "";
	},
	teardown : function() {
		/** 객체 소멸 */
		oTab.destroy();
		oTab = null;
	}
});

test("jindo.m.Tab 인스턴스 테스트", function() {	
	equal((oTab instanceof jindo.m.Tab), true, "jindo.m.Tab 인스턴스 생성.");
	var nPanel = oTab.getPanel().length;
	var nTab = oTab.getTab().length;
	
	equal(nTab, 3, "Tab은 3개");
	equal(nPanel, 3, "페이지는 3개");	
});

test("Tab 선택 테스트", function() {
	var nCurrentIdx = oTab.getCurrentIndex();
	equal(nCurrentIdx, 0, "현재 선택 인덱스는 0");
	var welTab = oTab.getTab(2);	
	welTab.fireEvent("click");
	var welPanel = oTab.getPanel(2);
	
	nCurrentIdx = oTab.getCurrentIndex();
	equal(nCurrentIdx, 2, "현재 선택 인덱스는 2");
	equal(welPanel.visible(), true, "선택 페이지 보임");
});

test("Tab 선택 Custom 이벤트 테스트", function() {
	oTab.attach("beforeSelect",function(){
		sBeforeEvent = "on";
	}).attach("select",function(){
		sSelectEvent = "on";
	});
	var nCurrentIdx = oTab.getCurrentIndex();
	equal(nCurrentIdx, 0, "현재 선택 인덱스는 0");
	var welTab = oTab.getTab(2);	
	welTab.fireEvent("click");
	var welPanel = oTab.getPanel(2);
	
	nCurrentIdx = oTab.getCurrentIndex();
	equal(nCurrentIdx, 2, "현재 선택 인덱스는 2");
	
	equal(sBeforeEvent, "on", "beforeEvent 호출");
	equal(sSelectEvent, "on", "select 이벤트 호출");
});


test("jindo.m.Tab 인스턴스 테스트", function() {	
	oTab.destroy();
	oTab = new jindo.m.Tab("tabComponent", {
		nCountOnList : 2,
		// nPanelDuration : 100
    	sMoreText : "더보기"
	});

	equal((oTab instanceof jindo.m.Tab), true, "jindo.m.Tab 더보기 인스턴스 생성.");
	equal(oTab._htWElement["more_tab"] != null , true, " 더보기 객체 생성");
	var nPanel = oTab.getPanel().length;
	var nTab = oTab.getTab().length;
	
	equal(nTab, 3, "Tab은 3개");
	equal(nPanel, 3, "페이지는 3개");	
});


