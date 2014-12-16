/**
	@version #__VERSION__#
**/

/*
	TERMS OF USE - EASING EQUATIONS
	Open source under the BSD License.
	Copyright (c) 2001 Robert Penner, all rights reserved.
**/

/**
	수치의 중간 값을 쉽게 얻을 수 있게 하는 static 컴포넌트
	새로운 이펙트 함수를 생성한다.
	
	@class jindo.m.Effect
	@group Component	
	@uses jindo.m  
	@static
	@param {Function} fEffect 0~1 사이의 숫자를 인자로 받아 정해진 공식에 따라 0~1 사이의 값을 리턴하는 함수
	@return {Function} 이펙트 함수. 이 함수는 시작 값과 종료 값을 입력하여 특정 시점에 해당하는 값을 구하는 타이밍 함수를 생성한다.
	
	@keyword effect, 효과, animation, 애니메이션

	@history 1.14.0 New CSS 타이밍함수로 바뀔 수 있는 Effect 함수에 toString 구현
	@history 1.10.0 New Effect 함수 내에 start, end 프로퍼티 추가
	@history 1.10.0 Update 입력값이 0일 경우, 단위에 상관없이 처리하도록 수정
	@history 1.9.0 Release 최초 릴리즈
**/
jindo.m.Effect = function(fEffect) {
	if (this instanceof arguments.callee) {
		throw new Error("You can't create a instance of this");
	}
	
	// Effect 함수에서 허용하는 시작값/종료값의 정규식들
	var rxNumber = /^(\-?[0-9\.]+)(%|\w+)?$/, // 숫자와 단위(%,px,em 등)
		rxRGB = /^rgb\(([0-9]+)\s?,\s?([0-9]+)\s?,\s?([0-9]+)\)$/i, // rgb(R,G,B)
		rxRGBA = /^rgba\(([0-9]+)\s?,\s?([0-9]+)\s?,\s?([0-9]+),\s?([0-9\.]+)\)$/i, // rgba(R,G,B,alpha)
		rxHSL = /^hsl\(([0-9\.]+)\s?,\s?([0-9\.]+)%\s?,\s?([0-9\.]+)%\)$/i, // hsl(H,S,L)
		rxHSLA = /^hsla\(([0-9\.]+)\s?,\s?([0-9\.]+)%\s?,\s?([0-9\.]+)%,\s?([0-9\.]+)\)$/i, // hsla(H,S,L,alpha)
		rxHex = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i, // #FFFFFF
		rx3to6 = /^#([0-9A-F])([0-9A-F])([0-9A-F])$/i; // #FFF
	
	// 값을 숫자와 단위로 구분한 객체로 전환
	var getUnitAndValue = function(v) {
		var nValue = v, sUnit;
		
		if (rxNumber.test(v)) { // 숫자와 단위로 구성된 경우
			nValue = parseFloat(v); 
			sUnit = RegExp.$2 || "";
		} else if (rxRGB.test(v)) { // RGB 값인 경우
			nValue = {rgb:[parseInt(RegExp.$1, 10), parseInt(RegExp.$2, 10), parseInt(RegExp.$3, 10), 1]};
			sUnit = 'color';
		} else if (rxRGBA.test(v)) { // RGBA 값인 경우
			nValue = {rgb:[parseInt(RegExp.$1, 10), parseInt(RegExp.$2, 10), parseInt(RegExp.$3, 10), parseFloat(RegExp.$4)]};
			sUnit = 'color';
		} else if (rxHSL.test(v)) { // HSL 값인 경우
			nValue = {hsl:[parseFloat(RegExp.$1), parseFloat(RegExp.$2)/100, parseFloat(RegExp.$3)/100, 1]};
			nValue.rgb = hsl2rgb.apply(this, nValue.hsl); // RGB 값으로 변환한 값도 함께 저장
			sUnit = 'color';
		} else if (rxHSLA.test(v)) { // HSLA 값인 경우
			nValue = {hsl:[parseFloat(RegExp.$1), parseFloat(RegExp.$2)/100, parseFloat(RegExp.$3)/100, parseFloat(RegExp.$4)]};
			nValue.rgb = hsl2rgb.apply(this, nValue.hsl); // RGB 값으로 변환한 값도 함께 저장
			sUnit = 'color';
		} else if (rxHex.test(v = v.replace(rx3to6, '#$1$1$2$2$3$3'))) { // #색상 값인 경우
			nValue = {rgb:[parseInt(RegExp.$1, 16), parseInt(RegExp.$2, 16), parseInt(RegExp.$3, 16), 1]};
			sUnit = 'color';
		} else {
			throw new Error('unit error (' + v + ')');
		}
				
		return { 
			nValue : nValue, 
			sUnit : sUnit 
		};
	};

	// 여러개의 값이 합쳐져 있는 형태를 빈칸으로 기준으로 배열로 분리
	// fExplode('20px 30px 40px') -> [ '20px', '30px', '40px' ]
	// fExplode('20px rgb(255, 0, 0) #fff') -> [ '20px', 'rgb(255, 0, 0)', '#fff' ]
	var fExplode = function(sStr) {
		var aRet = [];
		sStr.replace(/([^\s]+\([^\)]*\)|[^\s]+)\s?/g, function(_, a) { aRet.push(a); });
		return aRet;
	};

	// 여러개의 값이 합쳐져 있는 형태의 문자열을 숫자와 단위로 구분한 객체의 배열로 분리 변환
	var getUnitAndValueList = function(v) {

		var aList = fExplode(v?v+'':'0');
		var aRet = [];

		for (var i = 0, nLen = aList.length; i < nLen; i++) {
			aRet.push(getUnitAndValue(aList[i]));
		}

		return aRet;

	};

	// 처리과정에서 sUnit 값이 바뀔 수 있으므로 1단계 deep-copy
	var copy = function(oValue) {
		if (typeof oValue === 'object') {
			return { nValue : oValue.nValue, sUnit : oValue.sUnit };
		}
		return oValue;
	};

	// http://jsfiddle.net/EPWF6/9/
	var hsl2rgb = function(H, S, L, alpha) {
		H = (H % 360) / 60;

		var C = (1 - Math.abs((2 * L) - 1)) * S;
		var X = C * (1 - Math.abs((H % 2) - 1));
		var R1 = 0, G1 = 0, B1 = 0;

		if (H >= 5 || H < 1) {
			R1 = C;
			B1 = X;
		} else if (H >= 4) {
			R1 = X;
			B1 = C;
		} else if (H >= 3) {
			G1 = X;
			B1 = C;
		} else if (H >= 2) {
			G1 = C;
			B1 = X;
		} else if (H >= 1) {
			R1 = X;
			G1 = C;
		}

		var m = L - (C / 2);

		return [
			Math.round((R1 + m) * 255),
			Math.round((G1 + m) * 255),
			Math.round((B1 + m) * 255),
			alpha
		];

	};

	// 이펙트 함수
	return function(sStart, sEnd) {

		var aStart, aEnd;

		// 시작값 종료값 파싱
		var fParse = function() {

			var bChanged = false;

			// 시작값이 이전에 파싱했을때와 달라졌으면 다시 파싱
			if (fReturn.start !== sStart) {
				aStart = getUnitAndValueList(fReturn.start);
				sStart = fReturn.start;
				bChanged = true;
			}

			// 종료값이 이전에 파싱했을때와 달라졌으면 다시 파싱
			if (fReturn.end !== sEnd) {
				aEnd = getUnitAndValueList(fReturn.end);
				sEnd = fReturn.end;
				bChanged = true;
			}

			// 시작값이나 종료값이 이전에 파싱했을때와 달라졌으면
			if (bChanged) {

				var nLen = Math.max(aStart.length, aEnd.length);
				var oStart, oEnd;

				// 시작값의 갯수와 종료값의 갯수가 다르면 맞춰줌
				if (aStart.length !== aEnd.length && nLen > 1) {

					switch (aStart.length) {
					case 1: aStart[1] = copy(aStart[0]); // not break
					case 2: aStart[2] = copy(aStart[0]); // not break
					case 3: aStart[3] = copy(aStart[1]); break;
					}

					switch (aEnd.length) {
					case 1: aEnd[1] = copy(aEnd[0]); // not break
					case 2: aEnd[2] = copy(aEnd[0]); // not break
					case 3: aEnd[3] = copy(aEnd[1]); break;
					}

				}

				// 각각의 값을 확인
				for (var i = 0; i < nLen; i++) {

					oStart = aStart[i];
					oEnd = aEnd[i];

					// 어느 한쪽의 값이 0 이면 단위를 다른쪽의 단위와 동일하게 바꿔줌
					if (oStart.nValue === 0) { oStart.sUnit = oEnd.sUnit; }
					else if (oEnd.nValue === 0) { oEnd.sUnit = oStart.sUnit; }

					// 두개의 단위가 다르면 에러 발생
					if (oStart.sUnit != oEnd.sUnit) {
						throw new Error('unit error (' + sStart + ' ~ ' + sEnd + ')');
					}

				}

			}

		};

		// 0.0~1.0 사이의 인자(p)를 받는 함수
		var fReturn = function(p) {

			var aRet = [];

			fParse(); // 시작값, 종료값이 유효한지 확인

			var oStart, oEnd;
			var nStart, nEnd, sUnit;

			var alpha;

			// 시작값들과 종료값들에서 루프
			for (var i = 0, nLen = Math.max(aStart.length, aEnd.length); i < nLen; i++) {

				oStart = aStart[i];
				oEnd = aEnd[i];

				nStart = oStart.nValue;
				nEnd = oEnd.nValue;
				sUnit = oStart.sUnit;

				var nValue = fEffect(p),
					getResult = function(s, d, sUnit) {
						return Math.round(((d - s) * nValue + s) * 1000000) / 1000000 + (sUnit || 0);
					};
				
				// 숫자+단위로 된 값이면
				if (sUnit !== 'color') {
					// 중간값 목록에 추가
					aRet.push(getResult(nStart, nEnd, sUnit));
					continue;
				}

				// HSL 단위이면
				if (nStart.hsl && nEnd.hsl) {

					nStart = nStart.hsl;
					nEnd = nEnd.hsl;

					var h = Math.round(getResult(nStart[0], nEnd[0]));
					var s = Math.max(0, Math.min(1, getResult(nStart[1], nEnd[1]))) * 100;
					var l = Math.max(0, Math.min(1, getResult(nStart[2], nEnd[2]))) * 100;
					alpha = getResult(nStart[3], nEnd[3]);

					if (alpha === 1) {
						aRet.push('hsl(' + [ h, s+'%', l+'%' ].join(',') + ')');
					} else {
						aRet.push('hsla(' + [ h, s+'%', l+'%', alpha ].join(',') + ')');
					}

				// RGB 단위이면
				} else {

					nStart = nStart.rgb;
					nEnd = nEnd.rgb;

					var r = Math.max(0, Math.min(255, Math.round(getResult(nStart[0], nEnd[0]))));
					var g = Math.max(0, Math.min(255, Math.round(getResult(nStart[1], nEnd[1]))));
					var b = Math.max(0, Math.min(255, Math.round(getResult(nStart[2], nEnd[2]))));
					alpha = getResult(nStart[3], nEnd[3]);

					if (alpha === 1) {
						var dummy = ((r << 16) | (g << 8) | b).toString(16).toUpperCase();
						aRet.push('#' + Array(7 - dummy.length).join('0') + dummy);
					} else {
						aRet.push('rgba(' + [ r, g, b, alpha ].join(',') + ')');
					}

				}

			}

			// 중간값 목록을 반환
			return aRet.join(' ');

		};

		switch (arguments.length) {
		case 0: break;
		case 1:
			sEnd = sStart || '0';
			sStart = '0';
			
			fReturn.setStart = function(sStart) {
				this.start = sStart;
			}; // deprecated
			break;
		}

		fReturn.start = sStart;
		fReturn.end = sEnd;
		fReturn.effectConstructor = arguments.callee;

		sStart = sEnd = null;

		if (arguments.length > 1) {
			fParse(); // 시작값, 종료값이 유효한지 확인
		}

		return fReturn;

	};
	
};

/**
	linear 이펙트 함수
	
	@method linear
	@static
**/
jindo.m.Effect.linear = jindo.m.Effect(function(s) {
	return s;
});
jindo.m.Effect.linear.toString = function() { return 'linear'; };

/**
	easeInSine 이펙트 함수
	
	@method easeInSine
	@static
**/
jindo.m.Effect.easeInSine = jindo.m.Effect(function(s) {
	return (s == 1) ? 1 : -Math.cos(s * (Math.PI / 2)) + 1;
});
/**
	easeOutSine 이펙트 함수
	
	@method easeOutSine
	@static
**/
jindo.m.Effect.easeOutSine = jindo.m.Effect(function(s) {
	return Math.sin(s * (Math.PI / 2));
});
/**
	easeInOutSine 이펙트 함수
	
	@method easeInOutSine
	@static
**/
jindo.m.Effect.easeInOutSine = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeInSine(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOutSine(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInSine 이펙트 함수
	
	@method easeOutInSine
	@static
**/
jindo.m.Effect.easeOutInSine = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeOutSine(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeInSine(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInQuad 이펙트 함수
	
	@method easeInQuad
	@static
**/
jindo.m.Effect.easeInQuad = jindo.m.Effect(function(s) {
	return s * s;
});
/**
	easeOutQuad 이펙트 함수
	
	@method easeOutQuad
	@static
**/
jindo.m.Effect.easeOutQuad = jindo.m.Effect(function(s) {
	return -(s * (s - 2));
});
/**
	easeInOutQuad 이펙트 함수
	
	@method easeInOutQuad
	@static
**/
jindo.m.Effect.easeInOutQuad = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeInQuad(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOutQuad(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInQuad 이펙트 함수
	
	@method easeOutInQuad
	@static
**/
jindo.m.Effect.easeOutInQuad = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeOutQuad(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeInQuad(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInCubic 이펙트 함수
	
	@method easeInCubic
	@static
**/
jindo.m.Effect.easeInCubic = jindo.m.Effect(function(s) {
	return Math.pow(s, 3);
});
/**
	easeOutCubic 이펙트 함수
	
	@method easeOutCubic
	@static
**/
jindo.m.Effect.easeOutCubic = jindo.m.Effect(function(s) {
	return Math.pow((s - 1), 3) + 1;
});
/**
	easeInOutCubic 이펙트 함수
	
	@method easeInOutCubic
	@static
**/
jindo.m.Effect.easeInOutCubic = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeIn(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOut(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInCubic 이펙트 함수
	
	@method easeOutInCubic
	@static
**/
jindo.m.Effect.easeOutInCubic = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeOut(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeIn(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInQuart 이펙트 함수
	
	@method easeInQuart
	@static
**/
jindo.m.Effect.easeInQuart = jindo.m.Effect(function(s) {
	return Math.pow(s, 4);
});
/**
	easeOutQuart 이펙트 함수
	
	@method easeOutQuart
	@static
**/
jindo.m.Effect.easeOutQuart = jindo.m.Effect(function(s) {
	return -(Math.pow(s - 1, 4) - 1);
});
/**
	easeInOutQuart 이펙트 함수
	
	@method easeInOutQuart
	@static
**/
jindo.m.Effect.easeInOutQuart = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeInQuart(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOutQuart(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInQuart 이펙트 함수
	
	@method easeOutInQuart
	@static
**/
jindo.m.Effect.easeOutInQuart = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeOutQuart(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeInQuart(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInQuint 이펙트 함수
	
	@method easeInQuint
	@static
**/
jindo.m.Effect.easeInQuint = jindo.m.Effect(function(s) {
	return Math.pow(s, 5);
});
/**
	easeOutQuint 이펙트 함수
	
	@method easeOutQuint
	@static
**/
jindo.m.Effect.easeOutQuint = jindo.m.Effect(function(s) {
	return Math.pow(s - 1, 5) + 1;
});
/**
	easeInOutQuint 이펙트 함수
	
	@method easeInOutQuint
	@static
**/
jindo.m.Effect.easeInOutQuint = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeInQuint(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOutQuint(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInQuint 이펙트 함수
	
	@method easeOutInQuint
	@static
**/
jindo.m.Effect.easeOutInQuint = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeOutQuint(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeInQuint(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInCircle 이펙트 함수
	
	@method easeInCircle
	@static
**/
jindo.m.Effect.easeInCircle = jindo.m.Effect(function(s) {
	return -(Math.sqrt(1 - (s * s)) - 1);
});
/**
	easeOutCircle 이펙트 함수
	
	@method easeOutCircle
	@static
**/
jindo.m.Effect.easeOutCircle = jindo.m.Effect(function(s) {
	return Math.sqrt(1 - (s - 1) * (s - 1));
});
/**
	easeInOutCircle 이펙트 함수
	
	@method easeInOutCircle
	@static
**/
jindo.m.Effect.easeInOutCircle = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeInCircle(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOutCircle(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInCircle 이펙트 함수
	
	@method easeOutInCircle
	@static
**/
jindo.m.Effect.easeOutInCircle = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeOutCircle(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeInCircle(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInBack 이펙트 함수
	
	@method easeInBack
	@static
**/
jindo.m.Effect.easeInBack = jindo.m.Effect(function(s) {
	var n = 1.70158;
	return (s == 1) ? 1 : (s / 1) * (s / 1) * ((1 + n) * s - n);
});
/**
	easeOutBack 이펙트 함수
	
	@method easeOutBack
	@static
**/
jindo.m.Effect.easeOutBack = jindo.m.Effect(function(s) {
	var n = 1.70158;
	return (s === 0) ? 0 : (s = s / 1 - 1) * s * ((n + 1) * s + n) + 1;
});
/**
	easeInOutBack 이펙트 함수
	
	@method easeInOutBack
	@static
**/
jindo.m.Effect.easeInOutBack = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeInBack(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOutBack(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInElastic 이펙트 함수
	
	@method easeInElastic
	@static
**/
jindo.m.Effect.easeInElastic = jindo.m.Effect(function(s) {
	var p = 0, a = 0, n;
	if (s === 0) {
		return 0;
	}
	if ((s/=1) == 1) {
		return 1;
	}
	if (!p) {
		p = 0.3;
	}
	if (!a || a < 1) { 
		a = 1; n = p / 4; 
	} else {
		n = p / (2 * Math.PI) * Math.asin(1 / a);
	}
	return -(a * Math.pow(2, 10 * (s -= 1)) * Math.sin((s - 1) * (2 * Math.PI) / p));
});

/**
	easeOutElastic 이펙트 함수
	
	@method easeOutElastic
	@static
**/
jindo.m.Effect.easeOutElastic = jindo.m.Effect(function(s) {
	var p = 0, a = 0, n;
	if (s === 0) {
		return 0;
	}
	if ((s/=1) == 1) {
		return 1;
	}
	if (!p) {
		p = 0.3;
	}
	if (!a || a < 1) { 
		a = 1; n = p / 4; 
	} else {
		n = p / (2 * Math.PI) * Math.asin(1 / a);
	}
	return (a * Math.pow(2, -10 * s) * Math.sin((s - n) * (2 * Math.PI) / p ) + 1);
});
/**
	easeInOutElastic 이펙트 함수
	
	@method easeInOutElastic
	@static
**/
jindo.m.Effect.easeInOutElastic = jindo.m.Effect(function(s) {
	var p = 0, a = 0, n;
	if (s === 0) {
		return 0;
	}
	if ((s=s/(1/2)) == 2) {
		return 1;
	}
	if (!p) {
		p = (0.3 * 1.5);
	}
	if (!a || a < 1) { 
		a = 1; n = p / 4; 
	} else {
		n = p / (2 * Math.PI) * Math.asin(1 / a);
	}
	if (s < 1) {
		return -0.5 * (a * Math.pow(2, 10 * (s -= 1)) * Math.sin( (s - n) * (2 * Math.PI) / p ));
	}
	return a * Math.pow(2, -10 * (s -= 1)) * Math.sin( (s - n) * (2 * Math.PI) / p ) * 0.5 + 1;
});

/**
	easeOutBounce 이펙트 함수
	
	@method easeOutBounce
	@static
**/
jindo.m.Effect.easeOutBounce = jindo.m.Effect(function(s) {
	if (s < (1 / 2.75)) {
		return (7.5625 * s * s);
	} else if (s < (2 / 2.75)) {
		return (7.5625 * (s -= (1.5 / 2.75)) * s + 0.75);
	} else if (s < (2.5 / 2.75)) {
		return (7.5625 * (s -= (2.25 / 2.75)) * s + 0.9375);
	} else {
		return (7.5625 * (s -= (2.625 / 2.75)) * s + 0.984375);
	} 
});
/**
	easeInBounce 이펙트 함수
	
	@method easeInBounce
	@static
**/
jindo.m.Effect.easeInBounce = jindo.m.Effect(function(s) {
	return 1 - jindo.m.Effect.easeOutBounce(0, 1)(1 - s);
});
/**
	easeInOutBounce 이펙트 함수
	
	@method easeInOutBounce
	@static
**/
jindo.m.Effect.easeInOutBounce = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeInBounce(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOutBounce(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInExpo 이펙트 함수
	
	@method easeInExpo
	@static
**/
jindo.m.Effect.easeInExpo = jindo.m.Effect(function(s) {
	return (s === 0) ? 0 : Math.pow(2, 10 * (s - 1));
});
/**
	easeOutExpo 이펙트 함수
	
	@method easeOutExpo
	@static
**/
jindo.m.Effect.easeOutExpo = jindo.m.Effect(function(s) {
	return (s == 1) ? 1 : -Math.pow(2, -10 * s / 1) + 1;
});
/**
	easeInOutExpo 이펙트 함수
	
	@method easeInOutExpo
	@static
**/
jindo.m.Effect.easeInOutExpo = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeInExpo(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOutExpo(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutExpo 이펙트 함수
	
	@method easeOutInExpo
	@static
**/
jindo.m.Effect.easeOutInExpo = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeOutExpo(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeInExpo(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	Cubic-Bezier curve
	@method _cubicBezier
	@private
	@param {Number} x1
	@param {Number} y1
	@param {Number} x2
	@param {Number} y2
	@see http://www.netzgesta.de/dev/cubic-bezier-timing-function.html 
**/
jindo.m.Effect._cubicBezier = function(x1, y1, x2, y2){
	return function(t){
		var cx = 3.0 * x1, 
	    	bx = 3.0 * (x2 - x1) - cx, 
	    	ax = 1.0 - cx - bx, 
	    	cy = 3.0 * y1, 
	    	by = 3.0 * (y2 - y1) - cy, 
	    	ay = 1.0 - cy - by;
		
	    function sampleCurveX(t) {
	    	return ((ax * t + bx) * t + cx) * t;
	    }
	    function sampleCurveY(t) {
	    	return ((ay * t + by) * t + cy) * t;
	    }
	    function sampleCurveDerivativeX(t) {
	    	return (3.0 * ax * t + 2.0 * bx) * t + cx;
	    }
	    function solveCurveX(x,epsilon) {
	    	var t0, t1, t2, x2, d2, i;
	    	for (t2 = x, i = 0; i<8; i++) {
	    		x2 = sampleCurveX(t2) - x; 
	    		if (Math.abs(x2) < epsilon) {
	    			return t2;
	    		} 
	    		d2 = sampleCurveDerivativeX(t2); 
	    		if(Math.abs(d2) < 1e-6) {
	    			break;
	    		} 
	    		t2 = t2 - x2 / d2;
	    	}
		    t0 = 0.0; 
		    t1 = 1.0; 
		    t2 = x; 
		    if (t2 < t0) {
		    	return t0;
		    } 
		    if (t2 > t1) {
		    	return t1;
		    }
		    while (t0 < t1) {
		    	x2 = sampleCurveX(t2); 
		    	if (Math.abs(x2 - x) < epsilon) {
		    		return t2;
		    	} 
		    	if (x > x2) {
		    		t0 = t2;
		    	} else {
		    		t1 = t2;
		    	} 
		    	t2 = (t1 - t0) * 0.5 + t0;
		    }
	    	return t2; // Failure.
	    }
	    return sampleCurveY(solveCurveX(t, 1 / 200));
	};
};

/**
	Cubic-Bezier 함수를 생성한다.
	
	@method cubicBezier
	@static
	@see http://en.wikipedia.org/wiki/B%C3%A9zier_curve
	@param {Number} x1 control point 1의 x좌표
	@param {Number} y1 control point 1의 y좌표
	@param {Number} x2 control point 2의 x좌표
	@param {Number} y2 control point 2의 y좌표
	@return {Function} 생성된 이펙트 함수
**/
jindo.m.Effect.cubicBezier = function(x1, y1, x2, y2){
	var f = jindo.m.Effect(jindo.m.Effect._cubicBezier(x1, y1, x2, y2));
	var cssTimingFunction = 'cubic-bezier(' + [ x1, y1, x2, y2 ].join(',') + ')';
	f.toString = function() { return cssTimingFunction; };
	return f;
};

/**
	Cubic-Bezier 커브를 이용해 CSS3 Transition Timing Function과 동일한 ease 함수
	
	@example
		jindo.m.Effect.cubicBezier(0.25, 0.1, 0.25, 1);
	
	@method cubicEase
	@static
	@see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
**/
jindo.m.Effect.cubicEase = jindo.m.Effect.cubicBezier(0.25, 0.1, 0.25, 1);
jindo.m.Effect.cubicEase.toString = function() { return 'ease'; };

/**
	Cubic-Bezier 커브를 이용해 CSS3 Transition Timing Function과 동일한 easeIn 함수

	@example
		jindo.m.Effect.cubicBezier(0.42, 0, 1, 1);
	
	@method cubicEaseIn
	@static
	@see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
**/
jindo.m.Effect.cubicEaseIn = jindo.m.Effect.cubicBezier(0.42, 0, 1, 1);
jindo.m.Effect.cubicEaseIn.toString = function() { return 'ease-in'; };

/**
	Cubic-Bezier 커브를 이용해 CSS3 Transition Timing Function과 동일한 easeOut 함수
	
	@example
		jindo.m.Effect.cubicBezier(0, 0, 0.58, 1);
	
	@method cubicEaseOut
	@static
	@see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
**/
jindo.m.Effect.cubicEaseOut = jindo.m.Effect.cubicBezier(0, 0, 0.58, 1);
jindo.m.Effect.cubicEaseOut.toString = function() { return 'ease-out'; };

/**
	Cubic-Bezier 커브를 이용해 CSS3 Transition Timing Function과 동일한 easeInOut 함수
	
	@example
		jindo.m.Effect.cubicBezier(0.42, 0, 0.58, 1);
	
	@method cubicEaseInOut
	@static
	@see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
**/
jindo.m.Effect.cubicEaseInOut = jindo.m.Effect.cubicBezier(0.42, 0, 0.58, 1);
jindo.m.Effect.cubicEaseInOut.toString = function() { return 'ease-in-out'; };

/**
	Cubic-Bezier 커브를 이용해 easeOutIn 함수를 구한다.
	
	@example
		jindo.m.Effect.cubicBezier(0, 0.42, 1, 0.58);
	
	@method cubicEaseOutIn
	@static
**/
jindo.m.Effect.cubicEaseOutIn = jindo.m.Effect.cubicBezier(0, 0.42, 1, 0.58);

/**
	overphase 이펙트 함수
	
	@method overphase
	@static
**/
jindo.m.Effect.overphase = jindo.m.Effect(function(s){
	s /= 0.652785;
	return (Math.sqrt((2 - s) * s) + (0.1 * s)).toFixed(5);	
});

/**
	sin 곡선의 일부를 이용한 sinusoidal 이펙트 함수
	
	@method sinusoidal
	@static
**/
jindo.m.Effect.sinusoidal = jindo.m.Effect(function(s) {
	return (-Math.cos(s * Math.PI) / 2) + 0.5;
});

/**
	mirror 이펙트 함수
	sinusoidal 이펙트 함수를 사용한다.
	
	@method mirror
	@static
**/
jindo.m.Effect.mirror = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.sinusoidal(0, 1)(s * 2) : jindo.m.Effect.sinusoidal(0, 1)(1 - (s - 0.5) * 2);
});

/**
	nPulse의 진동수를 가지는 cos 함수를 구한다.
	
	@method pulse
	@static
	@param {Number} nPulse 진동수
	@return {Function} 생성된 이펙트 함수
	@example
		var f = jindo.m.Effect.pulse(3); //진동수 3을 가지는 함수를 리턴
		//시작 수치 값과 종료 수치 값을 설정해 jindo.m.Effect 함수를 생성
		var fEffect = f(0, 100);
		fEffect(0); => 0
		fEffect(1); => 100
**/
jindo.m.Effect.pulse = function(nPulse) {
    return jindo.m.Effect(function(s){
		return (-Math.cos((s * (nPulse - 0.5) * 2) * Math.PI) / 2) + 0.5;	
	});
};

/**
	nPeriod의 주기와 nHeight의 진폭을 가지는 sin 함수를 구한다.
	
	@method wave
	@static
	@param {Number} nPeriod 주기
	@param {Number} nHeight 진폭
	@return {Function} 생성된 이펙트 함수
	@example
		var f = jindo.m.Effect.wave(3, 1); //주기 3, 높이 1을 가지는 함수를 리턴
		//시작 수치 값과 종료 수치 값을 설정해 jindo.m.Effect 함수를 생성
		var fEffect = f(0, 100);
		fEffect(0); => 0
		fEffect(1); => 0
**/
jindo.m.Effect.wave = function(nPeriod, nHeight) {
    return jindo.m.Effect(function(s){
    	return (nHeight || 1) * (Math.sin(nPeriod * (s * 360) * Math.PI / 180)).toFixed(5);
	});
};

/**
	CSS3 Transition Timing Function 의 step-start 와 동일한 함수
	
	@method stepStart
	@static
	@see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
**/
jindo.m.Effect.stepStart = jindo.m.Effect(function(s) {
	return s === 0 ? 0 : 1;
});

/**
	CSS3 Transition Timing Function 의 step-end 와 동일한 함수
	
	@method stepEnd
	@static
	@see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
**/
jindo.m.Effect.stepEnd = jindo.m.Effect(function(s) {
	return s === 1 ? 1 : 0;
});

/**
	easeIn 이펙트 함수
	easeInCubic 함수와 동일하다.
	
	@method easeIn
	@static
	@see easeInCubic
**/
jindo.m.Effect.easeIn = jindo.m.Effect.easeInCubic;
/**
	easeOut 이펙트 함수
	easeOutCubic 함수와 동일하다.
	
	@method easeOut
	@static
	@see easeOutCubic
**/
jindo.m.Effect.easeOut = jindo.m.Effect.easeOutCubic;
/**
	easeInOut 이펙트 함수
	easeInOutCubic 함수와 동일하다.
	
	@method easeInOut
	@static
	@see easeInOutCubic
**/
jindo.m.Effect.easeInOut = jindo.m.Effect.easeInOutCubic;
/**
	easeOutIn 이펙트 함수
	easeOutInCubic 함수와 동일하다.
	
	@method easeOutIn
	@static
	@see easeOutInCubic
**/
jindo.m.Effect.easeOutIn = jindo.m.Effect.easeOutInCubic;
/**
	bounce 이펙트 함수
	easeOutBounce 함수와 동일하다.
	
	@method bounce
	@static
	@see easeOutBounce
**/
jindo.m.Effect.bounce = jindo.m.Effect.easeOutBounce;
/**
	elastic 이펙트 함수
	easeInElastic 함수와 동일하다.
	
	@method elastic
	@static
	@see easeInElastic
**/
jindo.m.Effect.elastic = jindo.m.Effect.easeInElastic;
