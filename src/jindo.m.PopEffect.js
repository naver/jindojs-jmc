/**
    @fileOverview  pop effect 플러그인 
    @author "oyang2"
    @version #__VERSION__#
    @since 2011. 12. 15.
    
    @2012.01.05
     - Android 3.0 대응 pop-in 코드 삽입 (0.1~1로 추가되도록 수정) 
**/
/**
   pop effect 플러그인 

    @class jindo.m.PopEffect
    @invisible
    @extends jindo.m._Effect_
    @keyword pop, effect, pop-in, pop-out
    @group Component
**/

jindo.m.PopEffect = jindo.$Class({
	/** @lends jindo.m.PopEffect.prototype */
	/**
        초기화 함수
        @invisibl@invisiblee
    **/
	
	sEffectName : "pop",

	getCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'in';
		
		var htStyle = htOption.htTo || {};
		if(typeof htStyle["opacity"] === 'undefined'){
			htStyle["opacity"] = (sDirection == 'in')? 1 : 0.1;
		}
		//htStyle["opacity"] = (sDirection == 'in')? 1 : 0.1;
		
		var nScale = (sDirection == 'in')? 1 : ((this.bIos3 || this.bAndroid3Up)? 0.1: 0);		
		var htCallback = {};
		if(sDirection == 'out'){
			htCallback.htStyle ={}; 
			htCallback.htStyle["@display"]  = "none";
			htCallback.htStyle["@opacity"]  = this._htLayerInfo['nOpacity'];
			htCallback.htStyle["@transform"] = "scale(1)";
		}
		
		var sTransform = 'scale('+nScale+')';
		if(this.bAndroid3Up){
//			sTransform += ' scaleZ(1.0)';
		}
		     
        htStyle["transformOrigin"] = "50% 50%";
        htStyle["transform"] = sTransform;
	   
        var htReturnStyle = {};
        this.getTranslateStyle(htStyle, htReturnStyle);

		return {
			sTaskName : this.sEffectName + "-" +sDirection,
			htStyle : htReturnStyle,
			fCallback : htCallback
		};
	},
	
	getBeforeCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'in';
				
		var htBeforeStyle = htOption.htFrom || {};
		if(typeof htBeforeStyle["opacity"] === 'undefined'){
			htBeforeStyle["opacity"] = (sDirection == 'in')? 0.1 : 1;
		}
		
		htBeforeStyle["display"] = this._htLayerInfo['sDisplay'];
		
		var nScale = (sDirection == 'in')? ((this.bIos3||this.bAndroid3Up)? 0.1: 0) : 1;
		
		var sTransform = 'scale('+nScale+')';
		if(this.bAndroid3Up){
//			sTransform += ' scaleZ(1.0)';
		}
				       
	   htBeforeStyle["transformOrigin"] = "50% 50%";
	   htBeforeStyle["transform"] = sTransform;

       var htBeforeReturnStyle = {};
        this.getTranslateStyle(htBeforeStyle, htBeforeReturnStyle);
        
		return {
			htStyle : htBeforeReturnStyle
		};
	}
}).extend(jindo.m._Effect_);