/**
	@fileOverview 기준 엘리먼트의 자식들 중 특정 클래스명을 가진 모든 엘리먼트를 Drag 가능하게 하는 컴포넌트
	@author "oyang2"
	@version #__VERSION__#
	@since 2012. 2. 7.
**/
/**
	기준 엘리먼트의 자식들 중 특정 클래스명을 가진 모든 엘리먼트를 Drag 가능하게 하는 컴포넌트

	@class jindo.m.DragArea
	@extends jindo.m.UIComponent
	@uses jindo.m.Touch
	@keyword drag, area, 드래그&드랍, 드래그, 영역
	@group Component

    @history 1.15.0 Bug jindo 2.X 버전 사용시 touch start 좌표 이동 버그 수정
    @history 1.14.0 Bug  left/top 좌표 이동을 transform(translate) 를 통해 이동할 수 있도록 변경 
	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 1.1.0 Release 최초 릴리즈
**/
jindo.m.DragArea = jindo.$Class({
	/* @lends jindo.m.DragArea.prototype */
	/**
		초기화 함수

		@constructor
		@param {HTMLElement | String} el 기준 엘리먼트 (혹은 id)
		@param {Object} [htOption] 초기화 옵션 객체
			@param {String} [htOption.sClassPrefix='drag-'] Class의 prefix명
			@param {Boolean} [htOption.bFlowOut=false] 기준 엘리먼트 영역 밖으로 이동 드래그 가능한지 여부
			@param {Number} [htOption.nThreshold=10] 최초 드래그가 시작되기 위한 최소 사용자 움직임값 (px)
			@param {Number} [htOption.nMoveThreshold=3] 드래그 이벤트가 발생되는 사용자 움직임 값(px)
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부

		@example
			var  oDrag = new jindo.m.DragArea('layer1', {
				sClassPrefix : 'drag-',
				bFlowOut : false, //기준 엘리먼트 영역 밖으로 이동 가능한지에 대한 여부
				nThreshold : 10, //최초 드래그가 시작되기 위한 최소 사용자 움직임값 (px)
				nMoveThreshold : 3, //드래그 이벤트가 발생되는 사용자 움직임 값(px)
				bActivateOnload : true
			});
	**/
	$init : function(el, htOption) {
		this.option({
			sClassPrefix : 'drag-',
			bFlowOut : false, //기준 엘리먼트 영역 밖으로 이동 가능한지에 대한 여부
			nThreshold : 10,
			nMoveThreshold : 3,
			bActivateOnload : true
		});

		this.option(htOption || {});
		this._initVar();
		this._setWrapperElement(el);
		this._initTouch();
		this._setAnchorElement();

		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},

	/**
		jindo.m.DragArea 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar: function() {
		this._oTouch = null;
		this._sDragClass = '.'+ this.option('sClassPrefix')+"dragging";
		this._sHandleClass = '.'+this.option('sClassPrefix')+"handle";

		this._htInfo = {
			elDrag : null,
			elHandle : null,
			nStartX : null,
			nStartY : null,
			nX : null,
			nY : null,
			bDragStart : false, //dragStart가 시작되었는지 여부
			nCount : 0, //실제 드래그객체의 offset을 움직인 개수
			bPrepared : false //드래깅할 준비가 되어 있는지 여부
		};

        this._htTans = jindo.m.useCss3d() ? {
            open : "3d(",
            end : ",0)"
        } : {
            open : "(",
            end : ")"
        };
        
		this._sCssUserSelect = "-"+jindo.m.getCssPrefix()+"-user-select";
		this._sCssUserSelectValue = document.body.style[this._sCssUserSelect];
		var htInfo = jindo.m.getDeviceInfo();
		this._isIos = (htInfo.iphone || htInfo.ipad);

		this._aAnchor = null;
		this._fnDummyFnc = function(){return false;};
		this._bBlocked = false;

		var nVersion = parseFloat(htInfo.version,10);
		this._bTouchStop = false;
		this._bTouchStop = htInfo.android && ((nVersion == 2.1) || (nVersion >= 3 ));
		if(!this._bTouchStop){
			this._bTouchStop = htInfo.iphone && (nVersion >= 3 && nVersion <4 );
		}

	},

	/**
		jindo.m.DragArea 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
	**/
	_setWrapperElement: function(el) {
		this._htWElement = {};
		el = jindo.$(el);
		this._htWElement.base = jindo.$Element(el);
	},

	/**
		jindo.m.Touch컴포넌트를 초기화 한다.
	**/
	_initTouch : function(){
		if(!this._oTouch){
			this._oTouch = new jindo.m.Touch(this._htWElement.base.$value(),{
			    nUseDiagonal : 1,
				nSlopeThreshold : 1,
				nMoveThreshold : this.option('nMoveThreshold'),
				bActivateOnload : false
			});
			this._oTouch.setSlope(-1,-1);
		}
	},

	/**
		el 안에 드래깅가능한 엘리먼트인지를 판단하여 리턴한다.
	**/
	_getDragElement : function(el, sClass){
		if (jindo.$$.test(el, "input[type=text], textarea, select")){
			return null;
		}

		var self = this;

		var isChildOfDragArea = function(baseElement, el) {
			if (!el) {
				return false;
			}
			if (baseElement === document ||baseElement === el) {
				return true;
			}
			return jindo.$Element(baseElement).isParentOf(el);
		};

		//var elReturn = jindo.$$.test(el, this._sDragClass) ? el : jindo.$$.getSingle('! ' + this._sDragClass, el);
		var elReturn = jindo.$$.test(el, this._sDragClass) ? el : jindo.m.getClosest(this._sDragClass, el);

		if (!isChildOfDragArea(this._htWElement.base, elReturn)) {
			elReturn = null;
		}
		var elHandle = null;

		if(elReturn){
			try{
				elHandle = jindo.$$.getSingle(this._sHandleClass, elReturn);
			}catch(e){
				//console.log(e);
			}
			if(elHandle){
				if (!isChildOfDragArea(elHandle, el)) {
					elReturn = null;
			//		elHandle = null;
				}
			}
		}
		return {
			elDrag : elReturn,
			elHandle : elHandle
		};
	},

	/**
		touchstart 이벤트 핸들러
	**/
	_onStart : function(oCustomEvt){
		if(!this.isActivating() || this._htInfo.bPrepared){
			return;
		}

		this._initInfo();

		var htElement = this._getDragElement(oCustomEvt.element, this._sHandleClass );

		if(!htElement.elDrag){return;}

		var htParam = {
			elHandle :	 htElement.elHandle,
			elDrag : htElement.elDrag,
			oEvent : oCustomEvt.oEvent
		};
		
        /**
            드래그될 handle 에 터치가 시작 되었을 때 발생

            @event handleDown
            @param {String} sType 커스텀 이벤트명
            @param {HTMLElement} elHandle 드래그 엘리먼트내의 핸들 영역. 없을 경우 null로 반환됨
            @param {HTMLElement} elDrag 실제로 드래드될 엘리먼트
        **/
		if(!this.fireEvent('handleDown',htParam)){
			return;
		}

		//안드로이드2.1 , 3.0 버그 픽스
		if(this._bTouchStop){
			oCustomEvt.oEvent.stop();
		}

		//드래깅할 준비 플래그 세팅
		this._htInfo.bPrepared = true;

		//ios일 경우 A태그에 대한 클릭을 방지 코드
		this._clearAnchor();
		
		this._htInfo.welDrag = jindo.$Element(htParam.elDrag);
		this._htInfo.elHandle = htParam.elHandle;
        var htOffset = this._htInfo.welDrag.offset();
        this._htInfo.nStartX = htOffset.left;
        this._htInfo.nStartY = htOffset.top;

        this._htInfo.welDrag.offset(0, 0);
        this._htInfo.welDrag.css(jindo.m.getCssPrefix() + "Transition" , "-webkit-transform 0ms");
        this._htInfo.welDrag.css(jindo.m.getCssPrefix() + "Transform" , "translate" + this._htTans.open + this._htInfo.nStartX + "px," + this._htInfo.nStartY +"px" +  this._htTans.end);
        this._htInfo.welDrag.css('position','absolute');

        this._htInfo.nX = this._htInfo.nStartX;
        this._htInfo.nY = this._htInfo.nStartY;
        
        this._oTouch.attach({
            touchMove : this._htEvent["touchMove"],
            touchEnd :  this._htEvent["touchEnd"]
        });

		//롱탭시에 나올수 있는 복사하기를 막기위해 css를 추가한다.
		document.body.style[this._sCssUserSelect] = "none";

	},

	/**
		touchmove 이벤트 핸들러
	**/
	_onMove : function(oCustomEvt){
	    oCustomEvt.oEvent.stop();
		//드래깅할 준비가 안되어 있다면
		if(!this._htInfo.bPrepared){
			return;
		}
		var nDisX = oCustomEvt.nDistanceX,
			nDisY = oCustomEvt.nDistanceY;

		if((Math.abs(nDisX)+Math.abs(nDisY)) < this.option('nThreshold')){
			return;
		}

		// oCustomEvt.oEvent.stop();
		var htOffset = {
			nX : this._htInfo.nStartX+ nDisX,
			nY : this._htInfo.nStartY+ nDisY
		};

		if(!this.option('bFlowOut')){
			var htNewOffset = this._onReCalculateOffset(this._htInfo.welDrag.$value(), htOffset.nX, htOffset.nY);
			htOffset.nX = htNewOffset.nX;
			htOffset.nY = htNewOffset.nY;
		}

		var htParam = {
			nX : htOffset.nX,
			nY : htOffset.nY,
			elDrag : this._htInfo.welDrag.$value(),
			elHandle : this._htInfo.elHandle,
			nGapX : nDisX,
			nGapY :	nDisY,
			nDragCount : this._htInfo.nCount,
			nTouchX : oCustomEvt.nX,
			nTouchY : oCustomEvt.nY
		};

		if(!this._htInfo.bDragStart){

			/**
				드래그가 시작될 때 발생(최초 한번의 드래그가 실행전)

				@event dragStart
				@param {String} sType 커스텀이벤트명
				@param {HTMLElement} elHandle 드래그 엘리먼트내의 핸들 영역. 없을 경우 null로 반환됨
				@param {HTMLElement} elDrag 실제로 드래드될 엘리먼트
				@param {Number} nX 드래그 엘리먼트가 이동될 x 좌표 (left)
				@param {Number} nY 드래그 엘리먼트가 이동될 y 좌표 (top)
				@param {Number} nGapX handledown된 x 좌표와 dragstart x 좌표의 차이
				@param {Number} nGapY handledown된 y 좌표와 dragstart y 좌표의 차이
				@param {Number} nTouchX 현재 터치 X 좌표값
				@param {Number} nTouchY 현재 터치 Y 좌표값
				@param {Number} nDragCount 실제로 drag되어 엘리먼트의 좌표를 움직인 카운트 (dragStart에서는 무조건 0)
				@param {Function} stop 드래그를 중지시킨다.이후 모든 이벤트는 발생하지 않는다.
			**/
			if(!this.fireEvent('dragStart', htParam)){
				this._htInfo.bPrepared = false;
				return;
			}
		}

		this._htInfo.bDragStart = true;
		/**
			드래그가 시작되고 엘리먼트가 이동되기 직전에 발생 (이동중 beforedrag, drag 순으로 연속적으로 발생)

			@event beforeDrag
			@param {String} sType 커스텀이벤트명
			@param {HTMLElement} elHandle 드래그 엘리먼트내의 핸들 영역. 없을 경우 null로 반환됨
			@param {HTMLElement} elDrag 실제로 드래드될 엘리먼트
			@param {Number} nX 드래그 엘리먼트가 이동될 x 좌표 (left)
			@param {Number} nY 드래그 엘리먼트가 이동될 y 좌표 (top)
			@param {Number} nGapX handledown된 x 좌표와 dragstart x 좌표의 차이
			@param {Number} nGapY handledown된 y 좌표와 dragstart y 좌표의 차이
			@param {Number} nTouchX 현재 터치 X 좌표값
			@param {Number} nTouchY 현재 터치 Y 좌표값
			@param {Number} nDragCount 실제로 drag되어 엘리먼트의 좌표를 움직인 카운트
			@param {Function} stop drag 이벤트를 발생시키지 않고 중단.
		**/
		if(!this.fireEvent('beforeDrag',htParam)){
			return;
		}

		// this._htInfo.welDrag.css('position','absolute');
		// this._htInfo.welDrag.offset(htParam.nY,htParam.nX);
		
		this._htInfo.welDrag.css(jindo.m.getCssPrefix() + "Transform" , "translate" + this._htTans.open + htParam.nX + "px," + htParam.nY +"px" +  this._htTans.end);
		
		
		// this._htInfo.welDrag.(htParam.nY,htParam.nX);
		this._htInfo.nX = htParam.nX;
		this._htInfo.nY = htParam.nY;
		this._htInfo.nCount++;

		/**
			드래그 엘리먼트가 이동하는 중에 발생 (이동중 beforedrag, drag 순으로 연속적으로 발생)

			@event drag
			@param {String} sType 커스텀이벤트명
			@param {HTMLElement} elHandle 드래그 엘리먼트내의 핸들 영역. 없을 경우 null로 반환됨
			@param {HTMLElement} elDrag 실제로 드래드될 엘리먼트
			@param {Number} nX 드래그 엘리먼트가 이동될 x 좌표 (left)
			@param {Number} nY 드래그 엘리먼트가 이동될 y 좌표 (top)
			@param {Number} nGapX handledown된 x 좌표와 dragstart x 좌표의 차이
			@param {Number} nGapY handledown된 y 좌표와 dragstart y 좌표의 차이
			@param {Number} nTouchX 현재 터치 X 좌표값
			@param {Number} nTouchY 현재 터치 Y 좌표값
			@param {Number} nDragCount 실제로 drag되어 엘리먼트의 좌표를 움직인 카운트
		**/
		this.fireEvent('drag', htParam);
	},

	/**
		기준엘리먼트 내에 drag 엘리먼트가 벗어날 수 없도록 좌표를 재계산한다.

		@param {HTMLElement} drag대상 엘리먼트
		@param {Number} nX
		@param {Number} nY
	**/
	_onReCalculateOffset : function(elDrag, nX, nY){
		var elParent = this._htWElement.base;

        var htOffset = elParent.offset();
        var htParent = {
            //nX :  elParent.$value().offsetLeft,
            //nY :  elParent.$value().offsetTop,
            nX : htOffset.left,
            nY : htOffset.top,
            nWidth : elParent.$value().offsetWidth,
            nHeight : elParent.$value().offsetHeight
        };

        var htDrag = {
            nWidth : elDrag.offsetWidth,
            nHeight : elDrag.offsetHeight
        };

        var newX = Math.max(nX, htParent.nX);
        newX = Math.min(newX, htParent.nX+htParent.nWidth - htDrag.nWidth);

        var newY = Math.max(nY, htParent.nY);
        newY = Math.min(newY, htParent.nY+htParent.nHeight - htDrag.nHeight);

        return {
            nX : newX,
            nY : newY
        };

	},

	/**
		touchend 이벤트 핸들러
	**/
	_onEnd : function(oCustomEvt){
		//console.log('onEnd');
		//드래깅할 준비가 안되어 있다면
		if(!this._htInfo.bPrepared){
			return;
		}

		this._stopDrag(false);
		//탭 혹은 롱탭일때

        this._htInfo.welDrag.css(jindo.m.getCssPrefix() + "Transform" , "");
        this._htInfo.welDrag.css(jindo.m.getCssPrefix() + "Translate" , "");
        this._htInfo.welDrag.offset( this._htInfo.nY,  this._htInfo.nX );

		if (oCustomEvt.sMoveType === jindo.m.MOVETYPE[3] || oCustomEvt.sMoveType === jindo.m.MOVETYPE[4]) {
			this._restoreAnchor();
		}
		
		if(this._htInfo.welDrag){
			var htParam = {
				elDrag : this._htInfo.welDrag.$value(),
				elHandle : this._htInfo.elHandle
			};
            
            
            // if(jindo.m.hasOffsetBug()){
                
            // }
        
			/**
				드래그 완료 이후 터치가 끝났을 때 발생

				@event handleUp
				@param {String} sType 커스텀 이벤트명
				@param {HTMLElement} elHandle 드래그 엘리먼트내의 핸들 영역. 없을 경우 null로 반환됨
				@param {HTMLElement} elDrag 실제로 드래드될 엘리먼트
			**/
			this.fireEvent('handleUp', htParam);
		}
		this._initInfo();
	},

	/**
		현재 드래깅중인지 리턴한다.
		@method isDragging
		@return {Boolean} 현재 드래깅 상태 여부
	**/
	isDragging : function(){
		return this._htInfo.bDragStart;
	},

	/**
		현재 드래깅을 중지한다.
		@method stopDragging
	**/
	stopDragging : function(){
		this._stopDrag(true);
	},

	/**
		드래깅을 중지하고 dragEnd 이벤트를 발생한다.
		@param {Boolean} bInterupted 터치이벤트가 아닌 사용자 강제 종료 여부
	**/
	_stopDrag : function(bInterupted){
		if (typeof bInterupted === 'undefined'){
			bInterupted = false;
		}

		this._oTouch.detach({
			touchMove : this._htEvent["touchMove"],
			touchEnd :  this._htEvent["touchEnd"]
		});

		//user-select의 부분 되돌리기
		document.body.style[this._sCssUserSelect] = this._sCssUserSelectValue? this._sCssUserSelectValue : "";

		if(this.isDragging()){
			var htParam = {
				nX : parseInt(this._htInfo.welDrag.css("left"), 10) || 0,
				nY : parseInt(this._htInfo.welDrag.css("top"), 10) || 0,
				elDrag : this._htInfo.welDrag.$value(),
				elHandle : this._htInfo.elHandle,
				bInterupted : bInterupted
			};
			/**
				드래그(엘리먼트 이동)가 완료된 후에 발생 (touchEnd 시점에 발생, 뒤이어 hanldeup발생)

				@event dragEnd
				@param {String} sType 커스텀 이벤트명
				@param {HTMLElement} elHandle 드래그 엘리먼트내의 핸들 영역. 없을 경우 null로 반환됨
				@param {HTMLElement} elDrag 실제로 드래드될 엘리먼트
				@param {Number} nX 드래그 엘리먼트가 이동될 x 좌표 (left)
				@param {Number} nY 드래그 엘리먼트가 이동될 y 좌표 (top)
				@param {Boolean} bInterupted 드래그중 stopDragging() 호출로 강제적으로 드래그가 종료되었는지의 여부
			**/
			this.fireEvent('dragEnd', htParam);
			this._htInfo.bDragStart = false;
		}

	},

	/**
		flicking 내에 a 엘리먼트를 모두 가져와서 세팅한다. (ios에서만)
	**/
	_setAnchorElement : function(){
		//ios에서만 처리되도록 수정.
		if(this._isIos ){
			this._aAnchor = jindo.$$("A", this._htWElement.base.$value());
		}
	},

	/**
		Anchor 삭제
	**/
	_clearAnchor : function() {
		if(this._aAnchor && !this._bBlocked) {
			var aClickAddEvent = null;
			for(var i=0, nILength=this._aAnchor.length; i<nILength; i++) {
				if (this._fnDummyFnc !== this._aAnchor[i].onclick) {
					this._aAnchor[i]._onclick = this._aAnchor[i].onclick;
				}
				this._aAnchor[i].onclick = this._fnDummyFnc;
				aClickAddEvent = this._aAnchor[i].___listeners___ || [];
				for(var j=0, nJLength = aClickAddEvent.length; j<nJLength; j++) {
					___Old__removeEventListener___.call(this._aAnchor[i], "click", aClickAddEvent[j].listener, aClickAddEvent[j].useCapture);
				}
			}
			this._bBlocked = true;
		}
	},

	/**
		Anchor 복원. for iOS
	**/
	_restoreAnchor : function() {
		if(this._aAnchor && this._bBlocked) {
			var aClickAddEvent = null;
			for(var i=0, nILength=this._aAnchor.length; i<nILength; i++) {
				if(this._fnDummyFnc !== this._aAnchor[i]._onclick) {
					this._aAnchor[i].onclick = this._aAnchor[i]._onclick;
				} else {
					this._aAnchor[i].onclick = null;
				}
				aClickAddEvent = this._aAnchor[i].___listeners___ || [];
				for(var j=0, nJLength = aClickAddEvent.length; j<nJLength; j++) {
					___Old__addEventListener___.call(this._aAnchor[i], "click", aClickAddEvent[j].listener, aClickAddEvent[j].useCapture);
				}
			}
			this._bBlocked = false;
		}
	},

	/**
		터치 정보를 리셋한다.
	**/
	_initInfo : function(){
		this._htInfo.welDrag = null;
		this._htInfo.elHandle = null;
		this._htInfo.nStartX = null;
		this._htInfo.nStartY = null;
		this._htInfo.nX = null;
		this._htInfo.nY = null;
		this._htInfo.bDragStart = false;
		this._htInfo.bPrepared = false;
		this._htInfo.nCount = 0;
	},

	/**
		jindo.m.DragArea 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		this._attachEvent();
		this._oTouch.activate();
	},

	/**
		jindo.m.DragArea 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEvent();
		this._oTouch.deactivate();
	},

	/**
		jindo.m.DragArea 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		this._htEvent = {};
		/*Touch 이벤트용 */
		this._htEvent["touchMove"] = jindo.$Fn(this._onMove, this).bind();
		this._htEvent["touchEnd"] = jindo.$Fn(this._onEnd, this).bind();
		this._htEvent["touchStart"] = jindo.$Fn(this._onStart, this).bind();

		/*Touch attach */
		this._oTouch.attach("touchStart", this._htEvent["touchStart"]);
	},

	/**
		jindo.m.DragArea 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEvent : function() {
		/*touch detach */
		this._oTouch.detachAll();

		for(var p in this._htEvent){
			this._htEvent[p] = null;
		}

		this._htEvent = null;
	},

	/**
		jindo.m.DragArea 에서 사용하는 모든 객체를 release 시킨다.
		@method destroy
	**/
	destroy : function() {
		this.deactivate();

		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}

		for(p in this._htInfo) {
			this._htInfo[p] = null;
		}

		this._htWElement = null;
		this._htInfo = null;
		this._isIos = null;
		this._aAnchor = null;
		this._fnDummyFnc = null;
		this._bBlocked = null;
		this._bTouchStop = null;
	}
}).extend(jindo.m.UIComponent);
