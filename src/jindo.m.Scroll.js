/**
	@fileOverview 페이지의 고정영역 내부를 터치하여 스크롤링 할 수 있는 컴포넌트
	@author sculove
	@version #__VERSION__#
	@since 2011. 8. 18.
*/
/**
	페이지의 고정영역 내부를 터치하여 스크롤링 할 수 있는 컴포넌트

	@class jindo.m.Scroll
	@extends jindo.m.UIComponent
	@uses jindo.m.Touch, jindo.m.Effect
	@keyword scroll, 스크롤
	@group Component
	@Update

    @history 1.16.0 Bug scrollTo 함수 호출 시 beforePosition / position 이벤트가 중복 발생 하던것을 한번만 발생하도록 수정
    @history 1.16.0 Bug scrollTo 함수 호출시 현재 위치와 동일한 위치로 정의시 beforePosition/position 이벤트가 발생하지 않도록 변경
    @history 1.16.0 Bug 갤럭시S3 에서 scrollbar 가 사라지지 않는 문제 수정
	@history 1.16.0 Bug 동일 엘리먼트에 인스턴스를 계속 생성할 경우, 계속 scrollbar가 생성되는 문제 수정
	@history 1.16.0 Support jindo 2.10.0 이후 변경된 offset 수정건에 대한 대응
	@history 1.15.0 Update 터치와 애니메이션 관련 이벤트에 nMaxScrollLeft, nMaxScrollTop 속성 추가
	@history 1.15.0 Bug beforePosition, position 이벤트 속성 미노출 문제 수정
	@history 1.15.0 Bug refresh 이후, 스크롤 바가 계속 보이는 문제 수정
	@history 1.15.0 Bug 회전시, view size보다 scroller size가 작아서 스크롤이 안되는 경우 위치오류 수정
	@history 1.15.0 Bug iOS 7.0이상시 클릭 안되는 버그 수정
	@history 1.14.0 Update fEffect 추가
	@history 1.14.0 Update bUseTranslate 옵션 제거
	@history 1.14.0 Update Kitkat 하이라이트 이슈 수정
	@history 1.14.0 Update beforePosition nNextLeft, nNextTop, nVectorX, nVectorY 속성 추가
	@history 1.14.0 Update rotate 이벤트 추가
	@history 1.13.0 Support Firefox 브라우저 지원
	@history 1.11.0 Bug view와 scroller의 크기가 같고, 스크롤바를 사용할 경우, 스크립트 오류 수정
	@history 1.11.0 Bug beforePosition 이벤트에서 stop 을 해도 updater 가 계속 동작되는 오류 수정
	@history 1.10.0 Bug 대용량 플러그인 사용시, bUseTimingFunction=true일 경우, 스크롤의 모멘텀이 되지 않는 오류 수정
	@history 1.10.0 Bug bUseTimingFunction=true일 경우, scrollTo로 이동시 스크롤바가 움직이지 않는 버그 수정
	@history 1.10.0 Bug bUseTimingFunction=true일 경우, 스크롤이 멈추었을 때 움찔거리는 문제 제거
	@history 1.10.0 Bug 스크롤이 멈추었을 때 스크롤바가 노출되는 문제 수정
	@history 1.10.0 Bug iOS에서 스크롤 이후 선택이 안되는 문제 해결
	@history 1.9.0 Bug beforeTouchMove 의 발생 시점을 실제 touchMove가 발생했을 시점으로 변경
	@history 1.9.0 Bug Window8 IE10 플리킹 적용시 스크롤이 안되는 이슈 처리
	@history 1.9.0 Update Scroll 성능 개선
	@history 1.7.0 Bug bUseHighlight=fasle일 경우, 안드로이드 4.x 갤럭시 시리즈에서 하이라이트 사라지지 않는 문제 제거
	@history 1.7.0 Update base엘리먼트에 z-index = 2000으로 설정 (Css3d사용시 충돌하는 버그 수정)
	@history 1.7.0 Update 불필요 노출 메소드 deprecated<br/>
	getPosLeft, getPostTop, getStyleOffset, makeStylePos, restorPos, setLayer, setScroller
	@history 1.6.0 스크롤 컴포넌트 플러그인 구조로 구조개선
	@history 1.5.0 Bug jindo 1.5.3 이하 버전에서 대용량 스크롤시 스크롤바가 보이지 않는 문제 수정
	@history 1.5.0 Support Window Phone8 지원
	@history 1.5.0 Update  touchStart, touchMove , touchEnd 이벤트에서 중지할 경우 뒤 이벤트 안타도록 수정
	@history 1.4.0 Support iOS 6 지원
	@history 1.4.0 Update {bUseBounce} bUseBounce : false일 경우, 스크롤을 더이상 할수 없을 때 시스템 스크롤이 발생하는 기능 추가
	@history 1.4.0 Bug 가로 스크롤일경우, 터치 위치의 y가 30보다 작을경우 스크롤이 안되는 버그 수정
	@history 1.3.5 Bug 스크롤바 이동시, bUseTranslate, bUseTimingFunction 옵션 적용되도록 수정
	@history 1.3.5 Update 스크롤바 fade in-out 효과 제거<br />스크롤바 border-radius, opacity 효과 제거
	@history 1.3.0 Support Android 젤리빈(4.1) 대응
	@history 1.3.0 Support 갤럭시 4.0.4 업데이트 지원
	@history 1.3.0 Update Wrapper의 position이 static 일 경우, relative로 변경<br/>그외는 position이 변경되지 않도록 수정
	@history 1.3.0 Update Wrapper와 scroller가 동일하고 bUseBounce가 true인 경우, 스크롤바가 안보이고, 스크롤이 가능하도록 변경
	@history 1.3.0 Bug Scroll과 Flicking 함께 사용할때 A link가 클릭안되는 문제 수정
	@history 1.2.0 Update pullDown/pullUp 상태가 아닌 경우, pullDown/pullUp 엘리먼트를 hide시키는 UI 변경
	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Bug destroy() 호출시 Scroll객체 destroy 호출 안되는 문제 해결<br />
					중복 scroll 사용시, scroll이 정상 동작하지 않는 문제 해결<br />
					뒤로가기시 스크롤의 속성값이 초기화 되지않는 문제 해결
	@history 1.1.0 Support jindo 2.0.0 mobile 버전 지원
	@history 1.1.0 Support Android 3.0/4.0 지원
	@history 1.1.0 Update 따로 클래스명을 정의하지 않아도 wrapper내의 첫번째 엘리먼트를 무조건 Scroller 엘리먼트로 처리하도록 수정
	@history 1.1.0 Update document 선택시 wrapper이 visible이 true일 경우에만 작동하도록 수정
	@history 1.1.0 Update 스크롤 여부에 따른 마크업 지정 편의 개선 (가로스크롤은 scroller의 높이값 100% 설정, 세로스크롤 경우 scroller의 넓이값 100% 설정)
	@history 0.9.5 Bug iOS에서 클릭영역 누른 상태에서, 이동후 버튼을 놓았을시, 초기에 선택한 위치에 clickable 엘리먼트가 존재할 경우, click 되는 문제 해결
	@history 0.9.5 Update [bUseBounce] false인 경우, 이동,가속시 외부영역으로 이동되지 않도록 수정

	@history 0.9.0 Release 최초 릴리즈
**/
jindo.m.Scroll = jindo.$Class({
	/* @lends jindo.m.Scroll.prototype */
	   /**
		초기화 함수

		@constructor
		@param {String|HTMLElement} el CoreScroll할 Element (필수)
		@param {Object} [htOption] 초기화 옵션 객체
			@param {Number} [htOption.nHeight=0] Wrapper의 height값. 값이 0일 경우 wrapper의 height로 설정됨
			@param {Number} [htOption.nWidth=0] Wrapper의 width값. 값이 0일 경우 wrapper의 width로 설정됨
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
			@param {Boolean} [htOption.bUseHScroll=false] 수평 스크롤 사용 여부. 스크롤영역의 width가 wrapper의 width보다 클 경우 적용 가능함.
			@param {Boolean} [htOption.bUseVScroll=true] 수직 스크롤 사용 여부. 스크롤영역의 height가 wrapper의 height보다 클 경우 적용 가능함.
			@param {Boolean} [htOption.bUseMomentum=true] 스크롤시 가속도 사용여부
			@param {Number} [htOption.nDeceleration=0.0006] 가속도의 감속계수. 이 값이 클수록, 가속도는 감소한다
			@param {Number} [htOption.nOffsetTop=0] Scroll 컴포넌트에 적용할 상단 여백
			@param {Number} [htOption.nOffsetBottom=0] Scroll 컴포넌트에 적용할 하단 여백
			@param {Boolean} [htOption.bUseBounce=true] 가속 이동후, 바운스 처리되는 여부
			@param {Boolean} [htOption.bUseHighlight=true] 하이라이트 사용 여부
			@param {String} [htOption.sClassPrefix='scroll_'] CoreScroll 내부 엘리먼트 구분 클래스 prefix
			@param {Boolean} [htOption.bAutoResize=false] 기기 회전시, 크기 자동 재갱신
			@param {Boolean} [htOption.bUseCss3d=jindo.m._isUseCss3d()] 하드웨어 3d 가속 여부<br />
				모바일 단말기별로 다르게 설정된다. 상세내역은 <auidoc:see content="jindo.m">[jindo.m]</auidoc:see>을 참조하기 바란다.
			@param {Boolean} [htOption.bUseTimingFunction=jindo.m._isUseTimingFunction()] 스크롤 애니메이션 동작방식을 결정한다.<br />
				bUseTimingFunction가 true일 경우, CSS3로 애니메이션을 구현하고, false일 경우, 스크립트로 애니메이션을 구현한다.<br />
				모바일 단말기별로 다르게 설정된다. 상세내역은 <auidoc:see content="jindo.m">[jindo.m]</auidoc:see>을 참조하기 바란다.<br />
			@param {Boolean} [htOption.bUseTranslate=true] 컨텐츠의 좌표이동 방법을 결정한다.<br />
				bUseTranslate가 true일 경우, CSS3의 Translate으로 이동하고, false일 경우, style의 left,top으로 이동한다.
			@param {Boolean} [htOption.bUseScrollbar=true] 스크롤바 사용 여부
			@param {Boolean} [htOption.bUseFixedScrollbar=false] 고정 스크롤바 적용 여부
			@param {String} [htOption.sScrollbarBorder="1px solid white"] 스크롤바 보더 스타일을 지정
			@param {String} [htOption.sScrollbarColor="#8e8e8e"] 스크롤바의 색상을 지정
			@param {Number} [htOption.nScrollbarHideThreshold=0] 스크롤 바를 hide 시킬때 딜레이 타임
			@param {Boolean} [htOption.bUseScrollBarRadius=true] 스크롤 바의 radius 설정 여부

			@param {String} [htOption.bUsePullDown=false] pull down update 기능 사용 여부
			@param {Boolean} [htOption.bUsePullUp=false] pull up update 기능 사용 여부
			@param {Number} [htOption.fnPullDownIdle=null] bUsePullDown 가 true일 시, pullDown 미발생 시 엘리먼트를 구성하는 함수.<br />
				첫번째 파라미터로 pullDown의 jindo.$Element가 넘어져 온다.
			@param {Number} [htOption.fnPullDownBeforeUpdate=null] bUsePullDown 가 true일 시, pullDown 발생 전 엘리먼트를 구성하는 함수.<br />
				첫번째 파라미터로 pullDown의 jindo.$Element가 넘어져 온다.
			@param {Number} [htOption.fnPullDownUpdating=null] bUsePullDown 가 true일 시, pullDown 발생 시 엘리먼트를 구성하는 함수.<br />
				첫번째 파라미터로 pullDown의 jindo.$Element가 넘어져 온다.
			@param {Number} [htOption.fnPullUpIdle=null] bUsePullUp이 true일 시, pullUp 미발생 시 엘리먼트를 구성하는 함수.<br />
				첫번째 파라미터로 pullUp의 jindo.$Element가 넘어져 온다.
			@param {Number} [htOption.fnPullUpBeforeUpdate=null] bUsePullUp이 true일 시, pullUp 발생 전 엘리먼트를 구성하는 함수.<br />
				첫번째 파라미터로 pullUp의 jindo.$Element가 넘어져 온다.
			@param {Number} [htOption.fnPullUpUpdating=null] bUsePullUp이 true일 시, pullUp 발생 시 엘리먼트를 구성하는 함수.<br />
				첫번째 파라미터로 pullUp의 jindo.$Element가 넘어져 온다.

			@param {String} [htOption.sListElement=''] sListElement는 리스트의 구성요소가 되는 엘리먼트 명이다.<br />
				sListElement 옵션값을 지정한 상태에서 스크롤이 일어날 경우, 이동 경로 방향으로 고정 범위의 scroller 영역만을 동적으로 유지한다.<br />
				여기서 ‘고정범위’는 ‘화면에 보이는 View영역의 높이 X nRatio’ 옵션 값이다.<br />
				이 옵션이 적용될 경우, bUseCss3d와 bUseTimingFunction은 false값을 가진다.<br />
			@param {Number} [htOption.nRatio=1.5] sListElement가 설정되었을때, 유지하는 고정범위 비이다.
			@param {Boolean} [htOption.bUseDiagonalTouch=true] 대각선스크롤 방향의 터치도 스크롤로 사용할지 여부
			@param {Number} [htOption.nZIndex=2000] 컴포넌트 base엘리먼트 z-Index 값
		@history 1.8.0 Update [nZIndex] 옵션 추가
		@history 1.6.0 Update [bUseDiagonalTouch] Option 추가
		@history 1.5.0 Update [bUseScrollBarRadius] Option 추가
		@history 1.5.0 Update [nScrollbarHideThreshold] Option 추가
		@history 1.3.5 Update [sScrollbarBorder] Option 기본값 수정 ("1px solid rgba(255,255,255,0.9)" → "1px solid white")
		@history 1.3.5 Update [sScrollbarColor] Option 기본값 수정 ("rgba(0,0,0,0.5)" → "#8e8e8e")
		@history 1.3.0 Update [sListElement] Option 추가
		@history 1.3.0 Update [nRatio] Option 추가
		@history 1.3.0 Update [bUseTimingFunction] Option 추가
		@history 1.3.0 Update [bUseTranslate] Option 추가
		@history 1.3.0 Update [sScrollbarBorder] Option 추가
		@history 1.3.0 Update [sScrollbarColor] Option 추가
		@history 1.3.0 Update [bUseCss3d] Option 기본값 변경. 모바일 단말기에 맞게 3d 사용여부를 설정함
		@history 1.3.0 Update [bUseMomentum] Option 기본값 변경. iOS는 true, Android는 false → 모두 true
		@history 1.2.0 Update [nOffsetTop] Option 추가
		@history 1.2.0 Update [nOffsetBottom] Option 추가
		@history 1.2.0 Update [bUseTransition → bUseCss3d] Option Name 수정
		@history 1.1.0 Update [bUseTransition] Option 기본값 수정<br>iOS, 갤럭시 S2 : true, 그외 : false
		@history 1.1.0 Update [bUseHighlight] Option 추가
		@history 0.9.5 Update [bUseFixedScrollbar] Option 추가
		@history 0.9.5 Update [sClassPrefix] Option 추가
		@history 0.9.5 Update [bUseTransition] Option 추가
		@history 0.9.5 Update [sPrefix → sClassPrefix] Option명 수정
		@history 0.9.5 Update [bUseFocus] Option명 삭제
		@history 0.9.5 Update [sPullDownId] Option명 삭제
		@history 0.9.5 Update [sPullUpId] Option명 삭제

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
			bUseCss3d : jindo.m.useCss3d(true),
			bUseTimingFunction : jindo.m.useTimingFunction(true),
			// bUseTranslate : true,
			bAutoResize : false,
			bUseDiagonalTouch : true,
			fEffect : jindo.m.Effect.cubicBezier(0.18, 0.35, 0.56, 1),
			nZIndex : 2000,

			/* 대용량 옵션 */
			sListElement : '',
			nRatio : 1.5,

			/* 스크롤바 옵션 */
			bUseScrollbar : true,
			nScrollbarHideThreshold : 0,
			bUseFixedScrollbar : false,
			sScrollbarBorder : "1px solid white",
			sScrollbarColor : "#8e8e8e",
			bUseScrollBarRadius : true,

			/* PullDown/PullUp 옵션 */
			bUsePullDown : false,
			bUsePullUp : false,
			fnPullDownIdle : null,
			fnPullDownBeforeUpdate : null,
			fnPullDownUpdating : null,
			fnPullUpIdle : null,
			fnPullUpBeforeUpdate : null,
			fnPullUpUpdating : null
		});
		this.option(htUserOption || {});
		this._initVar();
		this._setWrapperElement(el);

		// if(this instanceof jindo.m.Scroll) {
		if(this.option("bActivateOnload")) {
			this.activate();
		}
		// }
		// console.log("bUseHighlight : " + this.option("bUseHighlight") + ", bUseCss3d:" + this._bUseCss3d + ", bUseTimingFunction : " + this.option("bUseTimingFunction") + ", bUseTranslate : " + this.option("bUseTranslate"));
	},

	$static: {
		SCROLLBAR_CLASS : "__scroll_for_scrollbar__"
	},

	/**
		jindo.m.Scroll 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar: function() {
		this.isPositionBug = jindo.m.hasOffsetBug();
		this.isClickBug = jindo.m.hasClickBug();
		this.nVersion = parseFloat(jindo.m.getDeviceInfo().version.substr(0,3));
		this.sCssPrefix = jindo.m.getCssPrefix();
		this._bUseCss3d = this.option("bUseCss3d");
		this.nWrapperW = null;
		this.nWrapperH = null;
		this.nScrollW = null;
		this.nScrollH = null;
		this.nMaxScrollLeft = null;
		this.nMaxScrollTop = null;
		this.nMinScrollTop = 0;
		this.bUseHScroll = null;
		this.bUseVScroll = null;
		this.bUseHighlight = this.option("bUseHighlight");
		this._nPropHScroll = null;
		this._nPropVScroll = null;

		this._nLeft = 0;
		this._nTop = 0;
		this._aAni = [];

		this._htTimer = {
			"ani" : -1,
			"fixed" : -1,
			"touch" : -1,
			"scrollbar" : -1
		};
		this._htPlugin = {
			"dynamic" : {},
			"pull" : {}
		};

		this._oTouch = null;
		this._isAnimating = false;      // 순수 animate 처리
		this._isControling = false;     // 사용자가 움직이고 있는가?
		this._isStop = false;
		this._hasJindoOffsetBug = jindo.m._hasJindoOffsetBug();

		// DynamicScroll을 사용한다고 할경우, bUseTimingFunction는 항상 false
		if(this.option("sListElement")) {
			this.option("bUseTimingFunction", false);
		}
		// this._setTrans();

		/**
		 *  하이라이트 기능을 사용할 경우에만 적용됨.
		 *  android 경우, css,offset, translate에 의해 이동된 영역의 하이라이트 및 영역이 갱신되지 않는 문제
		 * translate의 위치를 초기화하고 css, offset에 맞게 위치를 변경해준다. 또한 대상 영역하위의 a tag에 focus를 준다.
		 */
		if(this.bUseHighlight) {
			// 크롬에서 하이라이트가 남는 문제를 위해 엘리먼트를 저장
			this._hasKitkatHighlightBug = jindo.m._hasKitkatHighlightBug();
			this._nHightlightBug = -1;

			if(this.isPositionBug) {
				this._elDummyTag = null;    //for focus
			}
		}

		this._nUpdater = -1;
		this._oMoveData = {
			nLeft : 0,
			nTop : 0
		};
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
		@deprecated
		@method setLayer
		@param {Varient} el 엘리먼트를 가리키는 문자열이나, HTML엘리먼트
	**/
	setLayer : function(el) {
		this._htWElement["wrapper"] = jindo.$Element(el);
		// zIndex 2000 값 추가
		this._htWElement["wrapper"].css({
			"overflow" : "hidden",
			"zIndex" : this.option("nZIndex")
		});
		if(this._htWElement["wrapper"].css("position") == "static") {
			this._htWElement["wrapper"].css("position", "relative");
		}
		if(!this.bUseHighlight) {
			this._htWElement["wrapper"].css(jindo.m._toPrefixStr("TapHighlightColor"),"rgba(0,0,0,0)");
			// firefox에서는 사용이 안됨
		}
		this.setScroller();
	},

	/**
		스크롤러관련 엘리먼트를 설정함
		@deprecated
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
				// "pointerEvents" : "none"
		});
		// if(this.option("bUseTranslate") || this._bUseCss3d) {
		this._htWElement["scroller"].css(jindo.m._toPrefixStr("TransitionProperty"),
		 this.sCssPrefix == "" ? "transform" : "-" + this.sCssPrefix + "-transform")
			.css(this.sCssPrefix + "Transform", jindo.m._getTranslate(0,0, this._bUseCss3d));
		// }
		if(this.option("bUseTimingFunction")) {
			this._htWElement["scroller"].css(jindo.m._toPrefixStr("TransitionTimingFunction"), this.option("fEffect").toString());
			// this._htWElement["scroller"].css(jindo.m._toPrefixStr("TransitionTimingFunction"), "cubic-bezier(0.33,0.66,0.66,1)");
		}
		// 안드로이드 버그 수정 (android 2.x 이하 버젼)
		if(this.isPositionBug && this.bUseHighlight && this.nVersion < 3) {
			this._elDummyTag = this._htWElement["scroller"].query("._scroller_dummy_atag_");
			if(!this._elDummyTag) {
				this._elDummyTag = jindo.$("<a href='javascript:void(0);' style='position:absolute;height:0px;width:0px;' class='_scroller_dummy_atag_'></a>");
				this._htWElement["scroller"].append(this._elDummyTag);
			} else{
				this._elDummyTag = this._elDummyTag.$value();
			}
		}
	},

	/**
		width값을 설정하거나, 반환한다.

		@method width
		@param {Number} nValue 넓이 설정 값
	**/
	width : function(nValue) {
		if(nValue) {
			this.option("nWidth", nValue);
			this.refresh();
		} else {
			if(this.option("nWidth")) {
				return parseInt(this.option("nWidth"),10);
			} else {
				return this._htWElement["wrapper"].width();
			}
		}
	},

	/**
		height값을 설정하거나, 반환한다.

		@method height
		@param {Number} nValue 높이 설정 값
	**/
	height : function(nValue) {
		if(nValue) {
			this.option("nHeight", nValue);
			this.refresh();
		} else {
			if(this.option("nHeight")) {
				return parseInt(this.option("nHeight"),10);
			} else {
				return this._htWElement["wrapper"].height();
			}
		}
	},

	/**
		jindo.m.Scroll 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
		@param {Varient} el 엘리먼트를 가리키는 문자열이나, HTML엘리먼트
	**/
	_setWrapperElement: function(el) {
		this._htWElement = {};
		this.setLayer(el);
	},

	/**
		수평 스크롤 여부를 반환한다.
		@method hasHScroll
		@return {Boolean} 스크롤가능 여부를 반환한다.
		@history 1.2.0 Update Method 추가
	**/
	hasHScroll : function() {
		return this.bUseHScroll;
	},

	/**
		수직 스크롤 여부를 반환한다.

		@method hasVScroll
		@return {Boolean} 스크롤가능 여부를 반환한다.
		@history 1.2.0 Update Method 추가
	**/
	hasVScroll : function() {
		return this.bUseVScroll;
	},


	/**
		jindo.m.DynamicPlugin 생성 / refresh
		@param  {String} sDirection V(수직), H(수평)
	**/
	_createDynamicPlugin : function(sDirection) {
		var ht = {
			nRatio : this.option("nRatio"),
			sListElement : this.option("sListElement"),
			sDirection : sDirection
		};
		if(this._inst("dynamic")) {
			this._inst("dynamic").option(ht);
		} else {
			this._htPlugin["dynamic"].o = new jindo.m.DynamicPlugin(this._htWElement["wrapper"], ht);
		}
		this._inst("dynamic").refresh(sDirection == "V" ? this._nTop : this._nLeft);
		this.option("bUseTimingFunction", false);
		this._htPlugin["dynamic"].bUse = true;
	},

	/**
	 * 범위(nRation * 2) 보다 scroller가 작을 경우는 적용되지 않는다.
	 */
	_refreshDynamicPlugin : function() {
		this._htPlugin["dynamic"].bUse = false;
		if(this.option("sListElement") && !(this.bUseVScroll && this.bUseHScroll) ) {
			var nRange = this.option("nRatio") * 2;
			if( this.bUseVScroll && (this.nScrollH > (this.nWrapperH * nRange)) ) {
				this._createDynamicPlugin("V");
			} else if( this.bUseHScroll && (this.nScrollW > (this.nWrapperW * nRange)) ) {
				this._createDynamicPlugin("H");
			}
		}
	},

	/**
	 * Pulldown/up 기능 제
	 */
	_refreshPullPlugin : function(){
		this._htPlugin["pull"].bUse = this.option("bUsePullDown") || this.option("bUsePullUp");
		if(!this._isUse("pull")) {
			return false;
		}

		if(!this._inst("pull")) {
			this._htPlugin["pull"].o = new jindo.m.PullPlugin(this);
		}
		this._inst("pull").refresh();
		return true;
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
		this._hasKitkatHighlightBug && this._htWElement["wrapper"].addClass(jindo.m.KITKAT_HIGHLIGHT_CLASS);
		// wrapper와 스크롤러의 크기 판별
		this.option("nWidth") && this._htWElement["wrapper"].width(parseInt(this.option("nWidth"),10));
		this.option("nHeight") && this._htWElement["wrapper"].height(parseInt(this.option("nHeight"),10));

		var nWidthLeft = parseInt(this._htWElement["wrapper"].css("border-left-width"),10),
			nWidthRight = parseInt(this._htWElement["wrapper"].css("border-right-width"),10),
			nHeightTop = parseInt(this._htWElement["wrapper"].css("border-top-width"),10),
			nHeightBottom = parseInt(this._htWElement["wrapper"].css("border-bottom-width"),10);
		nWidthLeft = isNaN(nWidthLeft) ? 0 : nWidthLeft;
		nWidthRight = isNaN(nWidthRight) ? 0 : nWidthRight;
		nHeightTop = isNaN(nHeightTop) ? 0 : nHeightTop;
		nHeightBottom = isNaN(nHeightBottom) ? 0 : nHeightBottom;

		this.nWrapperW = this._htWElement["wrapper"].width() - nWidthLeft - nWidthRight;
		this.nWrapperH = this._htWElement["wrapper"].height() - nHeightTop - nHeightBottom;

		if(!this._refreshPullPlugin()) {
			this.nScrollW = this._htWElement["scroller"].width();
			this.nScrollH = this._htWElement["scroller"].height() - this.option("nOffsetBottom");
			this.nMinScrollTop = -this.option("nOffsetTop");
			this.nMaxScrollTop = this.nWrapperH - this.nScrollH;
		}
		this.nMaxScrollLeft = this.nWrapperW - this.nScrollW;

		// 스크롤 여부 판별
		this.bUseHScroll = this.option("bUseHScroll") && (this.nWrapperW <= this.nScrollW);
		this.bUseVScroll = this.option("bUseVScroll") && (this.nWrapperH <= this.nScrollH);
//      console.log(this.bUseHScroll, this.bUseVScroll, this._htWElement["wrapper"].height(), this._htWElement["wrapper"].$value().offsetHeight);

		// 스크롤 여부에 따른 스타일 지정
		if(this.bUseHScroll && !this.bUseVScroll) { // 수평인 경우
			this._htWElement["scroller"].$value().style["height"] = "100%";
		}
		if(!this.bUseHScroll && this.bUseVScroll) { // 수직인 경우
			this._htWElement["scroller"].$value().style["width"] = "100%";
		}

		// Pulgin refresh
		this._refreshDynamicPlugin();

		// 스크롤바 refresh (없을시 자동 생성)
		if(this.option("bUseScrollbar")) {
			this._refreshScroll("V");
			this._refreshScroll("H");
		}

		// 스크롤이 발생하지 않은 경우, 안드로이드인경우 포지션을 못잡는 문제
		(!this.bUseHScroll && !this.bUseVScroll) && this._fixPositionBug();

		(!bNoRepos) && this.restorePos(0);
	},

	/**
		스크롤의 위치를 지정함
		@param {Number} nLeft
		@param {Number} nTop
	**/
	_setPos : function(nLeft,nTop) {
		var sDirection;
		nLeft = this.bUseHScroll ? parseInt(nLeft,10) : 0;
		nTop = this.bUseVScroll ? parseInt(nTop,10) : 0;
		// console.log("setPos : " + this._nLeft + ", " + this._nTop + ", (nLeft,nTop) : " + nLeft + ", " + nTop, typeof this._nTop, typeof nTop);
		this._isUse("dynamic") && (sDirection = this._checkDirection(nLeft,nTop));

		var htParam = {
			nLeft : this._nLeft,
			nTop : this._nTop,
			nNextLeft : nLeft,
			nNextTop : nTop,
			nVectorX : nLeft - this._nLeft,
			nVectorY : nTop - this._nTop,
			nMaxScrollLeft : this.nMaxScrollLeft,
			nMaxScrollTop : this.nMaxScrollTop
		};
		/**
			스크롤러 위치 변경되기 전 발생한다.<br>
			<font color="#E11B10">bUseTimingFunction</font>이 <font color="#E11B10">true</font>일 경우에는 가속시 이벤트가 발생하지 않는다.

			@event beforePosition
			@param {String} sType 커스텀 이벤트명
			@param {Number} nLeft Scroller의 left 값
			@param {Number} nTop Scroller의 top 값
			@param {Number} nNextLeft 변경될 scroller의 left값
			@param {Number} nNextTop 변경될 scroller의 top값
			@param {Number} nVectorX Left의 Vector값
			@param {Number} nVectorY Top의 Vector값
			@param {Number} nMaxScrollLeft Scroller의 최대 left 값
			@param {Number} nMaxScrollTop Scroller의 최대 top 값
			@param {Function} stop 수행시 position 이벤트가 발생하지 않음
		**/
		if (this.fireEvent("beforePosition", htParam)) {
			this._isControling = true;
			this._nLeft = nLeft = htParam.nNextLeft;
			this._nTop = nTop = htParam.nNextTop;
			this._isUse("dynamic") && this._inst("dynamic").updateListStatus(sDirection, this.bUseVScroll ? this._nTop : this._nLeft);

			// if(this.option("bUseTranslate")) {
			if (this.bUseHighlight && this.isPositionBug) {
				var htStyleOffset = this.getStyleOffset(this._htWElement["scroller"]);
				nLeft -= htStyleOffset.left;
				nTop -= htStyleOffset.top;
			}
			this._htWElement["scroller"].css(jindo.m._toPrefixStr("Transform"), jindo.m._getTranslate(nLeft + "px", nTop + "px",this._bUseCss3d));
			// } else {
			//     this._htWElement["scroller"].css({
			//         "left" : nLeft + "px",
			//         "top" : nTop + "px"
			//     });
			// }

			if(this.option("bUseScrollbar")) {
				// this._htTimer["scrollbar"] = clearTimeout(this._htTimer["scrollbar"]);
				this._setScrollBarPos("V", this._nTop);
				this._setScrollBarPos("H", this._nLeft);
			}
			this._oMoveData = {
				nLeft : this._nLeft,
				nTop : this._nTop
			};

			 /**
				스크롤러 위치 변경된 후, 발생한다.<br>
				<font color="#E11B10">bUseTimingFunction</font>이 <font color="#E11B10">true</font>일 경우에는 가속시 이벤트가 발생하지 않는다.

				@event position
				@param {String} sType 커스텀 이벤트명
				@param {Number} nLeft Scroller의 left 값
				@param {Number} nTop Scroller의 top 값
				@param {Number} nMaxScrollLeft Scroller의 최대 left 값
				@param {Number} nMaxScrollTop Scroller의 최대 top 값
				@param {Function} stop 수행시 영향을 받는것이 없음
			**/
			this.fireEvent("position", {
				nLeft : this._nLeft,
				nTop : this._nTop,
				nMaxScrollLeft : this.nMaxScrollLeft,
				nMaxScrollTop : this.nMaxScrollTop
			});
		} else{
			this._isAnimating = false;
		}
	},


	/**
	 * Plugin 사용 여부 상태 조회
	 * @param {String} sName
	 */
	_isUse : function(sName) {
		return this._htPlugin[sName].bUse;
	},

	/**
	 * Plugin 객채 조
	 * @param {String} sName
	 */
	_inst : function(sName) {
		return this._htPlugin[sName].o;
	},

	/**
	 * @to-do Dynamic으로 빼고 싶음.
	 */
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
		@deprecated
		@method restorePos
		@param {Number} nDuration
	**/
	restorePos : function(nDuration) {
		// if(!this.bUseHScroll && !this.bUseVScroll) {
		// 	return;
		// }
		// 최대, 최소범위 지정

		var nNewLeft = this.getPosLeft(this._nLeft),
			nNewTop = this.getPosTop(this._nTop);
		if (nNewLeft === this._nLeft && nNewTop === this._nTop) {
			this._isControling = false;
			this._isStop = false;   // 애니메이션이 완전 종료했을 경우, isStop값을 초기화
			this._fireAfterScroll();
			this._fixPositionBug();
			return;
		} else {
			this._scrollTo(nNewLeft, nNewTop , nDuration);
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
			this._transitionTime(0);
		} else {
			cancelAnimationFrame(this._htTimer["ani"]);
			this._stopUpdater();
		}

		if(this._isAnimating){
            this._setPos(this._nLeft, this._nTop);
        }
		this._aAni = [];
		this._isAnimating = false;
		this._isStop = true;
	},

	_scrollTo: function (nLeft, nTop , nDuration) {
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
		left, top 기준으로 스크롤을 이동한다.
		스크롤을 해당 위치(nLeft, nTop)로 이동한다.<br/>
		@method scrollTo
		@param {Number} nLeft 0~양수 만 입력 가능하다. (-가 입력된 경우는 절대값으로 계산된다)
		@param {Number} nTop 0~양수 만 입력 가능하다. (-가 입력된 경우는 절대값으로 계산된다)
		@param {Number} nDuration 기본값은 0ms이다.
		@remark
			최상위의 위치는 0,0 이다. -값이 입력될 경우는 '절대값'으로 판단한다.<br/>
			스크롤의 내용을 아래로 내리거나, 오른쪽으로 이동하려면 + 값을 주어야 한다.<br/>
		@example
			oScroll.scrollTo(0,100); //목록이 아래로 100px 내려간다.
			oScroll.scrollTo(0,-100); //목록이 아래로 100px 내려간다. (절대값이 100이므로)

		@history 1.1.0 Update nLeft, nTop 값이 양수일 경우 아래쪽, 오른쪽 방향으로 가도록 변경 (음수일 경우 "절대값"으로 계산됨)

	**/

	scrollTo : function(nLeft, nTop, nDuration) {
		nDuration = nDuration || 0;
		nLeft = -Math.abs(nLeft);
		nTop = -Math.abs(nTop);
		nTop += this.getTop();

		this._scrollTo( (nLeft >= this.getLeft() ? this.getLeft() : (nLeft <= this.getRight() ? this.getRight() : nLeft) ),
			(nTop >= this.getTop() ? this.getTop() : (nTop <= this.getBottom() ? this.getBottom() : nTop) ),
			nDuration);
	},

	/**
		오른쪽 위치 반환

		@method getRight
		@return {Number} 오른쪽 위치 반환
	**/
	getRight : function() {
		return this.nMaxScrollLeft;
	},

	/**
		왼쪽 위치 반환

		@method getLeft
		@return {Number} 왼쪽 위치 반환
	**/
	getLeft : function() {
		return 0;
	},

	/**
		아래쪽 위치 반환

		@method getBottom
		@return {Number} 아래쪽 위치 반환
	**/
	getBottom : function() {
		return this.nMaxScrollTop;
	},

	/**
		위쪽 위치 반환

		@method getTop
		@return {Number} 위쪽 위치 반환
	**/
	getTop : function() {
		return this.nMinScrollTop;
	},

	/**
		동작 여부를 반환

		@method isMoving
		@return {Boolean} 동작 여부
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
			this._isAnimating = true;
			// Transition을 이용한 animation
			if (this.option("bUseTimingFunction")) {
				this._transitionTime(oStep.nDuration);
				this._setPos(oStep.nLeft, oStep.nTop);
				this._isAnimating = false;
				jindo.m.attachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
			} else {
				// AnimationFrame을 이용한 animation
				self._startUpdater();
				var startTime = (new Date()).getTime(),
					fx = this.bUseHScroll ? this.option("fEffect")(this._nLeft, oStep.nLeft) : null,
					fy = this.bUseVScroll ? this.option("fEffect")(this._nTop, oStep.nTop) : null,
					now;
				(function animate () {
					now = (new Date()).getTime();
					if (now >= startTime + oStep.nDuration) {
						// updater를 중지시키고, 바로 셋팅
						self._stopUpdater();
						self._setPos(oStep.nLeft, oStep.nTop);
						self._isAnimating = false;
						self._animate();
						return;
					}
					now = (now - startTime) / oStep.nDuration;
					self._oMoveData = {
						nLeft : fx && fx(now),
						nTop : fy && fy(now)
					};
					if (self._isAnimating) {
						self._htTimer["ani"] = requestAnimationFrame(animate);
					} else{
						self._stopUpdater();
					}
				})();
			}
		}
	},

	/**
		디바이스 회전시, 처리
		@param {jindo.$Event} we
	**/
	_onRotate : function(we) {
		/**
		  단말기가 회전될 때 발생한다

		  @event rotate
		  @param {String} sType 커스텀 이벤트명
		  @param {Boolean} isVertical 수직여부
		  @param {Function} stop 수행시 refresh가 중지됨.
		**/
		if(this.fireEvent("rotate", {
			isVertical : we.isVertical
		})) {
			this.refresh();
		}
	},


	/**
		transition duration 지정
		@param {Nubmer} nDuration
	**/
	_transitionTime: function (nDuration) {
		nDuration += 'ms';
		this._htWElement["scroller"].css(jindo.m._toPrefixStr("TransitionDuration"), nDuration);
		if(this.option("bUseScrollbar")) {
			this._setScrollbarDuration(nDuration);
		}
	},

	_setScrollbarDuration : function(nDuration) {
		if (this.bUseHScroll && this._htWElement["HscrollbarIndicator"]) {
			this._htWElement["HscrollbarIndicator"].css(jindo.m._toPrefixStr("TransitionDuration"), nDuration);
		}
		if (this.bUseVScroll && this._htWElement["VscrollbarIndicator"]) {
			this._htWElement["VscrollbarIndicator"].css(jindo.m._toPrefixStr("TransitionDuration"), nDuration);
		}
	},

	/**
		이동중 멈추는 기능. 이때 멈춘 위치의 포지션을 지정
	**/
	_stopScroll : function() {
		var htCssOffset = jindo.m.getTranslateOffset(this._htWElement["scroller"].$value()),
			htStyleOffset ={left : 0, top : 0}, nTop, nLeft;

		if(this.isPositionBug && this.bUseHighlight) {
			htStyleOffset = this.getStyleOffset(this._htWElement["scroller"]);
		}
		nLeft = htCssOffset.left + htStyleOffset.left;
		nTop = htCssOffset.top + htStyleOffset.top;
		if(!this.option("bUseFixedScrollbar")) {
			this._hideScrollBar("V");
			this._hideScrollBar("H");
		}
		// console.log(nLeft + "," + this._nLeft + "|" + nTop + "," +this._nTop);
		// if(parseInt(nLeft,10) !== parseInt(this._nLeft,10) || parseInt(nTop,10) !== parseInt(this._nTop,10)) {
			this._stopUpdater();
			this._stop();
			this._setPos(this.getPosLeft(nLeft), this.getPosTop(nTop));
			this._isControling = false;
			this._fireAfterScroll();
			this._fixPositionBug();
		// } else {
		// }
	},

	/**
		Style의 left,top을 반환함
		@deprecated
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
		@deprecated
		@method getPosLeft
		@param {Number} nPos
	**/
	getPosLeft : function(nPos) {
		if(this.bUseHScroll) {
			return (nPos >= 0 ? 0 : (nPos <= this.nMaxScrollLeft ? this.nMaxScrollLeft : nPos) );
		} else {
			return 0;
		}
	},

	/**
		Boundary를 초과하지 않는 Y (top) 포지션 반환
		@deprecated
		@method getPosTop
		@param {Number} nPos
	**/
	getPosTop : function(nPos) {
		if(this.bUseVScroll) {
			return (nPos >= this.nMinScrollTop ? this.nMinScrollTop : (nPos <= this.nMaxScrollTop ? this.nMaxScrollTop : nPos) );
		} else {
			return 0;
		}
	},

	/**
		scrollbar를 숨긴다
		@param {String} sDirect H,V 수평과 수직을 나타낸다.
	**/
	_hideScrollBar : function(sDirection) {
		if(!this._htWElement) { return; }
		var wel = this._htWElement[sDirection + "scrollbar"],
			bUseScroll = (sDirection === "H" ? this.bUseHScroll : this.bUseVScroll);
		if(bUseScroll && wel) {
			wel.hide();
			/* 갤럭시 S3인 경우 hide된 후 reflow가 발생하지 않으면 스크롤바가 사라지지 않는다. */
			wel.$value().offsetHeight;
//			wel.css("left",wel.css("left") + "px");
			if(this.isPositionBug && this.bUseHighlight) {
				this.makeStylePos(this._htWElement[sDirection + "scrollbarIndicator"]);
			}
		}

	},

	_fireAfterScroll : function() {
		if (this.option("bUseScrollbar")) {
			var self = this;
			this._htTimer["scrollbar"] = setTimeout(function(){
				if(!self.option("bUseFixedScrollbar")) {
					self._hideScrollBar("V");
					self._hideScrollBar("H");
				}
			}, this.option('nScrollbarHideThreshold'));
		}
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
	},

	/**
		범용 사용자 이벤트 호출
	**/
	_fireEvent : function(sType) {
		return this.fireEvent(sType, this._getNowPosition());
	},

	/**
		범용 touch 사용자 이벤트
	**/
	_fireTouchEvent : function(sType, we) {
		return this.fireEvent(sType, this._getNowPosition(we));
	},

	/**
	 * 공통 현재 위치 정보 return 처리
	 */
	_getNowPosition : function(we) {
		return {
			nLeft : this._nLeft,
			nTop : this._nTop,
			nMaxScrollLeft : this.nMaxScrollLeft,
			nMaxScrollTop : this.nMaxScrollTop,
			oEvent : we || {}
		};
	},

	 /**
		pullDown 사용여부를 지정할수 있습니다.

		@method setUsePullDown
		@param {Boolean} bUse pullDown 사용여부
	**/
	setUsePullDown : function(bUse) {
		if(this._isUse("pull")) {
			this.option("bUsePullDown", bUse);
			this.refresh();
		}
	},

	/**
		pullUp 사용여부를 지정할 수 있습니다.

		@method setUsePullUp
		@param {Boolean} bUse PullUp 사용여부
	**/
	setUsePullUp : function(bUse) {
		if(this._isUse("pull")) {
			this.option("bUsePullUp", bUse);
			this.refresh();
		}
	},

	_onUpdater : function(we) {
		// if(this._isActivateUpdater) {
		// console.debug("updater...");
		if(this._oMoveData.nLeft != this._nLeft || this._oMoveData.nTop != this._nTop) {
			// console.log("updating",this._oMoveData.nTop, this._nTop, this._oMoveData.nLeft ,this._nLeft );
			this._setPos(this._oMoveData.nLeft, this._oMoveData.nTop);
		}
		// }
		this._startUpdater();
	},

	_startUpdater : function() {
		this._stopUpdater();
		this._nUpdater = window.requestAnimationFrame(this._htEvent["updater"]);
		// console.debug("start-updater");
	},

	_stopUpdater : function() {
		window.cancelAnimationFrame(this._nUpdater);
		this._nUpdater = -1;
		// console.debug("stop-updater");
	},

	/**
		Touchstart시점 이벤트 핸들러
		@param {jindo.$Event} we
	**/
	_onStart : function(we) {
		// console.log  ("touchstart (" + we.nX + "," + we.nY + ") this._isAnimating " + this._isAnimating);
		this._clearPositionBug();
		/**
			touchStart 내부 스크롤로직이 실행되기 전

			@event beforeTouchStart
			@param {String} sType 커스텀 이벤트명
			@param {Number} nLeft Scroller의 left 값
			@param {Number} nTop Scroller의 top 값
			@param {Number} nMaxScrollLeft Scroller의 최대 left 값
			@param {Number} nMaxScrollTop Scroller의 최대 top 값
			@param {Object} oEvent jindo.m.Touch의 touchStart 속성과 동일
        <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchStart">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
			@param {Function} stop 수행시 touchStart 이벤트가 발생하지 않음
		**/
		this._isStop = false;
		// this._htWElement["scroller"].css("pointerEvents","none");
		if(this._fireTouchEvent("beforeTouchStart",we)) {
			// this._clearAnchor();

			if (this.option("bUseTimingFunction")) {
				this._transitionTime(0);
			}
			// console.log(this._isAnimating, this._isControling);
			// 이동중 멈추었을 경우
			this._isAnimating && this._stopScroll() && (this._isAnimating = false);
			this._isControling = true;

			/**
				touchStart 내부 스크롤로직이 실행된 후

				@event touchStart
				@param {String} sType 커스텀 이벤트명
				@param {Number} nLeft Scroller의 left 값
				@param {Number} nTop Scroller의 top 값
				@param {Number} nMaxScrollLeft Scroller의 최대 left 값
				@param {Number} nMaxScrollTop Scroller의 최대 top 값
				@param {Object} oEvent jindo.m.Touch의 touchStart 속성과 동일
        <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchStart">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
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
		var nNewLeft=0, nNewTop =0;
		this._clearTouchEnd();
		this._clearPositionBug();
		// console.log("touchmove (" + we.nX + "," + we.nY + "), Vector (" + we.nVectorX + "," + we.nVectorY + ") sMoveType : " + we.sMoveType);

		/**
		 *  iOS를 위한 anchor 처리
		 * ios일 경우, touchstart시 선택된 영역에 anchor가 있을 경우, touchend 시점에 touchstart영역에 click이 타는 문제
		 * 모든 a link에 bind된, onclick 이벤트를 제거한다. => eventPoints으로 해결
		 */
		this.isClickBug && this._htWElement["scroller"].css("pointerEvents","none");
		/**
			touchMove 내부 스크롤로직이 실행되기 전

			@event beforeTouchMove
			@param {String} sType 커스텀 이벤트명
			@param {Number} nLeft Scroller의 left 값
			@param {Number} nTop Scroller의 top 값
			@param {Number} nMaxScrollLeft Scroller의 최대 left 값
			@param {Number} nMaxScrollTop Scroller의 최대 top 값
			@param {Object} oEvent jindo.m.Touch의 touchMove 속성과 동일
        <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchMove">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
			@param {Function} stop 수행시 move 이벤트가 발생하지 않음
		**/
		if (this._fireTouchEvent("beforeTouchMove",we)) {
			if(this._isUse("pull")) {
				this._inst("pull").touchMoveForUpdate(we, this.nMaxScrollTop);
			}
			/** 시스템 스크롤 막기 */
			var weParent = we.oEvent;
			if(we.sMoveType === jindo.m.MOVETYPE[0]) {  //수평이고, 수평스크롤인 경우 시스템 스크롤 막기
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
			} else if(we.sMoveType === jindo.m.MOVETYPE[1]) {   //수직이고, 수직스크롤인 경우 시스템 스크롤 막기
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
			} else if(we.sMoveType === jindo.m.MOVETYPE[2]) {   //대각선일 경우, 시스템 스크롤 막기
				if(this.option('bUseDiagonalTouch')){
					weParent.stop(jindo.$Event.CANCEL_ALL);
				} else{
					return;
				}
			} else {    // 탭, 롱탭인 경우, 다 막기
				weParent.stop(jindo.$Event.CANCEL_ALL);
				return true;
			}

			if(this.option("bUseBounce")) {
				if(this.bUseHScroll) {
					nNewLeft = this._nLeft + (this._nLeft >=0 || this._nLeft <= this.nMaxScrollLeft ? we.nVectorX/2 : we.nVectorX);
				}
				if(this.bUseVScroll) {
					nNewTop = this._nTop + (this._nTop >= this.nMinScrollTop || this._nTop <= this.nMaxScrollTop ? we.nVectorY/2 : we.nVectorY);
				}
				/** 갤럭시S3에서는 상단영역을 벗어나면 touchEnd가 발생하지 않음
				 * 상단영역 30이하로 잡힐 경우 복원
				 */
				var self=this;
				this._htTimer["touch"] = setTimeout(function() {
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
				@param {Object} oEvent jindo.m.Touch의 touchMove 속성과 동일
        <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchMove">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
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
			@param {Object} oEvent jindo.m.Touch의 touchEnd 속성과 동일
        <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchEnd">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
			@param {Function} stop 수행시 touchEnd 이벤트가 발생하지 않음
		**/

		if(this._isUse("pull")){
			this._inst("pull").pullUploading();
		}

		if (this._fireTouchEvent("beforeTouchEnd",we)) {
			this._clearPositionBug();
			this._clearTouchEnd();
			// addConsole("end : " + we.sMoveType);
			// 1) 스크롤인 경우
			if (we.sMoveType === jindo.m.MOVETYPE[0] || we.sMoveType === jindo.m.MOVETYPE[1] || we.sMoveType === jindo.m.MOVETYPE[2]) {
				this._endForScroll(we);
				if(this.nVersion < 4.1) {
					we.oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
				}
			} else {    // 2) 스크롤이 아닌 경우
				// 클릭 이후 페이지 뒤로 돌아왔을 경우, 문제가됨. 동작중인 상태를 초기화함
				this._isControling = false;
				if (!this._isStop) {
					// if(this.bUseHighlight) {
						// this._restoreAnchor();
					// }
					this._tapHighlight();
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
				@param {Object} oEvent jindo.m.Touch의 touchEnd 속성과 동일
        <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchEnd">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
				@param {Function} 수행시 영향 받는것 없음.
			**/
			if(!this._fireTouchEvent("touchEnd",we)) {
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
		this.isClickBug && this._htWElement["scroller"].css("pointerEvents","auto");
	},

	_tapHighlight : function(){
		if(this._hasKitkatHighlightBug) {
			this._htWElement["wrapper"].removeClass(jindo.m.KITKAT_HIGHLIGHT_CLASS);
			// 하이라이트가 안나오는 경우가 있음. 네이버 인앱...강제 reflow발생
			this._htWElement["wrapper"]._element.clientHeight;
			var self = this;
			clearTimeout(this._nHightlightBug);
			this._nHightlightBug = setTimeout(function() {
				self._htWElement["wrapper"].addClass(jindo.m.KITKAT_HIGHLIGHT_CLASS);
			},200);
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
			@param {Number} nMaxScrollLeft Scroller의 최대 left 값
			@param {Number} nMaxScrollTop Scroller의 최대 top 값
			@param {Function} stop 수행시 scroll 이벤트가 발생하지 않음
		**/
		var htMomentumX = { nDist:0, nTime:0 },
			htMomentumY = { nDist:0, nTime:0 },
			htParam = {
				nMomentumX : we.nMomentumX,
				nMomentumY : we.nMomentumY,
				nDistanceX : we.nDistanceX,
				nDistanceY : we.nDistanceY,
				nLeft : this._nLeft,
				nTop : this._nTop,
				nMaxScrollLeft : this.nMaxScrollLeft,
				nMaxScrollTop : this.nMaxScrollTop
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
			if (this.fireEvent("beforeScroll", htParam)) {
				if(this.option("bUseBounce")) {
					this._scrollTo(htParam.nNextLeft, htParam.nNextTop, htParam.nTime);
				} else {
					this._scrollTo(this.getPosLeft(htParam.nNextLeft), this.getPosTop(htParam.nNextTop), htParam.nTime);
				}
				// this.fireEvent("scroll",htParam);
			}
		} else {
			htParam.nNextLeft = this._nLeft;
			htParam.nNextTop = this._nTop;
			htParam.nTime = 0;
			if (this.fireEvent("beforeScroll", htParam)) {
				if( this._nLeft !== htParam.nNextLeft || this._nTop !== htParam.nNextTop ) {
					this._scrollTo(htParam.nNextLeft, htParam.nNextTop, htParam.nTime);
				} else {
					this.restorePos(300);
				}
				// this.fireEvent("scroll",htParam);
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
				// console.info(this._isAnimating, this._isControling);
				if(this._isAnimating && this._isControling) {
					this._stopScroll();
				}
			}
		}
	},

	/**
		jindo.m.Scroll 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		if(!this._oTouch) {
			this._oTouch = new jindo.m.Touch(this._htWElement["wrapper"].$value(), {
				nMoveThreshold : 0,
				nMomentumDuration : (jindo.m.getDeviceInfo().android ? 500 : 200),
				nUseDiagonal : 0,
				nTapThreshold : 1,
				nSlopeThreshold : 5,
				nEndEventThreshold : (jindo.m.getDeviceInfo().win8 ? 100 : 0),
				bHorizental : this.option("bUseHScroll"),
				bVertical : this.option("bUseVScroll")
			});
		} else {
			this._oTouch.activate();
		}
		this._attachEvent();
		this.refresh();
	},

	/**
		jindo.m.Scroll 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEvent();
		this._oTouch.deactivate();
	},

	/**
		jindo.m.Scroll 에서 사용하는 모든 이벤트를 바인드한다.
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
		if(this.option("bAutoResize")) {
			this._htEvent["rotate"] = jindo.$Fn(this._onRotate, this).bind();
			jindo.m.bindRotate(this._htEvent["rotate"]);
		}

		if(!this.option("bUseTimingFunction")) {
			this._htEvent["updater"] = jindo.$Fn(this._onUpdater, this).bind();
		}
	},

	/**
		안드로이드 계열 버그
		css3로 스타일 변경 후, 하이라이트안되는 문제
		[해결법] transition관련 property를 null로 처리
	 *       offset 변경
	 *       a tag focus 하면 됨
	**/
	_fixPositionBug : function() {
		if(this.isPositionBug && this.bUseHighlight) {
			var self = this;
			this._clearPositionBug();
			this._htTimer["fixed"] = setTimeout(function() {
				if(self._htWElement && self._htWElement["scroller"]) {
					self.makeStylePos(self._htWElement["scroller"]);
					if(self.nVersion <= 3) {
						self._elDummyTag.focus();
					}
				}
			}, 200);
		}
		// this.end();
	},

	/**
		translate의 포지션을 스타일로 바꾼다.
		@deprecated
		@method makeStylePos
		@param {jindo.$Element} wel
	**/
	makeStylePos : function(wel) {
		var ele = wel.$value();
		var htCssOffset = jindo.m.getTranslateOffset(ele);
		var htScrollOffset = wel.offset();
		if(this.nVersion >= 4) {
			ele.style[jindo.m._toPrefixStr("Transform")] = jindo.m._getTranslate(0,0,this._bUseCss3d);
		} else {
			ele.style[jindo.m._toPrefixStr("Transform")] = null;
		}
		ele.style[jindo.m._toPrefixStr("TransitionDuration")] = null;
		//alert(htCssOffset.top + " , " + htCssOffset.left + " --- " + htScrollOffset.top + " , " + htScrollOffset.left);

		// jindo 버전이 2.10.0 이하일때.
		if(this._hasJindoOffsetBug){
		    wel.offset(htCssOffset.top + htScrollOffset.top, htCssOffset.left + htScrollOffset.left);
		} else {
		    wel.offset(htScrollOffset.top, htScrollOffset.left);
		}
	},

	/**
		android인 경우, 버그수정 timer를 제거
	**/
	_clearPositionBug : function() {
		if(this.isPositionBug && this.bUseHighlight) {
			clearTimeout(this._htTimer["fixed"]);
			this._htTimer["fixed"] = -1;
		}
	},

	_clearTouchEnd : function() {
		clearTimeout(this._htTimer["touch"]);
		this._htTimer["touch"] = -1;
	},

	/**
		jindo.m.Scroll 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEvent : function() {
		jindo.m.detachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
		this._htEvent["document"].detach(document,"touchstart");

		if(this.option("bAutoResize")) {
			jindo.m.unbindRotate(this._htEvent["rotate"]);
		}

		this._oTouch.detachAll();
		if (this._elDummyTag) {
			this._htWElement["scroller"].remove(this._elDummyTag);
		}
		if(!this.option("bUseTimingFunction")) {
			this._stopUpdater();
		}
	},


	/**
		스크롤바를 생성한다.
		@param {String} sDirection 수평, 수직 방향
	**/
	_createScroll : function(sDirection) {
		if( !(sDirection === "H" ? this.bUseHScroll : this.bUseVScroll) ) {
			return;
		}
		var welWrapper = this._htWElement["wrapper"],
			welScrollbar  = jindo.$Element(welWrapper.query("div." + jindo.m.Scroll.SCROLLBAR_CLASS)),
			welScrollbarIndicator;

		// 기존에 존재하면 삭제
		if(welScrollbar) {
			welWrapper.remove(welScrollbar);
			welScrollbar = this._htWElement[sDirection + "scrollbar"] = this._htWElement[sDirection + "scrollbarIndicator"] = null;
		}
		// scrollbar $Element 생성
		welScrollbar = this._createScrollbar(sDirection);
		welScrollbarIndicator = this._createScrollbarIndicator(sDirection);
		this._htWElement[sDirection + "scrollbar"]= welScrollbar;
		this._htWElement[sDirection + "scrollbarIndicator"] = welScrollbarIndicator;
		welScrollbar.append(welScrollbarIndicator);
		welWrapper.append(welScrollbar);
		// scrollbar 갱신
		// this._refreshScroll(sDirection);
	},

	/**
		스크롤바 Wrapper를 생성한다
		@param {String} sDirection
	**/
	_createScrollbar : function(sDirection) {
		var welScrollbar = jindo.$Element("<div class='" + jindo.m.Scroll.SCROLLBAR_CLASS + "'>");
		welScrollbar.css({
			"position" : "absolute",
			"zIndex" : 100,
			"bottom" : (sDirection === "H" ? "1px" : (this.bUseHScroll ? '7' : '2') + "px"),
			"right" : (sDirection === "H" ? (this.bUseVScroll ? '7' : '2') + "px" : "1px"),
			"pointerEvents" : "none"
			// "overflow" : "hidden"
		});
		if(this.option("bUseFixedScrollbar")) {
			welScrollbar.show();
		} else {
			welScrollbar.hide();
		}
		if (sDirection === "H") {
			welScrollbar.css({
				height: "5px",
				left: "2px"
			});
		} else {
			welScrollbar.css({
				width: "5px",
				top: "2px"
			});
		}
		return welScrollbar;
	},

	/**
		스크롤바 Indicator를 생성한다.
		@param {String} sDirection
	**/
	_createScrollbarIndicator : function(sDirection) {
		// scrollbar Indivator 생성
		var welScrollbarIndicator = jindo.$Element("<div>").css({
			"position" : "absolute",
			"zIndex" : 100,
			"border": this.option("sScrollbarBorder"),
			"pointerEvents" : "none",
			"left" : 0,
			"top" : 0,
			"backgroundColor" : this.option("sScrollbarColor")});
		if(jindo.m.getOsInfo().ios && this.option('bUseScrollBarRadius')) {
			welScrollbarIndicator.css(jindo.m._toPrefixStr("BorderRadius"), "12px");
		}
		// if(this._bUseCss3d) {
		welScrollbarIndicator.css(jindo.m._toPrefixStr("TransitionProperty"), this.sCssPrefix == "" ? "transform" : "-" + this.sCssPrefix + "-transform")
			.css(jindo.m._toPrefixStr("Transform"), jindo.m._getTranslate(0,0,this._bUseCss3d));
		// }
		if(this.option("bUseTimingFunction")) {
			welScrollbarIndicator.css(jindo.m._toPrefixStr("TransitionTimingFunction"), this.option("fEffect").toString());
		}
		if(sDirection === "H") {
			welScrollbarIndicator.height(5);
		} else {
			welScrollbarIndicator.width(5);
		}
		return  welScrollbarIndicator;
	},

	/**
		스크롤 바의 상태를 갱신한다.
		@param {String} sDirection 수평, 수직 방향
	**/
	_refreshScroll : function(sDirection) {
		// 스크롤이 사용 불가하거나, 사이즈가 동일한 경우는 스크롤바를 생성하지 않는다.
		if(sDirection === "H") {
			if(!this.bUseHScroll || this.nWrapperW == this.nScrollW) {
				return;
			}
		} else {
			if(!this.bUseVScroll || this.nWrapperH == this.nScrollH) {
				return;
			}
		}
		// 스크롤바가 존재하지 않을 경우 새로 생성함
		if(!this._htWElement[sDirection + "scrollbar"]) {
			this._createScroll(sDirection);
		}
		var welScrollbar = this._htWElement[sDirection + "scrollbar"],
			welScrollbarIndicator = this._htWElement[sDirection + "scrollbarIndicator"],
			nSize = 0;
		if(sDirection === "H" ) {
			nSize = Math.max(Math.round(Math.pow(this.nWrapperW,2) / this.nScrollW), 8);
			this._nPropHScroll = (this.nWrapperW - nSize) / this.nMaxScrollLeft;
			welScrollbar.width(this.nWrapperW);
			welScrollbarIndicator.width(isNaN(nSize) ? 0 : nSize);
		} else {
			nSize = Math.max(Math.round(Math.pow(this.nWrapperH,2) / this.nScrollH), 8);
			this._nPropVScroll = (this.nWrapperH - nSize) / this.nMaxScrollTop;
			welScrollbar.height(this.nWrapperH);
			welScrollbarIndicator.height(isNaN(nSize) ? 0 : nSize);
		}
	},

	_setScrollBarPos: function (sDirection, nPos) {
		if(!(sDirection === "H" ? this.bUseHScroll : this.bUseVScroll)) {
			return;
		}
		var welIndicator = this._htWElement[sDirection + "scrollbarIndicator"],
			welScrollbar = this._htWElement[sDirection + "scrollbar"];

		// indicator, scrollbar가 존재하지 않을 경우
		if(!welIndicator || !welScrollbar) {
			return;
		}

		nPos = this["_nProp" + sDirection + 'Scroll'] * nPos;
		if(!this.option("bUseFixedScrollbar") && welScrollbar && !welScrollbar.visible()) {
			welScrollbar.show();

			// timingfunction으로 이동시 랜더링을 재갱신하면 애니메이션이 동작한다.
			if(this.option("bUseTimingFunction")) {
				welScrollbar.$value().clientHeight;
			}
		}
		if(welIndicator) {
			if (this.isPositionBug && this.bUseHighlight)  {
				var nBufferPos = parseInt( ( sDirection === "H" ? welIndicator.css("left") : welIndicator.css("top") ), 10);
				nPos -= isNaN(nBufferPos) ? 0 : nBufferPos;
			}
			welIndicator.css(jindo.m._toPrefixStr("Transform"),
				jindo.m._getTranslate(sDirection == "H" ? nPos + "px" : 0, sDirection == "H" ? 0 : nPos + "px", this._bUseCss3d));
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
	//              nSum += this._aData[i];
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
		jindo.m.Scroll 에서 사용하는 모든 객체를 release 시킨다.
		@method destroy
	**/
	destroy: function() {
		this.deactivate();
		this.detachAll();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
		this._oTouch.destroy();
		delete this._oTouch;
	}
}).extend(jindo.m.UIComponent);