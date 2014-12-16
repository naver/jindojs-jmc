/**
	@fileOverview 특정 Layer의 Show/Hide를 처리하는 컴포넌트 (터치가 발생한 위치에따라 Show/Hide 여부를 판단)
	@author sculove
	@version #__VERSION__#
	@since 2011. 6. 30.
**/
/**
	특정 Layer의 Show/Hide를 처리하는 컴포넌트 (터치가 발생한 위치에따라 Show/Hide 여부를 판단)

	@class jindo.m.LayerManager
	@extends jindo.m.UIComponent
	@uses jindo.m.Touch
	@keyword layer, manager, 레이어, 관리
	@group Component

	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 0.9.0 Release 최초 릴리즈
**/
jindo.m.LayerManager = jindo.$Class({
	/* @lends jindo.m.LayerManager.prototype */
	/**
		초기화 함수

		@constructor
		@param {HTMLElement | String} el 숨기고자하는 레이어 엘리먼트 (혹은 id)
		@param {Object} [htOption] 초기화 옵션 객체
			@param {Boolean} [htOption.bActivateOnload=true] <auidoc:see content="jindo.m.LayerManager">LayerManager</auidoc:see> 컴포넌트가 로딩 될때 활성화 시킬지 여부를 결정한다.<br />
			false로 설정하는 경우에는 LayerManager.activate()를 호출하여 따로 활성화 시켜야 한다.
	**/
	$init : function(el,htOption) {
		var oDeviceInfo = jindo.m.getDeviceInfo();
		this.option({
			bActivateOnload : true
		});
		this.option(htOption || {});
		this._initVar();
		this._setWrapperElement(el);
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},

	/**
		인스턴스 변수를 초기화한다.
	**/
	_initVar : function() {
		this._aLink = [];
		this._oTouch = null;
	},

	/**
		jindo.m.LayerManager 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
	**/
	_setWrapperElement : function(el) {
		this._htWElement = {};
		this.setLayer(el);
	},

	/**
		jindo.m.LayerManager 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		this._attachEvent();
	},

	/**
  		jindo.m.LayerManager 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEvent();
	},

	/**
		보여주고 숨겨줄 레이어 객체를 설정한다.

		@method setLayer
		@param {HTMLElement} el 보이고 숨겨줄 엘리먼트
		@return {this}
	**/
	setLayer : function(el) {
		el = (typeof el == "string" ? jindo.$(el) : el);
		this._htWElement["element"] = jindo.$Element(el);
		this._htWElement["element"].css("position", "absolute");
		return this;
	},

	/**
		Layer가 보여지고 있는지 여부를 가져온다.

		@method getVisible
		@return {Boolean} Layer 가 보여지고 있는지 여부
	**/
	getVisible : function(){
		return this._htWElement["element"].visible();
	},

	/**
		보여주고 숨겨줄 레이어 객체를 가져온다.

		@method getLayer
		@return {HTMLElement} 레이어 엘리먼트
	**/
	getLayer : function() {
		return this._htWElement["element"].$value();
	},

	/**
		link된 엘리먼트 배열을 가져온다.

		@method getLinks
		@return {Array} Link 된 엘리먼트 배열
	**/
	getLinks : function() {
		return this._aLink;
	},

	/**
		생성자의 옵션으로 지정한 이벤트가 발생해도 레이어를 닫지 않게 할 엘리먼트를 지정한다

		@method link
		@param {vElement} vElement 이벤트를 무시할 엘리먼트 또는 엘리먼트의 ID (인자를 여러개 주어서 다수 지정 가능)
		@return {this} 인스턴스 자신
		@example
			o.link(jindo.$("one"), "two", oEl);
	**/
	link : function(vElement){
		if (arguments.length > 1) {
			for (var i = 0, len = arguments.length; i < len; i++) {
				this.link(arguments[i]);
			}
			return this;
		}
		if (this._find(vElement) != -1) {
			return this;
		}
		this._aLink.push(vElement);
		return this;
	},

	/**
		생성자의 옵션으로 지정한 이벤트가 발생해도 레이어를 닫지 않게 할 엘리먼트 지정한 것을 제거한다

		@method unlink
		@param {vElement} vElement 이벤트가 무시된 엘리먼트 또는 엘리먼트의 ID (인자를 여러개 주어서 다수 지정 가능)
		@return {this} 인스턴스 자신
		@example
			o.unlink(jindo.$("one"), "two", oEl);
	**/
	unlink : function(vElement){
		if (arguments.length > 1) {
			for (var i = 0, len = arguments.length; i < len; i++) {
				this.unlink(arguments[i]);
			}
			return this;
		}
		var nIndex = this._find(vElement);
		if (nIndex > -1) {
			this._aLink.splice(nIndex, 1);
		}
		return this;
	},

	/**
		el에 발생한 이벤트를 무시할것인지를 결정
		@param {Object} el
		@return {Boolean} 무시할 경우 true, 무시하지 않을 경우 false
	**/
	_check : function(el){
		var wel = jindo.$Element(el);
		for (var i = 0, elLink, welLink; (elLink = this._aLink[i]); i++) {
			welLink = jindo.$Element(elLink);
			if (welLink) {
				elLink = welLink.$value();
				if (elLink && (el == elLink || wel.isChildOf(elLink))) {
					return true;
				}
			}
		}
		return false;
	},

	/**
		Link에 el이 포함되었는지 여부 확인
		@param {Object} el
		@return {Number} 포함된 index 반환, 없을시 -1
	**/
	_find : function(el){
		for (var i = 0, elLink; (elLink = this._aLink[i]); i++) {
			if (elLink == el) {
				return i;
			}
		}
		return -1;
	},

	/**
		beforeShow 사용자 이벤트 호출
	**/
	_fireEventBeforeShow : function() {
		/**
			Layer를 보여주기 전에 발생

			@event beforeShow
			@param {String} sType 커스텀 이벤트명
			@param {HTMLElement} elLayer 보여지고 감춰지는 대상 Layer
			@param {Array} aLinkedElement Link된 엘리먼트들
			@param {Function} stop show를 중지한다. beforeShow이후 커스텀 이벤트(show)가 발생하지 않는다.
		**/
		return this.fireEvent("beforeShow", {
			elLayer : this.getLayer(),
			aLinkedElement : this.getLinks()
		});
	},

	/**
		show 사용자 이벤트 호출
	**/
	_fireEventShow : function() {
		/**
			Layer를 보여준 후에 발생

			@event show
			@param {String} sType 커스텀 이벤트명
			@param {HTMLElement} elLayer 보여지고 감춰지는 대상 Layer
			@param {Array} aLinkedElement (Array) : Link된 엘리먼트들
			@param {Function} stop stop를 호출하여 영향 받는 것이 없음.
		**/
		this.fireEvent("show", {
			elLayer : this.getLayer(),
			aLinkedElement : this.getLinks()
		});
	},

	/**
		beforeHide 사용자 이벤트 호출
	**/
	_fireEventBeforeHide : function(el) {
		/**
			Layer를 감추기 전에 발생

			@event beforeHide
			@param {String} sType 커스텀 이벤트명
			@param {HTMLElement} elTarget 이벤트가 발생한 엘리먼트
			@param {HTMLElement} elLayer 보여지고 감춰지는 대상 Layer
			@param {Array} aLinkedElement (Array) : Link된 엘리먼트들
			@param {Function} stop hide를 중지한다. beforeHide이후 커스텀 이벤트(hide)가 발생하지 않는다.
		**/
		return this.fireEvent("beforeHide", {
			elTarget : el,
			elLayer : this.getLayer(),
			aLinkedElement : this.getLinks()
		});
	},

	/**
		hide 사용자 이벤트 호출
	**/
	_fireEventHide : function(el) {
		/**
			Layer를 감춘 후에 발생

			@event hide
			@param {String} sType 커스텀 이벤트명
			@param {HTMLElement} elTarget 이벤트가 발생한 엘리먼트
			@param {HTMLElement} elLayer 보여지고 감춰지는 대상 Layer
			@param {Array} aLinkedElement (Array) : Link된 엘리먼트들
			@param {Function} stop stop를 호출하여 영향 받는 것이 없음.
		**/
		this.fireEvent("hide", {
			elTarget : el,
			elLayer : this.getLayer(),
			aLinkedElement : this.getLinks()
		});
	},

	/**
		레이어를 보여준다.

		@method show
		@return {this}
	**/
	show : function() {
		if (!this.getVisible()) {
			if (this._fireEventBeforeShow()) {
				this._htWElement["element"].show();
				this._fireEventShow();
			}
		}
		return this;
	},

	/**
		레이어를 숨긴다.

		@method hide
		@param {HTMLElement} el 이벤트의 타겟을 받는 엘리먼트
		@return {this}
	**/
	hide : function(el) {
		if (this.getVisible()) {
			if (this._fireEventBeforeHide(el)) {
				this._htWElement["element"].hide();
				this._fireEventHide(el);
			}
		}
		return this;
	},

	/**
		레이어를 보여주거나 숨기도록 요청한다

		@method toggle
		@return {this} 인스턴스 자신
	**/
	toggle: function(){
		if (this.getVisible()) {
			this.hide();
		} else {
			this.show();
		}
		return this;
	},

	/**
		레이어의 이벤트를 처리한다.
		@param {Object} we
	**/
	_onEvent : function(we){
		var el = we.element;
		if (this.getVisible()) {
			if (this._check(el)) { // hide()수행중이 아니고 links 객체들 안에서 발생한거면 무시

				/**
					Layer를 감춘 후에 발생

					@event ignore
					@param {String} sType 커스텀 이벤트명
					@param {HTMLElement} elTarget 이벤트가 발생한 엘리먼트
					@param {Function} stop stop를 호출하여 영향 받는 것이 없음.
				**/
				this.fireEvent("ignore", {
					elTarget : el
				});
			} else { //이벤트에 의해 hide()
				this.hide(el);
				return true;
			}
			we.stop();
		}
	},

	/**
		jindo.m.LayerManager 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		var self = this;
		this._oTouch = new jindo.m.Touch(document).attach("touchEnd", function(we) {
			if(we.sMoveType === jindo.m.MOVETYPE[3]) {
				self._onEvent(we);
			}
		});
	},

	/**
		jindo.m.LayerManager 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEvent : function() {
		if(this._oTouch) {
			this._oTouch.detachAll("touchEnd");
		}
	},

	/**
		jindo.m.LayerManager 객체를 release 시킨다.
		@method destroy
	**/
	destroy : function() {
		this.deactivate();

		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
		delete this._aLink;
		delete this._oTouch;
	}
}).extend(jindo.m.UIComponent);