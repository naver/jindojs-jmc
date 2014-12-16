/**
    @fileOverview 진행 대기 상태를 알려주는 로딩 컴포넌트
    @author sculove
    @version #__VERSION__#
    @since 2011. 8. 18.
**/
/**
    진행 대기 상태를 알려주는 로딩 컴포넌트

    @class jindo.m.Loading
    @extends jindo.m.UIComponent
    @keyword loading, 로딩
    @group Component

    @history 1.12.0 Bug Loading 레이어의 과한 애니메이션으로 안드로이드에서 회색으로 처리되는 버그 수정
    @history 1.5.0 Bug 전체화면 로딩 중 단말기 회전시, foggy 영역이 맞지않는 문제 수정
    @history 1.5.0 Update 전체화면 로딩의 기준이 body에서 클라이언트 화면 크기로 수정
    @history 1.5.0 Support Window Phone8 지원
    @history 1.3.0 Bug 전체화면 로딩이후, 선택되지 않는 문제 수정
    @history 1.2.0 Release 로딩후 click 이벤트가 발생하지 않는 문제
    @history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
    @history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
    @history 1.1.0 Release 최초 릴리즈
**/
jindo.m.Loading = jindo.$Class({
    /* @lends jindo.m.Loading.prototype */
    /**
        초기화 함수

        @constructor
        @param {Varient} el 기준이 되는 엘리먼트. null일 경우, 전체화면을 대상으로 로딩이 생성된다.
        @param {Object} [htOption] 초기화 옵션 객체
            @param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
            @param {NUmber} [htOption.nWidth=31] 로딩이미지의 가로크기
            @param {NUmber} [htOption.nHeight=31] 로딩이미지의 세로크기
            @param {String} [htOption.sDefaultForeground="black"] 로딩이미지의 색상
            @param {String} [htOption.sDefaultBackground="transparent"] 로딩이미지의 배경색
            @param {String} [htOption.sLoadingText="로딩중입니다"] 로딩텍스트 내용 (HTML)<br />null인 경우, 텍스트가 표기되지 않는다.
            @param {Boolean} [htOption.bUseFoggy] Foggy 사용여부, 기본값 : el ? false=true
            <ul>
            <li>전체화면 기준일 경우 </li>
            <li>부분화면 기준일 경우 false</li>
            </ul>
            @param {String} [htOption.sFoggyColor="gray"] Foggy 색상
            @param {NUmber} [htOption.nFoggyOpacity=0.3] Foggy 투명도
    **/
    $init : function(el, htUserOption) {
        this.option({
             bActivateOnload : true,
             nWidth : 31,
             nHeight : 31,
             sDefaultForeground : "black",
             sDefaultBackground : "transparent",
             sLoadingText : "로딩중입니다",
             bUseFoggy : el ? false : true,
             sFoggyColor : "gray",
             nFoggyOpacity : 0.3
        });
        this.option(htUserOption || {});
        this._setWrapperElement(el);
        if(this.option("bActivateOnload")) {
            this.activate();
        }
    },

    $static : {
        DELAY : ["0","-.9167s","-.833s","-.75s","-.667s","-.5833s","-.5s","-.41667s","-.333s","-.25s","-.1667s","-.0833s"],
        ANIMATION_STYLE : "_loading_animation_sytle_",
        CONTAINER_CLASS : "_loading_container_class_"
    },

    /**
        jindo.m.Loading 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
        @param {Varient} el 엘리먼트를 가리키는 문자열이나, HTML엘리먼트
    **/
    _setWrapperElement: function(el) {
        this._htWElement = {};
        this._htWElement["base"] = jindo.$Element(jindo.$(el) ? jindo.$(el) : document.body);
        this._createLoading();
    },

    /**
        로딩 생성
    **/
    _createLoading : function() {
        /**
         *   container - foggy
         *                       - loadingbox - loading
         *                                              - text
        */
        this._createLoadingStyle();
        // Container 생성
        this._htWElement["container"] = jindo.$Element("<div style='zIndex: 2100'>")
                .addClass(jindo.m.Loading.CONTAINER_CLASS);
        // foggy 생성
        if(this.option("bUseFoggy")) {
            this._createFoggy().appendTo(this._htWElement["container"]);
        }
        // loadingbox 생성
        this._createLoadingElement();
        this._htWElement["loadingbox"] = jindo.$Element("<div>").css({
                "zIndex" : 2100,
                "position" : "absolute"
            }).append(this._htWElement["loading"]);
        // text 생성
        if(this.option("sLoadingText")) {
            this._createLoadingText().appendTo(this._htWElement["loadingbox"]);
        }
        this._htWElement["loadingbox"].appendTo(this._htWElement["container"]);
    },

    /**
        Foggy Layer 생성
    **/
    _createFoggy : function() {
        this._htWElement["foggy"] = jindo.$Element("<div>").css({
                position : "absolute",
                padding : "0px",
                margin : "0px",
                border : "0px",
                backgroundColor : this.option("sFoggyColor"),
                opacity : this.option("nFoggyOpacity"),
                width : "100%",
                height : "100%",
                left : "0px",
                top : "0px",
                zIndex : 2099   // 안드로이드 4.3 네이버앱에서 Foggy 영역에 회색으로 오동작되는 현상 으로 인해 zindex 를 로딩영역과 다르게 적용. - 20131128 by mania
        });
        
        return this._htWElement["foggy"];
    },

    /**
        위치를 지정한다.
    **/
    _setPosition : function() {
        var nWidth = this._htWElement["loadingbox"].width(),
            nHeight = this._htWElement["loadingbox"].height(),
            htScrollPosition;
        if(this._isBody()) {
            htScrollPosition = jindo.$Document().scrollPosition();
            this._htWElement["container"].css({
                "left" : htScrollPosition.left + "px",
                "top" : htScrollPosition.top + "px",
                "width" : window.innerWidth + "px",
                "height" : window.innerHeight + "px"
            });
        } else {
            if(this._htWElement["container"].width() < nWidth) {
                this._htWElement["container"].width(nWidth);
            }
            if(this._htWElement["container"].height() < nHeight) {
                this._htWElement["container"].height(nHeight);
            }
        }
       this._htWElement["loadingbox"].css({
                "top" : "50%",
                "left" : "50%",
                "margin-left" : -parseInt(nWidth/2,10) + "px",
                "margin-top" : -parseInt(nHeight/2,10) + "px"
        });
    },

    _isBody : function() {
        return this._htWElement["base"].isEqual(document.body);
    },

    /**
        Loading를 보여준다.
        @method show
    **/
    show : function() {
            /**
            Loading이 보이기 전에 발생

            @event beforeShow
            @param {String} sType 커스텀 이벤트명
            @param {Function} stop 수행시 show 사용자 이벤트가 발생하지 않습니다

        **/
        if(this.fireEvent("beforeShow")) {
            var aSpan = this._htWElement["loading"].queryAll("span"),
                sCssPrefix = jindo.m.getCssPrefix();
            for(var i=0; i<aSpan.length; i++) {
                jindo.$Element(aSpan[i]).css(sCssPrefix + "Animation", "loadingfade 1s linear " + jindo.m.Loading.DELAY[i] + " infinite");
            }
            this._attachEvent();
            // 전체인경우 화면사이즈에 맞게 크기 조절
            if(this._isBody()) {
                this._htWElement["container"].css({
                    "width" : window.innerWidth + "px",
                    "height" : window.innerHeight + "px"
                });
            }
            this._htWElement["container"].show();
            this._setPosition();
            /**
                Loading이 보인 후에 발생

                @event show
                @param {String} sType 커스텀 이벤트명
            **/
            this.fireEvent("show");
        }
    },

    /**
        Loading를 감춘다.
        @method hide
    **/
    hide : function() {
        /**
            Loading이 사라지기 전에 발생

            @event beforeHide
            @param {String} sType 커스텀 이벤트명
            @param {Function} stop 수행시 hide 사용자 이벤트가 발생하지 않습니다
        **/
        if(this.fireEvent("beforeHide")) {
            var aSpan = this._htWElement["loading"].queryAll("span"),
                sCssPrefix = jindo.m.getCssPrefix();
            for(var i=0; i<aSpan.length; i++) {
                jindo.$Element(aSpan[i]).css(sCssPrefix + "Animation", "");
            }
            this._detachEvent();
            this._htWElement["container"].hide();
            /**
                Loading이 사라진 후에 발생

                @event hide
                @param {String} sType 커스텀 이벤트명
            **/
            this.fireEvent("hide");
        }
    },

    /**
        스크롤 방지를 위한 것
        @param {jindo.$Event} 진도 이벤트
    **/
    _onPrevent : function(we) {
        we.stop(jindo.$Event.CANCEL_ALL);
        return false;
    },

    /**
        모바일 기기 방향 전환시 조절
        @param {jindo.$Event} 진도 이벤트
    **/
    _onRotate : function(we) {
        if(this._htWElement["container"].visible()) {
            /**
             * ios인 경우, 가로에서 세로로 화면 회전시 마크업이 축소되어 있는 상태가 발생함.
             * 이에 대한 처리를 해줌
             */
            if(jindo.m.getDeviceInfo().andorid) {
                this._setPosition();
            } else {
                this._htWElement["container"].hide();
                var self=this;
                setTimeout(function(){
                    self._htWElement["container"].show();
                    self._setPosition();
                },0);
            }
        }
    },

    /**
        이벤트 bind
    **/
    _attachEvent : function() {
        this._htEvent["rotate"] = jindo.$Fn(this._onRotate, this).bind();
        this._htEvent["prevent"] = jindo.$Fn(this._onPrevent, this)
            .attach(this._htWElement["container"],"touchstart")
            .attach(this._htWElement["container"],"touchmove");
        jindo.m.bindRotate(this._htEvent["rotate"]);
    },

    /**
        이벤트 unbind
    **/
    _detachEvent : function() {
        if(this._htEvent["prevent"]) {
            this._htEvent["prevent"].detach(this._htWElement["container"], "touchmove")
                .detach(this._htWElement["container"],"touchstart");
        }
        jindo.m.unbindRotate(this._htEvent["rotate"]);
    },

    /**
        animation-keyframe을 사용하기 위한 설정
    **/
    _createLoadingStyle : function() {
        if(!jindo.$(jindo.m.Loading.ANIMATION_STYLE)) {
            var style_sheet = document.createElement('style');
            if(style_sheet) {
                    style_sheet.setAttribute('type', 'text/css');
                    style_sheet.setAttribute('id',  jindo.m.Loading.ANIMATION_STYLE);
                    var sText = "@-"+jindo.m.getCssPrefix() +"-keyframes loadingfade{from{opacity:1}to{opacity:0}}";
                    var rules = document.createTextNode(sText);
                    if(style_sheet.styleSheet){// IE
                        style_sheet.styleSheet.cssText = rules.nodeValue;
                    }else{
                         style_sheet.appendChild(rules);
                    }

                    var head = document.getElementsByTagName('head')[0];
                    if(head){
                        head.appendChild(style_sheet);
                    }
            }
        }
    },

    /**
        Loading  구성요소 설정
    **/
    _createLoadingElement : function() {
            var sCssPrefix = jindo.m.getCssPrefix(),
                aHtml = [];
                
            // 안드로이드 4.3 네이버앱에서 Foggy 영역에 회색으로 오동작되는 현상 으로 인해 zindex 를 로딩영역과 다르게 적용. - 20131128 by mania
            // 원인은 로딩 레이어의 과도한 애니메이션으로 인한 문제로.. GPU 가속을 사용할 수 있도록 변경.
            var  htTranslate = jindo.m.useCss3d() ? {
                open : "3d(",
                end : ",0)"
            } : {
                open : "(",
                end : ")"
            };
            
            for(var i=0; i<12; i++) {
                aHtml.push("<span style='display:block;position:absolute;top:40%;left:48%;width:11%;height:24%;border-radius:6px;background:");
                aHtml.push(this.option("sDefaultForeground"));
                aHtml.push("; opacity:0; -");
                aHtml.push(sCssPrefix);
                aHtml.push("-transform:rotate(");
                aHtml.push(i * 30);
                aHtml.push("deg) translate"+htTranslate.open+"0,-140%" + htTranslate.end+";'></span>");
            }
            this._htWElement["loading"] = jindo.$Element("<div>").css({
                "position" : "relative",
                "margin" : "0 auto"
            }).html(aHtml.join(""));
    },

    /**
        지정한 옵션값을 갱신한다.

        @method refresh
    **/
    refresh : function() {
        this._htWElement["loading"].css({
            "width" : this.option("nWidth") + "px",
            "height" : this.option("nHeight") + "px",
            "background" : this.option("sDefaultBackground")
        });
        if(this._htWElement["text"]) {
            this._htWElement["text"].html(this.option("sLoadingText"));
        }
    },

    /**
        텍스트 모듈을 만듦
    **/
    _createLoadingText : function() {
        this._htWElement["text"] = jindo.$Element("<div>").css({
            "margin" : "2px 0 0 0",
            "bottom" : 0,
            "width" : "100%",
            "text-align" : "center"
        });
        return this._htWElement["text"];
    },

    /**
        jindo.m.Loading 컴포넌트를 활성화한다.
        activate 실행시 호출됨
    **/
    _onActivate : function() {
        this._htEvent = {};
        this._htWElement["container"].appendTo(this._htWElement["base"]);
        if(this._isBody()) {
            this._htWElement["container"].css({
                "position" : "absolute",
                "top" : 0,
                "left" : 0,
                "width" : "100%",
                "height" : "100%"
            }).hide();
        } else {
            this._htWElement["container"].css({
                "position" : "relative"
            }).hide();
        }
        this.refresh();
    },

    /**
        jindo.m.Loading 컴포넌트를 비활성화한다.
        deactivate 실행시 호출됨
    **/
    _onDeactivate : function() {
        this._detachEvent();
        this._htWElement["container"].leave();
    },

    /**
        jindo.m.Loading 에서 사용하는 모든 객체를 release 시킨다.
        @method destroy
    **/
    destroy: function() {
        this.deactivate();
        for(var p in this._htWElement) {
            this._htWElement[p] = null;
        }
        this._htWElement = null;
    }
}).extend(jindo.m.UIComponent);