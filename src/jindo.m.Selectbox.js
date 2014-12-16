/**
	@fileOverview Form Element의 selectbox를 모바일에 환경에 맞게 커스터마이징한 컴포넌트
	@author sculove
	@version #__VERSION__#
	@since 2012. 5. 31.
**/
/**
	Form Element의 selectbox를 모바일에 환경에 맞게 커스터마이징한 컴포넌트

	@class jindo.m.Selectbox
	@extends jindo.m.UIComponent
	@uses jindo.m.Scroll
	@keyword selectbox, 셀렉트박스
	@group Component

  @history 1.7.0 안드로이드 2.3.6 버전에서 native selectbox 에 opacity 값을 0으로 주면 선택이 되지 않는 문제 해결
    @history 1.7.0 Bug 안드로이드 4.x 갤럭시 시리즈에서 하이라이트 사라지지 않는 문제 제거
	@history 1.3.0 Release 최초 릴리즈
**/
jindo.m.Selectbox = jindo.$Class({
	/* @lends jindo.m.Selectbox.prototype */
	/**
		초기화 함수

		@constructor
		@param {Varient} el input 엘리먼트 또는 ID
		@param {Object} [htOption] 초기화 옵션 객체
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
			@param {String} [htOption.sClassPrefix="select-"] Class의 prefix명
			@param {String} [htOption.sPlaceholder="선택해주세요"] 선택된 아이템이 없을 경우, context영역에 표시되는 안내문구
			@param {Number} [htOption.nHeight=80] 사용자 디자인 형태일 경우 selecmenu의 height 크기
			@param {String} [htOption.sItemTag="li"] 사용자 디자인 형태일 경우 selecmenu의 구성 아이템 태그
			@param {Number} [htOption.nDefaultIndex=-1] 초기 설정되는 값의 인덱스
	**/
	$init : function(el, htOption) {
		this.option({
			bActivateOnload : true,
			sClassPrefix : "select-",
			sPlaceholder : "선택해주세요",
			nHeight : 80,
			sItemTag : "li",
			nDefaultIndex : -1
		});
		this.option(htOption || {});
		this._initVar();
		this._setWrapperElement(el);
		this._init();
		if(this.option("bActivateOnload")) {
			this.activate();
			this.select(this.option("nDefaultIndex"));
		}
	},
	/**
		jindo.m.Selectbox 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar : function() {
		this._isNative = false;
		this._oScroll = null;
		this._sClassPrefix = this.option("sClassPrefix");
		this._aItems = null;
		this._nCurrentIdx = -1;
	},

	/**
		jindo.m.Selectbox 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
		@param {Varient} el 엘리먼트를 가리키는 문자열이나, HTML엘리먼트
	**/
	_setWrapperElement: function(el) {
		this._htWElement = {};
		this._htWElement["base"] = jindo.$Element(el);
		this._htWElement["content"] = jindo.$Element(this._htWElement["base"].query("." + this._sClassPrefix + "content"));
		this._htWElement["arrow"] = jindo.$Element(this._htWElement["base"].query("." + this._sClassPrefix + "arrow"));
		this._htWElement["selectmenu"] = jindo.$Element(this._htWElement["base"].query("." + this._sClassPrefix + "selectmenu"));
	},

	/**
		jindo.m.Selectbox 에서 사용하는 모든 엘리먼트의 속성을 설정한다.
	**/
	_init : function() {
		this._isNative = this._htWElement["selectmenu"].$value().tagName == "SELECT" ? true : false;
		this._htWElement["base"].css({
			"position" : "relative",
			"display" : "-webkit-box",
			"-webkit-box-align" : "center",
			"-webkit-box-pack" : "center",
			"-webkit-tap-highlight-color" : "transparent"
		});
		this._htWElement["content"].css({
			"display" : "block",
			"overflow" : "hidden",
			"text-overflow" : "ellipsis",
			"cursor" : "pointer",
			"text-align" : "center",
			"width" : "90%"
		});

		if(this._htWElement["arrow"]) {
			this._htWElement["arrow"].css({
				"position" : "relative",
				"text-align" : "right",
				"display" : "block",
				"text-algn" : "right"
			});
		}
		this._htWElement["selectmenu"].css({
			"position" : "absolute",
			"left" : "0px",
			// "top" : "60px",
			"margin" : "0px",
			"zIndex" : 100
		});

		if(this._isNative) {
			this._htWElement["selectmenu"].css({
				"opacity" : "0.0001",
				"height" : "100%",
				"min-height" : "100%",
				"width" : "100%"
			});
		} else {
			this._htWElement["selectmenu"].css({
				"width" : "100%"
			}).hide();
			this._htWElement["selectmenu"].first().css("width","100%");
			this._oScroll = new jindo.m.Scroll(this._htWElement["selectmenu"].$value(), {
				nHeight : this.option("nHeight"),
				bUseScrollbar : false,
				bUseMomentum : true,
				bUseHighlight : false,
				bUseBounce : true
			});
		}
		this._refreshItems();
	},


	/**
		jindo.m.Selectbox 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		this._attachEvent();
	},

	/**
		jindo.m.Selectbox 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEvent();
	},

	/**
		jindo.m.Selectbox 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		this._htEvent = {};
		if(this._isNative) {
			this._htWElement["selectmenu"].show();
		} else {
			this._htEvent["selectmenu"] = jindo.$Fn(this._onShow,this).attach(this._htWElement["base"], "click");
			this._htEvent["document"] = jindo.$Fn(this._onDocumentStart, this).attach(document, "touchstart");
		}
		this._htEvent["select"] = jindo.$Fn(this._onSelect,this).attach(this._htWElement["selectmenu"], this._isNative ? "change" : "click");
	},

	/**
		jindo.m.Selectbox 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEvent : function(){
		if(this._isNative) {
			this._htWElement["selectmenu"].hide();
		} else {
			this._htEvent["selectmenu"].detach(this._htWElement["base"], "click");
			this._htEvent["document"].detach(document, "touchstart");
		}
		this._htEvent["select"].detach(this._htWElement["selectmenu"], this._isNative ? "change" : "click");
		this._htEvent = null;
	},

	/**
		메뉴의 아이템 선택시 나타나는 이벤트 핸들러
		@param  {jindo.$Event} we
	**/
	_onShow : function(we) {
		this._showMenuForCustom();
	},

	/**
		사용자 디자인일 경우, 선택시 메뉴 나타나는 이벤트 핸들러
		@param  {jindo.$Event} we
	**/
	_onSelect : function(we) {
		// console.log("onSelect");
		if(this._isNative) {
			 this.select(we.element.selectedIndex);
		} else {
			var welParent = jindo.$Element(we.element).parent();
			this.select(welParent.indexOf(we.element));
		}
		we.stop();
	},

	/**
		스크롤 도중 scroll 영역 바깥을 선택하였을시, 스크롤을 중지시킴
		@param {jindo.$Event} we
	**/
	_onDocumentStart : function(we) {
		if(this._htWElement["selectmenu"].visible()) {
			if(this._htWElement["selectmenu"].isParentOf(we.element) || this._htWElement["selectmenu"].isEqual(we.element) ) {
				return true;
			} else {
				this._hideMenuForCustom();
			}
		}
	},

	/**
		인덱스에 해당하는 엘리먼트를 선택한다.

		@method select
		@param  {Number} nIdx 인덱스
		@example
			oSelect.select(nIdx);  // nIdx의 아이템을 선택한다.
	**/
	select : function(nIdx) {
		if(0 <= nIdx && nIdx < this._aItems.length) {
			if(nIdx != this._nCurrentIdx) {

				/**
					아이템 선택되기 전에 발생하는 사용자 이벤트

					@event beforeSelect
					@param {String} sType 커스텀 이벤트명
					@param {Number} nCurrentIdx 현재 선택된 아이템의 index
					@param {String} sValue 현재 선택된 아이템의 값
					@param {Function} stop 달력이 새로 그려지지 않도록 중단시키는 메소드
				**/
				if(this.fireEvent("beforeSelect", {
					nCurrentIdx : this._nCurrentIdx,
					sValue : this.getValue()
				})) {
					if(this._isNative) {
						this._aItems[nIdx].selected = true;
						this._setValue(this._aItems[nIdx].value);
					} else {
						var wel = jindo.$Element(this._aItems[nIdx]);
						if(this._aItems[this._nCurrentIdx]) {
							jindo.$Element(this._aItems[this._nCurrentIdx]).removeClass(this._sClassPrefix + "selected");
						}
						wel.addClass(this._sClassPrefix + "selected");
						this._setValue(wel.text());
						this._hideMenuForCustom();
					}
					var nPrevIdx = this._nCurrentIdx;
					this._nCurrentIdx = nIdx;

				/**
					아이템 선택된 후에 발생하는 사용자 이벤트

					@event select
					@param {String} sType 커스텀 이벤트명
					@param {Number} nPrevIdx 선택되기 전 아이템의 index
					@param {Number} nCurrentIdx 선택된 아이템의 index
					@param {String} sPrevValue 선택되기 전 아이템의 값
					@param {String} sValue 선택된 아이템의 값
				**/
					this.fireEvent("select", {
						nPrevIdx : nPrevIdx,
						sPrevValue : this.getValue(nPrevIdx),
						nCurrentIdx : this._nCurrentIdx,
						sValue : this.getValue()
					});
				}
			}
		} else {
			this._setValue(this.option("sPlaceholder"));
		}
	},

	/**
		custom 셀렉트 메뉴일 경우, 보이게 한다.
	**/
	_showMenuForCustom : function() {
		if(!this._isNative && !this._htWElement["selectmenu"].visible()) {
			this._htWElement["selectmenu"].show();
			var nItemHeight = jindo.$Element(this._htWElement["selectmenu"].query(this.option("sItemTag"))).height();
			this._oScroll.refresh();
			this._oScroll.scrollTo(0, this._nCurrentIdx < 0 ? 0 : -this._nCurrentIdx * nItemHeight);
			this._htEvent["selectmenu"].detach(this._htWElement["base"], "click");
		}
	},

	/**
		custom 셀렉트 메뉴일 경우, 보이게 한다.
	**/
	_hideMenuForCustom : function() {
		if(!this._isNative && this._htWElement["selectmenu"].visible()) {
			this._htWElement["selectmenu"].hide();
			this._htEvent["selectmenu"].attach(this._htWElement["base"], "click");
		}
	},

	/**
		아이템 정보를 재갱신한다.
	**/
	_refreshItems : function() {
		if(this._isNative) {
			this._aItems = this._htWElement["selectmenu"].$value().options;
		} else {
			this._aItems = this._htWElement["selectmenu"].queryAll(this.option("sItemTag"));
		}
	},

	/**
		데이터를 갱신하여줌.

		@method refresh
		@param  {Array} aData 실제 데이터 배열
		@example
			oSelect.refresh(aData);  // aData로 데이터를 갱신
	**/
	refresh : function(aData) {
		var sHTML = "";
		var sItemTag = this._isNative ? "option" : this.option("sItemTag");
		for(var i=0, nLength = aData.length; i < nLength; i++) {
			sHTML += "<";
			sHTML += sItemTag;
			sHTML += ">";
			sHTML += aData[i];
			sHTML += "</";
			sHTML += sItemTag;
			sHTML += ">";
		}
		if(this._isNative) {
			this._htWElement["selectmenu"].html(sHTML);
		} else {
			this._htWElement["selectmenu"].first().html(sHTML);
		}
		this._refreshItems();
		this._nCurrentIdx = -1;
		this.select(this._nCurrentIdx);
	},

	/**
		값을 설정한다.
		@param {String} sValue 선택된 내용의 값을 설정한다.
	**/
	_setValue : function(sValue) {
		this._htWElement["content"].text(sValue);
	},

	/**
		현재 인덱스 값을 반환한다.

		@method getCurrentIdx
		@return {Number}  현재 설정된 인덱스 값
	**/
	getCurrentIdx : function() {
		return this._nCurrentIdx;
	},

	/**
		현재 선택된 아이템의 이름을 반환하거나, 특정 인덱스에 해당하는 아이템의 이름을 반환한다.

		@method getValue
		@param  {Number} nIdx 옵션.
		@return {String}		인덱스를 줄경우, 인덱스에 해당하는 아이템의 이름을 반환.
		@example
			oSelect.getValue(); // 현재 선택된 아이템의 값을 반환
			oSelect.getValue(2); // 인덱스2인 아이템의 값을 반환
	**/
	getValue : function(nIdx) {
		var sValue = "";
		nIdx = (typeof nIdx === "undefined") ? this._nCurrentIdx : nIdx;
		if(0<= nIdx && nIdx < this._aItems.length) {
			if(this._isNative) {
				sValue = this._aItems[nIdx].value;
			} else {
				sValue = jindo.$Element(this._aItems[nIdx]).text();
			}
		}
		return sValue;

	},

	/**
		disable 한다.

		@method disable
		@example
			oSelect.disable();
	**/
	disable : function() {
		var sClassName = this._sClassPrefix + "disable";
		if(this._htWElement["base"].hasClass(sClassName)) {
			return;
		}
		this._htWElement["base"].addClass(sClassName);
		if(this._isNative) {
			this._htWElement["selectmenu"].hide();
		} else {
			this._htWElement["selectmenu"].hide();
			this._htEvent["selectmenu"].detach(this._htWElement["base"], "click");
		}
	},

	/**
		enable한다.

		@method enable
		@example
			oSelect.enable();
	**/
	enable : function() {
		var sClassName = this._sClassPrefix + "disable";
		if(!this._htWElement["base"].hasClass(sClassName)) {
			return;
		}
		this._htWElement["base"].removeClass(this._sClassPrefix + "disable");
		if(this._isNative) {
			this._htWElement["selectmenu"].show();
		} else {
			this._htEvent["selectmenu"].attach(this._htWElement["base"], "click");
		}
	},

	/**
		jindo.m.Selectbox 에서 사용하는 모든 객체를 release 시킨다.

		@method destroy
		@example
			oSelect.destroy();
	**/
	destroy : function() {
		this.deactivate();
		if(this._oScroll) {
			this._oScroll.destroy();
		}
	}
}).extend(jindo.m.UIComponent);