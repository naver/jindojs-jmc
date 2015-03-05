/**
    @fileOverview 스크롤, 플리킹과 같은 swap컴포넌트들의 상위 컴포넌트.
    @author sculove
    @version #__VERSION__#
    @since 2013. 2. 27.
*/
/**
    스크롤, 플리킹과 같은 swap컴포넌트들의 상위 컴포넌트.
    CrossBrowser대응, touch대응, 공통기능을 담당한다.

    @class jindo.m.SwipeCommon
    @extends jindo.m.UIComponent
    @keyword flicking, Scroll, 플리킹, 스크롤
    @uses jindo.m.Touch, jindo.m.Animation
    @group Component
    @invisible

    @history 1.17.1 update iOS클릭버그로 인한 성능 이슈 해결.
    @history 1.17.1 Bug 멀티터치시 대응. iOS에서 멀티탭 했을 경우에 스크립트 오류가 발생
    @history 1.15.0 bug iOS 7.0이상시 클릭 안되는 버그 수정
    @history 1.14.0 update rotate이벤트 stop시 resize가 호출되지 않음
    @history 1.10.0 bug bUseTimingFunction을 true로 지정해도 false로 동작했던 것 수정
    @history 1.10.0 update jindo.m.SwapCommon에서 SwipeCommon으로 변경
    @history 1.10.0 update beforeTouchXXXXX 계열 이벤트 추가
    @history 1.9.0 jindo.m.Morph 기반으로 변경
    @history 1.8.0 Release 최초 릴리즈
**/
jindo.m.SwipeCommon = jindo.$Class({
  /* @lends jindo.m.SwipeCommon.prototype */
  /**
      초기화 함수

      @constructor
      @param {String|HTMLElement} el 플리킹 기준 Element (필수)
      @param {Object} [htOption] 초기화 옵션 객체
        @param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
        @param {Boolean} [htOption.bUseHighlight=true] 하이라이트 사용 여부
        @param {Boolean} [htOption.bUseDiagonalTouch=true] 대각선스크롤 방향의 터치를 사용할지 여부
        @param {Boolean} [htOption.bUseMomentum=true] 가속을 통한 모멘텀 사용여부
        @param {Number} [htOption.nDeceleration=0.0006] 가속도의 감속계수. 이 값이 클수록, 가속도는 감소한다
        @param {Boolean} [htOption.bAutoResize=true] 화면전환시에 리사이즈에 대한 처리 여부
        @param {Function} [htOption.fEffect=jindo.m.Effect.linear] 애니메이션에 사용되는 jindo.m.Effect 의 함수들
        @param {Boolean} [htOption.bUseCss3d=jindo.m.useCss3d()] css3d(translate3d) 사용여부<br />
            모바일 단말기별로 다르게 설정된다. 상세내역은 <auidoc:see content="jindo.m">[jindo.m]</auidoc:see>을 참조하기 바란다.
        @param {Boolean} [htOption.bUseTimingFunction=jindo.m.useTimingFunction()] 애니메이션 동작방식을 css의 TimingFunction을 사용할지 여부<br />false일 경우 setTimeout을 이용하여 애니메이션 실행.<br />
        모바일 단말기별로 다르게 설정된다. 상세내역은 <auidoc:see content="jindo.m">[jindo.m]</auidoc:see>을 참조하기 바란다.
        @param {Number} [htOption.nZIndex=2000] 컴포넌트 base엘리먼트 z-Index 값
      @history 1.10.0 Update fEffect 옵션 기본값 변경 easeOut => cubicEaseOut
  **/
  $init : function(el,htUserOption) {
    this.option({
      bActivateOnload : true,
      bUseHighlight : true,
      bUseDiagonalTouch : true,
      bUseMomentum : true,
      nDeceleration : 0.0006,
      bAutoResize : true,
      fEffect : jindo.m.Effect.cubicEaseOut,
      bUseCss3d : jindo.m.useCss3d(),
      bUseTimingFunction : jindo.m.useTimingFunction(),
      nZIndex : 2000
    });
  },

  _getAnimationOption : function(htOption) {
    return jindo.$Jindo.mixin({
      bUseH : this._bUseH,
      bHasOffsetBug : this._hasOffsetBug(),
      fEffect : this.option("fEffect"),
      bUseCss3d : this.option("bUseCss3d"),
      bUseTimingFunction : this.option("bUseTimingFunction")
    }, htOption || {});
  },

  /**
      jindo.m.SwipeCommon 에서 사용하는 모든 인스턴스 변수를 초기화한다.
  **/
  _initVar: function() {
    this._htWElement = {};
    this._bUseH = false;  // 수평 사용여부
    this._bUseV = false;  // 수직 사용여부
    this._nX = 0; // 수평 좌표
    this._nY = 0; // 수직 좌표
    this._bUseDiagonalTouch = this.option("bUseDiagonalTouch");

    // 클릭버그 관련 for ios
    this._bClickBug = jindo.m.hasClickBug();

    // offset버그 관련
    this._htOffsetBug = {
      hasBug : jindo.m.hasOffsetBug() && this.option("bUseHighlight"),
      timer : -1,
      elDummyTag : null
    };

    // 화면 사이즈를 관리
    this._htSize = {
      viewWidth : 0,
      viewHeight : 0,
      contWidth : 0,
      contHeight : 0,
      maxX : 0,
      maxY : 0
    };

    this._isStop = false; // 사용자 액션에 의해 멈춰진경우 표기
    this._oTouch = null;
    this._oAnimation = null;  // 하위에서 설정
  },

  /**
      jindo.m.SwipeCommon 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
      @param {Varient} el 엘리먼트를 가리키는 문자열이나, HTML엘리먼트
  **/
  _setWrapperElement: function(el) {
    this._htWElement["view"] = jindo.$Element(el);

    // base is for PreviewFlicking
    this._htWElement["base"] = jindo.$Element(this._htWElement["view"].query("." + this.option("sClassPrefix") + "base"));
    if(this._htWElement["base"]) {
        this._htWElement["container"] = this._htWElement["base"].query("." + this.option("sClassPrefix") + "container");
    } else {
        this._htWElement["container"] = this._htWElement["view"].query("." + this.option("sClassPrefix") + "container") || this._htWElement["view"].first();
    }
    this._htWElement["container"] = jindo.$Element(this._htWElement["container"]);

    this._htWElement["view"].css({
      "overflow" : "hidden",
      "zIndex" : this.option("nZIndex")
      // "position" : "relative"
    });
    if( this._htWElement["base"] ){
        this._htWElement["base"].css({
            "position" :"relavite"
        });
    }
    this._htWElement["container"].css({
        "left" : "0px",
        "top" : "0px"
    });
    this._createOffsetBugDummyTag();
  },

  /**
      activate 실행시 호출됨
  **/
  _onActivate : function() {
    if(!this._oTouch) {
      this._oTouch = new jindo.m.Touch(this._htWElement["view"].$value(), {
        nMoveThreshold : 0,
        // nMomentumDuration : (jindo.m.getDeviceInfo().android ? 500 : 200),
        nUseDiagonal : 0,
        bVertical : this.bUseH,
        bHorizental : !this.bUseH,
        nMomentumDuration : 200,
        nTapThreshold : 1,
        nSlopeThreshold : 5,
        nEndEventThreshold : (jindo.m.getDeviceInfo().win8 ? 100 : 0),
        bActivateOnload : false
      });
    }
    this._attachEvent();
    this._attachAniEvent(); // add
    this._oTouch.activate();// add
  },

  /**
      deactivate 실행시 호출됨
  **/
  _onDeactivate : function() {
    this._detachEvent();
    this._detachAniEvent();
    this._oTouch.deactivate();
    if(this._oAnimation) {
      this._oAnimation.deactivate();
    }
  },

  /**
      jindo.m.SwipeCommon 에서 사용하는 모든 이벤트를 할당한다.
  **/
  _attachEvent : function() {
    this._htEvent = {};
    /* Touch 이벤트용 */
    this._htEvent["touchStart"] = jindo.$Fn(this._onStart, this).bind();
    this._htEvent["touchMove"] = jindo.$Fn(this._onMove, this).bind();
    this._htEvent["touchEnd"] = jindo.$Fn(this._onEnd, this).bind();
    this._oTouch.attach({
      touchStart : this._htEvent["touchStart"],
      touchMove : this._htEvent["touchMove"],
      touchEnd :  this._htEvent["touchEnd"]
    });
    if(this.option("bAutoResize")) {
      this._htEvent["resize"] = jindo.$Fn(this._onResize, this).bind();
      jindo.m.bindRotate(this._htEvent["resize"]);
      jindo.m.bindPageshow(this._htEvent["resize"]);
    }
  },

  /**
      jindo.m.SwipeCommon 에서 사용하는 모든 이벤트를 해제한다.
  **/
  _detachEvent : function() {
    this._oTouch.detachAll();
    if(this.option("bAutoResize")) {
      jindo.m.unbindRotate(this._htEvent["resize"]);
      jindo.m.unbindPageshow(this._htEvent["resize"]);
    }
  },

  /**
      Boundary를 초과하지 않는 X (left) 포지션 반환
      @param {Number} nPos
  **/
  _getX : function(nPos) {
    return ( nPos >= 0 ? 0 : (nPos <= this._htSize.maxX ? this._htSize.maxX : nPos) );
  },

  /**
      Boundary를 초과하지 않는 Y (top) 포지션 반환
      @param {Number} nPos
  **/
  _getY : function(nPos) {
    return ( nPos >= 0 ? 0 : (nPos <= this._htSize.maxY ? this._htSize.maxY : nPos) );
  },

  /**
   * Animation관련 이벤트를 할당한다.
   */
  _attachAniEvent : function() {
    if(this._oAnimation) {
      // this._htEvent["progressAni"] = jindo.$Fn(this._onProgressAniImpl, this).bind();
      // _onEndAniImpl 는 하위클래스에서 처리. 예) jindo.m.Flick, jindo.m.Scroller
      this._htEvent["endAni"] = jindo.$Fn(this._onEndAniImpl, this).bind();
      this._oAnimation.attach({
        // "progress" : this._htEvent["progressAni"],
        "end" : this._htEvent["endAni"]
      });
    }
  },

  /**
   * Animation관련 이벤트를 해제한다.
   */
  _detachAniEvent : function() {
    if(this._oAnimation) {
      this._oAnimation.detachAll();
    }
  },

  // Animation의 move 이벤트 핸들러
  // _onProgressAniImpl : function(we) {
  //   var alist = we.aLists;
  //   if(alist && alist.length > 0 && alist[1]["@transform"]) {
  //     jindo.$A(alist[1]["@transform"].match(/(translate[XY]\()(\-?(\d+)(\.\d+)?)/g)).forEach(function(v,i,a) {
  //       if(i==0) {
  //         this._nX = v.replace(/translateX\(/,"")*1 || 0;
  //       } else {
  //         this._nY = v.replace(/translateY\(/,"")*1 || 0;
  //       }
  //     },this);
  //   }
  //   this.fireEvent("progress", {
  //     nLeft : this._nX,
  //     nTop : this._nY
  //   });
  //   // console.warn(this._nX, this._nY);
  // },
  // Animation의 end 이벤트 핸들러
  // _onEndAniImpl : function(we) {},

  set : function() {
    var aArgs = Array.prototype.slice.apply(arguments);
    if(aArgs.length >= 1) {
      this._oAnimation = aArgs.shift();
      this._oAnimation.setStyle(aArgs);
      this._attachAniEvent();
    }
    return this._oAnimation;
  },

  /**
   * Animation를 반환한다.
   * @return {jindo.m.Animation} Animation를 반환
   *
   * @method getAnimation
   */
  getAnimation : function() {
    return this._oAnimation;
  },

  /**
   * 현재 애니메이션중인지 여부를 리턴한다.
   * @return {Boolean} 애니메이션 동작여부
   *
   * @method isPlaying
   * @histoy update 1.10.0
   */
  isPlaying : function() {
    if(this._oAnimation) {
      return this._oAnimation.isPlaying();
    }
    return false;
  },

  // jindo.m.Flicking 하위호환성 보장 코드
  isAnimating : this.isPlaying,

  /**
   * 대상은 refresh 한다.
   *
   * @method refresh
   */
  refresh : function() {
    // A링크를 탐색
    // this._refreshAnchor();
  },

  /**
   * 영역의 사이즈를 resize한다.
   *
   * @method resize
   */
  resize : function() {
    var welView = this._htWElement["view"],
      welContainer = this._htWElement["container"],
      nWidthLeft = parseInt(welView.css("borderLeftWidth"),10),
      nWidthRight = parseInt(welView.css("borderRightWidth"),10),
      nHeightTop = parseInt(welView.css("borderTopWidth"),10),
      nHeightBottom = parseInt(welView.css("borderBottomWidth"),10);
    nWidthLeft = isNaN(nWidthLeft) ? 0 : nWidthLeft;
    nWidthRight = isNaN(nWidthRight) ? 0 : nWidthRight;
    nHeightTop = isNaN(nHeightTop) ? 0 : nHeightTop;
    nHeightBottom = isNaN(nHeightBottom) ? 0 : nHeightBottom;

    // 사이즈 갱신
    this._htSize.viewWidth = welView.width() - nWidthLeft - nWidthRight;
    this._htSize.viewHeight = welView.height() - nHeightTop - nHeightBottom;
    this._htSize.contWidth = welContainer.width();
    this._htSize.contHeight = welContainer.height();
    // console.log("ini-swap", this._htSize.viewWidth, this._htWElement["view"].attr("id"));
    // this.fireEvent("resize", {
    //   wel : welView,
    //   nWidth : this._htSize.viewWidth-16,
    //   nHeight : this._htSize.viewHeight
    // });
  },

  // _refreshAnchor : function() {
  //   if(this._htClickBug.hasBug) {
  //     this._htClickBug.isBlocked = false;
  //     this._htClickBug.anchors = jindo.$$("A", this._htWElement["view"].$value());
  //     if(!this._htClickBug.anchors) {
  //       this._htClickBug.hasBug = false;
  //     }
  //   }
  // },

  /**
      모멘텀을 계산하여 앞으로 이동할 거리와 시간을 속성으로 갖는 객체를 반환함
      @param {Number} nDistance
      @param {Number} nSpeed
      @param {Number} nMomentum
      @param {Number} nMaxDistUpper
      @param {Number} nMaxDistLower
      @param {Number} nSize
  **/
  _calcMomentum: function (nDistance, nSpeed, nMomentum, nMaxDistUpper, nMaxDistLower, nSize) {
      var nDeceleration = this.option("nDeceleration"),
          nNewDist = nMomentum / nDeceleration,
          nNewTime = 0,
          nOutsideDist = 0;
      // console.debug("momentum",{
      //   distance:nDistance,
      //   speed : nSpeed,
      //   momentum : nMomentum,
      //   upper : nMaxDistUpper,
      //   lower : nMaxDistLower,
      //   newDist : nNewDist
      // });
      if (nDistance > 0 && nNewDist > nMaxDistUpper) {
        nOutsideDist = nSize / (6 / (nNewDist / nSpeed * nDeceleration));
        nMaxDistUpper = nMaxDistUpper + nOutsideDist;
        nSpeed = nSpeed * nMaxDistUpper / nNewDist;
        nNewDist = nMaxDistUpper;
      } else if (nDistance < 0 && nNewDist > nMaxDistLower) {
        nOutsideDist = nSize / (6 / (nNewDist / nSpeed * nDeceleration));
        nMaxDistLower = nMaxDistLower + nOutsideDist;
        nSpeed = nSpeed * nMaxDistLower / nNewDist;
        nNewDist = nMaxDistLower;
      }
      nNewDist = nNewDist * (nDistance < 0 ? -1 : 1);
      nNewTime = nSpeed / nDeceleration;

      // console.debug({
      //     nDist: nNewDist,
      //     nTime: Math.round(nNewTime)
      // });
      return {
          nDist: nNewDist,
          nTime: Math.round(nNewTime)
      };
  },

  /**
      Anchor를 삭제
  **/
  // _clearAnchor : function() {
  //   // console.error("clear : " + this._htClickBug.hasBug + " | " + this._htClickBug.isBlocked);
  //   if(this._htClickBug.hasBug && !this._htClickBug.isBlocked) {
  //     var aClickAddEvent = null,
  //       anchor = null;
  //     for(var i=0, nLen=this._htClickBug.anchors.length; i<nLen; i++) {
  //       anchor = this._htClickBug.anchors[i];
  //       if(!anchor.___isClear___) {
  //         if(this._htClickBug.dummyFnc !== anchor.onclick) {
  //           anchor._onclick = anchor.onclick;
  //         }
  //         anchor.onclick = this._htClickBug.dummyFnc;
  //         anchor.___isClear___ = true;
  //         aClickAddEvent = anchor.___listeners___ || [];
  //         jindo.$A(aClickAddEvent).forEach(function(v,i,a) {
  //           ___Old__removeEventListener___.call(anchor, "click", v.listener, v.useCapture);
  //         });
  //       }
  //     }
  //     this._htClickBug.isBlocked = true;
  //   }
  // },

  // *
  //     Anchor를 복원
  // *
  // _restoreAnchor : function() {
  //   // console.log("restore : " + this._htClickBug.hasBug + " | " + this._htClickBug.isBlocked);
  //   if(this._htClickBug.hasBug && this._htClickBug.isBlocked) {
  //     var aClickAddEvent = null,
  //       anchor = null;
  //     for(var i=0, nLen=this._htClickBug.anchors.length; i<nLen; i++) {
  //       anchor = this._htClickBug.anchors[i];
  //       if(anchor.___isClear___) {
  //         if(this._htClickBug.dummyFnc !== anchor._onclick) {
  //           anchor.onclick = anchor._onclick;
  //         } else {
  //           anchor.onclick = null;
  //         }
  //         anchor.___isClear___ = null;
  //         aClickAddEvent = anchor.___listeners___ || [];
  //         jindo.$A(aClickAddEvent).forEach(function(v,i,a) {
  //           ___Old__addEventListener___.call(anchor, "click", v.listener, v.useCapture);
  //         });
  //       }
  //     }
  //     this._htClickBug.isBlocked = false;
  //   }
  // },

  // _startImpl : function(we) {
  //   this._clearOffsetBug();
  //   this._clearAnchor();
  // },

  /**
      Touchstart시점 이벤트 핸들러
      @param {jindo.$Event} we
  **/
  _onStart : function(we) {
    // 플리킹 전용시 임시 코드
    if(this.isPlaying()) {
        we.oEvent.stop();
        return;
    }
    this._clearOffsetBug();
    // this._clearAnchor();
    /**
        beforeTouchStart touchStart가 시작되기 전 발생 (jindo.m.Touch의 touchStart 속성과 동일)
        <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchStart">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
        @event beforeTouchStart
        @param {Function} stop 수행시 touchStart 이벤트가 발생하지 않는다.
    **/
    if(this.fireEvent("beforeTouchStart", we)) {
    // console.log("touchstart (" + we.nX + "," + we.nY + ")");
      this._isStop = false;
      this._startImpl(we);
      /**
          touchStart touchStart가 시작되었을때 발생 (jindo.m.Touch의 touchStart 속성과 동일)
          <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchStart">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
          @event touchStart
      **/
      if(!this.fireEvent("touchStart", jindo.$Jindo.mixin(we,{}))) {
          we.stop();
      }
    } else {
        we.stop();
    }
  },

  /**
      이동시점 이벤트 핸들러
      @param {jindo.$Event} we
  **/
  _onMove : function(we) {
    // this._clearTouchEnd();
    // console.log("touchmove (" + we.nX + "," + we.nY + "), Vector (" + we.nVectorX + "," + we.nVectorY + ") sMoveType : " + we.sMoveType, we);
    this._clearOffsetBug();

    /**
        beforeTouchMove touchMove가 시작되기 전에 발생 (jindo.m.Touch의 touchMove 속성과 동일)
        <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchMove">[jindo.m.Touch]</auidoc:see> 을 참조하기 바란다.
        @event beforeTouchMove
        @param {Function} stop 수행시 touchMove 이벤트가 발생하지 않는다.
    **/
    if(this.fireEvent("beforeTouchMove",we)) {
      var bPrevent = this._preventSystemEvent(we);
      if(bPrevent && !this.isPlaying()) {
        /**
         *  iOS를 위한 anchor 처리
         * ios일 경우, touchstart시 선택된 영역에 anchor가 있을 경우, touchend 시점에 touchstart영역에 click이 타는 문제
         * 모든 a link에 bind된, onclick 이벤트를 제거한다. => eventPoints으로 해결
         */
        this._bClickBug && this._htWElement["container"].css("pointerEvents","none");
        this._moveImpl(we);
      }
      // jindo.m.Flicking의 하위 호환성을 유지하기 위해
      if(!bPrevent) {
        this.fireEvent("scroll");
      }
      /**
          touchMove touchMove가 시작되었을때 발생 (jindo.m.Touch의 touchMove 속성과 동일)
          <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchMove">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
          @event touchMove
          @param {Boolean} bPreventDefaultEvent 시스템 이벤트 중지 여부를 반환
      **/
      var htParam = jindo.$Jindo.mixin(we,{});
      htParam.bPreventDefaultEvent = bPrevent;
      if(!this.fireEvent("touchMove",htParam)) {
        we.stop();
      }
    } else {
        we.stop();
    }
  },

  /**
      Touchend 시점 이벤트 핸들러
      @param {jindo.$Event} we
  **/
  _onEnd : function(we) {
    if(this.isPlaying()) {
      return;
    }
    if(!this._isStop) {
      this._clearOffsetBug();
    }
      // console.log("touchend [" + we.sMoveType + "](" + we.nX + "," + we.nY + "), Vector(" + we.nVectorX + "," + we.nVectorY + "), MomentumY : "+ we.nMomentumY + ", speedY : " + we.nSpeedY);
    /**
        beforeTouchEnd touchEnd가 시작되었을때 발생 (jindo.m.Touch의 touchEnd 속성과 동일)
        <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchEnd">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
        @event beforeTouchEnd
        @param {Function} stop 수행시 touchEnd 이벤트가 발생하지 않는다.
    **/
    if (this.fireEvent("beforeTouchEnd",we)) {
      // 1) tap인 경우
      if ( we.sMoveType === jindo.m.MOVETYPE[3] || we.sMoveType === jindo.m.MOVETYPE[4] || we.sMoveType === jindo.m.MOVETYPE[5]) {
          if(this._isStop) {
            we.oEvent.stop(jindo.$Event.CANCEL_ALL);
          } else {
            // this._restoreAnchor();
            // tap인 경우 처리
            this._tapImpl && this._tapImpl();
          }
      } else if(we.sMoveType === jindo.m.MOVETYPE[0] || we.sMoveType === jindo.m.MOVETYPE[1] || we.sMoveType === jindo.m.MOVETYPE[2]) {// 2) 스크롤인 경우
          // 클릭 이후 페이지 뒤로 돌아왔을 경우, 문제가됨. 동작중인 상태를 초기화함
          this._endImpl(we);
          // if(this._htClickBug.hasBug) {
          //   we.oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
          // }
      } else {   //
          // console.log(we, "restore");
          this._restore && this._restore();
      }
      /**
          touchEnd touchEnd가 시작되었을때 발생 (jindo.m.Touch의 touchEnd 속성과 동일)
          <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchEnd">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
          @event touchEnd
      **/
      if(!this.fireEvent("touchEnd", jindo.$Jindo.mixin(we,{}))) {
          we.stop();
      }
    } else {
        we.stop();
    }
    /**
     *  iOS를 위한 anchor 처리
     * ios일 경우, touchstart시 선택된 영역에 anchor가 있을 경우, touchend 시점에 touchstart영역에 click이 타는 문제
     * 모든 a link에 bind된, onclick 이벤트를 제거한다. => eventPoints으로 해결
     */
    this._bClickBug && this._htWElement["container"].css("pointerEvents","auto");
  },

  // 시스템 이벤트를 막음
  _preventSystemEvent : function(we) {
    var weParent = we.oEvent;
    if(we.sMoveType === jindo.m.MOVETYPE[0]) {  // 수평이동시
      if(this._bUseH) {
        // 수평스크롤인 경우 시스템 스크롤 막고, 컴포넌트 기능 수행
        weParent.stop();
        return true;
      } else {
        return false;
      }
    } else if(we.sMoveType === jindo.m.MOVETYPE[1]) {   //수직이동시
      if(this._bUseV) {
        // 수직스크롤인 경우 시스템 스크롤 막고, 컴포넌트 기능 수행
        weParent.stop();
        return true;
      } else {
        return false;
      }
    } else if(we.sMoveType === jindo.m.MOVETYPE[2]) {   //대각선일 경우
      if(this._bUseDiagonalTouch) {
        // 대각선인 경우 시스템 스크롤 막고, 컴포넌트 기능 수행
        weParent.stop();
        return true;
      } else{
        return false;
      }
    } else if(we.sMoveType === jindo.m.MOVETYPE[6] || we.sMoveType === jindo.m.MOVETYPE[7] || we.sMoveType === jindo.m.MOVETYPE[8]) {
      weParent.stop();
      return true;
    } else {    // 탭, 롱탭인 경우, 다 막기
      weParent.stop();
      return true;
    }
  },

  /**
        화면전환시에 리사이즈처리 및 위치 처리를 한다.
    **/
  _onResize : function(we){
      /**
          단말기가 회전될 때 발생한다

          @event rotate
          @param {String} sType 커스텀 이벤트명
          @param {Boolean} isVertical 수직여부
          @param {Function} stop 수행시 resize가 호출되지 않음
      **/
      if(we.sType === "rotate") {
        if(this.fireEvent("rotate",{
            isVertical : we.isVertical
        })) {
          this._resizeImpl(we);
        }
      } else {
        this._resizeImpl(we);
      }
  },

  _getMomentumData : function(we, nThreshold, isBounce) {
    var htMomentumX = { nDist:0, nTime:0 },
      htMomentumY = { nDist:0, nTime:0 },
      htData = {
        momentumX : we.nMomentumX,
        momentumY : we.nMomentumY,
        distanceX : we.nDistanceX,
        distanceY : we.nDistanceY,
        x : this._nX,
        y : this._nY,
        nextX : this._nX,
        nextY : this._nY
      };
      // alert(this._nX);
    // 모멘텀인 경우
    if(this.option("bUseMomentum") &&
       ( (we.nMomentumX && we.nMomentumX > nThreshold) || (we.nMomentumY && we.nMomentumY > nThreshold) ) ) {
      if(this._bUseH) {
        htMomentumX = this._calcMomentum(we.nDistanceX, we.nSpeedX, we.nMomentumX, -this._nX, -this._htSize.maxX + this._nX, isBounce ? this._htSize.viewWidth : 0);
      }
      if(this._bUseV) {
        htMomentumY = this._calcMomentum(we.nDistanceY, we.nSpeedY, we.nMomentumY, -this._nY, -this._htSize.maxY + this._nY, isBounce ? this._htSize.viewHeight : 0);
      }
      htData.nextX = this._nX + htMomentumX.nDist;
      htData.nextY = this._nY + htMomentumY.nDist;
      htData.duration = Math.max(Math.max(htMomentumX.nTime, htMomentumY.nTime),10);

      // 안드로이드 일 경우, momentum duration을 0.5으로 줄임
      htData.duration = jindo.m.getOsInfo().android ? htData.duration *0.7 : htData.duration;

    } else {
      htData.duration = 0;
    }
    return htData;
  },


  /**
      translate의 포지션을 스타일로 바꾼다.
      @param {jindo.$Element} wel
  **/
  _makeStylePos : function(wel) {
      var oUI = this.getAnimation(),
        htTranslateOffset = jindo.m.getTranslateOffset(wel),
        htStyleOffset = jindo.m.getStyleOffset(wel),
        htCss = {
          top : (htTranslateOffset.top + htStyleOffset.top) + "px",
          left : (htTranslateOffset.left + htStyleOffset.left) + "px"
        };
      htCss[oUI.p("Transform")] = oUI.getTranslate("0px","0px");
      // htCss[oUI.p("TransitionDuration")] = "";
      wel.css(htCss);
      this._htOffsetBug.elDummyTag.focus();
      // console.debug("focus~!");
      // alert("complete");
  },

  // offset버그를 제거하기위한 dummy 태그를 구성한다.
  _createOffsetBugDummyTag : function() {
    if(this._hasOffsetBug()) {
      this._htOffsetBug.elDummyTag = jindo.$$.getSingle("._offsetbug_dummy_atag_", this._htWElement["view"].$value());
      if(!this._htOffsetBug.elDummyTag) {
          this._htOffsetBug.elDummyTag = jindo.$("<a href='javascript:void(0);' style='position:absolute;height:0px;width:0px;' class='_offsetbug_dummy_atag_'></a>");
          this._htWElement["view"].append(this._htOffsetBug.elDummyTag);
      }
    }
  },

  // offset버그를 위한 타이머를 제거한다.
  _clearOffsetBug : function() {
    if(this._hasOffsetBug()) {
        clearTimeout(this._htOffsetBug.timer);
        this._htOffsetBug.timer = -1;
    }
  },

  // offset버그를 수정하는 타이머를 동작한다.
  _fixOffsetBugImpl : function() {
    if(this._hasOffsetBug()) {
      var self = this;
      var welTarget = this.getAnimation().getTarget(true);
      this._clearOffsetBug();
      this._htOffsetBug.timer = setTimeout(function() {
        if(welTarget) {
          self._makeStylePos(welTarget);
        }
      }, 200);
    }
  },

  // offsetBug 여부를 반환한다.
  _hasOffsetBug : function() {
    return this._htOffsetBug.hasBug;
  },

  /**
      jindo.m.SwipeCommon 에서 사용하는 모든 객체를 release 시킨다.
      @method destroy
  **/
  destroy: function() {
    var p;
    this.deactivate();
    // 엘리먼트 제거
    for(p in this._htWElement) {
      this._htWElement[p] = null;
    }
    this._htWElement = null;
    for(p in this._htEvent) {
      this._htEvent[p] = null;
    }
    this._htEvent = null;
    if(this._oTouch) {
      this._oTouch.destroy();
    }
    if(this._oAnimation) {
      this._oAnimation.destroy();
    }
  }
}).extend(jindo.m.UIComponent);