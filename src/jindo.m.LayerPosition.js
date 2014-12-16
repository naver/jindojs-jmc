/**
    @fileOverview 레이어를 화면의 특정 영역에 위치시킬 수 있는 컴포넌트
    @author sculove
    @version #__VERSION__#
    @since 2011. 6. 30.
**/
/**
    레이어를 화면의 특정 영역에 위치시킬 수 있는 컴포넌트

    @class jindo.m.LayerPosition
    @extends jindo.m.UIComponent
    @keyword layer, position, 레이어, 위치
    @group Component

    @history 1.11.0 Update 기준이 되는 element 추가 
    @history 1.10.0 Bug 인스턴스 여러개 사용시 인스턴스의 값이 공유되는 문제 수정
    @history 1.5.0 Bug iOS6에서 가로,세로 회전시 레이어 위치 못잡는 버그 수정
    @history 1.5.0 Support Window Phone8 지원
    @history 1.3.5 Update [bUseFixed] Option 기본값 수정 (false → true)
    @history 1.3.0 Update [bUseFixed] Option 추가
    @history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
    @history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
    @history 1.1.0 Update Android 3.0/4.0, iOS5일 경우 position: fixed 적용
    @history 0.9.5 Bug iOS에서 모바일기기 회전시(가로에서 세로로) HTML 깨지는 문제 해결
    @history 0.9.5 Bug 뒤로가기 버튼 눌렀을 때 오류 문제 해결
    @history 0.9.0 Release 최초 릴리즈
**/
jindo.m.LayerPosition = jindo.$Class({
    /* @lends jindo.m.LayerPosition.prototype */
    /**
        초기화 함수

        @constructor
        @param {Varient} el 대상 엘리먼트 (필수)
        @param {Object} [htOption] 초기화 옵션 객체
            @param {Boolean} [htOption.bActivateOnload=true] <auidoc:see content="jindo.m.FloatingLayer">FloatingLayer</auidoc:see> 컴포넌트가 로딩 될때 활성화 시킬지 여부를 결정한다.<br /> false로 설정하는 경우에는 LayerPosition.activate()를 호출하여 따로 활성화 시켜야 한다.
            @param {Boolean} [htOption.bAutoReposition=true] 화면 이동시, 또는 스크롤 이동시 LayerPosition이 자동으로 적용될지 여부를 결정한다
            @param {String} [htOption.sPosition="center"] LayerPosition의 영역을 지정한다. top, center, bottom, all의 총4개 영역이 있다.
            @param {Number} [htOption.nLeftMargin=0] LayerPosition의 nLeft마진을 지정한다
            @param {Number} [htOption.nRightMargin=0] LayerPosition의 nRight마진을 지정한다
            @param {Number} [htOption.nTopMargin=0] LayerPosition의 nTop마진을 지정한다
            @param {Number} [htOption.nBottomMargin=0] LayerPosition의 nBottom마진을 지정한다
            @param {Boolean} [htOption.bUseFixed=true] position:fixed 사용 여부를 설정한다. (단말기에서 position:fixed를 지원하지 않을 경우 옵션값은 무시된다)

        @example
            var oLpBottom = new jindo.m.LayerPosition("document.body", "layer_bottom", {
                 bActivateOnload : true,
                 bAutoReposition : true,
                 sPosition : "center",
                 nLeftMargin : 0,
                 nRightMargin : 0,
                 nTopMargin : 0,
                 nBottomMargin : 0
            }).attach({
                "beforePosition" :  function(we) {
                 },
                "position" :  function(we) {
                 }
            });
    **/
    $init : function(el, elLayer,htUserOption) {

        // 기준이 되는 element 추가 적용하지 않았을때 대응(1.10.0 버전 하위 컴포넌트 호환)
        if(arguments.length < 3 && ( !elLayer || (elLayer && (!elLayer.nodeType && typeof elLayer != "string" ))) ){
            this._setBaseLayer(document.body);
            htUserOption = elLayer || {};
            elLayer = el;
        }else{
            this._setBaseLayer(el);
        }
        this.option({
             bActivateOnload : true,
             bAutoReposition : true,
             sPosition : "center",
             nLeftMargin : 0,
             nRightMargin : 0,
             nTopMargin : 0,
             nBottomMargin : 0,
             bUseFixed : true
        });
        this.option(htUserOption || {});
        this._initVar();
        this._setWrapperElement(elLayer);
        if(this.option("bActivateOnload")) {
            this.activate();
        }
    },

    /**
        position:fixed 동작여부를 반환한다.

        @method isUseFixed
        @return {Boolean} position:fixed 사용여부
    **/
    isUseFixed : function() {
        return this._bUseFixedProperty;
    },

    /**
        jindo.m.LayerPosition 컴포넌트를 활성화한다.
        activate 실행시 호출됨
    **/
    _onActivate : function() {
        this._isVertical = jindo.m.isVertical();    // 모바일 기기 세로 여부
        if (this.option("bAutoReposition")) {
            this._attachEvent();
        }
        this.setPosition();
    },

    /**
        jindo.m.LayerPosition 컴포넌트를 비활성화한다.
        deactivate 실행시 호출됨
    **/
    _onDeactivate : function() {
        if (this.option("bAutoReposition")) {
            this._detachEvent();
        }
        // this._htWElement["element"].remove(this._elDummyTag);
    },

    /**
        jindo.m.LayerPosition 에서 사용하는 모든 인스턴스 변수를 초기화한다.
    **/
    _initVar: function() {
        var nLeft = this.option("nLeftMargin"),
            nTop = this.option("nTopMargin");
        this._htMargin = {
            nLeft: nLeft,
            nRight: this.option("nRightMargin"),
            nTop: nTop,
            nBottom: this.option("nBottomMargin")
        };
        this._sPosition = this.option("sPosition");
        this._htOldPosition = {
            nTop : null,
            nLeft : null,
            nBottom : null
        };
        this._htPosition = {
            nTop : null,
            nLeft : null,
            nBottom : null
        };
        // native fixed를 사용하는 경우
        // alert(this.option("bUseFixed") + " , " + jindo.m._isUseFixed());
        this._bUseFixedProperty = this.option("bAutoReposition") && (this.option("bUseFixed") && jindo.m._isUseFixed()) ;
        this._isVertical = null;    // 모바일 기기 세로 여부
        this._hasOrientationChange = jindo.m.getDeviceInfo().ipad || jindo.m.getDeviceInfo().iphone || jindo.m.getDeviceInfo().bChrome;
        this._nPreWidth = -1;
    },

    /**
        현재 설정된 sPosition 타입을 반환

        @method getPosition
        @return {String} center, top, bottom, all 중 값을 반환함
        @history 0.9.5 Update getArea() → getPosition()으로 Mehtod명 수정
    **/
    getPosition : function() {
        return this._sPosition;
    },

    /**
        현재 설정된 마진값을 반환

        @method getMargin
        @return {Object} {nTop,nLeft,nBottom,nRight} 반환
    **/
    getMargin : function() {
        return this._htMargin;
    },

    /**
        현재 LayerPosition이 적용된 Layer를 반환한다

        @method getLayer
        @return {HTMLElement} Layer 반환
    **/
    getLayer : function() {
        return this._htWElement["element"].$value();
    },

    /**
        현재 Layer의 위치 정보를 반환한다.

        @method getCurrentPosition
        @return {Object} {nTop, nLeft, nBottom} 형태의 객체 반환
    **/
    getCurrentPosition : function() {
        return this._htPosition;
    },

    /**
        jindo.m.LayerPosition 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
    **/
    _setWrapperElement: function(el) {
        this._htWElement = {};
        this.setLayer(el);
    },
    /**
        보여주고 숨겨줄 레이어 객체를 설정한다.<br />
        @remark
            설정된 엘리먼트는 document.body에 append된다.<br />
            - 지정한 엘리먼트의 position은 absolute로 지정됨<br />
            - bAutoReposition이 true이고, fixed속성이 가능한 경우, position은 fixed로 지정됨

        @method setLayer
        @return {this}
    **/
    setLayer : function(el) {
        this._htWElement["element"] = jindo.$Element(el);
        if(this._bUseFixedProperty) {
            this._htWElement["element"].css("position", "fixed");
        } else {
            this._htWElement["element"].css("position", "absolute");
        }
        if(!this._htWElement["element"].parent().isEqual(document.body)) {
            this._htWElement["element"].appendTo(document.body);
        }
        return this;
    },

    /**
        상단 중앙에 위치

        @method top
        @param {Object} htMargin {nLeft, nTop}의 상대 위치 지정
    **/
    top : function(htMargin) {
        this.setPosition("top", htMargin);
    },

    /**
        하단 중앙에 위치

        @method bottom
        @param {Object} htMargin {nLeft, nBottom}의 상대 위치 지정
    **/
    bottom : function(htMargin) {
        this.setPosition("bottom", htMargin);
    },

    /**
        중앙에 위치

        @method center
        @param {Object} htMargin {nLeft, nTop}의 상대 위치 지정
    **/
    center : function(htMargin) {
        this.setPosition("center", htMargin);
    },

    /**
        전체 화면에 위치

        @method all
        @param {Object} htMargin { nTop, nBottom, nLeft, nRight } 의 내부 공간영역지정
    **/
    all : function(htMargin) {
        this.setPosition("all", htMargin);
    },

    /**
        Layer의 내부 Margin을 가지는 전체크기를 설정하고, 위치정보를 반환한다

        @param {Number} nWidth
        @param {Number} nHeight
        @return {Object} {nTop, nLeft} 형태의 객체 반환
    **/
    _fixedLayerSize : function(nWidth, nHeight) {
        var nLeft = parseInt(this._htMargin.nLeft,10),
            nTop = parseInt(this._htMargin.nTop,10),
            htPadding = {
                "padding-top" : parseInt(this._htWElement["element"].css("padding-top"),10),
                "padding-bottom" : parseInt(this._htWElement["element"].css("padding-bottom"),10),
                "padding-left" : parseInt(this._htWElement["element"].css("padding-left"),10),
                "padding-right" :   parseInt(this._htWElement["element"].css("padding-right"),10)
            }, htBorder = {
                "border-top-width" : parseInt(this._htWElement["element"].css("border-top-width"),10),
                "border-bottom-width" : parseInt(this._htWElement["element"].css("border-bottom-width"),10),
                "border-left-width" : parseInt(this._htWElement["element"].css("border-left-width"),10),
                "border-right-width" : parseInt(this._htWElement["element"].css("border-right-width"),10)
            };
        nWidth -= htPadding["padding-left"] + htPadding["padding-right"] + htBorder["border-left-width"] + htBorder["border-right-width"] + nLeft + parseInt(this._htMargin.nRight,10);
        nHeight -= htPadding["padding-top"] + htPadding["padding-bottom"] + htBorder["border-top-width"] + htBorder["border-bottom-width"] + nTop + parseInt(this._htMargin.nBottom,10);

        // 스크롤여부에 따라 크기 조정
        this._htWElement["element"].css({
            width : nWidth + "px",
            height: nHeight + "px"
        });

        return {
            nTop : nTop,
            nLeft : nLeft
        };
    },

    _setBaseLayer : function(el){
        this._wel = this._el = jindo.$(el);
        if (this._el) {
            this._wel = jindo.$Element(el);
        }
        
        return this;
    },
    getBaseLayer : function(){
        return this._el;
    },
    /**
        Position에 맞는 Layer의 Position (top,left)를 구함
        (단, All인 경우, Layer의 크기도 변함)
    **/
    _getPosition : function() {
        
            var el = this.getBaseLayer(),
            wel = jindo.$Element(el),
            elLayer = this.getLayer(),
            htElementPosition = wel.offset(),
            nWidth = el.offsetWidth,
            nHeight = el.offsetHeight,
            oClientSize,
            nLayerWidth = elLayer.offsetWidth,
            nLayerHeight = elLayer.offsetHeight,
            htPosition = {
                nTop: htElementPosition.top,
                nLeft: htElementPosition.left
            };
            
        if (el == document.body) {
            oClientSize = jindo.$Document().clientSize();
            nWidth = oClientSize.width;
            nHeight = oClientSize.height;
        }
        
            // console.log(nWidth + ", " + nHeight + "... " + document.documentElement.clientWidth + ", " + document.documentElement.clientHeight);
        //Layer에 마진이 있는경우 렌더링 보정.
        nLayerWidth += parseInt(this._htWElement["element"].css('marginLeft'), 10) + parseInt(this._htWElement["element"].css('marginRight'), 10) || 0;
        nLayerHeight += parseInt(this._htWElement["element"].css('marginTop'), 10) + parseInt(this._htWElement["element"].css('marginBottom'), 10) || 0;

        if(this._sPosition === "all") {
            htElementPosition = this._fixedLayerSize(nWidth, nHeight);
        } else {
            htElementPosition.nLeft = htPosition.nLeft+ parseInt((nWidth - nLayerWidth) / 2,10) + parseInt(this._htMargin.nLeft,10);
            switch (this._sPosition) {
                case "top":
                    htElementPosition.nTop = htPosition.nTop + parseInt(this._htMargin.nTop,10);
                    // htElementPosition.nLeft +=  parseInt(this._htMargin.nLeft,10);
                    break;
                case "center":
                    htElementPosition.nTop = htPosition.nTop + parseInt((nHeight - nLayerHeight) / 2,10) + parseInt(this._htMargin.nTop,10);
                    break;
                case "bottom":
                    // if(this._bUseFixedProperty) {
                        // // htElementPosition.nBottom = parseInt((nHeight - nLayerHeight) / 2,10) + parseInt(this._htMargin.nBottom,10);
                    // } else {
                        // console.log(parseInt(this._htMargin.nBottom,10));
                        // htElementPosition.nTop = htPosition.nTop + parseInt(nHeight - nLayerHeight,10) - parseInt(this._htMargin.nBottom,10);
                    // }
                    htElementPosition.nTop = htPosition.nTop + parseInt(nHeight - nLayerHeight,10) - parseInt(this._htMargin.nBottom,10);
                    break;
            }
            if(!this._bUseFixedProperty) {
                htElementPosition = this._adjustScrollPosition(htElementPosition);
            }
        }
        return htElementPosition;
    },

    /**
        스크롤이 있을 경우 Position 수정
        @param {Object} htPosition
    **/
    _adjustScrollPosition : function(htPosition) {
        var htScrollPosition = jindo.$Document().scrollPosition();
            //oClientSize = jindo.$Document().clientSize();
            // nMaxTop = this._nDocumentHeight - oClientSize.height,
            // nMaxLeft = this._nDocumentWidth - oClientSize.width;
        /*
         android 3.1에서 화면바깥 영역으로 바운딩하면 화면영역으로 돌아오는데,
         1.화면바깥 영역으로 스크롤하면 UI상 원래 위치로 돌아오지만, 값(pageX/YOffest , scrollX/Y)은  화면 영역밖의 값인-를 반환한다.
            => 스크롤 영역바깥영역일 경우, 최상단,하단값을 반환하도록 수정
        2.화면의 스크롤 크기를 나타내는 document.scrollWidth/Height, document.Width/Height도 늘어난 화면 영역값을 반환하지만, 화면이 원래 위치로 돌아온 후에는 원래 스크롤 영역이 아닌 늘어난 스크롤 영역을 나타냄
            => 초기 로딩시, 측정된 스크롤 사이즈를 기준으로 계산

        결국. Android 3.x, 4.x 는 position:fixed로 문제해결!
        */
        htPosition.nTop += htScrollPosition.top;
        htPosition.nLeft += htScrollPosition.left;
        return htPosition;
    },

    /**
        포지션을 잡음

        @method setPosition
        @param {String} sPosition : Layer Area종류 "top", "center", "bottom", "all" (옵션)
        @param {Object} htMargin {nTop,nLeft,nBottom,nRight} 객체 (옵션)<br/>
             중앙기준으로 상태좌표 이동 (all인 경우는 내부마진임)<br/>
             top Area인 경우 nTop, nLeft<br/>
             center Area인 경우 nTop, nLeft<br/>
             bottom Area인 경우 nBottom, nLeft<br/>
             all Area인 경우 nTop,nBottom, nLeft, nRight (all인 경우는 내부마진임)<br/>
        @history 0.9.5 Update 비동기식 처리방식에서 동기식으로 변경
    **/
   setPosition : function(sPosition, htMargin) {
        if(!this.isActivating()) {
            return;
        }
        this._htMargin = htMargin || this._htMargin;
        this._sPosition = sPosition || this._sPosition;
        /**
            포지션을 잡기 전에 발생

            @event beforePosition
            @param {String} sType 커스텀 이벤트명
            @param {HTMLElement} elLayer LayerPostion 적용된 Layer
            @param {Object} htMargin {nLeft,nTop,nBottom,nright}의 마진 객체
            @param {Object} htPosition 포지션 변경 전의 {nLeft,nTop} 객체
            @param {Function} stop position을 중지한다. beforeAdjust이후 커스텀 이벤트(position)가 발생하지 않는다.
        **/
        if(this._fireEvent("beforePosition")) {
            var bVisible = this._htWElement["element"].visible();
            if (!bVisible) {
                this._htWElement["element"].css({
                    left : "-9999px"
                }).show();
            }
            this._htOldPosition = this._htPosition;
            this._htPosition = this._getPosition();

            if (!bVisible) {
                this._htWElement["element"].hide();
            }

            // 기존 포지션과 현재 포지션값이 다를경우 변경. 그렇지 않으면 포지션을 변경하지 않음
            // 안보이는 경우는 무조건 변경함
            if (!bVisible || this._htOldPosition.nLeft !== this._htPosition.nLeft || this._htOldPosition.nTop !== this._htPosition.nTop || this._htOldPosition.nBottom !== this._htPosition.nBottom) {
                if(typeof this._htPosition.nTop === "undefined" ) {
                    this._htWElement["element"].$value().style.top = null;
                } else if(typeof this._htPosition.nBottom === "undefined" ) {
                    this._htWElement["element"].$value().style.bottom = null;
                }
                this._htWElement["element"].css({
                    left : this._htPosition.nLeft + "px",
                    top : this._htPosition.nTop + "px",
                    bottom : this._htPosition.nBottom + "px"
                });
                // alert(this._htOldPosition.nTop + "...." + this._htPosition.nTop);
                // this._fixedBugForAndroid();
            }
            /**
                포지션을 잡은 후에 발생. setPosition을 사용할 경우, 옵션값에 fSuccessFnc 함수를 지정하면 position 이벤트 발생후에 fSuccessFnc함수가 호출됨

                @event position
                @param {String} sType 커스텀 이벤트명
                @param {HTMLElement} elLayer LayerPostion 적용된 Layer
                @param {Object} htMargin {nLeft,nTop,nBottom,nright}의 마진 객체
                @param {Object} htPosition 포지션 변경 후의 {nLeft,nTop} 객체
                @param {Function} stop stop stop를 호출하여 영향 받는 것이 없음.
            **/
            this._fireEvent("position");
        }
    },

    /**
        jindo.m.LayerPosition 에서 사용하는 모든 이벤트를 바인드한다.
    **/
    _attachEvent : function() {
        this._htEvent = {};
        this._htEvent["actionEvent"] = jindo.$Fn(this._onEvent, this);
        this._htEvent["pageShow"] = jindo.$Fn(this._onPageShow, this).bind();
        if(this._bUseFixedProperty) {
            this._htEvent["actionEvent"].attach(window, "resize");
        } else {
            this._htEvent["actionEvent"].attach(window, "scroll").attach(window, "resize");
        }
        jindo.m.bindPageshow(this._htEvent["pageShow"]);

        if(this._hasOrientationChange) {
            this._htEvent["rotate"] = jindo.$Fn(this._onOrientationChange, this).attach(window, "orientationchange");
        }
    },

    /**
        jindo.m.LayerPosition 에서 사용하는 모든 이벤트를 해제한다.
    **/
    _detachEvent : function() {
        this._htEvent["actionEvent"].detach(window, "scroll")
                    .detach(window, "resize");
        jindo.m.unbindPageshow(this._htEvent["pageShow"]);
        if(this._hasOrientationChange) {
            this._htEvent["rotate"].detach(window, "orientationchange");
        }
        this._htEvent = null;
    },

    /**
        재포지션을 잡는 이벤트
        onScroll, onResize에서 처리함
        단, fixed 지원기기일 경우, onResize에서 처리됨
    **/
    _onEvent : function(we) {
        /**
         * Android 4.0 랜더링 버그
         * 모바일 기기 가로에서 세로로 바뀔경우, 화면의 위치는 정상이나, 화면이 랜더링 되지 않는 버그
         * 강제로 reflow를 발생.
         */
        if(jindo.m._isUseFixed() && jindo.m.getDeviceInfo().android) {
            this._htWElement["element"].css("left",this._htWElement["element"].css("left"));
        }
        if (this._htWElement["element"].visible()){
            this.setPosition();
        }
    },

    /**
        화면 전환 이벤트
    **/
    _onOrientationChange : function() {
        if (this._htWElement["element"].visible()){
            var self = this;
            /*
             * 레이어의 width가 100%로 되었을경우, 가로로 로딩후, 세로로 변경시 레이어가 깨지는 문제가 발생함.
             * 변경시 기존 값을 저장하고 width에 맞게 조절하는 기능을 함
             */
            if(window.innerWidth < this._htWElement["element"].width() ) {
                this._nPreWidth = this._htWElement["element"].width();
                this._htWElement["element"].width(window.innerWidth);
            } else {
                if(this._nPreWidth !== -1) {
                     this._htWElement["element"].width(this._nPreWidth);
                }
            }
            this._htWElement["element"].hide();
            this.setPosition();
            if(jindo.m.getDeviceInfo().android && !jindo.m.getDeviceInfo().bChrome) {
                this._htWElement["element"].show();
            } else {
                /**
                 * iOS5,6, chrome인 경우, 화면전환시 천천히 끌려가며 포지션을 잡는 현상이 발생
                 * delay 강제 발생후 처리
                 */
                setTimeout(function() {
                    self.setPosition();
                    self._htWElement["element"].show();
                },10);
            }
        }
    },

    /**
        History Backk 했을 경우
    **/
    _onPageShow : function() {
        if(this.isActivating()) {
            this.setPosition();
        }
    },

    /**
        사용자 이벤트 호출
    **/
    _fireEvent : function(sType) {
        return this.fireEvent(sType, {
            elLayer : this.getLayer(),
            htMargin : this.getMargin(),
            htPosition : this.getCurrentPosition()
        });
    },

    /**
        jindo.m.LayerPosition 에서 사용하는 모든 객체를 release 시킨다.
        @method destroy
    **/
    destroy: function() {
        this.deactivate();
        for(var p in this._htWElement) {
            this._htWElement[p] = null;
        }
        delete this._htWElement;
        delete this._htMargin;
        delete this._sPosition;
        delete this._htPosition;
        delete this._htOldPosition;
        delete this._bUseFixedProperty;
    }
}).extend(jindo.m.UIComponent);
