/**
    @fileOverview 애니메이션 동작을 담당하는 컴포넌트
    @author sculove
    @version #__VERSION__#
    @since 2013. 4. 15.
*/
/**
    애니메이션 동작을 제어하는 컴포넌트

    @class jindo.m.Animation
   	@extends jindo.m.UIComponent
    @keyword component
    @group Component
    @invisible
   	@uses jindo.m.Morph

		@history 1.9.0 Update jindo.m.Morph 기반으로 변경   
		@history 1.8.0 Release 최초 릴리즈   	    
**/
jindo.m.Animation = jindo.$Class({
	/* @lends jindo.m.Animation.prototype */
	/**
      초기화 함수

      @constructor
      @param {String|HTMLElement} el 플리킹 기준 Element (필수)
      @param {Object} [htOption] 초기화 옵션 객체
				@param {Boolean} [htOption.bHasOffsetBug=false] android 하위 버전에 존재하는 offset변환시 하이라이트,롱탭, 클릭이 offset변경 전 엘리먼트에서 발생하는 버그 여부
				@param {Function} [htOption.fEffect=jindo.m.Effect.cubicEaseOut] 애니메이션에 사용되는 jindo.m.Effect 의 함수들
	      @param {Boolean} [htOption.bUseCss3d=jindo.m.useCss3d()] css3d(translate3d) 사용여부<br />
	          모바일 단말기별로 다르게 설정된다. 상세내역은 <auidoc:see content="jindo.m">[jindo.m]</auidoc:see>을 참조하기 바란다.
	      @param {Boolean} [htOption.bUseTimingFunction=jindo.m.useTimingFunction()] 애니메이션 동작방식을 css의 TimingFunction을 사용할지 여부<br />false일 경우 setTimeout을 이용하여 애니메이션 실행.<br />
	      모바일 단말기별로 다르게 설정된다. 상세내역은 <auidoc:see content="jindo.m">[jindo.m]</auidoc:see>을 참조하기 바란다.
	    @history 1.10.0 Update fEffect 옵션 기본값 변경 easeOut => cubicEaseOut
  **/	
	$init : function(htUserOption) {
		this.option({
			bUseH : true,
			bHasOffsetBug : false,
			fEffect : jindo.m.Effect.cubicEaseOut,
			bUseCss3d : jindo.m.useCss3d(),
			bUseTimingFunction : jindo.m.useTimingFunction()
		});
		this.option(htUserOption || {});
		this._initVar();
	},

	/**
	 * 변수를 초기화 한다.
	 */
	_initVar: function(el) {
		this.sCssPrefix = jindo.m.getCssPrefix();
		this._htTans = this.option("bUseCss3d") ? {
    	open : "3d(",
    	end : ",0)"
		} : {
    	open : "(",
    	end : ")"
		};
		this._oMorph = new jindo.m.Morph({
			'fEffect' : this.option("fEffect"),
			'bUseTransition' : this.option("bUseTimingFunction")
		}).attach({
			// "progress" : jindo.$Fn(function(we) {
			// 	console.error("progress");
			// 	this.fireEvent("progress",we);
			// },this).bind(),
			"end" : jindo.$Fn(function(we) {
			  this._oMorph.clear();
			  // console.error("end");
				this.fireEvent("end",we);
			},this).bind()
		});
		// set 이후 설정되는 값.
		this._welTarget = null;	// 하위에서 필수 설정.
	},

	/**
	 * [필수 구현]
	 * 대상 컴포넌트를 초기화
	 */
	setStyle : function() {}, // 하위에서 필수 구현.

	/**
	 * [필수 구현]
	 * 엘리먼트 이동시 발생함
	 * @param  {Number} nPos  이동할 좌표
	 * @param  {Boolen} bNext 다음으로 이동하는 경우 true, 이전으로 이동하는 경우 false
	 */
	move : function(nX, nY, nDuration, option) {},  // 하위에서 필수 구현.

	/**
	 * 애니메이션 대상 타겟
	 * @param  {Boolean} isWrapper $Element 반환 여부
	 * @return {$Element|HTMLElement} 타겟
	 *
	 * @method getTarget
	 */
	getTarget : function(isWrapper) {
		if(isWrapper) {
			return this._welTarget;
		} else {
			return this._welTarget.$value();
		}
	},

	/**
	 * prefix를 붙인 스트링을 반환한다.
	 * @param  {String} str prefix를 붙일 문자열
	 * @return {String}     prefix를 붙인 문자열
	 */
	p : function(str) {
		return jindo.m._toPrefixStr(str);
	},

	getTranslate : function(sX,sY) {
		return "translate" + this._htTans.open + sX + "," + sY + this._htTans.end;
	},

	toCss : function(ht) {
		var p, pResult, prefix, htResult = {};
		for(p in ht) {
			pResult = p;
			if(/^@/.test(p)) {
				p.match(/^(@\w)/);
				prefix = RegExp.$1;
				if(/transition|transform/.test(pResult)) {
					if(this.sCssPrefix == "") {
						pResult = p.replace(prefix, prefix.toLowerCase());
					} else {
						pResult = p.replace(prefix, prefix.toUpperCase());
					}
					pResult = pResult.replace("@",this.sCssPrefix);
				} else {
					pResult = pResult.replace("@","");
				}
			}
			htResult[pResult] = ht[p];
		}
		return htResult;
	},

	/**
	 * 애니메이션 동작 여부를 반환
	 * @return {Boolean} 애니메이션 동작 여부
	 */
	isPlaying : function() {
		return this._oMorph.isPlaying();
	},

  /**
      애니메이션을 멈춘다.
  **/
	stop : function(nMode) {
		if(typeof nMode === "undefined") {
			nMode = 0;
		}
		// console.warn("morph stop---");
		this._oMorph.pause(nMode).clear();
	},

  /**
      사용하는 모든 객체를 release 시킨다.
      @method destroy
  **/
	destroy: function() {
		this._oMorph.detachAll("end");
	}
}).extend(jindo.m.UIComponent);