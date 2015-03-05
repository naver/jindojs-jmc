/**
    @fileOverview 여러개의 콘텐츠 영역을 사용자 터치의 움직임을 통해 좌/우, 상/하로 커버되어 보여주는 컴포넌트

    @author sculove
    @version #__VERSION__#
    @since 2013. 4. 27.
*/
/**
    여러개의 콘텐츠 영역을 사용자 터치의 움직임을 통해 좌/우, 상/하로 커버되어 보여주는 컴포넌트

    @class jindo.m.CoverFlicking
    @extends jindo.m.Flick
    @uses jindo.m.Cover
    @keyword flicking, 플리킹
    @group Component

    @history 1.13.0 Support Firefox 브라우저 지원
    @history 1.13.0 Update setTotalContents 추가 (동적으로 전체 컨텐츠값을 변경할수 있다)
		@history 1.12.0 Bug moveTo호출시 duration이 0 인 경우 플리킹이 제어가 깨지는 문제 수정
		@history 1.11.0 Bug 플리킹의 베이스 엘리먼트에 사이즈를 지정하지 않았을 경우, 화면에 나타나지 않는 문제 수정
		@history 1.10.0 Bug bUseTimingFunction을 true로 지정해도 false로 동작했던 것 수정
    @history 1.10.0 New beforeTouchXXXXX 계열 이벤트 추가
		@history 1.9.0 Update jindo.m.Morph 기반으로 변경
		@history 1.8.0 Release 최초 릴리즈
**/
jindo.m.CoverFlicking = jindo.$Class({
	/* @lends jindo.m.CoverFlicking.prototype */
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
					@param {Number} [htOption.nDeceleration=0.0006] 가속도의 감속계수. 이 값이 클수록, 가속도는 감소한다



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
  **/
	$init : function(el,htUserOption) {
		this.option(htUserOption || {});
		this._initVar();
		this._setWrapperElement(el);
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},

	_onActivate : function() {
		jindo.m.Flick.prototype._onActivate.apply(this);
		var self = this;
		this.set(new jindo.m.Cover(
			this._getAnimationOption(
				this.option("nDefaultScale") ? {
					nDefaultScale : this.option("nDefaultScale")
				} : {}
			)).attach({
				"set" : function(we) {
					self._setStyle(we.css);
				}
			}),
			this._htWElement["aPanel"]
		);
	},

	_setStyle : function(htCss) {
		htCss[this._bUseH ? "width" : "height"] = "100%";
		this._htWElement["container"].css(htCss);
		this._changeTarget(true);
	},

	refresh : function(n) {
		jindo.m.Flick.prototype.refresh.call(this,n);
		this._changeTarget(true);	// 타겟을 변경
	},

	_changeTarget : function(bNext) {
		// if(this._oAnimation.isPlaying()) {
		// 	return;
		// }
		//
		var welTarget = this.getElement(),
			welZoom = bNext ? this.getNextElement() : this.getPrevElement();
		welZoom = welTarget.isEqual(welZoom) ? null : welZoom;
		// console.log("Target : " ,welTarget.attr("id"), ", Zoom : " , welZoom ? welZoom.attr("id") : null);
		this._oAnimation.change(welTarget, welZoom, bNext);
		return {
			target : welTarget,
			zoom : welZoom
		};
	},

	_moveTo : function(nIndex, nDuration) {
		var nMax = this.getTotalContents()-1,
			nCurrentIndex = this.getContentIndex(),
			bNext = nCurrentIndex < nIndex;

        if(this.isPlaying() || isNaN(nIndex) || nIndex < 0 || nIndex > nMax) {
            return false;
        }

		if(this._bUseCircular) {
			if(nCurrentIndex === nMax && nIndex === 0) {
				bNext = true;
			} else if(nCurrentIndex === 0 && nIndex === nMax) {
				bNext = false;
			}
		}
		this._changeTarget(bNext);
		jindo.m.Flick.prototype._moveTo.call(this, nIndex, nDuration);
	},

	_panelEndBeforeCall : function(we) {

		// cover는 비순환일 경우, duration이 0 이면, 최종 타겟과 zoom을 지정하여 변경해줘야한다.
		if(!we.useCircular && we.duration == 0 && we.moveCount > 1) {
			this._updateFlickInfo(we.no, this._htWElement["aPanel"][we.no]);
		}
	},

  // 패널 이동이 완료되었을때 호출
	_panelEndAfterCall : function(we) {
		var ht = this._changeTarget(we.next),
			// morph의 내부 변수를 이용하여 처리
			// cover는 누적된 애니메이션 처리시 변경될 엘리먼트를 알수 없기 때문에 (큐잉되는 시점에 변경될 엘리먼트를 Animation에서는 알지 못하기 때문에), 패널이 종료된 이후에, 변경된 엘리먼트를 재 갱신함.
			nPtr = this._oAnimation._oMorph._nPtr;
		if(this._oAnimation._oMorph._aQueue.length > nPtr) {
			var aMorphData = this._oAnimation._oMorph._aQueue[nPtr+1];
			if(aMorphData.length > 3) {
				ht.target && (aMorphData[0] = ht.target);
				ht.zoom && (aMorphData[2] = ht.zoom);
			}
		}
	},

	// 이동후에 호출
	_moveAfterCall : function(we) {
		this._changeTarget(we.bNext);
    this._oAnimation.move(this._nX, this._nY, 0, this._makeOption({ next : we.bNext}) );
	},

  /**
      jindo.m.CoverFlicking 에서 사용하는 모든 객체를 release 시킨다.
      @method destroy
  **/
	destroy: function() {
		jindo.m.Flick.prototype.destroy.apply(this);
	}
}).extend(jindo.m.Flick);