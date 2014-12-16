/**
	@fileOverview 더보기 버튼을 클릭하여 지정된 개수만큼의 목록을 동적으로 추가하는 컴포넌트
	@author "oyang2"
	@version #__VERSION__#
	@since 2011. 7. 20.
**/
/**
	더보기 버튼을 클릭하여 지정된 개수만큼의 목록을 동적으로 추가하는 컴포넌트

	@class jindo.m.MoreContentButton
	@extends jindo.m.CorePagination
	@group Component

	@history 1.3.1 Update sClassPrefix + reminder 가 존재할 경우, 남은 건수를 표기
	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.2.0 Bug jindo mobile 2.0.x버전 문법 오류 수정
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 0.9.0 Release 최초 릴리즈
**/
jindo.m.MoreContentButton = jindo.$Class({
	/* @lends jindo.m.MoreContentButton.prototype */
	/**
		초기화 함수

		@constructor
		@param {HTMLElement|String} sId 더보기 컴포넌트 기준 엘리먼트 아이디 혹은 엘리먼트
		@param {Object} [htOption] 초기화 옵션 객체
			@param {String} [htOption.sClassPrefix='more_'] 초기 HTML/CSS 구조에서 필요한 className 앞에 붙는 prefix 정보
			@param {Number} [htOption.nTotalItem=10] 실제 아이템의 전체 개수.
			화면에 전체 아이템 개수를 보여줄 값.<br />
			예를 들어 아이템 개수는 2만개 이고 더보기하여 로드할 아이템의 개수는 600개일 경우 nTotalItem에는 2만개를 세팅하고, nShowMaxItem에는 600개로 세팅한다. 전체 아이템 개수와 더보기할 아이템의 개수가 같을 경우 같은 값을 설정한다.
			@param {Number} [htOption.nShowMaxItem=10] 더보기 하여 화면에 보여줄 아이템의 최대 개수
			@param {Number} [htOption.nItemPerPage=10] 더보기 버튼을 클릭하였을 경우 추가될 아이템의 개수
			@param {Number} [htOption.nPage=1] 페이지 번호
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
			@param {Object} [htOption.htAjax={ sApi : null,
					htAjaxOption : { type: 'xhr' },
					htQuery : {},
					sStart : 'start',
					sDisplay : 'display' }] 더보기 할 때 마다 Ajax 호출이 필요하면 Ajax 호출에 대한 옵션을 설정한다.<br />
					Ajax 호출을 하지 않으면 이 값을 설정하지 않거나 null 값을 설정한다.<br />
				@param {Number} [htOption.htAjax.sApi=null] Ajax  호출이 필요한 경우 API 를 저장한다.<br /> Ajax 호출이 필요 없을 경우에는 null 값을 저장한다.
				@param {String} [htOption.htAjax.htAjaxOption={type : 'xhr'}] Ajax 호출시에 onload를 제외한 필요한 옵션값을 저장한다. 자세한 옵션 정보는 jindo.$Ajax의 옵션을 참고.
				@param {String} [htOption.htAjax.htQuery={}] Ajax 호출시에 필요한 아이템의 시작 위치(start) 필요한 아이템 개수 (display)를 제외한 파라미터가 있을 경우에는 HashTable 형식으로 저장한다. 기본값 : {}(비어있는 HashTable)
				@param {String} [htOption.htAjax.sStart="start"] Ajax 호출시에 필요한 아이템의 시작 위치(start)의 파라미터 이름을 설정한다.
				@param {String} [htOption.htAjax.sDisplay="display"] Ajax 호출시에 필요한 아이템 개수(display)의 파라미터 이름을 설정한다.
	**/
	$init : function(el, htOption) {
		this.option({
			sClassPrefix : 'more_',
			nTotalItem : 10, //실제 아이템 개수
			nShowMaxItem : 10, //최대 더보기 하여 보여줄 개수
			nItemPerPage : 10,
			nPage : 1,
			bActivateOnload : true,
			htAjax : {}
		});

		this.option(htOption || {});
		this.option('nItem', this.option('nShowMaxItem'));

		this._initVar();
		this._setWrapperElement(el);

		if(this.option("bActivateOnload")) {
			this.activate();
			this._nCurrentPage = this.option('nPage');
			this.updateInfo();
		}
	},

	/**
		jindo.m.MoreContentButton 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar: function() {
		//this._nCurrentPage = this.option('nPage');
		var _htDefalutAjax = {
			sApi : null,
			htAjaxOption : {
				type: 'xhr'
			},
			htQuery : {},
			sStart : 'start',
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
			//htAjax.htAjaxOption.onload = this._onAjaxResponse;
			this.oAjax = new jindo.$Ajax(htAjax.sApi, htAjax.htAjaxOption);
		}
	},

	/**
		jindo.m.MoreContentButton 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
	**/
	_setWrapperElement: function(el) {
		this._htWElement = {};
		var sClass = '.'+ this.option('sClassPrefix');
		this._htWElement.elBase = jindo.$Element(el);

		this._htWElement.elMoreButton = jindo.$Element(this._htWElement.elBase.query(sClass+'button'));
		this._htWElement.elTop = jindo.$Element(this._htWElement.elBase.query(sClass+'top'));
		this._htWElement.elLoading = jindo.$Element(this._htWElement.elBase.query(sClass+'loading'));
		this._htWElement.elMoreCnt = jindo.$Element(this._htWElement.elBase.query(sClass+'moreCnt'));

		this._htWElement.elTotal = jindo.$Element(this._htWElement.elBase.query(sClass+'total'));
		this._htWElement.elCurrent = jindo.$Element(this._htWElement.elBase.query(sClass+'current'));
		this._htWElement["elRemainder"] = jindo.$Element(this._htWElement.elBase.query(sClass+'remainder'));

		this._htWElement.elLast = jindo.$Element(this._htWElement.elBase.query(sClass+'last'));
		if(!!this._htWElement.elLast){
			this._htWElement.elLastTotal = jindo.$Element(this._htWElement.elLast.query(sClass+'total'));
			this._htWElement.elLastCurrent = jindo.$Element(this._htWElement.elLast.query(sClass+'current'));
			this._htWElement["elLastRemainder"] = jindo.$Element(this._htWElement.elLast.query(sClass+'remainder'));
		}
	},

	_onClickMore : function(oEvent){
		oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
		if(this.hasNextPage()){
			this.more();
		}
	},

	_onClickTop : function(oEvent){
		oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
		/**
			맨위로 버튼을 클릭할 때 발생한다.

			@event goTop
			@param {String} sType 커스텀 이벤트명
			@param {HTMLElement} element 클릭한 엘리먼트
			@param {Function} stop 호출 후에 영향 받는것 없다.

			@history 1.1.0 Update CustomEvent 추가
		**/
		this.fireEvent('goTop',{
			element : oEvent.element
		});
	},


	more : function(bFireEvent){
		if (typeof bFireEvent == "undefined") {
			bFireEvent = true;
		}
		var nPage = this._nCurrentPage +1;
		var nBeforePage = this.getCurrentPage();
		if(bFireEvent){
			/**
				더보기 수행전 발생한다.

				@event beforeMore
				@param {String} sType 커스텀 이벤트명
				@param {Number} nPage 더보기를 수행하여 이동할 페이지
				@param {Number} nCurrentPage 현재 페이지
				@param {Function} stop 더보기 수행을 중지한다.<br /> 'beforeMore' 이후 커스텀 이벤트 ('more')를 발생하지 않는다.
			**/
			if(!this.fireEvent('beforeMore',{
				nPage : nPage,
				nCurrentPage : nBeforePage
			})){
				return;
			}
		}
		var htIndex = this.getPageItemIndex(nPage);
		if(!htIndex){
			this.updateInfo();
			return;
		}

		this.showLoadingImg();

		if(!!this.option('htAjax').sApi){
			this._callAjax(nPage,true, bFireEvent);
		}else{
			this._move(nPage);
			if(bFireEvent){
				/**
					더보기 수행 이후에 발생한다

					@event more
					@param {String} sType 커스텀 이벤트명
					@param {Number} nPage 현재 페이지
					@param {Number} nStartIndex 현재 페이지의 아이템 시작 인덱스
					@param {Number} nEndIndex 현재 페이지의 아이템 끝 인덱스
					@param {jindo.$Ajax.Response} oResponse Ajax 호출 이후에 응답데이터<br />Ajax 호출 설정이 되어 있을때에만 값이 존재한다.
				**/
				this.fireEvent('more',{
					nPage : nPage,
					nStartIndex : htIndex.nStart,
					nEndIndex : htIndex.nEnd
				});
			}
			this.updateInfo();
		}
	},

	/**
		nPage 페이지로 이동한다.

		@method movePageTo
		@param {Number} nPage
		@param {Boolean} bFireEvent 커스텀 이벤트 발생 여부

	**/
	movePageTo : function(nPage, bFireEvent){
		if (typeof bFireEvent == "undefined") {
			bFireEvent = true;
		}

		var nBeforePage = this.getCurrentPage();
		if(bFireEvent){
			/**
				movePageTo 함수를 통해 페이지 이동 전에 발생한다.

				@event beforeMovePage
				@param {String} sType 커스텀 이벤트명
				@param {Number} nPage 이동할 페이지
				@param {Number} nCurrentPage (Number) :현재 페이지
				@param {Function} stop 페이지 이동을 중지한다. movePage가 발생하지 않는다.
				@history 1.1.0 Update CustomEvent 추가
			**/
			if(!this.fireEvent('beforeMovePage',{
				nPage : nPage,
				nCurrentPage : nBeforePage
			})){
				return;
			}
		}
		var htIndex = this.getPageItemIndex(nPage);
		if(!htIndex){
			this.updateInfo();
			return;
		}

		this.showLoadingImg();

		if(!!this.option('htAjax').sApi){
			this._callAjax(nPage, false ,bFireEvent);
		}else{
			this._move(nPage);

			if(bFireEvent){
				/**
					movePageTo 함수를 통해 페이지 이동전에 발생한다

					@event movePage
					@param {String} sType 커스텀 이벤트명
					@param {Number} nPage 현재 페이지
					@param {Number} nBeforePage 이동 전 페이지
					@param {Number} nStartIndex 첫번째 아이템의 인덱스
					@param {Number} nEndIndex 현재 페이지의 마지막 아이템의 인덱스
					@param {Function} stop 호출 후에 영향 받는것 없다.
					@history 1.1.0 Update CustomEvent 추가
				**/
				this.fireEvent('movePage',{
					nPage : nPage,
					nBeforePage : nBeforePage,
					nStartIndex : 0,
					nEndIndex : htIndex.nEnd
				});
			}
			this.updateInfo();
		}
	},

	_move : function(nPage){
		var n = this._convertToAvailPage(nPage);
		if(n != this._nCurrentPage){
			this._nCurrentPage = n;
		}

	},

	/**
		더보기 영역을 현재 페이지에 맞게 정보들을 설정한다.

		@method updateInfo
		@history 1.4.0 Bug setShowMaxItem(0)으로 설정후 updateInfo메소드 호출시 버그 수정
	**/
	updateInfo : function(){
		var nPage = this.getCurrentPage(),
			htIndex = this.getPageItemIndex(nPage);
		this.hideLoadingImg();
		if(nPage >= this.getTotalPages() ){
			if(this._htWElement.elBase){
				this._htWElement.elBase.addClass('u_pg_end');
			}
			if(this._htWElement.elMoreButton){
				this._htWElement.elMoreButton.hide();
			}
			if(this._htWElement.elLast){
				this._htWElement.elLast.show('block');
			}
		}else{
			if(this._htWElement.elBase){
				this._htWElement.elBase.removeClass('u_pg_end');
			}
			if(this._htWElement.elMoreButton){
				this._htWElement.elMoreButton.show('block');
			}
			if(this._htWElement.elLast){
				this._htWElement.elLast.hide();
			}
		}
		// current 처리
		if(!!this._htWElement.elCurrent && !!htIndex){
			var sText = htIndex.nEnd+1;
			this._htWElement.elCurrent.text(this._setNumberFormat(sText));
		}

		if(typeof this._htWElement.elLastCurrent != 'undefined' && this._htWElement.elLastCurrent && !!htIndex){
			this._htWElement.elLastCurrent.text(this._setNumberFormat(htIndex.nEnd+1));
		}

		// remainder 처리
		if(!!this._htWElement["elRemainder"] && !!htIndex){
			this._htWElement["elRemainder"].text(this._setNumberFormat(parseInt(this.option('nTotalItem'),10) - (htIndex.nEnd+1)));
		}

		if(!!this._htWElement["elLastRemainder"] && !!htIndex){
			this._htWElement["elLastRemainder"].text(this._setNumberFormat(parseInt(this.option('nTotalItem'),10) - (htIndex.nEnd+1)));
		}

		// total 처리
		if(!!this._htWElement.elTotal){
			this._htWElement.elTotal.text(this._setNumberFormat(this.option('nTotalItem')));
		}
		if(typeof this._htWElement.elLastTotal != 'undefined' && this._htWElement.elLastTotal){
			this._htWElement.elLastTotal.text(this._setNumberFormat(this.option('nTotalItem')));
		}

		if(!!this._htWElement.elMoreCnt && !!htIndex){
			var nCnt = Math.min(this.getItemPerPage(), this.getItemCount() - htIndex.nEnd-1);
			this._htWElement.elMoreCnt.text(this._setNumberFormat(nCnt));
		}
	},

	_callAjax : function(nPage, bMore ,bFireEvent){
		var self = this;
		this.oAjax.option('onload', null);

		this.oAjax.option('onload', function(res){
			self._onAjaxResponse(res, nPage, bMore, bFireEvent);
		});
		this.oAjax.request(this._getQueryString(nPage, bMore));
	},

	_onAjaxResponse : function(oResponse, nPage, bMore, bFireEvent){
		if(bFireEvent){
			this._move(nPage);
			var sEvent = bMore? 'more' : 'movePage';

			var htIndex = this.getPageItemIndex(nPage);

			this.fireEvent(sEvent,{
				oResponse : oResponse,
				nPage : nPage,
				nStartIndex : bMore? htIndex.nStart : 0,
				nEndIndex : htIndex.nEnd
			});
		}
		this.updateInfo();
	},

	_getQueryString : function(nPage, bMore){
		if(typeof bMore === 'undefined'){
			bMore = true;
		}
		var htQuery = this.option('htAjax').htQuery || {};

		var htIndex = this.getPageItemIndex(nPage);

		htQuery[this.option('htAjax').sStart] = bMore? htIndex.nStart : 0;
		htQuery[this.option('htAjax').sDisplay] = Math.min(this.getItemPerPage(), (this.getShowMaxItem() - htIndex.nStart));

		return htQuery;

	},

	_setNumberFormat: function(sText) {
		sText = sText.toString();
		var sReturn = "";
		var nDot = 0;
		var nLastPosition = sText.length;
		for (var i = nLastPosition; i >= 0; i--) {
			var sChar = sText.charAt(i);
			if (i > nLastPosition) {
				sReturn = sChar + sReturn;
				continue;
			}
			if (/[0-9]/.test(sChar)) {
				if (nDot >= 3) {
					sReturn = ',' + sReturn;
					nDot = 0;
				}
				nDot++;
				sReturn = sChar + sReturn;
			}
		}
		return sReturn;
	},

	/**
		로딩이미지를 보여준다
		@method showLoadingImg
	**/
	showLoadingImg : function(){
		if(!!this._htWElement.elLoading){
			this._htWElement.elLoading.show();
		}
	},

	/**
		로딩이미지를 감춘다
		@method hideLoadingImg
	**/
	hideLoadingImg : function(){
		if(!!this._htWElement.elLoading){
			this._htWElement.elLoading.hide();
		}
	},

	/**
		1페이지로 더보기를 다시 그린다. 커스텀이벤트는 발생하지 않는다.

		@method reset
		@param {Number} nShowMaxItem 더보기할 아이템의 개수가 바뀌었을 경우 설정해준다.

	**/
	reset : function(nShowMaxItem){
		if (typeof nShowMaxItem == "undefined") {
			nShowMaxItem = this.option('nShowMaxItem');
		}

		this.setShowMaxItem(nShowMaxItem);
		this.movePageTo(1, false);
	},
	/**
		화면에 표기할 총 아이템 개수를 얻는다.
		(moreContentButton에서 표기할 아이템 개수 )

		@method getTotalItem
		@return {Number}

	**/
	getTotalItem : function(){
		return this.option('nTotalItem');
	},

	/**
		화면에 표기할 총 아이템을 n으로 설정한다.
		(moreContentButton에서 표기할 아이템 개수 )

		@method setTotalItem
		@param {Number} n 화면에 표기할 총 아이템 개수

	**/
	setTotalItem : function(n){
		this.option('nTotalItem', n);
	},

	/**
		더보기 할 전체 아이템 개수를 구한다.

		@method getShowMaxItem
		@return {Number} 더보기할 전체 아이템 개수

	**/
	getShowMaxItem : function(){
		return this.option('nShowMaxItem');
	},

	/**
		더보기할 전체 아이템 개수를 n으로 설정한다.

		@method setShowMaxItem
		@param {Number} n 더보기할 전체 아이템 개수
	**/
	setShowMaxItem : function(n){
		this.option('nShowMaxItem', n);
		this.option('nItem', n);
	},

	/**
		jindo.m.MoreContentButton 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		this._attachEvent();
	},

	/**
		jindo.m.MoreContentButton 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEvent();
	},

	/**
		jindo.m.MoreContentButton 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		this._htEvent = {};
		if(!!this._htWElement.elMoreButton){
			this._htEvent["click_More"] = {
				ref : jindo.$Fn(this._onClickMore, this).attach(this._htWElement.elMoreButton, 'click'),
				el : this._htWElement.elMoreButton.$value()
			};
		}
		if(!!this._htWElement.elTop){
			this._htEvent["click_Top"] = {
				ref : jindo.$Fn(this._onClickTop, this).attach(this._htWElement.elTop, 'click'),
				el : this._htWElement.elTop.$value()
			};
		}
	},

	/**
		jindo.m.MoreContentButton 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEvent : function() {
		for(var p in this._htEvent) {
			var htTargetEvent = this._htEvent[p];
			htTargetEvent.ref.detach(htTargetEvent.el, p.substring(0, p.indexOf("_")));
		}

		this._htEvent = null;
	},

	/**
		jindo.$Ajax Header 값을 설정한다.

		@method header
		@see http://jindo.nhncorp.com/docs/jindo/archive/Jindo2-latest/ko/symbols/%24Ajax.html#header 참조
	**/
	header : function(vName, vValue) {
		if(this.oAjax) {
			return this.oAjax.header(vName, vValue);
		}
	},

	/**
		jindo.m.MoreContentButton 에서 사용하는 모든 객체를 release 시킨다.
		@method destroy
	**/
	destroy : function() {
		this._detachEvent();

		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
	}
}).extend(jindo.m.CorePagination);