/**
    @fileOverview 페이지 메뉴 transform 컴포넌트
    @author mania
    @version #__VERSION__#
    @since 2013. 4. 22
**/
/**
    페이지 메뉴 transform 컴포넌트
    @class jindo.m.RevealCommon
    @extends jindo.m.UIComponent
    @uses jindo.m.Morph
    @keyword 메뉴, 햄버거 매뉴
    @group Component
    @invisible
    
    @history 1.12.0 Updage 컨텐츠 기준 margin 적용 가능하도록 수정 
    @history 1.9.0 pageShow일 경우, 화면사이즈 맞추는 로직 추가 (from sculove)
    @history 1.8.0 Release 최초 릴리즈
**/
jindo.m.RevealCommon = jindo.$Class({
    /* @lends jindo.m.RevealCommon.prototype */
    /**
        초기화 함수

        @constructor
        @param {Object} [htOption] 초기화 옵션 객체
            @param {String} [htOption.sClassPrefix=reveal-]
            컴포넌트 내에서 element select 시 참조할 Class의 prefix명
            @param {Number} [htOption.nDuration=500]
            슬라이드 애니메이션 지속 시간
        @param {Number} [htOption.nMargin=100] 
            오른쪽메뉴(햄버거 메뉴) 에서 사용할 컨텐츠 노출 사이즈
            @param {String} [htOption.sDirection=down]
            슬라이드 방향
            <ul>
            <li>"down" : 화면 상단에서 아래로 슬라이드</li>
            <li>"left" : 화면 오른쪽에서 왼쪽으로 슬라이드</li>
            <li>"right" : 화면 왼쪽에서 오른쪽으로 슬라이드</li>
            </ul>
            @param {Boolean} [htOption.bActivateOnload=true] 
            컴포넌트 로드시 activate 여부
            @param {Boolean} [htOption.bUseTimingFunction=jindo.m.useTimingFunction()]
            Timingfunction 사용 여부 
            @param {Boolean} [htOption.bUseOffsetBug=jindo.m.hasOffsetBug()]
            offset 여부
            @param {Boolean} [htOption.bFixNaviSize=false] 컨텐츠 영역을 고정으로 할지 여부 true : 네비 고정, false : 컨텐츠 고정
    **/
    
    $init : function(htOption){
        this.option({
            "sClassPrefix" : "reveal-",
            "sDirection" : "right",  // left,right, bottom
            "nDuration" : 500,
            "nMargin" : 100, // left, right 의 경우 content 의 보여지는 영역
            "bActivateOnload" : true,
            //@todo sculove | bAutoResize 옵션이 꼭 필요할까? 기본적으로 모두 써야할거 같은데...
            //신규 플리킹에서는 제거했음.
            "bAutoResize" : true,
            "bFixNaviSize" : false,
            "bUseTimingFunction" : jindo.m.useTimingFunction(),
            //@todo sculove | bUseOffsetBug 옵션 제거, bUseCss3d옵션 추가해야할것 같음 
            "bUseOffsetBug" : jindo.m.hasOffsetBug()
            // "bUseScroll" : false
            
            // "useCss3" : true,   // css3(transform) 을 사용할 지 여부 [ false :  left, top 을 이용한 처리 ] ad" : true
        });
        this.option(htOption || {});
        
        if(this.option("bActivateOnload")) {
             this.activate();
        }
    },

    /**
        jindo.m.SlideReveal 에서 사용하는 모든 인스턴스 변수를 초기화한다.
        @param  {Boolean}   bInit   컴포넌트 초기화시 호출 여부
    **/
   _initVar: function(bInit) {
        if(bInit){
            this._bShow = false;
            this._sCssPrefix = jindo.m.getCssPrefix();
            this._htEvent = {};
            this._htInstance = {};
            this._htNavSize = {};
        }
        this._aEndStatus = [];
        
        this._htSize = jindo.$Document().clientSize();
        
        if(!this._htWElement["nav"].visible()){
            this._htWElement["nav"].show();
            this._nNavHeight = this._htWElement["nav"].height();
            this._htWElement["nav"].hide();
        }
        else{
            this._nNavHeight = this._htWElement["nav"].height();
            
        }
        this._bUseCss3d = jindo.m.useCss3d();
        // this._bOffsetBug = jindo.m.hasOffsetBug();
        this._getTranslate();
        
        
        // this._bOffsetBug = false;
    },
    
    /**
     * 스크롤 컴포넌트 적용을 위한 full size 처리 함수 
     */
    // _setFullSize : function(){
//                 
        // var self = this;
         // jindo.m.getFullSize(function(oViewportSize){
            // self._nFullSize = oViewportSize.htSize.height;
            // self.fireEvent("rotateFullSize", oViewportSize.htSize);
        // })  
        // // jindo.m.bindFullSize(function(oViewportSize){
            // // console.log(oViewportSize.htSize);
                // // self._nFullSize = oViewportSize.htSize.height;    
        // // });
        // // this._htInstance["fullSize"] = new jindo.m.Fullsize().attach({
            // // "rotate" : function(oViewportSize){
                // // console.log(oViewportSize);
                // // self._nFullSize = oViewportSize.viewportHeight;    
                // // self.fireEvent("sizeRotate", oViewportSize);
            // // }
        // // });
        // // this._htInstance["fullSize"].reflowViewportSize();
    // },
    
    /**
     * 네비게이션의 높이 설정 
     *  @method setNavHeight
     *  @param {Number} nHeight     높이 값 
     */
    setNavHeight : function(nHeight){
        this._htNavSize["height"] = nHeight;
    },
    
    /**
     * translate 상태 처리 
     */
    _getTranslate : function(){
        this._sTranslateStart = "translate(";
        this._sTranslateEnd = ")";
        if(this._bUseCss3d){
            this._sTranslateStart = "translate3d(";
            this._sTranslateEnd = ",0px)";
        }
    },
    

    /**
      *  컴포넌트 내부에서 쓰는 엘리먼트를 저장한다.
      */
    _setWrapperElement: function() {
        this._htWElement = {};
        this._htWElement["nav"] = jindo.$Element(jindo.$$.getSingle("."+this.option("sClassPrefix")+"nav"));
        this._htWElement["header"] = jindo.$Element(jindo.$$.getSingle("."+this.option("sClassPrefix")+"header"));
        this._htWElement["content"] = jindo.$Element(jindo.$$.getSingle("."+this.option("sClassPrefix")+"contents"));
        this._htWElement["wrap"] = jindo.$Element(jindo.$$.getSingle("."+this.option("sClassPrefix")+"wrap"));

        if(!this._htWElement["header"]){
            this._htWElement["header"] = this._htWElement["nav"];
        }
        if(this._htWElement["header"].indexOf(this._htWElement["nav"]) > -1){
            this._bNavInHeader = true;
        }
    },

    /**
     *  이벤트 bind
     */
    _attachEvent : function(){
        if(this.option("bAutoResize")){
            this._htEvent["rotate"] = jindo.$Fn(this._onResize, this).bind();
            jindo.m.bindRotate(this._htEvent["rotate"]);
            jindo.m.bindPageshow(this._htEvent["rotate"]);
        }
        // this._htEvent["resize"] = jindo.$Fn(this._onResize, this).attach(window , "resize");
    },

    /**
     *  초기 헤더, 메뉴, 컨텐츠 영역의 위치 정의 
     */
    _setInitStyle : function(bInit){
        this._htWElement["content"].css("position" , "relative");
        var htPosInfo = this._getPosInfo();
        
        this._setHeaderStyle();
        this._setNavStyle(htPosInfo, bInit);


    },
    
    /**
     * header 영역 style 정의 
     */
    _setHeaderStyle : function(){
                
        if(this.option("sDirection") == "down"){
            if(this._bNavInHeader){
                this._htWElement["header"].css("top" , this._bShow ? (!this.option("bUseOffsetBug") ? -this._nNavHeight : 0) : -this._nNavHeight);
            }else{
                this._htWElement["nav"].css({
                    "position" : "absolute",
                    "top" : this._bShow ? 0 : -this._nNavHeight
                });
            }
        }
    },
    
    /**
     * navigation 영역 style 정의 
     */
    _setNavStyle : function(htPosInfo){
        
        // var htPosInfo = this._getPosInfo();
        var htNavStyle = {
            "width" : this._getNaviWidth() + "px"
        };

        if(this.option("sDirection") != "down"){
            // var htNavStyle = {
                // "width" : (htPosInfo.nDefaultNavPos <= 0 ? -htPosInfo.nDefaultNavPos : htPosInfo.nDefaultNavPos) + "px"
            // };
            if(this.option("sDirection") == "left"){
                htNavStyle.left = this._htSize.width;
            }else if(this.option("sDirection") == "right"){
                htNavStyle.left = htPosInfo.nMarginLeftPos;
                
            }
            this._htWElement["nav"].css(htNavStyle);
        }
        
    },

    /**
     *  resize (rotete) 이벤트 발생시 호출되는 함수
     * 
     *  @history 1.11.0  update beforeRotate 이벤트내 margin 값 수정시 반영이 되지 않던 문제 수정
     */
    _onResize : function(){
        
        this._initVar();
        /**
            화면이 rotate 되거나 resize 시 발생. 내부 코드 실행 전 발생 

            @event beforeRotate
            @param {String} sType 커스텀 이벤트명
            @param {Function} stop rotate 또는 resize시 동작되지 않는다.
        **/
        if(!this.fireEvent("beforeRotate")){
            return false;
        }
        
        this._setInitStyle();
        var htPosInfo = this._getPosInfo();

        if(htPosInfo.nMarginLeftPos && (this.option("sDirection") == "left" || this.option("sDirection") == "right") && this._bShow){
            if(!this.option("bUseOffsetBug")){
                            
                // this._htWElement["nav"].css("left", this._nWidth);

                this._htMorph.pushAnimate( -1, [this._htWElement["header"].$value(), {
                    // "@transitionProperty" : "webkit-transform",
                    "@transform" : this._sTranslateStart + -htPosInfo.nMarginLeftPos+"px, "+htPosInfo.nHeader.Y+"px" + this._sTranslateEnd
                }, this._htWElement["content"].$value(), {
                    // "@transitionProperty" : "webkit-transform",
                    "@transform" : this._sTranslateStart + -htPosInfo.nMarginLeftPos+"px, "+htPosInfo.nContent.Y+"px" + this._sTranslateEnd
                }, this._htWElement["nav"].$value(), {
                    // "@transitionProperty" : "webkit-transform",
                    "@transform" : this._sTranslateStart + -htPosInfo.nMarginLeftPos+"px, "+htPosInfo.nNav.Y+"px" + this._sTranslateEnd
                }]);
                    
                this._htMorph.play();
                this._htMorph.clear();
            }else{
                // this._htWElement["nav"].css("left", (this.option("sDirection") == "left" ? this._getNaviWidth() : 0));
                this._htWElement["header"].css({
                    "left" : -htPosInfo.nMarginLeftPos+"px"
                });
                this._htWElement["content"].css({
                    "left" : -htPosInfo.nMarginLeftPos+"px"
                });
                this._htWElement["nav"].css("left", (this.option("sDirection") == "left" ? (this.option("bFixNaviSize") ? this._htSize.width - this.option("nMargin") : this.option("nMargin")) : 0));
                
                this._setWrapStyle();
            }
            var self = this;
            this._setMaxClientSize({
                "fFunction" : function(){
                    self._rotateFireEvent();
                    self._setWrapStyle();
                },
                "bInit" : false
            });
            return false;
        }

        this._rotateFireEvent();
        
    },
    
    _getWrapStyle : function(){
        this._nNavHeight = this._htWElement["nav"].height();

        return {
            "overflow" : "hidden",
            "width" : this._htSize.width + "px",
            "height" : (this._nNavHeight > this._htSize.height ? this._nNavHeight : this._htSize.height) + "px",
            "position" : "relative"
        }; 
    },
    _setWrapStyle : function(){
        var htWrapStyle = {
            "overflow" : "",
            "width" : "",
            "height" : "",
            "position" : ""
        };

        if(this._bShow){
            htWrapStyle = this._getWrapStyle();
        }
        if(this._htWElement["wrap"] && this.option("sDirection") != "down"){
            this._htWElement["wrap"].css(htWrapStyle);
        }
        
    },
    
    /**
     * rotate fireEvent 호출 함수 
     */
    _rotateFireEvent : function(){
        /**
            화면이 rotate 되거나 resize 시 발생 

            @event rotate
            @param {String} sType 커스텀 이벤트명
        **/
        this.fireEvent("rotate");
        
        // if(this.option("bUseScroll")){
            // var self = this;
            // jindo.m.getFullSize(function(oCustomEvent){
                // self.setNavHeight(oCustomEvent.htSize.height);
            // })
        // }
        
          
    },

    /**
     *  네비게이션, 메뉴, 컨텐츠 영역의 이동 위치를 계산하는 공통 함수
     * 상황에 따른 [필수 구현]
     */
    _getPosInfo : function(){
        
    },
    
    /**
     *  메뉴 show/hide toggle 함수
     *  @method toggle 
     *  @param {Boolean} bType  보일지 감출지 type 정의 (show, hide)
     *  @param {Number} nDuration  Duration 시간(ms)
     */
    toggle : function(bType, nDuration){
        if(this.isPlaying()){
            return;
        }
        if(typeof bType == "undefined"){
            bType = this._bShow ? "hide" : "show";
        }
        if(bType == "show" && this._bShow){
            return false;
        }
        if(bType == "hide" && !this._bShow){
            return false;
        }
        // this._setDuration();
        this._setMoveCss(bType, nDuration);
    },

    /**
     *  메뉴 노출 함수
     *  @method show
     *  @param {Number} nDuration   Duration 시간(ms)
     */
    show : function(nDuration){
        if(!this.option("bUseTimingFunction") && nDuration == 0){
            nDuration = 1; 
        }
        this.toggle("show", nDuration);
    },
    
    isPlaying : function(){
       return this._htMorph.isPlaying();  
    },

    /**
     *  메뉴 숨김 함수
     *  @method hide
     *  @param {Number} nDuration   Duration 시간(ms)
     */
    hide : function(nDuration){
        if(!this.option("bUseTimingFunction") && nDuration == 0){
            nDuration = 1; 
        }
        this.toggle("hide", nDuration);
    },
    
    /**
     * 현재 보여지고 있는지 여부
     * true : 보여진 상태
     * false : 감춰진 상태
     * @method  getVisible
     */
    getVisible : function(){
        return this._bShow;  
    },

    /**
     * transition instance 생성을 위한 option 정의 
     */
    _getTransitionOption : function(){
        return {
            "fEffect" : jindo.m.Effect.cubicEaseOut,
            "bUseTransition" : this.option("bUseTimingFunction")
            // "sTransitionTimingFunction" : "ease"
            // "bUseTimingFunction" : 
        };
    },
    
    /**
     * transitino instance 생성 
     */
    _createMorph : function(){
        this._htMorph = {};
        var htInOption = this._getTransitionOption();
        
        var self = this;
        this._htMorph = new jindo.m.Morph(htInOption).attach({
            "end" : function(){
                self._setContentPos();
                self._setHeaderPos();
                self._setNavPos();
                self._setEnd();
            }
        });
    },
    
    /**
     *  이동을 위한 transform 정의 함수 
     */
    _setMoveCss : function(bType, nDuration){
        
        this._bMove = true;
        if(!this._bShow){
            this._htWElement["nav"].show();
        }
        /**
            메뉴가 나타나기 전 발생

            @event beforeShow
            @param {String} sType 커스텀 이벤트명
            @param {Function} stop 메뉴가 나타나지 않는다. 
        **/
       /**
            메뉴가 사라지기 전 발생

            @event beforeHide
            @param {String} sType 커스텀 이벤트명
            @param {Function} stop 메뉴가 사라지지 않는다. 
        **/
       var tmpShow = this._bShow;
        if( !this.fireEvent("before" + (!this._bShow ? "Show" : "Hide")) ){
            this._bShow = tmpShow;
            return false;
        }
        
        nDuration = (typeof nDuration != "undefined" && nDuration >= 0) ? nDuration : null || this.option("nDuration");
       
       this._setMoveCssDetail(nDuration);
       
        /**
         * show / hide 를 통한 버그로 인해 delay 처리 
         */
        // var self = this;
        // setTimeout(function(){
            this._htMorph.play();
        // }, 1);
        
    },
    
    /**
     * 영역 이동 상세 함수 
     */
    _setMoveCssDetail : function(nDuration){
        var htPosInfo = this._getPosInfo();
       
        if(this._bUseCss3d){
            this._sTranslateStart = "translate3d(";
            this._sTranslateEnd = ",0px)";
        }
        
        var aData = [this._htWElement["header"].$value(), {
            // "@transitionProperty" : "webkit-transform",
            "@transform" : this._sTranslateStart + htPosInfo.nHeader.X+"px, "+htPosInfo.nHeader.Y+"px" + this._sTranslateEnd
        }, this._htWElement["content"].$value(), {
            // "@transitionProperty" : "webkit-transform",
            "@transform" : this._sTranslateStart + htPosInfo.nContent.X+"px, "+htPosInfo.nContent.Y+"px" + this._sTranslateEnd
        }];
        
        if(!this._bNavInHeader){
            aData.push( this._htWElement["nav"].$value(), {
                // "@transitionProperty" : "webkit-transform",
                "@transform" : this._sTranslateStart +htPosInfo.nNav.X+"px, "+htPosInfo.nNav.Y+"px" + this._sTranslateEnd
            });
        }
        this._htMorph.pushAnimate.apply(this._htMorph, [nDuration, aData]);
  
    },

    /**
     * transition 종료 후 호출 함수 
     */
    _setEnd : function(bType){
        this._htMorph.clear();
        
        var sAct = "";
        var bShow = this._bShow ? true : false;
        if(this._bMove){
            sAct = !this._bShow ? "show" : "hide";
            bShow = this._bShow ? false : true;
            this._bMove = false;
        }
        // if(bType && bType == "show"){
            // sAct = "show";
            // bShow = true;
        // }else if(bType){
            // sAct = "hide";
            // bShow = false;
        // }else {
        // }
           
        if(!bShow && this.option("sDirection") != "down"){
            this._htWElement["nav"].hide();
        }
        /**
            메뉴가 나타난 후 발생

            @event show
            @param {String} sType 커스텀 이벤트명
        **/
       /**
            메뉴가 사라진 후 발생

            @event hide
            @param {String} sType 커스텀 이벤트명
        **/
        var self = this;
        // setTimeout( function(){
            this.fireEvent(sAct);
        // }, 200);
        this._bShow = bShow;  
    },
    
    /**
     * content 영역 이동 후 실행되는 함수 
     */
    _setContentPos : function(){
        if(this.option("bUseOffsetBug")){
            
            var htPosInfo = this._getPosInfo();
            this._htWElement["content"].css(this._sCssPrefix + "Transform", "");
            this._htWElement["content"].css({
                "left" : htPosInfo.nLeftPos+"px",
                "top" : htPosInfo.nLastContent+"px"
            });
        }
        // this._aEndStatus.push(true);
        // this._checkEnd();  
    },
    
    /**
     * header 영역 이동 후 실행되는 함수 
     */
    _setHeaderPos : function(){
        if(this.option("bUseOffsetBug")){
            var htPosInfo = this._getPosInfo();
            // var sCssValue = htPosInfo.sCssValue;
            this._htWElement["header"].css(this._sCssPrefix + "Transform", "");
            this._htWElement["header"].css({
                "left" : htPosInfo.nLeftPos+"px",
                "top" : htPosInfo.nLastHeader+"px"
            });
        }
        // this._aEndStatus.push(true);
        // this._checkEnd();
    },
    
    /**
     * navigator 영역 이동 후 실행되는 함수 
     */
    _setNavPos : function(){
        var htWrapStyle = {
            "overflow" : "",
            "width" : "",
            "height" : "",
            "position" : ""
        };
        
        // alert(this.option("bUseOffsetBug"));
        if(this.option("bUseOffsetBug")){
            var htPosInfo = this._getPosInfo();
            this._htWElement["nav"].css(this._sCssPrefix + "Transform", "");
            
            this._htWElement["nav"].css({
                "left" : htPosInfo.nNavLeftPos+"px",
                "top" : htPosInfo.nLastNav+"px"
            });
        }
        if(!this._bShow){
            htWrapStyle = this._getWrapStyle();
        }
        if(this._htWElement["wrap"] && this.option("sDirection") != "down"){
            this._htWElement["wrap"].css(htWrapStyle);
        }
        // this._aEndStatus.push(true);
        // this._checkEnd();
        
    },
    
    /**
     * nav, header, content 영역이 모두 이동되었는지 체크 함수 
     */
    // _checkEnd : function(){
        // if(this._aEndStatus.length >= (this._bNavInHeader ? 2 : 3)){
            // this._aEndStatus = [];
            // this._setEnd();
        // }
    // },

    /**
     *  jindo.m.SlideReveal 컴포넌트를 활성화 한다.
     *  activate 실행시 호출됨 
     */
    _onActivate : function(){
        this._setWrapperElement();
        this._initVar(true);
   
        this._setMaxClientSize({
            "bInit" : true
        });     
        // if(this.option("bUseScroll")){
            // this._setFullSize();
        // }
        
        this._setInitStyle(true);
        this._createMorph();
        this._attachEvent();
    },
    
    _setMaxClientSize : function(htOption){
        var self = this;
        
        // var htWrapStyle = {
            // "overflow" : "",
            // "width" : "",
            // "height" : "",
            // "position" : ""
        // };
        // if(this._htWElement["wrap"] && this.option("sDirection") != "down"){
            // this._htWElement["wrap"].css(htWrapStyle);
        // }
        
        jindo.m._maxClientSize(function(htData){
            self._htSize = htData;
            if(htOption && typeof htOption.fFunction == "function"){
                htOption.fFunction();
            }
        }, (htOption.bInit ? true : false));
    },
    
    /**
     *  jindo.m.SlideReveal 컴포넌트를 비활성화한다.
     *  deactivate 실행시 호출됨
     */
    _onDeactivate : function(){
        jindo.m.unbindRotate(this._htEvent["rotate"]);
        jindo.m.unbindPageshow(this._htEvent["rotate"]);
        for ( var i in this._htInstance){
            if(this._htInstance[i]){
                this._htInstance[i].destroy();
            }
        }
        this._bShow = this._sCssPrefix = this._htEvent = this._htSize = this._nNavHeight = null;
        this._htWElement = this._htEvent = this._htMorph = this._htInstance = null;
    },

    /**
     * jindo.m.SlideReveal 에서 사용하는 모든 것을 release 시킨다.
     * @method destroy
     */
    destroy : function(){
        this.deactivate();
    }
}).extend(jindo.m.UIComponent);