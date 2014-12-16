/**
   Cover flicking 플러그인 
   @deprecated
**/
jindo.m._CoverFlicking_= jindo.$Class({
    /**
        초기화 함수
    **/
    sAnimationName  : 'cover',
    $init : function(){
         this._bMoveDirection = null;
         this._sTranslateStart = "translate(";
         this._sTranslateEnd = ")";
         this._sScaleStart = "scale(";
         this._sScaleEnd = ")";
         this._initFlicking();
        
    },
    
    _initFlicking : function(){
         this._setElementSize();
         this._setElementStyle();
         this._prepareFlicking();
    },
   
    
    /**
     * @override 플리킹에 필요한 스타일을 추가한다.
     */
   _setElementStyle : function(){
       this._htWElement.base.css('overflow','hidden');
       this._htWElement.container.css('position','relative');
       jindo.$A(this._htWElement.aPanel).forEach(function(value,index, array){
            var wel = value;            
            wel.css('position', 'absolute').css('width','100%').css('height','100%');   
        });
   },
    /**
     * @override 플리킹에 필요한 사이즈를 추가한다.
     */
   _setElementSize : function(){
       this._htWElement.container.height(this._htWElement.base.height());
   },
   
   _prepareFlicking : function(){
       if(this.option('bUseCss3d')){
             this._sTranslateStart = "translate3d(";
             this._sTranslateEnd = ",0px)";
       }
       var sTransfrom = this.option('bUseTranslate')? "-webkit-transform" : (this.option('bHorizontal')? 'left' : 'top');
          
       for(var i=0, nLen =  this._htWElement.aPanel.length; i<nLen; i++){
             if(this._htOption['bUseTranslate'] ){
                   this._htWElement.aPanel[i].css(this._sCssPrefix + 'Transform', this._sTranslateStart +"0px,0px" + this._sTranslateEnd);   
             }else{
                  this._htWElement.aPanel[i].css(sTransfrom, '0px');
             }
             this._htWElement.aPanel[i].css(this._sCssPrefix + 'TransitionProperty', "all");           
        }   
   },
/**
   * @override
   */
  _onAfterStart : function(){
      this._resetInfo();
  },
  
  /**
   * @override
   */
  _onAfterMove : function(nDis, nVector, nPos){
      //기존의  movePanel을 넣으면 됨 
      if(this._bMoveDirection  === null && (Math.abs(nDis) > 5) ){
               if(nDis > 0){
                   this._bMoveDirection = 'prev';
               }else{
                   this._bMoveDirection = 'next';
               }
               
               var welZoom = (this._bMoveDirection  === 'prev')? this.getPrevElement() : this.getNextElement();
               if(welZoom.$value() === this.getElement().$value()){
                   this._bMoveDirection = null;
                   welZoom = null;
               }else{
                     this._prepareZoomAnim(welZoom);
               }
        }
        
        this._setPosition(nDis, nVector, nPos, 0, false); 
  },
  
  /**
   * @override
   */
  _onAfterEnd : function(nDis, nVector, nPos, nDuration){
      if(typeof nDuration === 'undefined'){
            nDuration = this.option('nDuration');
      }
      if(!this.option('bUseTimingFunction') && (nDuration !== 0) ){
          var self = this;
           var startTime = (new Date()).getTime(),
                 nStartDis = nDis, nBeforeDis = nDis, nBeforePos = nPos,  nTotalDis = this.option('bHorizontal')? this._htWElement.base.width(): this._htWElement.base.height();
                 if(this._htIndexInfo.sDirection === null ||this._bMoveDirection === null || ((this._bMoveDirection === 'prev') && (nDis < 0) ) || ((this._bMoveDirection === 'next') && (nDis > 0) )){
                    
                     nTotalDis = 0;
                     this._htIndexInfo.nNextContentIndex = this._htIndexInfo.nContentIndex;
                     this._htIndexInfo.welNextElement = this._htIndexInfo.welElement;
                     this._htIndexInfo.sDirection = null;
                     nDuration = this.option('nBounceDuration');
                 }
                 
                 if(nDis < 0){
                     nTotalDis = nTotalDis*-1;
                 }
                    (function animate () {
                        var now = (new Date()).getTime(),nEaseOut;
                        if (now >= startTime + nDuration) {
                            //clearTimeout(self._nTimerAnimate);
                             cancelAnimationFrame(self._nTimerAnimate);
                            delete self._nTimerAnimate;
                            self._onTransitionEnd();
                            return;
                        }
                        now = (now - startTime) / nDuration - 1;
                        nEaseOut = Math.sqrt(1 - Math.pow(now,2));
                        var nDis = (nTotalDis - nStartDis)*nEaseOut + nStartDis;
                        //console.log( '======', nBeforeDis, (nBeforePos+ nBeforeDis));
                        self._setPosition( nDis,  (nDis-nBeforeDis), (nBeforePos+ nBeforeDis), 0, false);
                        nBeforeDis = nDis;
                        //self._nTimerAnimate = setTimeout(animate, 1);  
                        self._nTimerAnimate = requestAnimationFrame(animate);    
            })();
      }else{
          this._setPosition(nDis, nVector, nPos, nDuration, true); 
      }
  },
  
   _setPosition : function( nDis, nVector, nPos, nDuration, bEnd){
        if(typeof nDuration === 'undefined'){
            nDuration = 0;
        }        
        if(this.option('bUseTranslate')){
            this._setPositionTransform( nDis, nPos, nDuration, bEnd);
          
        }else{
             this._setPositionForStyle( nDis, nVector ,nPos, nDuration, bEnd);
        }
    },
    
    /**
     * @description wel 엘리먼트의 위치를 left, top 속성으로 설정한다. 
 * @param {HTMLElement} wel 위치를 잡을 대상 엘리먼트 
 * @param {Number} nDis touchstart 시점에서 부터의 거리
 * @param {Number} nVector 이전 터치와의 상대 거리 
 * @param {Number} nPos 현재 터치지점의 좌표 
 * @param {Number} nDuration 애니메이션 시간 
 * @param {Boolean} bEnd 현재 touchEnd 시점여부 
     */
     _setPositionForStyle : function( nDis,  nVector, nPos, nDuration, bEnd){
         var bReturn = false;
         if(bEnd){
             if(this._htIndexInfo.sDirection !== null){
                if(nDis < 0 && (this._bMoveDirection === 'next') ){
                    nDis =  this._htWElement.base.width()*-1;
                }else if(nDis > 0 && (this._bMoveDirection === 'prev')){
                    nDis =  this._htWElement.base.width();
                }else{
                    nDis = 0;
                    this._htIndexInfo.nNextContentIndex = this._htIndexInfo.nContentIndex;
                    this._htIndexInfo.welNextElement = this._htIndexInfo.welElement;
                    this._htIndexInfo.sDirection = null;
                    bReturn = true;
                    nDuration = this.option('nBounceDuration');
                }
            }else{ //
                 nDis = 0;
                 bReturn = true;
                 nDuration = this.option('nBounceDuration');
            }
            
        }else{
            nDis = nVector;
        }
        
        var wel = this.getElement();
        
        var sName = this.option('bHorizontal')? 'left' : 'top';
        var nPosition = !bEnd? (parseFloat(wel.css(sName).replace('px',''),10) || 0) + nDis : nDis;
        var htCss = {};
        //htCss[this._sCssPrefix+'TransitionProperty'] = sName;
        htCss[this._sCssPrefix+'TransitionDuration'] = (nDuration === 0)? '0' : nDuration +"ms" ;
        htCss[sName]  = nPosition+ 'px';
        
        
        var welZoom = this._getZoomElement();
        
        var htZoomCss = this._getCalculateZoom(nPos, nDuration, bEnd, bReturn);
       
       if(bEnd){
            this._attachTransitionEnd(wel.$value());
        }
        
        if(welZoom){
            //welZoom.css(htZoomCss);
            for(var p in htZoomCss){
                welZoom.$value().style[p] = htZoomCss[p];
            }
            
            //console.log(welZoom.css(this._sCssPrefix+'Transform'), welZoom.css('opacity'),"///" ,htZoomCss[this._sCssPrefix+'Transform'], htZoomCss['opacity']);
        }
        wel.css(htCss);
    },
    
    /**
     * @description wel 엘리먼트의 위치를 css의 translate 속성으로 설정한다. 
 * @param {HTMLElement} wel 위치를 잡을 대상 엘리먼트 
 * @param {Number} nDis touchstart 시점에서 부터의 거리
 * @param {Number} nPos 현재 터치지점의 좌표
 * @param {Number} nDuration 애니메이션 시간 
 * @param {Boolean} bEnd 현재 touchEnd 시점여부 
     */
    _setPositionTransform : function( nDis, nPos, nDuration, bEnd){
        var bReturn = false;
        if(bEnd){
            if(this._htIndexInfo.sDirection !== null){
                if(nDis < 0 && (this._bMoveDirection === 'next') ){
                    nDis =  this._htWElement.base.width()*-1;
                }else if(nDis > 0 && (this._bMoveDirection === 'prev')){
                    nDis =  this._htWElement.base.width();
                }else{
                    nDis = 0;
                    this._htIndexInfo.nNextContentIndex = this._htIndexInfo.nContentIndex;
                    this._htIndexInfo.welNextElement = this._htIndexInfo.welElement;
                    this._htIndexInfo.sDirection = null;
                    bReturn = true;
                    nDuration = this.option('nBounceDuration');
                }
            }else{
                 nDis = 0;
                 bReturn = true;
                 nDuration = this.option('nBounceDuration');
            }
        }
        
        var nX = this.option('bHorizontal')? nDis :0;
        var nY = this.option('bHorizontal')? 0: nDis;
        
       
        var htCss = {};
        htCss[this._sCssPrefix+'TransitionProperty'] = "all";
        htCss[this._sCssPrefix+'TransitionDuration'] =  (nDuration === 0)? '0' : nDuration +"ms" ;
        htCss[this._sCssPrefix+'Transform'] = this._sTranslateStart + nX +"px,"+nY+ "px"+ this._sTranslateEnd;
        
        // console.log(wel.$value(), this._sTranslateStart + nX +"px,"+nY+ this._sTranslateEnd);
        
        var wel = this.getElement();
        var welZoom = this._getZoomElement();
        
        var htZoomCss = this._getCalculateZoom(nPos, nDuration, bEnd, bReturn);
        //console.log(htZoomCss);
      
        if(bEnd){
            this._attachTransitionEnd(wel.$value(), nDuration);
        }
        
        if(welZoom){
            welZoom.css(htZoomCss);
        }
       
        wel.css(htCss);
    },
  
  /**
     * @description 설정값들을 초기화 한다.
     */
    _resetInfo : function(){
        this._bMoveDirection = null;
    },
    
     /**
     * @description welZoom 을 zoom 작업을 진행하기 전에 설정해야 하는 값들을 설정한다. 
 * @param {HTMLElement} welZoom 줌인대상 엘리먼트
     */
    _prepareZoomAnim : function(welZoom){
        //debugger;
          welZoom.show();
          welZoom.$value().style[this._sCssPrefix+'Transform']  =  this._sScaleStart + this.option('nDefaultScale') + ", "+ this.option('nDefaultScale') + this._sScaleEnd;
        
    },
    
    /**
     * @description zoom 되어야할 엘리먼트를 리턴한다.
     */
    _getZoomElement : function(){
        var welZoom = null;
        
        if(this._bMoveDirection  === 'prev'){
            welZoom = this.getPrevElement();
        }else if(this._bMoveDirection  === 'next'){
            welZoom = this.getNextElement();
        }
        
        if(welZoom &&  (welZoom.$value() === this.getElement().$value()) ){
            welZoom = null;
        }
        
        return welZoom;
    },
    
    /**
     * @description  nPos값에 대한 zoom 엘리먼트에 적용할 css를 리턴한다.
 * @param {Number} nPos 현재 터치 지점의 좌표
 * @param {Number} nDuration 애니메이션 시간 
 * @param {Boolean} bEnd touchEnd여부 
 * @param {Boolean} bReturn 패널 방향이 최초 방향과 달라서 플리킹되지 않고 다시 되돌아 가는 애니메이션을 해야 하는지에 대한 여부
     */
    _getCalculateZoom : function(nPos, nDuration, bEnd, bReturn ){
        var nCalculate = 1;
        
        nCalculate = !bEnd? this._getCalculate(nPos) : nCalculate;
        nCalculate = bReturn? 0 : nCalculate;
        
        var nScaleX = this._htOption['nDefaultScale'];
        var htZoomCss = {};
        htZoomCss[this._sCssPrefix+'TransitionDuration'] =  (nDuration === 0)? '0' : nDuration +"ms" ;
        htZoomCss['opacity'] = nCalculate;
        htZoomCss[this._sCssPrefix+'Transform'] = this._sScaleStart +  (nScaleX + nCalculate * (1 - nScaleX) ) + ',' + ( nScaleX + nCalculate * (1 - nScaleX) ) + this._sScaleEnd;
        
        return htZoomCss;
        
    },
    
     /**
     * @description nPos에 대한 적용할 scale 값을 리턴한다.
 * @param {Number} nPos 현재 터치 지점
     */
    _getCalculate : function(nPos){
        var nRange = this.option('bHorizontal')? this._htWElement.base.width() :  this._htWElement.base.height();
    
        var nCalculate =( this._bMoveDirection === 'prev')? 1 + (nPos - nRange) / nRange : ( nRange - nPos ) / nRange ;
        
        return Math.min(1, nCalculate);
          
    },
    
    _restorePanel : function(el){
         for(var i=0,nLen = this._htWElement.aPanel.length;i<nLen;i++){
            var welCurrent = this._htWElement.aPanel[i];
            if(welCurrent.$value() === el){
                this._htWElement.aPanel[i].show().css('zIndex',10).opacity(1);
            }else{
                this._htWElement.aPanel[i].hide().css('zIndex',1).opacity(0.2);
            }
        }
        
        this._htIndexInfo.welElement = this._htIndexInfo.welNextElement;
        
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
        
        var sCss = this.option('bHorizontal')? 'left' : 'top'; 
        
        jindo.$A(this._htWElement.aPanel).forEach(function(value, i, array){
            value.$value().style[this._sCssPrefix +'TransitionDuration'] = null;
            if(this._htOption['bUseTranslate']){
               value.$value().style[this._sCssPrefix+'Transform'] = this._sTranslateStart +"0px, 0px" + this._sTranslateEnd;
            }else{
                value.$value().style[sCss] = '0px';
            }
        },this);
        
        this._restorePanel(this._htIndexInfo.welNextElement.$value());
        //
        
        this._endAnimation(bFireEvent);
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
         }    
        
        for(var i=0,nLen = this._htWElement.aPanel.length;i<nLen;i++){
            if(i === nCenter){
                this._htWElement.aPanel[i].show().css('zIndex',10).opacity(1);
            }else{
                this._htWElement.aPanel[i].hide().css('zIndex',1).opacity(0.2);
            }
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
        this.refresh(nIndex, false, bFireEvent);
    },
    
    /**
     * @description 다음 컨텐츠로 이동한다
 * @param {Object} nDuration 애니메이션 시간
     */
    _moveNext : function(nDuration){
       this._bMoveDirection = 'next';
       var welZoom = this.getNextElement();
       if(welZoom.$value() === this.getElement().$value()){
           return;
       }
       
       this._prepareZoomAnim(welZoom);
       var n = this.option('nFlickThreshold')*-1;
       var nPos =this.option('bHorizontal')? this._htWElement.base.width() :  this._htWElement.base.height();
      
       this._onEnd({
            nDistanceX : n-10,
            nDistanceY : n-10,
            nX : nPos -10,
            nY : nPos -10
        }, nDuration);    
    },
    
   /**
    * @description 이전 컨텐츠로 이동한다
 * @param {Object} nDuration 애니메이션 시간 
    */
    _movePrev : function(nDuration){
        this._bMoveDirection = 'prev';
       var welZoom = this.getPrevElement();
       if(welZoom.$value() === this.getElement().$value()){
           return;
       }
      
        this._prepareZoomAnim(welZoom);
        var n = this.option('nFlickThreshold');
        
        this._onEnd({
            nDistanceX : n+10,
            nDistanceY : n+10,
            nX : 10,
            nY : 10
        }, nDuration);      
    }
}).extend(jindo.m._FlickingAnimation_);
