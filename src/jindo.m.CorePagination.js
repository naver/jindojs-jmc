/**
	@fileOverview 페이징 코어 컴포넌트
	@author "oyang2"
	@version #__VERSION__#
	@since 2011. 7. 20.
**/
/**
	페이징 코어 컴포넌트

	@class jindo.m.CorePagination
	@extends jindo.m.UIComponent
	@keyword corepagination,페이징 코어, 목록
	@group Component

	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 1.0.0 - -
	@history 0.9.5 - -
	@history 0.9.0 Release 최초 릴리즈
	@invisible
**/
jindo.m.CorePagination = jindo.$Class({
	/**
		현재 페이지
	**/
	_nCurrentPage : 1,
	/* @lends jindo.m.CorePagination.prototype */
	/**
		초기화 함수

		@ignore
		@constructor
		@param {Object} [htOption] 초기화 옵션 객체
			@param {Number} [htOption.nItem=10] 전체 아이템 개수
			@param {Number} [htOption.nItemPerPage=10] 한페이지당 보여줄 아이템의 개수
			@param {Number} [htOption.nPage=1] 현재페이지
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate() 수행여부
	**/
	$init : function(htOption) {
		this.option({
			nItem : 10,
			nItemPerPage : 10,
			nPage : 1,
			bActivateOnload : true
		});
		this.option(htOption || {});
		this._nCurrentPage = this.option('nPage');
	},

	/**
		전체 아이템 개수를 리턴한다.
		@method getItemCount
		@return {Number} 전체 아이템 개수
	**/
	getItemCount : function(){
		return this.option('nItem');
	},

	/**
		한페이지당 보여줄 아이템의 개수를 리턴한다.
		@method getItemPerPage
		@return {Number} 한페이지당 보여줄 아이템의 개수
	**/
	getItemPerPage : function(){
		return this.option('nItemPerPage');
	},


	/**
		현재 페이지를 리턴한다.
		@method getCurrentPage
		@return {Number} 현재 페이지
	**/
	getCurrentPage : function(){
		return this._nCurrentPage;
	},

	/**
		전체 아이템 개수를 설정한다.
		@method setItemCount
		@param {Number} n 아이템 개수
	**/
	setItemCount : function(n){
		this.option('nItem', n);
	},

	/**
		한페이지당 아이템 개수를 설정한다
		@method setItemPerPage
		@param {Number} n 한 페이지당 아이템 개수
	**/
	setItemPerPage : function(n){
		this.option('nItemPerPage',n);
	},

	/**
		n 페이지로 이동한다.
		@param {Number} n
	**/
	movePageTo : function(n){
		var nBefore = this._nCurrentPage;

		var nPage = this._convertToAvailPage(n);
		if(nPage != this._nCurrentPage){
			this._nCurrentPage = nPage;
		}
	},

	/**
		현재 페이지의 다음 페이지로 이동한다.
		@method nextPageTo
	**/
	nextPageTo : function(){
		var nPage = this._nCurrentPage +1;
		this.movePageTo(nPage);
	},

	/**
		현재 페이지의 다음 페이지로 이동한다.
		@method previousPageTo
	**/
	previousPageTo : function(){
		var nPage = this._nCurrentPage-1;
		this.movePageTo(nPage);
	},

	/**
		다음 페이지가 있는지 리턴한다.
		@method hasNextPage
		@return {Boolean} 다음 페이지 존재 여부
	**/
	hasNextPage : function(){
		var nPage =this.getCurrentPage(),
			totalPage = this.getTotalPages();

		return nPage&& (nPage < totalPage);
	},

	/**
		이전 페이지가 있는지 리턴한다.
		@method hasPreviousPage
		@return {Boolean} 이전 페이지 존재 여부
	**/
	hasPreviousPage : function(){
		return (this.getCurrentPage() > 1);
	},

	/**
		전체 페이지 수를 리턴한다.
		@method getTotalPages
		@return {Number} 전체 페이지 수
	**/
	getTotalPages : function(){
		var nTotal = this.option('nItem'),
			nCount = this.option('nItemPerPage');

		if(!nCount){
			return null;
		}

		return Math.ceil(nTotal/nCount);
	},

	/**
		n 페이지의 아이템들의 start, end 인덱스를 리턴한다.
		@method getPageItemIndex
		@param {Number} n 페이지 index 값
		@return {Object} n 페이지의 start, end 인덱스 정보
		    @return {Number} ."nStart" 입력받은 페이지의 아이템 시작 인덱스
		    @return {Number} ."nEnd" 입력받은 페이지의 아이템 끝 인덱스
		@example
			var htIndex = oCorePagination.getPageIntemIndex(2);
			htIndex.nStart //2페이지의 아이템의 시작 인덱스
			htIndex.nEnd //2페이지의 아이템의 끝 인덱스
	**/
	getPageItemIndex : function(nPage){
		nPage = this._convertToAvailPage(nPage);

		var nTotal = this.option('nItem'),
			nCount = this.option('nItemPerPage'),
			start, end;

		if(!nPage || !nCount){
			return null;
		}

		start = (nPage-1) * nCount;
		end = Math.min(start+ nCount, nTotal)-1;

		return {
			nStart :  start,
			nEnd : end
		};
	},

	/**
		n번째 아이템이 몇번째 페이지인지 구한다.
		@method getPageOfItem
		@param {Number} n n번째 아이템의 페이지 정보
		@return {Number} 페이지 정보
	**/
	getPageOfItem : function(n){
		return Math.ceil(n / this.getItemPerPage());
	},

	_convertToAvailPage : function(nPage){
		var nLastPage = this.getTotalPages();

		nPage = Math.max(nPage, 1);
		nPage = Math.min(nPage, nLastPage);

		return nPage;
	}
}).extend(jindo.m.UIComponent);