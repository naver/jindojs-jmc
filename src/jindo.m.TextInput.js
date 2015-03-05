/**
	@fileOverview Form Element의 Text Input의 입력값의 변화를 감지하여 유효성 검사를 수행하고, 삭제 아이콘을 제공하는 컴포넌트
	@author sculove
	@version #__VERSION__#
	@since 2011. 11. 23.
**/
/**
	Form Element의 Text Input의 입력값의 변화를 감지하여 유효성 검사를 수행하고, 삭제 아이콘을 제공하는 컴포넌트

	@class jindo.m.TextInput
	@extends jindo.m.UIComponent
	@uses jindo.m.Validation {0,}
	@keyword textinput
	@group Component

	@history 1.15.0 Update interval 을 onInput 이벤트로 적용 개선
	@history 1.7.0 Bug 마크업 구조에 따라, 삭제 버튼 선택시 스크립트 오류발생하는 문제 해결
	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 1.1.0 Bug validate 이후 값이 변경되어 input 값이 없을 경우, 삭제 버튼이 지워지지 않는 문제 해결
	@history 1.0.0 Bug Validation 관련 버그수정
	@history 1.0.0 Update 속성 간소화<br>data-validate-use, data-validate-type, data-display-format → date-validate
	@history 1.0.0 Update 유효성 검사 시점 변경<br>실시간 유효성 검사 → blur시점 검사 (iOS4,5에서 javascript로 input값을 변경시, 한글입력이 있을 경우, 입력되었던 글자가 사라지는 이슈)
	@history 0.9.0 Release 최초 릴리즈
**/
jindo.m.TextInput = jindo.$Class({
	/* @lends jindo.m.TextInput.prototype */
	/**
		초기화 함수

		@constructor
		@param {Varient} el Input Box 기준 엘리먼트
		@param {Object} [htOption] 초기화 옵션 객체
			@param {String} [htOption.sClassPrefix="fit-"] Class의 prefix명
			@param {Boolean} [htOption.bUseValidate=false] data-validate 속성이 지정된 TextInput의 유효성 검사여부를 지정한다.
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
	**/
	$init : function(el, htOption) {
		this.option({
			sClassPrefix	: "fit-",
			bUseValidate : false,
			bActivateOnload : true
		});
		this.option(htOption || {});
		this._initVar();
		this._setWrapperElement(el);
		this._init();

		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},

	$static : {
		INDEX_ATTR : "data-index",
		VALIDATE_ATTR : "data-validate"
	},

	/**
		jindo.m.TextInput 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar : function() {
		this._aTextInput = [];
		this._sPreValue = null;
		this._sClickEvent = (jindo.m.getDeviceInfo().iphone || jindo.m.getDeviceInfo().ipad || jindo.m.getDeviceInfo().android) ? "touchstart" : "mousedown";
		// this._nFocusTimer = null;
		this._nBlurTimer = null;
	},

	/**
		jindo.m.TextInput 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
	**/
	_setWrapperElement : function(el) {
		this._htWElement = {};
		this._htWElement["baseElement"] = jindo.$Element(el);
	},

	/**

	**/
	_init : function() {
		var welUnit, welInput, welDel, sValidate, aBaseList, aValidate = [];
		aBaseList = this._htWElement["baseElement"].queryAll("." + this.option("sClassPrefix") + "textinput-unit");
		for(var i=0, nLength=aBaseList.length; i<nLength; i++) {
			 // Unit 지정
			 welUnit = jindo.$Element(aBaseList[i]);
			 welUnit.attr(jindo.m.TextInput.INDEX_ATTR, i).css("position" , "relative");
			 // Input 지정
			 welInput = jindo.$Element(welUnit.query("input"));
			 welInput.attr(jindo.m.TextInput.INDEX_ATTR, i);
			 // Del 지정
			 welDel = welUnit.query("." + this.option("sClassPrefix") + "clear-btn");
			 if(welDel) {
				welDel = jindo.$Element(welDel);
				welDel.attr(jindo.m.TextInput.INDEX_ATTR, i).css({
					"position" : "absolute",
					"zIndex" : 100,
					"cursor" : "pointer"	,
					"right" : "0px",
					"top" : "0px"
				}).hide();
			 }
			 this._aTextInput.push({
				welUnit : welUnit,
				welInput : welInput,
				welDel : welDel
			 });
		}
	},

	/**
		jindo.m.TextInput 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		this._htEvent = {};
		this._htEvent["focus"] = jindo.$Fn(this._onFocus, this);
		this._htEvent["blur"] = jindo.$Fn(this._onBlur, this);
		this._htEvent["clear"] = jindo.$Fn(this._onClear, this);
		this._htEvent["input"] = jindo.$Fn(this._onChange, this);
		for(var i=0, nLength=this._aTextInput.length; i<nLength; i++) {
			this._attachUnitEvent(this._aTextInput[i]);
		}
	},

	/**
		input단위 이벤트 attach
	**/
	_attachUnitEvent : function(htUnit) {
		this._htEvent["focus"].attach(htUnit.welInput, "focus");
		this._htEvent["blur"].attach(htUnit.welInput, "blur");
		this._htEvent["input"].attach(htUnit.welInput, "input");

		if(htUnit.welDel) {
			this._htEvent["clear"].attach(htUnit.welDel, this._sClickEvent);
		}
	},

	/**
		jindo.m.TextInput 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEvent : function() {
		for(var i=0, nLength=this._aTextInput.length; i<nLength; i++) {
			this._detachUnitEvent(this._aTextInput[i]);
		}
		for(var p in this._htEvent ) {
			this._htEvent[p] = null;
		}
		this._htEvent = null;
	},

	/**
		input단위 이벤트 detach
	**/
	_detachUnitEvent : function(htUnit) {
		this._htEvent["focus"].detach(htUnit.welInput, "focus");
		this._htEvent["blur"].detach(htUnit.welInput, "blur");
		this._htEvent["input"].detach(htUnit.welInput, "input");
		if(htUnit.welDel) {
			this._htEvent["clear"].detach(htUnit.welDel, this._sClickEvent);
		}
	},

	/**
		'X' 버튼 활성화 처리.
		@param {jindo.$Element} welInput input $Element 객체.
	**/
	_displayClearBtn : function(welInput){
		var nIdx = this.getIndex(welInput),
			welClearBtn = this._aTextInput[nIdx].welDel;

		// 버튼이 없다면 ...
		if(!welClearBtn) {
			return;
		}
		// 버튼 제어
		if(jindo.$S(welInput.$value().value).trim() != "") {


			/**
				삭제 버튼이 보여지기 전에 발생

				@event beforeShowClearBtn
				@param {String} sType 커스텀 이벤트명
				@param {Number} nIndex TextInput의 인덱스 (0부터 시작)
				@param {jindo.$Element }welClearBtn (jindo.$Element) : 삭제 버튼
				@param {Function} stop 수행시 showClearBtn 이벤트가 발생하지 않음
			**/
			if(!welClearBtn.visible() && this.fireEvent("beforeShowClearBtn", {
					nIndex : nIdx,
					welClearBtn : welClearBtn
				})) {
				welClearBtn.show();

				/**
					삭제 버튼이 보여진 후에 발생.

					@event showClearBtn
					@param {String} sType 커스텀 이벤트명
					@param {Number} nIndex TextInput의 인덱스 (0부터 시작)
					@param {jindo.$Element} welClearBtn (jindo.$Element) : 삭제 버튼
				**/
				this.fireEvent("showClearBtn", {
					nIndex : nIdx,
					welClearBtn : welClearBtn
				});
			}
		} else {

			/**
				삭제 버튼이 숨기기 전에 발생.

				@event beforeHideClearBtn
				@param {String} sType 커스텀 이벤트명
				@param {Number} nIndex TextInput의 인덱스 (0부터 시작)
				@param {jindo.$Element} welClearBtn (jindo.$Element) : 삭제 버튼
				@param {Function} stop 수행시 hideClearBtn 이벤트가 발생하지 않음
			**/
			if(welClearBtn.visible() && this.fireEvent("beforeHideClearBtn", {
					nIndex : nIdx,
					welClearBtn : welClearBtn
				})) {
				welClearBtn.hide();

				/**
					삭제 버튼이 숨겨진 후에 발생.

					@event hideClearBtn
					@param {String} sType 커스텀 이벤트명
					@param {Number} nIndex TextInput의 인덱스 (0부터 시작)
					@param {jindo.$Element} welClearBtn (jindo.$Element) : 삭제 버튼
				**/
				this.fireEvent("hideClearBtn", {
					nIndex : nIdx,
					welClearBtn : welClearBtn
				});
			}
		}
	},

	/**
		validatie 한다
		@param {jindo.$Element} welInput input $Element 객체.
	**/
	_validate : function(welInput) {
		var sValidate = welInput.attr(jindo.m.TextInput.VALIDATE_ATTR);
		if(!sValidate) {
			return;
		}
		var sValue = welInput.$value().value,
			htResult = jindo.m.Validation.validate(sValidate, sValue),
			nIdx=this.getIndex(welInput);
		if(htResult) {
			// valid가 유효하지 않을 경우, 값을 수정함 (?)
			if(typeof htResult.sCorrectedValue !== "undefined" && htResult.sCorrectedValue !== null) {
				// if(jindo.m.getDeviceInfo().iphone || jindo.m.getDeviceInfo().ipad) {
					// // ios 버그....
					// if(welInput.$value().value.indexOf(htResult.sCorrectedValue) != -1) {
						// var sTmp = htResult.sCorrectedValue.substr(welInput.$value().value.length);
						// if(this._checkUnicode(sTmp)) {
							// htResult.sCorrectedValue += " ";
						// }
					// }
					// welInput.$value().value =  this._sPreValue = htResult.sCorrectedValue;
				// } else {
					welInput.$value().value =  this._sPreValue = htResult.sCorrectedValue;
			//	}
			}
			// console.log("Validation Result : " + htResult.bValid + ", sCorrectedValue : " + htResult.sCorrectedValue);

			/**
				Input 에 값 입력시 유효한 값일 경우 발생.

				@event valid
				@param {String} sType 커스텀 이벤트명
				@param {Number} nIndex TextInput의 인덱스 (0부터 시작)
				@param {Object} htTextInput TextInput 정보 객체
					@param {jindo.$Element} welUnit TextInput Unit 엘리먼트
					@param {jindo.$Element} welInput input 엘리먼트
					@param {jindo.$Element} welDel 삭제 엘리먼트
				@param {Object} htValidate Validate 정보 객체
					@param {Boolean} bValid Validate 성공여부(항상 true반환)
					@param {String} sCorrectedValue 필터링 및 포맷팅 된 값이다. 이 값으로 Validate 한 결과값이 bValid이다,
					@param {String} sPreValue Validate 전 input 엘리먼트의 값

			**/
			/**
				input에 값 입력시 유효한 값이 아닐 경우 발생

				@event invalid
				@param {String} sType 커스텀 이벤트명
				@param {Number} nIndex TextInput의 인덱스 (0부터 시작)
				@param {Object} htTextInput TextInput 정보 객체
					@param {jindo.$Element} welUnit TextInput Unit 엘리먼트,
					@param {jindo.$Element} welInput input 엘리먼트,
					@param {jindo.$Element} welDel 삭제 엘리먼트
				@param {Object} htValidate Validate 정보 객체
					@param {Boolean} bValid Validate 성공여부(항상 false반환),
					@param {String} sCorrectedValue 필터링 및 포맷팅 된 값이다. 이 값으로 Validate 한 결과값이 bValid이다,
					@param {String} sPreValue Validate 전 input 엘리먼트의 값
			**/
			this.fireEvent( (htResult.bValid ? "valid" : "invalid"), {
				htValidate : htResult,
				htTextInput : this._aTextInput[nIdx],
				nIndex : nIdx
			});
		}
	},

	/**
		TextInput Box  에서 Focus 이벤트 처리.
		android일 경우, fouce가 2번 타는 문제 발생함

		@param {jindo.$Event} we 이벤트 객체.
	**/
	_onFocus : function(we){
		var nIdx = this.getIndex(we.element);
		var self=this;
		// if(jindo.m.getDeviceInfo().android) {
			// clearTimeout(this._nFocusTimer);
			// this._nFocusTimer = setTimeout(function() {
				// self._processFocus(nIdx);
			// },100);
		// } else {
			// self._processFocus(nIdx);
		// }

		this._processFocus(nIdx);
	},

	/**
		Focus 이벤트 발생시 처리하는 모듈
		@param {Number} nIdx 감시할 Element의 idx
	**/
	_processFocus : function(nIdx) {
		var htTextInput = this._aTextInput[nIdx];
		var welTextInputUnit = htTextInput.welUnit;
		var sCssName = this.option("sClassPrefix") + "focus";
		if(!welTextInputUnit.hasClass(sCssName)) {
			welTextInputUnit.addClass(sCssName);
		}

		// focus 사용자 이벤트 발생
		/**
			input에 포커스시 발생

			@event focus
			@param {String} sType 커스텀 이벤트명
			@param {Number} nIndex TextInput의 인덱스 (0부터 시작)
			@param {object} htTextInput TextInput 정보 객체
				{ welUnit (jindo.$Element) : TextInput Unit 엘리먼트,<br />
				welInput (jindo.$Element) : input 엘리먼트,<br />
				welDel (jindo.$Element) : 삭제 엘리먼트 }<br />
		**/
		this.fireEvent("focus", {
			nIndex : nIdx,
			htTextInput : htTextInput
		});
	},

	/**
		TextInput Box  에서 Blur 이벤트 처리.
		@param {jindo.$Event} we 이벤트 객체.
	**/
	_onBlur : function(we){
		var nIdx = this.getIndex(we.element);
		var self=this;
		if(jindo.m.getDeviceInfo().android) {
			clearTimeout(this._nBlurTimer);
			this._nBlurTimer = setTimeout(function() {
				self._processBlur(nIdx);
			},100);
		} else {
			self._processBlur(nIdx);
		}
	},

	/**
		Blur 이벤트 발생시 처리하는 모듈
		@param {Number} nIdx 감시할 Element의 idx
	**/
	_processBlur : function(nIdx) {
		this._aTextInput[nIdx].welUnit.removeClass(this.option("sClassPrefix") + "focus");
		// 입력값 변경을 감시할 Watcher 중지
		this._stopWatcher();
		if(this.option("bUseValidate")) {
			var welInput = this._aTextInput[nIdx].welInput;
			this._validate(welInput);
			this._displayClearBtn(welInput);
		}

		/**
			input에 포커스가 없어질 경우 발생

			@event blur
			@param {String} sType 커스텀 이벤트명
			@param {Number} nIndex TextInput의 인덱스 (0부터 시작)
			@param {Object} htTextInput TextInput 정보 객체
				{ welUnit (jindo.$Element) : TextInput Unit 엘리먼트,<br />
				welInput (jindo.$Element) : input 엘리먼트,<br />
				welDel (jindo.$Element) : 삭제 엘리먼트 }
		**/
		this.fireEvent("blur", {
			nIndex : nIdx,
			htTextInput : this._aTextInput[nIdx]
		});
	},

	/**
		'X' 버튼 이벤트 처리.
		@param {jindo.$Event} we 이벤트 객체.
	**/
	_onClear : function(we){
		//console.log("클리어...");
		var sUnitClass = this.option("sClassPrefix") + "textinput-unit",
			welBtn = jindo.$Element(we.element);

		// 마크업 의존성 제거 (상위에서 검색)
		if(!welBtn.hasClass(sUnitClass)) {
			var aP =welBtn.parent(function(v){
				return v.hasClass(sUnitClass);
			});
			if(aP.length > 0) {
				welBtn = aP[0];
			} else {
				return;
			}
		}

		var	nIndex = this.getIndex(welBtn),
			welInput = this._aTextInput[nIndex].welInput,
			htInfo = jindo.m.getDeviceInfo(),
			nVersion = parseInt(htInfo.version,10);
		welInput.$value().value = "";

		/**
			Android 3.x는 input값이 변경되는 경우, focus가 벗어나야 정상적으로 화면에 출력됨
			따라서, 할당된 이벤트를 제거후, blur를 주고, focus를 준 후, 다시 이벤트를 할당하여, 정상적으로 동작하도록 수정함.
			단, 삭제 후에 키패드가 사라지는 오류 발생
		**/
		if(htInfo.android && nVersion === 3) {
			this._detachUnitEvent(this._aTextInput[nIndex]);
			welInput.$value().blur();
			welInput.$value().focus();
			this._attachUnitEvent(this._aTextInput[nIndex]);
		} else {
			/**
				ios는 한글 자소 입력시 문제가 됨. "소" 입력후, 삭제버튼 클릭. 그 후 "ㅅ" 입력하면 "솟"으로 나옴
				단, ios5이상은 처리 가능함.
			**/
			if(!htInfo.android && nVersion > 4) {
				welInput.$value().blur();
				welInput.$value().focus();
			}
		}
		this._displayClearBtn(welInput);

		/**
			삭제 버튼을 눌러 Input 값을 삭제 할 경우 발생.

			@event clear
			@param {String} sType 커스텀 이벤트명
			@param {Number} nIndex TextInput의 인덱스 (0부터 시작)
			@param {Object} htTextInput TextInput 정보 객체
				{ welUnit (jindo.$Element) : TextInput Unit 엘리먼트,<br />
				welInput (jindo.$Element) : input 엘리먼트,<br />
				welDel (jindo.$Element) : 삭제 엘리먼트 }
		**/
		this.fireEvent("clear", {
			nIndex : nIndex,
			htTextInput : this._aTextInput[nIndex]
		});
		/*TODO 에이.. 스크롤 확인.. 정말 Cancel_all해야만 하는가?*/
		we.stop(jindo.$Event.CANCEL_ALL);
		return false;
	},

	/**
		Watcher를 제거한다.
	**/
	_stopWatcher : function() {
		this._sPreValue = null;
	},

	/**
		TextInput Box  에서 입력값 변경시 처리.
		@param {jindo.$Element} welInput 모니터링할 input 객체
	**/
	_onChange : function(welInput){
	    welInput = jindo.$Element(welInput.element);   // onInput 이벤트로 변경하면서 하위호환 유지
		var sValue = welInput.$value().value;
		if(this._sPreValue != sValue) {
			//console.log("값이 변경되었음...");
			this._sPreValue = sValue;

			/**
				input 글자를 입력시 발생.

				@event change
				@param {String} sType 커스텀 이벤트명
				@param {String} sPreValue 입력 하기 바로직전의 input 값.
				@param {Number} nIndex TextInput의 인덱스 (0부터 시작)
				@param {jindo.$Element} welInput (jindo.$Element) : Input 엘리먼트
			**/
			this.fireEvent("change", {
				sPreValue : sValue,
				welInput : welInput,
				nIndex : this.getIndex(welInput)
			});
			this._displayClearBtn(welInput);
		} else {
			//console.log("값이 변화없음.");
			this._displayClearBtn(welInput);
		}
	},

	/**
		TextInput Unit 엘리먼트 배열을 반환
		@param {Variant} vElement index를 찾을 TextInput Unit Element.
		@return {Array} jindo.$Element의 배열
	**/
	_getTextInputList : function(vElement){
		var aTextInputUnit = [],
			i,nLength;
		if(vElement) {
			if(vElement instanceof Array) {
				for(i=0, nLength = vElement.length; i<nLength; i++) {
					aTextInputUnit.push(jindo.$Element(vElement[i]));
				}
			} else {
				aTextInputUnit.push(jindo.$Element(vElement));
			}
		} else {
			for(i=0, nLength = this._aTextInput.length; i<nLength; i++) {
				aTextInputUnit.push(this._aTextInput[i].welUnit);
			}
		}
		return aTextInputUnit;
	},

	/**
		활성화 비활성화 OS별 설정.
		@param {Variant} vElement  활성화 / 비활성화 하는 TextInput Unit Element.
		@param {boolean} 활성화 / 비활성화 여부
		@return {[type]}
	**/
	 _useSettingUnit : function(vElement, bUse){
		var self = this;
		// Andorid인 경우 watcher가 돌고 있을 경우(즉, 포커스가 있는 경우), 포커스가 있는 input의 삭제버튼이 사라지지 않는 문제가 있었음
		this._stopWatcher();
		var aTextInputUnit = this._getTextInputList(vElement);
		if(jindo.m.getDeviceInfo().android) {
			setTimeout(function() {
				self._useSettingUnitCore(aTextInputUnit, bUse);
			},100);
		} else {
			self._useSettingUnitCore(aTextInputUnit, bUse);
		}
	},

	/**
		활성화 비활성화 설정.
		@param {aTextInputUnit} aTextInputUnit  활성화 / 비활성화 하는 TextInput Unit Element.
		@param {boolean} 활성화 / 비활성화 여부
	**/
	_useSettingUnitCore : function(aTextInputUnit, bUse){
		for (var i = 0, nLength = aTextInputUnit.length ; i < nLength ; i++) {
			if(bUse) {
				this._enableElement(aTextInputUnit[i]);
			} else {
				this._disableElement(aTextInputUnit[i]);
			}
		}

		/**
			TextInput이 활성화 되었을 경우 발생.

			@event enable
			@param {String} sType 커스텀 이벤트명
			@param {Array} aTextInputUnit 활성화된 input 엘리먼트(jindo.$Element) 참조 배열.
		**/
		/**
			TextInput이 비활성화 되었을 경우 발생

			@event disable
			@param {String} sType 커스텀 이벤트명
			@param {Array} aTextInputUnit 비활성화된 input 엘리먼트(jindo.$Element) 참조 배열.
		**/
		this.fireEvent( (bUse ? "enable" : "disable"),{
			aTextInputUnit: aTextInputUnit
		});
	},

	/**
		활성화 처리.
		@param {jindo.$Element} 활성화 TextInput Unit
	**/
	_enableElement : function(welUnit){
		var nIdx = this.getIndex(welUnit),
			welInput = this._aTextInput[nIdx].welInput;
		this._detachUnitEvent(this._aTextInput[nIdx]);
		this._attachUnitEvent(this._aTextInput[nIdx]);
		welUnit.removeClass(this.option("sClassPrefix") + "disable");
		welInput.$value().disabled = false;
		this._displayClearBtn(welInput);
	},

	/**
		비활성화 처리.
		@param {jindo.$Element} 활성화 TextInput Unit
	**/
	_disableElement : function(welUnit){
		var nIdx = this.getIndex(welUnit),
			welInput = this._aTextInput[nIdx].welInput,
			welDel = this._aTextInput[nIdx].welDel;
		this._detachUnitEvent(this._aTextInput[nIdx]);
		welUnit.addClass(this.option("sClassPrefix") + "disable");
		welInput.$value().disabled = true;
		if(welDel){
			welDel.hide();
		}
	},

	/**
		TextInput 을 활성화 시킨다.

		@method enable
		@param {Variant} vElement 활성화 할 TextInput Unit Element.
			TextInput Unit 엘리먼트 배열 또는 단일 TextInput Unit 엘리먼트가 입력 될수 있고, 입력값이 없을시 모든 TextInput Unit 엘리먼트가 기준이 된다.
		@example
			// 배열 활성화
			oTextInput.enable([jindo.$("unit1"),jindo.$("unit2")]);
			// 단일 활성화
			oTextInput.enable(jindo.$("unit1"));
			// 전체 활성화
			oTextInput.enable();
	**/
	enable : function(vElement){
		if(this.isActivating()) {
			this._useSettingUnit(vElement, true);
		}
	},

	/**
		TextInput 을 비활성화 시킨다.

		@method disable
		@param {Variant} vElement 비활성화 할 TextInput Unit Element.
			TextInput Unit 엘리먼트 배열 또는 단일 TextInput Unit 엘리먼트가 입력 될수 있고, 입력값이 없을시 모든 TextInput Unit 엘리먼트가 기준이 된다.
		@example
			// 배열 비활성화
			oTextInput.disable([jindo.$("unit1"),jindo.$("unit2")]);
			// 단일 비활성화
			oTextInput.disable(jindo.$("unit1"));
			// 전체 비활성화
			oTextInput.disable();
	**/
	disable : function(vElement){
		if(this.isActivating()) {
			this._useSettingUnit(vElement, false);
		}
	},

	/**
		index 번호로 TextInput Unit Element 를 반환한다.

		@method getElement
		@param {Number} nIdx 가져올 index 번호.
		@return {jindo.$Element} TextInput Unit Element 객체
		@example
			// 0번째 TextInput Unit Element 가져오기.
			var welUnit = oTextInput.getElement(0);
	**/
	getElement : function(nIdx){
		if(nIdx < this._aTextInput.length && nIdx >= 0) {
			return this._aTextInput[nIdx].welUnit;
		}
	},

	/**
		index 번호로 TextInput Input Element 를 반환한다.

		@method getInputElement
		@param {Number} nIdx 가져올 index 번호.
		@return {jindo.$Element} TextInput Input Element 객체
		@example
			// 0번째 TextInput Input Element 가져오기.
			var welInput = oTextInput.getInputElement(0);
	**/
	getInputElement : function(nIdx) {
		if(nIdx < this._aTextInput.length && nIdx >= 0) {
			return this._aTextInput[nIdx].welInput;
		}
	},

	/**
		index 번호로 TextInput Del Element 를 반환한다.

		@method getDelElement
		@param {Number} nIdx 가져올 index 번호.
		@return {jindo.$Element} TextInput Del Element 객체
		@example
			// 0번째 TextInput Del Element 가져오기.
			var welDel = oTextInput.getDelElement(0);
	**/
	getDelElement : function(nIdx) {
		if(nIdx < this._aTextInput.length && nIdx >= 0) {
			return this._aTextInput[nIdx].welDel;
		}
	},

	/**
		index 번호를 반환한다.

		@method getIndex
		@param {jindo.$Element, Element, String} nIdx 가져올 엘리먼트
		@return {Number} TextInput Index
	**/
	getIndex : function(ele) {
		return parseInt(jindo.$Element(ele).attr(jindo.m.TextInput.INDEX_ATTR),10);
	},

	/**
		TextInput Unit 개수를 반환

		@method getLength
		@return {Number} TextInput Unit 개수
	**/
	getLength : function() {
		return this._aTextInput.length;
	},

	/**
		jindo.m.Tab 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		this._attachEvent();
	},
	/**
		jindo.m.Tab 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEvent();
		this._stopWatcher();
	},
	/**
		jindo.m.TextInput 에서 사용하는 모든 객체를 release 시킨다.
		@method destroy
	**/
	destroy : function() {
		this.deactivate();
		for ( var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
	}
}).extend(jindo.m.UIComponent);