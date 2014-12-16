/**
	@fileOverview Form Element의 CheckBox를 모바일에 환경에 맞게 커스터마이징한 컴포넌트
	@author sshyun
	@version #__VERSION__#
	@since 2011. 9. 16.
**/
/**
	Form Element의 CheckBox를 모바일에 환경에 맞게 커스터마이징한 컴포넌트

	@class jindo.m.CheckBox
	@extends jindo.m.CheckRadioCore
	@keyword input, checkbox, 체크박스, 디자인
	@group Component

	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 0.9.5 Update [bUseRadius] Option 삭제<br />
						[sRadiusSize] Option 삭제<br />
						[sCheckBgColor] Option 삭제	<br />
						[sUncheckBgColor] Option 삭제
	@history 0.9.0 Release 최초 릴리즈
**/
jindo.m.CheckBox = jindo.$Class({
	/* @lends jindo.m.CheckBox.prototype */
	/**
		초기화 함수

		@constructor
		@param {Varient} el Checkbox Layout Wrapper
		@param {Object} [htOption] 초기화 옵션 객체
			@param {String} [htOption.sClassPrefix='fcb-'] 컴포넌트 로드시 activate 여부
			@param {String} [htOption.sType='v'] 세로 / 가로 타입 여부 (가로 :h, 세로:v)
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
	**/
	$init : function(el, htOption) {
		this.option({
			sClassPrefix	: "fcb-",
			sType			: "v",
			bActivateOnload : true,
			sUncheckBgColor : "transparent"
		});
		this.option(htOption || {});
		this._initVar();
		this._setWrapperElement(el, this.option("sClassPrefix"));
		this._initCheckLoad();
		if(this.option("bActivateOnload")) {
			this.activate();
		}

	},
	/**
		jindo.m.CheckBox 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar : function() {
		this.$super._initVar("checkbox", "checkbox");
	},
	/**
		초기 체크 박스 체크 여부 확인.
	**/
	_initCheckLoad : function(){
		var aCheckUnit = this._htWElement["container"].queryAll('.' + this._sUnitClass);
		var welUnit, elCheckbox;
		for ( var i = 0; i < aCheckUnit.length; i++) {
			welUnit = jindo.$Element(aCheckUnit[i]);
			//elCheckbox = welUnit.query("input[type=checkbox]");
			elCheckbox = jindo.$$.getSingle("input[type=checkbox]", welUnit.$value());
			this._setChecked(elCheckbox.checked, elCheckbox, welUnit);
		}
		welUnit = elCheckbox = null;
	},

	/**
		CheckBox Toggle 효과 처리. List 에서 클릭시.
		@param {Object} welElement List Wrapper 엘리먼트.
	**/
	_afterCheck : function(welElement, bClickOverForm){
		var elCheckbox = jindo.$$.getSingle("." + this._sFormClass, welElement.$value());
		var sChecked = welElement.attr("data-cb-checked");
		var bChecked = (sChecked && sChecked == "on") ? false : true;
		//체크박스와 설정을 맞추기 위해 무조건 체크박스를 다시 설정한다.
	//	if(!bClickOverForm){
			elCheckbox.checked = bChecked;
	//	}
		this._setChecked(bChecked, elCheckbox, welElement);
	},
	/**
		체크여부 설정 처리.

		@param {Boolean} bChecked 체크여부
		@param {Element} elCheckbox CheckBox 엘리먼트
		@param {$Element} welUnit  CheckBox Wrapper 엘리먼트
		@history 0.9.5 Update sCheckBgColor Option 삭제
		@history 0.9.5 Update sUncheckBgColor Option 삭제
	**/
	_setChecked : function(bChecked, elCheckbox, welUnit){
		var sEvent = "unchecked";
		var sBgColor = this.option("sCheckBgColor");
		// 체크해제 경우
		if(!bChecked){
			sBgColor = (sBgColor) ? this.option("sUncheckBgColor") : null;
			welUnit.removeClass(this._sOnClass);
			welUnit.attr("data-cb-checked", "off");
		//체크 경우
		} else {
			welUnit.addClass(this._sOnClass);
			welUnit.attr("data-cb-checked", "on");
			sEvent = "checked";
		}
		//(sBgColor) ? welUnit.css("backgroundColor", sBgColor + " !important") : null;

		/**
			Check Box 선택해제시 발생.

			@event unchecked
			@param {String} sType 커스텀이벤트명
			@param {Elment} elCheckBoxUnit CheckBox Unit 엘리먼트
			@param {Elment} elCheckBox CheckBox 엘리먼트
		**/
		this.fireEvent(sEvent, {
			elCheckBoxUnit : welUnit.$value(),
			elCheckBox : elCheckbox
		});
	},
	/**
		check 된 항목값을 반환한다.

		@method getCheckedValue
		@return {Array} 체크된 값의 배열 정보.
		@example
			var aValues = oCheckBox.getCheckedValue();
			for(var i = 0 ; i < aValues.length ; i++){
				alert(aValues[i]);
			}
	**/
	getCheckedValue : function(){
		var aValue = [];
		var aCheckBoxList = this._aWElFormList;
		var elTempCheck = null;
		for ( var i = 0; i < aCheckBoxList.length; i++) {
			elTempCheck = aCheckBoxList[i].$value();
			if(!elTempCheck.disabled && elTempCheck.checked){
				aValue.push(elTempCheck.value);
			}
		}
		return aValue;
	},
	/**
		입력한 CheckBox 엘리먼트를 선택 / 선택해제 시킨다.

		@method setCheckedBox
		@param {Boolean} bChecked check 여부
		@param {Variant} vElement 체크를 설정할 checkbox Element.<br />
		CheckBox input 엘리먼트 배열 또는 CheckBox Unit 엘리먼트 배열 또는 단일 엘리먼트가 입력 될수 있고,
		입력값이 없을시 모든 CheckBox 엘리먼트가 기준이 된다.

		@example
			// 배열 선택시
			oCheckBox.setCheckedBox(true, [jindo.$("unit1"),jindo.$("unit2")]);
			// 단일 선택시
			oCheckBox.setCheckedBox(true, jindo.$("unit1"));
			// 전체 선택시
			oCheckBox.setCheckedBox(true);

			// 배열 선택해제시
			oCheckBox.setCheckedBox(false, [jindo.$("unit1"),jindo.$("unit2")]);
			// 단일 선택해제시
			oCheckBox.setCheckedBox(false, jindo.$("unit1"));
			// 전체 선택해제시
			oCheckBox.setCheckedBox(false);
	**/
	setCheckedBox : function(bChecked, vElement){
		var aIdx = this._getFormIdx(vElement);
		var elInput = null;
		for ( var i = 0; i < aIdx.length; i++) {
			elInput = this._aWElFormList[aIdx[i]].$value();
			if(!elInput.disabled){
				elInput.checked = bChecked;
				this._setChecked(bChecked, elInput, this._aWElUnitList[aIdx[i]]);
			}
		}
	},
	/**
		CheckBox 를 활성화 시킨다.

		@method enable
		@param {Variant} vElement 활성화 할 checkbox Element.<br />
		CheckBox input 엘리먼트 배열 또는 CheckBox Unit 엘리먼트 배열 또는 단일 엘리먼트가 입력 될수 있고,
		입력값이 없을시 모든 체크박스 엘리먼트가 기준이 된다.

		@example
			// 배열 활성화
			oCheckBox.enable([jindo.$("unit1"),jindo.$("unit2")]);
			// 단일 활성화
			oCheckBox.enable(jindo.$("unit1"));
			// 전체 활성화
			oCheckBox.enable();
	**/
	enable : function(vElement){
		var htElForm = this._useSettingForm(vElement, true);

		/**
			Check Box 활성화 되었을 경우 발생.

			@event enable
			@param {String} sType 커스텀이벤트명
			@param {Array} aCheckBoxUnitList활성화 되는 CheckBox Unit 엘리먼트 배열
			@param {Array} aCheckBoxList활성화 되는 CheckBox 엘리먼트 배열
		**/
		this.fireEvent("enable", {
			aCheckBoxList: htElForm.aFormList,
			aCheckBoxUnitList: htElForm.aUnitList
		});
	},
	/**
		CheckBox 를 비활성화 시킨다.

		@method disable
		@param {Variant} vElement 비활성화 할 checkbox Element.<br />
		CheckBox input 엘리먼트 배열 또는 CheckBox Unit 엘리먼트 배열 또는 단일 엘리먼트가 입력 될수 있고,
		입력값이 없을시 모든 체크박스 엘리먼트가 기준이 된다.

		@example
			// 배열 비활성화
			oCheckBox.disable([jindo.$("unit1"),jindo.$("unit2")]);
			// 단일 비활성화
			oCheckBox.disable(jindo.$("unit1"));
			// 전체 비활성화
			oCheckBox.disable();
	**/
	disable : function(vElement){
		var htElForm = this._useSettingForm(vElement, false);

		/**
			Check Box 비활성화 되었을 경우 발생.

			@event disable
			@param {String} sType 커스텀이벤트명
			@parama {Array} CheckBoxUnitList 활성화 되는 CheckBox Unit 엘리먼트 배열
			@param {Array} aCheckBoxList 활성화 되는 CheckBox 엘리먼트 배열
		**/
		this.fireEvent("disable", {
			aCheckBoxList: htElForm.aFormList,
			aCheckBoxUnitList: htElForm.aUnitList
		});
	},
	/**
		index 번호로 CheckBox Element 를 반환한다.

		@method geElementtByIndex
		@param {Number} nIdx 가져올 index 번호.
		@return {Object} CheckBox Element 객체 {elCheckBox, elCheckBoxUnit} 으로 구성된 객체를 반환
		@example
			// 0번째 CheckBox 가져오기.
			var oCheckBox = oCheckBox.geElementtByIdx(0);
			oCheckBox.elCheckBoxUnit; // CheckBox Unit Element 객체
			oCheckBox.elCheckBox; // CheckBox Element 객체
	**/
	geElementtByIndex : function(nIdx){
		return {
			elCheckBox: this._aWElFormList[nIdx].$value(),
			elCheckBoxUnit: this._aWElUnitList[nIdx].$value()
		};
	},
	/**
		jindo.m.CheckBox 에서 사용하는 모든 객체를 release 시킨다.

		@method destroy
		@example
			oCheckBox.destroy();
	**/
	destroy : function() {
		this.$super.destroy();
	}
}).extend(jindo.m.CheckRadioCore);