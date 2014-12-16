/**
    @fileOverview 페이지의 고정영역 내부를 터치하여 스크롤링 할 수 있는 컴포넌트
    @author sculove
    @version #__VERSION__#
    @since 2011. 8. 18.
*/
/**
    페이지의 고정영역 내부를 터치하여 스크롤링 할 수 있는 컴포넌트

    @class jindo.m.CoreScroll
    @extends jindo.m.UIComponent
    @uses jindo.m.Touch
    @uses jindo.m.DynamicPlugin{,1}
    @deprecated
    @keyword scroll, 스크롤
    @group Component

    @history 1.7.0 Bug bUseHighlight=fasle일 경우, 안드로이드 4.x 갤럭시 시리즈에서 하이라이트 사라지지 않는 문제 제거
	  @history 1.6.0 deprecated
    @history 1.5.0 Support Window Phone8 지원
    @history 1.5.0 Update  touchStart, touchMove , touchEnd 이벤트에서 중지할 경우 뒤 이벤트 안타도록 수정
    @history 1.4.0 Support OS 6 지원
    @history 1.4.0 Update {bUseBounce} bUseBounce : false일 경우, 스크롤을 더이상 할수 없을 때 시스템 스크롤이 발생하는 기능 추가
    @history 1.4.0 Bug 가로 스크롤일경우, 터치 위치의 y가 30보다 작을경우 스크롤이 안되는 버그 수정
    @history 1.3.0 Update {sListElement} Option 추가
    @history 1.3.0 Update {nRatio} Option 추가
    @history 1.3.0 Support Android 젤리빈(4.1) 대응
    @history 1.3.0 Support 갤럭시 4.0.4 업데이트 지원
    @history 1.3.0 Update {bUseTimingFunction} Option 추가
    @history 1.3.0 Update {bUseTranslate} Option 추가
    @history 1.3.0 Update {bUseCss3d} Option 기본값 변경. 모바일 단말기에 맞게 3d 사용여부를 설정함
    @history 1.3.0 Update {bUseMomentum} Option 기본값 변경. iOS는 true, Android는 false → 모두 true
    @history 1.3.0 Update Wrapper의 position이 static 일 경우, relative로 변경<br/>그외는 position이 변경되지 않도록 수정
    @history 1.3.0 Update Wrapper와 scroller가 동일하고 bUseBounce가 true인 경우, 스크롤이 가능하도록 변경
    @history 1.3.0 Bug Scroll과 Flicking 함께 사용할때 A link가 클릭안되는 문제 수정
    @history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
    @history 1.2.0 Update bUseTransition → bUseCss3d<br>Option Name 수정
    @history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
    @history 1.1.0 Update 따로 클래스명을 정의하지 않아도 wrapper내의 첫번째 엘리먼트를 무조건 Scroller 엘리먼트로 처리하도록 수정
    @history 1.1.0 Update document 선택시 wrapper이 visible이 true일 경우에만 작동하도록 수정
    @history 1.1.0 Update 스크롤 여부에 따른 마크업 지정 편의 개선 (가로스크롤은 scroller의 높이값 100% 설정, 세로스크롤 경우 scroller의 넓이값 100% 설정)
    @history 1.1.0 Update {bUseTransition} Option 기본값 수정<br>iOS, 갤럭시 S2 : true, 그외 : false
    @history 1.1.0 Update {bUseHighlight} Option 추가
    @history 1.0.0 - -
    @history 0.9.5 Bug iOS에서 클릭영역 누른 상태에서, 이동후 버튼을 놓았을시, 초기에 선택한 위치에 clickable 엘리먼트가 존재할 경우, click 되는 문제 해결
    @history 0.9.5 Update {bUseBounce} false인 경우, 이동,가속시 외부영역으로 이동되지 않도록 수정
    @history 0.9.5 Update {sClassPrefix} Option 추가
    @history 0.9.5 Update {bUseTransition} Option 추가
    @history 0.9.5 Update {sPrefix → sClassPrefix} Option명 수정
    @history 0.9.5 Update {bUseFocus} Option명 삭제
    @history 0.9.0 Release 최초 릴리즈
**/
jindo.m.CoreScroll = jindo.$Class({
	/* @lends jindo.m.CoreScroll.prototype */
	   /**
        초기화 함수

        @constructor
        @param {String|HTMLElement} el CoreScroll할 Element (필수)
        @param {Object} [htOption] 초기화 옵션 객체
            @param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
            @param {Boolean} [htOption.bUseHScroll=false] 수평 스크롤 사용 여부. 스크롤영역의 width가 wrapper의 width보다 클 경우 적용 가능함.
            @param {Boolean} [htOption.bUseVScroll=true] 수직 스크롤 사용 여부. 스크롤영역의 height가 wrapper의 height보다 클 경우 적용 가능함.
            @param {Boolean} [htOption.bUseMomentum=true] 스크롤시 가속도 사용여부
            @param {Number} [htOption.nDeceleration=0.0006] 가속도의 감속계수. 이 값이 클수록, 가속도는 감소한다
            @param {Number} [htOption.nOffsetTop=0] 수직 스크롤시, 상위 offset
            @param {Number} [htOption.nOffsetBottom=0] 수직 스크롤시, 하위 offset
            @param {Number} [htOption.nHeight=0] Wrapper의 height값. 값이 0일 경우 wrapper의 height로 설정됨
            @param {Number} [htOption.nWidth=0] Wrapper의 width값. 값이 0일 경우 wrapper의 width로 설정됨
            @param {Boolean} [htOption.bUseBounce=true] 가속 이동후, 바운스 처리되는 여부
            @param {Boolean} [htOption.bUseHighlight=true] 하이라이트 사용 여부
            @param {String} [htOption.sClassPrefix='scroll_'] CoreScroll 내부 엘리먼트 구분 클래스 prefix
            @param {Function} [htOption.bUseCss3d=jindo.m._isUseCss3d()] 하드웨어 3d 가속 여부<br />
                모바일 단말기별로 다르게 설정된다. 상세내역은 <auidoc:see content="jindo.m">[jindo.m]</auidoc:see>을 참조하기 바란다.
            @param {Function} [htOption.bUseTimingFunction=jindo.m._isUseTimingFunction()] 스크롤 애니메이션 동작방식을 결정한다.<br />
                bUseTimingFunction가 true일 경우, CSS3로 애니메이션을 구현하고, false일 경우, 스크립트로 애니메이션을 구현한다.<br />
                모바일 단말기별로 다르게 설정된다. 상세내역은 <auidoc:see content="jindo.m">[jindo.m]</auidoc:see>을 참조하기 바란다.<br />
            @param {String} [htOption.sListElement=''] sListElement는 리스트의 구성요소가 되는 엘리먼트 명이다.<br />
                sListElement 옵션값을 지정한 상태에서 스크롤이 일어날 경우, 이동 경로 방향으로 고정 범위의 scroller 영역만을 동적으로 유지한다.<br />
                여기서 ‘고정범위’는 ‘화면에 보이는 View영역의 높이 X nRatio’ 옵션 값이다.<br />
                이 옵션이 적용될 경우, bUseCss3d와 bUseTimingFunction은 false값을 가진다.<br />
            @param {Number} [htOption.nRatio=1.5] sListElement가 설정되었을때, 유지하는 고정범위 비이다.
            @param {Boolean} [htOption.bUseTranslate=true] 컨텐츠의 좌표이동 방법을 결정한다.<br />
                bUseTranslate가 true일 경우, CSS3의 Translate으로 이동하고, false일 경우, style의 left,top으로 이동한다.
    **/
	$init : function(el,htUserOption) {
		this.option({
			bActivateOnload : true,
			bUseHScroll : false,
			bUseVScroll : true,
			bUseMomentum : true,
			nDeceleration : 0.0006,
			nOffsetTop : 0,
			nOffsetBottom : 0,
			nHeight : 0,
			nWidth : 0,
			bUseBounce : true,
			bUseHighlight : true,
			sClassPrefix : 'scroll_',
			bUseCss3d : jindo.m._isUseCss3d(),
			bUseTimingFunction : jindo.m._isUseTimingFunction(),
			sListElement : '',
			nRatio : 1.5,
			bUseTranslate : true
		});
		this.option(htUserOption || {});
		this._initVar();
		this._setWrapperElement(el);
		if(this.option("bActivateOnload")) {
			this.activate();
		}
		// console.log("bUseHighlight : " + this.option("bUseHighlight") + ", bUseCss3d:" + this.option("bUseCss3d") + ", bUseTimingFunction : " + this.option("bUseTimingFunction") + ", bUseTranslate : " + this.option("bUseTranslate"));
	},

    /**
        jindo.m.CoreScroll 에서 사용하는 모든 인스턴스 변수를 초기화한다.
    **/
	_initVar: function() {
		var htDeviceInfo = jindo.m.getDeviceInfo();
		this.isPositionBug = htDeviceInfo.android && !htDeviceInfo.bChrome;
		this.isIos = htDeviceInfo.ipad || htDeviceInfo.iphone;
		this.isClickBug = jindo.m.hasClickBug();
		// this.isDubleEndBug = htDeviceInfo.win8;
		this.nVersion = parseFloat(htDeviceInfo.version.substr(0,3));
		this.sCssPrefix = jindo.m.getCssPrefix();
		this.sTranOpen = null;
		this.sTranEnd = null;
		this.nWrapperW = null;
		this.nWrapperH = null;
		this.nScrollW = null;
		this.nScrollH = null;
		this.nMaxScrollLeft = null;
		this.nMaxScrollTop = null;
		this.nMinScrollTop = null;
		this.bUseHScroll = null;
		this.bUseVScroll = null;
		this._nLeft = 0;
		this._nTop = 0;
		this.bUseHighlight = this.option("bUseHighlight");
		this._aAni = [];
		this._nAniTimer = -1;
		this._nFixedPositionBugTimer = -1;
		// this._nFixedDubbleEndBugTimer = null;
		this._nTouchEndTimer = -1;

		this._oTouch = null;
		this._oDynamicScrollPlugin = null;
		this._bUseDynamicScroll = false;
		this._isAnimating = false;		// 순수 animate 처리
		this._isControling = false;		// 사용자가 움직이고 있는가?
		this._isStop = false;

		// DynamicScroll을 사용한다고 할경우, bUseCss3d는 항상 false
		if(this.option("sListElement")) {
			this.option("bUseCss3d", false);
		}
		this._setTrans();

		/**
		 *  하이라이트 기능을 사용할 경우에만 적용됨.
		 *  android 경우, css,offset, translate에 의해 이동된 영역의 하이라이트 및 영역이 갱신되지 않는 문제
		 * translate의 위치를 초기화하고 css, offset에 맞게 위치를 변경해준다. 또한 대상 영역하위의 a tag에 focus를 준다.
		 */
		if(this.bUseHighlight) {
			if(this.isPositionBug) {
				this._elDummyTag = null;	//for focus
			}
			/**
			 *  iOS를 위한 anchor 처리
			 * ios일 경우, touchstart시 선택된 영역에 anchor가 있을 경우, touchend 시점에 touchstart영역에 click이 타는 문제
			 * 모든 a link에 bind된, onclick 이벤트를 제거한다.
			 */
			if(this.isClickBug) {
				this._aAnchor = null;
				this._fnDummyFnc = function(){return false;};
				this._bBlocked = false;
			}
		}
	},

    /**
        3d Trans 또는 Trans를 기기별로 적용
    **/
	_setTrans : function() {
		if(this.option("bUseCss3d")) {
			this.sTranOpen = "3d(";
			this.sTranEnd = ",0)";
		} else {
			this.sTranOpen = "(";
			this.sTranEnd = ")";
		}
	},


    /**
        현재 포지션을 반환함.

        @method getCurrentPos
        @return {Object} nTop, nLeft의 값을 반환한다.
        @history 1.1.0 Update Method 추가
    **/
	getCurrentPos : function() {
		return {
			nTop : this._nTop,
			nLeft : this._nLeft
		};
	},

    /**
        wrapper 엘리먼트와 scroller 엘리먼트를 설정한다.

        @method setLayer
        @param {Varient} el 엘리먼트를 가리키는 문자열이나, HTML엘리먼트
    **/
	setLayer : function(el) {
		this._htWElement["wrapper"] = jindo.$Element(el);
		this._htWElement["wrapper"].css("overflow", "hidden");
		if(this._htWElement["wrapper"].css("position") == "static") {
			this._htWElement["wrapper"].css("position", "relative");
		}
		if(!this.bUseHighlight) {
			this._htWElement["wrapper"].css("-" + this.sCssPrefix + "-tap-highlight-color","transparent");
		}
		this.setScroller();
	},

    /**
        스크롤러관련 엘리먼트를 설정함

        @method setScroller
    **/
	setScroller : function() {
		this._htWElement["scroller"] = this._htWElement["wrapper"].first();

		/**
		 * Transform : translate이 초기에 적용될 경우,
		 * ios계열에서 깜빡거리거나, 이벤트 행이 걸리는 문제가 발생함
		 * hide시킨후, 적용을 하면 이러한 현상이 완화됨.
		 *
		 * 따라서, hide -> Transfom : translate 적용 -> show
		 */
		this._htWElement["scroller"].css({
				"position" : "absolute",
				"zIndex" : 1,
				"left" : 0,
				"top" : 0
		});
		if(this.option("bUseTranslate") || this.option("bUseCss3d")) {
			this._htWElement["scroller"].css("-" + this.sCssPrefix + "-transition-property", "-" + this.sCssPrefix + "-transform")
				.css("-" + this.sCssPrefix + "-transform", "translate" + this.sTranOpen + "0,0" + this.sTranEnd);
		}
		if(this.option("bUseTimingFunction")) {
			this._htWElement["scroller"].css("-" + this.sCssPrefix + "-transition-timing-function", "cubic-bezier(0.33,0.66,0.66,1)");
		}
		// 안드로이드 버그 수정 (android 2.x 이하 버젼)
		if(this.isPositionBug && this.bUseHighlight && this.nVersion < 3) {
			this._elDummyTag = this._htWElement["scroller"].query("._scroller_dummy_atag_");
			
			if(!this._elDummyTag) {
				this._elDummyTag = jindo.$("<a href='javascript:void(0);' style='position:absolute;height:0px;width:0px;' class='_scroller_dummy_atag_'></a>");
				this._htWElement["scroller"].append(this._elDummyTag);
			}else{
			    this._elDummyTag = this._elDummyTag.$value();
			}
		}
	},

    /**
        jindo.m.CoreScroll 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
        @param {Varient} el 엘리먼트를 가리키는 문자열이나, HTML엘리먼트
    **/
	_setWrapperElement: function(el) {
		this._htWElement = {};
		this.setLayer(el);
	},

    /**
        스크롤러를 위한 환경을 재갱신함

        @method refresh
        @param {Object} bNoRepos true 일 경우, 포지션을 갱신하지 않음
    **/
	refresh : function(bNoRepos) {

		if(!this.isActivating()) {
			return;
		}
		// wrapper와 스크롤러의 크기 판별
		// wrappwer 크기 지정
		if(this.option("nWidth")) {
			this._htWElement["wrapper"].width(parseInt(this.option("nWidth"),10));
		}
		if(this.option("nHeight")) {
			this._htWElement["wrapper"].height(parseInt(this.option("nHeight"),10));
		}
		var nWidthLeft = parseInt(this._htWElement["wrapper"].css("border-left-width"),10),
			nWidthRight = parseInt(this._htWElement["wrapper"].css("border-right-width"),10),
			nHeightTop = parseInt(this._htWElement["wrapper"].css("border-top-width"),10),
			nHeightBottom = parseInt(this._htWElement["wrapper"].css("border-bottom-width"),10);
		nWidthLeft = isNaN(nWidthLeft) ? 0 : nWidthLeft;
		nWidthRight = isNaN(nWidthRight) ? 0 : nWidthRight;
		nHeightTop = isNaN(nHeightTop) ? 0 : nHeightTop;
		nHeightBottom = isNaN(nHeightBottom) ? 0 : nHeightBottom;
		// console.log( nWidthLeft + " , " + nWidthLeft + " , " + nHeightTop + " , " + nHeightBottom  );
		this.nWrapperW = this._htWElement["wrapper"].width() - nWidthLeft - nWidthRight;
		this.nWrapperH = this._htWElement["wrapper"].height() - nHeightTop - nHeightBottom;
		this.nScrollW = this._htWElement["scroller"].width();
		this.nScrollH = this._htWElement["scroller"].height() - this.option("nOffsetBottom");

		this.nMaxScrollLeft = this.nWrapperW - this.nScrollW;
		this.nMaxScrollTop = this.nWrapperH - this.nScrollH;
		this.nMinScrollTop = -this.option("nOffsetTop");
		// console.log(this.nWrapperW + " , " + this.nWrapperH + "||" + this.nScrollW + "," + this.nScrollH);

		// 모든 A태그
		if(this.bUseHighlight && this.isClickBug) {
			this._aAnchor = jindo.$$("A", this._htWElement["scroller"].$value());
		}
		// 스크롤 여부 판별
		this.bUseHScroll = this.option("bUseHScroll") && (this.nWrapperW <= this.nScrollW);
		this.bUseVScroll = this.option("bUseVScroll") && (this.nWrapperH <= this.nScrollH);
//		console.log(this.bUseHScroll, this.bUseVScroll, this._htWElement["wrapper"].height(), this._htWElement["wrapper"].$value().offsetHeight);

		// 스크롤 여부에 따른 스타일 지정
		if(this.bUseHScroll && !this.bUseVScroll) {	// 수평인 경우
			this._htWElement["scroller"].$value().style["height"] = "100%";
		}
		if(!this.bUseHScroll && this.bUseVScroll) {	// 수직인 경우
			this._htWElement["scroller"].$value().style["width"] = "100%";
		}

		/**
		 * 범위(nRation * 2) 보다 scroller가 작을 경우는 적용되지 않는다.
		 */
		this._bUseDynamicScroll = false;
		if(this.option("sListElement") && !(this.bUseVScroll && this.bUseHScroll) ) {
			var nRange = this.option("nRatio") * 2;
			if( this.bUseVScroll && (this.nScrollH > (this.nWrapperH * nRange)) ) {
				this._createDynamicScrollPlugin("V");
			} else if( this.bUseHScroll && (this.nScrollW > (this.nWrapperW * nRange)) ) {
				this._createDynamicScrollPlugin("H");
			}
		}

		if(!this.bUseHScroll && !this.bUseVScroll) { // 스크롤이 발생하지 않은 경우, 안드로이드인경우 포지션을 못잡는 문제
			this._fixPositionBug();
		}
		if(!bNoRepos) {
			this.restorePos(0);
		}
		// console.log(this.bUseVScroll + " , " + this.bUseHScroll);
		// console.log(this._htWElement["scroller"].toString());
	},

    /**
        jindo.m.DynamicScrollPlugin 생성
        @param  {String} sDirection V(수직), H(수평)
    **/
	_createDynamicScrollPlugin : function(sDirection) {
		if(!this._oDynamicScrollPlugin) {
			// alert("createDynamicScrollPlugin---");
			this._oDynamicScrollPlugin = new jindo.m.DynamicPlugin(this._htWElement["wrapper"], {
				nRatio : this.option("nRatio"),
				sListElement : this.option("sListElement"),
				sDirection : sDirection
			});
		}
		this._oDynamicScrollPlugin.refresh(sDirection == "V" ? this._nTop : this._nLeft);
		this.option("bUseTimingFunction", false);
		this._bUseDynamicScroll = true;
	},

    /**
        스크롤의 위치를 지정함
        @param {Number} nLeft
        @param {Number} nTop
    **/
	_setPos : function(nLeft,nTop) {
		var sDirection;
		nLeft = this.bUseHScroll ? nLeft : 0;
		nTop = this.bUseVScroll ? nTop : 0;
        // console.log("setPos : " + this._nLeft + ", " + this._nTop + ", (nLeft,nTop) : " + nLeft + ", " + nTop);
		if(this._bUseDynamicScroll) {
			sDirection = this._checkDirection(nLeft,nTop);
		}
		/**
            스크롤러 위치 변경되기 전

            @event beforePosition
            @param {String} sType 커스텀 이벤트명
            @param {Number} nLeft Scroller의 left 값
            @param {Number} nTop Scroller의 top 값
            @param {Number} nMaxScrollLeft Scroller의 최대 left 값
            @param {Number} nMaxScrollTop Scroller의 최대 top 값
            @param {Function} stop 수행시 position 이벤트가 발생하지 않음
        **/
		if (this._fireEvent("beforePosition")) {
			this._isControling = true;
			this._nLeft = nLeft;
			this._nTop = nTop;
			if(this._bUseDynamicScroll) {
				this._oDynamicScrollPlugin.updateListStatus(sDirection, this.bUseVScroll ? this._nTop : this._nLeft);
			}
			if(this.option("bUseTranslate")) {
				if (this.bUseHighlight && this.isPositionBug) {
					var htStyleOffset = this.getStyleOffset(this._htWElement["scroller"]);
					nLeft -= htStyleOffset.left;
					nTop -= htStyleOffset.top;
				}
				this._htWElement["scroller"].css("-" + this.sCssPrefix + "-transform", "translate" + this.sTranOpen + nLeft + "px, " + nTop + "px" + this.sTranEnd);
			} else {
				this._htWElement["scroller"].css({
					"left" : nLeft + "px",
					"top" : nTop + "px"
				});
			}
			// this.tick();
			 /**
                스크롤러 위치 변경된 후

                @event position
                @param {String} sType 커스텀 이벤트명
                @param {Number} nLeft Scroller의 left 값
                @param {Number} nTop Scroller의 top 값
                @param {Number} nMaxScrollLeft Scroller의 최대 left 값
                @param {Number} nMaxScrollTop Scroller의 최대 top 값
                @param {Function} stop 수행시 영향을 받는것이 없음
            **/
			this._fireEvent("position");
		}
	},

	_checkDirection : function(nLeft, nTop) {
		var nBeforePos = this.bUseVScroll ? this._nTop : this._nLeft,
			nAfterPos = this.bUseVScroll ? nTop : nLeft,
			sDirection;
		if(nBeforePos > nAfterPos) {
        	sDirection = "forward";
        } else {
        	sDirection = "backward";
        }
        return sDirection;
	},

    /**
        스크롤영역으로 복원함

        @method restorePos
        @param {Number} nDuration
    **/
	restorePos : function(nDuration) {
		if(!this.bUseHScroll && !this.bUseVScroll) {
			return;
		}
		// 최대, 최소범위 지정
		var nNewLeft = this.getPosLeft(this._nLeft),
			nNewTop = this.getPosTop(this._nTop);

		if (nNewLeft === this._nLeft && nNewTop === this._nTop) {
			/* 최종 종료 시점 */
			this._isControling = false;
			 /**
                스크롤러 위치 변경이 최종적으로 끝났을 경우

                @event afterScroll
                @param {String} sType 커스텀 이벤트명
                @param {Number} nLeft Scroller의 left 값
                @param {Number} nTop Scroller의 top 값
                @param {Number} nMaxScrollLeft Scroller의 최대 left 값
                @param {Number} nMaxScrollTop Scroller의 최대 top 값
                @param {Function} stop 수행시 영향을 받는것이 없음
            **/
			this._fireEvent("afterScroll");
			this._fixPositionBug();
			return;
		} else {
			this.scrollTo(nNewLeft, nNewTop , nDuration);
		}
	},

    /**
        모멘텀을 계산하여 앞으로 이동할 거리와 시간을 속성으로 갖는 객체를 반환함
        @param {Number} nDistance
        @param {Number} nSpeed
        @param {Number} nMomentum
        @param {Number} nSize
        @param {Number} nMaxDistUpper
        @param {Number} nMaxDistLower
    **/
	_getMomentum: function (nDistance, nSpeed, nMomentum, nSize, nMaxDistUpper, nMaxDistLower) {
		var nDeceleration = this.option("nDeceleration"),
			nNewDist = nMomentum / nDeceleration,
			nNewTime = 0,
			nOutsideDist = 0;
		//console.log("momentum : " + nDistance + ", " + nSpeed + ", " + nMomentum + ",  " + nSize + ", " + nMaxDistUpper + " , " + nMaxDistLower + ", " + nNewDist);
		if (nDistance < 0 && nNewDist > nMaxDistUpper) {
			nOutsideDist = nSize / (6 / (nNewDist / nSpeed * nDeceleration));
			nMaxDistUpper = nMaxDistUpper + nOutsideDist;
			nSpeed = nSpeed * nMaxDistUpper / nNewDist;
			nNewDist = nMaxDistUpper;
		} else if (nDistance > 0 && nNewDist > nMaxDistLower) {
			nOutsideDist = nSize / (6 / (nNewDist / nSpeed * nDeceleration));
			nMaxDistLower = nMaxDistLower + nOutsideDist;
			nSpeed = nSpeed * nMaxDistLower / nNewDist;
			nNewDist = nMaxDistLower;
		}
		nNewDist = nNewDist * (nDistance > 0 ? -1 : 1);
		nNewTime = nSpeed / nDeceleration;
		//console.log("momentum nSpeed : " + nSpeed + ", nMomentum : " + nMomentum + ", nNewDist : " + nNewDist + ", nTop : " + this._nTop + ", nNewTime : " + nNewTime);
		return {
			nDist: nNewDist,
			nTime: Math.round(nNewTime)
		};
	},

    /**
        애니메이션을 초기화한다.
    **/
	_stop : function() {
		if(this.option("bUseTimingFunction")) {
			jindo.m.detachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
		} else {
			cancelAnimationFrame(this._nAniTimer);
		}
		this._aAni = [];
		this._isAnimating = false;
		this._isStop = true;
	},

    /**
        스크롤을 해당 위치(nLeft, nTop)로 이동한다.
        @remark 최상위의 위치는 0,0 이다.<br />
            스크롤의 내용을 아래로 내리거나, 오른쪽으로 이동하려면 - 값을 주어야 한다.

        @method scrollTo
        @param {Number} nLeft -일 경우, 스크롤 내용이 오른쪽으로 이동한다.
        @param {Number} nTop -일 경우, 스크롤 내용이 아래로 이동한다.
        @param {Number} nDuration
        @history 1.1.0 Update nLeft, nTop 값이 양수일 경우 아래쪽, 오른쪽 방향으로 가도록 변경(음수일 경우 "절대값"으로 계산됨)

    **/
	scrollTo: function (nLeft, nTop , nDuration) {
		this._stop();
		nLeft = this.bUseHScroll ? nLeft : 0;
		nTop = this.bUseVScroll ? nTop : 0;
		this._aAni.push({
			nLeft: nLeft,
			nTop: nTop,
			nDuration: nDuration || 0
		});
		this._animate();
	},

    /**
        동작 여부를 반환

        @method isMoving
        @return {Boolean}  동작 여부
    **/
	isMoving : function() {
		return this._isControling;
	},

    /**
        애니메이션을 호출한다.
    **/
	_animate : function() {
		var self = this,
			oStep;
		if (this._isAnimating) {
			return;
		}
		if(!this._aAni.length) {
			this.restorePos(300);
			return;
		}
		// 동일할 경우가 아닐때 까지 큐에서 Step을 뺌.
		do {
			oStep = this._aAni.shift();
			if(!oStep) {
				return;
			}
		} while( oStep.nLeft == this._nLeft && oStep.nTop == this._nTop );

		if(oStep.nDuration == 0) {
			if (this.option("bUseTimingFunction")) {
				this._transitionTime(0);
			}
			this._setPos(oStep.nLeft, oStep.nTop);
			this._animate();
		} else {
			// this.start();
			this._isAnimating = true;
			// Transition을 이용한 animation
			if (this.option("bUseTimingFunction")) {
				this._transitionTime(oStep.nDuration);
				this._setPos(oStep.nLeft, oStep.nTop);
				this._isAnimating = false;
				jindo.m.attachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
			} else {
				// AnimationFrame을 이용한 animation
				var startTime = (new Date()).getTime(),
					nStartLeft = this._nLeft, nStartTop = this._nTop;
				(function animate () {
					var now = (new Date()).getTime(),nEaseOut;
					if (now >= startTime + oStep.nDuration) {
						self._setPos(oStep.nLeft, oStep.nTop);
						self._isAnimating = false;
						self._animate();
						return;
					}
					now = (now - startTime) / oStep.nDuration - 1;
					nEaseOut = Math.sqrt(1 - Math.pow(now,2));
					self._setPos((oStep.nLeft - nStartLeft) * nEaseOut + nStartLeft, (oStep.nTop - nStartTop) * nEaseOut + nStartTop);
					if (self._isAnimating) {
						self._nAniTimer = requestAnimationFrame(animate);
					}
				})();
			}
		}
	},

    /**
        transition duration 지정
        @param {Nubmer} nDuration
    **/
	_transitionTime: function (nDuration) {
		nDuration += 'ms';
		this._htWElement["scroller"].css("-" + this.sCssPrefix + "-transition-duration", nDuration);
		this._fireEventSetDuration(nDuration);
	},

    /**
        Anchor 삭제. for iOS
    **/
	_clearAnchor : function() {
		// console.log("clear : " + !!this._aAnchor + " | " + this._bBlocked + " | " + this.isClickBug);
		if(this.isClickBug && this._aAnchor && !this._bBlocked) {
			var aClickAddEvent = null;
			for(var i=0, nILength=this._aAnchor.length; i<nILength; i++) {
				if(!this._aAnchor[i].___isClear___) {
					if (this._fnDummyFnc !== this._aAnchor[i].onclick) {
						this._aAnchor[i]._onclick = this._aAnchor[i].onclick;
					}
					this._aAnchor[i].onclick = this._fnDummyFnc;
					this._aAnchor[i].___isClear___ = true;
					aClickAddEvent = this._aAnchor[i].___listeners___ || [];
					for(var j=0, nJLength = aClickAddEvent.length; j<nJLength; j++) {
						___Old__removeEventListener___.call(this._aAnchor[i], "click", aClickAddEvent[j].listener, aClickAddEvent[j].useCapture);
					}
				}
			}
			this._bBlocked = true;
			// addConsole("삭제");
		}
	},

    /**
        Anchor 복원. for iOS
    **/
	_restoreAnchor : function() {
		//console.log("restore : " + this._aAnchor + " , " + this._bBlocked);
		if(this.isClickBug && this._aAnchor && this._bBlocked) {
			var aClickAddEvent = null;
			for(var i=0, nILength=this._aAnchor.length; i<nILength; i++) {
				if(this._aAnchor[i].___isClear___) {
					if(this._fnDummyFnc !== this._aAnchor[i]._onclick) {
						this._aAnchor[i].onclick = this._aAnchor[i]._onclick;
					} else {
						this._aAnchor[i].onclick = null;
					}
					this._aAnchor[i].___isClear___ = null;
					aClickAddEvent = this._aAnchor[i].___listeners___ || [];
					for(var j=0, nJLength = aClickAddEvent.length; j<nJLength; j++) {
						___Old__addEventListener___.call(this._aAnchor[i], "click", aClickAddEvent[j].listener, aClickAddEvent[j].useCapture);
					}
				}
			}
			this._bBlocked = false;
			// addConsole("복");
		}
	},

    /**
        이동중 멈추는 기능. 이때 멈춘 위치의 포지션을 지정
    **/
	_stopScroll : function() {
		var htCssOffset = jindo.m.getCssOffset(this._htWElement["scroller"].$value()),
			htStyleOffset ={left : 0, top : 0}, nTop, nLeft;

		if(this.isPositionBug && this.bUseHighlight || !this.option("bUseTranslate")) {
			htStyleOffset = this.getStyleOffset(this._htWElement["scroller"]);
		}

		nLeft = htCssOffset.left + htStyleOffset.left;
		nTop = htCssOffset.top + htStyleOffset.top;
		// addConsole(nLeft + "," + this._nLeft + "|" + nTop + "," +this._nTop);
		if(nLeft !== parseInt(this._nLeft,10) || nTop !== parseInt(this._nTop,10)) {
			this._stop();
			this._setPos(this.getPosLeft(nLeft), this.getPosTop(nTop));
			this._isControling = false;
			this._fireEvent("afterScroll");
			this._fixPositionBug();
		}
	},

    /**
        Style의 left,top을 반환함

        @method getStyleOffset
        @param {jindo.$Element} wel
    **/
	getStyleOffset : function(wel) {
		var nLeft = parseInt(wel.css("left"),10),
			nTop = parseInt(wel.css("top"),10);
		nLeft = isNaN(nLeft) ? 0 : nLeft;
		nTop = isNaN(nTop) ? 0 : nTop;
		return {
			left : nLeft,
			top : nTop
		};
	},

    /**
        Boundary를 초과하지 않는 X (left) 포지션 반환

        @method getPosLeft
        @param {Number{}} nPos
    **/
	getPosLeft : function(nPos) {
		return (nPos >= 0 ? 0 : (nPos <= this.nMaxScrollLeft ? this.nMaxScrollLeft : nPos) );
	},

    /**
        Boundary를 초과하지 않는 Y (top) 포지션 반환

        @method getPosTop
        @param {Number{}} nPos
    **/
	getPosTop : function(nPos) {
		return (nPos >= this.nMinScrollTop ? this.nMinScrollTop : (nPos <= this.nMaxScrollTop ? this.nMaxScrollTop : nPos) );
	},


    /**
        setDuration 사용자 이벤트 호출
    **/
	_fireEventSetDuration : function(nDuration) {

		this.fireEvent("setDuration", {
			nDuration: nDuration,
			bUseHScroll : this.bUseHScroll,
			bUseVScroll : this.bUseVScroll
		});
	},

    /**
        beforeScroll 사용자 이벤트 호출
    **/
	_fireEventbeforeScroll : function(htParam) {
	       /**
            touchEnd시 스크롤인 경우, 스크롤러의 위치가 변경되기 전
            여기에서 넘어가는 파라미터를 변경시, 변경된 값이 스크롤러의 위치 변경에 영향을 미침

            @event beforeScroll
            @param {String} sType 커스텀 이벤트명
            @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리.(touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
            @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리.(touchStart좌표에서 위쪽방향이면 양수, 아래쪽 방향이면 음수)
            @param {Number} nMomentumX 가속 발생 구간일 경우 현재 터치 움직임의 수평방향 운동에너지값,가속 구간이 아닐경우 0
            @param {Number} nMomentumY 가속 발생 구간일 경우 현재 터치 움직임의 수직방향 운동에너지값,가속 구간이 아닐경우 0
            @param {Number} nLeft Scroller의 left 값
            @param {Number} nTop Scroller의 top 값
            @param {Number} nNextLeft 가속 발생시, 변경될 scroller의 left값 (가속 미발생시, nLeft와 동일)
            @param {Number} nNextTop 가속 발생시, 변경될 scroller의 top값 (가속 미발생시, nTop와 동일)
            @param {Number} nTime 가속 발생시, 가속이 적용될 ms시간 (가속 미발생시, 0)
            @param {Function} stop 수행시 scroll 이벤트가 발생하지 않음
        **/
		return this.fireEvent("beforeScroll", htParam);
	},

    /**
        scroll 사용자 이벤트 호출
    **/
	_fireEventScroll : function(htParam) {
	    /**
            touchEnd시 스크롤인 경우, 스크롤러의 위치가 변경된 후
            여기에서 넘어가는 파라미터를 변경시, 변경된 값이 스크롤러의 위치 변경에 영향을 미침

            @event scroll
            @param {String} sType 커스텀 이벤트명
            @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리.(touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
            @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리.(touchStart좌표에서 위쪽방향이면 양수, 아래쪽 방향이면 음수)
            @param {Number} nMomentumX 가속 발생 구간일 경우 현재 터치 움직임의 수평방향 운동에너지값,가속 구간이 아닐경우 0
            @param {Number} nMomentumY 가속 발생 구간일 경우 현재 터치 움직임의 수직방향 운동에너지값,가속 구간이 아닐경우 0
            @param {Number} nLeft Scroller의 left 값
            @param {Number} nTop Scroller의 top 값
            @param {Number} nNextLeft 가속 발생시, 변경될 scroller의 left값 (가속 미발생시, nLeft와 동일)
            @param {Number} nNextTop 가속 발생시, 변경될 scroller의 top값 (가속 미발생시, nTop와 동일)
            @param {Number} nTime 가속 발생시, 가속이 적용될 ms시간 (가속 미발생시, 0)
            @param {Function} stop 수행시 영향을 받는것이 없음
        **/
		this.fireEvent("scroll", htParam);
	},

    /**
        범용 사용자 이벤트 호출
    **/
	_fireEvent : function(sType) {
		return this.fireEvent(sType, {
			nLeft : this._nLeft,
			nTop : this._nTop,
			nMaxScrollLeft : this.nMaxScrollLeft,
			nMaxScrollTop : this.nMaxScrollTop
		});
	},

    /**
        범용 touch 사용자 이벤트
    **/
	_fireTouchEvent : function(sType, we) {
		return this.fireEvent(sType, {
			nLeft : this._nLeft,
			nTop : this._nTop,
			nMaxScrollLeft : this.nMaxScrollLeft,
			nMaxScrollTop : this.nMaxScrollTop,
			oEvent : we
		});
	},

    /**
        Touchstart시점 이벤트 핸들러
        @param {jindo.$Event} we
    **/
	_onStart : function(we) {
		// console.log	("touchstart (" + we.nX + "," + we.nY + ") this._isAnimating " + this._isAnimating);
		this._clearPositionBug();
		/**
                touchStart 내부 스크롤로직이 실행되기 전

                @event beforeTouchStart
                @param {String} sType 커스텀 이벤트명
                @param {Number} nLeft Scroller의 left 값
                @param {Number} nTop Scroller의 top 값
                @param {Number} nMaxScrollLeft Scroller의 최대 left 값
                @param {Number} nMaxScrollTop Scroller의 최대 top 값
                @param {jindo.$Event} oEvent touchStart 이벤트 객체
                @param {Function} stop 수행시 touchStart 이벤트가 발생하지 않음
            **/
		if(this._fireTouchEvent("beforeTouchStart",we)) {
			this._clearAnchor();
			this._isAnimating = false;
			this._isControling = true;
			this._isStop = false;
			if (this.option("bUseTimingFunction")) {
				this._transitionTime(0);
			}
			// 이동중 멈추었을 경우
			this._stopScroll();
			// addConsole("start : " + this._isStop);
			/**
                touchStart 내부 스크롤로직이 실행된 후

                @event touchStart
                @param {String} sType 커스텀 이벤트명
                @param {Number} nLeft Scroller의 left 값
                @param {Number} nTop Scroller의 top 값
                @param {Number} nMaxScrollLeft Scroller의 최대 left 값
                @param {Number} nMaxScrollTop Scroller의 최대 top 값
                @param {jindo.$Event} oEvent touchStart 이벤트 객체
                @param {Function} stop 수행시 영향을 받는것이 없음
            **/
			if(!this._fireTouchEvent("touchStart",we)) {
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
		this._clearTouchEnd();
		// addConsole("move : " + we.sMoveType);
		// console.log("touchmove (" + we.nX + "," + we.nY + "), Vector (" + we.nVectorX + "," + we.nVectorY + ") sMoveType : " + we.sMoveType);
		/** 시스템 스크롤 막기 */
		var weParent = we.oEvent;
		if(we.sMoveType === jindo.m.MOVETYPE[0]) {	//수평이고, 수평스크롤인 경우 시스템 스크롤 막기
			if(this.bUseHScroll) {
				if( !this.option("bUseBounce") && ( (this._nLeft >= 0 && we.nVectorX > 0) || (this._nLeft <= this.nMaxScrollLeft && we.nVectorX < 0) )  ) {
					this._forceRestore(we);
					return;
				} else {
					weParent.stop(jindo.$Event.CANCEL_ALL);
				}
			} else {
				return true;
			}
		} else if(we.sMoveType === jindo.m.MOVETYPE[1]) {	//수직이고, 수직스크롤인 경우 시스템 스크롤 막기
			if(this.bUseVScroll) {
				if( !this.option("bUseBounce") && ( (this._nTop >= this.nMinScrollTop && we.nVectorY > 0) || (this._nTop <= this.nMaxScrollTop && we.nVectorY < 0) )  ) {
					this._forceRestore(we);
					return;
				} else {
					weParent.stop(jindo.$Event.CANCEL_ALL);
				}
			} else {
				return true;
			}
		} else if(we.sMoveType === jindo.m.MOVETYPE[2]) {	//대각선일 경우, 시스템 스크롤 막기
			weParent.stop(jindo.$Event.CANCEL_ALL);
		} else {	// 탭, 롱탭인 경우, 다 막기
			weParent.stop(jindo.$Event.CANCEL_ALL);
			return true;
		}
        /**
            touchMove 내부 스크롤로직이 실행되기 전

            @event beforeTouchMove
            @param {String} sType 커스텀 이벤트명
            @param {Number} nLeft Scroller의 left 값
            @param {Number} nTop Scroller의 top 값
            @param {Number} nMaxScrollLeft Scroller의 최대 left 값
            @param {Number} nMaxScrollTop Scroller의 최대 top 값
            @param {jindo.$Event} oEvent touchMove  이벤트 객체
            @param {Function} stop 수행시 move 이벤트가 발생하지 않음
        **/
		if (this._fireTouchEvent("beforeTouchMove",we)) {
			var nNewLeft, nNewTop;
			this._clearPositionBug();
			if(this.option("bUseBounce")) {
				nNewLeft = this._nLeft + (this._nLeft >=0 || this._nLeft <= this.nMaxScrollLeft ? we.nVectorX/2 : we.nVectorX);
				nNewTop = this._nTop + (this._nTop >= this.nMinScrollTop || this._nTop <= this.nMaxScrollTop ? we.nVectorY/2 : we.nVectorY);
				/** 갤럭시S3에서는 상단영역을 벗어나면 touchEnd가 발생하지 않음
				 * 상단영역 30이하로 잡힐 경우 복원
				 */
				// if (this.bUseVScroll && we.nY <= 30 && !this.bUseHScroll) {
				// 	this._forceRestore(we);
				// 	return;
				// }
				var self=this;
				this._nTouchEndTimer = setTimeout(function() {
					// addConsole("안타나?");
					self._forceRestore(we);
				},500);
			} else {
				nNewLeft = this.getPosLeft(this._nLeft + we.nVectorX);
				nNewTop = this.getPosTop(this._nTop + we.nVectorY);
			}
			this._setPos(nNewLeft, nNewTop);
			/**
                touchMove 내부 스크롤로직이 실행된 후

                @event touchMove
                @param {String} sType 커스텀 이벤트명
                @param {Number} nLeft Scroller의 left 값
                @param {Number} nTop Scroller의 top 값
                @param {Number} nMaxScrollLeft Scroller의 최대 left 값
                @param {Number} nMaxScrollTop Scroller의 최대 top 값
                @param {jindo.$Event} oEvent touchMove  이벤트 객체
                @param {Function} stop 수행시 영향을 받는것이 없음
            **/
			if(!this._fireTouchEvent("touchMove",we)) {
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
		// console.log("touchend [" + we.sMoveType + "](" + we.nX + "," + we.nY + "), Vector(" + we.nVectorX + "," + we.nVectorY + "), MomentumY : "+ we.nMomentumY + ", speedY : " + we.nSpeedY);
		// addConsole("OnEndProcess");
		/**
            touchEnd 내부 스크롤로직이 실행되기 전

            @event beforeTouchEnd
            @param {String} sType 커스텀 이벤트명
            @param {Number} nLeft Scroller의 left 값
            @param {Number} nTop Scroller의 top 값
            @param {Number} nMaxScrollLeft Scroller의 최대 left 값
            @param {Number} nMaxScrollTop Scroller의 최대 top 값
            @param {jindo.$Event} oEvent touchEnd 이벤트 객체
            @param {Function} stop 수행시 touchEnd 이벤트가 발생하지 않음
        **/
		if (this._fireTouchEvent("beforeTouchEnd",we)) {
			this._clearPositionBug();
			this._clearTouchEnd();
			// addConsole("end : " + we.sMoveType);
			// 1) 스크롤인 경우
			if (we.sMoveType === jindo.m.MOVETYPE[0] || we.sMoveType === jindo.m.MOVETYPE[1] || we.sMoveType === jindo.m.MOVETYPE[2]) {
				this._endForScroll(we);
				if(this.isClickBug || this.nVersion < 4.1) {
					we.oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
				}
			} else {	// 2) 스크롤이 아닌 경우
				// 클릭 이후 페이지 뒤로 돌아왔을 경우, 문제가됨. 동작중인 상태를 초기화함
				this._isControling = false;
				if (!this._isStop) {
					if(this.bUseHighlight) {
						this._restoreAnchor();
					}
				}
			}
			/**
                touchEnd 내부 스크롤로직이 실행된 직후

                @event touchEnd
                @param {String} sType 커스텀 이벤트명
                @param {Number} nLeft Scroller의 left 값
                @param {Number} nTop Scroller의 top 값
                @param {Number} nMaxScrollLeft Scroller의 최대 left 값
                @param {Number} nMaxScrollTop Scroller의 최대 top 값
                @param {jindo.$Event} oEvent touchEnd 이벤트 객체
                @param {Function} 수행시 영향 받는것 없음.
            **/
			if(!this._fireTouchEvent("touchEnd",we)) {
				we.stop();
			}
		} else {
			we.stop();
		}
	},

    /**
        스크롤을 강제로 복귀한다.
        @param  {jindo.$Event} we 이벤트
    **/
	_forceRestore : function(we) {
		we.nMomentumX = we.nMomentumY = null;
		this._endForScroll(we);
		this._clearPositionBug();
		this._clearTouchEnd();
	},

    /**
        touchEnd 시점 스크롤 처리
        @param {jindo.$Event} we
    **/
	_endForScroll : function(we) {
		clearTimeout(this._nFixedDubbleEndBugTimer);

		var htMomentumX = { nDist:0, nTime:0 },
			htMomentumY = { nDist:0, nTime:0 },
			htParam = {
				nMomentumX : we.nMomentumX,
				nMomentumY : we.nMomentumY,
				nDistanceX : we.nDistanceX,
				nDistanceY : we.nDistanceY,
				nLeft : this._nLeft,
				nTop : this._nTop
			};
		if (this.option("bUseMomentum") && (we.nMomentumX || we.nMomentumY) ) {
			if (this.bUseHScroll) {
				htMomentumX = this._getMomentum(-we.nDistanceX, we.nSpeedX, we.nMomentumX, this.nWrapperW, -this._nLeft, -this.nMaxScrollLeft + this._nLeft);
			}
			if (this.bUseVScroll) {
				htMomentumY = this._getMomentum(-we.nDistanceY, we.nSpeedY, we.nMomentumY, this.nWrapperH, -this._nTop, -this.nMaxScrollTop + this._nTop);
			}
			htParam.nNextLeft = this._nLeft + htMomentumX.nDist;
			htParam.nNextTop = this._nTop + htMomentumY.nDist;
			htParam.nTime = Math.max(Math.max(htMomentumX.nTime, htMomentumY.nTime),10);
			if (this._fireEventbeforeScroll(htParam)) {
				if(this.option("bUseBounce")) {
					this.scrollTo(htParam.nNextLeft, htParam.nNextTop, htParam.nTime);
				} else {
					this.scrollTo(this.getPosLeft(htParam.nNextLeft), this.getPosTop(htParam.nNextTop), htParam.nTime);
				}
				this._fireEventScroll(htParam);
			}
		} else {
			htParam.nNextLeft = this._nLeft;
			htParam.nNextTop = this._nTop;
			htParam.nTime = 0;
			if (this._fireEventbeforeScroll(htParam)) {
				if( this._nLeft !== htParam.nNextLeft || this._nTop !== htParam.nNextTop ) {
					this.scrollTo(htParam.nNextLeft, htParam.nNextTop, htParam.nTime);
				} else {
					this.restorePos(300);
				}
				this._fireEventScroll(htParam);
			}
		}
	},

    /**
        TransitionEnd 이벤트 핸들러
        @param {jindo.$Event} we
    **/
	_onTransitionEnd : function(we) {
		jindo.m.detachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
		this._animate();
	},

    /**
        스크롤 도중 scroll 영역 바깥을 선택하였을시, 스크롤을 중지시킴
        @param {jindo.$Event} we
    **/
	_onDocumentStart : function(we) {
		if(this._htWElement["wrapper"].visible()) {
			if(this._htWElement["wrapper"].isChildOf(we.element)) {
					return true;
			} else {
				// 전체 스크롤 사용시 막음
				this._stopScroll();
			}
		}
	},

    /**
        jindo.m.CoreScroll 컴포넌트를 활성화한다.
        activate 실행시 호출됨
    **/
	_onActivate : function() {
		if(!this._oTouch) {
			this._oTouch = new jindo.m.Touch(this._htWElement["wrapper"].$value(), {
				nMoveThreshold : 0,
				nMomentumDuration : (jindo.m.getDeviceInfo().android ? 500 : 200),
				nTapThreshold : 1,
				nSlopeThreshold : 5,
				nEndEventThreshold : (jindo.m.getDeviceInfo().win8 ? 100 : 0)
			});
		} else {
			this._oTouch.activate();
		}
		this._attachEvent();
		this.refresh();
	},

    /**
        jindo.m.CoreScroll 컴포넌트를 비활성화한다.
        deactivate 실행시 호출됨
    **/
	_onDeactivate : function() {
		this._detachEvent();
		this._oTouch.deactivate();
	},

    /**
        jindo.m.CoreScroll 에서 사용하는 모든 이벤트를 바인드한다.
    **/
	_attachEvent : function() {
		this._htEvent = {};
		/* Touch 이벤트용 */
		this._htEvent["touchStart"] = jindo.$Fn(this._onStart, this).bind();
		this._htEvent["touchMove"] = jindo.$Fn(this._onMove, this).bind();
		this._htEvent["touchEnd"] = jindo.$Fn(this._onEnd, this).bind();
		this._htEvent["TransitionEnd"] = jindo.$Fn(this._onTransitionEnd, this).bind();
		this._htEvent["document"] = jindo.$Fn(this._onDocumentStart, this).attach(document, "touchstart");
		this._oTouch.attach({
			touchStart : this._htEvent["touchStart"],
			touchMove : this._htEvent["touchMove"],
			touchEnd :  this._htEvent["touchEnd"]
		});
	},

    /**
        안드로이드 계열 버그
        css3로 스타일 변경 후, 하이라이트안되는 문제
        [해결법] transition관련 property를 null로 처리
     *       offset 변경
     *       a tag focus 하면 됨
    **/
	_fixPositionBug : function() {
		if(this.isPositionBug && this.bUseHighlight && this.option("bUseTranslate")) {
			var self = this;
			this._clearPositionBug();
			this._nFixedPositionBugTimer = setTimeout(function() {
				if(self._htWElement && self._htWElement["scroller"]) {
					self.makeStylePos(self._htWElement["scroller"]);
					if(self.nVersion < 3) {
						self._elDummyTag.focus();
					}
				}
			}, 200);
		}
		// this.end();
	},

    /**
        translate의 포지션을 스타일로 바꾼다.

        @method makeStylePos
        @param {jindo.$Element} wel
    **/
	makeStylePos : function(wel) {
		var ele = wel.$value();
		var htCssOffset = jindo.m.getCssOffset(ele);
		var htScrollOffset = wel.offset();
		if(this.nVersion >= 4) {
			ele.style["-" + this.sCssPrefix + "-transform"] = "translate" + this.sTranOpen + "0px, 0px" + this.sTranEnd;
		} else {
			ele.style["-" + this.sCssPrefix + "-transform"] = null;
		}
        ele.style["-" + this.sCssPrefix + "-transition-duration"] = null;
		//alert(htCssOffset.top + " , " + htCssOffset.left + " --- " + htScrollOffset.top + " , " + htScrollOffset.left);
		wel.offset(htCssOffset.top + htScrollOffset.top, htCssOffset.left + htScrollOffset.left);
	},

    /**
        android인 경우, 버그수정 timer를 제거
    **/
	_clearPositionBug : function() {
		if(this.isPositionBug && this.bUseHighlight) {
			clearTimeout(this._nFixedPositionBugTimer);
			this._nFixedPositionBugTimer = -1;
		}
	},

	_clearTouchEnd : function() {
		clearTimeout(this._nTouchEndTimer);
		this._nTouchEndTimer = -1;
	},

    /**
        jindo.m.CoreScroll 에서 사용하는 모든 이벤트를 해제한다.
    **/
	_detachEvent : function() {
		jindo.m.detachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
		this._htEvent["document"].detach(document,"touchstart");
		this._oTouch.detachAll();
		if (this._elDummyTag) {
			this._htWElement["scroller"].remove(this._elDummyTag);
		}
	},

	/** Temporary **/
	/** FPS 확인 Start **/
    // start : function() {
    //     this._nCount = 0;
    //     this._nElapse = 0;
    //     this._nStart = Date.now();
    //     this._aData = [];
    // },

    // _fps : function() {
    //     if (this._nElapse > 300) {
    //         var cur = this._nCount / (this._nElapse / 1000);
    //         this._aData.push(cur);
    //         var nSum = 0;
    //         for(var i=0, nLength = this._aData.length; i< nLength; i++) {
    //				nSum += this._aData[i];
    //         }
    //         var o = {
    //             cur: cur,
    //             max: Math.max.apply(null, this._aData),
    //             min: Math.min.apply(null, this._aData),
    //             avg : nSum / this._aData.length
    //         };
    //         console.log("FPS current : " + o.cur + ", max : " + o.max + ", min : " + o.min + ", avg : " + o.avg);
    //         return o;
    //     }
    // },

    // end : function() {
    //     return this._fps();
    // },

    // tick : function() {
    //     var now = Date.now();
    //     this._nCount++;
    //     this._nElapse = Date.now() - this._nStart;
    //     return this._fps();
    // },
    /** FPS 확인 End **/

    /**
        jindo.m.CoreScroll 에서 사용하는 모든 객체를 release 시킨다.
        @method destroy
    **/
	destroy: function() {
		this.deactivate();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
		this._oTouch.destroy();
		delete this._oTouch;
	}
}).extend(jindo.m.UIComponent);