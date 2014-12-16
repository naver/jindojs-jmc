/**
	@fileOverview 클릭 또는 드래그로 슬라이더 자를 토글시켜 On/Off를 설정할 수 있는 컴포넌트
	@author "oyang2"
	@version #__VERSION__#
	@since 2011. 9. 8.
**/
/**
	클릭 또는 드래그로 슬라이더 자를 토글시켜 On/Off를 설정할 수 있는 컴포넌트

	@class jindo.m.ToggleSlider
	@extends jindo.m.UIComponent
	@uses jindo.m.Touch
	@keyword toggleslider
	@group Component

	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Support Android 3.0/4.0 지원
	@history 1.1.0 Bug bStatus 옵션값을 false로 설정해도 기본값이 변하지 않던 문제 해결
	@history 1.1.0 Support jindo 2.0.0 mobile 버전 지원
	@history 0.9.0 Release 최초 릴리즈
**/
jindo.m.ToggleSlider = jindo.$Class({
	/* @lends jindo.m.ToggleSlider.prototype */
	/**
		초기화 함수

		@constructor
		@param {Object} [htOption] 초기화 옵션 객체
			@param {String} [htOption.sClassPrefix='tslider-'] Class의 prefix명
			@param {Boolean} [htOption.bUseDrag=true] 드래그 가능여부
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
			@param {Number} [htOption.nOnPosition=50] on 상태가 되는 thumb의 style left 퍼센트 속성
			@param {Number} [htOption.nOffPosition=0] off 상태가 되는 thumb의 style left 퍼센트 속성
			@param {Boolean} [htOption.bStatus=true] 초기 상태값 (on일 경우 true, off일경우 false)
			@param {Number} [htOption.nDuration=100]
	**/
	$init : function(sId, htOption) {
		this.option({
			sClassPrefix : 'tslider-',
			bUseDrag : true,
			bActivateOnload : true,
			nOnPosition : 50,
			nOffPosition: 0,
			bStatus : true,
			nDuration : 100
		});

		this.option(htOption || {});

		this._setWrapperElement(sId);
		this._initVar();

		if(this.option("bActivateOnload")) {
			this.activate();
			if(this.option('bStatus')){
				this.bStatusOn = false;
				this._move(true, false);
			}else{
				this.bStatusOn = true;
				this._move(false, false);
			}
		}
	},

	/**
		jindo.m.ToggleSlider 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar: function() {
		if(this._htWElement.track){
			this._oTouch = new jindo.m.Touch(this._htWElement.track.$value(),{
				nSlopeThreshold : 1,
				nMoveGap: 2,
				bActivateOnload: false
			});

			this._oTouch.attach({
				'touchMove' : jindo.$Fn(this._onMove, this).bind(),
				'touchEnd' : jindo.$Fn(this._onEnd, this).bind(),
				'touchStart' : jindo.$Fn(this._onStart, this).bind()
			});
		}else{
			this._oTouch = null;
		}

		this.bMove = false;
		this.bStatusOn = this.option('bStatus');
		this.htInfo = {
			nMax : Math.max(this.option('nOnPosition'), this.option('nOffPosition')),
			nMin : Math.min(this.option('nOnPosition'), this.option('nOffPosition')),
			nGap  : Math.round(Math.abs((this.option('nOnPosition')-this.option('nOffPosition'))/2))
		};

		this._wfTransitionEnd = jindo.$Fn(this._onTransitionEnd, this).bind();
		this._bFireChange = false;
//		this._bAnimation = false;
//		console.log('init ', this._bAnimation);
	},

	/**
		jindo.m.ToggleSlider 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
	**/
	_setWrapperElement: function(el) {
		this._htWElement = {};
		el = jindo.$(el);

		var sClass = '.' + this.option('sClassPrefix');

		this._htWElement.base = jindo.$Element(el);

		var aRadio = el? jindo.$$('[name='+this.option('sClassPrefix')+'radio]', el): null;
		this._htWElement.aRadio = jindo.$A(aRadio).forEach(function(value, index,array){
			array[index] = jindo.$Element(value);
		}).$value();

		this._htWElement.track = el? jindo.$Element(jindo.$$.getSingle(sClass+'track', el)) : null;
		this._htWElement.thumb = el? jindo.$Element(jindo.$$.getSingle(sClass+'thumb', el)) : null;
	},

	_onStart : function(oCustomEvt){
		//하이라이팅 막아버리기
		oCustomEvt.oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
	},
	_onMove : function(oCustomEvt){
		if(!this.option('bUseDrag')){ return;}
//		if(this._bAnimation){
//			return;
//		}

		oCustomEvt.oEvent.stop(jindo.$Event.CANCEL_DEFAULT);

		this.bMove = true;

		var nDis = oCustomEvt.nDistanceX;
       
		var n = this._getAdjustedPos(nDis);
		this._moveThumb(n);

	},

	_onEnd : function(oCustomEvt){
//		console.log('end', this._bAnimation);
//		if(this._bAnimation){
//			return;
//		}

		if(oCustomEvt.sMoveType == 'tap'){
			this.toggle();
		}else{
			if(this.bMove){
				var nCurrent = this.isOn()? this.option('nOnPosition') : this.option('nOffPosition');
				var nPos = this._getPosition();
				if( Math.abs(nCurrent- nPos) > this.htInfo.nGap ){
					this.toggle();
				}else{
					this._move(this.isOn(), false);
				}

			}else{
				this.toggle();
			}
		}

		this.bMove = false;
	},

	_move : function(bOn ,bFireEvent){
		if(typeof bFireEvent == 'undefined'){
			bFireEvent = true;
		}

		var nDis = this.option('nOffPosition');

		if(bFireEvent){

			/**
				현재 상태 값이 바뀌기 전에 발생한다.

				@event beforeChange
				@param {String} sType 커스텀 이벤트명
				@param {Boolean} bOn 현재 상태값이 On인지에 대한 여부
				@param {Function} stop 수행시 토글 슬라이더의 상태값이 바뀌지 않으며 change 이벤트가 발생하지 않는다.
			**/
			if(!this.fireEvent('beforeChange',{
				bOn : this.isOn()
			})){
				return false;
			}
		}

		if(bOn) {nDis = this.option('nOnPosition');}


		this._bFireChange = bFireEvent;

		this.bStatusOn = bOn;
		this._moveThumb(nDis, this.option('nDuration'));

		this._updateForm();
	},

	/**
		현재 상태값을 토글한다

		@method toggle
	**/
	toggle : function(){
		if(this.isOn()){
			this.off();
		}else{
			this.on();
		}
	},

	/**
		현재 상태값을 on으로 바꾼다

		@method on
	**/
	on : function(){
		if(!this.isOn()){
			this._move(true);
		}
	},

	/**
		현재 상태값을 off로 바꾼다

		@method off
	**/
	off : function(){
		if(this.isOn()){
			this._move(false);
		}
	},

	/**
		현재 상태이 on 인지 리턴한다

		@method isOn
		@return {Boolean} on인지 여부
	**/
	isOn : function(){
		return this.bStatusOn;
	},

	_updateForm : function(){
		if(!this._htWElement.aRadio){ return;}
		var value = this.isOn()? 'on' : 'off';

		for(var i=0,nLen = this._htWElement.aRadio.length;i<nLen; i++){
			var wel = this._htWElement.aRadio[i];
			if(wel.$value().value == value){
				wel.$value().checked = true;
			}else{
				wel.$value().checked = false;
			}
		}
	},

	_moveThumb : function(n, nTime){
		if(n > this.htInfo.nMax || n < this.htInfo.nMin ){ return;}

		if(typeof nTime == 'undefined'){
			nTime = 0;
		}

		var nCurrent = parseInt(this._htWElement.thumb.css('left'),10);

		if((nTime > 0) && (nCurrent !== n) ){
			this._attachTransitionEnd();
//			console.log('_attach', this._bAnimation, nTime);
//			this._bAnimation = true;
		}

		if(this._htWElement.thumb){
			this._htWElement.thumb.css('webkitTransitionDuration', nTime+'ms');
			this._htWElement.thumb.css('webkitTransitionProperty','left');
			this._htWElement.thumb.css('left' ,n+"%");
		}
		if(nTime === 0 || (nCurrent === n)){
			this._onTransitionEnd();
		}
	},

	_onTransitionEnd : function(){
		this._detachTransitionEnd();

		if(this._bFireChange){

			/**
				현재 status 값이 바뀔경우 발생한다.

				@event change
				@param {String} sType 커스텀 이벤트명
				@param {Boolean} bOn 현재 상태값이 On인지에 대한 여부
				@param {Function} stop 수행시 영향받는것 없다.
			**/
			this.fireEvent('change',{
				bOn : this.isOn()
			});
		}

		this._bFireChange = false;

//		this._bAnimation = false;
//		console.log('_onTransitionEnd', this._bAnimation);

	},

	/**
		transitionEnd 이벤트 attach
	**/
	_attachTransitionEnd : function(){
		jindo.m.attachTransitionEnd(this._htWElement.thumb.$value(), this._wfTransitionEnd);
	},

	/**
		transitionEnd 이벤트 detach
	**/
	_detachTransitionEnd : function(){
		jindo.m.detachTransitionEnd(this._htWElement.thumb.$value(), this._wfTransitionEnd);
	},

	_getAdjustedPos : function(nDis){

		var nPecent = Math.round((nDis * 100) / this._htWElement.track.width());

		nPecent = nPecent + (this.isOn()? this.option('nOnPosition') : this.option('nOffPosition'));

		nPecent = Math.max(this.htInfo.nMin, nPecent);
		nPecent = Math.min(this.htInfo.nMax, nPecent);

		return nPecent;
	},

	_getPosition : function(){
		var sPos = this._htWElement.thumb.css('left');

		return (sPos == "auto") ? 0 : parseInt(sPos, 10);
	},

	_onClick : function(evt){
		evt.stop(jindo.$Event.CANCEL_DEFAULT);
	},

	/**
		jindo.m.ToggleSlider 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		this._htEvent = {};
		// thumb click event 처리
		this._htEvent["click"] = {
			ref : jindo.$Fn(this._onClick, this).attach(this._htWElement.thumb, "click"),
			el	: this._htWElement.thumb
		};

	},

	/**
		특정 이벤트를 해제한다.
		@param {String} sEventKey 이벤트 키
	**/
	_detachEvent : function(sEventKey) {
		if(sEventKey) {
			var htTargetEvent = this._htEvent[sEventKey];
			htTargetEvent.ref.detach(htTargetEvent.el, sEventKey);
		}
	},

	/**
		jindo.m.ToggleSlider 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		this._attachEvent();
		if(this._oTouch){
			this._oTouch.activate();
		}
	},

	/**
		jindo.m.ToggleSlider 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEvent();
		if(this._oTouch){
			this._oTouch.deactivate();
		}
	},

	/**
		jindo.m.ToggleSlider 에서 사용하는 모든 객체를 release 시킨다.
		@method destroy
	**/
	destroy : function() {
		this.deactivate();

		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;

		this._oTouch.detachAll();
		this._oTouch = null;

		this.bMove = null;
		this.bStatusOn = null;
		this._wfTransitionEnd = null;
		this._bFireChange = null;

	}
}).extend(jindo.m.UIComponent);