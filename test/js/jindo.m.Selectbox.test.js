/**
* @(#)jindo.m.CheckBox.test.js 2011. 9. 27.
*
* Copyright NHN Corp. All rights Reserved.
* NHN PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
*/
/**
* @author sshyun
* @since 2011. 9. 27.
* @description 
*/
module("Select Basic Test", {
	setup: function() {		
		oSelect1 = new jindo.m.Selectbox("select1",{
		});
		oSelect2 = new jindo.m.Selectbox("select2",{
			nDefaultIndex : 1
		});
		
	},
	teardown : function() {		
		/** 객체 소멸 */
		oSelect1.destroy();
		oSelect2.destroy();
		oSelect1 = null;
		oSelect2 = null;
	}
});

test("jindo.m.Selectbox 인스턴스 테스트", function() {	
	equal((oSelect1 instanceof jindo.m.Selectbox), true, "jindo.m.Selectbox 인스턴스 생성.");		
	equal((oSelect2 instanceof jindo.m.Selectbox), true, "jindo.m.Selectbox 인스턴스 생성.");		
});

test("jindo.m.Selectbox select/getValue/getCurrentIdx 테스트", function() {
	equal(oSelect1.getValue(), "", "처음 선택된값이 없는경우");
	equal(oSelect2.getValue(), "네이버", "nDefaultIndex로 선택한값");

	equal(oSelect1.getCurrentIdx(), -1, "처음 선택된값이 없는경우");
	equal(oSelect2.getCurrentIdx(), 1, "nDefaultIndex:1인 값");

	oSelect1.select(1);
	equal(oSelect1.getValue(), "네이버", "1번째 인덱스 선택한 값");	
	equal(oSelect1.getCurrentIdx(), 1, "1번째 인덱스 선택한 인덱스");

	oSelect2.select(-9);
	equal(oSelect2.getValue(), "네이버", "범위밖의 값이 들어올 경우 변경안됨.");	
	equal(oSelect2.getCurrentIdx(), 1, "범위밖의 값이 들어올 경우 변경안됨.");

	oSelect2.select(10);
	equal(oSelect2.getValue(), "네이버", "범위밖의 값이 들어올 경우 변경안됨.");	
	equal(oSelect2.getCurrentIdx(), 1, "범위밖의 값이 들어올 경우 변경안됨.");

});

test("jindo.m.Selectbox disable/enable 테스트", function() {
	var sClassName = oSelect1._sClassPrefix + "disable";
	equal(oSelect1._htWElement["base"].hasClass(sClassName), false, "disable 전");
	equal(oSelect1._htWElement["selectmenu"].visible(), true, "disable 전");
	oSelect1.disable();
	equal(oSelect1._htWElement["base"].hasClass(sClassName), true, "disable 성공");
	equal(oSelect1._htWElement["selectmenu"].visible(), false, "disable 성공");
	oSelect1.disable();
	equal(oSelect1._htWElement["base"].hasClass(sClassName), true, "두번 disable 성공");
	equal(oSelect1._htWElement["selectmenu"].visible(), false, "두번 disable 성공");
	oSelect1.enable();
	equal(oSelect1._htWElement["base"].hasClass(sClassName), false, "enable 성공");
	equal(oSelect1._htWElement["selectmenu"].visible(), true, "enable 성공");
	oSelect1.enable();
	equal(oSelect1._htWElement["base"].hasClass(sClassName), false, "두번 enable 성공");
	equal(oSelect1._htWElement["selectmenu"].visible(), true, "두번 enable 성공");
});

test("jindo.m.Selectbox refresh 테스트", function() {
	var aOrg = ["구글","네이버","다음","파란"];
	var aChange = ["ch구글","ch네이버","ch다음","ch파란"];
	var i=0;
	for(i=0; i<4; i++) {
		equal(oSelect1.getValue(i), aOrg[i], "기존 데이터 이상무");
		equal(oSelect2.getValue(i), aOrg[i], "기존 데이터 이상무");
	}
	oSelect1.refresh(aChange);
	for(i=0; i<4; i++) {
		equal(oSelect1.getValue(i), aChange[i], "데이터 변경됨 ");
	}
	oSelect2.refresh(aChange);
	for(i=0; i<4; i++) {
		equal(oSelect2.getValue(i), aChange[i], "데이터 변경됨 ");
	}
});