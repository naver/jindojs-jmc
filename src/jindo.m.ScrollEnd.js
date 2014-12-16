/**
    @fileOverview Scroll이 종료된 시점을 알려주는 컴포넌트
    @author sculove
    @version #__VERSION__#
    @since 2011. 12. 05.
    <1.0.0 이후 변경 사항>
    1. Android 3.x, 4.x 대응
     : 연속적인 scroll 이벤트 후 touchend는 발생하지 않음

    <1.1.0 이후 변경 사항>
     : 네이버앱에서 ios4이하 버전 스크롤 발생하지 않는 것 수정
       document이벤트에서 window로 변경
    <1.2.0 이후 변경 사항>
     : touchStart를 다중 발생할 경우, scrollEnd가 발생되지 않는 버그 수정
     : 마지막, 상단에서 스크롤시 scrollEnd 미발생 버그 수정
**/
/**
    Scroll이 종료된 시점을 알려주는 컴포넌트

    @class jindo.m.ScrollEnd
    @extends jindo.m.Component
    @keyword scrollend
    @group Component
    @update

    @history 1.16.0 Update Scroll 이벤트가 매번 발생해 ScrollEnd 컴포넌트 수정
    @history 1.11.0 Bug iOS 에 scrollEnd 이벤트가 두번 발생되는 버그 수정  
    @history 1.3.0 Bug touchStart를 다중 발생할 경우, scrollEnd가 발생되지 않는 버그 수정
    @history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
    @history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
    @history 1.1.0 Release 최초 릴리즈
**/
jindo.m.ScrollEnd = jindo.$Class({
    /* @lends jindo.m.ScrollEnd.prototype */
    /**
        초기화 함수

        @constructor
    **/
    $init : function(el,htUserOption) {
        this._initVar();
        this._setWrapperElement(el);
        this._attachEvent();
    },

    /**
        변수 초기화
    **/
    _initVar : function() {

        this._bIOS = jindo.m.getDeviceInfo().iphone || jindo.m.getDeviceInfo().ipad;
        this._nType = this._getDetectType();
        if(this._nType === 2){
             this._nScrollTimer = -1;
        }
        this._isTouched = false;
        this._isMoved = false;
        this._nObserver = null;
        this._nScrollEndTimer = null;
        this._nPreLeft = null;
        this._nPreTop = null;
        this._bMoveIOS = 0;
        // this._isTop = false;
    },

    /**
        scrollend를 감지하는 방법 타입을 리턴한다.
        Type 0: iOS, 1: Android (2.x), 2: Android (3.x이상 ),win8
        @date 2012-11-06
        @author oyang2
        @return {String} type
     */
    _getDetectType : function(){
        var nRet = 0;

        if(jindo.m.getDeviceInfo().android){
            if(parseInt(jindo.m.getDeviceInfo().version,10) >= 3) {
                nRet = 2;
            } else {
                nRet = 1;
            }
        }else if(jindo.m.getDeviceInfo().win){
             if(parseInt(jindo.m.getDeviceInfo().version,10) >= 8) {
                 nRet = 2;
             }
        }else if(this._bIOS && parseInt(jindo.m.getDeviceInfo().version,10) >= 8) {
            nRet = 2;
        }

        return nRet;
    },

    /**
        객체 초기화
    **/
    _setWrapperElement : function(el) {
        this._htElement = {};
        this._htElement["body"] = document.body;
    },

    /**
        이벤트 활성화
    **/
    _attachEvent : function() {
        this._htEvent = {};
        this._htEvent["event_scroll"] = {
            ref : jindo.$Fn(this._onScroll, this).attach(window, "scroll"),
            el : window
        };

        // ios 에서 end 이벤트가 두번 발생되는 것 대응. - 20131029 by mania
        if(this._nType == 0 && this._bIOS && parseInt(jindo.m.getDeviceInfo().version,10) <= 7) {
            this._htEvent["event_touchmove"] = {
                ref : jindo.$Fn(this._onMoveForIOS, this).attach(this._htElement["body"], "touchmove"),
                el : this._htElement["body"]
            };
        }
        if(this._nType == 1) {
            this._htEvent["event_touchstart"] = {
                ref : jindo.$Fn(this._onStartForAndroid, this).attach(this._htElement["body"], "touchstart"),
                el : this._htElement["body"]
            };
            this._htEvent["event_touchmove"] = {
                ref : jindo.$Fn(this._onMoveForAndroid, this).attach(this._htElement["body"], "touchmove"),
                el : this._htElement["body"]
            };
            this._htEvent["event_touchend"] = {
                ref : jindo.$Fn(this._onEndForAndroid, this).attach(this._htElement["body"], "touchend"),
                el : this._htElement["body"]
            };
        }
    },
    _onMoveForIOS : function(){
        this._bMoveIOS = 0;  
    },
    /**
        이벤트 비활성화
    **/
    _detachEvent : function() {
        for(var p in this._htEvent) {
            var ht = this._htEvent[p];
            ht.ref.detach(ht.el, p.substring(p.lastIndexOf("_")));
        }
    },

    /**
        이벤트 감시자 시작
    **/
    _startObserver : function() {
        var self = this;
        this._stopObserver();
        this._nObserver = setInterval(function() {
            self._observe();
        },100);
    },

    /**
        이벤트 감시
    **/
    _observe : function() {
        if(this._isTouched || (this._nPreTop !== window.pageYOffset || this._nPreLeft !== window.pageXOffset) ) {
            this._nPreTop = window.pageYOffset;
            this._nPreLeft = window.pageXOffset;
        } else {
            this._stopObserver();
            //console.log("옵저버끝 " + window.pageYOffset);
            this._fireEventScrollEnd();
        }
    },

    /**
        이벤트 감시자 중지
    **/
    _stopObserver : function() {
        clearInterval(this._nObserver);
        this._nObserver = null;
    },

    /**
        scroll 이벤트 핸들러
    **/
    _onScroll : function(we) {
        switch(this._nType) {
            case 0 : 
                if(this._bIOS && this._bMoveIOS > 0){
                    return false;
                }
                this._fireEventScrollEnd();
                this._bMoveIOS++;
                break;
            case 1 : this._startObserver(); break;
            case 2 : var self = this;
                  clearTimeout(this._nScrollTimer);
                  this._nScrollTimer = setTimeout(function() {
                      self._fireEventScrollEnd();
                  },350);
                  break;
        }
    },

    /**
        touchstart 이벤트 핸들러
    **/
    _onStartForAndroid : function(we) {
        // console.log("start");
        // this._stopObserver();
        this._isTouched = true;
        this._isMoved = false;

        this._nPreTop = null;
        this._nPreLeft = null;

        // if(window.pageYOffset === 0) {
        //  this._isTop = true;
        // } else {
        //  this._isTop = false;
        // }
    },

    /**
        touchstart 이벤트 핸들러
    **/
    _onMoveForAndroid : function(we) {
        // console.log("move");
        this._isMoved = true;
    },

    /**
        touchend 이벤트  핸들러
    **/
    _onEndForAndroid : function(we) {
        // console.log("end");
        this._isTouched = false;
        /*
         * android인 경우, 주소창이 보이면 scroll이벤트가 발생하지 않음.
         * 주소창이 보여서 스크롤이 발생하여도 window.pageYOffset 0이므로,
         * touchstart시점이 0 에서 시작할 경우, 움직임이 있고,
         * 200ms이후, window.pageYOffset 위치가 0일 경우, 스크롤 End를 호출한다.
         */

        //addConsole("[touchend] isTop : " + this._isTop + ", isMoved : " + this._isMoved);
        // if(this._isTop && this._isMoved) {
        if(this._isMoved) {
            this._startObserver();
        }
    },


    /**
        scrollEnd 사용자 이벤트 호출
    **/
    _fireEventScrollEnd : function() {
        // console.log("scroll end");
        
        /**
            스크롤이 종료된 후 발생 

            @event scrollEnd
            @param {String} sType 커스텀 이벤트명
            @param {Number} nTop page Y 축 offset 값  
            @param {Number} nLeft page X 축 offset 값  
        **/
        this.fireEvent("scrollEnd", {
            nTop : window.pageYOffset,
            nLeft : window.pageXOffset
        });
    },

    _fireEventScrollEndForAndroid : function() {
        var self = this;
        clearTimeout(this._nScrollEndTimer);
        this._nScrollEndTimer = setTimeout(function() {
            self._fireEventScrollEnd();
        },500);
    },

    /**
        객체 초기화
        @method destroy
    **/
    destroy: function() {
        this._detachEvent();
        this._nType = -1;
        this._isTouched = null;
        this._isMoved = null;
        this._nObserver = null;
        this._nPreLeft = null;
        this._nPreTop = null;
    }
}).extend(jindo.m.Component);
