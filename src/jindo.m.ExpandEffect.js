/**
    @fileOverview  expandeffect 플러그인 
    @author "oyang2"
    @version #__VERSION__#
    @since 2011. 12. 15.
**/
/**
    expandeffect 플러그인

    @class jindo.m.ExpandEffect
    @invisible
    @extends jindo.m._Effect_
    @keyword expand, effect, 펼치기
    @group Component
**/

jindo.m.ExpandEffect = jindo.$Class({
	/** @lends jindo.m.ExpandEffect.prototype */
	 /**
        초기화 함수
    **/
	sEffectName : "expand",
	
	getCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'down';
		
		var sProperty = 'width';
		var nSize = this._htLayerInfo["nWidth"];
		
		if(sDirection == 'up' || sDirection == 'down'){
			sProperty = 'height';
			nSize = this._htLayerInfo["nHeight"];
		}
		
		var htStyle = htOption.htTo || {};
		htStyle[sProperty] = (htOption.nDistance || nSize) +"px";
		
		if(sDirection == 'left'){
			htStyle["marginLeft"] = (htOption.nDistance ? (parseInt(this._htLayerInfo["nMarginLeft"], 10) + nSize) - htOption.nDistance : this._htLayerInfo["nMarginLeft"])+"px";
		}
		
		if(sDirection == 'up'){
			htStyle["marginTop"] = (htOption.nDistance ? (parseInt(this._htLayerInfo["nMarginTop"], 10) + nSize) - htOption.nDistance : this._htLayerInfo["nMarginTop"])+"px";
		}
        var htReturnStyle = {};
        this.getTranslateStyle(htStyle, htReturnStyle);

		return {
			sTaskName : this.sEffectName+"-"+sDirection , 
			htStyle : htReturnStyle,
			htTransform : {}
		};
	},
	
	getBeforeCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'down';
		
		var sProperty = 'width';
		
		if(sDirection == 'up' || sDirection == 'down'){
			sProperty = 'height';
		}
		
		var htBeforeStyle = htOption.htFrom || {};	
		htBeforeStyle[sProperty] = "0";
		htBeforeStyle["overflow"] = "hidden";
		
		if(sDirection == 'left'){			
			htBeforeStyle["marginLeft"] = (this._htLayerInfo["nWidth"] + this._htLayerInfo["nMarginLeft"])+"px";
		}
		
		if(sDirection == 'up'){
			htBeforeStyle["marginTop"] = (this._htLayerInfo["nHeight"] +this._htLayerInfo["nMarginTop"]) +"px";
			//console.log(htBeforeStyle);
		}	
				
        var htBeforeReturnStyle = {};
        this.getTranslateStyle(htBeforeStyle, htBeforeReturnStyle);
        
		return {
			htStyle : htBeforeReturnStyle ,
			htTransform : {}
		};
	}
	
}).extend(jindo.m._Effect_);