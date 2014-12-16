/**
    @fileOverview  fade effect 플러그인 
    @author "oyang2"
    @version #__VERSION__#
    @since 2011. 12. 15.
**/
/**
   fade effect 플러그인 

    @class jindo.m.FadeEffect
    @invisible
    @extends jindo.m._Effect_
    @keyword fade, effect, 보이기, 감추기
    @group Component 
**/

jindo.m.FadeEffect = jindo.$Class({
	/** @lends jindo.m.FadeEffect.prototype */
	/**
        초기화 함수
    **/
	sEffectName : "fade",
		
	getCommand : function(el, htOption){
       if(!htOption.htTo){
           htOption.htTo = {};
       }
       if(htOption.nDistance){
            htOption.htTo.opacity = htOption.nDistance;
        }
		var sDirection = htOption.sDirection? htOption.sDirection :'in';
		
		
		var htStyle = htOption.htTo || {};
		var nOpacity = (sDirection == 'in')? 1 : 0;
		htStyle["opacity"] = (typeof htStyle["opacity"] !== 'undefined')? htStyle["opacity"] : nOpacity;
		
		var htCallback = {};
		if(sDirection == 'out'){
			htCallback.htStyle = {};
			htCallback.htStyle["@display"]  = "none";
			htCallback.htStyle["@opacity"] = this._htLayerInfo['nOpacity'];
		}

		var htReturnStyle = {};
		this.getTranslateStyle(htStyle, htReturnStyle);
				
		return {
			sTaskName : this.sEffectName + "-"+sDirection,
			htStyle : htReturnStyle,
			fCallback : htCallback
		};
	},
	
	getBeforeCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'in';
		//debugger;
	
		var htBeforeStyle = htOption.htFrom || {};
		var nOpacity  = (sDirection == 'in')? 0 : 1;

		htBeforeStyle["display"] = this._htLayerInfo['sDisplay'];
		htBeforeStyle["opacity"] = (typeof htBeforeStyle["opacity"] == 'undefined')? nOpacity : htBeforeStyle["opacity"];
		
        var htBeforeReturnStyle = {};
        this.getTranslateStyle(htBeforeStyle, htBeforeReturnStyle);
        
		return {
			htStyle : htBeforeReturnStyle ,
			htTransform : {}
		};
	}
	
}).extend(jindo.m._Effect_);