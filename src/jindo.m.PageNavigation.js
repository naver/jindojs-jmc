/**
	@fileOverview 여러개의 항목들을 페이지 형태로 표현해 주는 컴포넌트
	@author "oyang2"
	@version #__VERSION__#
	@since 2011. 7. 22.
**/
/**
	여러개의 항목들을 페이지 형태로 표현해 주는 컴포넌트

	@class jindo.m.PageNavigation
	@extends jindo.m.CorePagination
	@keyword pagination, page, 페이지, 목록
	@group Component

	@history 1.12.0 Bug click시 다음 이벤트가 중지되는 문제 수정
	@history 1.2.0 Update Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Update Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 0.9.0 Release 최초 릴리즈
**/
jindo.m.PageNavigation = jindo.$Class({
	/* @lends jindo.m.PageNavigation.prototype */
	/**
		초기화 함수

		@constructor
		@param {Object} [htOption] 초기화 옵션 객체
			@param {String} [htOption.sClassPrefix='page_'] 초기 HTML/CSS 구조에서 필요한 className 앞에 붙는 prefix 정보
			@param {Number} [htOption.nItem=10] 전체 아이템 개수
			@param {Number} [htOption.nItemPerPage=10] 한페이지당 보여줄 아이템의 개수
			@param {Number} [htOption.nPage=1] 현재페이지
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate() 수행여부
			@param {HTMLElement} [htOption.sInfoTemplate={=PAGE} / {=TOTALPAGE}] info 엘리먼트내에 innerHTML로 들어갈 마크업 템플릿.
				<ul>
				<li>{=PAGE} 의 경우 현재 페이지로 치환된다.</li>
				<li>{=TOTALPAGE} 의 경우 전체 페이지수로 치환된다.</li>
				<li>{=STARTINDEX} 의 경우 현재 페이지의 아이템 시작 인덱스로 치환된다.</li>
				<li>{=ENDINDEX} 의 경우 현재페이지의 아이템 끝 인덱스로 치환된다.</li>
				</ul>
			@param {String} [htOption.htAjax={
					sApi : null,
					htAjaxOption : { type: 'xhr' },
					htQuery : {},
					sPage : 'page',
					sDisplay : 'display' }
					] 더보기 할 때 마다 Ajax 호출이 필요하면 이 Ajax 호출에 대한 옵션을 설정한다.<br />
				Ajax 호출을 하지 않으면 이 값을 설정하지 않거나 null 값을 설정 한다.<br />
				@param {Number} [htOption.htAjax.sApi=null] Ajax 호출이 필요한 경우 API 를 저장한다.
					Ajax 호출이 필요 없을 경우에는 null 값을 저장한다.
				@param {HTMLElement} [htOption.htAjax.htAjaxOption=type : 'xhr']  Ajax 호출시에 onload를 제외한 필요한 옵션값을 저장한다.
					자세한 옵션 정보는 jindo.$Ajax의 옵션을 참고
				@param {HTMLElement} [htOption.htAjax.htQuery={}] Ajax 호출시에 필요한 현재 페이지 정보(page) 필요한 아이템 개수 (display)를 제외한
					파라미터가 있을 경우에는 HashTable 형식으로 저장한다.<br />
					기본값 : {}(비어있는 HashTable)
				@param {String} [htOption.htAjax.sPage='page'] Ajax 호출시에 필요한 현재 페이지 정보의 파라미터 이름을 설정한다.
				@param {String} [htOption.htAjax.sDisplay='display'] Ajax 호출시에 필요한 아이템 개수(display)의 파라미터 이름을 설정한다.
			@param {Boolean} [htOption.bUseCircular=false] 네비게이션 순환여부를 결정한다.
		@history 1.7.0 Update [bUseCircular] 옵션 추가
	**/
	$init : function(el, htOption) {
		this.option({
			sClassPrefix : 'page_',
			nItem : 10, //아이템 개수
			nItemPerPage : 10,
			nPage : 1,
			bActivateOnload : true,
			sInfoTemplate : '{=PAGE} / {=TOTALPAGE}',
			bUseCircular : false,
			htAjax : {}
		});
		this.option(htOption || {});
		this._initVar();
		this._setWrapperElement(el);

		if(this.option("bActivateOnload")) {
			this.activate();
			this._nCurrentPage = this.option('nPage');
		}
	},
	/**
		jindo.m.MoreContentButton 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar: function() {
		var _htDefalutAjax = {
			sApi : null,
			htAjaxOption : {
				type: 'xhr'
			},
			htQuery : {},
			sPage : 'page',
			sDisplay : 'display'
		};

		var htAjax = this.option('htAjax');

		if(!htAjax){
			this.option('htAjax', _htDefalutAjax);
			return;
		}

		for(var p in _htDefalutAjax){
			if(typeof htAjax[p] == 'undefined'){
				htAjax[p] = _htDefalutAjax[p];
			}
		}

		//ajax option
		for( p in _htDefalutAjax.htAjaxOption){
			if(typeof htAjax.htAjaxOption[p] == 'undefined'){
				htAjax.htAjaxOption[p] = _htDefalutAjax.htAjaxOption[p];
			}
		}

		//query string option
		for( p in _htDefalutAjax.htQuery){
			if(typeof htAjax.htQuery[p]== 'undefined'){
				htAjax.htQuery[p] = _htDefalutAjax.htQuery[p];
			}
		}

		if(!!htAjax.sApi){
			this.oAjax = new jindo.$Ajax(htAjax.sApi, htAjax.htAjaxOption);
		}
	},

	/**
		jindo.m.PageNavigation 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
	**/
	_setWrapperElement: function(el) {
		this._htWElement = {};
		el = jindo.$(el);
		var sClass = '.'+this.option('sClassPrefix');

		this._htWElement.elBase = jindo.$Element(el);

		this._htWElement.elPrev = jindo.$Element(jindo.$$.getSingle(sClass+'prev', el));
		this._htWElement.elNext = jindo.$Element(jindo.$$.getSingle(sClass+'next', el));
		this._htWElement.elPrevOff = jindo.$Element(jindo.$$.getSingle(sClass+'prev-off', el));
		this._htWElement.elNextOff = jindo.$Element(jindo.$$.getSingle(sClass+'next-off', el));
		this._htWElement.elInfo = jindo.$Element(jindo.$$.getSingle(sClass+'info', el));

	},

	_onClickPrev : function(oEvent){
		oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
		if(!this.hasPreviousPage()) {
			if(this.option("bUseCircular")) {
				this.movePageTo(this.getTotalPages());
			}
			return;
		}

		var nPage = this.getCurrentPage();
		this.movePageTo(nPage-1);

	},

	_onClickNext : function(oEvent){
		oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
		if(!this.hasNextPage()) {
			if(this.option("bUseCircular")) {
				this.movePageTo(1);
			}
			return;
		}
		var nPage = this.getCurrentPage();
		this.movePageTo(nPage+1);
	},

	/**
		n 페이지로 이동합니다.

		@method movePageTo
		@param {Number} n
		@param {Boolean} bFireEvent 커스텀 이벤트 발생 여부
	**/
	movePageTo : function(n, bFireEvent){
		if(typeof bFireEvent == 'undefined'){
			bFireEvent = true;
		}

		if(bFireEvent){
			if(!this._fireEventBefore(n)){ return;}
		}

		if(!!this.option('htAjax').sApi){
			this._callAjax(n, bFireEvent);
		}else{
			this._move(n);
			if(bFireEvent){
				this._fireEventEnd();
			}
			this.updateInfo();
			this.updateNavigation();
		}

	},

	_move : function(n){
		var nPage = this._convertToAvailPage(n);
		if(nPage != this._nCurrentPage){
			this._nCurrentPage = nPage;
		}
	},

	_callAjax : function(nPage, bFireEvent){

		var self = this;
		this.oAjax.option('onload', null);

		this.oAjax.option('onload', function(res){
			self._onAjaxResponse(res, nPage ,bFireEvent);
		});
		this.oAjax.request(this._getQueryString(nPage));

	},

	_fireEventBefore : function(nPage){
		/**
			페이지 이동하기 직전에 발생한다.

			@event beforeMove
			@param {String} sType 커스텀 이벤트명
			@param {Number} nPage 이동하려는 페이지
			@param {Number} nCurrentPage 현재 페이지
			@param {Number} nItemCount 전체 아이템 개수
			@param {Number} nItemPerPage 한페이지당 보여줄 아이템의 개수
			@param {Number} nTotalPages 전체 페이지 수
			@param {Function} stop 페이지이동을 수행을 중지한다.<br /> 'beforeMove' 이후의 커스텀 이벤트 'move'는 발생하지 않는다.
			@history 1.7.0 Update nItem, nItemPerPage 속성 추가
		**/
		return this.fireEvent('beforeMove', {
			nPage : nPage,
			nCurrentPage: this.getCurrentPage(),
			nItemCount : this.getItemCount(),
			nItemPerPage : this.getItemPerPage(),
			nTotalPages : this.getTotalPages()
		});
	},

	_fireEventEnd : function(oResponse){
		if(typeof oResponse == 'undefined'){
			oResponse = null;
		}
		var nPage = this.getCurrentPage();
		var htIndex = this.getPageItemIndex(nPage);
		/**
			페이지 이동이후 발생한다

			@event move
			@param {String} sType 커스텀 이벤트명
			@param {Number} nPage 현재 페이지
			@param {Number} nItemCount 전체 아이템 개수
			@param {Number} nItemPerPage 한페이지당 보여줄 아이템의 개수
			@param {Number} nTotalPages 전체 페이지 수
			@param {Number} nStartIndex 현재페이지의 시작 인덱스 (0부터 시작값)
			@param {Number} nEndIndex 현재페이지의 끝 인덱스 (0부터 시작값)
			@param {jindo.$Ajax.Response} oResponse Ajax 호출시 응답 객체<br /> Ajax 호출 설정이 되어 있을때에만 값이 존재한다.
			@history 1.7.0 Update nItem, nItemPerPage 속성 추가
		**/
		return this.fireEvent('move',{
			nPage : this.getCurrentPage(),
			nStartIndex : htIndex.nStart,
			nEndIndex : htIndex.nEnd,
			oResponse : oResponse,
			nItemCount : this.getItemCount(),
			nItemPerPage : this.getItemPerPage(),
			nTotalPages : this.getTotalPages()
		});
	},

	_onAjaxResponse : function(oResponse, nPage, bFireEvent){
		this._move(nPage);

		if(bFireEvent){
			this._fireEventEnd(oResponse);
		}

		this.updateInfo();
		this.updateNavigation();
	},

	_getQueryString : function(n){
		var htQuery = this.option('htAjax').htQuery || {};
		var htIndex = this.getPageItemIndex(n);

		htQuery[this.option('htAjax').sPage] = n;
		htQuery[this.option('htAjax').sDisplay] = Math.min(this.getItemPerPage(), (this.getItemCount() - htIndex.nStart));

		return htQuery;
	},

	/**
		현재페이지에 맞게 정보 영역을 업데이트 합니다.

		@method updateInfo
	**/
	updateInfo : function(){
		if(!this._htWElement.elInfo){ return;}

		var nPage = this.getCurrentPage();
		var htIndex = this.getPageItemIndex(nPage);

		var sText = this.option('sInfoTemplate').replace(/\{=PAGE\}/,nPage).replace(/\{=TOTALPAGE\}/, this.getTotalPages())
		.replace(/\{=ITEMCOUT\}/, this.option('nItem')).replace(/\{=STARTINDEX\}/,htIndex.nStart+1).replace(/\{=ENDINDEX\}/,htIndex.nEnd+1);

		this._htWElement.elInfo.html(sText);
	},

	/**
		현재페이지에 맞게 이전, 이후 링크 정보를 업데이트 합니다.

		@method updateNavigation
	**/
	updateNavigation : function(){
		var nPage = this.getCurrentPage();

		if(!!this._htWElement.elPrev) {this._htWElement.elPrev.hide();}
		if(!!this._htWElement.elNext) {this._htWElement.elNext.hide();}
		if(this._htWElement.elPrevOff) {this._htWElement.elPrevOff.hide();}
		if(this._htWElement.elNextOff) {this._htWElement.elNextOff.hide();}

		if(this.getTotalPages() == 1){
			return;
		}

		if(this.option("bUseCircular")) {
			if(!!this._htWElement.elPrev){this._htWElement.elPrev.show('inline-block');}
			if(!!this._htWElement.elNext){this._htWElement.elNext.show('inline-block');}
		} else {
			if(nPage == 1){
				if(!!this._htWElement.elPrevOff) {this._htWElement.elPrevOff.show('inline-block');}
				if(!!this._htWElement.elNext){this._htWElement.elNext.show('inline-block');}
			}else if (nPage == this.getTotalPages()){
				if(!!this._htWElement.elNextOff){this._htWElement.elNextOff.show('inline-block');}
				if(!!this._htWElement.elPrev){this._htWElement.elPrev.show('inline-block');}
			}else{
				if(!!this._htWElement.elPrev){this._htWElement.elPrev.show('inline-block');}
				if(!!this._htWElement.elNext){this._htWElement.elNext.show('inline-block');}
			}
		}

	},

	/**
		1페이지로 더보기를 다시 그린다. 커스텀이벤트는 발생하지 않는다.

		@method reset
		@param {Number} nItem 아이템의 개수가 바뀌었을 경우 설정해준다.
	**/
	reset : function(nItem){
		if (typeof nItem == "undefined") {
			nItem = this.option('nItem');
		}

		this.setItemCount(nItem);
		this.movePageTo(1, false);
	},

	/**
		jindo.m.PageNavigation 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		this._attachEvent();
	},

	/**
		jindo.m.PageNavigation 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEvent();
	},

	/**
		jindo.m.PageNavigation 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		this._htEvent = {};
		if(!!this._htWElement.elNext){
			this._htEvent["click_Next"] = {
				ref : jindo.$Fn(this._onClickNext, this).attach(this._htWElement.elNext, 'click'),
				el : this._htWElement.elNext.$value()
			};
		}
		if(!!this._htWElement.elPrev){
			this._htEvent["click_Prev"] = {
				ref : jindo.$Fn(this._onClickPrev, this).attach(this._htWElement.elPrev, 'click'),
				el : this._htWElement.elPrev.$value()
			};
		}

	},

	/**
		jindo.m.PageNavigation 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEvent : function() {
		for(var p in this._htEvent) {
			var htTargetEvent = this._htEvent[p];
			htTargetEvent.ref.detach(htTargetEvent.el, p.substring(0, p.indexOf("_")));
		}
		this._htEvent = null;
	},

	/**
		jindo.m.PageNavigation 에서 사용하는 모든 객체를 release 시킨다.
		@method destroy
	**/
	destroy : function() {
		this.deactivate();

		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
	}
}).extend(jindo.m.CorePagination);