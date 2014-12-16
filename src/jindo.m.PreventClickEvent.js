/**
	@fileOverview 안드로이드 이벤트 투과 방지 컴포넌트
	@author sculove
	@version #__VERSION__#
	@since 2012. 2. 6
**/
/**
	안드로이드 이벤트 투과 방지 컴포넌트

	@class jindo.m.PreventClickEvent
	@extends jindo.m.UIComponent
	@keyword preventclickevent
	@group Component
	@deprecated

	@history 1.9.0 deprecated
	@history 1.2.0 Update Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Update Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 1.1.0 Release 최초 릴리즈
**/
jindo.m.PreventClickEvent = jindo.$Class({
	/* @lends jindo.m.PreventClickEvent.prototype */
	/**
		초기화 함수

		@constructor
		@param {Object} [htOption] 초기화 옵션 객체
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
			@param {String} [htOption.sClassPrefix="evt-"] 이벤트 통과 엘리먼트 지정 Class Prefix
	**/
	$init : function(el, htOption) {
		this.option({
			 bActivateOnload : true,
			 sClassPrefix : "evt-"
		});
		this.option(htOption || {});
		this._setWrapperElement(el);
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},

	/**
		jindo.m.PreventClickEvent 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
	**/
	_setWrapperElement: function(el) {
		this._htWElement = {};
		this._htWElement["target"] = jindo.$Element(el);
	},

	/**
		jindo.m.PreventClickEvent 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function(){
		this._detachEvents();
	},

	/**
		jindo.m.PreventClickEvent 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function(){
		this._attachEvents();
	},

	/**
		jindo.m.PreventClickEvent 사용하는 이벤트 attach 한다
	**/
	_attachEvents : function(){
		this._htEvent ={};
		this._htEvent["prevent"] = jindo.$Fn(this._onPrevent, this).attach(this._htWElement["target"], "touchstart");
	},


	/**
		jindo.m.PreventClickEvent 사용하는 이벤트 detach 한다
	**/
	_detachEvents : function(){
		this._htEvent["prevent"].detach(this._htWElement["target"], "touchstart");
		this._htEvent["prevent"] = null;
	},

	/**
		이벤트 방지 모듈
	**/
	_onPrevent : function(we) {
		var wel = jindo.$Element(jindo.m.getNodeElement(we.element));
		if(!wel.hasClass(this.option("sClassPrefix") + "except")) {
			we.stop(jindo.$Event.CANCEL_ALL);

			/**
				기준엘리먼트에서 이벤트가 중지된 경우, 사용자 이벤트가 발생

				@event prevent
				@param {String} sType 커스텀 이벤트명
				@param {$Element} wel 이벤트가 중지된 엘리먼트
			**/
			this.fireEvent("prevent", {
				wel : wel
			});
			return false;
		} else {
			/**
				기준엘리먼트에서 이벤트가 통과된 경우, 사용자 이벤트가 발생

				@event expand
				@param {String} sType 커스텀 이벤트명
				@param {$Element} wel 이벤트가 통과된 엘리먼트
			**/
			this.fireEvent("pass", {
				wel : wel
			});
		}
	},

	/**
		jindo.m.PreventClickEvent 에서 사용하는 모든 객체를 release 시킨다.
		@method destroy
	**/
	destroy : function() {
		this.deactivate();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
		this._htEvent = null;
	}
}).extend(jindo.m.UIComponent);
