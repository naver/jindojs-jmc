/**
	엘리먼트가 화면에 보이거나 안 보이는 상황이 되었는지 확인하는 컴포넌트

	@author hooriza
	@version #__VERSION__#

	@class jindo.m.Visible
	@extends jindo.m.Component
	@keyword Visible, 레이어, 감시
	@group Component
	
	@history 1.10.0 Release 최초 릴리즈
**/
jindo.m.Visible = jindo.$Class({

	/**
		컴포넌트 생성자

		@constructor

		@param {String|HTMLElement} [elWrap=document] 확안할 영역 엘리먼트
		@param {Object} [oOptions] 옵션
			@param {String} [oOptions.sClassName="check_visible"] 확안할 엘리먼트가 가진 클래스명
			@param {Number} [oOptions.nExpandSize=0] 지정한 만큼 좀 더 넓은 범위의 영역을 확안 (단위 : px)
	**/
	$init : function(elWrap, htOption) {

		this._elWrap = jindo.$(elWrap) || document;
		this._nTimer = null;
		
		this.option({
			sClassName : "check_visible",
			nExpandSize : 0 // 확장 영역
		});

		this.option(htOption || {});
		this.refresh();
		
	},

	_supportGetElementsByClassName : function() {

		var oConst = this.constructor;

		if (!('__supportGetElementsByClassName' in oConst)) {

			oConst.__supportGetElementsByClassName = (function() {

				var elDummy = document.createElement('div');

				if (!elDummy.getElementsByClassName) {
					return false;
				}

				var aDummies = elDummy.getElementsByClassName('dummy');
				elDummy.innerHTML = '<span class="dummy"></span>';

				return aDummies === 1;

			})();

		}

		return oConst.__supportGetElementsByClassName;

	},

	/**
		영역 안의 확인 목록 새로고침
		@method refresh

		@remark
			본 메서드는 다음과 같은 경우 호출해야 한다.

			- 확인 대상이 영역 안에 추가 된 경우
			- 확인 대상이 영역 안에서 삭제 된 경우
			- 영역 안에 있는 임의의 엘리먼트에 확인 클래스명이 추가 된 경우

			단 getElementsByClassName 을 지원하는 브라우저의 경우 refresh 는 아무 기능도 수행하지 않는다.

		@return {this}
	*/
	refresh : function() {

		if (this._supportGetElementsByClassName()) {
			this._aTargets = this._elWrap.getElementsByClassName(this.option('sClassName'));
			this.refresh = function() {};
		} else {
			this._aTargets = jindo.$$('.' + this.option('sClassName'), this._elWrap);
		}

		return this;

	},

	/**
		영역 안 확인 목록의 노출 여부 변경 확인하기
		@method check

		@param {Number} [nDelay=-1] 일정 시간이 지난뒤에 확인하고자 할 때 사용한다

		@remark
			nDelay 인자는 scroll 이벤트나 resize 이벤트와 같이 짧은 시간에 반복적으로 발생하는
			이벤트의 핸들러 안에서 check 메서드를 호출하는 경우 생길 수 있는 부하를 줄이기 위해 사용 할 수 있다.

		@return {this}
	*/
	check : function(nDelay) {

		var self = this;

		if (typeof nDelay === 'undefined') { nDelay = -1; }

		if (this._nTimer) {
			clearTimeout(this._nTimer);
			this._nTimer = null;
		}

		if (nDelay < 0) {
			this._check();
		} else {
			this._nTimer = setTimeout(function() {
				self._check();
				self._nTimer = null;
			}, nDelay);
		}

		return this;

	},

	_check : function() {

		var _ = new Date();

		var i;

		var oArea = null;
		var elWrap = this._elWrap;

		var aTargets = this._aTargets;
		var nExpandSize = this.option('nExpandSize');

		var oCount = { 'true' : 0, 'false' : 0 };

		if (elWrap === document) {

			var wdDoc = jindo.$Document(document);
			// var oScrollPosition = wdDoc.scrollPosition();
			var oClientSize = wdDoc.clientSize();

			oArea = {
				top : 0, // oScrollPosition.top,
				left : 0, // oScrollPosition.left,
				bottom : oClientSize.height,
				right : oClientSize.width
			};

		} else {
			oArea = elWrap.getBoundingClientRect();
			oArea = { top : oArea.top, left : oArea.left, bottom : oArea.bottom, right : oArea.right };
		}

		oArea.top -= nExpandSize;
		oArea.left -= nExpandSize;
		oArea.bottom += nExpandSize;
		oArea.right += nExpandSize;

		var aFireList = [];

		for (i = aTargets.length - 1; i >= 0; i--) {

			var elTarget = aTargets[i];
			var oTargetArea = elTarget.getBoundingClientRect(); //getClientRects()[0];

			if (!this._bSupportQSA && !jindo.$Element(elTarget).hasClass(this.option('sClassName'))) {
				delete elTarget.__VISIBLE;
				aTargets.splice(i, 1);
				continue;
			}

			var bBefore = !!elTarget.__VISIBLE;
            var bAfter = !(
                oTargetArea.bottom < oArea.top || oArea.bottom < oTargetArea.top ||
                oTargetArea.right < oArea.left || oArea.right < oTargetArea.left
            );

			elTarget.__VISIBLE = bAfter;

			if (bBefore !== bAfter) {
				aFireList.push([ bAfter, elTarget ]);
				oCount[!bAfter]++;
			} else {
				oCount[bAfter]++;
			}
			
		}

		for (i = aFireList.length - 1; i >= 0; i--) {
			var oFireItem = aFireList[i];

			oCount[!oFireItem[0]]--;
			oCount[oFireItem[0]]++;

			/**
				확인 엘리먼트가 보여지게 되었을 때 발생
				@event visible

				@param {Element} elTarget 보여지게 된 엘리먼트
				@param {Function} nVisible 현재 보이는 엘리먼트 갯수
				@param {Function} nInvisible 현재 안 보이는 엘리먼트 갯수
			**/
			/**
				확인 엘리먼트가 안 보여지게 되었을 때 발생
				@event invisible

				@param {Element} elTarget 안 보여지게 된 엘리먼트
				@param {Function} nVisible 현재 보이는 엘리먼트 갯수
				@param {Function} nInvisible 현재 안 보이는 엘리먼트 갯수
			**/
			this.fireEvent(oFireItem[0] ? 'visible' : 'invisible', {
				'elTarget' : oFireItem[1],
				'nVisible' : oCount['true'],
				'nInvisible' : oCount['false']
			});
		}

		// var elCost = jindo.$('cost');
		// elCost && (elCost.innerHTML = aTargets.length + 'pcs : ' + (new Date() - _) + 'ms');

	}

}).extend(jindo.m.Component);
