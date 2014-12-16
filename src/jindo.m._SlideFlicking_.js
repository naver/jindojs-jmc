/**
   Slide flicking 플러그인 
   @deprecated
**/
jindo.m._SlideFlicking_= jindo.$Class({
    /**
        초기화 함수
    **/
    sAnimationName  : 'slide',
    $init : function(){
        this._htPosition = {};
        this._sTranslateStart = "translate(";
        this._sTranslateEnd = ")";
        this._initFlicking();
    },  
    
     _initFlicking : function(){
         this._setElementSize();
         this._setElementStyle();
         this._setPanelPos();
         this._prepareFlicking();
    },
    
    _setPanelPos : function(){
        var bH = this.option('bHorizontal');
        var el = this._htWElement.base.$value();
        var nW = bH? el.clientWidth : el.clientHeight;
        this._nDefaultSize = nW;
        if(this.option('bUseCircular')){
             this._htPosition.htPanel = {
                left : 0,
                center : 100,
                right : 200
            };
            this._htPosition.htContainer = {
                left: nW * -1,
                center : 0,
                right : nW 
            };
        }else{
            this._htPosition.aPos = [];
            var sLen = bH? 'width' : 'height';
            var nPos = 0;
            var nBeforePos = 0;
            for(var i=0,nLen = this._htWElement.aPanel.length; i<nLen;i++){
                if(i != 0){
                    if(this.option('nFlickDistanceOffset') === null){
                        nPos += this._htWElement.aPanel[i-1][sLen]()*-1;
                    }else{
                        nW = this._htWElement.aPanel[i-1][sLen]()*-1;
                        nPos = nBeforePos + nW + (this.option('nFlickDistanceOffset')*-1);
                        nBeforePos +=nW;                    
                    }
                }           
                this._htPosition.aPos.push(nPos);     
            }
        }
    },
    
    /**
     *  @description  애니메이션 작업전에 각 패널및 컨테이너의 설정값을 설정한다. 
     */
    _prepareFlicking : function(){
        if(this.option('bUseCss3d')){
             this._sTranslateStart = "translate3d(";
             this._sTranslateEnd = ",0px)";
        }
        
        for(var i=0, nLen =  this._htWElement.aPanel.length; i<nLen; i++){
              if(this.option('bUseTranslate')){
                    this._htWElement.aPanel[i].css(this._sCssPrefix + 'Transform', this._sTranslateStart +"0px,0px" + this._sTranslateEnd);   
              }
             this._htWElement.aPanel[i].css(this._sCssPrefix + 'TransitionProperty', "all");           
        }   
    },
    
    
    /**
     * @override 플리킹에 필요한 스타일을 추가한다.
     */
    _setElementStyle : function() {
        this._htWElement.base.css('overflow','hidden');
        this._htWElement.container.css('position','relative');
        if(this.option('bHorizontal')){
              this._htWElement.container.css('clear','both');
        }
        var self = this;
        
        jindo.$A(this._htWElement.aPanel).forEach(function(value,index, array){
            var wel = value;
            if(self.option('bUseCircular')){
                wel.css('position', 'absolute').css('width','100%').css('height','100%');
            }
            if(self.option('bHorizontal')){
                wel.css('float','left');
            }
        });
   },
    
    /**
     * @override 플리킹에 필요한 사이즈를 지정한다. 
     */
    _setElementSize : function(){
        this._htWElement.container.height(this._htWElement.base.height());
       
        
        if(!this.option('bUseCircular')) {// && this.option('bAutoSize')){
             var bH = this.option('bHorizontal');
             var nLen = this._htWElement.aPanel.length;
             var nSize = bH? this._htWElement.base.width(): this._htWElement.base.height();
             var nMaxSize = nSize * nLen;
             if(bH){
                 this._htWElement.container.width(nMaxSize);
             }else{
                 this._htWElement.container.height(nMaxSize);
             }
             
             jindo.$A(this._htWElement.aPanel).forEach(function(value){
                    if(bH) {
                      value.width(nSize);  
                    } else {
                      value.height(nSize);  
                    }
             });
        }
    },
  
    _onAfterStart : function(){
        
    },
 
      
    /**
       * @override
    */
    _onAfterMove : function(nDis, nVector, nPos){
          //기존의  movePanel을 넣으면 됨 
          //옵션설정이 되었을 경우 
        if(this.option('bSetNextPanelPos') && (Math.abs(nDis) >5 )){
            var welCenter = this.getElement();
            var welPrev = this.getPrevElement();
            var welNext = this.getNextElement();
            var nTop = welCenter.offset().top - window.scrollY;
            if( nTop < 0 ){
                 this._bSetTopPos  = true;
                 if(this._isIos){
                     var sValue =this._sTranslateStart +"0,"+ (nTop*-1)+"px" + this._sTranslateEnd;
                     welPrev.css(this._sCssPrefix + 'Transform', sValue);
                     welNext.css(this._sCssPrefix + 'Transform', sValue);
                 }else{
                     welPrev.css('top', nTop*-1 + "px");
                     welNext.css('top', nTop*-1 + "px");
                 }
            }
        }
        this._setPosition( nDis, nVector, nPos, 0, false);
    },
  
  
   /**
   * @override
   */
   _onAfterEnd : function(nDis, nVector, nPos, nDuration){
        var wel = this._htWElement.container;
        var nDistance;
        if(typeof nDuration === 'undefined'){
            nDuration = this.option('nDuration');
        }
        //var nDuration = this.option('nDuration');
        if(this._htIndexInfo.sDirection === null){
            nDuration = this.option('nBounceDuration');
        }
        
        if(!this.option('bUseTimingFunction') && (nDuration > 0)){
        // if(!this.option('bUseTimingFunction') && (nDuration > 0)  && (this._htIndexInfo.sDirection !== null) ){
            //script  방식으로 애니메이션 처리
            var self = this;
            nDistance =  this._nLastDis? this._nLastDis :  nDis;
             var startTime = (new Date()).getTime(),
                 nStartDis =  nDis, nBeforeDis = nDis, nStartVector = nVector, nTotalDis = this.option('bHorizontal')? this._htWElement.base.width(): this._htWElement.base.height();
            //console.log('didididi', this._htIndexInfo.sDirection);    
            if(this._htIndexInfo.sDirection === null){
                if(!this.option('bUseTranslate')){ 
                    nTotalDis = -100;
                }else{
                    nTotalDis = 0;
                }
             }
             if(nDistance < 0){
                   nTotalDis = nTotalDis*-1;
             }
                 
                    (function animate () {
                        var now = (new Date()).getTime(),nEaseOut, nDis;
                        if (now >= startTime + nDuration) {
                            //clearTimeout(self._nTimerAnimate);
                            cancelAnimationFrame(self._nTimerAnimate);
                            delete self._nTimerAnimate;
                            self._setPosition(nTotalDis,  (nDis-nBeforeDis), nPos, 0, false);
                            setTimeout(function(){
                                self._onTransitionEnd();
                            },100);
                            //self._onTransitionEnd();
                            return;
                        }
                        
                       
                        now = (now - startTime) / nDuration - 1;
                        nEaseOut = Math.sqrt(1 - Math.pow(now,2));
                        nDis = (nTotalDis - nStartDis)*nEaseOut + nStartDis;
                       self._setPosition( nDis,  (nDis-nBeforeDis), nPos, 0, false);
                       nBeforeDis = nDis;
                        //self._nTimerAnimate = setTimeout(animate, 1);   
                       self._nTimerAnimate = requestAnimationFrame(animate);

            })();
        }else{
            this._setPosition(nDis, nVector, nPos, nDuration, true);
        }
        
   },
    
    _getContainerPos : function(){
        var wel = this._htWElement.container;
        var nLeft = parseInt(wel.css("left"),10),
            nTop = parseInt(wel.css("top"),10);
        nLeft = isNaN(nLeft) ? 0 : nLeft;
        nTop = isNaN(nTop) ? 0 : nTop;
        var htPos = jindo.m.getCssOffset(wel.$value());
        //nLeft += htPos.left;
        //nTop += htPos.top;
        return {
            left : nLeft+htPos.left, 
            top : nTop+htPos.top,
            css_left : nLeft, 
            css_top :  nTop
        };
    },
    
  
  _setPosition : function( nDis, nVector, nPos, nDuration, bEnd){
       if(typeof nDuration === 'undefined'){
            nDuration = 0;
       }        
       if(!this.option('bUseTranslate')){
           this._setPositionForStyle(nDis, nVector , nDuration, bEnd);
       }else{
            this._setPositionTransform(nDis,nDuration, bEnd);
       }
    },
  /**
     * @description wel 엘리먼트의 위치를 left, top 속성으로 설정한다. 
 * @param {HTMLElement} wel 위치를 잡을 대상 엘리먼트 
 * @param {Number} nDis touchstart 시점에서 부터의 거리
 * @param {Number} nVector 이전 터치와의 상대 거리 
 * @param {Number} nDuration 애니메이션 시간 
 * @param {Boolean} bEnd 현재 touchEnd 시점여부 
     */
    _setPositionForStyle : function( nDis, nVector, nDuration, bEnd){
        var sName = this.option('bHorizontal')? 'left' : 'top';
        
        if(bEnd){
           if(this.option('bUseCircular')){
               if(this._htIndexInfo.sDirection === null){
                   nDis = -100;
               }else{
                   if(nDis < 0){
                        nDis = -200;
                    }else{
                        nDis = 0;
                    }
               }
           }else{
               nDis = this._getMovePos();
           }
        }
        
        var n = 0;
        
        if(this.option('bUseCircular')){
            n = ((nDis/this._nDefaultSize) * 100) - 100;
        }else{
            if(bEnd){
                n = nDis;
            }else{
                n = nVector + this._getContainerPos()['css_'+ sName];
            }
        }
        var nPos = bEnd? nDis : n;
       
        
        this._nLastDis = nDis;
       if(bEnd){
            if(nPos === parseFloat(this._htWElement.container.css(sName).replace('px',''),10) ){
                nDuration = 0;
            }
            this._attachTransitionEnd(this._htWElement.container.$value(), nDuration);
        }
         var nX = this.option('bHorizontal')? nPos :0;
         var nY = this.option('bHorizontal')? 0: nPos;
        this._setPosContainer(nX, nY, nDuration);
        //wel.css(htCss);
    },
    
    /**
     * @description wel 엘리먼트의 위치를 css의 translate 속성으로 설정한다. 
 * @param {HTMLElement} wel 위치를 잡을 대상 엘리먼트 
 * @param {Number} nDis touchstart 시점에서 부터의 거리
 * @param {Number} nDuration 애니메이션 시간 
 * @param {Boolean} bEnd 현재 touchEnd 시점여부 
     */
    _setPositionTransform : function(nDis, nDuration, bEnd){
        var bH = this.option('bHorizontal');
        if(bEnd){
            if(this._htIndexInfo.sDirection === null){
                nDis = 0;
            }else{
                if(this.option('bUseCircular')){
                    nDis = (this._htIndexInfo.sDirection === "next")? this._htPosition.htContainer.left : this._htPosition.htContainer.right;
                }else{
                    nDis = this._getMovePos();
                }
            }
        }
        
        // console.log("nDis" , nDis);
// 
	    //var bH = this.option('bHorizontal');
	    var nX = bH? nDis :0;
	    var nY = bH? 0: nDis;

	    this._nLastDis = nDis;
	       
	       if(bEnd){
	            var htCssOffset = jindo.m.getCssOffset(this._htWElement.container.$value());
	            if((htCssOffset.left === nX) && (htCssOffset.top === nY)){
	                nDuration = 0;
	            }
	            this._attachTransitionEnd(this._htWElement.container.$value(), nDuration);
	        }
            this._setPosContainer(nX, nY, nDuration);
    },
  /**
   * @override
   */
    _onTransitionEnd : function(){
        this._detachTarnsitonEnd();
        var bFireEvent = true;
        if(this._htIndexInfo.sDirection === null){
            bFireEvent = false;
        }
        
        this._nLastDis  = null;
        //console.log(this._htIndexInfo);
        //if(this.option("bUseCircular")){
        this._restorePanel(this._htIndexInfo.welNextElement.$value());
        //}
        this._endAnimation(bFireEvent);
        if(this._bFireMoveEvent){
            this._fireCustomEvent('move');
            this._bFireMoveEvent = false;
        }
    },
    
    
    /**
     * @description el이 화면에 중앙에 오도록 각 패널과 컨테이너 재배치 한다.
 * @param {HTMLElement} el 화면에 중앙에 오는 엘리먼트 
     */
    _restorePanel : function(el){
         var self =this;
         var sPosition = this.option('bHorizontal')? 'left':'top'; 
         
         var nCenter = this.getIndexByElement(el);
         this._refresh(nCenter, false);
         
         if(this.option('bUseCircular')){
             if(this._bSetTopPos){
                if(this._isIos){
                    this._htWElement.aPanel[nCenter].css(this._sCssPrefix + 'Transform', this._sTranslateStart +"0px,0px" + this._sTranslateEnd);   
                    this._htWElement.aPanel[nPrev].css(this._sCssPrefix + 'Transform', this._sTranslateStart +"0px,0px" + this._sTranslateEnd);   
                    this._htWElement.aPanel[nNext].css(this._sCssPrefix + 'Transform', this._sTranslateStart +"0px,0px" + this._sTranslateEnd);   
                }else{
                    this._htWElement.aPanel[nCenter].css("top","");
                    this._htWElement.aPanel[nPrev].css("top","");
                    this._htWElement.aPanel[nNext].css("top","");
                }
                this._bSetTopPos =  false;
            }
            
            if(this._isIos && this.option('bUseCircular')){
                 var nPrev = (((nCenter-1) < 0 )? 2 : (nCenter-1))%3;
                 var nNext =  (((nCenter+1) > 2 )? 0 : (nCenter+1))%3;
                 var welClonePrev = jindo.$Element(this._htWElement.aPanel[nPrev].$value().cloneNode(true));
                 var welCloneNext = jindo.$Element(this._htWElement.aPanel[nNext].$value().cloneNode(true));
                 
                 this._htWElement.aPanel[nPrev].replace(welClonePrev);
                 this._htWElement.aPanel[nNext].replace(welCloneNext);
                 
                 this._htWElement.aPanel[nPrev] = welClonePrev;
                 this._htWElement.aPanel[nNext] = welCloneNext;
                 this._htWElement.aPanel[nPrev] = welClonePrev;
                 this._htWElement.aPanel[nNext] = welCloneNext;
            } 
         }
    },
  
    
    /**
     * @description n번째 패널 중앙에 오도록 panel을 다시 좌우 배열해서 배치한다.
     * @param {Number} n 현재 화면에 보여져야할 content의 인덱스
     * @param {Boolean} bResize 화면 크기가 변화되어 다시 사이즈를 업데이트 해야 할경우 true 
     * @param {Boolean} bFireEvent 커스텀이벤트 발생여부
     */
    _refresh : function(n, bResize ){
         var nCenter = n;
        
         if(this.option('bUseCircular')){
             nCenter = n%3;
         }
         
         if(bResize){
               this._setElementSize();
               this._setPanelPos();
         }   
			
          var sPosition = this.option('bHorizontal')? 'left':'top'; 
          this._htWElement.container.css(this._sCssPrefix+'TransitionDuration', '0ms');
          if(this.option('bUseCircular')){
              //순환일 경우 
              this._htWElement.container.css(sPosition, '-100%');
              if (this.option('bUseTranslate')) {
                    this._htWElement.container.css(this._sCssPrefix + 'Transform', this._sTranslateStart + "0px,0px" + this._sTranslateEnd);
               }
               var nPrev = (((nCenter-1) < 0 )? 2 : (nCenter-1))%3;
               var nNext =  (((nCenter+1) > 2 )? 0 : (nCenter+1))%3;
               this._htWElement.aPanel[nCenter].css(sPosition, this._htPosition.htPanel.center + "%").css('zIndex',10);
               this._htWElement.aPanel[nPrev].css(sPosition, this._htPosition.htPanel.left+ "%").css('zIndex',1);
               this._htWElement.aPanel[nNext].css(sPosition, this._htPosition.htPanel.right+ "%").css('zIndex',1);
          }else{
              //비순환일 경우
              var nPos = 0;
              if(nCenter > 0){
                  nPos = this._htPosition.aPos[nCenter];
              }
              this._htWElement.container.css(this._sCssPrefix + 'Transform', "");
              this._htWElement.container.css(sPosition, nPos+"px");
          }
    },
    
    
    
    /**
     * @override
     * @description n 컨텐츠로 이동한다 
 * @param {Number} n 컨텐츠 인덱스 
 * @param {Number} nDruation  애니메이션 시
 * @param {Boolean} flicking  커스텀 이벤트 발생여부
     */
     _moveTo : function(nIndex, nDuration , bFireEvent){
        if(this.option('bUseCircular')){
             this.refresh(nIndex, false, bFireEvent);
        }else{
            if(bFireEvent){
                if(!this._fireCustomEvent('beforeMove',{
                      nContentsIndex : this.getContentIndex(),
                      nContentsNextIndex : nIndex
                })){
                    return;
                }
            }
            var nDis = this._getMovePos(nIndex);
            var nX =  this.option('bHorizontal')? nDis : 0;
            var nY =  this.option('bHorizontal')? 0: nDis;
            this._htIndexInfo.welNextElement = this._htWElement.aPanel[nIndex];
            this._htIndexInfo.nNextContentIndex = nIndex;
            if(bFireEvent){
                this._bFireMoveEvent = true;
                // if(nDuration !== 0){
                    // this._attachTransitionEnd(this._htWElement.container.$value(), nDuration);
                // }else{
                    // var self = this;
                    // setTimeout(function(){
                          // self._onTransitionEnd();
                    // },100);
                // }
            }
            if(nDuration !== 0){
                    this._attachTransitionEnd(this._htWElement.container.$value(), nDuration);
                }else{
                    var self = this;
                    setTimeout(function(){
                          self._onTransitionEnd();
                    },100);
                }
            this._setPosContainer(nX, nY, nDuration);
            //if(!this.bFireEvent){
                 //this._onTransitionEnd();
            //}
        }
    },
    _getMovePos : function(nIndex){
         var bRet = 0;
         var sPos =  this.option('bHorizontal')? "left" : "top";
         var htPos =  this._getContainerPos();
         if(typeof nIndex === 'undefined'){
              if(this._htIndexInfo.sDirection !== null){
                  nIndex = this._htWElement.aPanel.length-1;
                  htPos =  this._getContainerPos();
                  var nCurrent = htPos[sPos];
                  var nMax = this._htPosition.aPos.length;
                  for(var i=0,nLen = nMax; i<nLen; i++){               
                            if(nCurrent >= (this._htPosition.aPos[i])){
                                nIndex = i;
                                break;
                            }               
                  }
                  if ((nIndex == this.getContentIndex()) && nIndex > 0 && (this._htIndexInfo.sDirection === 'prev')) nIndex--;
                  if ((nIndex == this.getContentIndex()) && (nIndex < (nMax-1)) && (this._htIndexInfo.sDirection === 'next')) nIndex++;
              }else{
                  nIndex = this.getContentIndex();
              }
            
         }
         
         bRet  = this._htPosition.aPos[nIndex];
         if(this.option('bUseTranslate')){
             bRet -= (htPos['css_'+sPos]);
         }
         //bRet  = this._htPosition.aPos[nIndex] - (htPos['css_'+sPos]);
         
         return bRet;
    },
    
    _setPosContainer : function(nX, nY, nDuration){
        if(typeof nDuration === 'undefined'){
            nDuration = 0;
        }
        var htCss = {};
            htCss[this._sCssPrefix+'TransitionProperty'] = "all";
            htCss[this._sCssPrefix+'TransitionDuration'] =  (nDuration === 0)? '0' : nDuration +"ms" ;
            
        if(this.option('bUseTranslate')){
            htCss[this._sCssPrefix+'Transform'] =  this._sTranslateStart + nX +"px,"+nY+"px" + this._sTranslateEnd;
        }else{
             var sUnit = this.option('bUseCircular')? "%" : "px";
             if(this.option('bHorizontal')) {
                htCss['left']  = nX+ sUnit; 
             } else {
                htCss['top']  = nY+ sUnit; 
             }
        }
            
        this._htWElement.container.css(htCss);
    }
}).extend(jindo.m._FlickingAnimation_);
