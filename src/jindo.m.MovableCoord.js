/**
	터치에 따라 가속도와 튕김효과가 적용되어 움직이는 좌표를 관리하는 컴포넌트

	@author hooriza
	@version #__VERSION__#

	@class jindo.m.MovableCoord
	@extends jindo.m.Component
	@uses jindo.m.Touch, jindo.m.Effect

	@keyword Touch, 가속도
	@group Component

	@history 1.14.0 Release 최초 릴리즈
**/
jindo.m.MovableCoord = jindo.$Class({

	/**
		컴포넌트 생성자

		@constructor

		@param {Array} aPos 초기 좌표값
		@param {Object} [oOptions] 옵션
			@param {Number} [oOptions.nDeceleration=0.0006] 감속도
			@param {Array} [oOptions.aMin=[0,0]] 가능한 좌표의 최저값
			@param {Array} [oOptions.aMax=[100,100]] 가능한 좌표의 최대값
			@param {Array} [oOptions.aBounce=[10,10,10,10]] 튕기는 좌표 간격 (순서대로 상, 우, 하, 좌를 뜻함)
			@param {Array} [oOptions.aMargin=[10,10,10,10]] 사용자가 붙잡고 이동 할 수 있는 최대 좌표 간격 (순서대로 상, 우, 하, 좌를 뜻함)
			@param {Array} [oOptions.aCircular=[false,false,false,false]] 좌표값이 해당 방향을 넘어갔을 때 반대편으로 이동하게 할지 여부 (순서대로 상, 우, 하, 좌를 뜻함)
	**/
	$init : function(aPos, oOptions) {

		var self = this;

		// 엘리먼트에 Touch 컴퍼넌트 객체를 할당하기 위해 사용되는 키값
		this._sRandKey = '__MOVABLECOORD_' + Math.round(Math.random() * new Date().getTime());

		this._aPos = aPos || [ 0, 0 ];

		// 기본 옵션 설정
		this.option({
			nDeceleration : 0.0006,
			aMin : [ 0, 0 ],
			aMax : [ 100, 100 ],
			aBounce : [ 10, 10, 10, 10 ],
			aMargin : [ 0, 0, 0, 0 ],
			aCircular : [ false, false, false, false ]
		});

		this.option(oOptions || {});

		this._subOptions = { _htOption:{ _htSetter:{} } };

		// 최초 좌표의 위치를 change 이벤트를 통해 알려줌
		setTimeout(function() {
			/**
				포인트의 좌표가 변경 될 때 발생

				@event change
				@param {Array} aPos 좌표
					@param {Number} aPos.0 가로 좌표
					@param {Number} aPos.1 세로 좌표
				@param {Boolean} bHolding 터치로 붙잡고 있을 때 발생하는 이벤트이면 true, 아니면 false
			**/
			self.fireEvent('change', {
				aPos : [self._aPos[0], self._aPos[1]],
				bHolding : false
			});
		}, 0);

	},

	// 애니메이션 중인 좌표의 위치를 멈춰야 할때 호출
	_grab : function() {

		var pos = this._aPos;

		var animating = this._oAnimating;

		// 애니메이션 되고 있는 도중에 붙잡은 경우
		if (animating) {
			this._frame(animating, pos);
			this._oAnimating = null;
			this._oRaf && cancelAnimationFrame(this._oRaf);
			this._oRaf = null;
		}

	},

	/**
		좌표값 변경

		@method setTo

		@param {Number} nX 가로 좌표
		@param {Number} nY 세로 좌표
		@param {Boolean} [bAnimation=false] 움직이는 효과를 주려면 true

		@return {this}
	**/
	/**
		좌표값 변경

		@method setTo

		@param {Number} nX 가로 좌표
		@param {Number} nY 세로 좌표
		@param {Number} nMaximumDuration 움직이는 효과의 최대 시간(ms), 0 일경우 움직이는 효과 없음

		@return {this}
	**/
	setTo : function(nX, nY, nMaximumDuration) {
		var self = this;

		// 처음에는 애니메이션 적용 유/무를 true/false 로 받았다가 나중에 바뀌게 되어서 하위호환성 유지를 위한 코드
		if (nMaximumDuration === true) {
			nMaximumDuration = Infinity;
		}

		// 움직이고 있는게 있으면 일단 멈춤
		this._grab();

		var min = this.option('aMin');
		var max = this.option('aMax');
		var circular = this.option('aCircular');

		var pos = [this._aPos[0],this._aPos[1]];

		// 애니메이션을 해야하는 상황이면
		if (nMaximumDuration) {

			if (nX !== null) { pos[0] = nX; } // 가로위치가 바뀌어야 하면
			if (nY !== null) { pos[1] = nY; } // 세로위치가 바뀌어야 하면

			// _move(pos, bBy, bBounce, nMaximumDuration)
			this._move(pos, false, nMaximumDuration);

		} else {

			// aCircular 옵션 상태에 따라 최대값/최소값을 적용시킴

			if (nX !== null) { // 가로위치가 바뀌어야 하면
				if (!circular[3]) { nX = Math.max(min[0], nX); }
				if (!circular[1]) { nX = Math.min(max[0], nX); }
			}
			if (nY !== null) { // 세로위치가 바뀌어야 하면
				if (!circular[0]) { nY = Math.max(min[1], nY); }
				if (!circular[2]) { nY = Math.min(max[1], nY); }
			}

			// 삐져나간 좌표값 보정
			var adjusted = this._adjustCircularPos([ nX, nY ], min, max, circular);

			if (nX !== null) { pos[0] = adjusted[0]; } // 가로위치가 바뀌어야 하면
			if (nY !== null) { pos[1] = adjusted[1]; } // 세로위치가 바뀌어야 하면
            this._aPos = pos;
			self.fireEvent('change', {
				aPos : [pos[0],pos[1]],
				bHolding : false
			});
		}

		return this;
	},

	/**
		상대적인 위치로 좌표값 변경

		@method setBy

		@param {Number} nX 가로 상대좌표
		@param {Number} nY 세로 상대좌표
		@param {Boolean} [bAnimation=false] 움직이는 효과를 주려면 true

		@return {this}
	**/
	/**
		상대적인 위치로 좌표값 변경

		@method setBy

		@param {Number} nX 가로 상대좌표
		@param {Number} nY 세로 상대좌표
		@param {Number} nMaximumDuration 움직이는 효과의 최대 시간(ms), 0 일경우 움직이는 효과 없음

		@return {this}
	**/
	setBy : function(nXby, nYby, nMaximumDuration) {
		return this.setTo(
			nXby !== null ? this._aPos[0] + nXby : null,
			nYby !== null ? this._aPos[1] + nYby : null,
			nMaximumDuration
		);
	},

	/**
		현재 좌표값 얻기

		@method get
		@return {Array} 좌표값 [가로, 세로]
	**/
	get : function() {
		return [this._aPos[0],this._aPos[1]];
	},

	/**
		터치에 따라 좌표값을 변화 시킬 수 있는 엘리먼트 지정

		@method bind

		@param {Element} elEl 터치 이벤트를 등록 할 엘리먼트
		@param {Object} [oSubOptions] 옵션
			@param {Number} [oSubOptions.nDirection=1|2|4|8|16] 움직일 수 있는 방향 (bit OR 연산을 통해 조합가능)
				@param {Number} oSubOptions.nDirection.1 가로로 움직이기 시작하면 가로로만 움직일 수 있음
				@param {Number} oSubOptions.nDirection.2 가로로 움직이기 시작하면 모든 방향으로 움직일 수 있음 (1과 함께 사용)
				@param {Number} oSubOptions.nDirection.4 세로로 움직이기 시작하면 세로로만 움직일 수 있음
				@param {Number} oSubOptions.nDirection.8 세로로 움직이기 시작하면 모든 방향으로 움직일 수 있음 (4와 함께 사용)
				@param {Number} oSubOptions.nDirection.16 대각선으로 움직이기 시작하면 모든 방향으로 움직일 수 있음
			@param {Array} [oSubOptions.aScale=[1,1]] 이동 배율 [가로, 세로]
			@param {Number} [oSubOptions.nMaximumSpeed=Infinity] 최대 좌표 변화 속도 (px/ms)
		@return {this}
	**/
	bind : function(elEl, oSubOptions) {

		var self = this;

		var sRandKey = this._sRandKey;
		elEl = elEl instanceof jindo.$Element ? elEl.$value() : elEl;

		// 옵션 기본값
		var subOptions = {
			nDirection : 1|2|4|8|16,
			aScale : [ 1, 1 ],
			nMaximumSpeed : Infinity
		};

		if (oSubOptions) {
			for (var k in oSubOptions) if (oSubOptions.hasOwnProperty(k)) {
				subOptions[k] = oSubOptions[k];
			}
		}

		if (elEl[sRandKey]) {
			this.unbind(elEl);
		}

		// Touch 컴퍼넌트에 맞는 옵션으로 변환
		var nUseDiagonal = (
			subOptions.nDirection & 16 ? 2 : (
				((subOptions.nDirection & 2) || (subOptions.nDirection & 8)) ? 1 : 0
			)
		);

		var bVertical = (subOptions.nDirection & 4) || (subOptions.nDirection & 8);
		var bHorizental = (subOptions.nDirection & 1) || (subOptions.nDirection & 2);

		elEl[sRandKey] = new jindo.m.Touch(elEl, {
			nDeceleration : this.option('nDeceleration'),
			nUseDiagonal : nUseDiagonal, // subOptions.nUseDiagonal,
			nMoveThreshold : 0,
			nSlopeThreshold : 5,
			nTapThreshold  : 1,
			bHorizental : !!bHorizental, // subOptions.bHorizontal,
			bVertical : !!bVertical // subOptions.bVertical
		}).attach({
			touchStart : function(oCustomEvent) {
				// 서로 다른 Touch 객체가 실행 될 때마다 _subOptions 변수를 다시 셋팅해줌
				self._subOptions = subOptions;
				self._touchStart(oCustomEvent);
			},
			touchMove : function(oCustomEvent) { self._touchMove(oCustomEvent); },
			touchEnd : function(oCustomEvent) { self._touchEnd(oCustomEvent); }
		});

		return this;

	},

	/**
		터치에 따라 좌표값을 변화 시킬 수 있도록한 엘리먼트의 해제

		@method unbind

		@param {Element} elEl 터치 이벤트를 등록 한 엘리먼트
		@return {this}
	**/
	unbind : function(elEl) {

		var sRandKey = this._sRandKey;
		elEl = elEl instanceof jindo.$Element ? elEl.$value() : elEl;

		if (elEl[sRandKey]) {
			elEl[sRandKey].deactivate();
			elEl[sRandKey] = null;
		}

		return this;
	},

	// 터치가 시작되었을때
	_touchStart : function(oCustomEvent) {

		var pos = this._aPos;
		var min = this.option('aMin');
		var max = this.option('aMax');

		// 움직이고 있는게 있으면 일단 멈춤
		this._grab();

		/**
			터치 영역을 눌렀을 때 발생

			@event hold
			@param {Array} aPos 좌표
				@param {Number} aPos.0 가로 좌표
				@param {Number} aPos.1 세로 좌표
		**/
		this.fireEvent('hold', { oEvent : oCustomEvent.oEvent, aPos : [pos[0], pos[1]] });

		this._bGrapOutside = pos[0] < min[0] || pos[1] < min[1] || pos[0] > max[0] || pos[1] > max[1];
		this._aMovingPos = [pos[0], pos[1]];

		this._aDirFilter = null;

	},

	// 좌표 영역을 넘어서서 땡겼을때 적용되는 효과 캐싱
	_easeOutQuint : jindo.m.Effect.easeOutQuint(0, 1),

	// aCircular 옵션을 사용한 경우 이를 반영하여 삐져나간 좌표값을 바꿔줌
	_adjustCircularPos : function(pos, min, max, circular) {

		min = min || this.option('aMin');
		max = max || this.option('aMax');
		circular = circular || this.option('aCircular');

		// aCircular 옵션 있을 때 삐져나갔으면
		if (circular[0] && pos[1] < min[1]) { // 위
			pos[1] = (pos[1] - min[1]) % (max[1] - min[1] + 1) + max[1];
		}

		if (circular[1] && pos[0] > max[0]) { // 오른쪽
			pos[0] = (pos[0] - min[0]) % (max[0] - min[0] + 1) + min[0];
		}

		if (circular[2] && pos[1] > max[1]) { // 아래
			pos[1] = (pos[1] - min[1]) % (max[1] - min[1] + 1) + min[1];
		}

		if (circular[3] && pos[0] < min[0]) { // 왼쪽
			pos[0] = (pos[0] - min[0]) % (max[0] - min[0] + 1) + max[0];
		}

		return pos;

	},

	// 터치 후 이동 할 때
	_touchMove : function(oCustomEvent) {

		// var _ = new Date();

		if (oCustomEvent.sMoveType === 'tap' || !oCustomEvent.sMoveTypeAgree) { return; }
		if (!this._aMovingPos) { return; }

		var pos = this._aPos;
		var movingPos = this._aMovingPos;

		var min = this.option('aMin');
		var max = this.option('aMax');
		var bounce = this.option('aBounce');
		var margin = this.option('aMargin');

		var direction = this._subOptions.nDirection;
		var scale = this._subOptions.aScale;

		var easeOutQuint = this._easeOutQuint; // top
		var mul = easeOutQuint(0.001) / 0.001; // 5/*easeOutQuint*/ * (1.5 || 1);

		// Math.min/Math.max 보다 빠른 속도를 위한 임시 변수
		var tv, tn, tx;

		// 이후에 움직일수 있는 방향을 제한하기 위한 변수
		var aDirFilter = this._aDirFilter;

		if (!aDirFilter) { // touchstart 이후 처음 움직인거면
			aDirFilter = this._aDirFilter = [ false, false ];

			// 처음 이동한 방향에 따른 분기
			switch (oCustomEvent.sStartMoveType) {
			case 'hScroll':
				aDirFilter[0] = direction & 1;
				aDirFilter[1] = direction & 2;
				break;
			case 'vScroll':
				aDirFilter[1] = direction & 4;
				aDirFilter[0] = direction & 8;
				break;
			case 'dScroll':
				aDirFilter[0] = aDirFilter[1] = direction & 16;
				break;
			}
		}

		// 가로로 움직일 수 있으면
		if (aDirFilter[0]) { movingPos[0] += oCustomEvent.nVectorX * scale[0]; }

		// 세로로 움직일 수 있으면
		if (aDirFilter[1]) { movingPos[1] += oCustomEvent.nVectorY * scale[1]; }

		pos[0] = movingPos[0], pos[1] = movingPos[1];
		pos = this._adjustCircularPos(pos, min, max);

		// 밖에서 붙잡았는데 안으로 들어온 경우 flag 변경
		if (this._bGrapOutside && pos[0] >= min[0] && pos[0] <= max[0] && pos[1] >= min[1] && pos[1] <= max[1]) {
			this._bGrapOutside = false;
		}

		var mb0 = margin[0] + bounce[0];
		var mb1 = margin[1] + bounce[1];
		var mb2 = margin[2] + bounce[2];
		var mb3 = margin[3] + bounce[3];

		// 밖에서 붙잡은 경우 그냥 이동
		if (this._bGrapOutside) {

			tn = min[0]-mb3, tx = max[0]+mb1, tv = pos[0];
			pos[0] = tv>tx?tx:(tv<tn?tn:tv);

			tn = min[1]-mb0, tx = max[1]+mb2, tv = pos[1];
			pos[1] = tv>tx?tx:(tv<tn?tn:tv);

		// 안에서 붙잡은 경우 삐져나간 비율에 맞추어 이동
		} else {

			if (pos[1] < min[1]) { // 위로 삐져나옴
				tv = (min[1]-pos[1])/(mb0*mul);
				pos[1] = min[1]-easeOutQuint(tv>1?1:tv)*mb0;
			} else if (pos[1] > max[1]) { // 아래로 삐져나옴
				tv = (pos[1]-max[1])/(mb2*mul);
				pos[1] = max[1]+easeOutQuint(tv>1?1:tv)*mb2;
			}

			if (pos[0] < min[0]) { // 왼쪽으로 삐져나옴
				tv = (min[0]-pos[0])/(mb3*mul);
				pos[0] = min[0]-easeOutQuint(tv>1?1:tv)*mb3;
			} else if (pos[0] > max[0]) { // 오른쪽으로 삐져나옴
				tv = (pos[0]-max[0])/(mb1*mul);
				pos[0] = max[0]+easeOutQuint(tv>1?1:tv)*mb1;
			}

		}

		this.fireEvent('change', {
			aPos : pos,
			bHolding : true
		});

		oCustomEvent.oEvent.stopDefault();

	},

	// 터치를 떼었을 때
	_touchEnd : function(oCustomEvent) {

		var self = this;

		if (!this._aMovingPos) { return; }

		var pos = this._aPos;
		var bounce = this.option('aBounce');
		var maximumSpeed = this._subOptions.nMaximumSpeed;
		var scale = this._subOptions.aScale;

		var htMomentum = oCustomEvent.htMomentum;

		var aDirFilter = this._aDirFilter || [ false, false ];

		// 가로로 움직일 수 없으면 가로 속도 0
		if (!aDirFilter[0]) { htMomentum.nSpeedX = 0; }

		// 세로로 움직일 수 없으면 세로 속도 0
		if (!aDirFilter[1]) { htMomentum.nSpeedY = 0; }

		// 속도로 따져봤을 때 현재 좌표에서 얼마나 떨어진 곳으로 이동해야 하는지 계산
		var relPos = this._getRelPosFromSpeed([
			htMomentum.nSpeedX * (htMomentum.nDistanceX < 0 ? -1 : 1) * scale[0],
			htMomentum.nSpeedY * (htMomentum.nDistanceY < 0 ? -1 : 1) * scale[1]
		], maximumSpeed);

		// 마우스 가속도로 인해 이동함
		this._move(relPos, true, Infinity);

		this._aMovingPos = null;
		this._aDirFilter = null;

	},

	/**
		좌표 위치를 이동
		@param {Array} pos 원하는 좌표 위치
		@param {Boolean} bBy pos 의 값이 상대적인 좌표값인지(true), 절대적인 좌표값인지(false)
		@param {Number} nMaximumDuration 최대 이동 속도
	**/
	_move : function(pos, bBy, nMaximumDuration) {

		var self = this;

		// 마우스 가속도로 인해 이동함
		// (relPos, callback, isBounce, nMaximumDuration)
		this[bBy ? '_animateBy' : '_animateTo'](pos, function() {

			// 영역 밖으로 나간상태라서 튕겨나옴
			var expectPos = [];
			var pos = self._aPos;

			var min = self.option('aMin');
			var max = self.option('aMax');

			expectPos[0] = Math.min(max[0], Math.max(min[0], pos[0]));
			expectPos[1] = Math.min(max[1], Math.max(min[1], pos[1]));

			// 튕겨서 되돌아 오도록
			self._animateTo(expectPos, function() {

				/**
					애니메이션이 끝났을 때 발생함.
					@event animationEnd
				**/
				self.fireEvent('animationEnd');
			}, true, nMaximumDuration);

		}, false, nMaximumDuration);

	},

	/**
		속도로 상대적인 위치 구하기
		@param {Array} speeds 시작 속도 (px/ms)
		@param {Number} maximumSpeed 최대 속도 (px/ms)
		@return {Array} 상대적인 위치
	*/
	_getRelPosFromSpeed : function(speeds, maximumSpeed) {
		var acceleration = -this.option('nDeceleration');

		var normalSpeed = Math.min(maximumSpeed || Infinity, Math.sqrt(speeds[0]*speeds[0]+speeds[1]*speeds[1]));
		var duration = Math.abs(normalSpeed / acceleration);

		return [
			speeds[0]/2 * duration,
			speeds[1]/2 * duration
		];
	},

	/**
		상대적인 위치로 duration 구하기
		@param {Array} relPos 상대적인 위치
		@return {Number} duration (ms)
	*/
	_getDurationFromRelPos : function(relPos) {
		var acceleration = this.option('nDeceleration');
		var normalPos = Math.sqrt(relPos[0]*relPos[0]+relPos[1]*relPos[1]);

		return Math.sqrt(normalPos / acceleration * 2);
	},

	// 시작좌표(depaPos)에서 종료좌표(destPos)로 향할 때 지정한 네모 영역(boxLT, boxRB)과 접하면 그 접점을 반환
	_getPointOfIntersection : function(depaPos, destPos, boxLT, boxRB, circular) {

		destPos = [destPos[0], destPos[1]];
		var xd = destPos[0]-depaPos[0], yd = destPos[1]-depaPos[1];

		if (!circular[3]) { destPos[0] = Math.max(boxLT[0], destPos[0]); } // 왼쪽
		if (!circular[1]) { destPos[0] = Math.min(boxRB[0], destPos[0]); } // 오른쪽
		// destPos[0] = Math.max(boxLT[0], Math.min(boxRB[0], destPos[0]));
		destPos[1] = xd ? depaPos[1]+yd/xd*(destPos[0]-depaPos[0]) : destPos[1];

		if (!circular[0]) { destPos[1] = Math.max(boxLT[1], destPos[1]); } // 위
		if (!circular[2]) { destPos[1] = Math.min(boxRB[1], destPos[1]); } // 아래
		// destPos[1] = Math.max(boxLT[1], Math.min(boxRB[1], destPos[1]));
		destPos[0] = yd ? depaPos[0]+xd/yd*(destPos[1]-depaPos[1]) : destPos[0];

		// destPos[0] = Math.round(destPos[0]);
		// destPos[1] = Math.round(destPos[1]);

		return destPos;

	},

	/**
		애니메이션 진행 (상대적인 위치)

		@param {Array} relPos 상대적인 위치
		@param {Function} callback 애니메이션이 끝났을때 호출되는 하뭇
		@param {Boolean} isBounce 튕기는것 땜에 움직이는 경우
		@param {Number} nMaximumDuration 최대 Duration 값 (ms)
	*/
	_animateBy : function(relPos, callback, isBounce, nMaximumDuration) {

		var pos = this._aPos;

		return this._animateTo([
			pos[0] + relPos[0],
			pos[1] + relPos[1]
		], callback, isBounce, nMaximumDuration);

	},

	/**
		애니메이션 진행 (절대적인 위치)

		@param {Array} absPos 절대적인 위치
		@param {Function} callback 애니메이션이 끝났을때 호출되는 하뭇
		@param {Boolean} isBounce 튕기는것 땜에 움직이는 경우
		@param {Number} nMaximumDuration 최대 Duration 값 (ms)
	*/
	_animateTo : function(absPos, callback, isBounce, nMaximumDuration) {

		var self = this;
		var pos = this._aPos;

		var circular, bounce, margin, min, max;
		var destPos = [ absPos[0], absPos[1] ];

		circular = this.option('aCircular'); // 순환 방향 (상[0], 우[1], 하[2], 좌[3])

		bounce = this.option('aBounce'); // 튕기는 영역 (상[0], 우[1], 하[2], 좌[3])
		margin = this.option('aMargin'); // 튕기는 영역 (상[0], 우[1], 하[2], 좌[3])
		min = this.option('aMin');
		max = this.option('aMax');

		// margin 영역 밖으로 나가지 않도록 제한
		destPos = this._getPointOfIntersection(pos, destPos, [
			min[0]-bounce[3], min[1]-bounce[0]
		], [
			max[0]+bounce[1], max[1]+bounce[2]
		], circular);

		var oParam = {
			aDepaPos : [pos[0],pos[1]],
			aDestPos : destPos,
			bBounce : isBounce
		};

		// 튕기는 것땜에 움직이는 상황이 아니면
		if (!isBounce && this._aDirFilter) {
			/**
				터치 영역을 놓았을 때 발생

				@event release
				@param {Array} aDepaPos 현재 좌표
					@param {Array} aDepaPos.0 가로 좌표
					@param {Array} aDepaPos.1 세로 좌표

				@param {Array} aDestPos 바뀌어야 할 좌표
					@param {Array} aDestPos.0 가로 좌표
					@param {Array} aDestPos.1 세로 좌표
			**/
			this.fireEvent('release', oParam);
		}

		// release 이벤트 핸들러 안에서 값이 바뀌었을 수 도 있으므로 다시 값 구함
		bounce = this.option('aBounce'); // 튕기는 영역 (상[0], 우[1], 하[2], 좌[3])
		margin = this.option('aMargin'); // 튕기는 영역 (상[0], 우[1], 하[2], 좌[3])
		min = this.option('aMin');
		max = this.option('aMax');

		destPos = oParam.aDestPos;

		// 순환하여 움직이는 애니메이션인지
		var bCircular = (
			(circular[0] && destPos[1] < min[1]) ||
			(circular[1] && destPos[0] > max[0]) ||
			(circular[2] && destPos[1] > max[1]) ||
			(circular[3] && destPos[0] < min[0])
		);

		// 밖에서 밖으로 움직이는거면 움직이지 않음
		if (
			(pos[0] < min[0] || pos[0] > max[0] || pos[1] < min[1] || pos[1] > max[1]) &&
			(destPos[0] < min[0] || destPos[0] > max[0] || destPos[1] < min[1] || destPos[1] > max[1])
		) {
			destPos = pos;
		}

		// 상대적인 위치 얻기
		var relPos = [ Math.abs(destPos[0]-pos[0]), Math.abs(destPos[1]-pos[1]) ];
		var duration = Math.min(nMaximumDuration, this._getDurationFromRelPos(relPos));

		// duration 이 10ms 미만이면 그냥 애니메이션 안함
		if (duration < 10) { duration = 0; }

		// console.log('duration : ', duration);

		// 애니메이션이 끝났을 때 호출되어야 하는 함수
		var done = function() {
			self._oAnimating = null;

			// 내부 좌표값 변경
			pos[0] = Math.round(destPos[0]);
			pos[1] = Math.round(destPos[1]);
			pos = self._adjustCircularPos(pos, min, max, circular);

			callback && callback();
		};

		// duration 이 0 이면 바로 끝내기
		if (!duration) { return done(); }

		// animation 이벤트를 발생시키기 위한 객체 꾸리기
		oParam = {
			nDuration : duration,
			fEffect : jindo.m.Effect.cubicBezier(0.18, 0.35, 0.56, 1),
			aDepaPos : [pos[0],pos[1]],
			aDestPos : destPos,
			bBounce : isBounce,
			bCircular : bCircular,
			fDone : done
		};

		/**
			애니메이션 시작 직전에 발생함.
			이벤트를 stop 시키면 애니메이션 효과를 직접 구현해야 하며, 애니메이션이 끝났을 경우 fDone 메서드를 호출해야함.

			@event animation
			@stoppable

			@param {Number} nDuration 애니메이션 진행 시간 (ms)
			@param {Function} fEffect 애니메이션 효과 함수

			@param {Array} aDepaPos 시작 좌표
				@param {Number} aDepaPos.0 가로 좌표
				@param {Number} aDepaPos.1 세로 좌표

			@param {Array} aDestPos 종료 좌표
				@param {Number} aDestPos.0 가로 좌표
				@param {Number} aDestPos.1 세로 좌표

			@param {Boolean} bBounce 튕겨서 움직이는 애니메이션이면 true
			@param {Boolean} bCircular 순환하여 움직여야 하는 애니메이션이면 true (이 값이 true 일 경우 애니메이션을 커스터마이징하기 위해서 이벤트를 stop 하는 것이 불가능하다)
			@param {Function} fDone 이벤트를 stop 한 경우에만 사용되며, 애니메이션이 끝났다는 걸 알려주기 위해 호출하는 함수
		**/
		var retFire = this.fireEvent('animation', oParam);

		// bCircular 가 true 인데 이벤트 stop 했으면
		if (bCircular && !retFire) {
			throw new Error("You can't stop the 'animation' event when 'bCircular' is true.");
		}

		oParam.aDepaPos = pos;
		oParam.nStartTime = new Date().getTime();

		this._oAnimating = oParam;

		// 컴퍼넌트에서 제공하는 기본 RAF 애니메이션을 사용하는 경우 (animation 이벤트를 stop 안 한 경우)
		if (retFire === true) {

			var animating = this._oAnimating;

			(function loop() {
				self._oRaf = null;
				if (self._frame(animating) >= 1) { return done(); } // 애니메이션 끝
				self._oRaf = requestAnimationFrame(loop);
			})();

		}

	},

	/*
		animation 객체에 담긴 정보를 사용해서
		해당 상태의 좌표를 얻어내고 얻어낸 좌표를 pos 변수에 저장

		animation
			.nStartTime : 애니메이션 시작 시점 (timestamp)
			.aDepaPos : 애니메이션 시작 시점의 좌표값
			.aDestPos : 애니메이션 종료 시점의 좌표값
			.fEffect : 애니메이션에 사용되는 Effect 함수
			.nDuration : 애니메이션 지속 시간
	*/
	_frame : function(animating, pos) {

		// 시간이 얼마나 흘렀는지 구하기
		var per = Math.min(1, (new Date() - animating.nStartTime) / animating.nDuration);
		pos = pos || [];

		// 시간이 얼마나 흘렀는지에 따른 위치 구하기
		pos[0] = animating.fEffect(animating.aDepaPos[0], animating.aDestPos[0])(per)*1;
		pos[1] = animating.fEffect(animating.aDepaPos[1], animating.aDestPos[1])(per)*1;

		// aCircular 옵션을 사용한 경우 이를 반영
		pos = this._adjustCircularPos(pos);

		this.fireEvent('change', {
			aPos : pos,
			bHolding : false
		});

		// 얼마나 진행됐는지 반환
		return per;

	}

}).extend(jindo.m.Component);
