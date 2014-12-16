/**
* @(#)jindo.m.Datepicker.test.js 2011. 9. 29.
*
* Copyright NHN Corp. All rights Reserved.
* NHN PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
*/
/**
* @author sshyun
* @since 2011. 9. 29.
* @description 
*/
var isMobile = (jindo.$Agent().navigator().mobile || jindo.$Agent().os().ipad); 
var sClickEvent = (jindo.$Agent().navigator().mobile) ? "touchstart" : "click";

module("Datepicker Module Test", {
	setup: function() {		
		oDatepicker = new jindo.m.Datepicker("calendar");
		oDatepicker.addDatePickerSet("datepicker");
	},
	teardown : function() {
		/** 객체 소멸 */
		oDatepicker.deleteDate("datepicker");
		oDatepicker.removeDatePickerSet("datepicker");
		oDatepicker.destroy();
		document.body.appendChild(jindo.$Element("calendar").$value());		
		jindo.$Element("datepicker").parent().replace(jindo.$('<input type="text" id="datepicker" class="date_input"/>'));
	}
});
test("jindo.m.Datepicker Calendar 기본동작 테스트", function() {
	var elInput = jindo.$("datepicker");
	var welCalendar = jindo.$Element("calendar");	
	elInput.focus();
	equal((welCalendar.$value().style.display != "none"), true, "focus시 Calendar 가 노출됨.");
	oDatepicker.hide();
	equal((welCalendar.$value().style.display == "none"), true, "hide() Calendar 가 사라짐.");
	oDatepicker.show(elInput);
	equal((welCalendar.$value().style.display != "none"), true, "show() Calendar 가 노출됨.");
	jindo.$Element("closeBtn").fireEvent("click");
	equal((welCalendar.$value().style.display == "none"), true, "닫기 버튼 클릭시 Calendar 가 사라짐.");	
});

// test("jindo.m.Datepicker Calendar 위치변경 테스트", function() {
// 	var welInput = jindo.$Element("datepicker");
// 	var elInput = welInput.$value();
// 	var welCalendar = jindo.$Element("calendar");
// 	var htOffsetInput = welInput.offset();	
// 	elInput.focus();
// 	var oOffset = welCalendar.offset();	
// 	equal((oOffset.top == (htOffsetInput.top + welInput.height()) && oOffset.left == htOffsetInput.left), true, "bottomLeft 위치에 Calendar 가 노출됨.");
// 	//alert(oOffset.top + " , " + oOffset.left);
// 	oDatepicker.setPosition(elInput,"bottomRight")
// 	oOffset = jindo.$Element("calendar").offset();	
// 	equal((oOffset.top == (htOffsetInput.top + welInput.height()) && oOffset.left == (welInput.width() - welCalendar.width())), true, "bottomRight 위치에 Calendar 가 노출됨.");
	
// 	oDatepicker.setPosition(elInput,"topLeft")
// 	oOffset = jindo.$Element("calendar").offset();
// 	equal((oOffset.top == (htOffsetInput.top- welCalendar.height()) && oOffset.left == htOffsetInput.left), true, "topLeft 위치에 Calendar 가 노출됨.");
// 	oDatepicker.setPosition(elInput,"topRight")
// 	oOffset = jindo.$Element("calendar").offset();	
// 	equal((oOffset.top == (htOffsetInput.top- welCalendar.height()) && oOffset.left == (welInput.width() - welCalendar.width())), true, "topRight 위치에 Calendar 가 노출됨.");
	
// 	oDatepicker.setPosition(elInput,"leftTop")
// 	oOffset = jindo.$Element("calendar").offset();	
// 	equal((oOffset.top == htOffsetInput.top && oOffset.left == -welCalendar.width()), true, "leftTop 위치에 Calendar 가 노출됨.");
// 	oDatepicker.setPosition(elInput,"leftBottom")	
// 	oOffset = jindo.$Element("calendar").offset();	
// 	equal((oOffset.top == (htOffsetInput.top + welInput.height() - welCalendar.height()) && oOffset.left == -welCalendar.width()), true, "leftBottom 위치에 Calendar 가 노출됨.");
	
// 	oDatepicker.setPosition(elInput,"rightTop")
// 	oOffset = jindo.$Element("calendar").offset();	
// 	equal((oOffset.top == htOffsetInput.top && oOffset.left == welInput.width()), true, "rightTop 위치에 Calendar 가 노출됨.");
	
// 	oDatepicker.setPosition(elInput,"rightBottom")
// 	oOffset = jindo.$Element("calendar").offset();
// 	equal((oOffset.top == (htOffsetInput.top + welInput.height() - welCalendar.height()) && oOffset.left == welInput.width()), true, "rightBottom 위치에 Calendar 가 노출됨.");
	
// });

test("jindo.m.Datepicker Calendar 날짜 선택 테스트", function() {
	var elInput = jindo.$("datepicker");
	var welCalendar = jindo.$Element("calendar");	
	oDatepicker.setDate(elInput, {nYear:2011, nMonth:10, nDate:18});
	elInput.focus();	
	
	equal(elInput.value, "2011-10-18", "선택된 날짜는 2011-10-18");
	
	var aCells = welCalendar.queryAll(".calendar-date");
	var sDate;
	var welCell = null;
	for (var i = 0, elCell; elCell = aCells[i]; i++) {
		welCell = jindo.$Element(elCell);
		if(!welCell.parent().hasClass("calendar-next-mon") && 
				!welCell.parent().hasClass("calendar-prev-mon")){
			break;
		}
	}
	if(!isMobile){
		welCell.fireEvent(sClickEvent);
	}else{
		oDatepicker._onClickDate({element: welCell.$value(), stopDefault : function(){}});
	}
	equal(welCalendar.visible(), false, "날짜 클릭시 Calendar 가 사라짐.");	
});

test("jindo.m.Datepicker Calendar 날짜(day of week) 선택 테스트", function() {
    oDatepicker.option("sFormat",  "yyyy.mm.dd day");
    var elInput = jindo.$("datepicker");
    var welCalendar = jindo.$Element("calendar");   
    oDatepicker.setDate(elInput, {nYear:2012, nMonth:1, nDate:3});
    elInput.focus();    
    equal(elInput.value, "2012.01.03 화", "선택된 날짜는 2012.01.03 화요일 이");
    var aCells = welCalendar.queryAll(".calendar-date");
    var sDate;
    var welCell = null;
    for (var i = 0, elCell; elCell = aCells[i]; i++) {
        welCell = jindo.$Element(elCell);
        if(!welCell.parent().hasClass("calendar-next-mon") && 
                !welCell.parent().hasClass("calendar-prev-mon")){
            break;
        }
    }   
    if(!isMobile){
		welCell.fireEvent(sClickEvent);
	}else{
		oDatepicker._onClickDate({element: welCell.$value(), stopDefault : function(){}});
	}
    //welCell.fireEvent(sClickEvent);
    equal(welCalendar.visible(), false, "날짜 클릭시 Calendar 가 사라짐."); 
});

test("jindo.m.Datepicker Calendar 달력 이동 테스트", function() {
	var elInput = jindo.$("datepicker");
	var welCalendar = jindo.$Element("calendar");
	var welPreBtn = jindo.$Element("preBtn");
	var welNextBtn = jindo.$Element("nextBtn");
	var welYearPreBtn = jindo.$Element("preYearBtn");
	var welYearNextBtn = jindo.$Element("nextYearBtn");
	var welDateTitle = jindo.$Element("title");	
	
	oDatepicker.setDate(elInput, {nYear:2011, nMonth:10, nDate:18});
	elInput.focus();	
	
	welPreBtn.fireEvent("click");
	equal(welDateTitle.text(), "2011.09", "Calendar 이전달 클릭");
	welNextBtn.fireEvent("click");
	welNextBtn.fireEvent("click");
	welNextBtn.fireEvent("click");
	equal(welDateTitle.text(), "2011.12", "Calendar 다음달 클릭");
	
	welYearPreBtn.fireEvent("click");
	equal(welDateTitle.text(), "2010.12", "Calendar 이전년도 클릭");
	welYearNextBtn.fireEvent("click");
	equal(welDateTitle.text(), "2011.12", "Calendar 다음년도 클릭");	
});

test("jindo.m.Datepicker 활성화 / 비활성화 테스트", function() {
	var elInput = jindo.$("datepicker");
	var welCalendar = jindo.$Element("calendar");

	oDatepicker.disable();
	elInput.focus();		
	equal((welCalendar.$value().style.display == "none"), true, "비활성화시 Calendar 가 나타나지 않음.");
	elInput.blur();
	oDatepicker.enable();
	elInput.focus();
	equal((welCalendar.$value().style.display != "none"), true, "활성화시 Calendar 가 나타남.");
});

test("jindo.m.Datepicker Effect 테스트", function() {
	oDatepicker.option("bUseEffect" , true);
	
	var elInput = jindo.$("datepicker");
	var welCalendar = jindo.$Element("calendar");
	elInput.focus();		
	
	setTimeout(function(){
		equal((welCalendar.$value().style.display != "none"), true, "focus시  Calendar 가 노출됨.");
		jindo.$Element("closeBtn").fireEvent("click");
		setTimeout(function(){			
			equal((welCalendar.$value().style.opacity == 0), true, "닫기 버튼 클릭시 Calendar 가 사라짐.");
			start();
		},200);
	},100)
	stop();
	
	oDatepicker.enable();
	elInput.focus();
	equal((welCalendar.$value().style.display != "none"), true, "활성화시 Calendar 가 나타남.");
});

module("Datepicker Instance Test", {
	setup: function() {
	},
	teardown : function() {
			
		
	}
});

test("jindo.m.Datepicker 인스턴스 테스트", function() {	
	document.body.removeChild(jindo.$("calendar"));
	oDatepicker = new jindo.m.Datepicker(null,{bUseEfface : true});
	oDatepicker.addDatePickerSet("datepicker");
	equal((oDatepicker instanceof jindo.m.Datepicker), true, "jindo.m.Datepicker 인스턴스 생성.");	
	oDatepicker.removeDatePickerSet("datepicker");
	oDatepicker.destroy();
	jindo.$Element("datepicker").parent().replace(jindo.$('<input type="text" id="datepicker" class="date_input"/>'));	
});
