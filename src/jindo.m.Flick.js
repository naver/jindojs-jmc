/**
		@fileOverview 플리킹 판을 처리하는 컴포넌트
		@author sculove
		@version #__VERSION__#
		@since 2013. 2. 27.
*/
/**
		여러개의 콘텐츠 영역을 사용자 터치의 움직임을 통해 좌/우, 상/하로 보여주는 상위 컴포넌트

		@class jindo.m.Flick
		@extends jindo.m.SwipeCommon
		@keyword flicking, 플리킹
		@group Component
		@invisible

		@history 1.17.1 Bug bUseCircular이 true일 경우, nDefaultIndex값이 1 이상으로 지정하면 정상동작하지 않는 문제 수정
		@history 1.15.0 Bug CircularFlicking 일 경우, beforeFlicking에서 stop 했을 시, 판이 멈추고 되돌아 가지 않는 문제 수정
		@history 1.15.0 Bug 2판일 경우, 플리킹 오류 수정
		@history 1.15.0 Bug 플리킹 초기시 view가 display:none일 경우 오류 수정
		@history 1.15.0 Bug flicking시 bCurrupt가 비정상적으로 true가 나오는 문제 수정
		@history 1.13.0 Support Firefox 브라우저 지원
		@history 1.13.0 Update refresh(n) 호출시, bCorrupt가 무조건 true로 나오도록 수정
		@history 1.13.0 Update setTotalContents 추가 (동적으로 전체 컨텐츠값을 변경할수 있다)
		@history 1.13.0 Bug 크롬, 킷캣 브라우저에서 highlight 남는 버그 모듈 성능개선
		@history 1.12.0 Bug 크롬 브라우저에서 highlight가 남는 버그 수정
		@history 1.12.0 Bug activate/deactivate 시 오류 수정
		@history 1.12.0 Bug 비순환 플리킹시, panel이 display:none일 경우 제외하도록 수정
		@history 1.12.0 Bug 컨텐츠의 개수가 3개 이하 일 경우, movePrev/moveNext시 애니메이션이 반대로 움직이는 문제 수정
		@history 1.11.0 Bug 컨텐츠의 개수가 무조건 3으로 설정되는 문제 수정
		@history 1.11.0 Bug beforeFlicking에서 stop했을 경우 스크립트 오류나는 문제 수정
		@history 1.11.0 Bug 플리킹 container를 absolute에서 relative로 변경. 고정 height 지정
		@history 1.10.0 Bug 플리킹 오래할 경우 느려지는 이슈 수정 (Morph의 큐를 정리함)
		@history 1.10.0 Update jindo.m.Flicking 하위호환성 구현
		@history 1.9.0 Update jindo.m.Morph 기반으로 변경
		@history 1.8.0 Release 최초 릴리즈
**/
jindo.m.Flick = jindo.$Class({
	/* @lends jindo.m.Flick.prototype */
	/**
		초기화 함수

		@constructor
		@param {String|HTMLElement} el 플리킹 기준 Element (필수)
		@param {Object} [htOption] 초기화 옵션 객체
			// SwipeCommon
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
			@param {Boolean} [htOption.bUseHighlight=true] 하이라이트 사용 여부
			@param {Boolean} [htOption.bUseDiagonalTouch=true] 대각선스크롤 방향의 터치를 사용할지 여부
			@param {Boolean} [htOption.bAutoResize=true] 화면전환시에 리사이즈에 대한 처리 여부
			@param {Function} [htOption.fEffect=jindo.m.Effect.linear] 애니메이션에 사용되는 jindo.m.Effect 의 함수들
			@param {Boolean} [htOption.bUseCss3d=jindo.m.useCss3d()] css3d(translate3d) 사용여부<br />
					모바일 단말기별로 다르게 설정된다. 상세내역은 <auidoc:see content="jindo.m">[jindo.m]</auidoc:see>을 참조하기 바란다.
			@param {Boolean} [htOption.bUseTimingFunction=jindo.m.useTimingFunction()] 애니메이션 동작방식을 css의 TimingFunction을 사용할지 여부<br />false일 경우 setTimeout을 이용하여 애니메이션 실행.<br />
			모바일 단말기별로 다르게 설정된다. 상세내역은 <auidoc:see content="jindo.m">[jindo.m]</auidoc:see>을 참조하기 바란다.
			@param {Number} [htOption.nZIndex=2000] 컴포넌트 base엘리먼트 z-Index 값

			// Flick
			@param {Boolean} [htOption.bHorizontal=true] 가로여부
			@param {String} [htOption.sClassPrefix='flick-'] Class의 prefix명
			@param {String} [htOption.sContentClass='ct'] 컨텐츠 영역의 class suffix명
			@param {Boolean} [htOption.bUseCircular=false] 순환플리킹여부를 지정한다. true로 설정할 경우 3판이 연속으로 플리킹된다.
			@param {Number} [htOption.nTotalContents=3] 전체 플리킹할 콘텐츠의 개수.<br/>순환플리킹일 경우, 패널의 개수보다 많이 지정하여 flicking 사용자 이벤트를 이용하여 동적으로 컨텐츠를 구성할 수 있다.
			@param {Number} [htOption.nFlickThreshold=40] 콘텐츠가 바뀌기 위한 최소한의 터치 드래그한 거리 (pixel)
			@param {Number} [htOption.nDuration=100] 슬라이드 애니메이션 지속 시간
			@param {Number} [htOption.nBounceDuration=100] nFlickThreshold 이하로 움직여서 다시 제자리로 돌아갈때 애니메이션 시간
			@param {Function} [htOption.fpPanelEffect=jindo.m.Effect.easeIn] 패널 간의 이동 애니메이션에 사용되는 jindo.m.Effect 의 함수들
			@param {Number} [htOption.nDefaultIndex=0] 초기 로드시의 화면에 보이는 콘텐츠의 인덱스
			@param {Boolean} [htOption.bUseMomentum=false] 가속을 통한 모멘텀 사용여부
			@param {Number} [htOption.nDeceleration=0.001] 가속도의 감속계수. 이 값이 클수록, 가속도는 감소한다
			@param {Boolean} [htOption.bFitContentSize=true] 100%에 자동으로 맞추어지는 옵션 (Slide에만 유요함)

		@history 1.10.0 Update fpPanelEffect 옵션 기본값 변경 easeIn => cubicEaseIn
	**/
	$init : function(el,htUserOption) {
		this.option({
			bHorizontal : true,
			sClassPrefix : "flick-",
			sContentClass : "ct",
			bUseCircular : false,
			nTotalContents : 3,
			nFlickThreshold : 40,
			nDuration : 100,
			nBounceDuration : 100,
			fpPanelEffect : jindo.m.Effect.cubicEaseIn,
			nDefaultIndex : 0,
			bFitContentSize : true,				// 100%에 자동으로 맞추어지는 옵션 (Slide에만 유요함)
			nDeceleration : 0.001,	// panel에서는 스크롤보다 가속도 감도가 약함
			bUseMomentum : false 	// panel에서는 가속도 사용하지 않는것이 default
		});
	},

	/**
			jindo.m.Flick 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar: function() {
		jindo.m.SwipeCommon.prototype._initVar.apply(this);
		this._bUseH = this.option("bHorizontal");
		this._bUseV = !this._bUseH;
		this._bUseCircular = this.option("bUseCircular");
		this._nContentIndex = 0;	// 현재 인덱스
		this._welElement = null;	// 현재 엘리먼트
		this._aPos = [];					// 판의 위치
		this._nRange = null;			// 패널의 크기
		this._nDefaultPanel = 3;  // 기본 패널의 개수

		// 크롬에서 하이라이트가 남는 문제를 위해 엘리먼트를 저장
		this._hasKitkatHighlightBug = jindo.m._hasKitkatHighlightBug();
		this._nKitkatHighlightBug = -1;
	},

	_setWrapperElement : function(el) {
		jindo.m.SwipeCommon.prototype._setWrapperElement.call(this,el);

		// container, panel의 높이나 폭을 100%로 설정
		var sSizeKey = this.option("bHorizontal") ? "height" : "width";
		this._htWElement["aPanel"] = this._htWElement["container"].queryAll("." + this.option("sClassPrefix") + this.option('sContentClass'));

		var wa = jindo.$A(this._htWElement["aPanel"]);
		if(!this._bUseCircular) {
			wa = wa.filter(function(v,i,a) {
				return jindo.$Element(v).visible();
			});
		}
		// container의 height 영역의 크기를 고정으로 지정
		this._htWElement["container"].css({
			"position" : "relative"
			// "height" : this._htWElement["view"].height() + "px",
			// "width" : "100%"
		}).css(sSizeKey, "100%");
		this._htWElement["aPanel"] = wa.forEach(function(v, i, a){
			 a[i] = jindo.$Element(v).css(sSizeKey, "100%");
		}).$value();
	},

	// 인덱스 범위 확인
	_checkIndex : function(n){
		var bRet = true,
			nMax = this.getTotalContents()-1;
			if(isNaN((n*1)) || n < 0){
				bRet = false;
			}
			if( n > nMax){
				bRet = false;
			}
			return bRet;
	},

	/**
	 * 패널 데이터를 갱신한다.
	 */
	_refreshPanelInfo : function(){
		var nTotal = 0;
		this._aPos = [0];
		for(var i=0, sKey = this._bUseH ? "width" : "height", nLen = this.getTotalContents(); i<nLen; i++) {
				if(this._nRange != null) {
					nTotal -= this._nRange;
				} else {
					nTotal -= this._htWElement["aPanel"][i][sKey]();
				}
				this._aPos.push(nTotal);
		}
		// console.log(nLen, this._aPos);
	},

	_onActivate : function() {
		jindo.m.SwipeCommon.prototype._onActivate.apply(this);
	},

	_onDeactivate : function() {
		jindo.m.SwipeCommon.prototype._onDeactivate.apply(this);
	},

	set : function() {
		if(!this._oAnimation) {// add
			jindo.m.SwipeCommon.prototype.set.apply(this, Array.prototype.slice.apply(arguments));
			// this.option("nTotalContents") = Math.max(this._htWElement["aPanel"].length, this.option("nTotalContents"));
			//
			if(this._bUseCircular) {
				this.option("nTotalContents", parseInt(this.option("nTotalContents"),10));
			} else {
				this.option("nTotalContents", this._htWElement["aPanel"].length);
			}
			// index 초기화
			var n = this.option("nDefaultIndex");
			if(!this._checkIndex(n)) {
				n = 0;
			}
			this.resize();
			this.refresh(n);
		}// add
		return this._oAnimation;
	},

	/**
	 * 패널 정보를 갱신한다.
	 * @param  {Number} n 갱신할 패널을 지정한다.
	 *
	 * @method refresh
	 */
	refresh : function(n, bFireEvent, bFireMoveEvent /*bFireEvent, bFireMoveEvent는 jindo.m.Flicking의 하위호환성을 유지하기 위해 추가됨*/) {
		jindo.m.SwipeCommon.prototype.refresh.call(this);
		n = typeof n === "undefined" ? this.getContentIndex() : n;
		// this._refreshHightlightForChrome();
		this._hasKitkatHighlightBug && this._htWElement["container"].addClass(jindo.m.KITKAT_HIGHLIGHT_CLASS);
		// console.info(n);
		this._moveTo(n, {
			duration : 0,
			fireEvent : bFireEvent,
			fireMoveEvent : bFireMoveEvent,
			corrupt : true
		});
	},

	/**
	 * 패널 사이즈 정보를 갱신한다.
	 *
	 * @method resize
	 */
	resize : function() {
		jindo.m.SwipeCommon.prototype.resize.call(this);
		// console.log(jindo.m.SlideFlicking && this instanceof jindo.m.SlideFlicking);
		if(!this.option("bFitContentSize") && !this._bUseCircular) {
			this._nRange = null;
		} else {
			this._nRange = this._bUseH ? this._htSize.viewWidth : this._htSize.viewHeight;
			if(this._nRange == 0) {
  			this._nRange = this._htWElement["view"][this._bUseH ? "width" : "height"]();
  		}
		}
		this._refreshPanelInfo();

		if(this._nRange != null) {
			if(this._bUseH) {
				this._htSize.maxX = (this.option("nTotalContents")-1) * -this._nRange;
				this._nX = this._aPos[this.getContentIndex()];
			} else {
				this._htSize.maxY = (this.option("nTotalContents")-1) * -this._nRange;
				this._nY = this._aPos[this.getContentIndex()];
			}
		}
	},


	/**
	 * 현재 엘리먼트를 반환한다.
	 * @return {$Element} 현재 패널의 엘리먼트를 반환한다.
	 *
	 * @method getElement
	 */
	getElement : function() {
		var n = this.getContentIndex();
		if(this._bUseCircular) {
			if(this._welElement) {
				return this._welElement;
			} else {
				n %= this._nDefaultPanel;
				return this._htWElement["aPanel"][n];
			}
		} else {
			return this._htWElement["aPanel"][n];
		}
	},

	/**
	 * 다음 엘리먼트를 반환한다.
	 * @return {$Element} 다음 패널의 엘리먼트를 반환한다.
	 *
	 * @method getNextElement
	 */
	getNextElement : function() {
		var n;
		if(this._bUseCircular){
			n = this._getIndexByElement(this.getElement());
			n = ((((n+1)%this._nDefaultPanel) > this._nDefaultPanel-1 )? 0 : (n+1))%this._nDefaultPanel;
		} else {
			n = this.getNextIndex();
		}
		return this._htWElement["aPanel"][n];
	},

	/**
	 * 이전 엘리먼트를 반환한다.
	 * @return {$Element} 이전 패널의 엘리먼트를 반환한다.
	 *
	 * @method getPrevElement
	 */
	getPrevElement : function() {
		var n;
		if(this._bUseCircular){
			n = this._getIndexByElement(this.getElement());
			n = ((n-1) < 0 )? this._nDefaultPanel-1 : (n-1);
		} else {
			n = this.getPrevIndex();
		}
		return this._htWElement["aPanel"][n];
	},

	// 엘리먼트에 해당하는 index를 반환한다.
	_getIndexByElement : function(wel){
		var bValue = -1;
		jindo.$A(this._htWElement["aPanel"]).forEach(function(v,i,a) {
			if(v.isEqual(wel)) {
				bValue = i;
			}
		});
		return bValue;
	},

	/**
	 * 현재 컨텐츠의 인덱스를 반환한다.
	 * @return {Number} 현재 컨텐츠 인덱스
	 *
	 * @method getContentIndex
	 */
	getContentIndex : function() {
		return parseInt(this._nContentIndex,10);
	},

	/**
	 * 다음 컨텐츠의 인덱스를 반환한다.
	 * @return {Number} 다음 컨텐츠 인덱스
	 *
	 * @method getNextIndex
	 */
	getNextIndex : function() {
		var n = this.getContentIndex() + 1,
			nMax = this.getTotalContents() - 1;
		if(this._bUseCircular && (n > nMax) ) {
			n = 0;
		}
		return Math.min(nMax, n);
	},

	/**
	 * 이전 컨텐츠의 인덱스를 반환한다.
	 * @return {Number} 다음 컨텐츠 인덱스
	 *
	 * @method getPrevIndex
	 */
	getPrevIndex : function() {
		var n = this.getContentIndex() - 1;
		if(this._bUseCircular && n < 0 ) {
			n = this.getTotalContents() - 1;
		}
		return Math.max(0, n);
	},

	/**
	 * 전체 컨텐츠의 개수를 반환한다.
	 * @return {Number} 전체 컨텐츠 개수
	 *
	 * @method getTotalContents
	 */
	getTotalContents : function() {
		if(this._bUseCircular) {
			return this.option("nTotalContents");
		} else {
			return this._htWElement["aPanel"].length;
		}
	},

	/**
	 * 전체 컨텐츠의 개수를 재설정한다.
	 * 만약, 설정한 전체 컨텐츠 값이 현재 페이지보다 작을경우, 마지막 페이지로 이동한다.
	 * @param {Number} n 전체 컨텐츠 개수
	 *
	 * @method setTotalContents
	 */
	setTotalContents : function(n) {
		if(isNaN(n) || n < 1) {
			return;
		}
		n = parseInt(n,10);
		// 현재 페이지보다 total개수가 작은 경우, 마지막 페이지로 이동
		if((this.getContentIndex()+1) > n) {
			this._moveTo(n-1, {
				duration : 0,
				fireEvent : true,
				fireMoveEvent : true
			});
		}
		this.option("nTotalContents", n);
		this.resize();
	},

	/**
	 * 전체 패널의 개수를 반환한다.
	 * @return {Number} 전체 패널 개수
	 *
	 * @method getTotalPanels
	 */
	getTotalPanels : function() {
		return this._htWElement["aPanel"].length;
	},

	/**
	 * 패널 레퍼런스를 반환한다.
	 * @return {Array} $Element의 패널배열
	 *
	 * @method getPanels
	 */
	getPanels : function() {
		return this._htWElement["aPanel"];
	},

	/**
	 * 특정 패널로 이동한다.
	 * @param  {Number} nIndex     이동하려는 판 인덱스 (0부터)<br>
	 * @param  {Number} nDuration  이동하는 시간 (기본은 nDuration 옵션값)
	 *
	 * @method moveTo
	 */
	moveTo : function(nIndex, nDuration) {
		if(nIndex == this.getContentIndex()){
			return;
		}
		return this._moveTo(nIndex, {
			duration : nDuration
		});
	},

	_moveTo : function(nIndex, htUserOption) {
		if((this._nRange == null) && (this._aPos.indexOf(this._bUseH ? this._htSize.maxX : this._htSize.maxY)) < nIndex) {
			return;
		}

		var htOption = {
			duration : typeof htUserOption.duration === "undefined" ? this.option('nDuration') : htUserOption.duration,
			/* bFireEvent, bFireMoveEvent는 jindo.m.Flicking의 하위호환성을 유지하기 위해 추가됨 */
			fireEvent : typeof htUserOption.fireEvent === "undefined" ? true : htUserOption.fireEvent,
			fireMoveEvent : typeof htUserOption.fireMoveEvent === "undefined" ? false : htUserOption.fireMoveEvent,
			corrupt : typeof htUserOption.corrupt == "undefined" ? false : htUserOption.corrupt,
			direct : typeof htUserOption.direct == "undefined" ? false : htUserOption.direct
		};
		// console.warn("_moveTo" , htOption.corrupt);
		if(this.isPlaying() || isNaN(nIndex) || nIndex < 0 || nIndex >= this.getTotalContents()) {
			return;
		}

		var nStart = this._bUseH ? this._nX : this._nY,
			nEnd = this._getPos(nIndex);

		// console.debug("_moveTo : " + nStart + "px -> " + nEnd, "px (", this.getContentIndex(), "=>", nIndex,")");

		// 모멘텀일 경우에는 처리하지 않아야함
		if(this._bUseCircular) {
			var nCurrentIndex = this._posToIndex(nStart),
				nMax = this.getTotalContents();
			// 처음에서 마지막으로... (2판일 경우는 예외처리)
			if(nCurrentIndex == 0 && nIndex == nMax-1 ) {
				if(this.option("nTotalContents") >= 3) {
					nEnd= this._nRange;
				}
			} else if(nCurrentIndex == nMax-1 && nIndex == 0) { // 마지막에서 처음으로
				nEnd= this._getPos(nCurrentIndex) - this._nRange;
			}
		}

		// 동일 판에서 재배열을 위한 코드
		if(nStart == nEnd) {
			if(htOption.duration === 0 && htOption.fireEvent) {
				if(htOption.fireMoveEvent) {
					if(this._fireMoveEvent(nIndex)) {
						this._fireMoveEvent();
					}
				} else {
					var ht = {
						next : null,
						moveCount : 0,
						corrupt : htOption.corrupt,
						contentsNextIndex : nIndex
					};
					if(this._fireFlickingEvent('beforeFlicking', ht)) {
							this._fireFlickingEvent('flicking', ht);
							// jindo.m.Flicking 하위호환성지원을 위해
							this._fireFlickingEvent('afterFlicking', ht);
					}
				}
			}
			return;
		}

		this._move(nStart, nEnd, {
			duration : htOption.duration,
			contentsNextIndex : nIndex,
			fireEvent : htOption.fireEvent,
			fireMoveEvent : htOption.fireMoveEvent,
			corrupt : htOption.corrupt,
			direct : htUserOption.direct
		});
	},

	/**
	 * nDuration 동안 다음판으로 이동한다.
	 * @param  {Number} nDuration ms단위 시간
	 *
	 * @method moveNext
	 */
	moveNext : function(nDuration){
		var ht = {
			duration : nDuration,
			direct : false
		};
		if(this._bUseCircular && this.option("nTotalContents") <3) {
			// 2판 이하의 순환일 경우에는 위치를 강제로 변경하여 이동
			var nIndex = this.getContentIndex();
			if(this._bUseH) {
				this._nX = nIndex == 0 ? 1 : this._nX -1;
			} else {
				this._nY = nIndex == 0 ? 1 : this._nY -1;
			}
			ht.direct  = true;
		}
		this._moveTo(this.getNextIndex(), ht);
	},

	/**
	 * nDuration 동안 이전판으로 이동한다.
	 * @param  {Number} nDuration ms단위 시간
	 *
	 * @method movePrev
	 */
	movePrev : function(nDuration){
		// console.debug("movePrev");
		var ht = {
			duration : nDuration,
			direct : false
		};
		if(this._bUseCircular && this.option("nTotalContents") <3) {
			// 2판 이하의 순환일 경우에는 위치를 강제로 변경하여 이동
			var nIndex = this.getContentIndex();
			ht.direct  = true;
			if(this._bUseH) {
				this._nX = nIndex == 0 ? this._aPos[this.getTotalContents()-1] - 1: this._nX +1;
			} else {
				this._nY = nIndex == 0 ? this._aPos[this.getTotalContents()-1] - 1 : this._nY +1;
			}
			this._moveTo(this.getNextIndex(),ht);
		} else {
			this._moveTo(this.getPrevIndex(),ht);
		}
	},

	// touchStart 구현
	_startImpl : function(we) {
		if(this.isPlaying()) {
			// return false;
			return;
		}

		// jindo.m.SwipeCommon.prototype._startImpl.apply(this);

		// TODO :  nDistanceX 가 실제 이동한 수치가 달라 bNext 값이 정확하지 않음.. 그래서 시작시 위치 및 index 값을 기억.
		this._nPosToIndex = this._posToIndex(this._bUseH ? this._nX : this._nY);
		// return true;
	},

	// touchMove 구현
	_moveImpl : function(we) {
		var nVector = this._bUseH ? we.nVectorX : we.nVectorY,
			nDis = this._bUseH ? we.nDistanceX : we.nDistanceY,
			bNext = nDis < 0,
			nPos = this._bUseH ? this._nX : this._nY,
			nMoveIdx = bNext? this.getNextIndex() : this.getPrevIndex();

				// if(!this._bMove){
				//     this._preventHightlightForChrome("before");
				// }

		// 비순환 일경우, 마지막이나 처음 인덱스 일경우, 좌표이동간격을 1/2로 조정
		if(this._bUseCircular) {
			nPos += nVector;
		} else {
			nPos += (nMoveIdx == this.getContentIndex() ? nVector/2 : nVector);
		}
		this._nX = this._bUseH ? nPos : 0;
		this._nY = this._bUseV ? nPos : 0;
		we.bNext = bNext;
//		console.warn("move:",this._nX, this._nY);
		this._moveAfterCall && this._moveAfterCall(we);
		return bNext;
	},

	// touchEnd 구현
	_endImpl : function(we) {
		var ht = null,
			bNext = (this._bUseH ? we.nDistanceX : we.nDistanceY) < 0,
			nContentsIndex = this.getContentIndex(),
			nContentsNextIndex = bNext? this.getNextIndex() : this.getPrevIndex(),
			nStart = this._getPos(nContentsIndex),
			nDis = Math.abs((this._bUseH ? this._nX : this._nY) - nStart),
			isRestore = (nContentsIndex === nContentsNextIndex) || (nDis < parseInt(this.option("nFlickThreshold"), 10) || (this._aPos.indexOf(this._bUseH ? this._htSize.maxX : this._htSize.maxY)) < nContentsNextIndex );

		// 가로방향일 경우, 세로로 움직이면 nDis=0. 이때는 return
		if(nDis == 0 ) {
			return;
		}

		if(isRestore) {
			this._restore();
		} else {
			ht = this._getMomentumData(we, 1.5);
			// 모멘텀이 없거나, 처음과 마지막에서의 모멘텀은 한판씩 이동.
			if(ht.duration === 0 ||
				(bNext && nContentsIndex === this.getTotalContents() -1) || (!bNext && nContentsIndex === 0) ) {
				var nPos = this._bUseH ? this._nX : this._nY;

				// 한판 이상을 움직였을 경우 보정 작업
				if( (bNext && (nPos < this._aPos[nContentsNextIndex])) || (!bNext && (nPos > this._aPos[nContentsNextIndex])) ) {
					if(this._bUseCircular && this.option("nTotalContents") < 3) {
						if(nContentsIndex == 0 && nContentsNextIndex == 1 && !bNext) {
							if(this._bUseH) {
								this._nX = this._aPos[this.getTotalContents()-1] - 1;
							} else {
								this._nY = this._aPos[this.getTotalContents()-1] - 1;
							}
						}
					} else {
						this._setCurrentPos(nContentsIndex, bNext);
					}
				}
				// console.debug("_moveTo-nomomentum:", nContentsIndex + "(" + this._aPos[nContentsIndex] + "px) =>", nContentsNextIndex + "(" + this._aPos[nContentsNextIndex] + "px)", this._htSize.viewWidth);
				this._moveTo(this._nRange == null ? this._getNextIndexByView(nContentsIndex, bNext) : nContentsNextIndex,
				{
					duration : this.option("nDuration"),
					direct : true
				});
			} else { // 모멘텀
				// 현재 위치 보정 작업
				var nEndIndex = this._posToIndex(this._bUseH ? ht.nextX : ht.nextY);
				if(nEndIndex == nContentsIndex) {
					this._restore();
				} else {
					if(this._bUseCircular) {
						// 모멘텀에 의해 이동시 한판 앞에서 시작. (순환일경우에...)
						nContentsIndex += bNext ? 1 : -1;
						this._setCurrentPos(nContentsIndex, bNext);
					} else {
						this._setCurrentPos(nContentsIndex, bNext);
					}
					this._moveTo(nEndIndex, {
						duration : ht.duration
					});
				}
			}
		}
	},


	_getNextIndexByView : function(nIndex, bNext) {
		return bNext? this.getNextIndex() : this.getPrevIndex();
	// 	var base = this._aPos[nIndex],
	// 		v = null,
	// 		result;
	// 	if(bNext) {
		// 	result = nIndex;
		// 	for(var i=nIndex; i<this._aPos.length; i++) {
		// 		v = base - this._aPos[i];
		// 		if(v<this._htSize.viewWidth) {
		// 			result = i;
		// 		} else {
		// 			break;
		// 		}
		// 	}
		// } else {
		// 	result = 0;
		// 	for(var i=nIndex; i>=0; i--) {
		// 		v = this._aPos[i] - base;
		// 		if(v>this._htSize.viewWidth) {
		// 			break;
		// 		} else {
		// 			result = i;
		// 		}
		// 	}
		// }
		// return result;
	},

	_setCurrentPos : function(nIndex, bNext) {
		if(this._bUseH) {
			this._nX = this._aPos[nIndex];// + (bNext ? -1 : 1);
		} else {
			this._nY = this._aPos[nIndex];// + (bNext ? -1 : 1);
		}
	},

	// rotate될 때
	_resizeImpl : function(we) {
		this.resize();
	},

	// 위치를 반환한다.
	_restore : function() {
		if(!this._bUseH && !this._bUseV) {
				return;
		}
		var nNewPos = this._getPos(this.getContentIndex()),
			// htPos,
			nPos;
		// coverflicking일 경우, 별도 처리
		// if( (jindo.m.CoverFlicking && this instanceof jindo.m.CoverFlicking)
		// 	) {
		// 	// htPos = jindo.m.getTranslateOffset(this.getElement(this.getContentIndex()));
		// 	htPos = {
		// 		left : this._nX,
		// 		top : this._nY
		// 	};
		// } else {
		// 	htPos = jindo.m.getTranslateOffset(this._htWElement["container"]);
		// }
		// nPos = this._bUseH ? htPos.left : htPos.top;
		//
		//
		if( jindo.m.SlideFlicking && this instanceof jindo.m.SlideFlicking) {
			var htPos= jindo.m.getTranslateOffset(this._htWElement["container"]);
			nPos = this._bUseH ? htPos.left : htPos.top;
		} else {
			nPos = this._bUseH ? this._nX : this._nY;
		}
		// console.log("nX",this._nX, "htPos-index", jindo.m.getTranslateOffset(this.getElement(this.getContentIndex())).left, "htPos-container", jindo.m.getTranslateOffset(this._htWElement["container"]).left);
        // console.log(nPos, nNewPos);
		if (nNewPos === nPos) {
				/* 최종 종료 시점 */
			return;
		} else {
			// console.log(nPos, nNewPos);
			this._move(nPos, nNewPos, {
				duration : this.option("nBounceDuration"),
				restore : true
			});
		}
	},

	_getRevisionNo : function(nNo){
			var nMax = this.getTotalContents();
			if(nNo < 0) {
					nNo += nMax;
			} else if(nNo > nMax-1) {
					nNo = nNo % nMax;
			}
			return nNo;
	},

	// before사용자 이벤트 처리
	_fireCustomBeforeEvent : function(option) {
		// console.warn(option,"beforeAni");
		if(option.restore) {
			// console.warn("  . [panelStart] - beforeRestore ", this.getContentIndex());
			if(!this._fireRestoreEvent('beforeRestore',option)) {
				return false;
			}
		} else {
			// console.warn("  . [panelStart] - beforeFlicking ", this.getContentIndex());
			if(option.fireMoveEvent) {
				// 처음 호출시에만 beforeMove 호출
				if(option.moveIndex == 0) {
					if(!this._fireMoveEvent(option.contentsNextIndex)) {
							return false;
					}
				}
			} else {
				if(!this._fireFlickingEvent('beforeFlicking', option)) {
					// this._restore();
					return false;
				}
			}
		}
		return true;
	},

	// 패널이동이 완료된 이후, 정보 조정
	_setPanelEndInfo : function(option) {
			// console.warn("setPanelEndInfo : ", option.no,"->",option.contentsNextIndex);
			if(option.restore) {
				this._nX = this._bUseH ? this._getPos(option.no) : 0;
				this._nY = this._bUseV ? this._getPos(option.no) : 0;
			} else {
				// 순환인 경우, index를 보정함
				option.no = this._getRevisionNo(option.no);
				if(option.direct && option.moveCount > 1) {
					this._updateFlickInfo(option.no, this._htWElement["aPanel"][option.no]);
				} else {
					this._updateFlickInfo(option.no, option.next ? this.getNextElement() : this.getPrevElement());
				}
			}
	},

	// 종료 시점 사용자 이벤트 처리
	_fireCustomEvent : function(option) {
			// console.warn(option,"ani");
			if(option.restore) {
				// console.warn("  . [panelEnd] - restore ", option);
				this._fireRestoreEvent('restore', option);
			} else {
				if(option.fireMoveEvent) {
					// 즉시 호출하거나 (duration이 0, 또는 마지막페이지에서 이동하는 경우)
					if(option.duration === 0 || option.moveCount == (option.moveIndex+1)) {
						this._fireMoveEvent();
					}
				} else {
					/**
							플리킹 임계치에 도달하지 못하고 사용자의 액션이 끝났을 경우, 원래 인덱스로 복원하기 전에 발생하는 이벤트

							@event beforeRestore
							@param {String} sType 커스텀 이벤트명
							@param {Number} nContentsIndex 현재 콘텐츠의 인덱스
							@param {Function} stop 플리킹이 복원되지 않는다.
					**/

					/**
							플리킹 임계치에 도달하지 못하고 사용자의 액션이 끝났을 경우, 원래 인덱스로 복원한 후에 발생하는 이벤트

							@event restore
							@param {String} sType 커스텀 이벤트명
							@param {Number} nContentsIndex 현재 콘텐츠의 인덱스
					**/
						this._fireFlickingEvent('flicking', option);
					// jindo.m.Flicking 하위호환성지원을 위해
						this._fireFlickingEvent('afterFlicking', option);
				}
			}
	},

	// beforeFlicking, Flicking 사용자 이벤트 콜
	_fireFlickingEvent : function(name, we) {
		if(typeof this._htEventHandler[name] == "undefined") {
			return true;
		}
		var	ht = {
				nContentsIndex : this.getContentIndex(),
				bNext : we.next
			};

		if(/before/.test(name))	{
			// 바로 여러패널을 이동할 경우, 또는 처음 이동하는 경우
			// https://github.com/naver/jindojs-jmc/issues/2
			if(we.direct || (we.duration === 0 && we.moveCount > 1) || we.next == null) {
				ht.nContentsNextIndex = we.contentsNextIndex;
			} else {
				ht.nContentsNextIndex = we.next ? this.getNextIndex() : this.getPrevIndex();
			}
		}
		ht.nMoveCount = we.moveCount;
		ht.bCorrupt = we.corrupt;
		// jindo.m.Flicking 호환성을 위해 추가
		ht[this._bUseH ? "bLeft" : "bTop"] = ht.bNext;
		/**
				플리킹되기 전에 발생한다

				@event beforeFlicking
				@param {String} sType 커스텀 이벤트명
				@param {Number} nContentsIndex 현재 콘텐츠의 인덱스
				@param {Number} nContentsNextIndex 플리킹될 다음 콘텐츠의 인덱스
				@param {Boolean} bCorrupt 순환 플리킹일 경우, 현재 판의 재정렬이 필요할 경우, true를 반환한다.<br/>
				@param {Number} nMoveCount 이동한 판의 개수를 양수로 반환한다.
				@param {Boolean} bNext 플리킹 방향이 다음인지에 대한 여부
				@param {Boolean} bLeft 플리킹 방향이 왼쪽인지에 대한 여부 (세로 플리킹일 경우 이 값은 없다. @deprecated bNext로 변경)
				@param {Boolean} bTop 플리킹 방향이 위쪽인지에 대한 여부 (가로 플리킹일 경우 이 값은 없다. @deprecated bNext로 변경)
				@param {Function} stop 플리킹되지 않는다.
		**/
		/**
				플리킹된 후에 발생한다

				@event flicking
				@param {String} sType 커스텀 이벤트명
				@param {Number} nContentsIndex 현재 콘텐츠의 인덱스
				@param {Boolean} bCorrupt 순환 플리킹일 경우, 현재 판의 재정렬이 필요할 경우, true를 반환한다.<br/>
				@param {Number} nMoveCount 이동한 판의 개수를 양수로 반환한다.
				@param {Boolean} bNext 플리킹 방향이 다음인지에 대한 여부
				@param {Boolean} bLeft 플리킹 방향이 왼쪽인지에 대한 여부 (세로 플리킹일 경우 이 값은 없다. @deprecated bNext로 변경)
				@param {Boolean} bTop 플리킹 방향이 위쪽인지에 대한 여부 (가로 플리킹일 경우 이 값은 없다. @deprecated bNext로 변경)
		**/
		// console.log(name, ht);
		return this.fireEvent(name, ht);
	},

	// beforeRestore, Restore 사용자 이벤트 콜
	_fireRestoreEvent : function(name, we) {
		return this.fireEvent(name, {
			nContentsIndex : this.getContentIndex()
		});
	},

	// beforeMove, Move 사용자 이벤트 콜 (jindo.m.Flicking 호환성을 보장하기 위한 코드)
	_fireMoveEvent : function(nNextIndex) {
		if(typeof nNextIndex === "undefined") {
			return this.fireEvent("move", { nContentsIndex : this.getContentIndex() });
		} else {
			return this.fireEvent("beforeMove", {
				nContentsIndex : this.getContentIndex(),
				nContentsNextIndex : nNextIndex
			});
		}
	},

	// _nContentIndex에 맞게 좌표 조정
	_updateFlickInfo : function(nIndex, wel) {
		this._nContentIndex = typeof nIndex === "undefined" ? this.getContentIndex() : nIndex;
		wel = typeof wel === "undefined" ? this.getElement() : wel;
		// 좌표 조정
		// console.warn("_updateFlickInfo no:",this._nContentIndex, "to:",this._getPos(this._nContentIndex), "X:",this._nX);
			this._nX = this._bUseH ? this._getPos(this._nContentIndex) : 0;
			this._nY = this._bUseV ? this._getPos(this._nContentIndex) : 0;
		// console.log("=-=-=-=-=>", this._htSize.maxX, "X:",this._nX);

		// 엘리먼트 조정
		this._welElement = wel;
	},

	/**
	 * 애니메이션 종료 시점
	 * @param  {[type]} we [description]
	 * @return {[type]}    [description]
	 */
	_onEndAniImpl : function(we) {
		if(this._bUseCircular) {
			// 순환일 경우, anchor를 재갱신한다.
			// this._refreshAnchor();
			// this._refreshHightlightForChrome();
		}
	},

	_makeOption : function(ht) {
		// console.warn("_makeOption : ", ht.corrupt);
		var result = jindo.$Jindo.mixin({
			duration : 0,
			restore : false,			// 원복 여부
			fireEvent : true,
			fireMoveEvent : false,
			moveCount : 1,				// 판이 이동하는 개수
			moveIndex : 0,				// 이동하는 판의 index (0부터)
			corrupt : false,			// 판 변경 여부

			// 넘기는 데이터
			useCircular : this._bUseCircular,
			range : this._nRange
		}, ht || {});
		result.restore && (result.moveCount = 0);
		(result.moveCount > 1 && result.duration === 0) && (result.corrupt = true);
		// @todo SlideFlicking 일 경우, beforeFlicking/Flicking이 attach되지 않았을 경우, 바로 이동함. 추후 개선이 필요함.
		result.direct = result.direct || (
			jindo.m.SlideFlicking &&
			this instanceof jindo.m.SlideFlicking &&
			typeof this._htEventHandler["beforeFlicking"] == "undefined" &&
			typeof this._htEventHandler["flicking"] == "undefined" &&
			typeof this._htEventHandler["afterFlicking"] == "undefined"
		);
		return result;
	},

	// 플리킹 이동하는 내부 함수
	_moveWithEvent : function(nPos, nDuration, htOption) {
		var self = this,
			htParam = {};


		htOption.no = this._posToIndex(nPos);	// 판의 인덱스 (이동할...)
		// debugger;
		// 복사...
		htParam = jindo.$Jindo.mixin(htOption, {});
		// console.debug("moveCount",htParam.moveCount);
		if(!htParam.fireMoveEvent && htParam.moveCount > 1) {
			htParam.contentsNextIndex = htParam.no;
		}
		// console.log(htParam.no, htParam, "_moveWith");
		// 패널 이동 전에 호출
		self._panelEndBeforeCall && self._panelEndBeforeCall(htParam);

		// before
		this._oAnimation._oMorph.pushCall(function() {
			if(htParam.fireEvent && !self._fireCustomBeforeEvent(htParam)) {
				// this.pause().clear();
				this.clear();
				self._restore();
			}
		});

		// animating...move
		this._oAnimation.move(this._bUseH ? nPos : 0, this._bUseV ? nPos : 0, nDuration, htParam);

		this._oAnimation._oMorph.pushCall(function() {
			self._setPanelEndInfo(htParam);
			// 패널 이동이 완료되었을때 호출
			self._panelEndAfterCall && self._panelEndAfterCall(htParam);
			htParam.fireEvent && self._fireCustomEvent(htParam);
		});
		return this._oAnimation._oMorph;
	},

	_move : function (nStart, nEnd, htOption) {
		if(!this._bUseCircular) {
			// 최대값 이하로만 항상 이동.
			var nMax = this._bUseH ? this._htSize.maxX : this._htSize.maxY;
			nEnd = nEnd < nMax ? nMax : nEnd;
		}
		if(nStart === nEnd) {
			return;
		}

		this._clearOffsetBug();	// 연속적으로 move가 될경우, 기존 offset 조정 작업을 제거
		// console.warn("_move : " , htOption.corrupt);
		// console.info("start--", nStart, nEnd);
		var bNext = nStart > nEnd,
			nStepCount = this._getStepCount(nStart, nEnd);
		htOption = htOption || {};
		htOption.moveCount = nStepCount;
		htOption.next = bNext;
		htOption = this._makeOption(htOption);
		// console.warn("after _move : " , htOption.corrupt);
		// console.debug("_move : " + nStart + " -> " + nEnd, " (" + htOption.duration, "ms)", "restore:",htOption.restore, "next:",htOption.next, "nextIndex:", htOption.contentsNextIndex);

		// 원복일 경우...처리
		if(htOption.restore) {
			this._moveWithEvent(nEnd, htOption.duration, htOption).play();
			return;
		}

		// duration 이 0일 경우 바로 이동.
		if(htOption.duration == 0) {
			this._moveWithEvent(nEnd, 0, htOption).play();
		} else {
			// 한꺼번에 이동하는 경우
			if(htOption.direct) {
				this._moveWithEvent(nEnd, htOption.duration, htOption).play();
			} else {
				// 쪼개서 이동하는 경우
				var nStepDuration = 0,
					nStartPart = nStart,
					nEndPart = 0,
					fnEffect = this.option("fpPanelEffect")(0, htOption.duration);

				// 애니메이션 queue 쌓기
				for(var i=0; i<nStepCount; i++) {
					// 이동하는 index 저장
					htOption.moveIndex = i;
					nEndPart = this._getPanelEndPos(nStartPart, nEnd, bNext);
					nStepDuration = fnEffect((i+1)/nStepCount) - fnEffect(i/nStepCount);
					// console.warn("  . (" + nStartPart + " -> " + nEndPart + ")",
					// 	"restore/" + htOption.restore,
					//  	// "range/" + this._nRange,
					//  	"next/" + bNext,
					//  	" ( " + nStepDuration, " ms)"
					// );
					this._moveWithEvent(nEndPart, nStepDuration, htOption);
					nStartPart = nEndPart;
				}
			}
			this._oAnimation._oMorph.play();
		}
	},

	_getPos : function(nIndex) {
		if(nIndex < 0 || nIndex >= this._aPos.length) {
			// console.trace("wrong");
			console.error("wrong index", nIndex);
			return 0;
		} else {
			return this._aPos[nIndex];
		}
	},

	_isPosPoint : function(nPos) {
		return this._aPos.indexOf(nPos) != -1;
	},

	_getStepCount : function(nStart, nEnd) {
		var	bNext = nStart > nEnd;
		var nStartIdx = this._posToIndex(nStart),
			nEndIdx = this._posToIndex(nEnd),
			nCount = Math.abs(nEndIdx-nStartIdx);
		// console.debug(bNext, nStart, "(", nStartIdx, ")", nEnd, "(", nEndIdx, ")");
		if(!bNext &&
			!this._isPosPoint(nStart) &&
			this._isPosPoint(nEnd) ) {
				nCount++;
		}
		return nCount;
	},

	// 포지션값을 인덱스로 변경
	_posToIndex : function(nPos) {
		for(var i=0, nIndex=-1, v, nLen = this._aPos.length; i<nLen; i++) {
			v = this._aPos[i];
			if(nPos < v) {
				nIndex++;
			} else if(nPos == v) {
				nIndex++;
				break;
			} else {
				break;
			}
		}
		// console.error(Math.floor(-nPos/this._nRange), nIndex);
		return nIndex;
	},

	// 시작좌표를 기준으로 종료 좌표를 구하기
	_getPanelEndPos : function(nStart, nEnd, bNext) {
		var	nCurrentPanel = this._posToIndex(nStart),
			nEndPos;
		(!bNext && !this._isPosPoint(nStart)) && (nCurrentPanel++);
		nCurrentPanel += bNext ?  1 : -1;

		if(this._bUseCircular && nCurrentPanel < 0) {
			nEndPos = nStart + nEnd;
		} else {
			nEndPos = this._getPos(nCurrentPanel);
		}
		( (this._nRange == null) && bNext) && (nEndPos = nEnd > nEndPos ? nEnd : nEndPos);

		return nEndPos;
	},

	_getTranslate : function(nPos) {
		return this._oAnimation.getTranslate(this._bUseH ? nPos : 0,  this._bUseV ? nPos : 0);
	},

	// 탭 호출시 처리
	_tapImpl : function() {
		if(this._hasKitkatHighlightBug) {
			this._htWElement["container"].removeClass(jindo.m.KITKAT_HIGHLIGHT_CLASS);
			// 하이라이트가 안나오는 경우가 있음. 네이버 인앱...강제 reflow발생
			this._htWElement["container"]._element.clientHeight;
			var self = this;
			clearTimeout(this._nKitkatHighlightBug);
			this._nKitkatHighlightBug = setTimeout(function() {
				self._htWElement["container"].addClass(jindo.m.KITKAT_HIGHLIGHT_CLASS);
			},200);
		}
	},

	/**
			jindo.m.Flick 에서 사용하는 모든 객체를 release 시킨다.
			@method destroy
	**/
	destroy: function() {
		jindo.m.SwipeCommon.prototype.destroy.apply(this);
	}
}).extend(jindo.m.SwipeCommon);