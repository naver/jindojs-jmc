/**
	@fileOverview DropArea 컴포넌트는 DragArea 컴포넌트로 드래그된 엘리먼트가 드랍되었을 때 지정한 동작을 수행할 수 있도록 도와주는 컴포넌트
	@author "oyang2"
	@version #__VERSION__#
	@since 2012. 2. 20.
**/
/**
	DropArea 컴포넌트는 DragArea 컴포넌트로 드래그된 엘리먼트가 드랍되었을 때 지정한 동작을 수행할 수 있도록 도와주는 컴포넌트

	@class jindo.m.DropArea
	@extends jindo.m.UIComponent
	@uses jindo.m.DragArea
	@keyword drop, area, 드래그&드랍, 드랍, 영역
	@group Component

	@history 1.3.0 Update 플리킹이나 스크롤 컴포넌트내에서도 정상동작하도록 수정
	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 1.1.0 Release 최초 릴리즈
**/
jindo.m.DropArea = jindo.$Class({
	/* @lends jindo.m.DropArea.prototype */
	/**
		초기화 함수

		@constructor
		@param {HTMLElement | String} el 기준 엘리먼트 (혹은 id)
		@param {Object} [htOption] 초기화 옵션 객체
			@param {String} [htOption.sClassPrefix='drop-'] Class의 prefix명
			@param {String} [htOption.oDragInstance=null] Drop이 될 대상인 DragArea 컴포넌트의 인스턴스 (필수지정)
			@param {Boolean} [htOption.bUseTouchPoint=false] 드롭엘리먼트 영역에 OVER를 감지 할때 터치 포인트를 사용할지에 대한 여부
			@param {Boolean} [htOption.bActivateOnload=true]

		@example
			var  oDrop = new jindo.m.DropArea('layer1', {
				sClassPrefix : 'drop-',
				oDragInstance : null, //jindo.m.DragArea 인스턴스
				bUseTouchPoint : false, //드롭엘리먼트 영역에 OVER를 감지 할때 터치 포인트를 사용할지에 대한 여부
				bActivateOnload : true
			});
	**/
	$init : function(el, htOption) {
		this.option({
			sClassPrefix : 'drop-',
			oDragInstance : null,
			bActivateOnload : true,
			bUseTouchPoint : false
		});
		this.option(htOption || {});

		this._initVar();
		this._setWrapperElement(el);

		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},

	/**
		jindo.m.DropArea 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar: function() {
		this._waOveredDroppableElement = jindo.$A([]);
		this._sEvent = 'ontouchstart' in window? 'touchmove' : 'mousemove';
		this._sDropClassName = '.' + this.option('sClassPrefix')+"area";

		this._aItem = null;
		this._aItemRect = null;
		this._elHandle = null;
		this._elDragging = null;

		var htInfo = jindo.m.getDeviceInfo();
		//상위 스크롤이 적용되었을 경우 오프셋을 다시 구할지 여부
		// 아이폰 인앱브라우저의 경우 오프셋이 상위 translate가 모두 계산된 값으로 리턴된다.
		this._bReCalculateOffset = ((htInfo.iphone || htInfo.ipad) && htInfo.bInapp )? false: true;
	},

	/**
		jindo.m.DropArea 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
	**/
	_setWrapperElement: function(el) {
		this._htWElement = {};
		el = jindo.$(el);
		this._htWElement["base"] = jindo.$Element(el);
	},

	/**
		el의 offset 범위를 구해서 리턴한다.
		@param {HTMLElement} el
		@return {Object}
	**/
	_getRectInfo : function(el){
		var htOffset = jindo.$Element(el).offset();

		var nVectorX = 0;
		var nVectorY = 0;

		if(this._bReCalculateOffset ){
			jindo.$Element(el).parent(function(v){
					var htCssOffset = jindo.m.getCssOffset(v.$value());
					nVectorX += htCssOffset.left;
					nVectorY += htCssOffset.top;
			});
		}

		return {
			nLeft : htOffset.left + (nVectorX),
			nTop : htOffset.top + (nVectorY),
			nRight : htOffset.left + nVectorX + el.offsetWidth,
			nBottom : htOffset.top + nVectorY +el.offsetHeight
		};
	},

	/**
		기준레이어내의 모든 드롭엘리먼트를 구하고 각 드롭엘리먼트의 위치범위를 저장한다.
	**/
	_reCalculate : function() {

		var elBase = this._htWElement["base"].$value();
		var aItem = jindo.$$(this._sDropClassName , elBase);

		if (elBase.tagName && jindo.$$.test(elBase, this._sDropClassName )) {
			aItem.push(elBase);
		}
		//console.log('다시구해 ' + aItem.length);
		this._aItem = aItem;
		this._aItemRect = [];

		for (var i = 0, el; (el = aItem[i]); i++) {
			this._aItemRect.push(this._getRectInfo(el));
		}
	},
	/**
		el을 기준으로 현재 위치에 맞는 drop area를 찾는다.
	**/
	_findDroppableElement : function(el) {
		var elDroppable = jindo.$$.test(el, this._sDropClassName ) ? el : jindo.m.getClosest(this._sDropClassName , el);

		if (!this._isChildOfDropArea(el)) { //기준 엘리먼트가 document인 경우 Magnetic일때 문서밖으로 커서이동시 event 발생!
			elDroppable = null;
		}
		return elDroppable;
	},

	/**
		el이 기준 엘리먼트내의 자식 노드인지 확인한다.
		@param {HTMLElement}
	**/
	_isChildOfDropArea : function(el) {
		if (this._el === document || this._el === el){
			return true;
		}
		return this._htWElement["base"].isParentOf(el);
	},


	_isDropMove : function(nLeft, nTop, nRight, nBottom){
		var aItem = this._aItem;
		var aItemRect = this._aItemRect, i, htRect, el;

		if(!this.option('bUseTouchPoint')){
			for (i = 0; ((htRect = aItemRect[i]) && (el = aItem[i])); i++) {
				var bHOver = this._checkOverArea({nMin: htRect.nLeft, nMax : htRect.nRight}, {nMin : nLeft, nMax : nRight});
				var bVOver = this._checkOverArea({nMin: htRect.nTop, nMax : htRect.nBottom}, {nMin : nTop, nMax : nBottom});

				if(bHOver && bVOver){
					this._addOveredDroppableElement(el);
					this._fireMoveEvent(el, htRect, {nX : nLeft,nY: nTop});
				}else{
					this._removeOveredDroppableElement(el);
				}

			}
		}else{
			//console.log('터치 포인트로 게산해여');
			for (i = 0; ((htRect = aItemRect[i]) && (el = aItem[i])); i++) {
				if ( htRect.nLeft <= nLeft && nLeft <= htRect.nRight && htRect.nTop <= nTop && nTop <= htRect.nBottom ) {
					this._addOveredDroppableElement(el);
					this._fireMoveEvent(el, htRect, {nX : nLeft,nY: nTop});
				} else {
					this._removeOveredDroppableElement(el);
				}
			}
		}
	},

	/**
		min, max 값으로 base 값안에 check값이 있는지 판단.
	**/
	_checkOverArea : function(htBase, htCheck){

		if(htCheck.nMin < htBase.nMin){
			if(htCheck.nMax > htBase.nMin){
				return true;
			}
		}else{
			if(htCheck.nMin < htBase.nMax){
				return true;
			}
		}
		return false;
	},

	/**
		커스텀 이벤트 move를 발생시킨다
	**/
	_fireMoveEvent : function(elDrop, htRect, htTouchInfo){
		var nRatioX = (htTouchInfo.nX - htRect.nLeft) / (htRect.nRight - htRect.nLeft);
		var nRatioY = (htTouchInfo.nY - htRect.nTop) / (htRect.nBottom - htRect.nTop);

		/**
			Drag된 채 Drop 가능한 엘리먼트위에서 움직일 경우 발생

			@event move
			@param {String} sType 커스텀 이벤트명
			@param {HTMLElement} elDrop Drop된 대상 엘리먼트
			@param {HTMLElement} elDrag 드래그된 엘리먼트
			@param {HTMLElement} elHandle 드래그된 엘리먼트 내 핸들 영역 (없는 경우 null)
			@param {Number} nRatioX (Number): 드랍될 엘리먼트 내부의 좌우비율
			@param {Number} nRatioY (Number): 드랍될 엘리먼트 내부의 상하비율
			@param {Function} stop 수행시 영향을 받는것은 없다
		**/
		this.fireEvent('move',{
			elHandle : this._elHandle,
			elDrag : this._elDragging,
			elDrop : elDrop,
			nRatioX : nRatioX,
			nRatioY : nRatioY
		});
	},

	/**
		el을 드롭엘리먼트로 추가한다. 존재하지 않으면 'over' 커스텀 이벤트를 발생한다.
		@param {HTMLElement} el
	**/
	_addOveredDroppableElement : function(elDroppable) {
		if (this._waOveredDroppableElement.indexOf(elDroppable) == -1) {
			this._waOveredDroppableElement.push(elDroppable);

			/**
				Drag된 채 Drop 가능한 엘리먼트에 올라갈 경우 발생

				@event over
				@param {HTMLElement} elDrop Drop된 대상 엘리먼트
				@param {HTMLElement} elDrag 드래그된 엘리먼트
				@param {HTMLElement} elHandle 드래그된 엘리먼트 내 핸들 영역 (없는 경우 null)
				@param {Function} stop 수행시 영향을 받는것은 없다
			**/
			this.fireEvent('over', {
				elHandle : this._elHandle,
				elDrag : this._elDragging,
				elDrop : elDroppable
			});
		}
	},

	/**
		el을 드롭엘리먼트에서 제거한다. 제거되면 'out' 커스텀 이벤트를 발생한다.
		@param {HTMLElement} el
	**/
	_removeOveredDroppableElement : function(elDroppable) {
		var nIndex = this._waOveredDroppableElement.indexOf(elDroppable);
		if (nIndex != -1) {
			this._waOveredDroppableElement.splice(nIndex, 1);

			/**
				Drag된 채 Drop 가능한 엘리먼트에서 벗어날 경우 발생

				@event out
				@param {String} sType 커스텀 이벤트명
				@param {HTMLElement} elDrop Drop된 대상 엘리먼트
				@param {HTMLElement} elDrag 드래그된 엘리먼트
				@param {HTMLElement} elHandle 드래그된 엘리먼트 내 핸들 영역 (없는 경우 null)
				@param {Function} stop 수행시 영향을 받는것은 없다
			**/
			this.fireEvent('out', {
				elHandle : this._elHandle,
				elDrag : this._elDragging,
				elDrop : elDroppable
			});
		}
	},

	/**
		현재 드롭엘리먼트를 삭제하고 drop 커스텀 이벤트를 발생한다.
	**/
	_clearOveredDroppableElement : function(){
		for (var elDroppable; (elDroppable = this._waOveredDroppableElement.$value()[0]); ) {
			this._waOveredDroppableElement.splice(0, 1);
			/**
				Drop 가능한 엘리먼트에 성공적으로 드랍 될 경우 발생

				@event drop
				@param {String} sType 커스텀 이벤트명
				@param {HTMLElement} elDrop Drop된 대상 엘리먼트
				@param {HTMLElement} elDrag 드래그된 엘리먼트
				@param {HTMLElement} elHandle 드래그된 엘리먼트 내 핸들 영역 (없는 경우 null)
				@param {Function} stop 수행시 영향을 받는것은 없다
			**/
			this.fireEvent('drop', {
				elHandle : this._elHandle,
				elDrag : this._elDragging,
				elDrop : elDroppable
			});
		}
	},

	/**
		Drag되고 있는 채, 마우스가 올라간 엘리먼트의 리스트를 구함
		@method getOveredLists
		@return {Array} 겹쳐진 엘리먼트
	**/
	getOveredLists : function() {
		return this._waOveredDroppableElement ? this._waOveredDroppableElement.$value() : [];
	},

	/**
		jindo.m.DropArea 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		this._attachEvent();

		if(this.option('oDragInstance')){
			var oDrag = this.option('oDragInstance');
			var self = this;

			oDrag.attach({

				/**
					드래그될 handle(handle 영역이 없을 경우 drag영역)에 터치 하였을 때(oDragInstance의 handleDown 연이어 발생

					@event handleDown
					@param {String} sType 커스텀 이벤트명
					@param {HTMLElement} elDrag 드래그된 엘리먼트
					@param {HTMLElement} elHandle 드래그된 엘리먼트 내 핸들 영역 (없는 경우 null)
					@param {Object} oEvent jindo.$Event object
					@param {Function} stop 드래그를 중지시킨다. 이후 모든 이벤트는 발생하지 않는다.
				**/
				'handleDown' : function(oCustomEvent){
					//console.log('drop HandleDown');
					self._elHandle = oCustomEvent.elHandle;
					self._elDragging = oCustomEvent.elDrag;
					self._waOveredDroppableElement.empty();
					self.fireEvent(oCustomEvent.sType, oCustomEvent);
				},
				/**
					드래그가 시작될 때 발생(최초 한번의 드래그가 실행전)(oDragInstance의 dratStart 연이어 발생)

					@event dragStart
					@param {String} sType 커스텀 이벤트명
					@param {HTMLElement} elDrag 드래그된 엘리먼트
					@param {HTMLElement} elHandle 드래그된 엘리먼트 내 핸들 영역 (없는 경우 null)
					@param {Number} nX 드래그 엘리먼트가 이동될 x 좌표 (left)
					@param {Number} nY 드래그 엘리먼트가 이동될 y 좌표 (top)
					@param {Number} nGapX handledown된 x 좌표와 dragstart x 좌표의 차이
					@param {Number} nGapY handledown된 y 좌표와 dragstart y 좌표의 차이
					@param {Number} nTouchX 현재 터치 X 좌표값
					@param {Number} nTouchY 현재 터치 Y 좌표값
					@param {Number} nDragCount 실제로 drag되어 엘리먼트의 좌표를 움직인 카운트 (dragStart에서는 무조건 0)
					@param {Function} stop 드래그를 중지시킨다. 이후 모든 이벤트는 발생하지 않는다.

				**/
				'dragStart' : function(oCustomEvent){
					//self._reCalculate();
					if(!self.fireEvent(oCustomEvent.sType, oCustomEvent)){
						oCustomEvent.stop();
					}else{
						self._reCalculate();
						//self._htEvent["touchMove"].attach(document, self._sEvent);
					}
				},
				/**
					드래그가 시작되고 엘리먼트가 이동되기 직전에 발생(oDragInstance의 beforeDrag 연이어 발생)

					@event beforeDrag
					@param {String} sType 커스텀 이벤트명
					@param {HTMLElement} elDrag 드래그된 엘리먼트
					@param {HTMLElement} elHandle 드래그된 엘리먼트 내 핸들 영역 (없는 경우 null)
					@param {Number} nX 드래그 엘리먼트가 이동될 x 좌표 (left)
					@param {Number} nY 드래그 엘리먼트가 이동될 y 좌표 (top)
					@param {Number} nGapX handledown된 x 좌표와 dragstart x 좌표의 차이
					@param {Number} nGapY handledown된 y 좌표와 dragstart y 좌표의 차이
					@param {Number} nTouchX 현재 터치 X 좌표값
					@param {Number} nTouchY 현재 터치 Y 좌표값
					@param {Number} nDragCount 실제로 drag되어 엘리먼트의 좌표를 움직인 카운트
					@param {Function} stop 드래그를 중지시킨다. 이후 모든 이벤트는 발생하지 않는다.
				**/
				'beforeDrag' : function(oCustomEvent){
					self.fireEvent(oCustomEvent.sType, oCustomEvent);
				},
				/**
					드래그 엘리먼트가 이동후 발생(oDragInstance의 drag 연이어 발생)

					@event drag
					@param {String} sType 커스텀 이벤트명
					@param {HTMLElement} elDrag 드래그된 엘리먼트
					@param {HTMLElement} elHandle 드래그된 엘리먼트 내 핸들 영역 (없는 경우 null)
					@param {Number} nX 드래그 엘리먼트가 이동될 x 좌표 (left)
					@param {Number} nY 드래그 엘리먼트가 이동될 y 좌표 (top)
					@param {Number} nGapX handledown된 x 좌표와 dragstart x 좌표의 차이
					@param {Number} nGapY handledown된 y 좌표와 dragstart y 좌표의 차이
					@param {Number} nTouchX 현재 터치 X 좌표값
					@param {Number} nTouchY 현재 터치 Y 좌표값
					@param {Number} nDragCount 실제로 drag되어 엘리먼트의 좌표를 움직인 카운트
					@param {Function} stop 드래그를 중지시킨다. 이후 모든 이벤트는 발생하지 않는다.
				**/
				'drag' : function(oCustomEvent){
					self._elDragging = oCustomEvent.elDrag;
					var wel = jindo.$Element(oCustomEvent.elDrag);

					var nTop =self.option('bUseTouchPoint')?  oCustomEvent.nTouchY	: oCustomEvent.nY;
					var nLeft = self.option('bUseTouchPoint')? oCustomEvent.nTouchX: oCustomEvent.nX;
					var nRight = nLeft+wel.width();
					var nBottom = nTop +wel.height();

					self._isDropMove(nLeft, nTop, nRight, nBottom );

					self.fireEvent(oCustomEvent.sType, oCustomEvent);
				},
				/**
					드래그(엘리먼트 이동)가 완료된 후에 발생.(oDragInstance의 dragEnd 연이어 발생)
					@event dragEnd
					@param {String} sType 커스텀 이벤트명
					@param {HTMLElement} elDrag 드래그된 엘리먼트
					@param {HTMLElement} elHandle 드래그된 엘리먼트 내 핸들 영역 (없는 경우 null)
					@param {Number} nX 드래그 엘리먼트가 이동될 x 좌표 (left)
					@param {Number} nY 드래그 엘리먼트가 이동될 y 좌표 (top)
					@param {Boolean} bInterupted 드래그중 stopDragging() 호출로 강제적으로 드래그가 종료되었는지의 여부
					@param {Function} stop 수행시 영향을 받는것은 없다

				**/
				'dragEnd': function(oCustomEvent){
					//self._htEvent["touchMove"].detach(document, self._sEvent);

					var oParam = {};
					oParam.aElDrop = self.getOveredLists().concat();

					for(var p in oCustomEvent){
						oParam[p] = oCustomEvent[p];
					}

					self._clearOveredDroppableElement();

					self.fireEvent(oCustomEvent.sType, oParam);

				},
				/**
					드래그 완료 이후 터치가 끝났을 때 발생(oDragInstance의 hanldeUp 연이어 발생)

					@event handleUp
					@param {String} sType 커스텀 이벤트명
					@param {HTMLElement} elDrag 드래그된 엘리먼트
					@param {HTMLElement} elHandle 드래그된 엘리먼트 내 핸들 영역 (없는 경우 null)
					@param {Function} stop 수행시 영향을 받는것은 없다
				**/
				'handleUp' : function(oCustomEvent){
					self.fireEvent('handleUp',{
						elHandle : self._elHandle,
						elDrag : self._elDragging
					});
					//console.log('handleUp');
					self._elHandle = null;
					self._elDragging = null;
				}
			});
		}
	},

	/**
		jindo.m.DropArea 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEvent();
		if(this.option('oDragInstance')){
			var oDrag = this.option('oDragInstance');
			oDrag.detachAll();
		}
	},

	/**
		jindo.m.DropArea 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		this._htEvent = {};

		/*Touch 이벤트용 */
		//this._htEvent["touchMove"] = jindo.$Fn(this._onTouchMove, this);
	},

	/**
		jindo.m.DropArea 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEvent : function() {
		//this._htEvent["touchMove"].detach(this._htWElement.base, this._sEvent);
		this._htEvent = null;
	},

	/**
		jindo.m.DropArea 에서 사용하는 모든 객체를 release 시킨다.
		@method destroy
	**/
	destroy : function() {
		this.deactivate();

		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;

	}

}).extend(jindo.m.UIComponent);

