/**
 @fileOverview 모바일 터치 컴포넌트
 @(#)jindo.m.Touch.js 2011. 8. 24.
 @author oyang2
 @version #__VERSION__#
 @since 2011. 8. 24.
 **/
/**
 기준 레이어에서의 사용자 터치 움직임을 분석하여 scroll,tap 등의 동작을 분석하는 컴포넌트

 @class jindo.m.Touch
 @extends jindo.m.UIComponent
 @keyword touch
 @group Component

 @history 1.17.0-master Bug 멀티터치시 대응. 멀티 터치시 touchstart, touchend 최종 한번만 나오도록 변경
 @history 1.16.0 Bug 대각선 방항성에 대한 체크 부분 기존과 같이 변경
 @history 1.15.0 Bug touchMove 이벤트가 사용자가 정의한 방향일때 발생되던것을 매번 발생될 수 있도록 변경
 @history 1.12.0 Bug moveThreshold 적용시 격자 형태로 발생되던 버그 수정
 @history 1.12.0 Update 대각선 방향 옵션 추가
 @history 1.12.0 Bug vScroll, hScroll, dScroll 이벤트 이후 touchEnd 이벤트 발생 순서 변경

 @history 1.12.0 Bug Window8 IE10 플리킹 적용시 스크롤이 안되는 이슈 처리
 @history 1.9.0 Bug Window8 IE10 플리킹 적용시 스크롤이 안되는 이슈 처리
 @history 1.5.0 Support Window Phone8 지원
 @history 1.2.0 Support Chrome for Android 지원<br />
 갤럭시 S2 4.0.3 업데이트 지원
 @history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
 @history 0.9.0 Release 최초 릴리즈
 */
jindo.m.Touch = jindo.$Class({
    /* @lends jindo.m.Touch.prototype */
    /**
     초기화 함수

     @constructor
     @extends jindo.m.UIComponent
     @param {String | HTMLElement} vEl Touch이벤트를 분석할 타켓 엘리먼트 혹은 아이디.
     @param {Object} htOption 초기화 옵션 설정을 위한 객체.
     @param {Number} [htOption.nMomentumDuration=350] 가속에 대해 판단하는 기준시간(단위 ms)
     <ul>
     <li>touchstart, touchend 간격의 시간이 nMomentumDuration 보다 작을 경우 가속값을 계산한다.</li>
     <li>일반적으로 android가 iOS보다 반응 속도가 느리므로 iOS보다 큰값을 세팅한다.</li>
     <li>android의 경우 500~1000 정도가 적당하다.</li>
     <li>iOS의 경우 200~350이 적당하다.</li>
     </ul>
     @param {Number} [htOption.nMoveThreshold=7] touchMove 커스텀 이벤트를 발생시키는 최소 단위 움직임 픽셀
     <ul>
     <li>세로모드의 스크롤 작업일 경우 0~2 정도가 적당하다</li>
     <li>가로모드의 스크롤 작업일 경우 4~7 정도가 적당하다</li>
     </ul>
     @param {Number} [htOption.nSlopeThreshold=25] scroll 움직임에 대한 방향성(수직,수평,대각선)을 판단하는 움직인 거리
     <ul>
     <li>사용자가 터치를 시작한 이후에 25픽셀 이상 움직일 경우 scroll에 대한 방향을 판단한다.</li>
     <li>25픽셀이하로 움직였을 경우 방향성에 대해서 판단하지 않는다.</li>
     </ul>
     @param {Number} [htOption.nLongTapDuration=1000] 롱탭을 판단하는 기준 시간(단위ms)
     <ul>
     <li>600~1000정도의 값이 적당하다.</li>
     </ul>
     @param {Number} [htOption.nDoubleTapDuration=400] 더블탭을 판단하는 탭간의 기준 시간(단위ms)
     <ul>
     <li>이 값을 길게 설정하면 Tap 커스텀 이벤트의 발생이 늦어지기 때문에 1500 이상의 값은 세팅하지 않는것이 적당하다.</li>
     </ul>
     @param {Number} [htOption.nTapThreshold=6] tap에 대해 판단할때 최대 움직인 거리 (단위 px)
     <ul>
     <li>사용자 터치를 시작한 이후 수직,수평방향으로 nTapThreshold 이하로 움직였을때 tap이라고 판단한다.</li>
     <li>doubleTap을 사용할 경우에는 이 값을 좀더 크게 5~8 정도 설정하는 것이 적당하다.</li>
     <li>doubleTap을 사용하지 않을 때 iOS에서는 0~2정도 설정하는 것이 적당하다.</li>
     <li>doubleTap을 사용하지 않을 때 android에서는 4~6 정도 설정하는 것이 적당하다.</li>
     </ul>
     @param {Number} [htOption.nPinchThreshold=0.1] pinch를 판단하는 최소 scale 값
     <ul>
     <li>최초의 멀티터치간의 거리를 1의 비율로 보았을때 움직이는 터치간의 간격이 이 값보다 크거나 작게 변하면 pinch로 분석한다.</li>
     </ul>
     @param {Number} [htOption.nRotateThreshold=5] rotate 판단하는 최소 angle 값
     <ul>
     <li>0일경우 강제로 touchend 이벤트를 발생시키지 않는다.</li>
     </ul>
     @param {Boolean} [htOption.bActivateOnload=true] Touch 컴포넌트가 로딩 될때 활성화 시킬지 여부를 결정한다.<br />false로 설정하는 경우에는 oTouch.activate()를 호출하여 따로 활성화 시켜야 한다.
    @param {Number} [htOption.nUseDiagonal=0] 자유이동 옵션 (0 : 자유이동 불가 , 1 : 대각선시에만 자유이동 가능, 2 : 항상 자유이동 가능)
    @param {Boolean} [htOption.bUseAutoDirection=false] 사용자의 이동에 따라 동적으로 방향이 결정된다.
     */
    $init : function(sId, htUserOption) {
        this._el = jindo.$Element(sId).$value();

        var htDefaultOption = {
            nMomentumDuration : 350,
            nMoveThreshold : 7,
            nSlopeThreshold : 25,
            nLongTapDuration : 1000,
            nDoubleTapDuration : 400,
            nTapThreshold : 6,
            nPinchThreshold : 0.1,
            nRotateThreshold : 5,
            // nEndEventThreshold : 0,
            bActivateOnload : true,

            bUseAutoDirection : false,

            nUseDiagonal : 0, // 0 : 자유이동 불가 , 1 : 대각선시에만 자유이동 가능), 2 : 항상 자유이동 가능)
            // bVertical : true,                // private
            // bHorizental : false          // private

            // bVertical : false,               // private
            // bHorizental : true       // private

            bVertical : true, // private
            bHorizental : false  // private
        };

        this.option(htDefaultOption);
        this.option(htUserOption || {});

        // 대각선 모드를 사용할때 vertical, horizental 을 강제로 셋팅한다.
        if (this.option("nUseDiagonal") > 0) {
            this.option({
                "bVertical" : true,
                "bHorizental" : true
            });
        }

        this._initVariable();
        this._initTouchEventName();
        this._initPreventSystemEvent();
        this._setSlope();

        //활성화
        if (this.option("bActivateOnload")) {
            this.activate();
            //컴포넌트를 활성화한다.
        }
    },

    $static : {
        /** MOVE 타입 */
        MOVETYPE : {
            0 : 'hScroll',
            1 : 'vScroll',
            2 : 'dScroll',
            3 : 'tap',
            4 : 'longTap',
            5 : 'doubleTap',
            6 : 'pinch',
            7 : 'rotate',
            8 : 'pinch-rotate'
        }
    },

    _initTouchEventName : function() {
        if ('ontouchstart' in window) {
            this._htEventName.start = 'touchstart';
            this._htEventName.move = 'touchmove';
            this._htEventName.end = 'touchend';
            this._htEventName.cancel = 'touchcancel';
            this._hasTouchEvent = true;
        } else if (window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 0) {
            this._htEventName.start = 'MSPointerDown';
            this._htEventName.move = 'MSPointerMove';
            this._htEventName.end = 'MSPointerUp';
            this._htEventName.cancel = 'MSPointerCancel';
            this._hasTouchEvent = false;
        }
    },

    _initPreventSystemEvent : function() {
        // MS 대응
        if (this._el.style && typeof this._el.style.msTouchAction != 'undefined') {
            var type = "none";
            if (this.option("bHorizental") && !this.option("bVertical")) {
                type = "pan-x";
                //세로 막음
            }
            if (this.option("bVertical") && !this.option("bHorizental")) {
                type = "pan-y";
                //가로 막음
            }
            this._el.style.msTouchAction = type;
        }
    },

    // 시스템 이벤트를 막음
    _preventSystemEvent : function(we, htParam) {
        // we.stop();
        var nMoveType = this.nMoveType;

        switch(nMoveType) {
            case 0 :
                // 수평이동시
                if (this.option("bHorizental") || this.option("bUseAutoDirection")) {

                    // 수평스크롤인 경우 시스템 스크롤 막고, 컴포넌트 기능 수행
                    // we.stop();
                }
                // we.stop(jindo.$Event.CANCEL_DEFAULT);
                break;
            case 1 :
                //수직이동시
                if (this.option("bVertical") || this.option("bUseAutoDirection")) {
                    // we.stop();
                    // return false;
                }
                break;
            case 2 :
                if (this.option("bUseAutoDirection") || this.option("bVertical") || this.option("bHorizental")) {
                    // we.stop();
                }
                break;
            default :
                // we.stop();
                break;
        }
        return true;
    },

    /**
     jindo.m.Touch 인스턴스 변수를 초기화한다.
     **/
    _initVariable : function() {
        this._htEventName = {
            start : 'mousedown',
            move : 'mousemove',
            end : 'mouseup',
            cancel : null
        };
        this._hasTouchEvent = false;
        this._radianToDegree = 180 / Math.PI;
        this._htMoveInfo = {
            nStartX : 0,
            nStartY : 0,
            nBeforeX : 0,
            nBeforeY : 0,
            nStartTime : 0,
            nBeforeTime : 0,
            nStartDistance : 0,
            nBeforeDistance : 0,
            nStartAngle : 0,
            nLastAngle : 0,
            nBeforeScale : 0,
            aPos : []
        };
        this.htEndInfo = {
            nX : 0,
            nY : 0
        };

        this.nStart = 0;
        this.bMove = false;
        this.nMoveType = -1;
        this._nStartMoveType = -1;
        this._nVSlope = 0;
        this._nHSlope = 0;
        this.bSetSlope = false;
        // this._supportMulti = !(jindo.m.getOsInfo().android && (parseInt(jindo.m.getOsInfo().version,10) < 4));
    },

    /**
     jindo.m.Touch 사용하는 이벤트 attach 한다
     **/
    _attachEvents : function() {
        this._htEvent = {};
        var bTouch = this._hasTouchEvent;

        this._htEvent[this._htEventName.start] = {
            fn : jindo.$Fn(this._onStart, this).bind(),
            el : this._el
        };

        this._htEvent[this._htEventName.move] = {
            fn : jindo.$Fn(this._onMove, this).bind(),
            el : this._el
        };

        this._htEvent[this._htEventName.end] = {
            fn : jindo.$Fn(this._onEnd, this).bind(),
            el : this._el
        };

        //resize event
        this._htEvent["rotate"] = jindo.$Fn(this._onResize, this).bind();
        jindo.m.bindRotate(this._htEvent["rotate"]);

        if (this._htEventName.cancel) {
            this._htEvent[this._htEventName.cancel] = {
                fn : jindo.$Fn(this._onCancel, this).bind(),
                el : this._el
            };
        }

        //attach events
        for (var p in this._htEvent) {
            if (this._htEvent[p].fn) {
                this._htEvent[p].ref = this._attachFakeJindo(this._htEvent[p].el, this._htEvent[p].fn, p);
            }
        }
    },

    /**
     MSPointerEvent 처럼 신규 이벤트들이 2.3.0이하 진도에서 attach안되는 문제를 해결하기 위한 코드
     jindo 2.4.0 이상 버전에서는 사용가능, 하위 버전에서는 _notSupport namespace  진도 사용
     @date 2012. 12.06
     @author oyang2
     @example
     jindo.m._attachFakeJindo(el, function(){alert('MSPointerDown'), 'MSPointerDown' });a
     */
    _attachFakeJindo : function(element, fn, sEvent) {
        var nVersion = (jindo.$Jindo.VERSION || jindo.$Jindo().version || jindo.VERSION).replace(/[a-z.]/gi, "");
        var wfn = null;
        if (nVersion < 230 && ( typeof _notSupport !== 'undefined')) {
            //use namespace jindo
            wfn = _notSupport.$Fn(fn).attach(element, sEvent);
        } else {
            //use jindo
            wfn = jindo.$Fn(fn).attach(element, sEvent);
        }
        return wfn;
    },

    /**
     jindo.m.Touch 사용하는 이벤트 detach 한다
     **/
    _detachEvents : function() {
        for (var p in this._htEvent) {
            var htTargetEvent = this._htEvent[p];
            if (htTargetEvent.ref) {
                htTargetEvent.ref.detach(htTargetEvent.el, p);
            }
        }
        jindo.m.unbindRotate(this._htEvent["rotate"]);
        this._htEvent = null;
    },

    /**
     touchcancel 발생시에 touchEnd이벤트로 바로 호출한다.
     ios3 에서는 클립보드 활성화 되면 바로 touchcancel 발생
     android 계열에서 빠르고 짧게 스크롤 하면 touchcancel 발생함
     @param {$Event}  jindo.$Event
     **/
    _onCancel : function(oEvent) {
        this._onEnd(oEvent);
    },

    /**
     touchstart(mousedown) 이벤트 핸들러
     @param {$Event}  jindo.$Event
     **/
    _onStart : function(oEvent) {
        // console.debug("touchstart", this.nStart);
        var htInfo = this._getTouchInfo(oEvent);
        // console.log(htInfo,  oEvent.$value().touches);
        this.nStart = htInfo.length;

        //멀티 터치인 경우, skip
        if(htInfo.length > 1) {
            return;
        } else {
            if(this.bMove) {
                this._resetTouchInfo();
            }
        }

        var htParam = {
            element : htInfo[0].el,
            nX : htInfo[0].nX,
            nY : htInfo[0].nY,
            oEvent : oEvent
        };

        /**
         사용자가 터치 영역에 터치하는 순간 발생한다.<br />가장 처음 발생하는 커스텀이벤트

         @event touchStart
         @param {String} sType 커스텀 이벤트명
         @param {HTMLElement} element 현재 터치된 영역의 Element
         @param {Number} nX 터치영역의 X좌표
         @param {Number} nY 터치 영역의 Y좌표
         @param {Object} oEvent jindo.$Event object
         @param {Function} stop 이후 모든 커스텀 이벤트를 중지한다.
         **/
        if (!this._fireCustomEvent('touchStart', htParam)) {
            return;
        }

        //touchstart 플래그 세팅
        this._updateTouchInfo(htInfo, "start");
        this._startLongTapTimer(htInfo, oEvent);
    },

    /**
     touchMove(mousemove) 이벤트 핸들러
     @param {$Event}  jindo.$Event
     **/
    _onMove : function(oEvent) {
        // console.log("touchmove", this.nStart);
        if(this.nStart <= 0) {
            return;
        }
        this.bMove = true;

        var htInfo = this._getTouchInfo(oEvent);
        // addConsole(htInfo.length);

        // MoveType 결정
        //싱글터치는 3,4 일때 다시 계산한다.
        if (htInfo.length === 1) {
            if (this.nMoveType < 0 || this.nMoveType == 3 || this.nMoveType == 4) {
                var nMoveType = this._getMoveType(htInfo);
                if (!((this.nMoveType == 4) && (nMoveType == 3))) {
                    if(this.option("nUseDiagonal") == 2 && ( nMoveType == 0 || nMoveType == 1 )){
                        this._nStartMoveType = nMoveType;
                        this.nMoveType = 2;
                    }else{
                        this.nMoveType = this._nStartMoveType = nMoveType;
                    }
                }
            }
        } else {//멀티터치일경우 8번이 아니면 다시 계산한다.
            if (this.nMoveType !== 8) {
                this.nMoveType = this._nStartMoveType = this._getMoveType(htInfo);
            }
        }
        //커스텀 이벤트에 대한 파라미터 생성.
        var htParam = this._getCustomEventParam(htInfo,  false, oEvent);

        //longtap timer 삭제
        (this.nMoveType != 3) && this._deleteLongTapTimer();

        var nDis = 0;
        if (this.nMoveType == 0) {//hScroll일 경우
            nDis = Math.abs(htParam.nDistanceX);
        } else if (this.nMoveType == 1) {//vScroll일 경우
            nDis = Math.abs(htParam.nDistanceY);
        } else {//dScroll 일 경우
            nDis = Math.abs(Math.sqrt(Math.pow(htParam.nDistanceX, 2) + Math.pow(htParam.nDistanceY, 2)));
        }

        //move간격이 옵션 설정 값 보다 작을 경우에는 커스텀이벤트를 발생하지 않는다 && 방향성이 정해지면 무시한다.
        if ( (nDis < this.option('nMoveThreshold') || nDis <  this.option('nSlopeThreshold')) && (this.nMoveType < 0 || this.nMoveType > 2) ) {
            return;
        }
        // this._preventSystemEvent(oEvent, htParam);
        this._updateTouchInfo(htInfo, "move");

        /**
         nMoveThreshold 옵션값 이상 움직였을 경우 발생한다

         @event touchMove
         @param {String} sType 커스텀 이벤트명
         @param {String} sMoveType 현재 분석된 움직임
         @param {String} sMoveType.hScroll 가로스크롤 (jindo.m.Touch.MOVETYPE[0])
         @param {String} sMoveType.vScroll 세로스크롤 (jindo.m.Touch.MOVETYPE[1])
         @param {String} sMoveType.dScroll 대각선스크롤 (jindo.m.Touch.MOVETYPE[2])
         @param {String} sMoveType.tap 탭 (jindo.m.Touch.MOVETYPE[3])
         @param {String} sMoveType.longTap 롱탭 (jindo.m.Touch.MOVETYPE[4])
         @param {String} sMoveType.doubleTap 더블탭 (jindo.m.Touch.MOVETYPE[5])
         @param {String} sMoveType.pinch 핀치 (jindo.m.Touch.MOVETYPE[6])
         @param {String} sMoveType.rotate 회전 (jindo.m.Touch.MOVETYPE[7])
         @param {String} sMoveType.pinch-rotate 핀치와 회전 (jindo.m.Touch.MOVETYPE[8])
         @param {String} sMoveTypeAgree 현재 이동 방향과 설정한 방향이 맞는지 여부
         @param {HTMLElement} element 현재 터치된 영역의 Element
         @param {Number} nX 터치영역의 X좌표
         @param {Number} nY 터치 영역의 Y좌표
         @param {Array} aX 모든 터치 영역의 X좌표
         @param {Array} aY 모든 터치 영역의 Y좌표
         @param {Number} nVectorX 이전 touchMove(혹은 touchStart)의 X좌표와의 상대적인 거리.(직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
         @param {Number} nVectorY 이전 touchMove(혹은 touchStart)의 Y좌표와의 상대적인 거리.(직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
         @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리.(touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
         @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리.(touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
         @param {Number} nStartX touchStart의 X좌표
         @param {Number} nStartY touchStart의 Y좌표
         @param {Number} nStartTimeStamp touchStart의 timestamp 값
         @param {Number} nScale 멀티터치일경우 계산된 scale값 (싱글터치의 경우 이 프로퍼티가 없다)
         @param {Number} nRotation 멀티터치일경우 계산된 rotation값 (싱글터치의 경우 이 프로퍼티가 없다)
         @param {Object} oEvent jindo.$Event object
         @param {Array} aElement touchMove 이벤트 발생시 대상 엘리먼트
         @param {String} sStartMoveType 최초 분석된 움직임 값
         @param {Object} htMomentum 최근 이동한 정보를 통해 발생점으로 부터 이전 정보까지로 부터의 momentum 정보
            @param {Number} htMomentum.nDistanceX touchStart의 X좌표와의 상대적인 거리.(touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
            @param {Number} htMomentum.nDistanceY touchStart의 Y좌표와의 상대적인 거리.(touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
            @param {Number} htMomentum.nDuration touchstart와 이동한 좌표 사이의 시간값

         @param {Function} stop stop 이후 커스텀이벤트는 발생하지 않는다.
         @history 1.14.0 Update touchMove, touchEnd Custom Event 내 htMomentum 속성 추가
         **/
        htParam.sMoveTypeAgree = false;
        var sMoveType = htParam.sMoveType; // hScroll
        var nVectorX = Math.abs(htParam.nVectorX); // 3

        var bHorizentalMove = (this.option("bHorizental") && sMoveType == jindo.m.Touch.MOVETYPE[0]);
        // && nVectorX > 0);
        var bVerticalMove = (this.option("bVertical") && sMoveType == jindo.m.Touch.MOVETYPE[1]);
        // && Math.abs(htParam.nVectorY) > 0);
        var bUseDiagonalMove = (this.option("nUseDiagonal") == 1 && sMoveType == jindo.m.Touch.MOVETYPE[2]);
        var bFreeMove = this.option("nUseDiagonal") == 2;

        if (
        // 가로모드이면서 X 이동 거리가 0이상인 경우
        (
            bHorizentalMove ||
            // 세로모드이면서 Y 이동 거리가 0이상인 경우
            bVerticalMove ||
            // 대각선 모드이면서 moveType 이 dScroll 인 경우
            bUseDiagonalMove
        ) ||
        // 자유로운 대각선 모드 인 경우
        bFreeMove) {
            // htParam.sMoveType = jindo.m.Touch.MOVETYPE[2];

            htParam.sMoveTypeAgree = true;

        }

        if (!this.fireEvent('touchMove', htParam)) {
            this.nStart = 0;
            return;
        }
    },

    /**
     touchend(mouseup) 이벤트 핸들러
     @param {$Event}  jindo.$Event
     **/
    _onEnd : function(oEvent) {
        var htInfo = this._getTouchInfo(oEvent);
        this.nStart-=htInfo.length;
        if (this.nStart > 0) {
            return;
        }
        var self = this;
        this._deleteLongTapTimer();

        //touchMove이벤트가 발생하지 않고 현재 롱탭이 아니라면 tap으로 판단한다.
        if (!this.bMove && (this.nMoveType != 4)) {
            this.nMoveType = 3;
        }

        //touchEnd 시점에 판단된  moveType이 없으면 리턴한다.
        // if (this.nMoveType < 0) {
        //     return;
        // }

        //현재 touchEnd시점의 타입이 doubleTap이라고 판단이 되면
        if (this._isDblTap(htInfo[0].nX, htInfo[0].nY, htInfo[0].nTime)) {
            clearTimeout(this._nTapTimer);
            this._nTapTimer = -1;
            this.nMoveType = 5;
            //doubleTap 으로 세팅
        }

        this._updateTouchInfo(htInfo, "end");
        // TapThreshold 와 nSlopeThreshold 옵션 값 사이의 움직임에 대해서는 MoveType 값이 정의되지 않는 이슈.

        //커스텀 이벤트에 대한 파라미터 생성.
        var htParam = this._getCustomEventParam(htInfo, true, oEvent);
        var sMoveType = htParam.sMoveType;
        /**
         nMoveThreshold 옵션값 이상 움직였을 경우 발생한다

         @event touchEnd
         @param {String} sType 커스텀 이벤트명
         @param {String} sMoveType 현재 분석된 움직임
         @param {String} sMoveType.hScroll 가로스크롤 (jindo.m.Touch.MOVETYPE[0])
         @param {String} sMoveType.vScroll 세로스크롤 (jindo.m.Touch.MOVETYPE[1])
         @param {String} sMoveType.dScroll 대각선스크롤 (jindo.m.Touch.MOVETYPE[2])
         @param {String} sMoveType.tap 탭 (jindo.m.Touch.MOVETYPE[3])
         @param {String} sMoveType.longTap 롱탭 (jindo.m.Touch.MOVETYPE[4])
         @param {String} sMoveType.doubleTap 더블탭 (jindo.m.Touch.MOVETYPE[5])
         @param {String} sMoveType.pinch 핀치 (jindo.m.Touch.MOVETYPE[6])
         @param {String} sMoveType.rotate 회전 (jindo.m.Touch.MOVETYPE[7])
         @param {String} sMoveType.pinch-rotate 핀치와 회전 (jindo.m.Touch.MOVETYPE[8])
         @param {HTMLElement} element 현재 터치된 영역의 Element
         @param {Number} nX 터치영역의 X좌표
         @param {Number} nY 터치 영역의 Y좌표
         @param {Array} aX 모든 터치 영역의 X좌표
         @param {Array} aY 모든 터치 영역의 Y좌표
         @param {Number} nVectorX 이전 touchMove(혹은 touchStart)의 X좌표와의 상대적인 거리.(직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
         @param {Number} nVectorY 이전 touchMove(혹은 touchStart)의 Y좌표와의 상대적인 거리.(직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
         @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리.(touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
         @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리.(touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
         @param {Number} nStartX touchStart의 X좌표
         @param {Number} nStartY touchStart의 Y좌표
         @param {Number} nStartTimeStamp touchStart의 timestamp 값
         @param {Number} nScale 멀티터치일경우 계산된 scale값 (싱글터치의 경우 이 프로퍼티가 없다)
         @param {Number} nRotation 멀티터치일경우 계산된 rotation값 (싱글터치의 경우 이 프로퍼티가 없다)
         @param {Object} oEvent jindo.$Event object
         @param {Function} stop stop 이후 커스텀이벤트는 발생하지 않는다.
         @param {Array} aElement touchMove 이벤트 발생시 대상 엘리먼트
         @param {String} sStartMoveType 최초 분석된 움직임 값
         @param {Number} nMomentumX x 좌표의 가속 값
         @param {Number} nMomentumY y 좌표의 가속 값
         @param {Number} nSpeedX x 좌표의 속도값
         @param {Number} nSpeedY y 좌표의 속도값
         @param {Number} nDuration touchstart와 touchEnd사이의 시간값
         @param {Object} htMomentum 최근 이동한 정보를 통해 발생점으로 부터 이전 정보까지로 부터의 momentum 정보
             @param {Number} htMomentum.nDistanceX touchStart의 X좌표와의 상대적인 거리.(touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
             @param {Number} htMomentum.nDistanceY touchStart의 Y좌표와의 상대적인 거리.(touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
             @param {Number} htMomentum.nDuration touchstart와 이동한 좌표 사이의 시간값
             @param {Number} htMomentum.nMomentumX x 좌표의 가속 값
             @param {Number} htMomentum.nMomentumY y 좌표의 가속 값
             @param {Number} htMomentum.nSpeedX X 좌표의 속도값
             @param {Number} htMomentum.nSpeedY y 좌표의 속도값

         @history 1.14.0 Update touchMove, touchEnd Custom Event 내 htMomentum 속성 추가
         **/
        //doubletap 핸들러가  있고, 현재가  tap 인 경우
        if (( typeof this._htEventHandler[jindo.m.Touch.MOVETYPE[5]] != 'undefined' && (this._htEventHandler[jindo.m.Touch.MOVETYPE[5]].length > 0)) && (this.nMoveType == 3)) {
            this._nTapTimer = setTimeout(function() {
                self._fireCustomEvent(sMoveType, htParam);
                self.fireEvent('touchEnd', htParam);
                delete self._nTapTimer;
            }, this.option('nDoubleTapDuration'));
        } else {
            this.fireEvent('touchEnd', htParam);
            if (this.nMoveType != 4) {
                if (this.nMoveType === 8) {
                    htParam.sMoveType = jindo.m.Touch.MOVETYPE[6];
                    this._fireCustomEvent(jindo.m.Touch.MOVETYPE[6], htParam);
                    htParam.sMoveType = jindo.m.Touch.MOVETYPE[7];
                    this._fireCustomEvent(jindo.m.Touch.MOVETYPE[7], htParam);
                } else {
                    setTimeout(function() {
                        self._fireCustomEvent(sMoveType, htParam);
//                        self.fireEvent('touchEnd', htParam);
                    }, 0);
                }
            }
        }

        this._updateTouchEndInfo(htInfo);
        this._resetTouchInfo();
    },

    /**
     * sEvent 명으로 커스텀 이벤트를 발생시킨다
     * @param {String} sEvent
     * @param {HashTable} 커스텀이벤트 파라미터
     * @return {Boolean} fireEvent의 리턴값
     */
    _fireCustomEvent : function(sEvent, htOption) {
        return this.fireEvent(sEvent, htOption);
    },

    /**
     커스텀이벤트를 발생시킬 때 필요한 파라미터를 생성한다.

     @param {Object} 현재 터치 정보들을 담고 있는 해시테이블
     @param {Boolean} touchEnd 시점인지 여부, touchEnd일 경우 가속에 대한 추가 정보를 필요로 한다.
     @return {Object}
     - {HTMLElement} element 현재 이벤트 객체의 대상 엘리먼트
     - {Number} nX x좌표
     - {Number} nY y좌표
     - {Number} nVectorX 이전 x 좌표와의 차이
     - {Number} nVectorY 이전 y 좌표와의 차이
     - {Number} nDistanceX touchstart와의 x 좌표 거리
     - {Number} nDistanceY touchstart와의 y 좌표 거리
     - {String} sMoveType 현재 분석된 움직임의 이름
     - {Number} nStartX touchstart시점의 x 좌표
     - {Number} nStartY touchstart시점의 y 좌표
     - {Number} nStartTimeStamp touchstart시점의 timestamp
     - {Number} nMomentumX x 좌표의 가속 값 (touchEnd일경우에만 발생)
     - {Number} nMomentumY y 좌표의 가속 값 (touchEnd일경우에만 발생)
     - {Number} nSpeedX x 좌표의 속도값 (touchEnd일경우에만 발생)
     - {Number} nSpeedY y 좌표의 속도값 (touchEnd일경우에만 발생)
     - {Number} nDuration touchstart와 touchEnd사이의 시간값
     - {String} sStartMoveType 초기 움직임을 설정한 값
     - {Array} aX 터치지점의 x 좌표
     - {Array} aY 터치지점의 y 좌표
     - {Number} nScale 멀티터치일경우 계산된 scale값
     - {Number} nRotation 멀티터치일경우 계산된 rotate값

     @history 1.14.0 Update touchMove, touchEnd Custom Event 내 htMomentum 속성 추가

     **/
    _getCustomEventParam : function(htTouchInfo, bTouchEnd, we) {
        // console.log("------- > " , htTouchInfo[0].nTime - this._htMoveInfo.nStartTime);
        var htMoveInfoPos = this._htMoveInfo.aPos[(this._htMoveInfo.aPos.length > 0 && !bTouchEnd ? this._htMoveInfo.aPos.length - 1 : 0)];
        var sMoveType = jindo.m.Touch.MOVETYPE[this.nMoveType],
        sStartMoveType = jindo.m.Touch.MOVETYPE[this._nStartMoveType],
        nDuration = htTouchInfo[0].nTime - this._htMoveInfo.nStartTime,
        nMomentumX = 0,
        nMomentumY = 0,
        nSpeedX = 0,
        nSpeedY = 0,
        nMMomentumX = 0,
        nMMomentumY = 0,
        nMSpeedX = 0,
        nMSpeedY = 0,
        nDisX = (this.nMoveType === 1) ? 0 : htTouchInfo[0].nX - this._htMoveInfo.nStartX,
        nDisY = (this.nMoveType === 0) ? 0 : htTouchInfo[0].nY - this._htMoveInfo.nStartY,
        nMomentumDisX = (this.nMoveType === 1) ? 0 : htTouchInfo[0].nX - htMoveInfoPos.nX,
        nMomentumDisY = (this.nMoveType === 0) ? 0 : htTouchInfo[0].nY - htMoveInfoPos.nY,
        nMomentumDuration = htTouchInfo[0].nTime - htMoveInfoPos.nTime,
        htParam = {
            element : htTouchInfo[0].el,
            nX : htTouchInfo[0].nX,
            nY : htTouchInfo[0].nY,
            nVectorX : htTouchInfo[0].nX - this._htMoveInfo.nBeforeX,
            nVectorY : htTouchInfo[0].nY - this._htMoveInfo.nBeforeY,
            nDistanceX : nDisX, //vScroll,
            nDistanceY : nDisY, //hScroll,
            sMoveType : sMoveType,
            sStartMoveType : sStartMoveType,
            nStartX : this._htMoveInfo.nStartX,
            nStartY : this._htMoveInfo.nStartY,
            nStartTimeStamp : this._htMoveInfo.nStartTime,
            htMomentum : {                                  // momentum 개선을 위한 추가.
                // nStartX : htMoveInfoPos.nX,
                // nStartY : htMoveInfoPos.nY,
                nDistanceX : nMomentumDisX, //vScroll,
                nDistanceY : nMomentumDisY, //hScroll,
                nDuration : nMomentumDuration
            },
            oEvent : we || {}
        };

        // 멀티 터치시 처리
        if ((htTouchInfo.length) > 1 || (this.nMoveType >= 6)) {
            htParam.nScale = this._getScale(htTouchInfo);
            htParam.nRotation = this._getRotation(htTouchInfo);
            (htParam.nScale === null) && (htParam.nScale = this._htMoveInfo.nBeforeScale);
            (htParam.nRotation === null) && (htParam.nRotation = this._htMoveInfo.nBeforeRotation);
        }

        if (htTouchInfo.length >= 1) {
            htParam.aX = [];
            htParam.aY = [];
            htParam.aElement = [];
            for (var i = 0, nLen = htTouchInfo.length; i < nLen; i++) {
                htParam.aX.push(htTouchInfo[i].nX);
                htParam.aY.push(htTouchInfo[i].nY);
                htParam.aElement.push(htTouchInfo[i].el);
            }
        }
        //touchend 에는 가속에 대한 계산값을 추가로 더 필요로 한다.
        if (bTouchEnd) {
            // console.log("============" , this.nMoveType);
            //scroll 이벤트만 계산 한다
            if (this.nMoveType == 0 || this.nMoveType == 1 || this.nMoveType == 2) {
                // console.log(nDuration);
                if (nDuration <= this.option('nMomentumDuration')) {
                    // momentum 만들기
                // } else {
                    // if (this._htMoveInfo.aPos.length > 1) {
                        // // this._htMoveInfo.aPos[this._htMoveInfo.aPos.length-1]
                        // // nDuration = htTouchInfo[0].nTime - this._htMoveInfo.nStartTime,
                    // }

                    // this._htMoveInfo.aPos.this._htMoveInfo.aPos.length
                }
                if (nDuration <= this.option('nMomentumDuration')) {
                    nSpeedX = Math.abs(nDisX) / nDuration;
                    nMomentumX = (nSpeedX * nSpeedX) / 2;
                    nSpeedY = Math.abs(nDisY) / nDuration;
                    nMomentumY = (nSpeedY * nSpeedY) / 2;
                }
                if(nMomentumDuration <= this.option('nMomentumDuration')) {
                    nMSpeedX = Math.abs(nMomentumDisX) / nMomentumDuration;
                    nMMomentumX = (nMSpeedX * nMSpeedX) / 2;
                    nMSpeedY = Math.abs(nMomentumDisY) / nMomentumDuration;
                    nMMomentumY = (nMSpeedY * nMSpeedY) / 2;
                }
            }
            htParam.nMomentumX = nMomentumX;
            htParam.nMomentumY = nMomentumY;
            htParam.nSpeedX = nSpeedX;
            htParam.nSpeedY = nSpeedY;
            htParam.nDuration = nDuration;
            htParam.htMomentum.nMomentumX = nMMomentumX;
            htParam.htMomentum.nMomentumY = nMMomentumY;
            htParam.htMomentum.nSpeedX = nMSpeedX;
            htParam.htMomentum.nSpeedY = nMSpeedY;
        }

        return htParam;
    },

    /**
        doubleTap을 판단하기 위해서 마지막 touchend의 정보를 업데이트 한다.
        doubleTap을 분석 할 경우 가장 마지막의 touch에 대한 정보를 비교해야 하기 때문에 이 값을 업데이트 한다.

        @param {Object} touchEnd에서의 좌표 및 엘리먼트 정보 테이블
            - {HTMLElement} touchEnd시점의 엘리먼트
            - {Number} touchEnd timestamp
            - {Number} touchEnd의 x 좌표
            - {Number} touchEnd의 y 좌표
    **/
    _updateTouchEndInfo : function(htInfo){
        this.htEndInfo = {
            element: htInfo[0].el,
            time : htInfo[0].nTime,
            movetype : this.nMoveType,
            nX : htInfo[0].nX,
            nY : htInfo[0].nY
        };
    },

    /**
     longTap 타이머를 삭제한다.
     **/
    _deleteLongTapTimer : function() {
        if(typeof this._nLongTapTimer != 'undefined'){
            clearTimeout(this._nLongTapTimer);
            delete this._nLongTapTimer;
        }
    },

    /**
     longTap 커스텀 핸들러가 존재 할 경우 longTap 타이머를 시작한다.

     @param {Object} longTap에 대한 정보 객체
     @param {Object} event 객체
     **/
    _startLongTapTimer : function(htInfo, oEvent) {
        var self = this;

        //long tap handler 가 있을경우
        if (( typeof this._htEventHandler[jindo.m.Touch.MOVETYPE[4]] != 'undefined') && (this._htEventHandler[jindo.m.Touch.MOVETYPE[4]].length > 0)) {
            self._nLongTapTimer = setTimeout(function() {

                /**
                 사용자의 터치 시작 이후로 일정 기준시간 동안 계속 움직임이 tap으로 분석되면 발생 한다.

                 @event longTap
                 @param {String} sType 커스텀 이벤트명
                 @param {HTMLElement} element 현재 터치된 영역의 Element
                 @param {Number} nX 터치영역의 X좌표
                 @param {Number} nY 터치 영역의 Y좌표
                 @param {Object} oEvent jindo.$Event object
                 @param {Function} stop stop를 호출하여 영향 받는 것이 없다.
                 **/
                self.fireEvent('longTap', {
                    element : htInfo[0].el,
                    oEvent : oEvent,
                    nX : htInfo[0].nX,
                    nY : htInfo[0].nY
                });
                //현재 moveType 세팅
                self.nMoveType = 4;
            }, self.option('nLongTapDuration'));
        }
    },

    /**
     화면 전환시에 스크롤 기준 값을 다시 구한다.
     **/
    _onResize : function() {
        this._setSlope();
    },

    /**
     이전 탭의 정보와 비교하여 현재 동작이 더블탭임을 판단한다
     @param {Number} nX pageX 좌표
     @param {Number} nY pageY 좌표
     @param {Number} nTimeStamp 이벤트 timestamp
     **/
    _isDblTap : function(nX, nY, nTime) {
        if((typeof this._nTapTimer != 'undefined') && this.nMoveType == 3){
            var nGap = this.option('nTapThreshold');
            if ((Math.abs(this.htEndInfo.nX - nX) <= nGap) && (Math.abs(this.htEndInfo.nY - nY) <= nGap)) {
                return true;
            }
        }
        return false;
    },

    /**
     vScroll, hScroll을 판단하는 기준 기울기를 계산한다
     단말기 스크린을 기준으로 계산한다

     hScroll = (세로/2)/가로
     vScroll = 세로/(가로/2)
     **/
    _setSlope : function() {
        if (!this.bSetSlope) {
            this._nHSlope = ((window.innerHeight / 2) / window.innerWidth).toFixed(2) * 1;
            this._nVSlope = (window.innerHeight / (window.innerWidth / 2)).toFixed(2) * 1;
        }
    },

    /**
     vScroll, hScroll을 판단하는 기준 기울기를 설정한다.

     @method setSlope
     @param {Number} nVSlope 수직스크롤 판단 기울기
     @param {Number} nHSlope 수평스크롤 판단 기울기
     @remark
     nVSlope 기울기 보다 클 경우 수직 스크롤로 판단한다.
     nHSlope 기울기 보다 작을 경우 수평 스크롤로 판단한다.
     nVSlope와 nHSlope 사이값인 경우 대각선 스크롤로 판단한다.
     **/
    setSlope : function(nVSlope, nHSlope) {
        this._nHSlope = nHSlope;
        this._nVSlope = nVSlope;

        this.bSetSlope = true;
    },

    /**
     vScroll, hScroll을 판단하는 기준 기울기를 리턴한다

     @method getSlope
     @return {Object} elBody 아코디언 블럭의 body 엘리먼트
     @remark
     - {Number} nVSlope 수직스크롤 판단 기울기
     - {Number} nHSlope 수평스크롤 판단 기울기
     **/
    getSlope : function() {
        return {
            nVSlope : this._nVSlope,
            nHSlope : this._nHSlope
        };
    },

    /**
     터치의 기본정보를 모두 초기화 한다.
     **/
    _resetTouchInfo : function() {
        for (var x in this._htMoveInfo) {
            if (x != "aPos") {
                this._htMoveInfo[x] = 0;
            } else {
                this._htMoveInfo.aPos.length = 0;
            }
        }
        this._deleteLongTapTimer();
        this.nStart = 0;
        this.bMove = false;
        this.nMoveType = -1;
        this._nStartMoveType = -1;
    },

    _updateTouchInfo : function(htInfo, sType) {

        if (sType == "end") {
            this.htEndInfo = {
                nX : htInfo[0].nX,
                nY : htInfo[0].nY
            };
            if (this._htMoveInfo.aPos.length > 3) {
                // this._htMoveInfo.aPos.pop();
                this._htMoveInfo.aPos.pop();
            }
        } else {
            if (sType == "start") {
                this._htMoveInfo.nStartX = htInfo[0].nX;
                this._htMoveInfo.nStartY = htInfo[0].nY;
                this._htMoveInfo.nStartTime = htInfo[0].nTime;
            } else {
                this._htMoveInfo.nBeforeTime = htInfo[0].nTime;
            }

            this._htMoveInfo.nBeforeX = htInfo[0].nX;
            this._htMoveInfo.nBeforeY = htInfo[0].nY;

            this._htMoveInfo.aPos.push({
                nX : htInfo[0].nX,
                nY : htInfo[0].nY,
                nTime : htInfo[0].nTime
            });
            // 5개만 유지하는 queue
            (this._htMoveInfo.aPos.length > 5) && this._htMoveInfo.aPos.shift();

        }
    },

    /**
     현재 x,y 좌표값으로 현재 움직임이 무엇인지 판단한다.
     @param {Number} x
     @param {Number} y
     **/
    _getMoveTypeBySingle : function(x, y) {
        // console.trace();
        var nType = this.nMoveType;

        var nX = Math.abs(this._htMoveInfo.nStartX - x);
        var nY = Math.abs(this._htMoveInfo.nStartY - y);
        // var nX = Math.abs(this._htMoveInfo.aPos[0].nX - x);
        // var nY = Math.abs(this._htMoveInfo.aPos[0].nY - y);
        // console.log(nX, nY)
        var nDis = nX + nY;
        // console.log(nDis);
        //tap정의
        var nGap = this.option('nTapThreshold');
        if ((nX <= nGap) && (nY <= nGap)) {
            nType = 3;
        } else {
            nType = -1;
        }

        if (this.option('nSlopeThreshold') <= nDis) {
//            var nSlope = nY/(nX+nY)*90;
            var nSlope = parseFloat((nY / nX).toFixed(2), 10);

            if ((this._nHSlope === -1) && (this._nVSlope === -1) && this.option("nUseDiagonal") > 0) {
                nType = 2;
            } else {
                if (nSlope <= this._nHSlope) {
//                if (nSlope <= 25) {
                    nType = 0;
                } else if (nSlope >= this._nVSlope) {
//                } else if (nSlope >= 65) {
                    nType = 1;
                } else if (this.option("nUseDiagonal") > 1) {
                    nType = 2;
                } else {
                    nType = 2;
                }
            }
        // } else {
            // 이동 거리가 조건에 만족하지 않을경우 tab 으로 처리
            // nType = 3;
        }
        return nType;
    },
    /**

     **/
    _getMoveTypeByMulti : function(aPos) {
        var nType = -1;

        //console.log('scale : '+this._htMoveInfo.nBeforeScale);
        if ((this.nMoveType === 6) || Math.abs(1 - this._htMoveInfo.nBeforeScale) >= this.option('nPinchThreshold')) {
            nType = 6;
        }

        if ((this.nMoveType === 7) || Math.abs(0 - this._htMoveInfo.nBeforeRotation) >= this.option('nRotateThreshold')) {
            if (nType === 6) {
                nType = 8;
            } else {
                nType = 7;
            }
        }

        //멀티터치이면서 rotate도 아니고 pinch도 아닐경우
        if (nType === -1) {
            return this.nMoveType;
            //nType = this._getMoveTypeBySingle(aPos[0].nX, aPos[0].nY);
        }

        return nType;
    },

    /**

     **/
    _getScale : function(aPos) {
        var nScale = -1;

        var nDistance = this._getDistance(aPos);
        if (nDistance <= 0) {
            return null;
        }

        if (this._htMoveInfo.nStartDistance === 0) {
            nScale = 1;
            this._htMoveInfo.nStartDistance = nDistance;
        } else {
            nScale = nDistance / this._htMoveInfo.nStartDistance;
            //this._htMoveInfo.nBeforeDistance = nDistance;
        }

        this._htMoveInfo.nBeforeScale = nScale;

        return nScale;
    },

    _getRotation : function(aPos) {
        var nRotation = -1;

        var nAngle = this._getAngle(aPos);

        if (nAngle === null) {
            return null;
        }

        if (this._htMoveInfo.nStartAngle === 0) {
            this._htMoveInfo.nStartAngle = nAngle;
            nRotation = 0;
        } else {
            nRotation = nAngle - this._htMoveInfo.nStartAngle;
        }

        this._htMoveInfo.nLastAngle = nAngle;
        this._htMoveInfo.nBeforeRotation = nRotation;

        //console.log('rotate - ' + nRotation);
        return nRotation;
    },

    /**
     현재 x,y 좌표값으로 현재 움직임이 무엇인지 판단한다.
     @param {Number} x
     @param {Number} y
     **/
    _getMoveType : function(aPos) {
        var nType = this.nMoveType;

        if (aPos.length === 1) {
            nType = this._getMoveTypeBySingle(aPos[0].nX, aPos[0].nY);
        } else if (aPos.length === 2) {//pinch or rotate
            nType = this._getMoveTypeByMulti(aPos);
            //nType = 6;
        }

        return nType;
    },

    _getDistance : function(aPos) {
        if (aPos.length === 1) {
            return -1;
        }
        return Math.sqrt(Math.pow(Math.abs(aPos[0].nX - aPos[1].nX), 2) + Math.pow(Math.abs(aPos[0].nY - aPos[1].nY), 2));
    },

    _getAngle : function(aPos) {
        if (aPos.length === 1) {
            return null;
        }
        var deltaX = aPos[0].nX - aPos[1].nX, deltaY = aPos[0].nY - aPos[1].nY;

        var nAngle = Math.atan2(deltaY, deltaX) * this._radianToDegree;

        if (this._htMoveInfo.nLastAngle !== null) {
            var nDiff = Math.abs(this._htMoveInfo.nLastAngle - nAngle);
            var nNext = nAngle + 360;
            var nPrev = nAngle - 360;

            if (Math.abs(nNext - this._htMoveInfo.nLastAngle) < nDiff) {
                nAngle = nNext;
            } else if (Math.abs(nPrev - this._htMoveInfo.nLastAngle) < nDiff) {
                nAngle = nPrev;
            }
        }
        //console.log('angle : '+ nAngle);
        return nAngle;
    },

    /**
     touch 이벤트에서 필요한 좌표값과 엘리먼트, timestamp를 구한다
     @param {$Event} jindo.$Event
     @return {Array}
     **/
     _getTouchInfo : function(oEvent){
        var aReturn = [];
        var nTime = oEvent.$value().timeStamp;
        var oTouch = null;

        if(this._hasTouchEvent){
//             if(oEvent.type === 'touchend' || oEvent.type === 'touchcancel'){
//                oTouch = oEvent.$value().changedTouches;
//            }else{
//                oTouch = oEvent.$value().targetTouches || oEvent.$value().changedTouches;
//            }

            /**
             * touches: a list of all fingers currently on the screen.
             * targetTouches: a list of fingers on the current DOM element.
             * changedTouches: a list of fingers involved in the current event. For example, in a touchend event, this will be the finger that was removed.
             *
             * 참조아티클 : http://www.html5rocks.com/en/mobile/touch/
             **/
            oTouch = oEvent.$value().touches;
            oTouch = oTouch.length > 1 ? oTouch : oEvent.$value().changedTouches;
            for(var i=0, nLen = oTouch.length; i<nLen; i++){
                aReturn.push({
                    el : jindo.m.getNodeElement(oTouch[i].target),
                    nX : oTouch[i].pageX,
                    nY : oTouch[i].pageY,
                    nTime : nTime
                });
            }

        }else{
            aReturn.push({
                el : oEvent.element,
                nX : oEvent.pos().pageX,
                nY : oEvent.pos().pageY,
                nTime : nTime
            });
        }

        return aReturn;
    },

    /**
     기준엘리먼트를 el을 리턴한다.

     @method getBaseElement
     @return {HTMLElement} el 기준 엘리먼트
     **/
    getBaseElement : function(el) {
        return this._el;
    },

    /**
     jindo.m.Touch 컴포넌트를 비활성화한다.
     deactivate 실행시 호출됨
     **/
    _onDeactivate : function() {
        this._detachEvents();
    },

    /**
     jindo.m.Touch 컴포넌트를 활성화한다.
     activate 실행시 호출됨
     **/
    _onActivate : function() {
        this._attachEvents();
    },

    /**
     jindo.m.Touch 에서 사용하는 모든 객체를 release 시킨다.
     @method destroy
     **/
    destroy : function() {
        var p;
        this.deactivate();

        this._el = null;

        for (p in this._htMoveInfo) {
            this._htMoveInfo[p] = null;
        }
        this._htMoveInfo = null;

        for (p in this.htEndInfo) {
            this.htEndInfo[p] = null;
        }
        this.htEndInfo = null;

        this.nStart = 0;
        this.bMove = null;
        this.nMoveType = null;
        this._nStartMoveType = null;
        this._nVSlope = null;
        this._nHSlope = null;
        this.bSetSlope = null;
    }
    /**
     사용자의 터치가 끝난 이후에 움직임이 tap으로 분석되었을 경우 발생한다.(touchEnd이후에 발생)
     @remark 만약 doubleTap의 커스텀 이벤트 핸들러가 있는 경우 doubleTap에 대한 분석을 위해 touchEnd 이후에 기준 시간 이후에 tap이 발생한다

     @event tap
     @param {String} sType 커스텀 이벤트명
     @param {String} sMoveType 현재 분석된 움직임
     @param {String} sMoveType.hScroll 가로스크롤 (jindo.m.Touch.MOVETYPE[0])
     @param {String} sMoveType.vScroll 세로스크롤 (jindo.m.Touch.MOVETYPE[1])
     @param {String} sMoveType.dScroll 대각선스크롤 (jindo.m.Touch.MOVETYPE[2])
     @param {String} sMoveType.tap 탭 (jindo.m.Touch.MOVETYPE[3])
     @param {String} sMoveType.longTap 롱탭 (jindo.m.Touch.MOVETYPE[4])
     @param {String} sMoveType.doubleTap 더블탭 (jindo.m.Touch.MOVETYPE[5])
     @param {String} sMoveType.pinch 핀치 (jindo.m.Touch.MOVETYPE[6])
     @param {String} sMoveType.rotate 회전 (jindo.m.Touch.MOVETYPE[7])
     @param {String} sMoveType.pinch-rotate 핀치와 회전 (jindo.m.Touch.MOVETYPE[8])
     @param {HTMLElement} element 현재 터치된 영역의 Element
     @param {Number} nX 현재 터치영역의 X좌표
     @param {Number} nY 현재 터치 영역의 Y좌표
     @param {Number} nVectorX 이전 touchMove 혹은 touchStart의 X좌표와의 상대적인 거리(직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
     @param {Number} nVectorY 이전 touchMove 혹은 touchStart의 Y좌표와의 상대적인 거리(직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
     @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리 (touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
     @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리 (touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
     @param {Object} oEvent jindo.$Event object
     @param {Function} stop stop를 호출하여 영향 받는 것이 없다.
     **/

    /**
     tap과 tap사이의 발생간격이 기준 시간 이하일경우 발생한다.

     @event doubleTap
     @param {String} sType 커스텀 이벤트명
     @param {HTMLElement} element 현재 터치된 영역의 Element
     @param {Number} nX 터치영역의 X좌표
     @param {Number} nY 터치 영역의 Y좌표
     @param {Object} oEvent jindo.$Event object
     @param {Function} stop stop를 호출하여 영향 받는 것이 없다.
     **/

    /**
     사용자의 터치가 끝난 이후에 움직임이 수평 스크롤으로 분석되었을 경우 발생한다.
     @remark touchEnd이후에 발생.분석 기준의 픽셀 이하로 움직였을 경우에는 분석되지 않아서 커스텀 이벤트 발생하지 않는다.

     @event hScroll
     @param {String} sType 커스텀 이벤트명
     @param {HTMLElement} element 현재 터치된 영역의 Element
     @param {Number} nX 현재 터치영역의 X좌표
     @param {Number} nY 현재 터치 영역의 Y좌표
     @param {Array} aX 모든 터치 영역의 X좌표
     @param {Array} aY 모든 터치 영역의 Y좌표
     @param {Number} nVectorX 이전 touchMove 혹은 touchStart의 X좌표와의 상대적인 거리 (직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
     @param {Number} nVectorY 이전 touchMove 혹은 touchStart의 Y좌표와의 상대적인 거리 (직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
     @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리 (touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
     @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리 (touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
     @param {Number} nSpeedX 가속 발생 구간일 경우 현재 터치움직임의 수평방향 속도, 가속 구간이 아닐경우 0
     @param {Number} nSpeedY 가속 발생 구간일 경우 현재 터치움직임의 수직방향 속도, 가속 구간이 아닐경우 0
     @param {Number} nMomentumX 가속 발생 구간일 경우 현재 터치 움직임의 수평방향 운동에너지값,가속 구간이 아닐경우 0
     @param {Number} nMomentumY 가속 발생 구간일 경우 현재 터치 움직임의 수직방향 운동에너지값,가속 구간이 아닐경우 0
     @param {Number} nStartX touchStart의 X좌표
     @param {Number} nStartY touchStart의 Y좌표
     @param {Number} nStartTimeStamp touchStart의 timestamp 값
     @param {Object} oEvent jindo.$Event object
     @param {Function} stop stop를 호출하여 영향 받는 것이 없다.
     **/

    /**
     사용자의 터치가 끝난 이후에 움직임이 수직 스크롤으로 분석되었을 경우 발생한다.
     @remark touchEnd이후에 발생.분석 기준의 픽셀 이하로 움직였을 경우에는 분석되지 않아서 커스텀 이벤트 발생하지 않는다.

     @event vScroll
     @param {String} sType 커스텀 이벤트명
     @param {Number} element 현재 터치된 영역의 Element
     @param {Number} nX 현재 터치영역의 X좌표
     @param {Number} nY 현재 터치 영역의 Y좌표
     @param {Array} aX 모든 터치 영역의 X좌표
     @param {Array} aY 모든 터치 영역의 Y좌표
     @param {Number} nVectorX 이전 touchMove 혹은 touchStart의 X좌표와의 상대적인 거리 (직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
     @param {Number} nVectorY 이전 touchMove 혹은 touchStart의 Y좌표와의 상대적인 거리 (직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
     @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리 (touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
     @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리 (touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
     @param {Number} nSpeedX 가속 발생 구간일 경우 현재 터치움직임의 수평방향 속도, 가속 구간이 아닐경우 0
     @param {Number} nSpeedY 가속 발생 구간일 경우 현재 터치움직임의 수직방향 속도, 가속 구간이 아닐경우 0
     @param {Number} nMomentumX 가속 발생 구간일 경우 현재 터치 움직임의 수평방향 운동에너지값,가속 구간이 아닐경우 0
     @param {Number} nMomentumY 가속 발생 구간일 경우 현재 터치 움직임의 수직방향 운동에너지값,가속 구간이 아닐경우 0
     @param {Number} nStartX touchStart의 X좌표
     @param {Number} nStartY touchStart의 Y좌표
     @param {Number} nStartTimeStamp touchStart의 timestamp 값
     @param {Object} oEvent jindo.$Event object
     @param {Function} stop stop를 호출하여 영향 받는 것이 없다.
     **/

    /**
     사용자의 터치가 끝난 이후에 움직임이 대각선 스크롤으로 분석되었을 경우 발생.
     @remark touchEnd이후에 발생.분석 기준의 픽셀 이하로 움직였을 경우에는 분석되지 않아서 커스텀 이벤트 발생하지 않는다

     @event dScroll
     @param {String} sType 커스텀 이벤트명
     @param {HTMLElement} element 현재 터치된 영역의 Element
     @param {Number} nX 현재 터치영역의 X좌표
     @param {Number} nY 현재 터치 영역의 Y좌표
     @param {Array} aX 모든 터치 영역의 X좌표
     @param {Array} aY 모든 터치 영역의 Y좌표
     @param {Number} nVectorX 이전 touchMove 혹은 touchStart의 X좌표와의 상대적인 거리 (직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
     @param {Number} nVectorY 이전 touchMove 혹은 touchStart의 Y좌표와의 상대적인 거리 (직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
     @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리 (touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
     @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리 (touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
     @param {Number} nSpeedX 가속 발생 구간일 경우 현재 터치움직임의 수평방향 속도, 가속 구간이 아닐경우 0
     @param {Number} nSpeedY 가속 발생 구간일 경우 현재 터치움직임의 수직방향 속도, 가속 구간이 아닐경우 0
     @param {Number} nMomentumX 가속 발생 구간일 경우 현재 터치 움직임의 수평방향 운동에너지값,가속 구간이 아닐경우 0
     @param {Number} nMomentumY 가속 발생 구간일 경우 현재 터치 움직임의 수직방향 운동에너지값,가속 구간이 아닐경우 0
     @param {Number} nStartX touchStart의 X좌표
     @param {Number} nStartY touchStart의 Y좌표
     @param {Number} nStartTimeStamp touchStart의 timestamp 값
     @param {Object} oEvent jindo.$Event object
     @param {Function} stop stop를 호출하여 영향 받는 것은 없다.
     **/

    /**
     사용자의 터치가 끝난 이후에 움직임이 pinch로 분석되었을 경우 발생.
     @remark touchEnd이후에 발생.분석 기준의 scale값 이하일 경우 분석되지 않아서 커스텀 이벤트 발생하지 않는다

     @event pinch
     @param {String} sType 커스텀 이벤트명
     @param {HTMLElement} element 현재 터치된 영역의 Element
     @param {Number} nX 현재 터치영역의 X좌표
     @param {Number} nY 현재 터치 영역의 Y좌표
     @param {Array} aX 모든 터치 영역의 X좌표
     @param {Array} aY 모든 터치 영역의 Y좌표
     @param {Number} nScale 멀티터치일경우 계산된 scale값
     @param {Number} nRotation 멀티터치일경우 계산된 rotation값 (pinch이면서 rotate일 경우 이 값도 존재한다)
     @param {Number} nStartTimeStamp touchStart의 timestamp 값
     @param {Object} oEvent jindo.$Event object
     @param {Function} stop stop를 호출하여 영향 받는 것은 없다.

     @history 1.2.0 Update aX, aY 속성 추가
     **/

    /**
     사용자의 터치가 끝난 이후에 움직임이 rotate로 분석되었을 경우 발생.
     @remark touchEnd이후에 발생.분석 기준의 rotate값 이하일 경우 분석되지 않아서 커스텀 이벤트 발생하지 않는다.

     @event rotate
     @param {String} sType 커스텀 이벤트명
     @param {HTMLElement} element 현재 터치된 영역의 Element
     @param {Number} nX 현재 터치영역의 X좌표
     @param {Number} nY 현재 터치 영역의 Y좌표
     @param {Array} aX 모든 터치 영역의 X좌표
     @param {Array} aY 모든 터치 영역의 Y좌표
     @param {Number} nRotation 멀티터치일경우 계산된 rotation값
     @param {Number} nScale 멀티터치일경우 계산된 scale값 (pinch이면서 rotate일 경우 이 값도 존재한다)
     @param {Number} nStartTimeStamp touchStart의 timestamp 값
     @param {Object} oEvent jindo.$Event object
     @param {Function} stop stop를 호출하여 영향 받는 것은 없다.

     @history 1.2.0 Update aX, aY 속성 추가

     **/

}).extend(jindo.m.UIComponent);
