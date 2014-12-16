/**
    @fileOverview  ContractEffect 플러그인 
    @author "oyang2"
    @version #__VERSION__#
    @since 2011. 12. 15.
**/
/**
    ContractEffect 플러그인 

    @class jindo.m.ContractEffect
    @invisible
    @extends jindo.m._Effect_
    @keyword contract, effect, 접기 
    @group Component
**/

jindo.m.ContractEffect = jindo.$Class({
	 /* @lends jindo.m.ContractEffect.prototype */
    /**
        초기화 함수
    **/
	sEffectName : "contract",
	
	getCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'down';
		
		var sProperty = 'width';
		var nSize = this._htLayerInfo["nWidth"];
		
		if(sDirection == 'up' || sDirection == 'down'){
			sProperty = 'height';
			nSize = this._htLayerInfo["nHeight"];
		}
		
		var htStyle = htOption.htTo || {};
		htStyle[sProperty] = "0px";
		
        
		if(sDirection == 'right'){
			htStyle["marginLeft"] = (this._htLayerInfo["nMarginLeft"]+ this._htLayerInfo["nWidth"]) + "px";
		}
		
		if(sDirection == 'down'){
			htStyle["marginTop"] = (this._htLayerInfo["nMarginTop"]+ this._htLayerInfo["nHeight"]) + "px";
		}
		
        var htReturnStyle = {};
        this.getTranslateStyle(htStyle, htReturnStyle);
        
		return {
			sTaskName : this.sEffectName+"-"+sDirection ,
			htStyle : htReturnStyle,
			htTransform : {},
			fCallback : {
			    htStyle : {
    				"@marginLeft" : this._htLayerInfo["nMarginLeft"]+"px",
    				"@marginTop" : this._htLayerInfo["nMarginTop"]+"px"
				}
			}
		};
	},
	
	getBeforeCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'down';
		
		var htBeforeStyle = htOption.htFrom || {};		
		htBeforeStyle["overflow"]  = "hidden";
		
        var htBeforeReturnStyle = {};
        this.getTranslateStyle(htBeforeStyle, htBeforeReturnStyle);
		
		return {
			htStyle : htBeforeReturnStyle ,
			htTransform : {}
		};
	}
	
}).extend(jindo.m._Effect_);