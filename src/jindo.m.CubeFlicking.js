/**
    @fileOverview 플리킹 판을 처리하는 컴포넌트
    @author sculove
    @version #__VERSION__#
    @since 2013. 2. 27.
*/
/**
    여러개의 콘텐츠 영역을 사용자 터치의 움직임을 통해 좌/우, 상/하 로 슬라이드하여 보여주는 컴포넌트

    @class jindo.m.CubeFlicking
    @extends jindo.m.Flick
    @uses jindo.m.Cube
    @keyword flicking, 플리킹
    @group Component

    @history 1.13.0 Support Firefox 브라우저 지원
    @history 1.13.0 Update setTotalContents 추가 (동적으로 전체 컨텐츠값을 변경할수 있다)
    @history 1.13.0 Bug 순환플리킹에서 회전시 사이즈를 재정의 하지 않는 문제 수정 
    @history 1.12.0 Bug 순환플리킹에서 버튼을 통한 이동(moveNext/movePrev)시 정상동작되지 않는 문제 수정 
    @history 1.11.0 Bug 플리킹의 베이스 엘리먼트에 사이즈를 지정하지 않았을 경우, 화면에 나타나지 않는 문제 수정
    @history 1.10.0 Bug bUseTimingFunction을 true로 지정해도 false로 동작했던 것 수정
    @history 1.10.0 New beforeTouchXXXXX 계열 이벤트 추가
    @history 1.9.0 Update jindo.m.Morph 기반으로 변경
    @history 1.8.0 Release 최초 릴리즈   
**/
jindo.m.CubeFlicking = jindo.$Class({
    /* @lends jindo.m.CubeFlicking.prototype */
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
        // console.log("--Panel init");
        this.option(htUserOption || {});
        this._initVar();
        this._setWrapperElement(el);
        if(this.option("bActivateOnload")) {
            this.activate();
        }
    },
    
    _initVar : function(){
        jindo.m.Flick.prototype._initVar.apply(this);
        this._sCssPrefix = jindo.m.getCssPrefix();
        // this._nHalpSize = parseInt(this._htWElement["view"].css(this._bUseH  ? "width" : "height"), 10)/2;
    },

    _onActivate : function() {
        jindo.m.Flick.prototype._onActivate.apply(this);
        
        this._setHalfWidth();
        this._sRotate = this._bUseH  ? "Y" : "X";
        
        var self = this;
        this.set(new jindo.m.Cube(this._getAnimationOption())
            .attach({
                "set" : function(we) {
                    self._setStyle();
                }
            }),
            this._htWElement, 
            this._nHalpSize
        );
        
    },
    
    _setHalfWidth : function(){
        this._nHalpSize = parseInt(this._htWElement["view"].css(this._bUseH  ? "width" : "height"), 10)/2;
    },
    
    // 엘리먼트 구조 설정하기
    _setStyle : function(nIndex) {
       var htCss = null,
            nPos = 0,
            nSizeKey = this._bUseH ? "width" : "height",
            self = this;
            
        nIndex = nIndex || this.option("nDefaultIndex") || 0;
            
        function setHtCss(nNum){
            htCss = {};
            htCss["position"] = "absolute";
            htCss["float"] = "left";
            htCss[self._oAnimation.p("BackfaceVisibility")] = "hidden";
            var nDeg = 0;
            nDeg = -nDeg + (((90 * nNum) * (self._bUseH ? 1 : -1)));
            
            if( !self._bUseCircular && ( nNum < (nIndex - 1) || nNum > (nIndex + 1) )){
                htCss["display"] = "none";
            } else{
                htCss["display"] = "block";
                htCss[self._oAnimation.p("Transform")] = "rotate"+self._sRotate+"("+ nDeg +"deg) translateZ("+ self._nHalpSize  +"px) ";    
            }
        }

        jindo.$A(this._htWElement["aPanel"]).forEach(function(v,i,a){
            setHtCss(i);
            v.css(htCss);
        });  

    },

    refresh : function(n) {
        jindo.m.Flick.prototype.refresh.call(this, n);
        if(this._bUseCircular) {
            this._restorePanel();
        }
    },

    resize : function() {
        jindo.m.Flick.prototype.resize.call(this);
        
        this._sRotate = this._bUseH  ? "Y" : "X";
        this._setHalfWidth();
        
        var nSizeKey = this._bUseH ? "width" : "height",
            nViewSize = this._htWElement["view"][nSizeKey](),
            htCss = {},
            htContCss = {};
        
        
        // 비순환일 경우는 패널의 크기도 변하기 때문에 resize될때 위치를 다시 맞춰준다.
        if(!this._bUseCircular) {
            this._updateFlickInfo();
            this._oAnimation.move(this._nX, this._nY, 0, this._makeOption({
                    nHalpSize : this._nHalpSize
                })
            );
        }
        
        htContCss[nSizeKey] = nViewSize + "px";
        htCss[nSizeKey] = nViewSize + "px";
        
        this._htWElement["container"].css(htContCss);
        
        var self = this;
        jindo.$A(this._htWElement["aPanel"]).forEach(function(v,i,a){
            v.css(nSizeKey, nViewSize + "px");
            v.css(self._oAnimation.p("Transform"), "rotate"+self._sRotate+"("+ ((90 * i) * (self._bUseH ? 1 : -1)) +"deg) translateZ("+ self._nHalpSize  +"px) ");
            // });
        });
        
        if(this._bUseCircular) {
            this._restorePanel();
        }
    },

    // rotate 구현
    // _resizeImpl : function(we) {
        // if(!this._bUseCircular) {
            // this.resize();
        // }
    // },
    
    _moveAfterCall : function(we) {
        // jindo.m.Flick.prototype._moveImpl.call(this,we);
        // var bNext = jindo.m.Flick.prototype._moveImpl.call(this,we);
        
        this._oAnimation.move(this._nX, this._nY, 0, this._makeOption({
            next : we.bNext,
            nDis : (this._bUseH ? this._nX : this._nY) - this._aPos[this.getContentIndex()],
            nHalpSize : this._nHalpSize,
            no : this.getContentIndex()
        })); 
        
    },
    
    /**
     * 데이터 추가 적용으로 인한 override
     */
    _moveWithEvent : function(nPos, nDuration, htOption) {
        
        htOption.nHalpSize = this._nHalpSize;

        return jindo.m.Flick.prototype._moveWithEvent.call(this, nPos, nDuration, htOption);
    },
    
    /**
     * 패널 위치 재정의 함수 
     * @param {Element} wel     현재 패널     
     * @param {Boolean} bNext   다음/이전 여   
     */
    _restorePanel : function(wel, bNext){
        wel = wel || this.getElement();
        var n = this._getIndexByElement(wel),
            // sPosition = this._oAnimation.p("Transform"),
            sPosition = this._bUseH ? "left" : "top",
            nPrev = (((n-1) < 0 )? (this._nDefaultPanel-1) : (n-1))%(this._nDefaultPanel),
            nNext = ((((n+1)%this._nDefaultPanel) > (this._nDefaultPanel-1) )? 0 : (n+1))%(this._nDefaultPanel),
            nCenter = n%(this._nDefaultPanel),
            nContentIndex = this.getContentIndex();

        var sTransform = this._oAnimation.p("Transform");
        var sRotate = "rotate"+this._sRotate;
        var nDeg = 90 * (this._bUseH ? 1 : -1);
        var nHalfWidth = this._nHalpSize;
        
        var self = this;
        function fnSetPanelPos(index, deg){
            self._htWElement["aPanel"][index].css(sTransform, sRotate + "(" + deg + "deg) translateZ(" + nHalfWidth + "px)");
        }
        if(this._bUseCircular) {
            //htInfo.bNext == undefined 인 경우 --> refresh 함수 호출을 통한 접근시..
            if(nContentIndex == 0 || typeof bNext == "undefined" || (nContentIndex == this.option("nTotalContents") - 1 && !bNext)){
                // 위치 재 정의시 뒤로 이동하는 모션이 발생하여 이를 처리하기 위한 수정 
                this._htWElement["container"].css(this._oAnimation.p("TransitionDuration"),"").css(sTransform,"translateZ(-"+ nHalfWidth +"px) "+sRotate+"("+(nContentIndex * -nDeg) +"deg) ");
                fnSetPanelPos( nPrev , (nContentIndex - 1) * nDeg );
                fnSetPanelPos( nCenter , (nContentIndex) * nDeg );
                fnSetPanelPos( nNext , (nContentIndex + 1) * nDeg );
            } else{
                if(!bNext){
                    fnSetPanelPos( nPrev , ((nContentIndex - 1) ) * nDeg );
                    // fnSetPanelPos( htInfo.nPrev , ((htInfo.nContentIndex - 1) - (this.option("nTotalContents") % 4)) * nDeg );
                }else{
                    fnSetPanelPos( nNext , ((nContentIndex + 1) ) * nDeg );
                    // fnSetPanelPos( htInfo.nNext , ((htInfo.nContentIndex + 1) - (this.option("nTotalContents") % 4)) * nDeg );
                }
            } 
        }
        // console.log(htInfo.nPrev + "|" + htInfo.nCenter + "|" + htInfo.nNext);
    },
    
    /**
     * 패널 이동이 완료되었을때 호출
     */
      _panelEndAfterCall : function(option) {
        if(this._bUseCircular) {
            this._restorePanel("", option.next);
        }else{
            this._setStyle(option.no);
        }
      },
    
    /**
     * SwapCommon 에서 처리하고 있는 내용과 다른 처리로 인해 override 
     */
    // _onProgressAniImpl : function(we) {
    //   // console.trace();
    //     var alist = we.aLists;
    //     if(alist && alist.length > 0 && alist[1]["@transform"]) {
    //         jindo.$A(alist[1]["@transform"].match(/(rotate[XY]\()(\-?(\d+)(\.\d+)?)/g)).forEach(function(v,i,a) {
    //           this["_n"+ (this._bUseH ? "X" : "Y")] = (v.replace(/rotate[XY]\(/,"")*1 || 0) * this._nHalpSize / 45  * (this._bUseH ? 1 : -1);
    //       },this);
    //     } else {
    //       this._nX = we.nLeft;
    //       this._nY = we.nTop;
    //     }
    
    //     this.fireEvent("progress", {
    //       nLeft : this._nX,
    //       nTop : this._nY
    //     });
    //     // console.warn(this._nX, this._nY);
    // },

  /**
      jindo.m.SwipeCommonScroll 에서 사용하는 모든 객체를 release 시킨다.
      @method destroy
  **/
    destroy: function() {
        jindo.m.Flick.prototype.destroy.apply(this);
    }
}).extend(jindo.m.Flick);