/**
	@fileOverview Form Element의 RadioButton을 모바일에 환경에 맞게 커스터마이징한 컴포넌트
	@author sshyun
	@version #__VERSION__#
	@since 2011. 9. 19.
**/
/**
	Form Element의 RadioButton을 모바일에 환경에 맞게 커스터마이징한 컴포넌트

	@class jindo.m.RadioButton
	@extends jindo.m.CheckRadioCore
	@keyword radio
	@group Component

	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 0.9.5 Update [bUseRadius] Option 삭제<br />
						[sRadiusSize] Option 삭제<br />
						[sCheckBgColor] Option 삭제<br />
						[sUncheckBgColo] Option 삭제<br />
	@history 0.9.0 Release 최초 릴리즈
**/
jindo.m.RadioButton = jindo.$Class({
	/* @lends jindo.m.RadioButton.prototype */
	/**
		초기화 함수

		@constructor
		@param {Varient} el Checkbox Layout Wrapper
		@param {Object} [htOption] 초기화 옵션 객체
			@param {String} [htOption.sClassPrefix="frb-"] Class의 prefix명
			@param {String} [htOption.sType="v"] 세로 / 가로 타입 여부 (가로 :h, 세로:v)
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
			@param {String} [htOption.sUncheckBgColor="transparent"]
	**/
	$init : function(el, htOption) {
		this.option({
			sClassPrefix	: "frb-",
			sType			: "v",
			bActivateOnload : true,
			sUncheckBgColor : "transparent"
		});
		this.option(htOption || {});
		this._initVar();
		this._setWrapperElement(el, this.option("sClassPrefix"));
		this._initRadioLoad();
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},

	/**
		jindo.m.RadioButton 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar : function() {
		this.$super._initVar("radio", "radiobtn");
		this._nPreSelectIdx = -1;
	},
	/**
		초기 radio button 체크 여부 확인.
	**/
	_initRadioLoad : function(){
		var aRadioBtnList = this._aWElFormList;
		for ( var i = 0; i < aRadioBtnList.length; i++) {
			if(aRadioBtnList[i].$value().checked){
				this._setChecked(i);
				break;
			}
		}
	},

	_afterCheck : function(welElement, bClickOverForm){
		var nIdx = -1;
		nIdx = this._htWElement["container"].indexOf(welElement);
		this._setChecked(nIdx);
	},

	/**
		CheckBox/RadioButton 에서 Click 이벤트 처리.

		@param {Object} we 이벤트 객체.
	**/
	_onFormClick : function(we){
		var sClassName = this._sUnitClass;
		var welElement = jindo.$Element(we.element);
		welElement = welElement.parent(function(v){
			return v.hasClass(sClassName);
		})[0];
		var sChecked = welElement.attr("data-cb-checked");
		we.element.checked = (sChecked && sChecked == "on") ? true : false;
		var nIdx = this._htWElement["container"].indexOf(welElement);
		if(we.element.checked){
			if(this._nPreSelectIdx != nIdx){
				this._onCheck(we);
			}
		}
	},

	/**
		체크여부 설정 처리.

		@param {Number} nIdx 체크할 RadioButton index
	**/
	_setChecked : function(nIdx){
		var elCurrentRadioBtn = this._aWElFormList[nIdx].$value();
		var welCurrentRadioUnit = this._aWElUnitList[nIdx];
		if(elCurrentRadioBtn.disabled){
			return false;
		}
		var sBgColor = this.option("sCheckBgColor");
		var elPreRadioUnit = null;
		var elPreRadioBtn = null;
		// 이전 index RadioButton 선택 해제
		if(this._nPreSelectIdx > -1){
			sBgColor = (sBgColor) ? this.option("sUncheckBgColor") : null;
			elPreRadioUnit = this._aWElUnitList[this._nPreSelectIdx].$value();
			elPreRadioBtn = this._aWElFormList[this._nPreSelectIdx].$value();
			this._aWElUnitList[this._nPreSelectIdx].removeClass(this._sOnClass);
			elPreRadioBtn.checked = false;
			if(sBgColor){
				this._aWElUnitList[this._nPreSelectIdx].css("backgroundColor", sBgColor + " !important");
			}
		}

		welCurrentRadioUnit.addClass(this._sOnClass);
		welCurrentRadioUnit.attr("data-cb-checked","on");
		elCurrentRadioBtn.checked = true;
		sBgColor = this.option("sCheckBgColor");
		if(sBgColor){
			welCurrentRadioUnit.css("backgroundColor", sBgColor + " !important");
		}
		this._nPreSelectIdx = nIdx;
		/**
			RadioButton 이 선택 시 발생.

			@event checked
			@param {String} sType 커스텀 이벤트명
			@param {Elment} elPreRadioButtonUnit 이전 선택한 RadioButton Unit 엘리먼트
			@param {Elment} elPreRadioButton 이전 선택한 RadioButton 엘리먼트
			@param {Elment} elRadioButtonUnit RadioButton Unit 엘리먼트
			@param {Elment} elRadioButton RadioButton 엘리먼트

		**/
		this.fireEvent("checked", {
			elPreRadioButtonUnit : elPreRadioUnit,
			elPreRadioButton : elPreRadioBtn,
			elRadioButtonUnit : welCurrentRadioUnit.$value(),
			elRadioButton : elCurrentRadioBtn
		});
	},
	/**
		check 된 항목값을 반환한다.

		@method getCheckedValue
		@return {String} 체크된 RadioButton value 값.
		@example
			var sValue = oRadioButton.getCheckedValue();
			alert(sValue);
	**/
	getCheckedValue : function(){
		var sValue = "";
		if(this._nPreSelectIdx > -1){
			if(!this._aWElFormList[this._nPreSelectIdx].$value().disabled){
				sValue = this._aWElFormList[this._nPreSelectIdx].$value().value;
			}
		}
		return sValue;
	},
	/**
		입력한 RadioButton 엘리먼트를 선택 / 선택해제 시킨다.

		@method setCheckedButton
		@param {Variant} vElement 체크를 설정할 checkbox Element.
		RadioButton input 엘리먼트 또는 RadioButton Unit 엘리먼트  엘리먼트가 입력 될수 있다.
		@example
			// 선택시
			oRadioButton.setCheckedButton(jindo.$("unit1"));
	**/
	setCheckedButton : function(vElement){
		var aIdx = this._getFormIdx(vElement);
		if(aIdx.length > 0)	{this._setChecked(aIdx[0]);}
	},
	/**
		RadioButton 를 활성화 시킨다.

		@method enable
		@param {Variant} vElement 활성화 할 RadioButton Element.
		RadioButton input 엘리먼트 배열 또는 RadioButton Unit 엘리먼트 배열 또는 단일 엘리먼트가 입력 될수 있고,
		입력값이 없을시 모든 체크박스 엘리먼트가 기준이 된다.

		@example
			// 배열 활성화
			oRadioButton.enable([jindo.$("unit1"),jindo.$("unit2")]);
			// 단일 활성화
			oRadioButton.enable(jindo.$("unit1"));
			// 전체 활성화
			oRadioButton.enable();
	**/
	enable : function(vElement){
		var htElForm = this._useSettingForm(vElement, true);

		/**
			RadioButton이 활성화 되었을 경우 발생.

			@event enable
			@param {String} sType 커스텀 이벤트명
			@param {Array} aRadioButtonUnitList 활성화 되는 RadioButton Unit 엘리먼트 배열
			@param {Array} aRadioButtonList 활성화 되는 RadioButton 엘리먼트 배열

		**/
		this.fireEvent("enable", {
			aRadioButtonList: htElForm.aFormList,
			aRadioButtonUnitList: htElForm.aUnitList
		});
	},
	/**
		RadioButton 를 비활성화 시킨다.

		@method disable
		@param {Variant} vElement 비활성화 할 RadioButton Element.
		RadioButton input 엘리먼트 배열 또는 RadioButton Unit 엘리먼트 배열 또는 단일 엘리먼트가 입력 될수 있고,
		입력값이 없을시 모든 체크박스 엘리먼트가 기준이 된다.
		@example
			// 배열 비활성화
			oRadioButton.disable([jindo.$("unit1"),jindo.$("unit2")]);
			// 단일 비활성화
			oRadioButton.disable(jindo.$("unit1"));
			// 전체 비활성화
			oRadioButton.disable();
	**/
	disable : function(vElement){
		var htElForm = this._useSettingForm(vElement, false);

		/**
			RadioButton이 비활성화 되었을 경우 발생.

			@event disable
			@param {String} sType 커스텀 이벤트명
			@param {Array} aRadioButtonUnitList 활성화 되는 RadioButton Unit 엘리먼트 배열
			@param {Array} aRadioButtonList 활성화 되는 RadioButton 엘리먼트 배열


		**/
		this.fireEvent("disable", {
			aRadioButtonList: htElForm.aFormList,
			aRadioButtonUnitList: htElForm.aUnitList
		});
	},
	/**
		index 번호로 RadioButton Element 를 반환한다.

		@method getElementByIndex
		@param {Number} nIdx 가져올 index 번호.
		@return {Object} RadioButton Element 객체
		    @return {HTMLElement} ."elRadioButton" 대상 엘리먼트
		    @return {HTMLElement} ."elRadioButtonUnit" 대상 엘리먼트
		@example
			// 0번째 RadioButton 가져오기.
			var oRadioButton = oRadioButton.getElementByIndex(0);
			oRadioButton.elRadioButtonUnit; // RadioButton Unit Element 객체
			oRadioButton.elRadioButton; // RadioButton Element 객체
	**/
	getElementByIndex : function(nIdx){
		return {
			elRadioButton: this._aWElFormList[nIdx].$value(),
			elRadioButtonUnit: this._aWElUnitList[nIdx].$value()
		};
	},
	/**
		jindo.m.RadioButton 에서 사용하는 모든 객체를 release 시킨다.

		@method destroy
		@example
			oRadioButton.destroy();
	**/
	destroy : function() {
		this.$super.destroy();
	}
}).extend(jindo.m.CheckRadioCore);