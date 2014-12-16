/**
	@fileOverview 페이지의 레이아웃을 잡는 UI 템플릿
	@author icebelle
	@version #__VERSION__#
	@since 2011. 06. 29.
**/
/**
	페이지의 레이아웃을 잡는 UI 템플릿

	@class jindo.m.PageLayoutUI
	@extends jindo.m.Component
	@uses jindo.m.Scroll
	@uses jindo.m._AlignFlipFlicking_, jindo.m.CoverFlicking, jindo.m._FlickingAnimation_, jindo.m._FlipFlicking_, jindo.m.SlideFlicking {0,}
	@uses jindo.m.AjaxHistory {0,}
	@uses jindo.m.Loading {0,}
	@keyword pagination, page, 페이지, 목록
	@invisible
		
	@history 1.10.0 update 클라이언트 사이즈 변경 모듈 변경
	@history 1.9.0 deprecated
	@history 1.6.0 Bug 플리킹영역에 대각선 터치에 대해서 플리킹하지 않도록 수정
	@history 1.5.0 Update Window Phone8 지원
	@history 1.4.0 Update iOS 6 지원
	@history 1.4.0 Update [bUseFullScreen] 옵션 추가
	@history 1.4.0 Bug jindo2 1.4.7에서 스크립트 버그 수정<br />
						Flingking sClassPrefix 지정해도 적용되지 않는 버그 수정
	@history 1.3.0 Release 최초 릴리즈
**/
jindo.m.PageLayoutUI = jindo.$Class({
	/* @lends jindo.m.PageLayoutUI.prototype */
	/**
		초기화 함수

		@constructor
		@param {Object} [htOption] 초기화 옵션 객체
              @param {Number} [htOption.nDefaultIndex=0] 페이지 로딩시 초기에 보여져야할 페이지 인덱스번호 <br /> MultiContentLayout / MultiPageLayout일 경우에만 해당된다.
              @param {Boolean} [htOption.bUseLoading=false] 페이지 초기 로딩시 로딩레이어 사용여부
              @param {Function} [htOption.fnDomReady = null] 내부적으로 Layout 마크업이 생성된후에 호출되는 함수
              @param {Object} [htOption.htScrollOption = m.Scroll 생성자 ] Scroll 생성시 초기화 옵션 <br />  m.Scroll참고
              @param {Object} [htOption.htHistoryOption = m.AjaxHistory 생성자] AjaxHistory 생성시 초기화 옵션  <br />  m.AjaxHistory 참고 
              @param {Object} [htOption.htFlickingOption = m.Flikcing 생성자] Flicking 생성시 초기화 옵션  <br /> m.Flikcing 참고 
              @param {Object} [htOption.htLoadingOption = {m.Loading 생성자}] Loading 생성시 초기화 옵션  <br /> m.Loading 참고 
              

	**/
	$init : function(htOption) {
		this._initVar(htOption);
		this._showDefaultPage();

		// 로딩레이어 보이기
		this.showLoading();

		// Layout에 맞는 마크업 재구성
		this._checkLayout();
		this._rebuildLayout();

		// DomReady 콜백함수 수행
		if(htOption && htOption.fnDomReady && typeof htOption.fnDomReady == "function") {
			htOption.fnDomReady({
				welRoot : this.getRoot()
			});
		}

		// Scroll 컴포넌트 초기화
		this._initScrollManager();

		// page 초기화 처리
		if(this._bMultiPage) {
			this._initMultiPage(this._aPages, this._nDefaultIndex);
		} else {
			this._initPage(this._aPages[0], 0);
		}

		// 플리킹을 사용하지 않을 경우 각 페이지들의 위치를 0,0으로 잡아준다.
		if(!this._bUseFlicking) {
			if(this._bMultiPage) { this._setMultiPagePosition(); }
			else if(this._bMultiContent) { this._setMultiContentPosition(); }
		}

		// Flicking 컴포넌트 초기화
		if(this._bUseFlicking) { this._initFlicking(this._welFlickView.$value()); }

		this._attachEvent();

		// AjaxHistory 컴포넌트 초기화
		if(this._bUseAjaxHistory) { this._initAjaxHistory(); }
	},

	/**
		사용변수 초기화
		@param {Object} htOption 사용자 초기화 옵션
	**/
	_initVar : function(htOption) {
		htOption = htOption || {};
		this._htEvent = {};
		this._nCurrentIndex = htOption.nDefaultIndex || 0;
		this._htScrollOption = htOption.htScrollOption || {};
		this._htFlickingOption = htOption.htFlickingOption || {};
		this._htFlickingOption["sClassPrefix"] = this._htFlickingOption["sClassPrefix"] || "flick-";
		this._htFlickingOption["sContentClass"] = this._htFlickingOption["sContentClass"] || "ct";
		this._htHistoryOption = htOption.htHistoryOption || {};
		this._bUseLoading = htOption.bUseLoading || false;
		this._htLoadingOption = htOption.htLoadingOption || {};
		this._bUseFullScreen = htOption.bUseFullScreen || false;
		this._oTimeout = null;

		this._oClientSize = jindo.$Document().clientSize();
		// this._oClientSize = jindo.m._clientSize();
		//full screen 추가
		// if(this._bUseFullScreen){
			// this._oClientSize.height += jindo.m._getAdressSize();
		// }

		this._welRoot = (htOption.vBaseElement) ? jindo.$Element(htOption.vBaseElement) : jindo.$Element(document.body);
		this._bUseRebuild = (this._welRoot.attr("markup") && this._welRoot.attr("markup").toUpperCase() == "DETAILED") ? false : true;
		this._aPages = jindo.$ElementList(this._welRoot.queryAll(".jmc-page")).$value();
		this._nPageCount = this._aPages.length;
		this._aContents = jindo.$ElementList(this._welRoot.queryAll(".jmc-content")).$value();
		this._nContentCount = this._aContents.length;
		this._bMultiPage = this._nPageCount > 1 ? true : false;
		this._bMultiContent = this._nContentCount > 1 ? true : false;

		/*
		console.log("	this._welRoot", this._welRoot)
		console.log("	this._bUseRebuild", this._bUseRebuild)
		console.log("	this._nPageCount", this._nPageCount)
		console.log("	this._nContentCount", this._nContentCount)
		console.log("  	this._bMultiPage : ", this._bMultiPage)
		console.log("	this._bMultiContent : ", this._bMultiContent)
		console.log("-----------------------------------------------------")
		console.log("	this._nCurrentIndex", this._nCurrentIndex)
		console.log("	this._htScrollOption", this._htScrollOption)
		console.log("	this._htFlickingOption", this._htFlickingOption)
		console.log("	this._htHistoryOption", this._htHistoryOption)
		console.log("  	this._bUseLoading : ", this._bUseLoading)
		console.log("	this._htLoadingOption", this._htLoadingOption)
		console.log("	this._oClientSize", this._oClientSize)
		console.log("=====================================================")
		*/
	},

	/**
		디폴트 페이지 show 처리
	**/
	_showDefaultPage : function() {
		// 멀티 페이지일 경우 디폴트 페이지만 우선 show 처리
		if(this._bMultiPage) { this._aPages[this._nCurrentIndex].show(); }
		if(this._bMultiContent) { this._aPages[0].show(); }
	},

	/**
		사용자가 설정한 Layout의 타입을 파악하는 함수
	**/
	_checkLayout : function() {
		var bFlicking = (this._welRoot.attr("flicking") && this._welRoot.attr("flicking").toUpperCase() == "YES") ? true : false;
		if(this._bMultiPage && bFlicking) {
			// 멀티페이지 플리킹
			this._bUseFlicking = true;
		} else if(!this._bMultiPage && this._nContentCount > 1 && bFlicking) {
			// 싱글페이지 다중컨텐츠
			this._bUseFlicking = true;
		} else {
			this._bUseFlicking = false;
		}
		//console.log("	this._bUseFlicking : ", this._bUseFlicking)

		if(this._bMultiPage || this._bMultiContent) {
			this._bUseAjaxHistory = true;
		} else {
			this._bUseAjaxHistory = false;
		}
		//console.log("	this._bUseAjaxHistory : ", this._bUseAjaxHistory)
	},

	/**
		Layout에 맞는 마크업을 재구성하는 함수
	**/
	_rebuildLayout : function() {
		//console.log("_rebuildLayout")
		if(this._bUseRebuild) {
			var elDocumentFragment = document.createDocumentFragment();
			var welFlickCT,
				welFlickContainer;
			// 멀티페이지에 플리킹 사용시 플리킹 컨테이너 생성
			if(this._bMultiPage && this._bUseFlicking) {
				this._welFlickView = jindo.$Element('<div class="' + this._htFlickingOption["sClassPrefix"] + 'view"></div>');
				welFlickContainer = jindo.$Element('<div class="' + this._htFlickingOption["sClassPrefix"] + 'container"></div>');
				
				this._welFlickView.appendTo(elDocumentFragment);
				welFlickContainer.appendTo(this._welFlickView.$value());
			}

			for(var i = 0; i < this._nPageCount; i++) {
				// 각 페이지 내부의 레이아웃 처리
				var elPageLayout = this._rebuildPage(this._aPages[i]);
				this._aPages[i].append(elPageLayout);

				if(this._bMultiPage && this._bUseFlicking) {
					// 멀티페이지에 플리킹 사용시 각 페이지를 flick-ct로 append 처리
					welFlickCT = jindo.$Element('<div class="' + this._htFlickingOption["sClassPrefix"] + this._htFlickingOption["sContentClass"] + '"></div>');
					welFlickCT.appendTo(welFlickContainer.$value());
					this._aPages[i].appendTo(welFlickCT.$value());
				}

				this._aPages[i].show();
			}

			this._welRoot.append(elDocumentFragment);
		} else {
			if(this._bUseFlicking) {
				this._welFlickView = jindo.$Element(this._welRoot.query("." + this._htFlickingOption["sClassPrefix"] + "view"));
			}
			if(!this._bMultiPage && this._bMultiContent) {
				this._welContentView = jindo.$Element(this._welRoot.query(".jmc-content-view"));
			}
		}
	},

	/**
		jmc-page의 마크업을 재구성 하는 함수
		@param {jindo.$Element} welPage 기준 페이지(jmc-page) 엘리먼트
	**/
	_rebuildPage : function(welPage) {
		var elPageFragment = document.createDocumentFragment();

		var welScrollWrapper = jindo.$Element('<div class="scroll-wrapper"></div>');
		var welScroller = jindo.$Element('<div class="scroller"></div>');

		// 헤더 처리
		var welHeader = jindo.$Element(welPage.query(".jmc-header"));
		var bFixedHeader = (welHeader && welHeader.attr("position") == "fixed") ? true : false;
		//console.log("	bFixedHeader : ", bFixedHeader)
		if(bFixedHeader) {
			// 헤더 고정인 경우 스크롤 컨테이너 바깥에 삽입
			if(welHeader) { welHeader.appendTo(elPageFragment); }
		} else {
			// 헤더 고정이 아닌경우 스크롤 컨테이너 안쪽에 삽입
			if(welHeader) { welHeader.appendTo(welScroller.$value()); }
		}

		// 컨텐츠 처리
		if(!this._bMultiPage && this._bMultiContent) {
			// 싱글페이지의 다중 컨텐츠일 경우
			var aWelContents= jindo.$ElementList(welPage.queryAll(".jmc-content")).$value();
			var elFlickingContent = this._rebuildFlickingContent(aWelContents);
			elPageFragment.appendChild(elFlickingContent);
		} else {
			// 그 외의 모든 경우
			var welContent = jindo.$Element(welPage.query(".jmc-content"));
			welScrollWrapper.appendTo(elPageFragment);
			welScroller.appendTo(welScrollWrapper.$value());
			welContent.appendTo(welScroller.$value());
		}

		// 풋터 처리
		var welFooter = jindo.$Element(welPage.query(".jmc-footer"));
		var bFixedFooter = (welFooter && welFooter.attr("position") == "fixed") ? true : false;
		//console.log(" 	bFixedFooter : ", bFixedFooter)
		if(bFixedFooter) {
			// 풋터 고정인 경우 스크롤 컨테이너 바깥에 삽입
			if(welFooter) { welFooter.appendTo(elPageFragment); }
		} else {
			// 풋터 고정이 아닌경우 스크롤 컨테이너 안쪽에 삽입
			if(welFooter) { welFooter.appendTo(welScroller.$value()); }
		}

		return elPageFragment;
	},

	/**
		컨텐츠가 플리킹되는 Layout의 flicking되는 영역의 마크업을 재구성하는 함수
		@param {Array} aWelContents 컨텐츠 엘리먼트 배열
	**/
	_rebuildFlickingContent : function(aWelContents) {
		var elContentFragment = document.createDocumentFragment();
		var welFlickContainer;
		if(this._bUseFlicking) {
			this._welFlickView = jindo.$Element('<div class="' + this._htFlickingOption["sClassPrefix"] + 'view"></div>');
				welFlickContainer = jindo.$Element('<div class="' + this._htFlickingOption["sClassPrefix"] + 'container"></div>');

			this._welFlickView.appendTo(elContentFragment);
			welFlickContainer.appendTo(this._welFlickView.$value());
		} else {
			this._welContentView = jindo.$Element('<div class="jmc-content-view"></div>');
			this._welContentView.appendTo(elContentFragment);
		}

		var welFlickCT, welContentCT, welScrollWrapper, welScroller;
		for(var i = 0, len = aWelContents.length; i < len; i++) {
			welScrollWrapper = jindo.$Element('<div class="scroll-wrapper"></div>');
			welScroller = jindo.$Element('<div class="scroller"></div>');

			if(this._bUseFlicking) {
				// 다중 컨텐츠에 플리킹을 사용할 경우
				welFlickCT = jindo.$Element('<div class="' + this._htFlickingOption["sClassPrefix"] + this._htFlickingOption["sContentClass"] + '"></div>');
				welFlickCT.appendTo(welFlickContainer.$value());
				welScrollWrapper.appendTo(welFlickCT.$value());
			} else {
				welContentCT = jindo.$Element('<div class="jmc-content-ct" style="background-color:#fff;"></div>');
				welContentCT.appendTo(this._welContentView.$value());
				welScrollWrapper.appendTo(welContentCT.$value());
			}

			welScroller.appendTo(welScrollWrapper.$value());
			aWelContents[i].appendTo(welScroller.$value());
		}

		return elContentFragment;
	},

	/**
		이벤트 attach 처리함수
	**/
	_attachEvent : function() {
		// 기기회전 처리
		this._htEvent["rotate"] = jindo.$Fn(this._onResize, this).bind();
		jindo.m.bindRotate(this._htEvent["rotate"]);

		this._htEvent["load"] = jindo.$Fn(this._onLoad, this).attach(window, "load");
	},

	/**
		onLoad 이벤트 핸들러
	**/
	_onLoad : function() {
		//console.log("_onLoad")
		//var oClientSize = jindo.$Document().clientSize();
		var oClientSize = jindo.$Document().clientSize();
        
        
		// var oClientSize = jindo.m._clientSize(this._bUseFullScreen);
        var self = this;
        jindo.m._maxClientSize(function(eSize){
            oClientSize = eSize;
            self._onResize();
        });
		//alert(oClientSize.height  +  " , "+ jindo.m._getAdressSize());
		// if(this._bUseFullScreen){
			// oClientSize.height += jindo.m._getAdressSize();
		// }

		// onLoad 시점에서 화면사이즈가 달라지는 케이스를 위한 예외처리
		if(this._oClientSize.height != oClientSize.height || this._oClientSize.width != oClientSize.width) {
			this._onResize();
		} else {
			// 로딩레이어 숨기기
			this.hideLoading();
		}

		// this._hideAddress();
	},

	/**
		onResize 이벤트 핸들러
	**/
	_onResize : function() {
		if(this._oTimeout) {
			clearTimeout(this._oTimeout);
			this._oTimeout = null;
		}

		//this._oTimeout = setTimeout(jindo.$Fn(function() {
			//console.log("_onResize")
			this._oClientSize = jindo.$Document().clientSize();
			var self = this;
	        jindo.m._maxClientSize(function(eSize){
                self._oClientSize = eSize;
                self._setSizeWhenResize();
            });
            
			// if(this._bUseFullScreen){
				// if(window.pageYOffset === 0){
					// this._oClientSize.height +=  jindo.m._getAdressSize();
				// }
			 // }


			this._setSizeWhenResize();

			// 로딩레이어 숨기기
			this.hideLoading();
		//}, this).bind(), 300);

		//주소창 감추는 코드 추가
		this._hideAddress();
	},
	
	_setSizeWhenResize : function(){
        if(this._bMultiPage) {
            if(this._bUseFlicking) {
                // 플리킹이 되는 멀티페이지일 경우
                this._resizeFlicking();
                this._resizePage();
                this._resizeScroll();
            } else {
                // 단순 멀티페이지일 경우
                this._resizePage();
                this._resizeScroll();
            }
        } else {
            if(this._bMultiContent) {
                if(this._bUseFlicking) {
                    // 플리킹이 되는 싱글페이지일 경우
                    this._resizePage();
                    this._resizeFlicking();
                    this._resizeScroll();
                } else {
                    // 플리킹이 안되는 싱글페이지일 경우
                    this._resizePage();
                    this._resizeContentView();
                    this._resizeScroll();
                }
            } else {
                // 단순 싱글페이지일 경우
                this._resizePage();
                this._resizeScroll();
            }
        }    
	},

	/**
		주소창을 감추는 코드 추가
	**/
	_hideAddress : function(){
		if(this._bUseFullScreen){
			setTimeout(function(){
				window.scrollTo(0,1);
			},500);
		}
	},

	/**
		각 페이지의 리사이즈를 처라하는 함수
	**/
	_resizePage : function() {
		for(var i = 0; i < this.getPageCount(); i++) {
			this._aPages[i]["oPage"].resize(this._oClientSize);
		}
	},

	/**
		플리킹이 안되는 다중컨텐츠 영역의 리사이즈를 처리하는 함수
	**/
	_resizeContentView : function() {
		//console.log(this._welContentView)
		var htFlickSize = this._getFlickSize();
		this._welContentView.css({
			"position" : "relative",
			"width" : htFlickSize.width + "px",
			"height" : htFlickSize.height + "px"
		});
	},

	/**
		플리킹 영역의 리사이즈를 처리하는 함수
	**/
	_resizeFlicking : function() {
		if(!this._bUseFlicking) { return false; }

		var htFlickSize = this._getFlickSize();
		this._oFlicking.resize({
			"nFlickWidth" : htFlickSize.width,
			"nFlickHeight" : htFlickSize.height
		});
	},

	/**
		스크롤 영역의 리사이즈를 처리하는 함수
	**/
	_resizeScroll : function() {
		var aScrollSize = [];
		for(var i = 0; i < this.getPageCount(); i++) {
			aScrollSize.push({
				"nScrollWidth" : this._aPages[i]["oPage"].getNoneFixedWidth(),
				"nScrollHeight" : this._aPages[i]["oPage"].getNoneFixedHeight()
			});
		}
		this._oScroll.resize(aScrollSize);
	},

	/**
		로딩 컴포넌트 초기화 처리함수
	**/
	_initLoading : function() {
		if(!this._bUseLoading) { return false; }
		//console.log("_initLoading")

		this._oLoading = new jindo.m.Loading(null, this._htLoadingOption);
		this._oLoading.show();
	},

	/**
		스크롤 컴포넌트 관리모듈을 초기화 함수
	**/
	_initScrollManager : function() {
		this._oScroll = new jindo.m.PageLayoutUI.ScrollManager({
			"oPageLayout" : this,
			"htOption" : this._htScrollOption
		});
	},

	/**
		스크롤 컴포넌트 생성 함수

		@method addScroll
		@param {Object} htScrollOption 스크롤 컴포넌트 초기화 옵션
	**/
	addScroll : function(htScrollOption) {
		this._oScroll.addScroll(htScrollOption);
	},

	/**
		MultiPageLayout의 DOM 초기화 처리함수

		@param {Array} aPages	페이지 정보 배열
		@param {Number} nDefaultIndex	디폴트 페이지 인덱스
	**/
	_initMultiPage : function(aPages, nDefaultIndex) {
		//console.log("_initMultiPage")
		for(var i = 0; i < this.getPageCount(); i++) {
			this._initPage(aPages[i], i);
		}
	},

	/**
		SinglePage가 플리킹을 사용하지 않을때 Position 초기화 처리함수
	**/
	_setMultiContentPosition : function() {
		if(!this._bMultiContent ) { return false; }
		//console.log("_setMultiContentPosition")

		this._resizeContentView();
		this._aContentCT = jindo.$ElementList(this._welRoot.queryAll(".jmc-content-ct")).$value();
		var nZIndex;
		for(var i = 0; i < this.getContentCount(); i++) {
			nZIndex = (i === this._nCurrentIndex) ? 10 : 1;
			this._aContentCT[i].css({
				"top" : "0px",
				"left" : "0px",
				"position" : "absolute",
				"overflow" : "hidden",
				"zIndex" : nZIndex
			});
		}
	},

	/**
		MultiPage가 플리킹을 사용하지 않을때 Position 초기화 처리함수
	**/
	_setMultiPagePosition : function() {
		if(!this._bMultiPage) { return false; }
		//console.log("_setMultiPagePosition")

		var nZIndex;
		for(var i = 0; i < this.getPageCount(); i++) {
			nZIndex = (i === this._nCurrentIndex) ? 10 : 1;
			this._aPages[i]["welPage"].css({
				"top" : "0px",
				"left" : "0px",
				"position" : "absolute",
				"overflow" : "hidden",
				"zIndex" : nZIndex
			});
		}
	},

	/**
		jmc-page의 초기화 함수

		@param {jindo.$Element} welPage	페이지 엘리먼트
		@parma {Number} nPageIndex		디폴트 페이지 인덱스
	**/
	_initPage : function(welPage, nPageIndex) {
		//console.log("_initPage", welPage)
		this._aPages[nPageIndex] = {
			"welPage" : welPage,
			"oPage" : new jindo.m.PageLayoutUI.Page(welPage.$value(), {
				"oPageLayout" : this,
				"nIndex" : nPageIndex,
				"nCurrentIndex" :  this._nCurrentIndex,
				"htPageSize" : this._oClientSize
			})
		};
	},

	/**
		플리킹 컴포넌트 초기화 함수
		@param {Element} elFlickView	 플리킹 기준(flick-view) 엘리먼트
	**/
	_initFlicking : function(elFlickView) {
		//console.log("_initFlicking")
		var htFlickSize = this._getFlickSize();
		//console.log(htFlickSize);
		this._oFlicking = jindo.m.PageLayoutUI.Flicking;
		this._oFlicking.init(elFlickView, {
			"oPageLayout" : this,
			"nDefaultIndex" : this._nCurrentIndex,
			"nFlickWidth" : htFlickSize.width,
			"nFlickHeight" : htFlickSize.height,
			"htOption" : this._htFlickingOption
		});
	},

	/**
		히스토리 컴포넌트 초기화 함수
	**/
	_initAjaxHistory : function() {
		//console.log("_initAjaxHistory");
		this._oAjaxHistory = jindo.m.PageLayoutUI.AjaxHistory;

		this._oAjaxHistory.init({
			"oPageLayout" : this,
			"htOption" : this._htHistoryOption
		});
	},

	/**
		플리킹 영역의 사이즈 반환함수
	**/
	_getFlickSize : function() {
		var htFlickSize = {};

		if(this._bMultiPage) {
			htFlickSize = this._oClientSize;

		} else {
			htFlickSize["width"] = this._aPages[0]["oPage"].getNoneFixedWidth();
			htFlickSize["height"] = this._aPages[0]["oPage"].getNoneFixedHeight();
		}
		return htFlickSize;
	},

	/**
		현재 보여지는 영역의 인덱스 반환함수

		@method getCurrentIndex
		@return {Number} nCurrentIndex	 현재 페이지 인덱스
	**/
	getCurrentIndex : function() {
		if(this._bUseFlicking) {
			this._nCurrentIndex = this._oFlicking.getCurrentIndex();
		}
		return this._nCurrentIndex;
	},

	/**
		전체 페이지 개수 반환함수

		@method getPageCount
		@return {Number} nPageCount	 전체 페이지 개수
	**/
	getPageCount : function() {
		return this._nPageCount;
	},

	/**
		전체 컨텐츠 개수 반환함수

		@method getContentCount
		@return {Number} nContentCount	 전체 컨텐츠 개수
	**/
	getContentCount : function() {
		var nContentCount;
		if(this._bMultiPage) {
			nContentCount = this.getPageCount();
		} else {
			nContentCount = this._oScroll.getScrollCount();
		}
		return nContentCount;
	},

	/**
		컨텐츠 엘리먼트 반환함수

		@method getContentCT
		@param {Number} nContentIndex	컨텐츠 인덱스
		@return {jindo.$Element} welContentCT	nContentIndex에 해당하는 컨텐츠 엘리먼트
	**/
	getContentCT : function(nContentIndex) {
		return this._aContentCT[nContentIndex];
	},

	/**
		루트 엘리먼트 반환 함수
		@method getRoot
		@return {jindo.$Element} welRoot	루트 엘리먼트
	**/
	getRoot : function() {
		var welRoot;
		if(this._bMultiPage && this._bUseFlicking) {
			welRoot = this._welFlickView;
		} else {
			welRoot = this._welRoot;
		}
		return welRoot;
	},

	/**
		jmc-page를 구성하는 header, content, footer를 반환하는 함수

		@method getPage
		@param {Number} nIndex	페이지 인덱스
		@return {HahTable / Array} Page	nIndex에 해당하는 페이지 엘리먼트 정보
	**/
	getPage : function(nIndex) {
		var vPage;
		if(typeof nIndex == "undefined") {
			vPage = [];
			for(var i = 0; i < this.getContentCount(); i++) {
				vPage.push(this._getPage(i));
			}
		} else {
			vPage = this._getPage(nIndex);
		}

		//console.log("vPage", vPage)
		return vPage;
	},

	/**
		페이지 엘리먼트 정보를 반환하는 함수

		@param {Number} nIndex	페이지 인덱스
		@return {HahTable} htPage	nIndex에 해당하는 페이지 엘리먼트 정보
	**/
	_getPage : function(nIndex) {
		var nPageIndex;
		//console.log("this._bMultiPage", this._bMultiPage)
		if(this._bMultiPage) {
			nPageIndex = nIndex;
		} else {
			nPageIndex = 0;
		}
		var oPage = this._aPages[nPageIndex]["oPage"];
		//console.log("oPage", oPage)

		var htPage = {
			"welHeader" : jindo.$Element(oPage.getHeader()),
			"welContent" : this._oScroll.getScrollContent(nIndex),
			"welFooter": jindo.$Element(oPage.getFooter())
		};
		//console.log("htPage", htPage)

		return htPage;
	},

	/**
		페이지의 내용 업데이트 시 후처리 함수
		@method refresh
	**/
	refresh : function() {
		this._onResize();
	},

	/**
		히스토리 추가시 처리함수
		@method addHistory
	**/
	addHistory : function() {
		this._oAjaxHistory.addHistory();
	},

	/**
		히스토리가 변경시 처리함수

		@method changeHistory
		@param {Number} nIndex	페이지 인덱스
	**/
	changeHistory : function(nIndex) {
		if(this._bUseFlicking) {
			this._oFlicking.moveTo(nIndex);
		} else {
			this.moveTo(nIndex);
		}
	},

	/**
		페이지 이동 처리함수

		@method moveTo
		@param {Number} nIndex	페이지 인덱스
	**/
	moveTo : function(nIndex) {
		if(typeof nIndex == "undefined") { return false; }

		if(this._bUseFlicking) {
			this._oFlicking.moveTo(nIndex);
		} else {
			if(!this.onBeforeMovePage({
				"nContentsIndex" : this.getCurrentIndex(),
				"nContentsNextIndex" : nIndex
			})) { return; }
			this.show(nIndex);
			this.onAfterMovePage({
				"nContentsIndex" : nIndex
			});
		}
	},

	/**
		nIndex에 해당하는 영역의 노출 처리함수

		@method show
		@param {Number} nIndex	페이지 인덱스
	**/
	show : function(nIndex) {
		if(typeof nIndex == "undefined") { return false; }

		this.hide(this.getCurrentIndex());
		if(this._bMultiPage) {
			this._aPages[nIndex]["oPage"].show();
		} else if(this._bMultiContent) {
			this._aPages[0]["oPage"].showContentView(nIndex);
		}

		this._nCurrentIndex = nIndex;
	},

	/**
		nIndex에 대당하는 영역의 숨김 처리함수

		@method hide
		@param {Number} nIndex	페이지 인덱스
	**/
	hide : function(nIndex) {
		if(typeof nIndex == "undefined") { nIndex = this._nCurrentIndex; }

		if(this._bMultiPage) {
			this._aPages[nIndex]["oPage"].hide();
		} else if(this._bMultiContent) {
			this._aPages[0]["oPage"].hideContentView(nIndex);
		}

		/*
		if(!this._bUseFicking) {
			this._aPages[nIndex]["oPage"].hide();
		}*/
	},

	/**
		@method showLoading
	**/
	showLoading : function() {
		if(!this._bUseLoading) { return false; }
		//console.log("showLoading")
		if(!this._oLoading) { this._initLoading(); }
		this._oLoading.show();
	},

	/**
		@method hideLoading
	**/
	hideLoading : function() {
		if(!this._bUseLoading) { return false; }
		//console.log("hideLoading")
		this._oLoading.hide();
	},

	/**
		플리킹 영역에 touchstart가 발생하는 순간 수행되는 함수

		@method onTouchStartFlicking
		@param {Object} oCustomEvent	이벤트 객체
	**/
	onTouchStartFlicking : function(oCustomEvent){
		return this.fireEvent("touchStart", {
			sType : "touchStart",
			element : oCustomEvent.element,
			nX : oCustomEvent.nX,
			nY : oCustomEvent.nY
		});
	},

	/**
		페이지 이동전 수행되는 함수

		@method onBeforeMovePage
		@param {Object} oCustomEvent	이벤트 객체
	**/
	onBeforeMovePage : function(oCustomEvent) {
		/**
			페이지가 이동되기 전에 발생 (MultiPageLayout일 경우에만 해당됨)

			@event beforeMovePage
			@param {String} sType 커스텀 이벤트명
			@param {Number} nCurrentPage 현재 페이지의 인덱스 번호
			@param {Number} nPage 이동할 페이지의 인덱스 번호
			@param {Function} stop 수행시 페이지가 이동되지 않음
		**/
		return this.fireEvent("beforeMovePage", {
			sType : "beforeMovePage",
			nCurrentPage : oCustomEvent.nContentsIndex,
			nPage : oCustomEvent.nContentsNextIndex,
			bLeft : oCustomEvent.bLeft
		});
	},

	/**
		페이지 이동후 수행되는 함수

		@method onAfterMovePage
		@param {Object} oCustomEvent	이벤트 객체
	**/
	onAfterMovePage : function(oCustomEvent) {
		// 히스토리 정보 세팅
		if(this._bUseAjaxHistory) { this.addHistory(); }
		/**
			페이지가 이동된 후에 발생 (MultiPageLayout일 경우에만 해당됨)

			@event afterMovePage
			@param {String} sType 커스텀 이벤트명
			@param {Number} nCurrentPage 현재 페이지의 인덱스 번호
		**/
		this.fireEvent("afterMovePage", {
			sType : "afterMovePage",
			nCurrentPage : oCustomEvent.nContentsIndex
		});
	}
}).extend(jindo.m.Component);





/**
	각 페이지(jmc-page)를 관리하는 Page 컴포넌트 인스턴스 생성 및 관리
**/
jindo.m.PageLayoutUI.Page = jindo.$Class({
	$init : function(el,htOption) {
		//console.log("== jindo.m.PageLayoutUI.Page ==")
		this._initVar(el,htOption);
		this._setWrapperElement();
		this._setFixedArea();

		this._initScroll();
	},

	/**
		변수 초기화 처리함수
	**/
	_initVar : function(el, htOption) {
		this._welPage = jindo.$Element(el);
		this._oPageLayout = htOption.oPageLayout;
		this._nIndex = htOption.nIndex;
		this._htPageSize = htOption.htPageSize;
		this._htWElement = {};
	},

	/**
		엘리먼트 정보 처리함수
	**/
	_setWrapperElement : function() {
		this._htWElement["header"] = jindo.$Element(this._welPage.query(".jmc-header"));
		this._htWElement["footer"] = jindo.$Element(this._welPage.query(".jmc-footer"));

		//console.log("this._htWElement", this._htWElement)
	},

	/**
		jindo.m.Page 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
	},

	/**
		jindo.m.Page 컴포넌트를 비활성화한다.
			activate 실행시 호출됨
	**/
	_onDeactivate : function() {
	},

	/**
		고정영역 정보 처리함수
	**/
	_setFixedArea : function() {
		this._bHeaderFixed = this._htWElement["header"] && this._htWElement["header"].attr("position") == "fixed" ? true : false;
		this._bFooterFixed = this._htWElement["footer"] && this._htWElement["footer"].attr("position") == "fixed" ? true : false;
		//console.log("this._bHeaderFixed", this._bHeaderFixed)
		//console.log("this._bFooterFixed", this._bFooterFixed)
	},

	/**
		스크롤 처리 함수
	**/
	_initScroll : function() {
		this._oPageLayout.addScroll({
			"welBaseElement" : this._welPage,
			"nScrollWidth" : this.getNoneFixedWidth(),
			"nScrollHeight" : this.getNoneFixedHeight()
		});
	},

	/**
		welTarget의 높이값 반환함수
		@param {jindo.$Element} welTarget 대상 엘리먼트
		@return {Number} nHeight	높이값
	**/
	_getHeight : function(welTarget) {
		var nHeight = welTarget.$value().offsetHeight;
		//Layer에 마진이 있는경우 렌더링 보정.
		nHeight += parseInt(welTarget.css('marginTop'), 10) + parseInt(welTarget.css('marginBottom'), 10) || 0;

		return nHeight;
	},

	/**
		헤더영역 높이 반환함수
		@return {Number} nHeaderHeight 헤더 높이값
	**/
	_getHeaderHeight : function() {
		var nHeaderHeight = this._getHeight(this._htWElement["header"]);
		return nHeaderHeight;
	},

	/**
		풋터영역 높이 반환함수
		@return {Number} nFooterHeight 풋터 높이값
	**/
	_getFooterHeight : function() {
		var nFooterHeight = this._getHeight(this._htWElement["footer"]);
		return nFooterHeight;
	},

	/**
		리사이즈 처리함수
		@param {Object} htPageSize 페이지 사이즈 정보 변수
	**/
	resize : function(htPageSize) {
		//console.log("Page >> resize >> htPageSize", htPageSize.width, htPageSize.height)
		this._htPageSize = htPageSize || jindo.$Document().clientSize();
		// this._htPageSize = htPageSize || jindo.m._clientSize();

		/*this._oScroll.resize({
			"nScrollWidth" : this.getNoneFixedWidth(),
			"nScrollHeight" : this.getNoneFixedHeight()
		});*/
	},

	/**
		고정영역을 제외한 영역의 너비 반환함수
		@return {Number} nNoneFixedWidth 비고정 영역 너비값
	**/
	getNoneFixedWidth : function() {
		var nScrollWidth = this._htPageSize.width;
		return nScrollWidth;
	},

	/**
		고정영역을 제외한 영역의 높이 반환함수
		@return {Number} nNoneFixedHeight 비고정 영역 높이값
	**/
	getNoneFixedHeight : function() {
		var nHeight = this._htPageSize.height;
		var nNoneFixedHeight;
		if(this._bHeaderFixed) {
			if(this._bFooterFixed) {
				// 상단, 하단 고정
				nNoneFixedHeight = parseInt(nHeight - this._getHeaderHeight() - this._getFooterHeight(), 10);
			} else {
				// 상단만 고정
				nNoneFixedHeight = parseInt(nHeight - this._getHeaderHeight(), 10);
			}
		} else {
			if(this._bFooterFixed) {
				// 하단만 고정
				nNoneFixedHeight = parseInt(nHeight - this._getFooterHeight(), 10);
			} else {
				// 고정없음
				nNoneFixedHeight = nHeight;
			}
		}

		return nNoneFixedHeight;
	},

	/**
		헤더 엘리먼트 반환함수
		@return {jindo.$Element} welHeader	헤더 엘리먼트
	**/
	getHeader : function() {
		return this._htWElement["header"] ? this._htWElement["header"].$value() : null;
	},

	/**
		풋터 엘리먼트 반환함수
		@return {jindo.$Element} welFooter	풋터 엘리먼트
	**/
	getFooter : function() {
		return this._htWElement["footer"] ? this._htWElement["footer"].$value() : null;
	},

	/**
		nContentIndex에 해당하는 컨텐츠 보이기 처리함수
		@param {Number} nContentIndex 컨텐츠 인덱스 번호
	**/
	showContentView : function(nContentIndex) {
		//console.log("Page >> showContentView ", nContentIndex);
		var welContentView = this._oPageLayout.getContentCT(nContentIndex);
		//welContentView.show();
		welContentView.css({ "zIndex" : 10 });
	},

	/**
		nContentIndex에 해당하는 컨텐츠 숨기기 처리함수
		@param {Number} nContentIndex 컨텐츠 인덱스 번호
	**/
	hideContentView : function(nContentIndex) {
		//console.log("Page >> hideContentView ", nContentIndex);
		var welContentView = this._oPageLayout.getContentCT(nContentIndex);
		welContentView.css({ "zIndex" : 1 });
		//welContentView.hide();
	},

	/**
		보이기 처리 함수
	**/
	show : function() {
		//console.log("Page >> show ");
		//this._welPage.show();
		this._welPage.css({ "zIndex" : 10 });
	},

	/**
		숨기기 처리 함수
	**/
	hide : function() {
		//console.log("Page >> hide ");
		this._welPage.css({ "zIndex" : 1 });
		//this._welPage.hide();
	}
});





/**
	Scroll 컴포넌트 인스턴스 생성 및 관리
**/
jindo.m.PageLayoutUI.ScrollManager = jindo.$Class({
	$init : function(htOption) {
		//console.log("== jindo.m.PageLayoutUI.ScrollManager ==")
		this._initVar(htOption);
	},

	/**
		변수 초기화 처리 함수
	**/
	_initVar : function(htOption) {
		this._aScrolls = [];
		this._aScrollOptions = [];
		this._oPageLayout = htOption.oPageLayout;
		this._htOption = htOption.htOption;
		this._nTotalScrollCnt = 0;
	},

	/**
		스크롤 추가 처리 함수
	**/
	addScroll : function(htScrollOption) {
		//console.log("**addScroll", htScrollOption, this._oPageLayout._bMultiPage)

		this._aScrollWrappers = jindo.$ElementList(htScrollOption.welBaseElement.queryAll(".scroll-wrapper")).$value();
		this._nTotalScrollCnt += this._aScrollWrappers.length;
		var nWidth = htScrollOption.nScrollWidth;
		var nHeight = htScrollOption.nScrollHeight;

		var welScrollWrapper, welScroller, welContent;
		var oScroll, htOption;
		// 스크롤 옵션 생성
		htOption = this._htOption || {};
		htOption["nWidth"] = nWidth;
		htOption["nHeight"] = nHeight;
		for(var i = 0, nLen = this._aScrollWrappers.length; i < nLen; i++) {
			// console.log("	scroll : " + i)
			// 스크롤 인스턴스 생성
			welScrollWrapper = this._aScrollWrappers[i];
			oScroll = new jindo.m.Scroll(welScrollWrapper.$value(), htOption);
			welContent = jindo.$Element(welScrollWrapper.query(".jmc-content"));
			welContent.show();
			oScroll.refresh();

			// 컨텐츠가 적어서 스크롤이 안생겼을 경우
			if(!oScroll.hasVScroll()) {
				// console.log('--?');
				welScroller = jindo.$Element(welScrollWrapper.query(".scroller"));
				welScroller.css({
					"width" : nWidth + "px",
					"height" : (nHeight-1) + "px"
				});
			}

			// 스크롤 관련정보 저장
			this._aScrolls.push(oScroll);
			htOption = {
				"welWrapper" : welScrollWrapper,
				"welScroller" : welScroller,
				"welContent" : welContent,
				"nWidth" : nWidth,
				"nHeight" : nHeight
			};
			this._aScrollOptions.push(htOption);
		}
	},

	/**
		전체 생성된 스크롤 개수 반환함수
		@return  {Number} nScrollCount	스크롤개수
	**/
	getScrollCount : function() {
		 return this._aScrolls.length;
	},

	/**
		nIndex에 해당하는 스크률의 Wrapper 엘리먼트 반환함수
		@param {Number} nIndex 스크롤 인덱스
		@return {jindo.$element||array} vWrapper	Wrapper엘리먼트 || Wrapper엘리먼트 배열
	**/
	getScrollWrapper : function(nIndex) {
		var vWrapper;
		if(typeof nIndex == "undefined") {
			vWrapper = this._aScrollWrappers;
		} else {
			vWrapper = this._aScrollWrappers[nIndex];
		}
		return vWrapper;
	},

	/**
		nIndex에 해당하는 스크롤의 Contnet 엘리먼트 반환함수
		@param {Number} nIndex 스크롤 인덱스
		@return {jindo.$element||array} vContent	Content엘리먼트 || Content엘리먼트 배열
	**/
	getScrollContent : function(nIndex) {
		var vContent;
		if(typeof nIndex == "undefined") {
			vContent = [];
			for(var i = 0, nLen = this._aScrollOptions.length; i < nLen; i++) {
				vContent.push(this._aScrollOptions[nIndex]["welContent"]);
			}
		} else {
			vContent = this._aScrollOptions[nIndex]["welContent"];
		}
		return vContent;
	},

	/**
		리사이즈 처리 함수
		@param {Array} aScrollSize	스크롤 영역 사이즈 정보 배열
	**/
	resize : function(aScrollSize) {
		//console.log("ScrollManager >> resize >> htScrollSize")
		var oSize, nWidth, nHeight;
		for(var i = 0, nLen = this._aScrolls.length; i < nLen; i++) {
			oSize = aScrollSize[i] || aScrollSize[0];
			nWidth = oSize.nScrollWidth;
			nHeight = oSize.nScrollHeight;
			//console.log(nWidth, nHeight)

			// 컨텐츠가 적어서 스크롤이 안생겼을 경우
			if(!this._aScrolls[i].hasVScroll()) {
				this._aScrollOptions[i].welScroller.css({
					"width" : nWidth + "px",
					"height" : nHeight + "px"
				});
			}

			// Wrapper 리사이즈 처리
			this._aScrolls[i].option({
				"nWidth" : nWidth,
				"nHeight" : nHeight
			});
			this._aScrolls[i].refresh();

			// 리사이즈 처리된 값 저장
			this._aScrollOptions[i]["nWidth"] = nWidth;
			this._aScrollOptions[i]["nHeight"] = nHeight;
		}
	}
});




/**
	Flicking 컴포넌트 인스턴스 생성 및 관리
**/
jindo.m.PageLayoutUI.Flicking = {
	init : function(elFlickView, htOption) {
		//console.log("== jindo.m.PageLayoutUI.Flicking ==")
		this._initVar(elFlickView, htOption);
		this._setFlickingArea();

		// 플리킹 인스턴스 생성
		htOption = this._htOption;
		htOption["bAutoResize"] = false;
		htOption["nDefaultIndex"] = this._nCurrentIndex;
		htOption["bUseDiagonalTouch"] = false;
		this._oFlicking = new jindo.m.Flicking(this._welFlickView.$value(), htOption);
		// 커스텀이벤트 attach
		this._oFlicking.attach({
			"touchStart" : jindo.$Fn(this._onTouchStartFlicking, this).bind(),
			"beforeFlicking" : jindo.$Fn(this._onStartFlicking, this).bind(),
			"afterFlicking" : jindo.$Fn(this._onEndFlicking, this).bind(),
			"move" : jindo.$Fn(this._onEndFlicking, this).bind()
		});
	},

	/**
		변수 초기화 처리 함수
	**/
	_initVar : function(elFlickView, htOption) {
		this._welFlickView = jindo.$Element(elFlickView);
		this._oPageLayout = htOption.oPageLayout;
		this._nWidth = htOption.nFlickWidth;
		this._nHeight = htOption.nFlickHeight;
		this._nCurrentIndex = htOption.nDefaultIndex;
		this._htOption = htOption.htOption || {};
		this._aFlickingContents = jindo.$ElementList(this._welFlickView.queryAll("." + this._htOption.sClassPrefix + this._htOption.sContentClass)).$value();
		this._aInnerContents = jindo.$ElementList(this._welFlickView.queryAll(".jmc-content")).$value();
	},

	/**
		플리킹 영역을 엘리먼트 초기설정을 처리한다.
	**/
	_setFlickingArea : function() {
		this._welFlickView.css({
			"width" : this._nWidth + "px",
			"height" : this._nHeight + "px"
		});

		var elFlickingContent;
		for(var i = 0, nLen = this._aFlickingContents.length; i < nLen; i++) {
			elFlickingContent = this._aFlickingContents[i];
			elFlickingContent.css({
				"float" : "left",
				"width" : "100%",
				"height" : "100%"
			});
		}
	},

	/**
	 *@description 플리킹 영역에 touchstart가 발생하는 순
	**/
	_onTouchStartFlicking : function(oCustomEvt){
		if(this._oPageLayout.onTouchStartFlicking(oCustomEvt)){
			return true;
		}else{
			//플리킹 취소
			if(oCustomEvt.stop) {
				oCustomEvt.stop();
			} else {
				return false;
			}
		}

	},

	/**
		beforeFlicking에 수행되는 함수
		@param {Object} oCustomEvent	이벤트 객체
	**/
	_onStartFlicking : function(oCustomEvent) {
		if(this._oPageLayout.onBeforeMovePage(oCustomEvent)) {
			return true;
		} else {
			// 플리킹이 취소된 경우 처리
			if(oCustomEvent.stop) {
				oCustomEvent.stop();
			} else {
				return false;
			}
		}
	},

	/**
		afterFlicking에 수행되는 함수
		@param {Object} oCustomEvent	이벤트 객체
	**/
	_onEndFlicking : function(oCustomEvent) {
		var nCurrentIndex = oCustomEvent.nContentsIndex;
		//console.log("Flicking >> resize >> _onEndFlicking", "현재 페이지 nCurrentIndex", nCurrentIndex)

		// 페이지 이동처리
		this._oPageLayout.onAfterMovePage(oCustomEvent);
	},

	/**
		리사이즈 처리함수
		@param {Object} htFlickSize	리사이즈 정보 변수
	**/
	resize : function(htFlickSize) {
		//console.log("Flicking >> resize >> htScrollSize", htFlickSize.nFlickWidth, htFlickSize.nFlickHeight)
		this._nWidth = htFlickSize.nFlickWidth;
		this._nHeight = htFlickSize.nFlickHeight;

		// 플리킹 영역 리사이즈
		this._welFlickView.css({
			"width" : this._nWidth + "px",
			"height" : this._nHeight + "px"
		});
		this._oFlicking.refresh();
	},

	/**
		현재 패널의 인덱스 반환함수

		@method getCurrentIndex
		@return {Number} nCurrentIndex	현재 패널의 인덱스 번호
	**/
	getCurrentIndex : function() {
		return this._oFlicking.getContentIndex();
	},

	/**
		nIndex에 해당하는 패널로 이동처리 함수

		@method moveTo
		@param {Number} nIndex		플리킹 패널의 인덱스 번호
	**/
	moveTo : function(nIndex, nDuration) {
		if(typeof nIndex == "undefined") { return false; }

		// 터치로 인한 플리킹이 아니라 moveTO로 바로 호출되었을때 커스텀 이벤트 처리
		if(!this._onStartFlicking({
			"nContentsIndex" : this._oFlicking.getContentIndex(),
			"nContentsNextIndex" : nIndex
		})) { return; }
		this._oFlicking.moveTo(nIndex, nDuration);
	}
};





/**
	AjaxHistory 컴포넌트 인스턴스 생성 및 관리
**/
jindo.m.PageLayoutUI.AjaxHistory = {
	init : function(htOption) {
		//console.log("== jindo.m.PageLayoutUI.AjaxHistory ==")
		this._initVar(htOption);

		// AjaxHistory 인스턴스 생성
		this._oAjaxHistory = new jindo.m.AjaxHistory(this._htOption);

		// 커스텀이벤트 attach
		this._oAjaxHistory.attach({
			"load" : jindo.$Fn(this._onLoadHistory, this).bind(),
			"change" : jindo.$Fn(this._onChangeHistory, this).bind()
		});

		this._oAjaxHistory.initialize();
	},

	/**

	**/
	_initVar : function(htOption) {
		this._oPageLayout = htOption.oPageLayout;
		this._htOption = htOption.htOption;
	},

	/**
		초기 로딩시 히스토리 처리함수
	**/
	_onLoadHistory : function(oCustomEvent) {
		//console.log("AjaxHistory >> _onLoadHistory");
		this.addHistory(true);
	},

	/**
		히스토리에 변경이 발생시 수행되는 함수
	**/
	_onChangeHistory : function(oCustomEvent) {
		//console.log("AjaxHistory >> _onChangeHistory >> ", decodeURIComponent(jindo.$Json(oCustomEvent.htHistoryData).toString()));
		var htData = jindo.$Json(oCustomEvent.htHistoryData).toObject();
		this._oPageLayout.changeHistory(htData.page);
	},

	/**
		히스토리 추가 처리함수
	**/
	addHistory : function(bLoad) {
		//console.log("AjaxHistory >> _addHistory >> currentIndex", this._oPageLayout.getCurrentIndex());
		this._oAjaxHistory.addHistory({
			"page" : this._oPageLayout.getCurrentIndex()
		}, bLoad);
	}
};
