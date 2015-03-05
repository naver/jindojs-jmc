/**
 @fileOverview 여러개의 콘텐츠 영역을 사용자 터치의 움직임을 통해 좌/우, 상/하 로 슬라이드하여 보여주는 컴포넌트
 @author sculove
 @version #__VERSION__#
 @since 2013. 4. 27.
 */
/**
 여러개의 콘텐츠 영역을 사용자 터치의 움직임을 통해 좌/우, 상/하 로 슬라이드하여 보여주는 컴포넌트

 @class jindo.m.PreviewFlicking
 @extends jindo.m.Flick
 @uses jindo.m.Slide
 @keyword flicking, 플리킹
 @group Component

 @history 1.15.0 Update contents 넓이 옵션 적용
 @history 1.13.0 Support Firefox 브라우저 지원
 @history 1.13.0 Update setTotalContents 추가 (동적으로 전체 컨텐츠값을 변경할수 있다)
 @history 1.13.0 Update 기본 옵션 패널 개수 변경 3에서 5로 변경
 @history 1.12.0 Bug 비순환 플리킹에서 리사이즈 시 오동작 수정
 @history 1.11.0 Bug 순환 플리킹에서 컨텐츠 개수가 5개 초과 10개 미만일 경우 오동작 수정
 @history 1.11.0 Bug 플리킹의 베이스 엘리먼트에 사이즈를 지정하지 않았을 경우, 화면에 나타나지 않는 문제 수정
 @history 1.10.0 New beforeTouchXXXXX 계열 이벤트 추가
 @history 1.10.0 New touchStart 이벤트 추가
 @history 1.10.0 New resize, getPanels, getTotalPanels 메소드 추가
 @history 1.10.0 Deprecated beforeMove, move 이벤트 제거
 @history 1.10.0 Update jindo.m.Morph 기반으로 변경
 @history 1.8.0 Release 최초 릴리즈
 **/
jindo.m.PreviewFlicking = jindo.$Class({
    /* @lends jindo.m.PreviewFlicking.prototype */
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
                @param {Number} [htOption.nTotalContents=5] 전체 플리킹할 콘텐츠의 개수.<br/>순환플리킹일 경우, 패널의 개수보다 많이 지정하여 flicking 사용자 이벤트를 이용하여 동적으로 컨텐츠를 구성할 수 있다.
          @param {Number} [htOption.nFlickThreshold=40] 콘텐츠가 바뀌기 위한 최소한의 터치 드래그한 거리 (pixel)
          @param {Number} [htOption.nDuration=100] 슬라이드 애니메이션 지속 시간
          @param {Number} [htOption.nBounceDuration=100] nFlickThreshold 이하로 움직여서 다시 제자리로 돌아갈때 애니메이션 시간
          @param {Function} [htOption.fpPanelEffect=jindo.m.Effect.easeIn] 패널 간의 이동 애니메이션에 사용되는 jindo.m.Effect 의 함수들
          @param {Number} [htOption.nDefaultIndex=0] 초기 로드시의 화면에 보이는 콘텐츠의 인덱스
          @param {Boolean} [htOption.bUseMomentum=false] 가속을 통한 모멘텀 사용여부
          @param {Number} [htOption.nDeceleration=0.001] 가속도의 감속계수. 이 값이 클수록, 가속도는 감소한다
          @param {Number} [htOption.nWidthPer=50] 한 화면상 가운데 보이는 컨텐츠의 넓이(비율) 값.
     **/
    $init : function(el, htUserOption) {
        // console.log("--Panel init");
        this.option({
            nTotalContents : 5,
            nWidthPer : 50
        });
        this.option(htUserOption || {});

        this._initVar();
        this._setWrapperElement(el);
        if (this.option("bActivateOnload")) {
            this.activate();
        }
    },

    _initVar : function() {
        jindo.m.Flick.prototype._initVar.apply(this);
        this._nDefaultPanel = 5;
    },

    _onActivate : function() {
        jindo.m.Flick.prototype._onActivate.apply(this);

        var self = this;
        this.set(new jindo.m.Slide(this._getAnimationOption()).attach({
            "set" : function(we) {
                self._setStyle(we.css);
            }
        }), this._htWElement["container"]);
    },

    // 엘리먼트 구조 설정하기
    _setStyle : function(htCss) {
        var htContCss = {}, nPos = 0, nSizeKey = this._bUseH ? "width" : "height", nPosKey = this._bUseH ? "left" : "top";

        for (var i in htCss) {
            htContCss[i] = htCss[i];
        }

        htContCss["position"] = "relative";
        if (this._bUseCircular) {
            htCss["position"] = "absolute";
        }
        if (this._bUseH) {
            htContCss["clear"] = "both";
            htCss["float"] = "left";

            this._htWElement["base"].css("margin", "0 auto");

        } else {
            var nHeight = this._htWElement["view"].height();
            var nHalfMargin = (nHeight - this._htWElement.aPanel[0].height()) / 2;
            this._htWElement["base"].css("marginTop", nHalfMargin + "px");
        }

        if (this.option("nMinWidth")) {
            var sKey = nSizeKey.charAt(0).toUpperCase() + nSizeKey.substr(1);
            this._htWElement["base"].css("min" + sKey, this.option("nMinWidth").replace(/\D/gi, "") + "px");
        }

        this._htWElement["base"].css({
            "position" : "relative"
        });
        this._htWElement["base"].css(nSizeKey, this.option("nWidthPer") + "%");
        this._htWElement["container"].css(htContCss);

        var self = this;
        jindo.$A(this._htWElement.aPanel).forEach(function(value, index, array) {
            var wel = value;
            if (self._bUseCircular) {
                wel.css('position', 'absolute');
            }
            if (!this._bUseH) {
                htCss["width"] = "100%";
            } else {
                htCss[nSizeKey] = (100 / self._htWElement.aPanel.length) + "%";
            }
            wel.css(htCss);
        }, this);

    },

    /**
     * override
     */
    _setWrapperElement : function(el) {
        jindo.m.SwipeCommon.prototype._setWrapperElement.call(this, el);

        var sSizeKey = this.option("bHorizontal") ? "height" : "width";
        // this._htWElement["container"].css(sSizeKey, "100%");
        this._htWElement["aPanel"] = this._htWElement["container"].queryAll("." + this.option("sClassPrefix") + this.option('sContentClass'));
        for ( var i  in this._htWElement["aPanel"]){
            this._htWElement["aPanel"][i] = jindo.$Element(this._htWElement["aPanel"][i]);
        }
        // PreviewFlickig 에서는 left, top  속성이 있으면 안되기 때문에. 제거.
        this._htWElement["container"].css({
            "left" : "",
            "top" : ""
        });

    },

    resize : function() {
        jindo.m.SwipeCommon.prototype.resize.call(this);
        this._restorePanel();

        var nSizeKey = this._bUseH ? "width" : "height", nViewSize = this._htWElement["view"][nSizeKey]();
        this._htWElement["container"].css(nSizeKey, this._htWElement.aPanel.length * 100 + "%");

        // 패널의 크기를 재지정 - PreviewFlicking  에서는 패널 사이즈가 전체 패널의 절반 크기.
        this._nRange = (this._bUseH ? this._htWElement.aPanel[0].width() : this._htWElement.aPanel[0].height());
        // this._nRange = (this._bUseH ? this._htWElement["view"].width() : this._htWElement["view"].height());

        this._refreshPanelInfo();

        if (this._bUseH) {
            this._htSize.maxX = (this.option("nTotalContents") - 1) * -this._nRange;
            this._nX = this._aPos[this.getContentIndex()];
        } else {
            this._htSize.maxY = (this.option("nTotalContents") - 1) * -this._nRange;
            this._nY = this._aPos[this.getContentIndex()];
        }

        this._updateFlickInfo();
        if (!this._bUseCircular) {
            this._oAnimation.move(this._nX, this._nY);
        }

    },

    // 5개의 판을 wel중심으로 맞춘다.
    // wel이 없을 경우, 현재 엘리먼트기준으로 맞춘다.
    _restorePanel : function(wel) {
        wel = wel || this.getElement();
        var nLen = this.getTotalPanels(),
            // n = this.getContentIndex(),
            sPosition = this._bUseH ? "left" : "top",
            // nCenter = n % this._nTotalContents;
            nCenter = this._getIndexByElement(wel);

        // container는 항상 고정!
        this._htWElement["container"].css(this._oAnimation.p("Transform"), this._getTranslate(0));

        var nSum = 0;
        var nCompare = Math.floor(nLen / 2);

        for (var i = 0; i < nLen; i++) {
            nSum = i - nCenter;
            if(this._bUseCircular){
                if (nSum > nCompare) {
                    nSum = nSum - nLen;
                } else if (nSum < -nCompare) {
                    nSum = nSum + nLen;
                }
            }
            this._htWElement.aPanel[i].css(sPosition, (nSum * 20 ) + "%");
            if (nSum == 0) {
                this._htWElement.aPanel[i].css("zIndex", 10);
            } else {
                this._htWElement.aPanel[i].css("zIndex", 1);
            }
        }

    },

    _getPosValue : function(sV) {
        return this._hasOffsetBug() ? sV : this._getTranslate(sV);
    },

    /**
     * 페이지 종료 시점
     * @param  {[type]} option [description]
     * @return {[type]}    [description]
     */
    _panelEndAfterCall : function(option) {
        if (this._bUseCircular) {
            this._restorePanel();
        }
    },

    _moveAfterCall : function(we) {
        this._oAnimation.move(this._nX, this._nY, 0, this._makeOption({
            next : we.bNext,
            startIndex : this._nPosToIndex
        }));
    },
    /**
     * 엘리먼트를 기준으로 하는 index 정보 리턴
     * @param {Element} el 조회하고자 하는 element
     * @return {Number} nValue Index 정보
     */
    getIndexByElement : function(el){
        var nValue = -1;
        for(var i=0, nLen = this._htWElement.aPanel.length; i<nLen; i++){
            if(this._htWElement.aPanel[i].$value() === el){
                nValue = i;
                break;
            }
        }
        return nValue;
    },
    /**
     jindo.m.SwipeCommonScroll 에서 사용하는 모든 객체를 release 시킨다.
     @method destroy
     **/
    destroy : function() {
        jindo.m.Flick.prototype.destroy.apply(this);
    }
}).extend(jindo.m.Flick);