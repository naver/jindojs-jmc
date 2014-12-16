/**
    @fileOverview 슬라이드 효과를 구현한 애니메이션
    @author sculove
    @version #__VERSION__#
    @since 2013. 4. 15.
*/
/**
    슬라이드 효과를 처리하는 애니메이션 컴포넌트
    
    @class jindo.m.Slide
   	@extends jindo.m.Animation
    @keyword component
    @group Component
    @invisible
**/
jindo.m.Slide = jindo.$Class({
	/* @lends jindo.m.Slide.prototype */
	$init : function(htUserOption) {
		this.option({});
		this.option(htUserOption || {});
	},

	setStyle : function(aArgs) {
		var htCss ={};
		htCss[this.p("TransitionProperty")] = this.sCssPrefix == "" ? "tranform" : "-" + this.sCssPrefix + "-transform";
		htCss[this.p("TransitionDuration")] = "0ms";
		htCss[this.p("Transform")] = this.getTranslate(0, 0);
		this._welTarget = aArgs[0].css(htCss);
		this.fireEvent("set", {
			css : htCss
		});
		return htCss;
	},

	/**
	 * [ description]
	 * @param  {[type]} nX     [description]
	 * @param  {[type]} nY     [description]
	 * @param  {[type]} option duration,useCircular,restore, next 
	 * @return {[type]}        [description]
	 */
	move : function(nX, nY, nDuration, option) {
		option = option || {};
		var welTarget = this.getTarget(true),
			htCss;
		if(option.useCircular) {
			if(this.option("bUseH")) {
				nX = this._getPos(nX, option);
			} else {
				nY = this._getPos(nY, option);
			}
		} else {
			if(this.option("bHasOffsetBug")) {
				var htStyleOffset = jindo.m.getStyleOffset(welTarget);
				nX -= htStyleOffset.left;
				nY -= htStyleOffset.top;
			}
		}
		htCss = {
			"@transitionProperty" : this.sCssPrefix == "" ? "tranform" : "-" + this.sCssPrefix + "-transform",
			"@transform" : this.getTranslate(nX+"px", nY+"px")
		};
		if(!!nDuration) {
			// console.error("duration : " +  nDuration);
			// for(var i in htCss) {
			// 	console.warn("morph - " + i + " , " + htCss[i]);
			// }
			this._oMorph.pushAnimate(nDuration, [welTarget, htCss]);
		} else {
			welTarget.css(this.toCss(htCss));
			// this._oMorph.fireEvent("progress", {
			// 	nTop : nY,
			// 	nLeft : nX
			// });
		}
		return this._oMorph;
	},

	_getPos : function(nPos, option) {
		var n=nPos,
			bNext = option.next,
			nRange = option.range;
		if(option.restore) {
			n = 0;
		} else {
			if(option.duration != 0 && nPos % nRange === 0) {
				n = bNext ? -nRange : nRange;
			} else { 
		    if(typeof option.startIndex != "undefined"){
				    var nDiff = parseInt(n/nRange, 10) * -1;
				    if(nDiff == option.startIndex || nDiff > option.startIndex){
				        bNext = true;
				    } else{
				        bNext = false;
				    }
            n = (n % nRange) + ((bNext ? -1 : 1) * (Math.abs(nDiff - option.startIndex) * nRange));
		    } else{
            n = (n % nRange) + (bNext ? 0 : 2* nRange);
            n %= nRange;
		    }
			}
		}
			// console.warn(nPos + " => " + n, "range/"+ nRange, bNext);
		return n;
	}
}).extend(jindo.m.Animation);