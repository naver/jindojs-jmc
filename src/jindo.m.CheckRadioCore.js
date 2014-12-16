/**
	@fileOverview Form Element의 CheckBox / RadioButton 컴포넌트의 Core 클래스.
	@author sshyun
	@version #__VERSION__#
	@since 2011. 11. 1.

**/
/**
	Form Element의 CheckBox / RadioButton 컴포넌트의 Core 클래스.

	@class jindo.m.CheckRadioCore
	@extends jindo.m.UIComponent
	@keyword checkradio
	@group Component
	@invisible
**/

jindo.m.CheckRadioCore = jindo.$Class({
	/* @lends jindo.m.CheckRadioCore.prototype */
	/**
		초기화 함수

		@constructor
		@param {Varient} el Layout Wrapper
	**/
	$init : function(el, htOption) {
	},
	/**
		jindo.m.CheckRadioCore 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar : function(sFormType, sFormClass) {
		this._sFormType = sFormType;
		this._sFormFixClass = sFormClass;
		this._sUnitClass = this.option("sClassPrefix") + sFormClass +"-unit";
		this._sOnClass = this.option("sClassPrefix")+ sFormClass + "-on";
		this._sFormClass = this.option("sClassPrefix") + sFormClass;
		this._sDisableClass = this.option("sClassPrefix")+ sFormClass + "-disable";
		var oDeviceInfo = jindo.m.getDeviceInfo();
		this._bMobile = (oDeviceInfo.iphone || oDeviceInfo.ipad || oDeviceInfo.android);

		this._sClickEvent = (this._bMobile) ? "touchend" : "click";
		this._bMove = false;

	},

	/**
		jindo.m.CheckRadioCore 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
	**/
	_setWrapperElement : function(el, sPrefix) {

		this._htWElement = {};
		this._aWElUnitList = [];
		this._aWElFormList = [];

		el = (typeof el == "string" ? jindo.$(el) : el);
		this._htWElement["base"] = jindo.$Element(el);
		this._htWElement["container"] = jindo.$Element(jindo.$$.getSingle('.' + sPrefix + this._sFormFixClass +'-cont', el));

		var aUnitList = this._htWElement["container"].queryAll('.' + this._sUnitClass);
		var aFormList = this._htWElement["container"].queryAll('.' + this._sFormClass);
		// 각 체크박스 엘리먼트와 Wrapper 엘리먼트를 가져온다.

		for ( var i = 0; i < aUnitList.length; i++) {
			this._aWElUnitList[i] = jindo.$Element(aUnitList[i]);
			this._aWElFormList[i] = jindo.$Element(aFormList[i]);
		}
	},
	/**
		jindo.m.CheckRadioCore 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		this._attachEvent();
	},
	/**
		jindo.m.CheckRadioCore 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEvent();
	},
	/**
		jindo.m.CheckRadioCore 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		this._htEvent = {};
		this._htEvent["form_touchmove"] = {
				el  : this._htWElement["container"].$value(),
				ref : jindo.$Fn(this._onTouchMove, this).attach( this._htWElement["container"].$value(), "touchmove")
		};
		this._htEvent["form_"+this._sClickEvent] = {
				el  : this._htWElement["container"].$value(),
				ref : jindo.$Fn(this._onCheck, this).attach( this._htWElement["container"].$value(), this._sClickEvent)
		};

		if(this._bMobile){
			for ( var i = 0; i < this._aWElFormList.length; i++) {
				this._htEvent["form"+i+"_click"] = {
						el  : this._aWElFormList[i].$value(),
						ref : jindo.$Fn(this._onFormClick, this).attach( this._aWElFormList[i].$value(), "click")
				};
			}

		}
	},
	/**
		jindo.m.CheckRadioCore 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEvent : function() {
		for(var p in this._htEvent) {
			var ht = this._htEvent[p];
			ht.ref.detach(ht.el, p.substring(p.lastIndexOf("_")+1));
		}
		this._htEvent = null;
	},
	/**
		container 에서 TouchMove 이벤트 처리.
		@param {Object} we 이벤트 객체.
	**/
	_onTouchMove : function(we){
		this._bMove = true;
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

		var bCurrentChecked = we.element.checked;
		var sChecked = welElement.attr("data-cb-checked");
		var bChecked = (sChecked && sChecked == "on") ? true : false;

		if(bCurrentChecked != bChecked){
			we.element.checked = bChecked;
		}
	},

	/**
		CheckBox/RadioButton container 에서 클릭이벤트 처리.
		@param {Object} we 이벤트 객체.
	**/
	_onCheck : function(we){
	    we.stopDefault();
		if(we.element && !this._bMove) {
			var elEventElement = jindo.m.getNodeElement(we.element);
			var welElement = jindo.$Element(elEventElement);

			var sClassName = this._sUnitClass;
			var sTagName = elEventElement.tagName.toLowerCase();
			var sType = elEventElement.getAttribute("type");
			sType = (sType) ? sType : "";
			// Container 하위 에서 클릭 되었는지 체크
			if(this._htWElement["container"].isParentOf(welElement) &&
					!welElement.hasClass(sClassName)){
				welElement = welElement.parent(function(v){
					return v.hasClass(sClassName);
				})[0];
			} else if((welElement.$value() === this._htWElement["container"].$value())){
				return false;
			}

			if((welElement.hasClass(this._sDisableClass))){
				return false;
			}

			var bClickOverForm = false;
			if(sTagName == "input" && sType.toLowerCase() == this._sFormType) {
				bClickOverForm = true;
			}
			this._afterCheck(welElement, bClickOverForm);
		}
		this._bMove = false;
	},

	/**
		CheckBox/RadioButton 클릭후 처리 함수
		각 컴포넌트에서 Override 하여 사용.
	**/
	_afterCheck : function(welElement, bClickOverForm){
	},

	/**
		체크박스 Element 의 배열의 index 배열을 반환.
		@param {Variant} checkbox Element.
		@return {Array} Index 배열값
	**/
	_getFormIdx : function(vElement){
		var aIdxList = [];
		var aElList = [];
		var sUnitClassName = this._sUnitClass;
		var sFormClassName = this._sFormClass;
		var waElUnitList = jindo.$A(this._aWElUnitList);
		var waElFormList = jindo.$A(this._aWElFormList);

		if(vElement instanceof Array){
			aElList = vElement;
		} else if(typeof vElement == "object"){
			aElList.push(vElement);
		} else if(!vElement || vElement === null){
			var nLength = this._aWElUnitList.length;
			for ( var i = 0; i < nLength; i++) {
				aIdxList.push(i);
			}
		}

		// Unit Element 와 Form Element 배열에서 특정 Element 의 Index 를 검색.
		var nIdx = -1;
		if(aElList.length > 0){
			waElUnitList.forEach(function(welElement, nElIdx){
				for ( var i = 0; i < aElList.length; i++) {
					if(aElList[i] === welElement.$value()){
						aIdxList.push(nElIdx);
					}
				}
			});

			if(aElList.length > aIdxList.length){
				waElFormList.forEach(function(welElement, nElIdx){
					for ( var i = 0; i < aElList.length; i++) {
						if(aElList[i] === welElement.$value()){
							aIdxList.push(nElIdx);
						}
					}
				});
			}
		}
		return aIdxList;
	},

	/**
		CheckBox/RadioButton 활성화 처리
		@param {Variant} vElement 체크를 설정할 CheckBox/RadioButton Element.
		@param {boolean} bUse 활성화 여부
	**/
	_useSettingForm : function(vElement, bUse){
		var aIdx = this._getFormIdx(vElement);
		var aElFormList = [];
		var aElUnitList = [];
		var sEvent = (bUse) ? "enable" : "disable";

		for ( var i = 0; i < aIdx.length; i++) {
			this._setUsedForm(bUse, this._aWElFormList[aIdx[i]].$value(), this._aWElUnitList[aIdx[i]]);
			aElFormList[i] = this._aWElFormList[aIdx[i]].$value();
			aElUnitList[i] = this._aWElUnitList[aIdx[i]].$value();
		}
		return {
			aFormList: aElFormList,
			aUnitList: aElUnitList
		};
	},
	/**
		CheckBox 활성화 지정. CheckBox disabled와 Unit css Class 지정.
		@param {Variant} vElement 체크를 설정할 checkbox Element.
		@param {boolean} bUse 활성화 여부
	**/
	_setUsedForm : function(bEnable, elForm, welUnit){
		if(!bEnable){
			welUnit.addClass(this._sDisableClass);
			elForm.disabled = true;
		} else {
			welUnit.removeClass(this._sDisableClass);
			elForm.disabled = false;
		}
	},

	/**
		jindo.m.CheckRadioCore 에서 사용하는 모든 객체를 release 시킨다.
		@method destroy
	**/
	destroy : function() {
		this.deactivate();

		for ( var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
		this._sUnitClass = null;
		this._sOnClass = null;
		this._sFormClass = null;
		this._sDisableClass = null;
		this._aWElUnitList = null;
		this._aWElFormList = null;
	}
}).extend(jindo.m.UIComponent);