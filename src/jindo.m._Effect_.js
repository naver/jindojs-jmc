/**
    @fileOverview effect플러그인 상위 클래스 
    @author "oyang2"
    @version #__VERSION__#
    @since 2011. 12. 13.
**/
/**
    effect플러그인 상위 클래스 

    @class jindo.m._Effect_
    @uses jindo.m.LayerEffect
    @invisible
    @keyword effect
    @group Component
**/

jindo.m._Effect_ = jindo.$Class({
	/* @lends jindo.m._Effect_.prototype */
    /**
        초기화 함수

        @constructor
       
    **/
	$init : function(){
		this._sCssPrefix = jindo.m.getCssPrefix();
		var htDInfo = jindo.m.getDeviceInfo();		
		this.bIos = (htDInfo.iphone || htDInfo.ipad);
		this.bIos3 = htDInfo.iphone && (htDInfo.version.length > 0) && (htDInfo.version.substring(0,1)== '3');
		this.bAndroid = htDInfo.android;
		this.bAndroid3Up  = htDInfo.android && (htDInfo.version.length > 0) && (htDInfo.version.substring(0,1)>= '3');	
		this.bAndroid2_1  = htDInfo.android && (htDInfo.version.length > 0) && (htDInfo.version === '2.1');	
		this.sTranOpen =  (this.bIos )?'translate3d(' : 'translate(';
		this.sTranEnd =  (this.bIos)?',0px)' : ')';
		this._initVar();
		
	},
	
	_initVar : function(){
		this._htLayerInfo = {};
	},
	
	setLayerInfo : function(htInfo){
		this._htLayerInfo = {};
		
		for(var p in htInfo){
			this._htLayerInfo[p] = htInfo[p];
		}
		
		//console.log('이펙트에서 설정해용', this._htLayerInfo);
	},
	
    getTranslateStyle : function(htStyle, htReturn){
        var htData = htReturn || {};
        for ( var i in htStyle){
            htData["@"+i] = htStyle[i];
        }
        return htData;
    },	
	
	getTransitionTask : function(){
		return null;
	},
	
	getBeforeCommand : function(){
		return null;
	}, 
	getCommand : function(){
		return null;
	}
});