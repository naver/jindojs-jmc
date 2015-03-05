/**
    @fileOverview 스크롤이 발생하더라도 화면의 특정위치에 레이어가 띄워져 있는 컴포넌트
    @author sculove
    @version #__VERSION__#
    @since 2011. 7. 19.
**/
/**
    스크롤이 발생하더라도 화면의 특정위치에 레이어가 띄워져 있는 컴포넌트

    @class jindo.m.FloatingLayer
    @extends jindo.m.UIComponent
    @uses jindo.m.LayerPosition
    @uses jindo.m.ScrollEnd
    @uses jindo.m.LayerEffect, jindo.m.SlideEffect, jindo.m.FadeEffect {0,}
    @keyword floating, layer, fixed, 플로팅, 레이어, 고정
    @group Component

    @history 1.17.1 Bug 컴포넌트가 deactivate될 때, 'View' 엘리먼트가 제거 되는 문제 수정.
    @history 1.17.1 Bug 예외처리 추가
    @history 1.14.0 Update 고정 class random 값으로 처리
    @history 1.8.0 Scroll 컴포넌트와 z-index 충돌로 Scroll component z-index 값(2000) 보다 상향 조정(2050)
    @history 1.6.0 Bug iOS에서 정상동작하지 않는 오류 수정
    @history 1.5.0 Support Window Phone8 지원
    @history 1.4.0 Support iOS 6 지원
    @history 1.4.0 Bug FloatingLayer의 Width/Height가 %로 지정된 경우에도 처리되도록 수정
    @history 1.3.5 Support 갤럭시 4.0.4 업데이트 지원
    @history 1.3.5 Bug hide호출 후, show되지 않는 버그 수정
    @history 1.3.0 Update [bUseHideUI] Option 추가<br />
                        [bUseFixed] Option 추가<br />
                        [nFadeOutDuration] 기본값 0에서 200으로 변경
    @history 1.3.0 Bug 갤럭시s2,s 안정화 작업 (다중 fade-in 발생시 발생안되도록 수정 (깜빡임방지))<br />
                        플로팅 레이어 사라진 이후, 사라진 영역에서 이벤트가 발생하지 않는 현상 수정
    @history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
    @history 1.2.0 Bug ios4이하 버전의 네이버앱에서 사라지는 문제 해결
    @history 1.2.0 Update position:fixed가 가능한 모바일 기기(iOS5, Android3.0~)에서는 Layer이동시, 사라지지 않고 항상 고정되어 플로팅되도록 UI 변경
    @history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
    @history 1.1.0 Bug iOS3에서 Layer선택 후 이동시 사라지는 문제 해결<br />
                        iOS3에서 이동 후 깜빡이는 문제 개선
    @history 1.1.0 Update 내부 하이라이팅 제거
    @history 1.1.0 Bug Android에서 시스템 스크롤 가속시 가속효과가 발생하지 않거나, 레이어가 보이면서 위치를 잡아가는 문제 해결
    @history 0.9.5 Bug Form엘리먼트 위로 FloatingLayer가 뜰 경우, form이 보이는 문제 해결<br />
                        주소창 보이거나 감춰질때, 포지션 오류 문제 해결
    @history 0.9.5 Update [nFadeInDuration] Option 기본값 수정 (200 → 0)<br />
                        [nFadeOutDuration] Option 기본값 수정 (200 → 0)<br />
                        [bAutoResize] Option 삭제<br />
    @history 0.9.0 Release 최초 릴리즈
**/
jindo.m.FloatingLayer = jindo.$Class({
   /* @lends jindo.m.FloatingLayer.prototype */
    /**
        초기화 함수

        @constructor
        @param {HTMLElement} el 대상 엘리먼트 (필수)
        @param {Object} [htOption] 초기화 옵션 객체
            @param {Boolean} [htOption.bActivateOnload=true]
            @param {String} [htOption.sPosition="bottom"] <auidoc:see content="jindo.m.FloatingLayer">FloatingLayer</auidoc:see>가 화면에 보여질때의 위치 옵셥. top일 경우, 상단 중앙에 위치하고 , center일 경우 화면 중앙, bottom일 경우 화면 하단 중앙에 위치한다.
            @param {String} [htOption.sDirection="up"] <auidoc:see content="jindo.m.FloatingLayer">FloatingLayer</auidoc:see> 컴포넌트가 화면에 보여질때의 slide되는 위치 옵셥. up,down, left, right가 있다.
            @param {Number} [htOption.nSlideDuration=500] <auidoc:see content="jindo.m.FloatingLayer">FloatingLayer</auidoc:see>가 화면에 완전히 보여지는 시간 (단위 ms)
            @param {String} [htOption.sSlideTimingFunction="ease-in-out"] Slide시 애니메이션 효과
            <ul>
            <li>ease : 속도가 급가속되다가 급감속되는 효과 (거의 끝에서 급감속됨)</li>
            <li>linear : 등속효과</li>
            <li>ease-in : 속도가 점점 빨라지는 가속 효과</li>
            <li>ease-out : 속도가 천천히 줄어드는 감속효과</li>
            <li>ease-in-out : 속도가 천천히 가속되다가 천천히 감속되는 효과 (가속과 감속이 부드럽게 전환됨)</li>
            </ul>
            @param {Number} [htOption.nFadeInDuration=0] <auidoc:see content="jindo.m.FloatingLayer">FloatingLayer</auidoc:see>가 스크롤될때 사라졌다 fadein되는 시간 (단위 ms)<br />bUseFixed 옵션이 true이고, position:fixed 속성이 사용가능한 기기에서는 옵션 사용 불가
            @param {String} [htOption.sFadeInTimingFunction="ease-in-out"] Fade in시 애니메이션 효과
            <ul>
            <li>ease : 속도가 급가속되다가 급감속되는 효과 (거의 끝에서 급감속됨)</li>
            <li>linear : 등속효과</li>
            <li>ease-in : 속도가 점점 빨라지는 가속 효과</li>
            <li>ease-out : 속도가 천천히 줄어드는 감속효과</li>
            <li>ease-in-out : 속도가 천천히 가속되다가 천천히 감속되는 효과 (가속과 감속이 부드럽게 전환됨)</li>
            </ul>
            bUseFixed 옵션이 true이고, position:fixed 속성이 사용가능한 기기에서는 옵션 사용 불가
            @param {Number} [htOption.nFadeOutDuration=200] <auidoc:see content="jindo.m.FloatingLayer">FloatingLayer</auidoc:see>가 hide될 때 fadeout되는 시간 (단위 ms)
            bUseFixed 옵션이 true이고, position:fixed 속성이 사용가능한 기기에서는 옵션 사용 불가
            @param {String} [htOption.sFadeOutTimingFunction="ease-in-out"] Fade out시 애니메이션 효과
            <ul>
            <li>ease : 속도가 급가속되다가 급감속되는 효과 (거의 끝에서 급감속됨)</li>
            <li>linear : 등속효과</li>
            <li>ease-in : 속도가 점점 빨라지는 가속 효과</li>
            <li>ease-out : 속도가 천천히 줄어드는 감속효과</li>
            <li>ease-in-out : 속도가 천천히 가속되다가 천천히 감속되는 효과 (가속과 감속이 부드럽게 전환됨)</li>
            </ul>
            bUseFixed 옵션이 true이고, position:fixed 속성이 사용가능한 기기에서는 옵션 사용 불가
            @param {Boolean} [htOption.bUseHideUI=true] FloatingLayer 스크롤시 사라지는 UI 사용 여부를 결정한다.<br />bUseFixed 옵션이 true이고, position:fixed 속성이 사용가능한 기기에서는 옵션 사용 불가
            @param {Boolean} [htOption.bUseFixed=false] position:fixed 속성이 사용 가능한 기기에서는 FloatingLayer 를 position:fixed로 구성한다.
            @param {String} [htOption.nTimeout=-1] <auidoc:see content="jindo.m.FloatingLayer">FloatingLayer</auidoc:see>가 nTimeout시간 이후 사라지는 시간 (단위 ms), -1로 설정될 경우, 자동 숨기는 기능은 제공하지 않는다
    **/
    $init : function(el,htUserOption) {
        this.option({
             bActivateOnload : true,
             sPosition : "bottom",
             sDirection : "up",
             nSlideDuration : 500,
             sSlideTimingFunction : "ease-in-out",
             nFadeInDuration : 0,
             sFadeInTimingFunction : "ease-in-out",
             nFadeOutDuration : 200,
             sFadeOutTimingFunction : "ease-in-out",
             bUseHideUI : true,
             bUseFixed : false,
             nTimeout : -1
        });
        this.option(htUserOption || {});
        this._initVar();
        this._setWrapperElement(el);
        this._initComponent();
        if(this.option("bActivateOnload")) {
            this.activate();
        }
    },

    /**
        jindo.m.FloatingLayer 에서 사용하는 모든 인스턴스 변수를 초기화한다.
    **/
    _initVar: function() {
        this._oFloatingEffect = null;
        this._oFadeinEffect = null;
        this._oLayerPosition = null;
        this._oScrollEnd = null;
        this._nTimeoutTimer = -1;
        this._isFixed = false;
        this._isLayerOn = false;
        this._isMoving = false; // 이동 여부
    },

    /**
        jindo.m.FloatingLayer 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
    **/
    _setWrapperElement: function(el) {
        this._htWElement = {};
        this._htWElement["element"] = jindo.$Element(el);
        this._htWElement["viewElement"] = jindo.$Element(this._createView());
    },

    /**
        사용하는 컴포넌트를 초기화한다.
    **/
    _initComponent : function() {
        var self = this,
            el = this._htWElement["element"].$value();
        // Layer Position 지정
        this._oLayerPosition = new jindo.m.LayerPosition(this._htWElement["viewElement"], {
            sPosition : this.option("sPosition"),
            bActivateOnload : false,
            bUseFixed : this.option("bUseFixed"),
            bAutoReposition : true
        });
        // LayerEffect (Slide(show), FadeOut(hide) 지정)
        this._oFloatingEffect = new jindo.m.LayerEffect(el);
        if(this.option("bUseHideUI") && this.option("nFadeInDuration") !== 0) {
            this._oFadeinEffect = new jindo.m.LayerEffect(this._htWElement["viewElement"].$value(), {
                nDuration: this.option("nFadeInDuration")
            }).attach("afterEffect",function() {
                // self._htWElement["viewElement"].show();
                self._startHideTimer();
            });
        }
        // Fixed 지정
        this._isFixed = this._oLayerPosition.isUseFixed();
        // ScrollEnd 지정
        this._oScrollEnd = new jindo.m.ScrollEnd();
    },

    /**
        Layer 를 반환한다.
        @method getLayer
        @return {HTMLElement} 컴포넌트에서 참조하고 있는 Layer
    **/
    getLayer : function() {
        return this._htWElement["element"].$value();
    },

    /**
        el의 width와 height가 동일한 div을 만듦
        @return {jindo.$Element} welView
    **/
    _createView : function () {
        var bVisible = this._htWElement["element"].visible(),
            nRandom = "_" + Math.floor(Math.random() * 10000),
            welView = jindo.$Element("<div class='_floatingLayer_view_divtag"+nRandom+"' style='display:none;'>"),
            sWidth = "", sHeight = "";
        // el의 width와 height 얻기
        if (!bVisible) {
            this._htWElement["element"].css({
                left : "-9999px"
            }).show();
        }
        sWidth = this._htWElement["element"].css("width").indexOf("%") != -1 ? this._htWElement["element"].css("width") : this._htWElement["element"].width() + "px";
        sHeight = this._htWElement["element"].css("height").indexOf("%") != -1 ? this._htWElement["element"].css("height") : this._htWElement["element"].height() + "px";
        welView.css({
            width : sWidth,
            height : sHeight,
            zIndex : 2050       // Scroll 컴포넌트의 z-index 보다 높게 처리
        });
        if (!bVisible) {
            this._htWElement["element"].hide();
        }
        return welView;
    },

    /**
        View의 크기를 갱신한다.

        @method resize
        @history 0.9.5 Update Method 추가

    **/
    resize : function(nWidth, nHeight) {
        if(!this.isActivating()) {
            console.warn("you need to activate this component.");
            return;
        }
        this._htWElement["viewElement"].css({
            width : nWidth + "px",
            height : nHeight + "px"
        });
        this._oLayerPosition.setPosition();
    },

    /**
        FloatingLayer를 보임
        @method show
    **/
    show : function() {
        if(!this.isActivating()) {
            console.warn("you need to activate this component.");
            return;
        }
        /**
            레이어가 보여기지 전에 발생

            @event beforeShow
            @param {String} sType 커스텀 이벤트명
            @param {jindo.$Element} welLayer Layer
            @param {Function} stop show를 중지한다. beforeShow이후 커스텀 이벤트(show)가 발생하지 않는다.
        **/
        if (this._fireEvent("beforeShow")) {
            // 1. LayerPosition activate
            if(!this._oLayerPosition.isActivating()) {
                this._oLayerPosition.activate();
            }
            // 2. FloatingEffect 이벤트 show로 설정
            this._setFloatingEffect(true);
            // 3. Slide
            this._htWElement["element"].show();
            this._htWElement["viewElement"].show();
            this._oFloatingEffect.slide({
                sDirection: this.option("sDirection"),
                nDuration: this.option("nSlideDuration"),
                sTransitionTimingFunction : this.option("sSlideTimingFunction"),
                elBaseLayer: this._htWElement["viewElement"].$value()
            });
        }
    },

    /**
        FloatingLayer를 숨김
        @method hide
    **/
    hide : function() {
        if(!this.isActivating()) {
            console.warn("you need to activate this component.");
            return;
        }
        /**
            레이어가 사라지기 전에 발생

            @event beforeHide
            @param {String} sType 커스텀 이벤트명
            @param {jindo.$Element} welLayer Layer
            @param {Function} stop Hide를 중지한다. beforeHide이후 커스텀 이벤트(hide)가 발생하지 않는다.
        **/
        if (this._fireEvent("beforeHide")) {
            // 0. hide Timer 제거
            this._stopHideTimer();
            // 1. LayerPosition deactivate
            if(this._oLayerPosition.isActivating()) {
                this._oLayerPosition.deactivate();
            }
            // 2. Floating관련 이벤트 detach
            this._detachFloatingEvent();
            // 3. FloatingEffect 이벤트 hide로 설정
            this._setFloatingEffect(false);
            // 4. Fade out
            if(this.option("nFadeOutDuration") !== 0) {
                this._oFloatingEffect.fade({
                    sDirection: "out",
                    nDuration: this.option("nFadeOutDuration"),
                    sTransitionTimingFunction : this.option("sFadeOutTimingFunction")
                });
            } else {
                this._htWElement["viewElement"].hide();
                this._fireEvent("hide");
            }
        }
    },

    /**
        사용자 이벤트 호출
    **/
    _fireEvent : function(sType) {
        return this.fireEvent(sType, {
            welLayer : this._htWElement["element"]
        });
    },

    /**
        nTimeout속성이 -1보다 클경우 타이머 지정
        타이머 이후 사라짐.
    **/
    _startHideTimer : function() {
        if (this.option("nTimeout") > -1) {
            var self = this;
            this._stopHideTimer();
            this._nTimeoutTimer = setTimeout(function(){
                self.hide();
            }, this.option("nTimeout"));
        }
    },

    /**
        nTimeout의 타이머 중지
    **/
    _stopHideTimer : function() {
        clearTimeout(this._nTimeoutTimer);
        this._nTimeoutTimer = -1;
    },

    /**
        touch가 시작될 경우 (ios,안드로이드 일 경우 touchstart)
        @param {jindo.$Event} we
    **/
    _onTouchStart : function(we) {
        this._initFloatingData();
        if (this._isLayer(we.element)) {
            this._isLayerOn = true;
            this._htWElement["viewElement"].show();
        } else {
            // 상위 레이어에서 부터 시작안함
            this._htWElement["viewElement"].hide();
            /* 갤럭시 S3인 경우 hide된 후 reflow가 발생하지 않으면 스크롤바가 사라지지 않는다. */
            this._htWElement["viewElement"].css("left", this._htWElement["viewElement"].css("left") + "px");
        }
    },

    /**
        scrollEnd일 경우 처리
        ios는 touchEnd 시점이  scrollEnd
        @param {jindo.$Event} we
    **/
    _onScrollEnd : function(we) {
        if(this.option("bUseHideUI")) {
            if(this._isFixed) {
                this._startHideTimer();
            } else {
                this._runFadeIn();
            }
        } else {
            this._oLayerPosition.setPosition();
            this._startHideTimer();
        }
    },

    /**
        touchmove시
        @param {jindo.$Event} we
    **/
    _onTouchMove : function(we) {
        // this._clearFixedBug();
        this._isMoving = true;
    },

    /**
        포지션 변경없이 터치가 될경우
        @param {jindo.$Event} we
    **/
    _onTouchEnd : function(we) {
        if(this._isLayerOn) {
            this._oLayerPosition.setPosition();
            return;
        } else if (!this._isMoving) {
            this._runFadeIn();
        }
    },

    /**
        fadein 실행하는 함수
    **/
    _runFadeIn : function() {
        if(!this._htWElement["viewElement"].visible()) {
            if (this._isLayerOn) {
                this._startHideTimer();
            } else {
                this._fadeIn();
            }
        }
    },

    /**
        포지션 지정 완료 후 fade-in
    **/
    _fadeIn : function() {
        this._oLayerPosition.setPosition();
        if(this._oFadeinEffect) {
            // 중복 fade-in 문제 제거 (fade-in 하기전에 모든 큐 내용 제거)
            this._oFadeinEffect.clearEffect(true);
            this._oFadeinEffect.fade({
                sDirection: "in",
                sTransitionTimingFunction : this.option("sFadeInTimingFunction")
            });
        } else {
            this._htWElement["viewElement"].show();
            this._startHideTimer();
        }
    },

    /**
        Layer인지 아닌지 확인 (Layer는 하위 자식도 포함)
        @param {Object} el
    **/
    _isLayer : function(el) {
        if(el && (this._htWElement["element"].isEqual(el) || this._htWElement["viewElement"].isEqual(el) || this._htWElement["viewElement"].isParentOf(el)) ) {
            return true;
        } else {
            return false;
        }
    },

    /**
        Floating 제어 처음일 경우
    **/
    _initFloatingData : function() {
        // Timer 모두 중지
        this._stopHideTimer();

        // Effect 중지
        if(this._oFloatingEffect && this.option("nFadeOutDuration") !== 0) {
            this._oFloatingEffect.clearEffect(true);
        }
        if(this._oFadeinEffect){
            this._oFadeinEffect.clearEffect(true);
        }
        // 속성값 중지
        this._isMoving = false;
        this._isLayerOn = false;
    },

    /**
        jindo.m.FloatingLayer 컴포넌트를 활성화한다.
        activate 실행시 호출됨
    **/
    _onActivate : function() {
        // this._initComponent();
        if(this._htWElement["viewElement"].visible())
        {
            this._oLayerPosition.activate();
        }
    },

    /**
        jindo.m.FloatingLayer 컴포넌트를 비활성화한다.
        deactivate 실행시 호출됨
    **/
    _onDeactivate : function() {
        this._detachEvent();
    },

    /**
        Floating관련 이벤트를 바인드한다.
    **/
    _attachFloatingEvent : function() {
        this._htEvent = {};
        if(this.option("bUseHideUI") && !this._isFixed) {
            var htEventName = jindo.m._getTouchEventName();
            this._htEvent[htEventName.start] = {
                el : document.body,
                fn : jindo.$Fn(this._onTouchStart, this).bind()
                //ref : jindo.$Fn(this._onTouchStart, this).attach(document.body, "touchstart")
            };
            this._htEvent[htEventName.move] = {
                el : document.body,
                fn : jindo.$Fn(this._onTouchMove, this).bind()
                //ref : jindo.$Fn(this._onTouchMove, this).attach(document.body, "touchmove")
            };
            this._htEvent[htEventName.end] = {
                el : document.body,
                fn: jindo.$Fn(this._onTouchEnd, this).bind()
                //ref : jindo.$Fn(this._onTouchEnd, this).attach(document.body, "touchend")
            };
            if(htEventName.cancel){
                this._htEvent[htEventName.cancel] = {
                    el : document.body,
                    fn :  jindo.$Fn(this._onTouchEnd, this).bind()
                    //ref : jindo.$Fn(this._onTouchEnd, this).attach(document.body, "touchcancel")
                };
            }

            //attach events
            for(var p in this._htEvent){
                if(this._htEvent[p].fn){
                    this._htEvent[p].ref  = jindo.m._attachFakeJindo(this._htEvent[p].el, this._htEvent[p].fn, p);
                }
            }
        }
        this._oScrollEnd.attach("scrollEnd", jindo.$Fn(this._onScrollEnd,this).bind());
    },

    /**
        jindo.m.FloatingLayer 에서 사용하는 모든 이벤트를 해제한다.
    **/
    _detachEvent : function() {
        this._oLayerPosition.deactivate();
        this._detachFloatingEvent();
    },

    /**
        FloatingEffect 처리 후 타입 show,hide 지정
        @param {Boolean} type
    **/
    _setFloatingEffect : function(isShow) {
        var self=this;
        this._oFloatingEffect.detachAll("afterEffect");
        this._oFloatingEffect.clearEffect(true);
        if(this._oFadeinEffect){
            this._oFadeinEffect.clearEffect(true);
        }
        if(isShow) {
            // show할때 이벤트 등록
            this._oFloatingEffect.attach("afterEffect", function(){
                // Floating관련 이벤트 attach
                self._attachFloatingEvent();
                self._startHideTimer();
                /**
                    레이어가 보여진 후에 발생

                    @event show
                    @param {String} sType 커스텀 이벤트명
                    @param {jindo.$Element} welLayer Layer
                    @param {Function} stop stop를 호출하여 영향 받는 것이 없음
                **/
                self._fireEvent("show");
            });
        } else {
            if(this.option("nFadeOutDuration") !== 0) {
                this._oFloatingEffect.attach("afterEffect", function() {
                    self._htWElement["viewElement"].hide();
                    /**
                        레이어가 사라진 후에 발생

                        @event hide
                        @param {String} sType 커스텀 이벤트명
                        @param {jindo.$Element} welLayer Layer
                        @param {Function} stop stop를 호출하여 영향 받는 것이 없음
                    **/
                    self._fireEvent("hide");
                });
            }
        }
    },

    /**
        Floating관련 이벤트를 해제한다.
    **/
    _detachFloatingEvent : function() {
        for(var p in this._htEvent) {
            var ht = this._htEvent[p];
            if (ht.ref) {
                ht.ref.detach(ht.el, p);
            }
        }
        this._oScrollEnd.detachAll("scrollEnd");
        this._htEvent = null;
    },

    /**
        jindo.m.FloatingLayer 에서 사용하는 모든 객체를 release 시킨다.
        @method destroy
    **/
    destroy: function() {
        this.deactivate();
        this._htWElement["element"].appendTo(document.body);
        this._htWElement["viewElement"].leave();
        for(var p in this._htWElement) {
            this._htWElement[p] = null;
        }
        delete this._htWElement;
        this._initFloatingData();

        if(this._oFadeinEffect) {
            this._oFadeinEffect.detachAll("afterEffect");
            this._oFadeinEffect.destroy();
        }
        this._oFloatingEffect.destroy();
        this._oScrollEnd.destroy();
        this._oLayerPosition.destroy();
    }
}).extend(jindo.m.UIComponent);