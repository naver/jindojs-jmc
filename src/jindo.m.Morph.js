/*jshint eqeqeq: false, white : false, sub: true, undef: true, evil : true, browser: true, -W099 : true, -W014 : true, -W041 : true, -W083 : true, -W027 : true */

/**
    순차적으로 이루어지는 애니메이션 컴포넌트

    @author hooriza
    @version #__VERSION__#

    @class jindo.m.Morph
    @extends jindo.m.Component
    @uses jindo.m.Effect
    @keyword 애니메이션, animation, transition
    @group Component

    @history 1.15.0 Update transform 스타일에서 matrix, matrix3d 속성에 대해서도 애니메이션이 가능하도록 개선
    @history 1.15.0 Bug 시작값과 종료값이 동일 할 때도 애니메이션이 진행되는 문제 수정
    @history 1.14.0 Update Keyframe 객체를 재생목록에 넣을 수 있는 pushKeyframe 메서드 추가
	@history 1.14.0 Update Keyframe 객체를 재생목록에 넣을 수 있는 pushKeyframe 메서드 추가
	@history 1.13.0 Bug 애니메이션이 진행되고 있는 도중에 pause 하고 clear 호출 후, 다시 play 할 경우 오류 수정
    @history 1.10.0 Bug bUseTranstion = true일 경우, pause 메소드 버그 수정
    @history 1.10.0 Bug bUseTranstion = true일 경우, 시작점이 반영되지 않는 버그 수정
    @history 1.10.0 Bug bUseTranstion = true일 경우, display = none인 엘리먼트를 css transition으로 변환할때 다음 애니메이션이 진행되지 않는 버그 수정

    @history 1.9.0 release 최초 릴리즈
**/
jindo.m.Morph = jindo.$Class({

	/**
		컴포넌트 생성
		@constructor

		@param {Hash} [oOptions] 옵션
			@param {Function} [oOptions.fEffect=jindo.m.Effect.linear] 애니메이션에 사용되는 jindo.m.Effect 의 함수들
			@param {Boolean} [oOptions.bUseTransition=true] CSS Transition 를 사용할지 여부, 사용할꺼면 true, 아니면 false
	**/
	$init : function(oOptions) {

		this.option({
			'fEffect' : jindo.m.Effect.linear,
			'bUseTransition' : true
		}).option(oOptions);

		var oStyle = document.body.style;

		// transition CSS 지원하는 환경인지?
		this._bTransitionSupport = (
			'transition' in oStyle ||
			'webkitTransition' in oStyle ||
			'MozTransition' in oStyle ||
			'OTransition' in oStyle ||
			'msTransition' in oStyle
		);

		var oAgent = jindo.$Agent();
		var oOS = oAgent.os();
		var oNavigator = oAgent.navigator();

		this._bHasTransformRenderBug = oOS.ios && parseInt(oOS.version, 10) === 5 && oNavigator.msafari;

		this._aQueue = []; // 큐
		this._aIngItem = null; // 현재 진행되고 있는 항목

		this._oRAF = null;
		this._bPlaying = null; // 플레이 중인지
		this._nPtr = 0; // 현재 포인터
		this._nPausePassed = 0; // 일시정지시 어느 시점에서 일시정지 되었는지
		this._aRepeat = []; // 반복 구현을 위한 스택

		this._sTransitionEnd = ( // transitionEnd 이벤트 이름 설정
			('webkitTransition' in oStyle && 'webkitTransitionEnd') ||
			('transition' in oStyle && 'transitionend') ||
			('MozTransition' in oStyle && 'transitionend') ||
			('OTransition' in oStyle && 'oTransitionEnd') ||
			('msTransition' in oStyle && 'MSTransitionEnd')
		);

	},

	///////////////////////////////////////////////////////////////////////////////////////////////////
	/// PUSH 메서드군
	///////////////////////////////////////////////////////////////////////////////////////////////////

	/**
		애니메이션 동작을 재생목록에 넣음
		
		@method pushAnimate
		
		@param {Number} nDuration 변경 할일을 몇 ms 동안 진행되게 할지
		@param {Array} aLists 애니메이션을 진행 할 객체와 속성 목록
			@param {Object} aLists.0 어떤 객체에 대해서 진행 할지
			@param {Hash} aLists.1 어떤 속성들을 변경 할지
			@param {Object} [aLists.2] 어떤 객체에 대해서 진행 할지 (2)
			@param {Hash} [aLists.3] 어떤 속성들을 변경 할지 (2)
			@param {Object} [aLists.4] 어떤 객체에 대해서 진행 할지 (3)
			@param {Hash} [aLists.5] 어떤 속성들을 변경 할지 (3)
			...
		
		@return {this}
		
		@example
			oMorph.pushAnimate(3000, [
				elFoo, {
					'@left' : '300px',
					'scrollTop' : 100
				},
				elBar, {
					'scrollLeft' : 500,
					'@backgroundColor' : '#f00'
				}
			]).play();
	**/
	pushAnimate : function(nDuration, aLists) {

		if (aLists && !(aLists instanceof Array)) { throw Error('aLists should be a instance of Array'); }

		aLists = [].concat(aLists);
		aLists.duration = nDuration;

		this._aQueue.push(aLists);

		return this;

	},

	/**
		Keyframe 객체를 재생목록에 넣음

		@method pushKeyframe

		@param {Number} nDuration 변경 할일을 몇 ms 동안 진행되게 할지
		@param {jindo.m.Keyframe} oKeyframe Keyframe 객체

		@return {this}
	**/
	pushKeyframe : function(nDuration, oKeyframe) {
		this._aQueue.push({ action : 'keyframe', args : { duration : nDuration, keyframe : oKeyframe } });
		return this;
	},

	/**
		일정시간 또는 다른 jindo.m.Morph 의 애니메이션이 끝나기를 기다림
		
		@method pushWait
		@param {Number|jindo.m.Morph} vItem 기다리게 할 ms 단위의 시간 또는 다른 애니메이션 객체
		@param {Number|jindo.m.Morph} [vItem2] 기다리게 할 ms 단위의 시간 또는 다른 애니메이션 객체 (2)
		@param {Number|jindo.m.Morph} [vItem3] 기다리게 할 ms 단위의 시간 또는 다른 애니메이션 객체 (3)
		...
		
		@example
			oMorph
			.pushWait(3000) // 3초 기다리기
			.pushWait(oOtherMorph); // 다른 morph 객체가 끝날때까지 기다리기

		@return {this}
	**/
	pushWait : function(nDuration) {

		var oMorph;

		// 인자를 여러개 지정 할 수 있음
		for (var i = 0, nLen = arguments.length; i < nLen; i++) {

			var vItem = arguments[i];

			if (vItem instanceof this.constructor) { // Morph 객체가 들어왔으면
				this._aQueue.push(vItem);
			} else { // 숫자가 들어왔으면
				this.pushAnimate(vItem, []);
			}

		}

		return this;

	},

	/**
		실행 할 함수를 재생목록에 넣음
		
		@method pushCall
		@param {Function} fpCallback 순서가 되었을 때 실행 할 함수
		
		@return {this}
		
		@example
			oMorph.pushCall(function() {
				alert('애니메이션이 시작될꺼임');
			}).pushAnimate(3000,
				elFoo, {
					'@left' : '300px',
					'scrollTop' : 100
				}
			).pushCall(function() {
				alert('애니메이션이 끝났음');
			}).play();
	**/
	pushCall : function(fpCallback) {
		this._aQueue.push(fpCallback);
		return this;
	},

	/**
		반복 구역 시작 지점을 재생목록에 넣음
		
		@method pushRepeatStart
		@param {Number} [nTimes=1] 몇 번 반복할껀지 (무한반복할꺼면 Infinity 를 지정)
		@return {this}
	**/
	pushRepeatStart : function(nTimes) {

		if (typeof nTimes === 'undefined') { nTimes = 1; }

		var sLabel = 'L' + Math.round(new Date().getTime() * Math.random());
		this._aRepeat.push(sLabel);

		this._pushLabel(sLabel, nTimes);
		return this;

	},

	/**
		goto 명령으로 이동하는데 사용되는 라벨을 재생목록에 넣음
		
		@ignore
		@method _pushLabel
		@param {String} sLabel 라벨명
		@return {this}
	**/
	_pushLabel : function(sLabel, nTimes) {

		if (typeof nTimes === 'undefined') { nTimes = Infinity; }
		this._aQueue.push({ action : 'label', args : { label : sLabel, times : nTimes, loops : 0 } });

		return this;

	},

	/**
		반복 구역 종료 지점을 재생목록에 넣음
		
		@method pushRepeatEnd
		@return {this}
	**/
	pushRepeatEnd : function() {

		var self = this;
		var sLabel = this._aRepeat.pop();

		this._aQueue.push({ action : 'goto', args : { label : sLabel } });

		return this;

	},

	///////////////////////////////////////////////////////////////////////////////////////////////////
	/// flow 동작 구현
	///////////////////////////////////////////////////////////////////////////////////////////////////

	// Morph 객체가 끝나기를 기다리기
	_waitMorph : function(oMorph) {

		var self = this;

		// 이미 Morph 가 재생중이 아니면 그만둠
		if (!oMorph.isPlaying()) {
			return true;
		}

		var fHandler = function() {
			// 핸들러를 해제하고
			oMorph.detach('end', fHandler).detach('pause', fHandler);
			// 다음 큐의 항목을 처리
			self._flushQueue();
		};

		// 지정한 Morph 객체가 끝나거나 일시정지되면
		oMorph.attach('end', fHandler).attach('pause', fHandler);

		return false;

	},

	// 라벨 이름에 맞는 인덱스 얻기
	_getLabelIndex : function(sLabel) {

		var aItem = null;

		for (var i = 0, nLen = this._aQueue.length; i < nLen; i++) {
			aItem = this._aQueue[i];
			if (aItem.action === 'label' && aItem.args.label === sLabel) { return i; }
		}

		return -1;

	},

	// 반복문의 끝부분 인덱스 얻기
	_getRepeatEndIndex : function(sLabel, nFrom) {

		var aItem = null;

		for (var i = nFrom || 0, nLen = this._aQueue.length; i < nLen; i++) {
			aItem = this._aQueue[i];
			if (aItem.action === 'goto' && aItem.args.label === sLabel) { return i; }
		}

		return -1;

	},

	// 다음 큐의 항목을 처리
	_flushQueue : function() {

		var bSync, aItem;
		var self = this;

		var oKeyframe, nPausePassed, aCompiledItem;

		do {

			// 비동기적으로 처리하는 상황이라고 일단 설정
			bSync = false;

			// 현재 큐의 항목 얻음
			aItem = this._aIngItem = this._aQueue[this._nPtr];

			// 큐에 아무것도 없으면 더이상 재생할게 없으므로 그만둠
			if (!aItem) {

				this._bPlaying = false;

				/**
					애니메이션이 종료 되었을 때(더이상 진행할 내용이 없을때) 발생
					@event end
				**/
				if (!aItem) {
					this.fireEvent('end');
				}

				return;
			}

			// 포인터를 다음으로 이동
			this._nPtr++;

			if (aItem instanceof Function) { // 함수를 실행해야 하는 상황 (pushCall)
				aItem.call(this);
				bSync = true;
				continue;
			} else if (aItem instanceof this.constructor) { // Morph 을 기다려야 하는 상황 (pushWait(oMorph))
				bSync = this._waitMorph(aItem);
				continue;
			} else if (typeof aItem === 'number') { // 일정시간 멈춰야 하는 상황 (pushWait(300))
				setTimeout(function() { self._flushQueue(); }, aItem);
				continue;
			} else if (aItem.action === 'label') { // 라벨 (pushRepeatStart)

				if (++aItem.args.loops > aItem.args.times) { // times 를 넘겨 실행되었으면

					var nIndex = this._getRepeatEndIndex(aItem.args.label, this._nPtr);
					aItem.args.loops = 0;

					// 반복문이 종료되는 시점으로 이동
					if (nIndex > -1) { this._goto(nIndex + 1); }

				}

				bSync = true;
				continue;
			} else if (aItem.action === 'goto') { // 특정 라벨로 이동 (pushRepeatEnd)
				this._goto(aItem.args.label);
				bSync = true;
				continue;
			} else if (aItem.action === 'keyframe') { // Keyframe 객체 실행 (pushKeyframe)

				oKeyframe = aItem.args.keyframe;
				nPausePassed = this._nPausePassed;
				aCompiledItem = this._aCompiledItem = aItem.args;

				bSync = aCompiledItem.duration < 0;

				if (bSync) {
					this._processKeyframe(1.0, oKeyframe);
					continue;
				}

				this._playKeyframe(nPausePassed, oKeyframe);
				this._nPausePassed = 0;
				continue;
			}

			// 애니메이션 진행 (pushAnimate)

			aCompiledItem = this._aCompiledItem;
			nPausePassed = this._nPausePassed;

			if (!nPausePassed) { // 중간에 일시정지 된 상태가 아니면
				aCompiledItem = this._aCompiledItem = this._compileItem(aItem); // 컴파일
			} else { // 중간에 일시정지 된 상태면
				// 나머지는 전부 다 RAF 로 돌리도록 강제 변경
				for (var i = 0, nLen = aCompiledItem.length; i < nLen; i++) {
					aCompiledItem[i].sTimingFunc = '';
				}
				aCompiledItem.allCSS = false;
			}

			if (aCompiledItem.length === 0) { // 애니메이션 진행 할 게 없으면 그냥 setTimeout
				setTimeout(function() { self._flushQueue(); }, aCompiledItem.duration);
				continue;
			}

			// console.log('_flushQueue', aCompiledItem);

			bSync = aCompiledItem.duration < 0;

			if (bSync) {
				this._processItem(1.0, true); // 마지막 상태로 바로 셋팅
				continue;
			}

			this._playAnimate(nPausePassed);
			this._nPausePassed = 0;

		} while(bSync); // 동기적으로 처리하는 상황이면 다음 큐 항목 계속해서 처리

	},

	///////////////////////////////////////////////////////////////////////////////////////////////////
	/// 애니메이션 동작 구현
	///////////////////////////////////////////////////////////////////////////////////////////////////

	// Keyframe 객체 애니메이션 구현
	_playKeyframe : function(nPausePassed, oKeyframe) {

		var self = this;
		this._nStart = new Date().getTime() - nPausePassed;

		var aCompiledItem = this._aCompiledItem;
		var nDuration = aCompiledItem.duration;

		(function loop() {

			self._oRAF = self._requestAnimationFrame(function() {

				var nStart = self._nStart;

				if (self._oRAF === null) { return; }
				self._oRAF = null;

				var nPer = Math.min(1, Math.max(0, (new Date().getTime() - nStart) / nDuration));
				oKeyframe.frame(nPer);

				if (nPer < 1) {
					loop();
				} else {
					self.fireEvent('timerEnd');
					self._flushQueue();
				}

			});

		})();

	},

	_processKeyframe : function(nRate, oKeyframe) {
		oKeyframe.preprocess().frame(nRate);
	},

	// 애니메이션 수행
	_playAnimate : function(nPausePassed) {

		var self = this;

		this._nStart = new Date().getTime() - nPausePassed; // 시작시간
		this._nIng = 2; // CSS 와 RAF 두 종류를 사용해서 애니메이션 해야함

		// 처음부터 진행하는거면 처음 상태로 셋팅
		if (!nPausePassed) {
			this._processItem(0.0, true, 3/*ALL*/, true);
		}

		var aCompiledItem = this._aCompiledItem;
		// console.log(aCompiledItem);

		if (aCompiledItem.allCSS) { // 전부다 CSS 로 돌려야 하는 상황이면
			this._nIng--; // RAF 는 돌릴 필요 없으니까 nIng 하나 감소
		} else { // 일부는 RAF 로 돌려야 하는 상황이면
			this._animationLoop(true); // RAF 돌리기
		}

		// CSS 로 돌리기
		(function() {

			// CSS 를 적용해야 하는 것 적용

			// CSS 애니메이션을 진행
			// aTransitionCache 에는 Transition CSS 가 지정된 객체들의 배열이 반환됨
			var aTransitionCache = self._processItem(1.0, true, 1/*CSS*/).transitionCache;

			if (!aTransitionCache || aCompiledItem.duration === 0) {
				if (--self._nIng === 0) {
					self._flushQueue();
				}
				return;
			}

			var nLen = aTransitionCache.length;
			var welObj = nLen ? aTransitionCache[0] : null;

			// 현재 항목의 애니메이션이 모두 끝났을 때 호출됨 (일시정지 하면서 끝난 경우 bPause 는 true)
			var fpNext = function(bPause) {

				var oItem;
				var aShouldReset = [];

				while (oItem = aTransitionCache.pop()) {

					// 완전한 중단을 위해 0.0001ms 로 지정
					// oItem.css(self._getCSSKey('transitionProperty'), 'none');
					oItem.css(self._getCSSKey('transitionDuration'), '0.0001ms');
					aShouldReset.push(oItem);

				}

				aTransitionCache = null;

				// 0.0001ms 로 지정했던걸 곧바로 0 으로 지정
				(window.requestAnimationFrame || window.setTimeout)(function() {

					// if (self._bPlaying) {
					// 	aShouldReset = null;
					// 	return;
					// }

					while (oItem = aShouldReset.pop()) {
						oItem.css(self._getCSSKey('transitionDuration'), '0');
						oItem.css(self._getCSSKey('transitionProperty'), 'none');
					}

					aShouldReset = null;

				}, 0);

				self.fireEvent('transitionEnd');

				// CSS, RAF 둘다 처리했고 일시정지하는 상황이 아니면
				if (--self._nIng === 0 && !bPause) {
					self._requestAnimationFrame(function() {
						// 큐에 있는 다음 항목 처리
						self._flushQueue();
					});
				}

			};

			// 변화시키는 모든 엘리먼트가 안 보이는 상태일때는 transitionEnd 이벤트가 발생하지 않으므로 그냥 다음으로 넘어감
			if (!welObj) {
				fpNext();
				return;
			}

			var elObj = welObj.$value();

			var fpOnTransitionEnd = function(bPause) {
				elObj.removeEventListener(self._sTransitionEnd, self._fpOnTransitionEnd, true);
				self._fpOnTransitionEnd = null;
				fpNext(bPause === true); // 일시정지 하면서 호출 된 상황인지
			};

			self._fpOnTransitionEnd = function(evt) {
				// console.log('on fpOnTransitionEnd', evt);
				fpOnTransitionEnd(evt);
			};

			// transitionEnd 이벤트 핸들러 등록
			elObj.addEventListener(self._sTransitionEnd,  self._fpOnTransitionEnd, true);

		})();

	},

	/**
	 * RAF 돌리기
	 * @param bSetStatic 상수(애니메이션이 불가능한 값)를 사용한 값도 셋팅할꺼면 true, 변화하는 값(애니메이션이 가능한 값)만 셋팅할꺼면 false
	 */
	_animationLoop : function(bSetStatic) {

		var self = this;

		this._oRAF = this._requestAnimationFrame(function() {

			var nStart = self._nStart;
			var nDuration = self._aCompiledItem.duration;

			if (self._oRAF === null) { return; }
			self._oRAF = null;

			var nPer = Math.min(1, Math.max(0, (new Date().getTime() - nStart) / nDuration));
			self._processItem(nPer, bSetStatic, 2/*RAF*/);

			if (nPer < 1) {
				self._animationLoop();
			} else {
				self.fireEvent('timerEnd');
				if (--self._nIng === 0) {
					self._flushQueue();
				}
			}

		});

	},

	/**
	 * @param nRate 얼마나 진행 시킬지 (0~1)
	 * @param bSetStatic 상수를 사용한 값도 셋팅할꺼면 true, 변화하는 값만 셋팅할꺼면 false
	 * @param nTargetType 셋팅할 대상을 지정 (1 : CSS Transition 를 쓰는 것, 2 : RAF 를 쓰는 것)
	 * @param bPause 정지하기 위해 호출하는 거면
	 */
	_processItem : function(nRate, bSetStatic, nTargetType, bPause) {

		var oRet = {
			// 셋팅되어야 하는 일반 프로퍼티(CSS 속성이 아닌) 목록 (bPause 가 true 일때만 채워짐)
			// 나중에 pause 메서드의 뒷부분에서 사용된다.
			normalPropsToPause : [],

			// Transition 스타일에 설정된 엘리먼트들을 담는 배열
			// 나중에 transtion 스타일을 리셋 해주기 위해 사용된다.
			transitionCache : []
		};

		var aNormalPropsToPause = oRet.normalPropsToPause;
		var aTransitionCache = oRet.transitionCache;

		var self = this;

		var aCompiledItem = this._aCompiledItem;
		var nDuration = aCompiledItem.duration;

		/*
			0 으로 지정했을때는 비동기적으로 동작해야 하기 때문에
			CSS duration 으로 셋팅될때 1ms 로 지정될 수 있도록 바꿔주고,

			-1 으로 지정했을때는 동기적으로 동작해야 하기 때문에
			CSS duration 으로 셋팅될때 0ms 로 지정될 수 있도록 바꿔줌.
		*/
		if (nDuration === 0) { nDuration = 1; }
		else if (nDuration < 0) { nDuration = 0; }

		var oObj, welObj, oProps;

		var vProp, nType;

		var sStyleKey;
		var bHasTransformRenderBug = this._bHasTransformRenderBug;

		nTargetType = nTargetType || (1/*CSS*/ | 2/*RAF*/);

		/**
			애니메이션 진행을 위해 값을 설정하기 직전에 발생
			@event beforeProgress

			@stoppable

			@param {Number} nRate 진행률 (0~1 사이의 값)
			@param {Function} stop 호출 시 값을 설정하지 않음
		**/
		if (!this.fireEvent('beforeProgress', { 'nRate' : nRate })) {
			return;
		}

		var aLists = [], oListProp;

		for (var i = 0, oItem; oItem = aCompiledItem[i]; i++) {

			oObj = oItem.oObj;
			welObj = oItem.welObj;
			oProps = oItem.oProps;

			var sObjTimingFunc = oItem.sTimingFunc;
			if (sObjTimingFunc && (nTargetType & 1)) {

				// Transition CSS 를 먹여도 실행되지 않는 문제 해결
				welObj && welObj.$value().clientHeight;

				if (!('@transition' in oProps) && !bPause) {
					if (!('@transitionProperty' in oProps)) { welObj.css(this._getCSSKey('transitionProperty'), 'all'); }
					if (!('@transitionDuration' in oProps)) { welObj.css(this._getCSSKey('transitionDuration'), (nDuration / 1000).toFixed(3) + 's'); }
					if (!('@transitionTimingFunction' in oProps)) { welObj.css(this._getCSSKey('transitionTimingFunction'), sObjTimingFunc); }
				}

				aTransitionCache.push(welObj);

			}

			oListProp = {};
			aLists.push(oObj, oListProp);

			// 현재 지정된 종료 transform 을 유지한채 (nRate:1) 멈추고 싶을때 AppleWebKit/534.30 에서 발생하는 문제 회피
			if (bPause && nRate === 1 && '@transform' in oProps && /AppleWebKit\/534\.30/.test(navigator.userAgent)) {
				welObj.css(this._getCSSKey('transform'), '');
				oObj.clientHeight;
			}

			for (var sKey in oProps) if (oProps.hasOwnProperty(sKey)) {

				vProp = oProps[sKey];
				sStyleKey = /^@(.*)$/.test(sKey) && RegExp.$1;

				nType = sObjTimingFunc && sStyleKey ? 1/*CSS*/ : 2/*RAF*/;

				// 지금꺼가 바꿔야 하는게 아니면 그만둠
				if (!(nTargetType & nType)) {
					continue;
				}

				if (typeof vProp === 'function') { vProp = vProp(nRate); } // 변화하는 값이면
				else if (!bSetStatic) { continue; } // 정적인 값인데 bSetStatic 도 false 면 그만둠

				// CSS 스타일 속성인 경우
				if (sStyleKey) {
					if (/transition/.test(sKey)) { vProp = this._getCSSVal(vProp); }

					// SlideReveal 에서 발생했던 렌더링 버그?? (엉뚱한 위치에서 움직이는 문제)
					if (bHasTransformRenderBug && '@transform' === sKey && ('@left' in oProps || '@top' in oProps)) {
						oObj.clientHeight;
					}

					welObj.css(this._getCSSKey(sStyleKey), vProp);

				// 일반 속성인 경우
				} else {

					if (bPause) {
						// 중지시킬때 일반 속성은 바로 셋팅하지 않고 나중에 셋팅하기 위해 배열에 넣어둠
						aNormalPropsToPause.push([ oObj, sKey, vProp ]);
					} else {
						oObj[sKey] = vProp;
					}
				}

				oListProp[sKey] = vProp;

			}

		}

		/**
			애니메이션 진행을 위해 값을 설정한 직후에 발생
			@event progress

			@param {Array} aLists 설정 한 애니메이션 정보 (객체와 프로퍼티 목록이 번갈아가며 존재)
			@param {Number} nRate 진행률 (0~1 사이의 값)
		**/
		this.fireEvent('progress', { 'aLists' : aLists, 'nRate' : nRate });

		return oRet;

	},

	/**
		pushAnimate 로 지정된 내용들을 애니메이션을 돌리기 쉬운 형태로 바꾸는 메서드
		
		BEFORE :
			[ 'foo', { '@left' : '100px' }, 'bar' : { '@top' : jindo.m.Effect.bounce('50px') } ]

		AFTER :
			[
				{
					oObj : 'foo',
					welObj : jindo.$Element('foo'),
					sTimingFunc : 'ease-out',
					oProps : {
						'@left' : function(p) { ... }
					}
				},
				{
					oObj : 'bar',
					welObj : jindo.$Element('bar'),
					sTimingFunc : null,
					oProps : {
						'@top' : function(p) { ... }
					}
				}
			]
	*/
	_compileItem : function(aItem) {

		var bFoundShouldRAF = aItem.length == 0; // 타이머로 동작해야 하는 속성이 발견된 경우

		var aRet = [];
		aRet.duration = aItem.duration;

		var oObj, welObj, oProps;
		var vDepa, vDest;

		var oCompiledProps;

		var bIsStyleKey, sStyleKey;

		// 옵션에 지정된 기본 효과 얻기
		var fDefaultEffect = this.option('fEffect');

		for (var i = 0, nLen = aItem.length; i < nLen; i += 2) {

			var fObjEffect, // 객체에서 사용하는 이펙트 함수
				sObjTimingFunc = null; // 객체에서 사용하는 CSS 타이밍 함수

			oObj = aItem[i];
			welObj = jindo.$Element(oObj);
			oProps = aItem[i + 1];
			oCompiledProps = {};

			var bHasProps = false;

			// 각 엘리먼트에 할당되어야 하는 값을 얻음
			for (var sKey in oProps) if (oProps.hasOwnProperty(sKey)) {

				var fPropEffect, // 프로퍼티에서 사용하는 이펙트 함수
					sPropTimingFunc; // 프로퍼티에서 사용하는 CSS 타이밍함수

				vDest = oProps[sKey];
				bIsStyleKey = /^@(.*)$/.test(sKey);

				sStyleKey = RegExp.$1;

				// 목표값이 배열 형태이면 시작값도 지정된 상태
				if (vDest instanceof Array) {
					vDepa = vDest[0];
					vDest = vDest[1];
				} else if (bIsStyleKey) { // 키값이 CSS 이면 시작값을 현재 상태로부터 얻음
					vDepa = welObj.css(this._getCSSKey(sStyleKey));
				} else { // 키값이 CSS 가 아닌경우의 시작값을 현재 상태로부터 얻음
					vDepa = oObj[sKey];
				}

				vDepa = (vDepa === 0 ? vDepa : vDepa || '');

				// 이 속성을 변경할때 사용할 이펙트
				fPropEffect = typeof vDest === 'function' ? vDest.effectConstructor : fDefaultEffect;
				sPropTimingFunc = this._getEffectCSS(fPropEffect) || '';

				// transform 스타일이면
				if (/^@transform$/.test(sKey)) {

					if (typeof vDest === 'function') { vDest = vDest.end; }
					oCompiledProps[sKey] = this._getTransformFunction(vDepa, vDest, fPropEffect, oObj);
					if (jindo.m) {
						var osInfo = jindo.m.getOsInfo();
						if (/matrix/.test(vDepa) || /matrix/.test(vDest)) {
							// 2.x 버젼에서는 matrix CSS 에 transition 이 적용이 안되서 무조건 타이머 쓰도록 보정
							if (osInfo.android && parseFloat(osInfo.version) < 3) {
								sPropTimingFunc = '';
							}
						}
					}

				} else {

					// '@left' : jindo.m.Effect.bounce('250px') 형태로 사용했을떄
					if (typeof vDest === 'function') {
						if ('setStart' in vDest) { vDest.setStart(vDepa); }
						oCompiledProps[sKey] = vDest;
					// '@left' : '250px' 형태로 사용했을떄
					} else {
						try {
							oCompiledProps[sKey] = fPropEffect(vDepa, vDest);
						} catch(e) {
							// px -> % 또는 % -> px 인 경우 문제~!
							if (!/^unit error/.test(e.message)) { throw e; }
							oCompiledProps[sKey] = vDest;
						}
					}

				}

				var fProp = oCompiledProps[sKey];
				if (typeof fProp === 'function' && fProp(0) === fProp(1)) { // 시작값과 종료값이 같으면 그만둠
					delete oCompiledProps[sKey];
					continue;
				}

				if (bIsStyleKey) { // 키 값이 CSS 이면
					// 객체에 CSS 타이밍함수가 안 정해져 있으면 이 속성의 CSS 타이밍함수 쓰기
					if (sObjTimingFunc === null) {
						sObjTimingFunc = sPropTimingFunc;
					// 객체에 이미 CSS 타이밍함수가 정해져있고 이 속성에서 쓰는거랑 다르면 객체 전체에서 CSS 타이밍함수 안 쓰기
					} else if (sObjTimingFunc !== sPropTimingFunc) {
						sObjTimingFunc = '';
					}
				} else { // 키 값이 CSS 가 아니면 CSS 를 사용한 효과구현 안하게
					sPropTimingFunc = '';
				}

				bFoundShouldRAF = bFoundShouldRAF || !sPropTimingFunc;
				bHasProps = true;

			}

			// 안보이는 상태면 무조건 RAF 쓰게 함
			if (!welObj.visible()) {
				sObjTimingFunc = null, bFoundShouldRAF = true;
			}

			bHasProps && aRet.push({
				'oObj' : oObj, 'welObj' : welObj, 'oProps' : oCompiledProps,
				'sTimingFunc' : sObjTimingFunc
			});

		}

		// RAF 를 사용해야 하는 속성이 하나도 없으면 allCSS 를 true 로
		aRet.allCSS = !bFoundShouldRAF;

		return aRet;

	},

	///////////////////////////////////////////////////////////////////////////////////////////////////
	/// public 메서드 구현
	///////////////////////////////////////////////////////////////////////////////////////////////////

	/**
		현재 재생위치부터 재생목록에 들어있는 일을 수행
		
		@method play
		@return {this}
	**/
	play : function() {

		if (!this._bPlaying) {
			this._bPlaying = true;

			/**
				애니메이션이 재생이 시작 되었을 때 발생
				@event play
			**/
			this.fireEvent('play');
			this._flushQueue();

		}

		return this;

	},

	/**
		재생 위치를 맨 처음으로 변경
		@method reset
		@return {this}
	**/
	reset : function() {
		return this._goto(0);
	},

	/**
		애니메이션 수행 중단
		@method pause

		@param {Number} [nRate] 중단 위치 (0(시작상태)~1(종료상태) 사이의 값을 지정 할 수 있으며, 생략시 현 상태로 중단한다)

		@return {this}
	**/
	pause : function(nRate) {

		// $Element('ball').css({
		// 	'transform' : 'translateX(100px) scale(1.5) rotate(45deg)',
		// 	// 'transitionProperty' : 'none',
		// 	'transitionDuration' : '0.0001ms'
		// });

		// return;

		// this._requestAnimationFrame(function() {
		// 	$Element('ball').css({
		// 		'transitionDuration' : '0'
		// 	});
		// }, 0);

		// console.log(this._fpOnTransitionEnd);

		// return;

		if (!this._bPlaying) { return this; }

		this._cancelAnimationFrame(this._oRAF);
		this._oRAF = null;

		var aCompiledItem = this._aCompiledItem;
		var nDuration = aCompiledItem.duration;

		if (typeof nRate === 'undefined') {
			var nPassed = new Date().getTime() - this._nStart;
			nRate = nPassed / nDuration;
		}

		nRate = Math.max(0, Math.min(1, nRate));

		var aNormalPropsToPause = null;

		if (aCompiledItem.keyframe) {
			this._processKeyframe(nRate, aCompiledItem.keyframe);
		} else {
			aNormalPropsToPause = this._processItem(nRate, true, 3/*ALL*/, true).normalPropsToPause;
		}

		this._nPtr--;
		this._nPausePassed = Math.round(nDuration * nRate);

		if (this._fpOnTransitionEnd) {
			this._fpOnTransitionEnd(true);
		}

		// console.log('aNormalPropsToPause', aNormalPropsToPause);

		// 일반속성을 중지 시키면서 바로 셋팅하면 일부 모바일단말기에서 제대로 셋팅되지 않는 문제 회피
		if (aNormalPropsToPause) {
			for (var i = 0, nLen = aNormalPropsToPause.length; i < nLen; i++) {
				var aNormalProp = aNormalPropsToPause[i];
				aNormalProp[0][aNormalProp[1]] = aNormalProp[2];
			}
		}

		this._bPlaying = false;

		/**
			애니메이션이 재생이 정지 되었을 때 발생
			@event pause
		**/
		this.fireEvent('pause');

		return this;

	},

	/**
		지정된 라벨로 실행 포인터를 이동함
		
		@ignore
		@method _goto
		@param {String} sLabel 라벨명
		@return {this}
	**/
	/**
		지정된 목록 위치로 실행 포인터를 이동함
		
		@ignore
		@method _goto
		@param {Number} nIndex 목록 위치
		@return {this}
	**/
	_goto : function(nIndex) {

		var sLabel = nIndex;

		if (typeof nIndex === 'number') {
			nIndex = nIndex || 0;
		} else {
			nIndex = this._getLabelIndex(sLabel);
			if (nIndex === -1) throw 'Label not found';
		}

		this._nPtr = nIndex;
		this._nPausePassed = 0;

		return this;

	},

	/**
		현재 재생중인 상태인지 반환
		
		@method isPlaying
		@return {Boolean} 재생중이면 true, 재생중이 아니면 false
	**/
	isPlaying : function() {
		return this._bPlaying || false;
	},

	/**
		재생목록을 모두 삭제함
		@method clear
		@return {this}
	**/
	clear : function() {

		this._aQueue.length = 0;
		this._aRepeat.length = 0;
		this._nPtr = 0;
		this._nPausePassed = 0;

		return this;

	},

	/**
		현재 재생 위치를 얻음
		
		@ignore
		@method _getPointer
		@return {Number} 현재 재생 위치
	**/
	_getPointer : function() {
		return this._nPtr;
	},

	// Effect 함수를 CSS timing-function 스타일로 변환
	_getEffectCSS : function(fEffect) {

		var bUseTransition = this.option('bUseTransition') && this._bTransitionSupport;

		// Transition 를 쓰지않도록 셋팅되어 있으면 RAF 사용
		if (!bUseTransition) { return null; }

		// progress 나 beforeProgress 핸들러가 등록되어 있으면 RAF 사용
		if (
			(this._htEventHandler.progress && this._htEventHandler.progress.length) ||
			(this._htEventHandler.beforeProgress && this._htEventHandler.beforeProgress.length)
		) { return null; }

		// toString 함수가 구현되어 있으면 그거 사용
		if (fEffect.hasOwnProperty('toString')) {
			return fEffect.toString();
		}

		switch (fEffect) {
		case jindo.m.Effect.linear:
			return 'linear'; break;
		case jindo.m.Effect.cubicEase:
			return 'ease'; break;
		case jindo.m.Effect.cubicEaseIn:
			return 'ease-in'; break;
		case jindo.m.Effect.cubicEaseOut:
			return 'ease-out'; break;
		case jindo.m.Effect.cubicEaseInOut:
			return 'ease-in-out'; break;
		default:
			if (fEffect.cubicBezier && Math.max.apply(Math, fEffect.cubicBezier) <= 1 && Math.min.apply(Math, fEffect.cubicBezier) >= 0) {
				return 'cubic-bezier(' + fEffect.cubicBezier.join(',') + ')';
			}
			break;
		}

		// CSS 에 없는 timing-function 이면 RAF 사용
		return null;

	},

	// jindo.m 이 없을 수 도 있기 때문에 별도 구현
	_requestAnimationFrame : function(fFunc) {

		var ret;
		var self = this;
 
		var fWrap = function() {

			if (ret === self._oLastRAF) {
				self._oLastRAF = null;
				fFunc();
			}
 
		};
 
		if (window.requestAnimationFrame) {
			ret = requestAnimationFrame(fWrap);
		} else {
			ret = setTimeout(fWrap, 1000 / 60);
		}
 
		return (this._oLastRAF = ret);

	},

	// jindo.m 이 없을 수 도 있기 때문에 별도 구현
	_cancelAnimationFrame : function(nRAF) {

		var ret;

		if (window.cancelAnimationFrame) {
			ret = cancelAnimationFrame(nRAF);
		} else {
			ret = clearTimeout(nRAF);
		}
 
		this._oLastRAF = null;
 
		return ret;

	},	

	///////////////////////////////////////////////////////////////////////////////////////////////////
	/// UTIL 성격의 메서드
	///////////////////////////////////////////////////////////////////////////////////////////////////
	_oProperPrefix : {},

	// 지정된 스타일에 적당한 CSS prefix 얻기
	_getProperPrefix : function(sType) {

		var oProperPrefix = this._oProperPrefix;
		if (sType in oProperPrefix) { // 캐싱되어 있는 값이 있으면 그걸 쓰기
			return oProperPrefix[sType];
		}

		var oBodyStyle = document.body.style;
		var aPrefix = [ 'webkit', '', 'Moz', 'O', 'ms' ];
		var sPrefix, sFullType;

		var fReplacer = function(s) { return s.toUpperCase(); };

		for (var i = 0, nLen = aPrefix.length; i < nLen; i++) {
			sPrefix = aPrefix[i];
			sFullType = sPrefix + (sPrefix ? sType.replace(/^[a-z]/, fReplacer) : sType);
			if (sFullType in oBodyStyle) {
				return (oProperPrefix[sType] = sPrefix);
			}
		}

		return (oProperPrefix[sType] = '');

	},

	// Jindo 하위버젼을 사용할 것을 대비해서 CSS prefix 를 붙혀주는 코드를 별도 구현
	_getCSSKey : function(sName) {

		var self = this;
		var sPrefix = '';

		var sFullname = sName.replace(/^(\-(webkit|o|moz|ms)\-)?([a-z]+)/, function(_, __, _sPrefix, sType) {
			sPrefix = _sPrefix || self._getProperPrefix(sType); // prefix 가 명시적으로 지정되어 있지 않으면 적당한 prefix 을 얻어서 지정
			if (sPrefix) { sType = sType.replace(/^[a-z]/, function(s) { return s.toUpperCase(); }); }
			return sType;
		}).replace(/\-(\w)/g, function(_, sChar) { // -소문자 를 대문자로 변경
			return sChar.toUpperCase();
		});

		return (({ 'o' : 'O', 'moz' : 'Moz', 'webkit' : 'Webkit' })[sPrefix] || sPrefix) + sFullname;

	},

	// Jindo 하위버젼을 사용할 것을 대비해서 CSS prefix 를 붙혀주는 코드를 별도 구현
	_getCSSVal : function(sName) {

		var self = this;

		var sFullname = sName.replace(/(^|\s)(\-(webkit|moz|o|ms)\-)?([a-z]+)/g, function(_, sHead, __, sPrefix, sType) {
			sPrefix = sPrefix || self._getProperPrefix(sType); // prefix 가 명시적으로 지정되어 있지 않으면 적당한 prefix 을 얻어서 지정
			return sHead + (sPrefix && '-' + sPrefix + '-') + sType;
		});

		return sFullname;

	},

	/**
		transform-styled 문자열을 matrix 문자열로 바꾸는 함수
	**/
	_getMatrixObj : function(sTransform, elBox) {

		sTransform = sTransform.replace(/\b(translate(3d)?)\(\s*([^,]+)\s*,\s*([^,\)]+)/g, function(_1, key, _2, x, y) {

			// translate 와 tranalate3d 에서 % 단위의 값을 px 로 변환
			if (/%$/.test(x)) { x = parseFloat(x) / 100 * elBox.offsetWidth + 'px'; }
			if (/%$/.test(y)) { y = parseFloat(y) / 100 * elBox.offsetHeight + 'px'; }

			return key + '(' + x + ',' + y;

		}).replace(/\b(translate([XY]))\(\s*([^\)]+)/g, function(_, key, type, val) {

			// translateX 와 translateY 에서 % 단위의 값을 px 로 변환
			if (type === 'X' && /%$/.test(val)) { val = parseFloat(val) / 100 * elBox.offsetWidth + 'px'; }
			else if (type === 'Y' && /%$/.test(val)) { val = parseFloat(val) / 100 * elBox.offsetHeight + 'px'; }

			return key + '(' + val;

		});

		var getMatrixValue;
		var CSSMatrix = window.WebKitCSSMatrix || window.MSCSSMatrix || window.OCSSMatrix || window.MozCSSMatrix || window.CSSMatrix;

		// CSSMatrix 객체를 지원하는 브라우저면
		if (CSSMatrix) {

			// 그냥 CSSMatrix 의 toString 기능을 사용
			getMatrixValue = function(sTransform) {
				return new CSSMatrix(sTransform).toString();
			};

		// CSSMatrix 객체를 지원하지 않는 브라우저면
		} else {

	        var sID = 'M' + Math.round(new Date().getTime() * Math.random());
	        var oAgent = jindo.$Agent().navigator();

	        var sPrefix = oAgent.firefox ? 'moz' : (oAgent.ie ? 'ms' : 'o');
			var sTransformKey = '-' + sPrefix + '-transform';

	        var elStyleTag = document.createElement('style');
	        elStyleTag.type = "text/css";

	        var elHTML = document.getElementsByTagName('html')[0];
	        elHTML.insertBefore(elStyleTag, elHTML.firstChild);

	        var oSheet = elStyleTag.sheet || elStyleTag.styleSheet;

	        var elDummy = document.createElement('div');
	        elDummy.id = sID;

	        var oComputedStyle = window.getComputedStyle(elDummy, null);

	        // 임시로 DOM 을 생성하고 getComputedStyle 로부터 얻은 값을 사용
			getMatrixValue = function(sTransform) {

				var sRet = null;

				oSheet.insertRule('#' + sID + ' { ' + sTransformKey + ': ' + sTransform + ' !important; }', 0);
	        	document.body.insertBefore(elDummy, document.body.firstChild);
				sRet = oComputedStyle.getPropertyValue(sTransformKey);

		        document.body.removeChild(elDummy);
				oSheet.deleteRule(0);
				
				return sRet;

			};

		}

		// transform 문자열을 matrix 로 변환
		var sVal = getMatrixValue(sTransform);

		// hello(foo,bar,baz) 형태의 값을 얻었으면
		if (/^([^\(]+)\(([^\)]*)\)$/.test(sVal)) {
			return {
				key : RegExp.$1,
				val : RegExp.$2.replace(/\s*,\s*/g, ' ') // 쉼표를 빈칸으로 변경
			};
		}

		// 기본 matrix 값 반환
		return { key : 'matrix', val : '1 0 0 1 0 0' };

	},

	// matrix(...) 를 matrix3d(...) 로 변환
	_convertMatrix3d : function(oTransformObj) {

		if (oTransformObj.key === 'matrix3d') { return oTransformObj; }

		var aVal = oTransformObj.val.split(' ');
		oTransformObj.key = 'matrix3d';

		// matrix(a, b, c, d, tx, ty) is a shorthand for matrix3d(a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1).
		aVal.splice(2, 0, '0'); aVal.splice(3, 0, '0'); aVal.splice(6, 0, '0'); aVal.splice(7, 0, '0');
		aVal.splice(8, 0, '0'); aVal.splice(9, 0, '0'); aVal.splice(10, 0, '1'); aVal.splice(11, 0, '0');
		aVal.splice(14, 0, '0'); aVal.splice(15, 0, '1');

		oTransformObj.val = aVal.join(' ');

		return oTransformObj;

	},

	/**
		transform CSS 속성값을 파싱
		예)
			_parseTransformText('scale3d(2, 1.5, 1) translate(100px, 30px) rotate(10deg)');

			-> {
				'scaleX' : '2',
				'scaleY' : '1.5',
				'scaleZ' : '1',
				'translateX' : '100px',
				'translateY' : ' 30px',
				'rotate' : '10deg'
			}
	**/
	_parseTransformText : function(sText) {

		sText = sText || '';

		var oRet = {};

		sText.replace(/([\w\-]+)\(([^\)]*)\)/g, function(_, sKey, sVal) {

			var aVal = sVal.split(/\s*,\s*/);

			switch (sKey) {
			case 'translate3d':
			case 'scale3d':
			case 'skew3d':
				sKey = sKey.replace(/3d$/, '');
				oRet[sKey + 'Z'] = aVal[2];
				// cont. X, Y 도 마저 셋팅 되도록 일부러 break 안 넣었음

			case 'translate':
			case 'scale':
			case 'skew':
				oRet[sKey + 'X'] = aVal[0];

				if (typeof aVal[1] === 'undefined') {
					if (sKey === 'scale') { oRet[sKey + 'Y'] = aVal[0]; }
				} else {
					oRet[sKey + 'Y'] = aVal[1];
				}

				break;

			default:
				oRet[sKey] = aVal.join(',');
				break;
			}

		});

		return oRet;

	},

	/**
		Effect 컴퍼넌트의 기능을 사용 할 수 없는 시작값과 종료값을 가진 Effect 객체를 동작 할 수 있게 만들어 주는 함수

		var my = jindo.m.Effect.linear();
		 
		my.start = 'scale3d(2, 1.5, 1) translate(100px, 30px) rotate(10deg)';
		my.end = 'translateX(300px)';
		 
		var func = ..._getTransformFunction(my);
		func(0.5); // 'scaleX(2) scaleY(1.5) scaleZ(1) translateX(200px) translateY(30px) rotate(10deg)'
	**/
	_getTransformFunction : function(sDepa, sDest, fEffect, elBox) {

		var sKey;

		var oDepa, oDest;

		// matrix transform 이 바뀌는거면
		if (/matrix/.test(sDepa + sDest)) {

			// 둘다 matric 객체로 변환
			oDepa = this._getMatrixObj(sDepa, elBox);
			oDest = this._getMatrixObj(sDest, elBox);

			// 종류가 다르면 범용적으로 맞출 수 있는 matrix3d 로 변환
			if (oDepa.key !== oDest.key) {
				oDepa = this._convertMatrix3d(oDepa);
				oDest = this._convertMatrix3d(oDest);
			}

			fEffect = fEffect(oDepa.val, oDest.val);

			return function(nRate) {
				return nRate === 1 ? sDest : oDepa.key + '(' + fEffect(nRate).replace(/ /g, ',') + ')';
			};

		}

		// 시작값과 종료값을 각각 파싱
		oDepa = this._parseTransformText(sDepa);
		oDest = this._parseTransformText(sDest);

		var oProp = {};

		// 시작값에 있는 내용으로 속성들 셋팅
		for (sKey in oDepa) if (oDepa.hasOwnProperty(sKey)) {
			// 시작값, 종료값 셋팅 (만약 종료값이 지정되어 있지 않으면 1 또는 0 셋팅)
			oProp[sKey] = fEffect(oDepa[sKey], oDest[sKey] || (/^scale/.test(sKey) ? 1 : 0));
		}

		// 종료값에 있는 내용으로 속성들 셋팅
		for (sKey in oDest) if (oDest.hasOwnProperty(sKey) && !(sKey in oDepa)) { // 이미 셋팅되어 있지 않는 경우에만
			// 시작값, 종료값 셋팅 (만약 시작값이 지정되어 있지 않으면 1 또는 0 셋팅)
			oProp[sKey] = fEffect(oDepa[sKey] || (/^scale/.test(sKey) ? 1 : 0), oDest[sKey]);
		}

		var fpFunc = function(nRate) {
			var aRet = [];
			for (var sKey in oProp) if (oProp.hasOwnProperty(sKey)) {
				aRet.push(sKey + '(' + oProp[sKey](nRate)+ ')');
			}
			/*
			aRet = aRet.sort(function(a, b) {
				return a === b ? 0 : (a > b ? -1 : 1);
			});
			*/

			return aRet.join(' ');
		};

		return fpFunc;

	}

}).extend(jindo.m.Component);
