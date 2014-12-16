/**
	지정한 방법으로 진행되는 애니메이션 동작의 특정 시점의 상황으로 만들어 주는 컴포넌트

	@author hooriza
	@version #__VERSION__#
	
	@class jindo.m.Keyframe
	@extends jindo.m.Component
	@uses jindo.m.Effect
	@keyword 애니메이션, animation, transition, keyframe
	
	@group Component

	@history 1.10.0 Release 최초 릴리즈
**/
jindo.m.Keyframe = jindo.$Class({

	/**
		Keyframe 컴포넌트를 생성한다.

		@constructor
		@param {Hash} [oOption] 옵션
			@param {Function} [oOption.fEffect=jindo.m.Effect.linear] 기본 애니메이션 효과
	**/
	$init : function(oOptions) {

		this._nCurFrame = null;
		this._nCurIdx = null;

		this._aKeyframeLists = [];
		this._oPreprocessed = null;
		this._bPreprocessed = false;

		this._oRAF = null;

		var oAgent = jindo.$Agent();
		var oOS = oAgent.os();
		var oNavigator = oAgent.navigator();

		this._bHasTransformRenderBug = oOS.ios && parseInt(oOS.version, 10) === 5 && oNavigator.msafari;

		this.option({ fEffect : jindo.m.Effect.linear, nAnimationDuration : 0 });
		this.option(oOptions || {});

		this._fDefaultEffect = this.option('fEffect')();

	},

	///////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////

	// 비동기 preprocess 을 위해 for-loop 대신에 사용
	_loop : function(bAsync, nLen, fBody, fDone) {

		(function loop(i) {

			fBody(i);

			if (++i < nLen) {

				if (bAsync) {
					(window.requestAnimationFrame || window.setTimeout)(
						function() { loop(i); }, 1000 / 60
					);
				} else {
					loop(i);
				}

				return;
			}

			fDone();

		})(0);

	},

	// preprocess 구현
	_preprocessKeyframes : function(bPreprocessAsync) {

		if (this._bPreprocessed) {
			this.fireEvent('preprocessEnd');
			return;
		}

		if (this._oPreprocessed) { return; }

		this._oPreprocessed = { objs : {}, frames : null };

		var aBefore = this._aKeyframeLists.sort(function(a, b) { return a.frame - b.frame; });
		var oAfter = {}, aAfter = [];

		var oIngFrame = {};
		var oFirstFrame = {}; // 맨 처음 frame 객체

		var self = this;

		// dynamic 속성 셋팅
		var step1 = function() {

			self._loop(bPreprocessAsync, aBefore.length, function(i) {

				var oFrame = aBefore[i];

				var nFrame = oFrame.frame;
				var sObjKey;
				var oVals = self._toPropObj(oFrame.propLists);

				var oPreprocessedFrame = oAfter[nFrame] = { 'frame' : nFrame, 'dynamic' : {}, 'static' : {} };
				aAfter.push(oPreprocessedFrame);

				for (sObjKey in oVals) if (oVals.hasOwnProperty(sObjKey)) {

					var nEndFrame = nFrame;
					var vEndVal = oVals[sObjKey];
					var fEffect = self._fDefaultEffect;

					// 효과가 지정된경우
					// ex) keyframe.set(2000, [ elEl, { '@left' : jindo.m.Effect.bounce('30px') } ]);
					if (typeof vEndVal === 'function') {
						fEffect = vEndVal;
						vEndVal = vEndVal.end;
					}

					var oIng = oIngFrame[sObjKey];

					if (oIng) { // 앞에서 같은 sObjKey 도 셋팅된게 있다면 종료값을 연장시켜줌

						oIng.effect = fEffect;
						oIng.frames[1] = nEndFrame;
						oIng.vals[1] = vEndVal;

						// if (fEffect.name === 'skip') {
						if (fEffect.effectConstructor === jindo.m.Effect.stepEnd) {
							oIng.vals[1] = oIng.vals[0];
						}
						/* @JINDOSUS-1745 이슈로 인해 이 코드가 없어야 잘 돌아감
						else if (fEffect.effectConstructor === jindo.m.Effect.stepStart) {
							oIng.vals[0] = oIng.vals[1];
						}*/

					}

					if (!(sObjKey in oFirstFrame)) {
						oFirstFrame[sObjKey] = vEndVal;
					}

					// 새로운 frame 객체 만듬
					oIngFrame[sObjKey] = { effect : null, frames : [ nEndFrame ] , vals : [ vEndVal ] };

				}

				for (sObjKey in oIngFrame) if (oIngFrame.hasOwnProperty(sObjKey)) {
					oAfter[nFrame]['dynamic'][sObjKey] = oIngFrame[sObjKey];
				}

			}, step2);

		};

		// static 속성 셋팅
		var step2 = function() {

			self._loop(bPreprocessAsync, aAfter.length, function(i) {

				var oFrame = aAfter[i];
				for (var sObjKey in oFirstFrame) if (oFirstFrame.hasOwnProperty(sObjKey)) {
					if (sObjKey in oFrame['dynamic']) { continue; }
					oFrame['static'][sObjKey] = oFirstFrame[sObjKey];
				}

			}, step3);

		};

		// 마무리 정리
		var step3 = function() {

			self._oPreprocessed.frames = aAfter;

			// 객체에 할당된 임시 키값 제거
			var oCache = self._oPreprocessed.objs;
			for (var sObjKey in oCache) if (oCache.hasOwnProperty(sObjKey)) {
				try {
					delete oCache[sObjKey].__KEYFRAME_UNIQ;
				} catch(e) {
					oCache[sObjKey].__KEYFRAME_UNIQ = undefined;
				}
			}

			oAfter = null;
			self._bPreprocessed = true;

			/**
				Preprocess 작업이 완료되었을때 발생하는 이벤트

				@event proprocessEnd
			**/
			self.fireEvent('preprocessEnd');

		};

		step1();

	},

	/**
		get, frame 메서드를 빠르게 사용할 수 있도록 set 으로 지정한 속성을 전처리한다.

		@remark
			set 메서드를 사용하여 규칙 속성이 변경 된 후에는 반드시 호출해야 하며,
			만약 preprocess 메서드를 호출하지 않고 get, frame 메서드를 사용하면 예외가 발생한다.

		@method preprocess
		@param {Boolean} [bPreprocessAsync=false]
			전처리 작업을 비동기적으로 진행 할 지 지정한다.
			동기로 진행하면 최대한 빠르게 처리되지만 처리되는 동안에 브라우저가 멈추는 문제가 있고,
			비동기로 진행하면 전처리 작업을 분할해서 진행하기 때문에 브라우저는 멈추지 않지만 처리 속도가 다소 느려진다.

		@chainable
		@return {jindo.m.Keyframe}

		@example
			var keyframe = new jindo.m.Keyframe();
			...
			keyframe.preprocess(false);
			keyframe.frame(0.5); // preprocess 를 동기적으로 처리했기 때문에 바로 frame 메서드 사용가능

		@example
			var keyframe = new jindo.m.Keyframe();
			...
			keyframe.attach('preprocessEnd', function() {
				// preprocess 를 비동기적으로 처리했기 때문에 preprocessEnd 이벤트가 발생한 후에 frame 메서드 사용가능
				keyframe.frame(0.5);
			});
			keyframe.preprocess(true);

	**/
	preprocess : function(bPreprocessAsync) {
		this._preprocessKeyframes(!!bPreprocessAsync);
		return this;
	},

	// 원하는 frame 의 prop 목록들 얻기
	_getPropLists : function(nFrame, bIncludeStatic) {

		// this.preprocess();

		var aPreprocessedLists = this._oPreprocessed.frames;

		// 필요한 인덱스
		var nDstIdx = aPreprocessedLists.length - 1;

		for (var i = 0, oFrame; oFrame = aPreprocessedLists[i]; i++) {
			if (oFrame.frame > nFrame) { // 원하는 frame 보다 큰 frame 으로 지정된 객체를 얻으면
				// 그 앞에껄로 인덱스 셋팅하고 중단
				nDstIdx = Math.max(0, i - 1); break;
			}
		}

		// console.warn('frame', [ nFrame ], '->', [ nDstIdx ]);

		var oDstLists = aPreprocessedLists[nDstIdx];
		var oPropLists = {};

		// console.log('nDstIdx : ', nDstIdx, oDstLists);

		// 원하는 frame 에 맞는 Dynamic Props 를 얻기
		oPropLists = this._getDynamicProps(oPropLists, nFrame, oDstLists);

		// bIncludeStatic 가 true 이거나 이전에 사용했던 인덱스값과 다른 경우
		if (bIncludeStatic || this._nCurIdx !== nDstIdx) {
			// 원하는 frame 에 맞는 Static Props 를 얻기
			oPropLists = this._getStaticProps(oPropLists, nFrame, oDstLists);
		}

		// 마지막으로 사용한 인덱스값 변경
		this._nCurIdx = nDstIdx;

		return oPropLists;

	},

	_get : function(nFrame, bIncludeStatic) {

		if (!this._bPreprocessed) {
			throw new Error('First, you need to call preprocess().');
		}

		var oPropLists = this._getPropLists(nFrame, bIncludeStatic);
		var oCache = this._oPreprocessed.objs;

		// console.log(oCache);

		var oObj, oProps;
		var aRet = [];

		for (var sObj in oPropLists) if (oPropLists.hasOwnProperty(sObj)) {

			oObj = oCache[sObj];
			oProps = oPropLists[sObj];

			aRet.push(oObj, oProps);

		}

		return aRet;

	},

	/**
		인자로 넣은 진행값인 경우 각 객체에 지정되어야 할 속성 값을 얻는다.

		@remark
			set 메서드를 사용 한 후에 get 메서드를 사용하려면 get 메서드 사용전에 preprocess 메서드를 반드시 한번 호출 해야 한다.

		@method get
		@param {Number} nFrame 진행값

		@return {Array} 객체와 속성 목록이 번갈아 들어있는 배열

		@example
			var keyframe = new jindo.m.Keyframe();

			keyframe.set(0, [ el, { '@left' : '100px' } ]);
			keyframe.set(100, [ el, { '@left' : '200px' } ]);
			keyframe.preprocess(false);

			LOG(keyframe.get(50)); // 결과 : [ el, { '@left' : '150px '} ]
	**/
	get : function(nFrame) {
		return this._get(nFrame, true);
	},

	/**
		인자로 넣은 진행값에 맞는 값으로 각 객체에 속성을 지정한다.

		@remark
			set 메서드를 사용 한 후에 frame 메서드를 사용하려면 frame 메서드 사용전에 preprocess 메서드를 반드시 한번 호출 해야 한다.

		@method frame
		@param {Number} nFrame 진행값
		@param {Boolean} bAll 모든 속성을 변경 (인접한 진행값으로 이동할 때 바꾸지 않아도 되는 속성도 함께 변경하고 싶을때 true 로 지정한다)

		@return {jindo.m.Keyframe}
		@chainable
	**/
	frame : function(nFrame, bAll) {

		var self = this;
		var nCurFrame = this._nCurFrame;

		if (!bAll && nFrame === nCurFrame) { return; }
		this._nCurFrame = nFrame;

		if (this._oRAF) {
			cancelAnimationFrame(this._oRAF);
			this._oRAF = null;
		}

		if (self._bPlaying) {
			self._frame(nCurFrame, bAll);
		}

		var nAnimationDuration = this.option('nAnimationDuration');
		if (nAnimationDuration && nCurFrame !== null) {

			var fValue = jindo.m.Effect.easeOut(
				// nCurFrame,
				// nFrame
				Math.round(nCurFrame * 1000000) / 1000000,
				Math.round(nFrame * 1000000) / 1000000
			);

			var nStart = new Date().getTime();
			var bFirst = true;

			self._bPlaying = true;

			(function loop() {
				self._oRAF = requestAnimationFrame(function() {
					var nFrame = Math.max(0, Math.min(1, (new Date() - nStart) / nAnimationDuration));
					self._frame(fValue(nFrame), bFirst);
					bFirst = false;
					self.oRAF = null;
					if (nFrame < 1) { return loop(); }
					self._bPlaying = false;
				});
			})();

			return;

		}

		return this._frame(nFrame, bAll);

	},

	_frame : function(nFrame, bAll) {

		var bHasTransformRenderBug = this._bHasTransformRenderBug;

		var aLists = this._get(nFrame, bAll);
		var oObj, oProps, welObj, vProp;

		var fp = null;
		var self = this;

		for (var i = 0, nLen = aLists.length; i < nLen; i += 2) {

			oObj = aLists[i];
			oObj = typeof oObj === 'function' ? oObj() : oObj;

			oProps = aLists[i + 1];

			fp = fp || function(oObj, oProps) {

				welObj = jindo.$Element(oObj);

				for (var sKey in oProps) if (oProps.hasOwnProperty(sKey)) {

					vProp = oProps[sKey];

					if (/^@(.*)$/.test(sKey)) {
						sKey = RegExp.$1;
						if (/transition/.test(sKey)) { vProp = self._getCSSVal(vProp); }

						if (bHasTransformRenderBug && '@transform' === sKey && ('@left' in oProps || '@top' in oProps)) {
							oObj.clientHeight;
						}

						welObj.$value().style[self._getCSSKey(sKey)] = vProp;

					} else {
						oObj[sKey] = vProp;
					}

				}

			};

			if (oObj instanceof Array) {
				for (var j = 0, nJen = oObj.length; j < nJen; j++) {
					fp(oObj[j], oProps);
				}
			} else {
				fp(oObj, oProps);
			}

		}

	},

	_getStaticProps : function(oOutProps, nFrame, oDstLists) {

		var oStaticPropLists = oDstLists['static'];

		// console.log('_applyProps', nFrame, oStaticPropLists);

		/****var oCache = this._oPreprocessed.objs;****/
		// var oIdx = {};

		for (var sObjKey in oStaticPropLists) if (/^(.+):(.+)$/.test(sObjKey)) {

			var sObj = RegExp.$1;
			var sKey = RegExp.$2;

			/****var oObj = oCache[sObj];****/
			var vProp = oStaticPropLists[sObjKey];

			oOutProps[sObj] = oOutProps[sObj] || {};
			oOutProps[sObj][sKey] = vProp; 

			/****
			if (/^@(.*)$/.test(sKey)) {
 				sKey = RegExp.$1;
				if (/transition/.test(sKey)) { vProp = this._getCSSVal(vProp); }
				jindo.$Element(oObj).css(this._getCSSKey(sKey), vProp);
			} else {
				oObj[sKey] = vProp;
			}
			****/

			//console.log('static >', [ sKey, vProp ]);

		}

		return oOutProps;

	},

	_getDynamicProps : function(oOutProps, nFrame, oDstLists) {

		var oDynamicPropLists = oDstLists['dynamic'];
		var oStaticPropLists = oDstLists['static'];

		/****var oCache = this._oPreprocessed.objs;****/
		var aDeleteObjKey = [];

		for (var sObjKey in oDynamicPropLists) if (/^(.+):(.+)$/.test(sObjKey)) {

			var sObj = RegExp.$1;
			var sKey = RegExp.$2;

			/****var oObj = oCache[sObj];****/
			var vProp = oDynamicPropLists[sObjKey];

			var fEffect = vProp.effect;
			var vStart = vProp.vals[0];
			var vEnd = vProp.vals[1];

			// 종료값이 없거나 시작값과 종료값이 같으면 static 속성으로 전환
			if (!fEffect || vStart === vEnd) {
				oStaticPropLists[sObjKey] = vStart;
				aDeleteObjKey.push(sObjKey);
				continue;
			}

			fEffect.start = vStart;
			fEffect.end = vEnd;

			if (/^@transform/.test(sKey)) {
				fEffect = this._getTransformFunction(fEffect);
			}

			var nEffectRate = Math.max(0, Math.min(1, (nFrame - vProp.frames[0]) / (vProp.frames[1] - vProp.frames[0])));

			try {
				vProp = fEffect(nEffectRate);
			} catch(e) { // Effect 로 변화시킬 수 없는 값이면 static 속성
				if (!/^unit error/.test(e.message)) { throw e; }
				oStaticPropLists[sObjKey] = vStart;
				aDeleteObjKey.push(sObjKey);
				continue;
			}

			oOutProps[sObj] = oOutProps[sObj] || {};
			oOutProps[sObj][sKey] = vProp; 

			/****
			if (/^@(.*)$/.test(sKey)) {
				sKey = RegExp.$1;
				if (/transition/.test(sKey)) { vProp = this._getCSSVal(vProp); }
				jindo.$Element(oObj).css(this._getCSSKey(sKey), vProp);
			} else {
				oObj[sKey] = vProp;
			}
			****/

			//console.log('dynamic >', [sKey, vProp]);

		}

		for (var i = 0, nLen = aDeleteObjKey.length; i < nLen; i++) {
			delete oDynamicPropLists[aDeleteObjKey[i]];
		}

		aDeleteObjKey.length = null;

		return oOutProps;

	},

	_toPropObj : function(aPropLists) {

		var oRet = {};
		var oCache = this._oPreprocessed.objs;

		function fpGetString(oObj) {

			var sRand;

			if (typeof oObj === 'object') {
				sRand = oObj.__KEYFRAME_UNIQ = oObj.__KEYFRAME_UNIQ || Math.floor(Math.random() * new Date().getTime()) + '';
			} else {
				for (var k in oCache) if (oCache.hasOwnProperty(k)) {
					if (oCache[k] === oObj) { return k; }
				}
				sRand = Math.floor(Math.random() * new Date().getTime()) + '';
			}

			oCache[sRand] = oObj;
			return sRand;

		}

		for (var i = 0, nLen = aPropLists.length; i < nLen; i += 2) {

			var oObj = aPropLists[i];
			if (!oObj) { continue; }

			var oProps = aPropLists[i + 1];

			var sObj = fpGetString(oObj);

			for (var k in oProps) if (oProps.hasOwnProperty(k)) {
				oRet[sObj + ':' + k] = oProps[k];
			}

			// oRet[sObj] = oProps;

		}

		return oRet;

	},

	/**
		특정 진행값의 상황에서의 각 객체가 가져야 할 속성 값을 지정한다.

		@method set
		@param {Number} nFrame 진행값
		@param {Array} aPropLists 객체와 속성 목록이 번갈아 들어있는 배열

		@return {jindo.m.Keyframe}
		@chainable

		@history 1.14.0 Update 객체로 배열이나 함수를 지정하여 여러개를 동시에 지정하거나 함수의 리턴값을 사용하여 지정할 수 있도록 개선

		@example
			var keyframe = new jindo.m.Keyframe();
			...
			keyframe.set(0.0, [
				elFoo, {
					'scrollTop' : 100,
					'@left' : '200px',
					'@transform' : 'translateY(30px) rotate(30deg)'
				}
			]);
			
			keyframe.set(1.0, [
				elFoo, {
					'scrollTop' : jindo.m.Effect.bounce(100), // 특정 속성에 대해서 다른 효과로 변화하도록 지정 가능
					'@left' : '200px',
					'@transform' : 'translateY(-100px) rotate(270deg)'
				}
			]);

			keyframe.set(0.5, [
				[ elFoo, elBar ], {
					'@left' : '100px'
				}
			]);

			keyframe.set(0.5, [
				function() { return elFoo; }, {
					'@left' : '100px'
				}
			]);

			keyframe.set(0.5, [
				function() { return [ elFoo, elBar ]; }, {
					'@left' : '100px'
				}
			]);
	**/
	/**
		특정 객체가 각 진행값의 상황에서의 가져야 할 속성 값을 지정한다.

		@method set
		@param {HTMLElement} elObj 객체
		@param {Object} oProps 객체가 각 상황에서 가져야 할 속성들

		@return {jindo.m.Keyframe}
		@chainable

		@example
			keyframe.set(jindo.$('cover'), { // Case #1
				'@background-color' : {
					0.0 : '#444',
					1.0 : '#aaa'
				},
				'scrollTop' : {
					0.0 : 30,
					0.5 : 50,
					1.0 : 200
				}
			});

			keyframe.set(jindo.$('cover'), { // Case #2
				0.0 : {
					'@background-color' : '#444',
					'scrollTop' : 30
				},
				0.5 : {
					'scrollTop' : 50
				},
				1.0 : {
					'@background-color' : '#aaa',
					'scrollTop' : 200
				}
			});
	**/	
	set : function(nFrame, aPropLists) {

		if (typeof nFrame === 'number') {

			this._aKeyframeLists.push({ frame : nFrame, propLists : aPropLists });
			this._oPreprocessed = null;
			this._bPreprocessed = false;
			this._nCurIdx = null;

			return this;

		}

		var elObj = nFrame;
		var oProps = aPropLists;

		var oEachRate = {};
		var caseNum = null;

		var sPropsName;

		for (var sMainKey in oProps) if (oProps.hasOwnProperty(sMainKey)) {

			caseNum = caseNum || (isNaN(sMainKey) ? 1 : 2);

			var oLists = oProps[sMainKey];
			for (var sSubKey in oLists) if (oLists.hasOwnProperty(sSubKey)) {

				nFrame = caseNum === 1 ? sSubKey : sMainKey;
				sPropsName = caseNum === 1 ? sMainKey : sSubKey;

				oEachRate[nFrame] = oEachRate[nFrame] || {};
				oEachRate[nFrame][sPropsName] = oLists[sSubKey];
			}

		}

		for (var sValue in oEachRate) if (oEachRate.hasOwnProperty(sValue)) {
			nFrame = sValue*1;
			this.set(nFrame, [ elObj, oEachRate[sValue] ]);
		}		

		return this;

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
	_getTransformFunction : function(fEffect) {

		var sKey;

		var vDepa = fEffect.start;
		var vDest = fEffect.end;

		// 시작값과 종료값을 각각 파싱
		var oDepa = this._parseTransformText(vDepa);
		var oDest = this._parseTransformText(vDest);

		var oProp = {};

		// 시작값에 있는 내용으로 속성들 셋팅
		for (sKey in oDepa) if (oDepa.hasOwnProperty(sKey)) {
			// 시작값, 종료값 셋팅 (만약 종료값이 지정되어 있지 않으면 1 또는 0 셋팅)
			oProp[sKey] = [ oDepa[sKey], oDest[sKey] || (/^scale/.test(sKey) ? 1 : 0) ];
		}

		// 종료값에 있는 내용으로 속성들 셋팅
		for (sKey in oDest) if (oDest.hasOwnProperty(sKey) && !(sKey in oDepa)) { // 이미 셋팅되어 있지 않는 경우에만
			// 시작값, 종료값 셋팅 (만약 시작값이 지정되어 있지 않으면 1 또는 0 셋팅)
			oProp[sKey] = [ oDepa[sKey] || (/^scale/.test(sKey) ? 1 : 0), oDest[sKey] ];
		}

		// Effect 함수를 대체 할 함수 만듬
		var fpFunc = function(nValue) {

			var aRet = [];
			var aBackup = [ fEffect.start, fEffect.end ];

			// 각 속성마다 루프를 돌아 계산함
			for (var sKey in oProp) if (oProp.hasOwnProperty(sKey)) {

				fEffect.start = oProp[sKey][0];
				fEffect.end = oProp[sKey][1];

				aRet.push(sKey + '(' + fEffect(nValue) + ')');
			}

			fEffect.start = aBackup[0];
			fEffect.end = aBackup[1];

			// 계산 결과 반환
			return aRet.join(' ');

		};

		fpFunc.start = vDepa;
		fpFunc.end = vDest;

		return fpFunc;

	}

}).extend(jindo.m.Component);
