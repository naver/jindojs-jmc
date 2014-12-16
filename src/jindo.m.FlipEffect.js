/**
    @fileOverview  flip effect 플러그인 
    @author "oyang2"
    @version #__VERSION__#
    @since 2011. 12. 15.
**/
/**
   flip effect 플러그인 

    @class jindo.m.FlipEffect
    @invisible
    @extends jindo.m._Effect_
    @keyword flip, effect, 책장넘기기 
    @group Component
**/

jindo.m.FlipEffect = jindo.$Class({
	/** @lends jindo.m.FlipEffect.prototype */
	/**
        초기화 함수
    **/
	sEffectName : "flip",
		
	getCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :"left";
		
		var sCoord = 'Y';
		if(sDirection == 'up' || sDirection == 'down'){
			sCoord = 'X';
		}
		
		var htStyle = htOption.htTo || {};
		
		
		var welFrom = htOption.elFlipFrom? jindo.$Element(htOption.elFlipFrom) : jindo.$Element(el);
		var welTo =   htOption.elFlipTo? jindo.$Element(htOption.elFlipTo) : null;
		
		var htTo = this._getCssRotate(this._getCssTransform(welFrom));
		
		htTo[sCoord] = htTo[sCoord]+ ((sDirection == 'left' || sDirection == 'down')?180*-1 : 180);
		var sTransform = 'rotateX('+ htTo.X+'deg) rotateY('+htTo.Y+'deg)';
		
		if(welTo){
			welTo.$value().style[this._sCssPrefix +"Transform"] = 'rotate'+sCoord+'(0deg)';
			sTransform = 'rotate'+sCoord+'(0deg)';
		}
		htStyle["transformStyle"] = "preserve-3d";
		htStyle["transform"] = sTransform;
		
        var htReturnStyle = {};
        this.getTranslateStyle(htStyle, htReturnStyle);
        
        // flip 시 elBack 이라는 element 가 존재할때 앞/뒤 판이 있는것으로 간주 style 을 지정한다.
        if(htOption && htOption.elBack){
            htOption.elBack.style[this._sCssPrefix + "BackfaceVisibility"] = "hidden";
            htOption.elBack.style[this._sCssPrefix + "Transform"] = "rotate"+sCoord+"( 180deg )";
            welFrom.$value().style[this._sCssPrefix + "BackfaceVisibility"] = "hidden";
        }
		
		return {
			sTaskName : this.sEffectName + "-" + sDirection,
			htStyle : htReturnStyle
		};
	},
	
	getBeforeCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :"left";
		
		var htBeforeStyle = htOption.htFrom || {};
		
		var sCoord = "Y", 
			nFrom = 0;
		
		if(sDirection == 'up' || sDirection == 'down'){
			sCoord = "X";
		}
		
		var welFrom = htOption.elFlipFrom? jindo.$Element(htOption.elFlipFrom) : jindo.$Element(el);
		var welTo =   htOption.elFlipTo? jindo.$Element(htOption.elFlipTo) : null;
		
		var elParent = welFrom.$value().parentNode;
		elParent.style.webkitPerspective = '1200';
		
		var htFrom = this._getCssRotate(this._getCssTransform(welFrom));
		var sTransform = 'rotateX('+ htFrom.X+'deg) rotateY('+htFrom.Y+'deg)';
		
		if(welTo){
			welTo.$value().style[this._sCssPrefix +"Transform"] = 'rotate'+sCoord+'(-180deg)';
			sTransform = 'rotate'+sCoord+'(-180deg)';
		}
				
	   htBeforeStyle["perspective"] = "1200";
	   htBeforeStyle["transformStyle"] =  "preserve-3d";
	   htBeforeStyle["transform"] = sTransform;
	   
       var htBeforeReturnStyle = {};
        this.getTranslateStyle(htBeforeStyle, htBeforeReturnStyle);
        
		return {
			htStyle : htBeforeReturnStyle
		};
	},
	
	
	
	_getCssRotate : function(str){
		var sRotate = str;
		
		var htReturn ={
			X : 0,
			Y : 0
		};
		
		if(!sRotate){
			return htReturn;
		}
		
		var aTemp = sRotate.match(/rotateX\((\-?\d*)deg/);	
		
		if(aTemp && aTemp.length >1){
			htReturn['X'] =aTemp[1]*1;
			if(htReturn['X']%360 == 0){
				htReturn['X'] = 0;
			}
		}
		
		aTemp = sRotate.match(/rotateY\((\-?\d*)deg/);
		if(aTemp && aTemp.length >1){
			htReturn['Y'] =aTemp[1]*1;
			if(htReturn['Y']%360 == 0){
				htReturn['Y'] = 0;
			}
		}
		
		return htReturn;		
	},
	
	_getCssTransform : function(wel){
		
		return wel.css(this._sCssPrefix +"Transform") || "";		
	}
	
}).extend(jindo.m._Effect_);