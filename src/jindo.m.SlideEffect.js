/**
    @fileOverview  slide effect 플러그인 
    @author "oyang2"
    @version #__VERSION__#
    @since 2011. 12. 15.
    
    @2012.01.16 수정사항
     - android3.0, android4.0 대응 추가 
**/
/**
   slide effect 플러그인 
    @class jindo.m.SlideEffect
    @invisible
    @extends jindo.m._Effect_
    @keyword slide, effect, slide-left, slide-right, slide-up, slide-out 
    @group Component
**/


jindo.m.SlideEffect = jindo.$Class({
	/** @lends jindo.m.SlideEffect.prototype */
	/**
        초기화 함수
        @invisible
    **/
	sEffectName : "slide",

	/**
	 * @description 레이어를 설정된 방향으로 움직인다
	 * @param {HTMLElement} el slide 대상 엘리먼트
	 * @param {HashTable} slide 옵션
	 * 		- sDirection : 'left', //'left, 'right, 'up', 'down' 설정가능하다
	 *		- nSize : 200, //slide 할 거리, 디폴트 값은 레이어 크기가 됨 (px)
	 *		- elBaseLayer : jindo.$('wrapper'), //기준 뷰가 되는 엘리먼트, 없을 경우 설정하지 않는다.
	 *		- htTo : {opacity : 1} , //레이어의 slide 이후의 css를 설정
	 *		- htFrom : {opacity : 0.7}  //레이어의 slide 이전의 css를 설정
	 */
	getCommand : function(el, htOption){
	    if(htOption.nDistance){
	        htOption.nSize = htOption.nDistance;
	    }
		var sDirection = htOption.sDirection? htOption.sDirection :'left';		
		
		var htCurOffset = jindo.m.getCssOffset(el);
		
		var toX = htCurOffset.left;
		var toY = htCurOffset.top;
		var nW,nH,wel;
		nW = (typeof htOption.nSize != 'undefined')? htOption.nSize : this._htLayerInfo['nWidth'];
		nH =  (typeof htOption.nSize != 'undefined')? htOption.nSize : this._htLayerInfo['nHeight'];
		
		if(sDirection == 'up' || sDirection == 'down'){
			toY  += ((sDirection == 'up')? nH*-1 : nH); 
		}
		
		if(sDirection == 'left' || sDirection == 'right'){
			toX += ((sDirection == 'left')? nW*-1 : nW);
		}
		
		if(typeof htOption.elBaseLayer != 'undefined'){
			toX = 0;
			toY = 0;
			var welBaseLayer = jindo.$Element(htOption.elBaseLayer);
			wel = jindo.$Element(el);
			nH = (typeof htOption.nSize != 'undefined')? htOption.nSize : welBaseLayer.height();
			nW = (typeof htOption.nSize != 'undefined')? htOption.nSize : welBaseLayer.width();

			if(sDirection == 'up' || sDirection == 'down'){
				toY = (sDirection == 'down')?  nH * -1 : nH;
			}
			
			if(sDirection == 'left' || sDirection == 'right'){
				toX = (sDirection == 'left')? nW: nW*-1;
			}
			toX = toX*-1;
			toY = toY*-1;
		}
		
		
		//fCallback 등록
		var sPosition = this._htLayerInfo["sPosition"];
		var bAndroid = this.bAndroid;
		var bAndroid3Up = this.bAndroid3Up;
		var sClassHighligting = this._htLayerInfo['sClassHighligting'];
		var bAndroid2_1 = this.bAndroid2_1;
		
		wel = jindo.$Element(el);

        var htStyle = htOption.htTo || {};
		htStyle["transform"] = this.sTranOpen + toX + 'px, ' + toY + 'px'+ this.sTranEnd;
        var htReturnStyle = {};
        this.getTranslateStyle(htStyle, htReturnStyle);
		
		return {
			sTaskName : this.sEffectName+"-"+ sDirection,
			htStyle : htReturnStyle,
			fCallback : function(){
				var htCurOffset = jindo.m.getCssOffset(el);	
				var top = wel.css('top').replace('px','')*1;
				var left = wel.css('left').replace('px','')*1;
				top = isNaN(top)? 0 : top;
				left = isNaN(left)? 0 : left;
				
				// console.log('before '+top+" , "+left);				
				if(sPosition == "relative"){
					wel.css("position", 'relative');
				}else{
					wel.css("position","absolute");
				}				
				
				var sPrefix = jindo.m.getCssPrefix();
				wel.css(sPrefix+'Transform','');
				
				//안드로이드 4.0버그 left, top을 설정하기 전에 offset을 호출해야 설정이 된다.
				if(bAndroid3Up){
					wel.offset();
				}				
				wel.$value().style.top = parseInt((top+htCurOffset.top),10)+"px";
				wel.$value().style.left = parseInt((htCurOffset.left+ left),10)+"px";	
				
								
				if(bAndroid && !bAndroid3Up){
				//if(bAndroid){
					var elFocus = jindo.$$.getSingle('.'+ sClassHighligting, wel.$value());
					if(elFocus){	
						if(bAndroid2_1){
							setTimeout(function(){
								elFocus.focus();							
							},5);		
						}else{
							elFocus.focus();
						}
					}
				}
			}
		};
	},
	
	/**
	 * @description 레이어를 설정된 방향으로 움직이기 전에 미리 설정해야 할 옵션들을 설정한다.
	 * @param {HTMLElement} el slide 대상 엘리먼트
	 * @param {HashTable} slide 옵션
	 * 		- sDirection : 'left', //'left, 'right, 'up', 'down' 설정가능하다
	 *		- nSize : 200, //slide 할 거리, 디폴트 값은 레이어 크기가 됨 (px)
	 *		- elBaseLayer : jindo.$('wrapper'), //기준 뷰가 되는 엘리먼트, 없을 경우 설정하지 않는다.
	 *		- htTo : {opacity : 1} , //레이어의 slide 이후의 css를 설정
	 *		- htFrom : {opacity : 0.7}  //레이어의 slide 이전의 css를 설정
	 */
	getBeforeCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'left';
		
		var htBeforeStyle = htOption.htFrom || {};
		// var htTransform = {};
		
		var wel = jindo.$Element(el);
		
		if(typeof htOption.elBaseLayer != 'undefined'){
			var welBaseLayer = jindo.$Element(htOption.elBaseLayer);
			
			if(!welBaseLayer.isParentOf(wel)){
				welBaseLayer.append(wel);
				var sPosition = wel.css('position');
				if(!(sPosition == 'relative' || sPosition == 'absolute') ){
					wel.css('position', 'absolute');
				}
				wel.css('opacity',0);
			}
			
			var fromX = 0, fromY = 0;
			
			var nH = welBaseLayer.height();
			var nW = welBaseLayer.width();
			
			
			if(sDirection == 'up' || sDirection == 'down'){
				fromY = (sDirection == 'down')?  nH * -1 : nH;
			}
			
			if(sDirection == 'left' || sDirection == 'right'){
				fromX = (sDirection == 'left')? nW: nW*-1;
			}
			welBaseLayer.css('overflow','hidden');
			htBeforeStyle["left"] = fromX+"px";
			htBeforeStyle["top"] = fromY +"px";
			
			//console.log('beforedddd', welBaseLayer.offset());
			htBeforeStyle["opacity"] = this._htLayerInfo['nOpacity'];
			//htTransform["transform"] = this.sTranOpen + fromX + 'px, ' + fromY+ 'px'+ this.sTranEnd;	
			
		}
		     
       var htBeforeReturnStyle = {};
        this.getTranslateStyle(htBeforeStyle, htBeforeReturnStyle);
        
		return {
			htStyle : htBeforeReturnStyle
		};
	}

	
}).extend(jindo.m._Effect_);

