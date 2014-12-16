/**
	@fileOverview 슬라이드효과를 통해 좌,우에 존재하는 메뉴를 나타나게하는 템플릿
	@author sculove
	@version #__VERSION__#
	@since 2012. 6. 13.
**/
/**
	슬라이드효과를 통해 좌,우에 존재하는 메뉴를 나타나게하는 템플릿

	@class jindo.m.RevealSidebarUI
	@extends jindo.m.UIComponent
	@uses jindo.m.Scroll
	@uses jindo.m.SlideReveal
	@keyword revealsidebar
	@invisible
  
    @history 1.11.0 Bug DOM 구조를 한쪽 방향으로만 이용할 경우 참조 오류 수정
	@history 1.10.0 Update SlideReveal로 구조 변경
	@history 1.9.0 Bug rs-left나 rs-right가 지정되지 않더라도 동작하도록 수정
	@history 1.9.0 Bug 안드로이드 2.x이하 버전 offset 버그 수정
  @history 1.9.0 Bug slide/restore 중복 호출시 상태값 이상 오류 수정
  @history 1.7.0 Bug 안드로이드 4.x 갤럭시 시리즈에서 하이라이트 사라지지 않는 문제 제거
	@history 1.4.0 Support iOS 6 지원
	@history 1.3.0 Release 최초 릴리즈
**/
jindo.m.RevealSidebarUI = jindo.$Class({
	/* @lends jindo.m.RevealSidebarUI.prototype */

	/**
		초기화 함수

		@constructor
		@param {Varient} el Main 엘리먼트 (필수)
		@param {Object} [htOption] 초기화 옵션 객체
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
			@param {Number} [htOption.nSildeThreshold=50] 좌,우 메뉴 슬라이드후 보여지는 영역 크기
			@param {String} [htOption.sDefaultArea="main"] 초기 화면 상태 <ul>
				<li>"left" : 좌측 메뉴가 열려있는 상태</li>
				<li>"main" : 좌,우측 메뉴가 모두 닫혀있는 상태</li>
				<li>"right" : 우측 메뉴가 열려있는 상태</li></ul>
			@param {Function} [htOption.htScrollOption={}] Scroll 생성시 초기화 옵션, [jindo.m.Scroll] 참고
			@param {Number} [htOption.nSlideDuration=200] 슬라이드 효과 시간 (ms)
			@param {Function} [htOption.bUseCss3d=jindo.m._isUseCss3d()] 하드웨어 3d 가속 여부<br />
				모바일 단말기별로 다르게 설정된다.<br />
				ios, 갤럭시s3 에서는 true, 크롬및 안드로이드에서는 false
			@param {Function} [htOption.bUseTimingFunction=jindo.m._isUseTimingFunction()]
				애니메이션 동작방식을 결정한다.<br />
				bUseTimingFunction가 true일 경우, CSS3로 애니메이션을 구현하고, false일 경우, 스크립트로 애니메이션을 구현한다.<br />
				모바일 단말기별로 다르게 설정된다.<br />
				ios true, 크롬및 안드로이드에서는 false
	**/
	$init : function(el, htOption) {
		this.option({
			bActivateOnload : true,
			nSildeThreshold : 50,
			sDefaultArea : "main",
			htScrollOption : {},
			nSlideDuration : 200,
			bUseCss3d : jindo.m._isUseCss3d(),
			bUseTimingFunction : jindo.m._isUseTimingFunction()
		});
		this.option(htOption || {});
		this._initVar();
		this._setWrapperElement(el);
		this._initComponent();
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},

	/**
		jindo.m.RevealSidebarUI 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar : function() {
		// this._oTransition = new jindo.m.Transition({
			// bUseTimingFunction : false
		// });
		this._sStatus = this.option("sDefaultArea");
		this._oLeftLayoutInfo = null;
		this._oRightLayoutInfo = null;
		this._oLeftScroll = null;
		this._oRightScroll = null;
		this._oSize = {};
		this._bUseRebuild = false;
		this._oSlideReveal = {};
	},

	/**
		jindo.m.RevealSidebarUI 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
	**/
	_setWrapperElement: function(el) {
		this._htWElement = {};
		el = jindo.$Element(el);
		this._htWElement["body"] = jindo.$Element(jindo.$$.getSingle(".rs-body")).css({
			"overflow" : "hidden"
		});
		if(this._htWElement["body"].css("position") == "static" ) {
			this._htWElement["body"].css("position","relative");
		}
		this._bUseRebuild = (this._htWElement["body"].attr("markup") && this._htWElement["body"].attr("markup").toUpperCase() == "DETAILED") ? false : true;
		this._htWElement["main"] = jindo.$Element(this._htWElement["body"].query(".rs-main"));

		//jindo.m.PageLayoutUI와 연계하기 위해서
		if( this._bUseRebuild && el && !el.isEqual(this._htWElement["body"])) {
			this._htWElement["main"].hide();
			this._htWElement["main"] = el;
			this._htWElement["main"].addClass("rs-main");
		}
		this._htWElement["main"].css({
				"position" : "absolute",
				"zIndex" : 10,
				"left" : 0
		});
		this._htWElement["left"] = jindo.$Element(this._htWElement["body"].query(".rs-left"));
		if(this._htWElement["left"]) {
			this._htWElement["left"].css({
				"position" : "absolute",
				"zIndex" : 5,
				"left" : 0,
				"top" : 0
			}).show();	
		}
		
		this._htWElement["right"] = jindo.$Element(this._htWElement["body"].query(".rs-right"));
		if(this._htWElement["right"]) {
			this._htWElement["right"].css({
				"position" : "absolute",
				"zIndex" : 5,
				"left" : this.option("nSildeThreshold") + "px",
                "top" : 0
			}).show();
		}
		this._htWElement["blocker"] = jindo.$Element("<div style='position:absolute;opacity:0;display:none;z-index:1000;opacity:0;-webkit-tap-highlight-color:transparent;top:0px;'>");
		this._htWElement["blocker"].appendTo(this._htWElement["body"]);
		if(this._htWElement["left"]) {
			this._oLeftLayoutInfo = this._setLayout(this._htWElement["left"]);
		}
		if(this._htWElement["right"]) {
			this._oRightLayoutInfo = this._setLayout(this._htWElement["right"]);
		}
	},

	/**
		화면사이즈 변경시 갱신한다.
		@method resize
	**/
	resize : function() {
		// 화면 사이즈 resize
		this._oSize = jindo.$Document().clientSize();
		var self = this;
		jindo.m._maxClientSize(function(eSize){
		    self._oSize = eSize;
    		self._setSizeWhenResize();
		});
		this._setSizeWhenResize();
	},
	
	_setSizeWhenResize : function(){
	    if(this._htWElement["right"]) {
            this._htWElement["right"].show();
        }
        if(this._htWElement["left"]) {
            this._htWElement["left"].show();
        }

        var oLeftSize = this._getScrollSize(this._oLeftLayoutInfo),
            oRightSize = this._getScrollSize(this._oRightLayoutInfo),
            nPos = this._getPos(this._sStatus);

        // this._htWElement["right"].css("width", oRightSize.nWidth + "px");
        // this._htWElement["left"].css("width", oLeftSize.nWidth + "px");

        // body resize
        this._htWElement["body"].css({
            // width : this._oSize.width + "px",
            width : "100%",
            height : this._oSize.height + "px"
        });
        // blocker resize
        this._htWElement["blocker"].css({
            width : this.option("nSildeThreshold") + "px",
            height : this._oSize.height + "px",
            left : this._sStatus == "left" ? nPos + "px" : "0px"
        });

        // Element 영역 resize, 위치 정하기
        this._htWElement["main"].css({
            "width" : this._oSize.width + "px",
            // "width" : "100%",
            "height" : this._oSize.height + "px"
        });
        ///.css(jindo.m.getCssPrefix() + "Transform", "translate" + this.sTranOpen + nPos + "px,0px" + this.sTranEnd);

        // scroll resize
        if(this._oLeftScroll) {
            this._oLeftScroll.option({
                "nWidth" : oLeftSize.nWidth,
                "nHeight" : oLeftSize.nHeight
            });
            this._oLeftScroll.refresh();
        }

        if(this._oRightScroll) {
            this._oRightScroll.option({
                "nWidth" : oRightSize.nWidth,
                "nHeight" : oRightSize.nHeight
            });
            this._oRightScroll.refresh();
        }
        switch(this._sStatus) {
            case "left" : if( this._htWElement["right"]) { this._htWElement["right"].hide(); } break;
            case "right" : if( this._htWElement["left"]) { this._htWElement["left"].hide(); } break;
            case "main" :
                if( this._htWElement["left"]) { this._htWElement["left"].hide(); }
                if( this._htWElement["right"]) { this._htWElement["right"].hide(); }
                break;
        }
	},

	/**
		회전시 resize 적용

		@param  {jindo.$Event} we
	**/
	_onRotate : function(we) {
	    // 초기 페이지 로딩시 resize 함수가 두번 호출되는것을 방지하기 위해 처리. 
	    if(we.sType == "pageShow" && !we.$value().persisted){
	        return false;
	    }
		this.resize();
	},

	/**
		좌,우 메뉴의 스크롤 컴포넌트를 초기화한다.
	**/
	_initComponent : function() {
		this._oLeftScroll = this._initScroll(this._oLeftLayoutInfo);
		this._oRightScroll = this._initScroll(this._oRightLayoutInfo);
	},

	/**
		스크롤 컴포넌트를 초기화한다.
	**/
	_initScroll : function(oLayoutInfo) {
		if(oLayoutInfo) {
			return new jindo.m.Scroll(oLayoutInfo.welWrapper, this.option("htScrollOption"));
		} else {
			return null;
		}
	},

	/**
		좌,우 메뉴의 DOM형태를 구성하고, 구성된 엘리먼트를 반환한다.

		@param {jindo.$Element} wel 상위 엘리먼트
	**/
	_setLayout : function(wel) {
		var welHeader = jindo.$Element(wel.query(".rs-header")),
			welFooter = jindo.$Element(wel.query(".rs-footer")),
			welContent = jindo.$Element(wel.query(".rs-content")),
			bHeaderFixed = welHeader && welHeader.attr("position") == "fixed",
			bFooterFixed = welFooter && welFooter.attr("position") == "fixed",
			welWrapper = null;

		if(this._bUseRebuild) {
			welWrapper = this._arrangeDom({
				welContent : welContent,
				bHeaderFixed : bHeaderFixed,
				bFooterFixed : bFooterFixed,
				welHeader : welHeader,
				welFooter : welFooter
			});
		} else {
			welWrapper = jindo.$Element(wel.query(".scroller"));
		}
		return {
			welWrapper : welWrapper,
			welHeader : welHeader,
			welFooter : welFooter,
			bHeaderFixed : bHeaderFixed,
			bFooterFixed : bFooterFixed
		};
	},

	/**
		스크롤 사이즈를 설정한다.

		@param  {Object} oLayoutInfo
		@return {Object} nWidht,nHeight의 해쉬테이블 반환
	**/
	_getScrollSize : function(oLayoutInfo) {
		if(!oLayoutInfo) {
			return { nWidth : 0, nHeight : 0 };
		}
		var nLeft = 0,
			nNoFixedHeight = this._oSize.height,
			bVisible = oLayoutInfo.welWrapper.visible();

		if(!bVisible) {
			nLeft = oLayoutInfo.welWrapper.css("left");
			oLayoutInfo.welWrapper.css("left", "-999px").show();
		}
		if(oLayoutInfo.bHeaderFixed) {
			nNoFixedHeight -= oLayoutInfo.welHeader.height();
		}
		if(oLayoutInfo.bFooterFixed) {
			nNoFixedHeight -= oLayoutInfo.welFooter.height();
		}
		if(!bVisible) {
			oLayoutInfo.welWrapper.css("left", nLeft).hide();
		}
		return {
			nWidth : this._oSize.width - this.option("nSildeThreshold"),
			nHeight : nNoFixedHeight
		};
	},

	/**
		DOM을 재정렬한다.

		@param  {[type]} ht [description]
		@return {jindo.$Element}	Scroller의 부모인 Wrapper객체를 반환한다.
	**/
	_arrangeDom : function(ht) {
		ht.welContent.wrap("<div>").wrap("<div>");
		var welScroller = ht.welContent.parent();
		if(!ht.bHeaderFixed && ht.welHeader) {
			welScroller.prepend(ht.welHeader);
		}
		if(!ht.bFooterFixed && ht.welFooter) {
			welScroller.append(ht.welFooter);
		}
		return welScroller.parent();
	},

	/**
		사이드바를 보여준다 (슬라이드 효과)

		@param  {Boolean} isRight true인 경우, 오른쪽 메뉴가, false인 경우 왼쪽 메뉴가 보인다.
		@param  {Number} nDuration 동작시간
	**/
	_slide : function(isRight, nDuration) {
		if (this._oSlideReveal["left"].isPlaying() && this._oSlideReveal["right"].isPlaying()) {
			return;
		}
		var nPos = this._getPos(isRight ? "right" : "left"),
			self=this;
		nDuration = ( typeof nDuration == "undefined" ) ? this.option("nSlideDuration") : nDuration;

		/**
			페이지가 메인으로 복원되기 전에 발생

			@event beforeSlide
			@param {String} sType 커스텀 이벤트명
			@param {String} sStatus 이동 전 페이지 상태(left,main,right)
			@param {Function} stop 수행시 페이지가 이동되지 않음
		**/
		if(this.fireEvent("beforeSlide", {
			sStatus : this._sStatus
		})) {
		    
			self._htWElement["blocker"].show();
			
			if(isRight) {
				if(this._htWElement["left"]) { this._htWElement["left"].css("zIndex",5); }
				if(this._htWElement["right"]) { this._htWElement["right"].css("zIndex",6).show(); }
				self._htWElement["blocker"].css("left","0px");
				this._sStatus = "right";
			} else {
				if(this._htWElement["right"]) { this._htWElement["right"].css("zIndex",5); }
				if(this._htWElement["left"]) { this._htWElement["left"].css("zIndex",6).show(); }
				self._htWElement["blocker"].css("left",nPos + "px");
				this._sStatus = "left";
			}
			if(isRight){
			    if(this._htWElement["left"]) { this._oSlideReveal["left"].hide(nDuration/2); }
			    if(this._htWElement["right"]) { this._oSlideReveal["right"].show(nDuration); }
			}else{
                if(this._htWElement["right"]) { this._oSlideReveal["right"].hide(nDuration/2); }
                if(this._htWElement["left"]) { this._oSlideReveal["left"].show(nDuration); }
            }
		}
	},

	/**
		이동할 위치를 계산해준다.

		@param  {String} sStatus 상태
		@return {Number} 위치정보
	**/
	_getPos : function(sStatus) {
		var nPos = parseInt(this._oSize.width - this.option("nSildeThreshold"),10);
		switch(sStatus) {
			case "left" : break;
			case "main" : nPos = 0; break;
			case "right" : nPos = -nPos; break;
		}
		return nPos;
	},

	/**
		타입을 선택하여 이동한다.

		@method move
		@param  {[type]} sType left, main, right 세가지 타입 중 한가지 타입으로 이동한다.
		@param  {[type]} nDuration 이동시 이동시간 (기본 : 옵션값)
	**/
	move : function(sType, nDuration) {
		nDuration = ( typeof nDuration == "undefined" ) ? this.option("nSlideDuration") : nDuration;
		switch(sType) {
			case "left" : this._slide(false,nDuration); break;
			case "main" : this.restore(nDuration); break;
			case "right" : this._slide(true,nDuration); break;
		}
	},

	/**
		왼쪽이나 오른쪽으로 메뉴를 슬라이드 한다.<br />
		만약, 왼쪽이나 오른쪽 메뉴가 보여지고 있을 경우에는 메인화면으로 복원된다.

		@method toggleSlide
		@param  {Boolean} isRight true인 경우, 오른쪽 메뉴가, false인 경우 왼쪽 메뉴가 보인다.
	**/
	toggleSlide : function(isRight) {
		if(this._sStatus != "main") {
			this.restore();
			return;
		} else {
			this._slide(isRight);
			return;
		}
	},

	/**
		메인화면으로 복원시킨다.

		@method restore
		@param  {[type]} nDuration 이동시 이동시간 (기본 : 옵션값)
	**/
	restore : function(nDuration) {
		if (this._oSlideReveal["left"].isPlaying() && this._oSlideReveal["right"].isPlaying()) {
			return;
		}		
		nDuration = ( typeof nDuration == "undefined" ) ? this.option("nSlideDuration") : nDuration;

		/**
			페이지가 메인으로 복원되기 전에 발생

			@event beforeRestore
			@param {String} sType 커스텀 이벤트명
			@param {String} sStatus 이동 전 페이지 상태(left,main,right)
			@param {Function} stop 수행시 페이지가 이동되지 않음
		**/
		if(this.fireEvent("beforeRestore", {
			sStatus : this._sStatus
		})) {
		    
		    if(this._sStatus == "right"){
    		    this._oSlideReveal["right"].hide(nDuration);
		    }else{
    		    this._oSlideReveal["left"].hide(nDuration);
		    }
		}
	},

    _onRevealShow : function(){
        
        
        if(this._sStatus == "left" && this._oSlideReveal[this._sStatus]){
            this._oSlideReveal["right"]._bShow = false;
            this._htWElement["right"].hide();
        }
        if(this._sStatus == "right" && this._oSlideReveal[this._sStatus]){
            this._oSlideReveal["left"]._bShow = false;
            this._htWElement["left"].hide();
        }
        
        // this._oSlideReveal["right"].hide();
        
        /**
            페이지가 이동된 후에 발생

            @event slide
            @param {String} sType 커스텀 이벤트명
            @param {String} sStatus 이동 후 페이지 상태(left,main,right)
        **/
        this.fireEvent("slide" ,{
            sStatus : this._sStatus
        });
    },
    
    _onRevealRestore : function(sStatus){
        
        this._sStatus = "main";
        this._htWElement["blocker"].hide();
        if (sStatus == "left" && this._htWElement["left"]) {
            this._htWElement["left"].hide();
        }
        if (sStatus == "right" && this._htWElement["right"]) {
            this._htWElement["right"].hide();
        }

        /**
            페이지가 메인으로 복원된 후에 발생

            @event restore
            @param {String} sType 커스텀 이벤트명
            @param {String} sStatus 이동 후 페이지 상태(left,main,right)
        **/
        this.fireEvent("restore",{
            sStatus : this._sStatus
        });
    },
    _initSlideReveal : function(){
        // main, left, right 등의 엘리먼트에 SlideReveal 컴포넌트에 사용하기 위해 클래스를 추가한다.
        var self = this;
        var htDefaultOption = {
            "nDuration" : this.option("nSlideDuration"),
            "nMargin" : this.option("nSildeThreshold"),
            "bUseTimingFunction" : this.option("bUseTimingFunction")
        };
        if(this._htWElement["left"]){
            this._htWElement["main"].addClass("revealLeft-contents");
            this._htWElement["left"].addClass("revealLeft-nav");
    		this._oSlideReveal["left"] = new jindo.m.SlideReveal(
                jindo.$Jindo.mixin(htDefaultOption, {
                    "sClassPrefix" : "revealLeft-",
                    "sDirection" : "right"
                })
        ).attach({
            "show" : function(e){
                self._onRevealShow();
            },
            "hide" : function(e){
                self._onRevealRestore("left");
            }
        });
        }
        if(this._htWElement["right"]){
            this._htWElement["main"].addClass("revealRight-contents");
            this._htWElement["right"].addClass("revealRight-nav");
            this._oSlideReveal["right"] = new jindo.m.SlideReveal(
                jindo.$Jindo.mixin(htDefaultOption, {
                    "sClassPrefix" : "revealRight-",
                    "sDirection" : "left"
                })
            ).attach({
            "show" : function(e){
                self._onRevealShow();
            },
            "hide" : function(e){
                self._onRevealRestore("right");
            }
        });
        }
        
    },
	/**
		jindo.m.RevealSidebarUI 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		this._attachEvent();
		this.resize();
		this._initSlideReveal();
		// 위치 resize
		//this.move(this._sStatus, 0);
	},

	/**
		jindo.m.RevealSidebarUI 컴포넌트를 비활성화한다.
			activate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEvent();
	},

	/**
		jindo.m.RevealSidebarUI 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		this._htEvent = {};
		this._htEvent["restore"] = jindo.$Fn(this._onRestore, this).attach(this._htWElement["blocker"], "click");
		this._htEvent["rotate"] = jindo.$Fn(this._onRotate, this).bind();
		jindo.m.bindRotate(this._htEvent["rotate"]);
		jindo.m.bindPageshow(this._htEvent["rotate"]);
	},

	/**
		jindo.m.RevealSidebarUI 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEvent : function(){
		this._htEvent["restore"].detach(this._htWElement["blocker"], "click");
		jindo.m.unbindRotate(this._htEvent["rotate"]);
		jindo.m.unbindPageshow(this._htEvent["rotate"]);
		this._htEvent = null;
	},

	/**
		jindo.m.RevealSidebarUI이 회전시 발생한다.
	**/
	_onRestore : function(we) {
		this.restore();
	},

	/**
		jindo.m.RevealSidebarUI 에서 사용하는 모든 객체를 release 시킨다.

		@method destroy
		@example
			oSelect.destroy();
	**/
	destroy : function() {
		this.deactivate();
		this._oLeftScroll.destroy();
		this._oLeftScroll=null;
		this._oRightScroll.destroy();
		this._oRightScroll=null;
		// this._oTransition.destroy();
		// this._oTransition= null;
	}
}).extend(jindo.m.UIComponent);