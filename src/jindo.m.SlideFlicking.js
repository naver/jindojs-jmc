/**
    @fileOverview 여러개의 콘텐츠 영역을 사용자 터치의 움직임을 통해 좌/우, 상/하 로 슬라이드하여 보여주는 컴포넌트
    @author sculove
    @version #__VERSION__#
    @since 2013. 4. 27.
*/
/**
    여러개의 콘텐츠 영역을 사용자 터치의 움직임을 통해 좌/우, 상/하 로 슬라이드하여 보여주는 컴포넌트

    @class jindo.m.SlideFlicking
    @extends jindo.m.Flick
    @uses jindo.m.Slide
    @keyword flicking, 플리킹
    @group Component

    @history 1.14.0 Update bFitContentSize 옵션 추가. 뷰 안에 다양한 크기의 컨텐츠를 플리킹 할수 있는 기능 추가
    @history 1.13.0 Support Firefox 브라우저 지원
    @history 1.13.0 Update setTotalContents 추가 (동적으로 전체 컨텐츠값을 변경할수 있다)
		@history 1.12.0 Bug ios인 경우, 패널의 reference가 없어지는 문제 수정
		@history 1.11.0 Bug ios인 경우, 잔상이 남는 오류 수정
		@history 1.11.0 Bug 플리킹의 베이스 엘리먼트에 사이즈를 지정하지 않았을 경우, 화면에 나타나지 않는 문제 수정
		@history 1.10.0 Bug 연속으로 move를 호출하는 경우 플리킹이 깨지는 문제 수정
		@history 1.10.0 Bug bUseTimingFunction을 true로 지정해도 false로 동작했던 것 수정
    @history 1.10.0 New beforeTouchXXXXX 계열 이벤트 추가
		@history 1.9.0 Update jindo.m.Morph 기반으로 변경
		@history 1.8.0 Release 최초 릴리즈
**/
jindo.m.SlideFlicking = jindo.$Class({
	/* @lends jindo.m.SlideFlicking.prototype */
	/**
      초기화 함수

      @constructor
      @param {String|HTMLElement} el 플리킹 기준 Element (필수)
      @param {Object} [htOption] 초기화 옵션 객체
				// SwipeCommon
				@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
	      @param {Boolean} [htOption.bUseHighlight=true] 하이라이트 사용 여부
	      @param {Boolean} [htOption.bUseDiagonalTouch=true] 대각선스크롤 방향의 터치를 사용할지 여부
	      @param {Boolean} [htOption.bUseMomentum=false] 가속을 통한 모멘텀 사용여부
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

            @param {Boolean} [htOption.bFitContentSize=true] false로 설정할 경우 뷰와 다른 크기의 컨텐츠를 플리킹할 수 있다. 단, 비순환일 경우에만 동작한다.
  **/
	$init : function(el,htUserOption) {
		// console.log("--Panel init");
		this.option(htUserOption || {});
		this._initVar();
		this._oDocFragment = document.createDocumentFragment();
		this._setWrapperElement(el);
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},

	_onActivate : function() {
		jindo.m.Flick.prototype._onActivate.apply(this);

		var self = this;
		this.set(new jindo.m.Slide(this._getAnimationOption())
			.attach({
				"set" : function(we) {
					self._setStyle(we.css);
				}
			}),
			this._htWElement["container"]
		);
	},

	// 엘리먼트 구조 설정하기
	_setStyle : function(htCss) {
		var htContCss = {},
			nPos = 0,
			nSizeKey = this._bUseH ? "width" : "height",
			nPosKey = this._bUseH ? "left" : "top";

		jindo.$Jindo.mixin(htContCss, htCss);

		if(this._bUseCircular) {
			// container
			htContCss[nSizeKey] = "100%";
			htContCss[nPosKey] = "-100%";
			// panel
			htCss["position"] = "absolute";
			htCss[nSizeKey] = "100%";
			htCss["left"] = 0;
			htCss["top"] = 0;
		}
		if(this._bUseH) {
			htContCss["clear"] = "both";
			htCss["float"] = "left";
		}
		this._htWElement["container"].css(htContCss);
		jindo.$A(this._htWElement["aPanel"]).forEach(function(v,i,a){
      if(this._bUseCircular) {
					nPos = (((i+1)%(this._nDefaultPanel))*100) + "%";
          if(this._hasOffsetBug()) {
              htCss[nPosKey] = nPos;
          } else {
              htCss[jindo.m._toPrefixStr("Transform")] = this._getTranslate(nPos);
          }
      }
		  v.css(htCss);
		},this);
	},

	resize : function() {
		jindo.m.Flick.prototype.resize.call(this);
		var nSizeKey = this._bUseH ? "width" : "height",
			nViewSize = this._htWElement["view"][nSizeKey]();

		// 비순환일 경우는 패널의 크기도 변하기 때문에 resize될때 위치를 다시 맞춰준다.
		if(!this._bUseCircular) {
			this._htWElement["container"].css(nSizeKey, -this._aPos[this._aPos.length-1] + "px");
			if(this.option("bFitContentSize")) {
				jindo.$A(this._htWElement["aPanel"]).forEach(function(v,i,a){
		   		v.css(nSizeKey, nViewSize + "px");
				});
			} else {
				var nLastPos = this._aPos[this._aPos.length-1] + nViewSize;
				if(nLastPos < 0) {
	    		jindo.$A(this._aPos).forEach(function(v,i,a) {
	    			if(v < nLastPos) {
	    				this._aPos.length =i;
	    				jindo.$A.Break();
	    			}
	    		},this);
	    		this._aPos.push(nLastPos);

	    		// Max값 재지정
		    	if(this._bUseH) {
			  		this._htSize.maxX = nLastPos;
			  	} else {
						this._htSize.maxY = nLastPos;
			  	}
			  	// 인덱스 재설정
			  	if(this._aPos.length <= this.getContentIndex()) {
			  		this._nContentIndex = this._aPos.length-1;
			  	}
			  }
			}

			this._updateFlickInfo();
			this._oAnimation.move(this._nX, this._nY);
    }
	},

	// 3개의 판을 wel중심으로 맞춘다.
	// wel이 없을 경우, 현재 엘리먼트기준으로 맞춘다.
	_restorePanel : function(wel) {
		wel = wel || this.getElement();
		var n = this._getIndexByElement(wel),
			sPosition = this._hasOffsetBug() ? (this._bUseH ? "left" : "top") : jindo.m._toPrefixStr("Transform"),
			nPrev = (((n-1) < 0 )? (this._nDefaultPanel-1) : (n-1))%(this._nDefaultPanel),
			nNext = ((((n+1)%(this._nDefaultPanel)) > (this._nDefaultPanel-1) )? 0 : (n+1))%(this._nDefaultPanel),
			nCenter = n%(this._nDefaultPanel);

		this._welElement = this._htWElement["aPanel"][nCenter];
		// container는 항상 고정!
		this._htWElement["container"].css(jindo.m._toPrefixStr("Transform"), this._getTranslate(0));
		this._welElement.css(sPosition, this._getPosValue("100%")).css('zIndex',10);
		this._htWElement["aPanel"][nPrev].css(sPosition, this._getPosValue("0%")).css('zIndex',1);
		this._htWElement["aPanel"][nNext].css(sPosition, this._getPosValue("200%")).css('zIndex',1);

		// ios인 경우, 잔상이 남는 오류
		if(jindo.m.getOsInfo().ios && this._bUseCircular){
         this._oDocFragment.appendChild(this._htWElement.aPanel[nPrev].$value());
         this._oDocFragment.appendChild(this._htWElement.aPanel[nNext].$value());
         this._htWElement.container.$value().appendChild(this._oDocFragment);
    }
	},

	_getPosValue : function(sV) {
		return this._hasOffsetBug() ? sV : this._getTranslate(sV);
	},

	/**
	 * 패널 이동이 완료되었을때 호출
	 */
  _panelEndAfterCall : function(option) {
  	if(this._bUseCircular) {
  		this._restorePanel();
  	}
  	// console.debug("panelEnd" , this._oAnimation._oMorph._aQueue);
  },

  // 이동이후에 호출
	_moveAfterCall : function(we) {
		// var bNext = jindo.m.Flick.prototype._moveImpl.call(this,we);
    this._oAnimation.move(this._nX, this._nY, 0, this._makeOption({ next : we.bNext}) );
	},

	_onEndAniImpl : function(we) {
		jindo.m.Flick.prototype._onEndAniImpl.apply(this);
  	if(!this._bUseCircular) {
  		// 순환일 경우, 버그 패치
  		this._fixOffsetBugImpl();
  	}
  },

  /**
      jindo.m.SwipeCommonScroll 에서 사용하는 모든 객체를 release 시킨다.
      @method destroy
  **/
	destroy: function() {
		jindo.m.Flick.prototype.destroy.apply(this);
	}
}).extend(jindo.m.Flick);