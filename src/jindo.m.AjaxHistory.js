/**
	@fileOverview 페이지 이동 없이 동적으로 화면 UI를 구성할 경우 페이지 이동을 인식시켜서 앞으로/뒤로가기 버튼을 사용할 수 있는 컴포넌트
	@author "oyang2"
	@version #__VERSION__#
	@since 2011. 9. 20.
**/
/**
	페이지 이동 없이 동적으로 화면 UI를 구성할 경우 페이지 이동을 인식시켜서 앞으로/뒤로가기 버튼을 사용할 수 있는 컴포넌트

	@class jindo.m.AjaxHistory
	@extends jindo.m.Component
	@keyword ajax, history, 히스토리, hash, 해쉬, 해시, pushState
	@group Component

	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Support Android 3.0/4.0 지원 갤럭시<br />jindo 2.0.0 mobile 버전 지원
	@history 1.1.0 Update [bUseHash] Option 추가
	@history 0.9.0 Release 최초 릴리즈
**/
jindo.m.AjaxHistory = jindo.$Class({
	/* @lends jindo.m.AjaxHistory.prototype */
	/**
		hashchange 이벤트 사용여부
		@type {Boolean}
	**/
	bHashEvent : false,
	/**
		pushState 이벤트 사용여부
		@type {Boolean}
	**/
	bPushState : false,
	/**
		setInterval()의 리턴 값
		@type {Number}
	**/
	_nIntervalId : 0,
	/**
		히스토리 데이터 저장 객체
		@type {Object}
	**/
	_htLastState : {},

	/**
		초기화 함수

		@constructor
		@param {Object} [htOption] 추가 옵션 (생략가능)
			@param {Number} [htOption.nCheckInterval=100] 'onhashchange','popstate' 이벤트가 발생하지 않는 브라우저에서 location.hash의 변경을 체크할 주기
			@param {Boolean} [htOption.bUseHash=false] 'pushState', 'replaceState' 지원하는 브라우저에서도 무조건 해시값 변경을 통해 ajaxhistory를 사용하고 싶을 경우 true로 설정한다.
		@example
			var oAjaxHistoryInstance;

			oAjaxHistoryInstance = new jindo.m.AjaxHistory({	 *
			nCheckInterval : 100, // setInterval()을 이용하여 로케이션 변경을 체크 시, 체크 주기
			bUseHash :  false //무조건 해시값을 사용할지 여부
			}).attach({
					//초기 load 이벤트에는 addHistory의 두번째 인자로 true값을 설정함
					'load' : function(){
						oAjaxHistoryInstance.addHistory({
							"sPageNumber" : "1",
							"aParameter" : [1,2,3]
						}, true);
					},
					'change' : function(oCustomEvt){
						oAjaxHistoryInstance.addHistory({
							"sPageNumber" : "2",
							"aParameter" : [4,5,6]
						});
					}
			});
			oAjaxHistoryInstance.initialize(); //초기화
	**/

	$init : function(htOption) {
		this.option({
			nCheckInterval : 100,
			bUseHash : false //
		});
		this.option(htOption || {});
	},

	/**
		컴포넌트 초기화 후에, 로케이션 변경 체크 및 초기 이벤트 발생을 위한 초기화 함수

		@method initialize
		@return {this}
	**/
	initialize : function(){
		this._initVar();
		this._attachEvent();
		var sHash = this._getHash();

		if(sHash){
			this._htLastState = this._getDecodedData(sHash);
			/**
				사용자가 앞으로/뒤로가기 버튼을 눌러 이동을 하거나 히스토리 데이터가 포함된 URL을 이용하여 접근시 발생한다.

				@event change
				@param {String} sType 커스텀이벤트명
				@param bLoad (Boolean) : 초기 로드된 페이지에 해시 정보가 있을 경우 true
					@history 1.4.0 Update change 커스텀 이벤트에 bLoad 속성 추가
				@param htHistoryData (HashTable) : 현재 페이지의 히스토리 데이터
				@example
					oAjaxHistoryInstance.attach("change", function(oCustomEvent){
						//htHistoryData의 데이터를 바탕으로 화면 UI를 재구성한다
						showPage(oCustomEvent.htHistoryData.nPage);
					});
			*/
			this.fireEvent("change", {
				bLoad: true,
				htHistoryData : this._htLastState
			});
		}else{
			/**
				페이지가 처음 로딩시에 발생되는 이벤트
				@remark 페이지 처음 로딩시에 location.hash 값에 다른 히스토리데이터가 있을 경우 load 대신에 change 이벤트가 발생한다.

				@event load
				@param {String} sType 커스텀이벤트명
				@example
					oAjaxHistoryInstance.attach("load", function(oCustomEvent){
						 //초기 로딩시에 초기 UI구성을 위한 작업을 수행.
					});
			*/
			this.fireEvent('load');
		}

		return this;
	},

	/**
		jindo.m.AjaxHistory 에서 사용하는 모든 인스턴스 변수를 초기화한다.

		@method _initVar
		@private
	**/
	_initVar: function() {
		var htInfo = jindo.m.getDeviceInfo();

		this.bHashEvent = 'onhashchange' in window;
		/*ios4.2 버전에서 pusthState, replaceState는 지원이 되지만 버그가 있기 때문에 사용하지 않는다 */
		this.bPushState = (typeof window.history !== 'undefined')&& (typeof window.history.pushState !== 'undefined') && (typeof window.history.replaceState !== 'undefined') && !((htInfo.iphone || htInfo.ipad)&& (parseFloat(htInfo.version,10) < 4.3));

		this._nIntervalId = 0;
		this._oAgent = jindo.$Agent().navigator();

		this._bAndroid =  htInfo.android;

		if(this.option('bUseHash')){
			this.bPushState = false;
		}
	},

	/**
		jindo.m.AjaxHistory 에서 사용하는 모든 이벤트를 바인드한다.

		@method _attachEvent
		@private
	**/
	_attachEvent : function() {
		this._htEvent = {};

		if(this.bPushState){
			this._htEvent['popstate'] ={
				ref : jindo.$Fn(this._onPopState, this).attach(window,'popstate'),
				el : window
			};
		}else if(this.bHashEvent){
			//hashchange event supports
			this._htEvent["hashchange"] = {
				ref : jindo.$Fn(this._onHashChange, this).attach(window, "hashchange"),
				el	: window
			};
		}else{
			//ios3.x bug fix
			clearInterval(this._nIntervalId);
			this._nIntervalId = setInterval(jindo.$Fn(this._onHashChange, this).bind(), this.option("nCheckInterval"));
		}
	},

	/**
		@method _onPopState
		@private
	**/
	_onPopState : function(event){
		var state = event.$value().state;
		if(state){
			var htData = this._cloneObject(state);

			if(!this._compareData(htData, this._htLastState)){
				this._htLastState = htData;
				this._onChange();
			}
		}
	},
	/**
		@method _onHashChange
		@private
	**/
	_onHashChange : function(){
		var htData = this._getDecodedData(this._getHash());
		if(!this._compareData(htData, this._htLastState)){
			this._htLastState = htData;
			this._onChange();
		}
	},
	/**
		@method _onChange
		@private
	**/
	_onChange : function(){
		// change 이벤트 발생
		this.fireEvent("change", {
			bLoad: false,
			htHistoryData : this._htLastState
		});
	},

	/**
		htData 브라우저의 히스토리에 추가

		@method addHistory
		@param {Object} htData 추가할 히스토리 데이터 객체
		@param {Boolean} bLoad 초기 load 인지 여부
	**/
	addHistory : function(htData, bLoad){
		if(typeof bLoad === 'undefined'){
			bLoad = false;
		}
		if(htData && typeof(htData) == "object" && jindo.$H(htData).length() > 0){
			var sNewHash = this._cloneObject(htData);
			//2012-04-01 이전hash값과 똑같은 값이 들어올 경우 처리하지 않는다.
			if(this._compareData(sNewHash, this._htLastState)){
				return;
			}
			this._htLastState = sNewHash;

			var sHash = this._getEncodedData(this._htLastState);
			if(this.bPushState){
				if(bLoad){
					this._replaceState(this._htLastState);
				}else{
					this._pushState(this._htLastState);
				}
			}else{
				var self = this;
				if(this._bAndroid ){
					setTimeout(function(){
						self._setHash(sHash);
					},0);
				}else{
					this._setHash(sHash);
				}
			}
		}
	},
	/**
		@method _replaceState
		@private
	**/
	_replaceState : function(htData){
		history.replaceState( htData, document.title, location.href );
	},
	/**
		@method _pushState
		@private
	**/
	_pushState : function(htData){
		history.pushState(htData, document.title, location.href);
	},

	/**
		@method _setHash
		@private
	**/
	_setHash : function(sHash){
		location.hash = sHash;
	},

	/**
		두 데이터 객체를 비교하여 결과를 리턴
		- 하위 데이터가 Object나 Array일 경우, 재귀적으로 비교

		@param {Object} htBase 비교 기준 객체
		@param {Object} htComparison 비교 객체
		@param {Boolean} 비교 결과
	**/

	/**
		@method _compareData
		@private
	**/
	_compareData : function(htBase, htComparison){
		if(htBase && htComparison){
			if(jindo.$H(htBase).length() == jindo.$H(htComparison).length()){
				for(var x in htBase){
					if(typeof(htBase[x]) == "object"){
						if(!arguments.callee(htBase[x], htComparison[x])){
							return false;
						}
					}else{
						if(htBase[x] != htComparison[x]){
							return false;
						}
					}
				}

				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
	},

	/**
		htHistoryData 객체를 Json 문자열로 변환 후, 인코딩하여 리턴
		- JSON.stringify() 함수를 브라우저에서 지원할 경우, 해당 함수 사용
		- 위의 함수를 지원하지 않을 경우, jindo.$Json().toString() 함수 사용

		@param {Object} htHistoryData 히스토리 데이터 객체
		@return {String} Json 문자열로 변환 후, 인코딩한 문자열
	**/

	/**
		@method _getEncodedData
		@private
	**/
	_getEncodedData : function(htHistoryData){
		if(htHistoryData){
			// JSON.stringify() 함수를 지원하는 경우
			if(typeof(JSON) == "object" && typeof(JSON.stringify) == "function"){
				return encodeURIComponent(JSON.stringify(htHistoryData));
			}else{
				return encodeURIComponent(jindo.$Json(htHistoryData).toString());
			}
		}else{
			return "";
		}
	},

	/**
		인코딩된 히스토리 데이터를 HashTable 객체로 변환 후, 리턴
		- JSON.parse() 함수를 브라우저에서 지원할 경우, 해당 함수 사용
		- 위의 함수를 지원하지 않을 경우, jindo.$Json().toObject() 함수 사용

		@param {String} sEncodedHash 인코딩된 히스토리 데이터
		@return {Object} 디코딩 후, HashTable로 변환한 객체
	**/
	_getDecodedData : function(sEncodedHash){
		try {
			if(sEncodedHash){
				var sHashString = decodeURIComponent(sEncodedHash);
				// JSON.parse() 함수를 지원하는 경우
				if(typeof(JSON) == "object" && typeof(JSON.parse) == "function"){
					return JSON.parse(sHashString);
				}else{
					return jindo.$Json(sHashString).toObject();
				}
			}
		} catch (e) {}
		return {};
	},

	/**
		@method _cloneObject
		@private
	**/
	_cloneObject : function(htObj){
		var hash, newHash;

		if(htObj){
			hash = jindo.$Json(htObj).toString();
			newHash = jindo.$Json(hash).toObject();
		}else{
			newHash = {};
		}

		return newHash;
	},
	/**
		encode여부를 확인한다.
        @method _isEncoded
        @private
		@return {Boolean} 인코딩 여부
	**/
	_isEncoded : function(str){
		return decodeURIComponent(str) !== str;
	},
	/**
		현재 설정되어 있는 Hash String을 리턴
        @method _getLocationHash
        @private
		@return {String} 현재 설정된 Hash String
	**/
	_getHash : function(){
		var hash = location.hash.substring(1);
		return this._isEncoded(hash) ? (hash||"%7B%7D") : encodeURIComponent(hash);
	},


	/**
		jindo.m.AjaxHistory 에서 사용하는 모든 이벤트를 해제한다.

		@method _detachEvent
		@private
	**/
	_detachEvent : function() {
		for(var p in this._htEvent) {
			var htTargetEvent = this._htEvent[p];
			htTargetEvent.ref.detach(htTargetEvent.el, p);
		}

		this._htEvent = null;
	},


	/**
		jindo.m.AjaxHistory 에서 사용하는 모든 객체를 release 시킨다.

		@method destroy
	**/
	destroy: function() {
		this._detachEvent();

		clearInterval(this._nIntervalId);
		this._nIntervalId = null;
	}
}).extend(jindo.m.Component);