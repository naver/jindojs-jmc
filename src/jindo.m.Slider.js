/**
	@fileOverview 클릭 또는 드래그로 슬라이더 바를 이동시켜 값을 설정할 수 있는 컴포넌트
	@author "oyang2"
	@version #__VERSION__#
	@since 2011. 9. 5.
**/
/**
	클릭 또는 드래그로 슬라이더 바를 이동시켜 값을 설정할 수 있는 컴포넌트

	@class jindo.m.Slider
	@extends jindo.m.UIComponent
	@uses jindo.m.Touch
	@keyword slider, thumb, track, 슬라이더
	@group Component
    @update

    @history 1.16.0 Update Touch 관련 옵션 인터페이스 변경
    @history 1.16.0 bug Thumb 버튼을 선택했을때 change 이벤트가 발생하지 않도록 변경
	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 0.9.0 Release 최초 릴리즈
**/
jindo.m.Slider = jindo.$Class({
	/* @lends jindo.m.Slider.prototype */
	/**
		초기화 함수
		@constructor
		@param {String | HTMLElement} sId 기준 엘리먼트
		@param {Object} htOption 초기화 옵션 설정을 위한 객체
			@param {String} [htOption.sClassPrefix='slider-'] Class의 prefix명
			@param {Boolean} [htOption.bVertical=false] 슬라이더 세로 여부
			@param {Number} [htOption.nMinValue=0] 슬라이더의 최소값
			@param {Number} [htOption.nMaxValue=100] 슬라이더의 최대값
			@param {Number} [htOption.nDefaultValue=0] 슬라이더의 초기 로드 값
			@param {Number} [htOption.nMoveThreshold=0] 내부 Touch 컴포넌트에서 사용하는 move 최소 단위 움직임 픽셀
            @param {Number} [htOption.nSlopeThreshold=5] 내부 Touch 컴포넌트에서 사용하는 방향성(수직,수평,대각선)을 판단하는 움직인 거리
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
		@example
			var oSlider = new jindo.m.Slider('slider1', {
				sClassPrefix : 'slider-', //클래스명 접두어
				bVertical : false, //슬라이더 세로 여부
				nMinValue : 0, //슬라이더 최소값
				nMaxValue : 100, //슬라이더 최대값
				nDefaultValue : 0 , //초기 로드 thumb 값
				nMoveThreshold : 0,  // 내부 Touch 컴포넌트에서 사용하는 move 최소 단위 움직임 픽셀
				nSlopeThreshold : 5,  // 내부 Touch 컴포넌트에서 사용하는 방향성(수직,수평,대각선)을 판단하는 움직인 거리
				bActivateOnload : true // 활성화여부
			}).attach({
				'beforeChange' : function(oCustomEvt){

				},
				'change' : function(oCustomEvt){

				}
			})
	**/
	$init : function(sId, htOption) {
		this.option({
			 sClassPrefix : 'slider-',
			 bVertical : false,
			 nMinValue : 0,
			 nMaxValue : 100,
			 nDefaultValue : 0,
			 nMoveThreshold : 0,
			 nSlopeThreshold : 5,
			 bActivateOnload : true
		});
		this.option(htOption || {});

		this._setWrapperElement(sId);
		this._initVar();

		if(this.option("bActivateOnload")) {
			this.activate();
			this.setValue(this.option('nDefaultValue'));
		}
	},

	/**
		jindo.m.Slider 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar: function() {
//		var nMove = this.option('bVertical')? 0: 0;
//		nMove = jindo.m.getDeviceInfo().win? 0 : nMove;

		this._oTouch = new jindo.m.Touch(this._htWElement.track.$value(),{
            nTapThreshold : 1,
			nMoveThreshold: this.option("nMoveThreshold"),
            nSlopeThreshold : this.option("nSlopeThreshold"),
            bHorizental : !this.option("bVertical"),
            bVertical : this.option("bVertical"),
            nEndEventThreshold : (jindo.m.getDeviceInfo().win8 ? 100 : 0),
			bActivateOnload: false
		});
		//
		this._oTouch.attach({
			'touchMove' : jindo.$Fn(this._onMove, this).bind(),

			/**
				Thumb에 손을 떼었을 때 발생

				@event touchEnd
				@param {Number} nValue 현재 Thumb의 위치의 계산된 슬라이더 값
				@param {Number} nPosition 현재 Thumb의 위치의 전체 track대비의 퍼센트 값
				@history 1.4.0 Update 사용자 이벤트 추가
			**/
			'touchEnd' : jindo.$Fn(this._onMove, this).bind(),
			'touchStart' : jindo.$Fn(this._onStart, this).bind()
		});

		this._htSwap ={
			left : this.option('bVertical')? 'top' : 'left',
			width :  this.option('bVertical')? 'height' : 'width',
			nX :  this.option('bVertical')? 'nY' : 'nX'
		};
        this._nPos = this._nBeforeValue = 0;
		//size 조정
		var nSize = this._htWElement.thumb[this._htSwap.width]()/2;
		this._htWElement.thumb.css('margin-'+this._htSwap.left, nSize*-1);
	},

	/**
		jindo.m.Slider 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
	**/
	_setWrapperElement: function(el) {
		this._htWElement = {};
		el = jindo.$(el);
		var sClass = '.' + this.option('sClassPrefix');

		this._htWElement.track = jindo.$Element(el);
		var elThumb = jindo.$$.getSingle(sClass+'thumb', el);
		this._htWElement.thumb = elThumb? jindo.$Element(elThumb) : null;
		var elRang = jindo.$$.getSingle(sClass+'range', el);
		this._htWElement.range = elRang? jindo.$Element(elRang) : null;
	},

	_onStart : function(oCustomEvt){
		var htParam = {
			nValue : this.getValue(),
			nPosition : this.getPosition()
		};
		/**
			Thumb에 손을 터치 했을 때 발생

			@event touchStart
			@param {Number} nValue 현재 Thumb의 위치의 계산된 슬라이더 값
			@param {Number} nPosition 현재 Thumb의 위치의 전체 track대비의 퍼센트 값

		**/
		if(!this.fireEvent('touchStart', htParam)){
			return;
		}

		//하이라이팅 막아버리기
		oCustomEvt.oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
	},

	_onMove : function(oCustomEvt){
		if(oCustomEvt.sType == 'touchMove'){
			oCustomEvt.oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
		}

		if(oCustomEvt.sType == 'touchEnd'){
            if(oCustomEvt.element == this._htWElement.thumb.$value()){
                this._fireEvent(oCustomEvt);
                return;
            }
        }

		var nCurrent = oCustomEvt[this._htSwap.nX] - this._htWElement.track.offset()[this._htSwap.left] - (this._htWElement.thumb[this._htSwap.width]()/2);
		var nPos = this._getAdjustedPos(nCurrent);

		this._move(nPos);
		this._fireEvent(oCustomEvt);

	},

	_fireEvent : function(oCustomEvt){
        this.fireEvent(oCustomEvt.sType, {
            nValue : this.getValue(),
            nPosition : this.getPosition()
        });
    },

	_move : function(nPos, bFireEvent){
		if(typeof bFireEvent == 'undefined'){
			bFireEvent = true;
		}

        if(this._nPos == nPos && !bFireEvent){
            return;
        }

		var nValue = this.getValue(nPos);
		var nAdjustPos = Math.round(nPos);
		var nAdjustValue = this.getValue(nAdjustPos);
		this._nBeforeValue = nValue;
		this._nPos = nPos;

		var htOption = {
			nValue : nValue,
			nPosition : nPos,
			nAdjustValue : nAdjustValue,
			nAdjustPosition : nAdjustPos
		};

		if(bFireEvent && !this._fireBeforeEvent(htOption)){
			return;
		}

		if(htOption.nAdjustValue != nAdjustValue){
			htOption.nAdjustPosition = this._getPositionFromValue(htOption.nAdjustValue);
		}

		this._moveThumb(htOption.nAdjustPosition);

		if(bFireEvent){
			this._fireChangeEvent(htOption);
		}

		if(this._htWElement.range){
			this._htWElement.range.css(this._htSwap.width, htOption.nAdjustPosition+'%');
		}
	},

	_fireBeforeEvent : function(htOption){

		/**
			Thumb이 움직이기 직전에 발생한다

			@event beforeChange
			@param {String} sType 커스텀 이벤트명
			@param {Number} nValue 이동하려는 Thumb의 위치의 계산된 슬라이더 값. 위치 값에 따라 소수점 발생함
			@param {Number} nPosition 이동하려는 Thumb의 위치의 전체 track대비의 퍼센트 값
			@param {Number} nAdjustValue nAdjustPosition값으로 계산된 슬라이드 값
			@param {Number} nAdjustPosition nPosition 반올림하여 정수로 계산된 값
			@param {Function} stop 수행시 슬라이더가 이동하지 않으며 change 이벤트가 발생하지 않는다
		**/
		return this.fireEvent('beforeChange',htOption);
	},

	_fireChangeEvent : function(htOption){

		/**
			Thumb이 움직인 이후에 발생한다.

			@event change
			@param {String} sType 커스텀 이벤트명
			@param {Number} nValue 이동하려는 Thumb의 위치의 계산된 슬라이더 값.위치 값에 따라 소수점 발생한다.
			@param {Number} nPosition 이동하려는 Thumb의 위치의 전체 track대비의 퍼센트 값
			@param {Number} nAdjustValue beforeChange에서 다시 설정한 슬라이더 값(변경된 값이 없으면 nValue의 반올림한 정수의 값)
			@param {Number} nAdjustPosition nAdjustValue값에 대한 퍼센트값
			@param {Function} stop 수행시 영향을 받는것은 없다.
		**/
		this.fireEvent('change', htOption);
	},

	_moveThumb : function(n){
		if(n > 100 || n < 0){ return;}

		this._htWElement.thumb.css('webkitTransitionDuration', '0ms');
		this._htWElement.thumb.css('webkitTransitionProperty',this._htSwap.left);
		this._htWElement.thumb.css(this._htSwap.left ,n+"%");
	},

	_getTrackInfo : function(){
		var nTrackSize = this.option('bVertical')? this._htWElement.track.height() : this._htWElement.track.width();
		var nThumbSize = this.option('bVertical')? this._htWElement.thumb.height() : this._htWElement.thumb.width();

		var nMaxPos =  nTrackSize-(nThumbSize/2);

		return {
			maxPos : nMaxPos,
			max :  this.option('nMaxValue')*1,
			min :  this.option('nMinValue')*1
		};

	},

	/**
		옵션을 설정한 nMinValue, nMaxValue에 대한 상대값으로 nPos에 대한 해당 Thumb의 위치값을 얻어온다
		@param {Number} nPos Slider 의 위치값을 얻어오기 위한 수치
		@return {Number} nValue 입력받은 nPos 의 위치 값
		@method getValue
	**/
	getValue : function(nPos) {
		if(typeof nPos == 'undefined'){
			nPos = this.getPosition();
		}

		var oInfo = this._getTrackInfo();
		var nValue = oInfo.min + ((oInfo.max- oInfo.min) * (nPos/100));

		return nValue;
	},


	/**
		옵션을 설정한 nMinValue, nMaxValue에 대한 상대값으로 해당 Thumb의 위치값을 설정한다
		@param {Number}  nValue Thumb의 value 값
		@param {Boolean} bFireEvent 커스텀 이벤트 발생여부
		@method setValue
	**/
	setValue : function(nValue, bFireEvent){
		nValue = nValue * 1;
		var nPos = this._getPositionFromValue(nValue);

		if(typeof bFireEvent == 'undefined'){
			bFireEvent = false;
		}

        if(this._nBeforeValue != nValue){
            bFireEvent = true;
        }

		this._move(nPos, bFireEvent);
	},

	_getAdjustedPos : function(nDistance){
		var htInfo = this._getTrackInfo();

		var nPecent = (nDistance * 100)/htInfo.maxPos;

		nPecent = Math.max(0, nPecent);
		nPecent = Math.min(nPecent,100);

		return nPecent;
	},

	/**
		현재 Thumb의 위치값을(퍼센트) 리턴한다.
		@return {Number} Slider의 현재 위치값(%)
		@method getPosition
	**/
	getPosition : function() {
		var sPos = this._htWElement.thumb.css(this._htSwap.left);

		return (sPos == "auto") ? 0 : parseFloat(sPos, 10);
	},

	/**
		Thumb의 위치값을 퍼센트로 설정한다
		@param {Number} nPos Thumb의 위치 퍼센트 값
		@param {Boolean} bFireEvent 커스텀 이벤트 발생여부
		@method setPosition
	**/
	setPosition : function(nPos, bFireEvent){
		if(typeof bFireEvent == 'undefined'){
			bFireEvent = true;
		}

		this._move(nPos, bFireEvent);
	},

	_getPositionFromValue : function(nValue){
		var htInfo = this._getTrackInfo();

		var nPecent = ((nValue- htInfo.min) * 100) /(htInfo.max-htInfo.min);
		nPecent = isNaN(nPecent)? 100 : nPecent;
		nPecent = Math.max(0, nPecent);
		nPecent = Math.min(100, nPecent);

		return nPecent;
	},


	_onClick : function(evt){
		evt.stop();
	},

	/**
		jindo.m.Slider 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		this._htEvent = {};
		// thumb click event 처리
//		this._htEvent["click"] = {
//			ref : jindo.$Fn(this._onClick, this).attach(this._htWElement.thumb, "click"),
//			el	: this._htWElement.thumb
//		};

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
		jindo.m.Slider 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		this._attachEvent();
		this._oTouch.activate();
	},

	/**
		jindo.m.Slider 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEvent();
		this._oTouch.deactivate();
	},

	/**
		jindo.m.Slider 에서 사용하는 모든 객체를 release 시킨다.
		@method destroy
	**/
	destroy : function() {
		this.deactivate();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;

		for(p in this._htSwap) {
			this._htSwap[p] = null;
		}
		this._htSwap = null;

		this._oTouch.detachAll();
	}
}).extend(jindo.m.UIComponent);