/**
	@fileOverview UI 컴포넌트를 구현하기 위한 코어 클래스
	@version #__VERSION__#
**/
/**
	UI Component에 상속되어 사용되는 Jindo Mobile Component의 Core

	@class jindo.m.UIComponent
	@extends jindo.m.Component
	@keyword uicomponent, component, 유아이컴포넌트
	@group Component
	@invisible
**/
jindo.m.UIComponent = jindo.$Class({
	/** @lends jindo.m.UIComponent.prototype */
		
	/**
		@constructor
		jindo.m.UIComponent를 초기화한다.
	**/
	$init : function() {
		this._bIsActivating = false; //컴포넌트의 활성화 여부
	},

	/**
		컴포넌트의 활성여부를 가져온다.
		
		@method isActivating
		@return {Boolean} 활성화 여부
	**/
	isActivating : function() {
		return this._bIsActivating;
	},

	/**
		컴포넌트를 활성화한다.
		_onActivate 메서드를 수행하므로 반드시 상속받는 클래스에 _onActivate 메서드가 정의되어야한다.
		
		@method activate
		@return {this}
	**/
	activate : function() {
		if (this.isActivating()) {
			return this;
		}
		this._bIsActivating = true;
		
		if (arguments.length > 0) {
			this._onActivate.apply(this, arguments);
		} else {
			this._onActivate();
		}
				
		return this;
	},
	
	/**
		컴포넌트를 비활성화한다.
		_onDeactivate 메서드를 수행하므로 반드시 상속받는 클래스에 _onDeactivate 메서드가 정의되어야한다.
		
		@method deactivate
		@return {this}
	**/
	deactivate : function() {
		if (!this.isActivating()) {
			return this;
		}
		this._bIsActivating = false;
		
		if (arguments.length > 0) {
			this._onDeactivate.apply(this, arguments);
		} else {
			this._onDeactivate();
		}
		
		return this;
	}
}).extend(jindo.m.Component);	
