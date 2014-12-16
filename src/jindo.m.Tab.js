/**
	@fileOverview 여러 패널로 나뉘어진 영역에 탭을 이용한 네비게이팅을 제공하는 컴포넌트
	@author sculove
	@version #__VERSION__#
	@since 2012. 03. 19
**/
/**
	여러 패널로 나뉘어진 영역에 탭을 이용한 네비게이팅을 제공하는 컴포넌트

	@class jindo.m.Tab
	@extends jindo.m.CoreTab
	@keyword tab, 탭
	@group Component

	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.2.0 Update 패널 슬라이드 기능 추가<br />더보기 기능 추가
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 0.9.0 Release 최초 릴리즈
**/
jindo.m.Tab = jindo.$Class({
	/* @lends jindo.m.Tab.prototype */
	/**
		초기화 함수

		@constructor
		@param {Varient} el Tab Layout Wrapper
		@param {Object} [htOption] 초기화 옵션 객체
			@param {String} [htOption.sMoreText="더보기"] 더보기탭 생성시 생성된 더보기 탭의 내용을 지정한다.
			@param {Number} [htOption.nCountOnList=0] 탭 생성시 화면에 표시될 탭의 개수. 탭의 개수보다 이 값이 작을 경우, 더보기 탭이 생성된다.<br />0 일 경우는 더보기 탭을 사용하지 않는다.
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트가 로딩 될때 활성화 시킬지 여부를 결정한다.<br /> false로 설정하는 경우에는 activate()를 호출하여 따로 활성화 시켜야 한다.
			@param {Number} [htOption.nDefaultIndex=0] 탭생성시 선택될 탭의 index 정보.

	**/
	$init : function(el, htOption) {
		this.option({
			sMoreText : "더보기",
			nCountOnList : 0 	// 이 항목에 지정한 갯수 만큼만 탭을 보여줍니다. 그 이상의 탭은 "더보기" 목록에 넣습니다.
								// 현재 3으로 지정했으므로, 3개의 탭을 보여주고 + "더보기"에 나머지 탭을 넣게 됩니다.
								// 만약 0으로 설정하거나 실제 tab보다 개수가 클경우 "더보기" 기능을 사용하지 않습니다.
		});
		this.option(htOption || {});
		this._initData();
		if(this.option("bActivateOnload")) {
			this.activate();
		}
		this.select(this.option("nDefaultIndex"));
	},

	/**
		jindo.m.Tab 에서 사용하는 모든 인스턴스 변수를 초기화한다.
		@override
	**/
	_initVar : function() {
		this.$super._initVar();
		this._isMore = false;
		this._nCurrentMoreTab = -1;
	},

	/**
		초기 tab, panel 데이터 초기화
		@override
	**/
	_initData : function() {
		this.$super._initData();
		var nCountOnList = this.option("nCountOnList");
		// 더보기 관련 기능 추가
		if(nCountOnList > 0 && this._aTab.length > nCountOnList) {
			this._makeMoreContainer(nCountOnList);
		}
	},

	/**
		more버튼을 구성한다.
		@param  {Number} nCountOnList [more외로 유지할 탭 개수]
	**/
	_makeMoreContainer: function(nCountOnList) {
		this._htWElement["more_tab"] = jindo.$Element('<li class="'+ this._sPrefix + 'more-tab"><a style="display: block; height: 100%">' + this.option("sMoreText") +  ' <span class="' + this._sPrefix + 'arrow-down"></span></a></li>');
		this._htWElement["more_container_wrap"] = jindo.$Element('<div style="position:relative; width:100%;z-index:10">');
		this._htWElement["more_container"] = jindo.$Element('<ul class="' + this._sPrefix + 'more-cont" style="display:none; position: absolute">');
		for(var i=nCountOnList, nLength = this._aTab.length; i<nLength; i++) {
			this._tab2more(i);
		}
		this._htWElement["more_container_wrap"].append(this._htWElement["more_container"]);
		this._htWElement["more_tab"].append(this._htWElement["more_container_wrap"]);
		this._htWElement["tab_container"].append(this._htWElement["more_tab"]);
		this._htWElement["more_arrow"] = jindo.$Element(this._htWElement["more_tab"].query("span"));
		this._nCurrentMoreTab = nCountOnList-1;
		this._isMore = true;
	},

	/**
		더보기 버튼 이벤트 attach
	**/
	_attachMoreContainerEvent : function() {
		this._htEvent["more_click"] = {
			el  : this._htWElement["more_container"],
			ref : jindo.$Fn(this._onClickMore, this).attach(this._htWElement["more_container"], "click")
		};
	},

	/**
		더보기 버튼 클릭시 발생하는 이벤
		@param  {[type]} we [description]
	**/
	_onClickMore: function(we) {
		if(this._isMore) {
			var welElement = jindo.$Element(we.element);
			var sClassName = this._sPrefix + "more-li";
			if(!welElement.hasClass(sClassName)) {
				welElement = welElement.parent(function(v){
					return v.hasClass(sClassName);
				},1)[0];
			}
			this.select(this._getIdx(welElement));
			we.stop(jindo.$Event.CANCEL_BUBBLE);
		}
	},

	/**
		 tab을 more로 이동
		@param  {Number} nIdx 이동할 index
	**/
	_tab2more : function(nIdx) {
		var wel = this._htWElement["more_container"].first(),
			isMoved = false,
			nTargetIdx;

		this._aTab[nIdx].className(this._sPrefix + "more-li");
		this._aTab[nIdx].first().className(this._sPrefix + "more-lia");
		while(wel) {
			nTargetIdx = this._getIdx(wel);
			if(nTargetIdx > nIdx) {
				wel.before(this._aTab[nIdx]);
				isMoved = true;
				break;
			}
			wel = wel.next();
		}
		if(!isMoved) {
			this._htWElement["more_container"].append(this._aTab[nIdx]);
		}
	},

	/**
		 more를 Tab으로 이동
		@param  {Number} nIdx 이동할 index
	**/
	_more2tab : function(nIdx) {
		this._aTab[nIdx].className(this._sPrefix + "tab");
		this._aTab[nIdx].first().className(this._sPrefix + "taba");
		this._htWElement["more_tab"].before(this._aTab[nIdx]);
		this._nCurrentMoreTab = nIdx;
	},

	/**
		 셀렉트 이벤트 선택 후 처리
	**/
	_onAfterSelect : function(welElement) {
		// more 버튼이 선택된 경우
		if(welElement.hasClass(this._sPrefix + "more-tab")) {
			var isHide = this._htWElement["more_container"].visible();

			/**
				더보기탭이 있을 경우, 더보기 내용이 보이기 전에 발생

				@event beforeShow
				@param {String} sType 커스텀 이벤트명
				@param {Number} nIndex 선택되기전의 tab 인덱스 번호 (0부터 시작)
				@param {HTMLElement} elTab 선택되기 전의 tab Element
				@param {HTMLElement} elPanel 선택되기 전의 panel Element
			**/
			if( this._fireEventBefore( isHide ? "beforeHide" : "beforeShow") ) {
				this._htWElement["more_container"].toggle();
				this._htWElement["more_tab"].toggleClass(this._sPrefix + "more-on");
				this._htWElement["more_arrow"].toggleClass(this._sPrefix + "arrow-down", this._sPrefix + "arrow-up");

				/**
					더보기탭이 있을 경우, 더보기 내용이 보인 후에 발생

					@event show
					@param {String} sType 커스텀 이벤트명
					@param {Number} nIndex 선택된 tab 인덱스 번호 (0부터 시작)
					@param {HTMLElement} elTab 선택된 tab Element
					@param {HTMLElement} elPanel 선택된 panel Element
				**/
				this._fireEventBefore( isHide ? "hide" : "show");
			}
		} else {
			// more버튼이 있는 경우는 사라지게 한다.
			this._hideMoreList();
			this.select(this._getIdx(welElement));
		}
	},

	/**
		 더보기 리스트 숨기
		@return {[type]} [description]
	**/
	_hideMoreList : function() {
		if(this._isMore) {

			/**
				더보기탭이 있을 경우, 더보기 내용이 사라지 전에 발생

				@event beforeHide
				@param {String} sType 커스텀 이벤트명
				@param {Number} nIndex 선택되기전의 tab 인덱스 번호 (0부터 시작)
				@param {HTMLElement} elTab 선택되기 전의 tab Element
				@param {HTMLElement} elPanel 선택되기 전의 panel Element

			**/
			if( this._fireEventBefore("beforeHide") ) {
				this._htWElement["more_container"].hide();
				this._htWElement["more_tab"].removeClass(this._sPrefix + "more-on");
				this._htWElement["more_arrow"].className(this._sPrefix + "arrow-up");

				/**
					더보기탭이 있을 경우, 더보기 내용이 사라 후에 발생

					@event hide
					@param {String} sType 커스텀 이벤트명
					@param {Number} nIndex 선택된 tab 인덱스 번호 (0부터 시작)
					@param {HTMLElement} elTab 선택된 tab Element
					@param {HTMLElement} elPanel 선택된 panel Element
				**/
				this._fireEventBefore("hide");
			}
		}
	},

	/**
		index에 해당하는 패널 선택
		@param {Object} nIdx
	**/
	_beforeSelect : function(nIdx) {
		if(this._isMore) {
			// console.log("현재moreTab : " + this._nCurrentMoreTab + " , " + nIdx);
			if( (nIdx >= this.option("nCountOnList")-1) && (this._nCurrentMoreTab != nIdx) ) {
				// more 숨기기
				this._hideMoreList();
				// Tab과 more를 이동
				this._tab2more(this._nCurrentMoreTab);
				this._more2tab(nIdx);
			}
		}
	},

	/**
		jindo.m.Tab 에서 사용하는 모든 이벤트를 바인드한다.
		@override
	**/
	_attachEvent : function() {
		this.$super._attachEvent();
		if(this._isMore) {
			this._attachMoreContainerEvent();
		}
	},

	/**
		jindo.m.Tab 에서 사용하는 모든 이벤트를 해제한다.
		@override
	**/
	_detachEvent : function() {
		this.$super._detachEvent();
	},

	/**
		jindo.m.Tab 에서 사용하는 모든 객체를 release 시킨다.
		@override
		@method destroy
	**/
	destroy : function() {
		this.deactivate();
		this.$super.destroy();
	}
}).extend(jindo.m.CoreTab);