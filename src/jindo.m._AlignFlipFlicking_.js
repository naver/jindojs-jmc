/**
   AlignFlip flicking 플러그인

    @class jindo.m._AlignFlipFlicking_
    @invisible
    @extends  jindo.m._FlickingAnimation_
    @keyword flip, flicking
    @group Component
**/
jindo.m._AlignFlipFlicking_= jindo.$Class({
    /** @lends jindo.m.SlideFlicking.prototype */
    /**
        초기화 함수
    **/
    sAnimationName  : 'alignFlip',
    $init : function(){
        this._bMoveDirection = null;
        this._bMove = false;
        this._initFlicking();
    },

     _initFlicking : function(){
        this._setElementSize();
        this._setElementStyle();
    },

    /**
     * @override 플리킹에 필요한 스타일을 추가한다.
     */
   _setElementStyle : function(){
       this._htWElement.base.css('overflow','hidden').css('position','relative');
         jindo.$A(this._htWElement.aPanel).forEach(function(value,index, array){
            var wel = value;
            wel.css('position', 'absolute').css('width','100%').css('height','100%');
        });

        this._htWElement.base.css(this._sCssPrefix+'Perspective',1200);
   },
    /**
     * @override 플리킹에 필요한 사이즈를 추가한다.
     */
   _setElementSize : function(){
       this.nWidth = this._htWElement.base.width();
       this.nHeight = this._htWElement.base.height();
   },

    /**
     * @description 플립 되기전에 플립 엘리먼트에 대한 세팅한다.
     */
    _setFlipElement : function(){
        var nBase = 90;
        var welCurrent = this._getFlipElement();
        this._setFlipAlign(welCurrent);

        if(this._bMoveDirection === "prev"){
            if(this._htOption['sFlipAlign'] ==="left"){
                this._rotate(welCurrent, nBase*-1);
            }else if(this._htOption['sFlipAlign'] ==="top"){
                this._rotate(welCurrent, nBase);
            }
        }else if(this._bMoveDirection === "next"){
            if(this._htOption['sFlipAlign'] ==="bottom"){
                this._rotate(welCurrent, nBase*-1);
            }else if(this._htOption['sFlipAlign'] ==="right"){
                this._rotate(welCurrent, nBase);
            }
        }

        welCurrent.show().css('zIndex', 110);

        var welNext = (this._bMoveDirection === "prev")? this.getPrevElement():this.getNextElement();

        if(welNext.$value() !== welCurrent.$value()){
            welNext.show().css('zIndex', 90);
        }
    },

    /**
     * @description 플립되어야 하는 엘리먼트를 리턴한다.
     * @return {Element}
     */
    _getFlipElement : function(){
        var welCurrent = this.getContentElement();
        if(this._bMoveDirection === "prev"){
             if(this.option('sFlipAlign') === "left" || this.option('sFlipAlign')=="top"){
                 welCurrent = this.getPrevElement();
             }
        }else if(this._bMoveDirection === "next"){
             if(this.option('sFlipAlign') === "right" || this.option('sFlipAlign')=="bottom"){
                 welCurrent = this.getNextElement();
             }
        }
        return welCurrent;
    },

     /**
     * @description wel의 flip 정렬을 설정한다.
     */
    _setFlipAlign : function(wel){
        var sAlign = "";
        if(this.option('bHorizontal')){
            sAlign = this.option('sFlipAlign') + " center";
        }else{
            sAlign =  "center " + this.option('sFlipAlign');
        }

        wel.css( this._sCssPrefix+ "TransformOrigin" , sAlign );
    },

    /**
     * @description wel의 rotate를 설정하는 메소드
     * @param {Element} wel
     * @param {Number} nDeg
     */
    _rotate : function(wel, nDeg){
        if(wel){
            var sRotate = this.option('bHorizontal')?  "rotateY(" + nDeg + "deg)" : "rotateX(" + nDeg + "deg)";
            var htCss = {};
            htCss[this._sCssPrefix+"Transition"] = this._sCssPrefix+"-transform 0s linear";
            htCss[this._sCssPrefix+"Transform"] =  "perspective(500px) " + sRotate + " rotateZ(0deg)";

            wel.css(htCss);
        }

        return wel;
    },

    /**
     * @description 이전 플리킹에 대한  플립을 진행한다
     * @param {Element} 플립 대상 엘리먼트
     * @param {Number}  deg
     */
    _setPrevRotate : function(welTarget, nDeg){
        var nCDeg = this.option('bHorizontal')? nDeg : -nDeg;

        var nBaseDeg = 0;
        if(this.option('sFlipAlign') ==="left"){
            nBaseDeg = -70;
        }else if(this.option('sFlipAlign') ==="top"){
            nBaseDeg = 80;
        }

        var nCurrentDeg = nBaseDeg + nCDeg;


        if(this.option('sFlipAlign') === "right"){
            nCurrentDeg = Math.min(90, nCurrentDeg);
        }else if(this.option('sFlipAlign') === "bottom"){
            nCurrentDeg = Math.max(-90, nCurrentDeg);
        }else if(this.option('sFlipAlign') === "left"){
            nCurrentDeg = Math.min(0, nCurrentDeg);
        }else{
            nCurrentDeg = Math.max(0, nCurrentDeg);
        }

        this._rotate(welTarget, nCurrentDeg).css('zIndex', 110);
    },

    /**
     * @description 이후 플리킹에 대한  플립을 진행한다
     * @param {Element} 플립 대상 엘리먼트
     * @param {Number}  deg
     */
    _setNextRotate : function(welTarget, nDeg){
        var nCDeg = this.option('bHorizontal')? -nDeg : nDeg;
        var nMinDeg = 0;

        var nBaseDeg = 0;
        if(this.option('sFlipAlign') ==="right"){
            nBaseDeg = 70;
        }else if(this.option('sFlipAlign') ==="bottom"){
            nBaseDeg = -80;
        }
        var nCurrentDeg = nBaseDeg + nCDeg;

        if(this.option('sFlipAlign') === "top"){
            nCurrentDeg = Math.min(90, nCurrentDeg);
        }else if(this.option('sFlipAlign')=== "left"){
            nCurrentDeg = Math.max(-90, nCurrentDeg);
        }else if(this.option('sFlipAlign') === "bottom"){
            nCurrentDeg = Math.min(0, nCurrentDeg);
        } else{
            nCurrentDeg = Math.max(0, nCurrentDeg);
        }


        this._rotate(welTarget, nCurrentDeg).css('zIndex', 110);
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
      if(this._bMoveDirection === null){
              if(nDis > 0){  //
                      this._bMoveDirection = 'prev';
              }else if(nDis < 0){
                      this._bMoveDirection = 'next';
              }else{
                      return;
              }
              this._setFlipElement();

              this._restoreAnchor();
              this._setAnchorElement();
              this._clearAnchor();

          }else{
               var nSize = this.option('bHorizontal')? this.nWidth : this.nHeight;
               var welTarget = this.getContentElement();
               if(this._bMoveDirection === 'prev'){
                      if(this.option('sFlipAlign') ==="left" || this.option('sFlipAlign') === "top"){
                            welTarget  = this.getPrevElement();
                      }
                      this._nDeg =Math.max(0, Math.min(70, Math.round((nDis * 1/(nSize)) * 70)));
                      this._setPrevRotate(welTarget, this._nDeg);

               }else if(this._bMoveDirection === 'next'){
                       if(this.option('sFlipAlign') ==="right" || this.option('sFlipAlign') === "bottom"){
                            welTarget  = this.getNextElement();
                      }

                      this._nDeg = Math.max(0, Math.min(70, Math.round((nDis * -1/(nSize)) * 70)));
                      // console.log(welTarget.$value(), this._nDeg);
                      this._setNextRotate(welTarget, this._nDeg);
               }

          }

          this._bMove = true;
  },

  /**
   * @override
   */
  _onAfterEnd : function(){
      //this._htIndexInfo 에 정보가 있음
      // if(this._htIndexInfo.sDirection === null){
          // //제자리로 돌아가야함
      // }else{
        this._bFinished = false;
        var bRepos = (this._htIndexInfo.sDirection === null)? true : false;
        if(this._bMoveDirection !== this._htIndexInfo.sDirection){
            bRepos = true;
            this._htIndexInfo.sDirection = null;
            this._htIndexInfo.nNextContentIndex = this._htIndexInfo.nContentIndex;
            this._htIndexInfo.welNextElement = this._htIndexInfo.welElement;
        }

        if(this._bMoveDirection === "prev" && (this.getElement().$value() === this.getPrevElement())){
            bRepos = true;
            this._htIndexInfo.sDirection = null;
            this._htIndexInfo.nNextContentIndex = this._htIndexInfo.nContentIndex;
            this._htIndexInfo.welNextElement = this._htIndexInfo.welElement;
        }

        if(this._bMoveDirection === "next" && (this.getElement().$value() === this.getNextElement().$value())){
            bRepos = true;
            this._htIndexInfo.sDirection = null;
            this._htIndexInfo.nNextContentIndex = this._htIndexInfo.nContentIndex;
            this._htIndexInfo.welNextElement = this._htIndexInfo.welElement;
        }

        var welCurrent = this._getFlipElement();

        var self = this;

        var nDuration = bRepos? this.option('nBounceDuration') : this.option('nDuration');
        var nTotalDig = bRepos? 0 : 90;

         if(this._nDeg === 0){
              this._bFinished = true;
              setTimeout(function(){
                      self._onTransitionEnd();
               },10);
          }else{
              var startTime = (new Date()).getTime(),
                  nStartDeg = this._nDeg,
                  nMinDeg = 90;

               (function timer(){
                                var now = (new Date()).getTime(),nEaseOut;
                                if (now >= startTime + nDuration) {
                                      //clearTimeout(self._nTimerAnimate);
                                      cancelAnimationFrame(self._nTimerAnimate);
                                       if(self._bMoveDirection === 'next'){
                                             self._setNextRotate(welCurrent, nTotalDig);
                                        }else{
                                             self._setPrevRotate(welCurrent,nTotalDig );
                                        }
                                      self._onTransitionEnd();
                                      return;
                                 }
                                 now = (now - startTime) / nDuration - 1;
                                 nEaseOut = Math.sqrt(1 - Math.pow(now,2));
                                 var nDeg = (nTotalDig - nStartDeg)*nEaseOut + nStartDeg;
                                 //console.log('--END ' + nDeg, self._nDeg);
                                 self._nDeg = Math.min(nDeg, nMinDeg);
                                 if(self._bMoveDirection === 'next'){
                                      self._setNextRotate(welCurrent, self._nDeg);
                                 }else{
                                      self._setPrevRotate(welCurrent,  self._nDeg);
                                 }
                                 //self._nTimerAnimate = setTimeout(timer, 10);
                                 self._nTimerAnimate = requestAnimationFrame(timer);

                  }());
          }

  },

  _resetInfo : function(){
        this._bMoveDirection = null;
        this._bMove = false;
        this._nDeg = -1;
        this._bFinished = true;
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

        this._restorePanel(this._htIndexInfo.welNextElement.$value());
        this._resetInfo();
        this._endAnimation(bFireEvent);
    },

    /**
     * @description 화면 패널에 대하 show/hide 부분 수정
     */
    _restorePanel : function(el){
         jindo.$A(this._htWElement.aPanel).forEach(function(value, i, array){
            value.$value().style[this._sCssPrefix +'TransitionDuration'] = null;
            value.$value().style[this._sCssPrefix +'Transform'] = '';
            if(value.$value() === el){
                value.show().css('zIndex', 10);
            }else{
                 value.hide().css('zIndex', 1);
            }
        },this);

    },


    /**
     * @description n번째 패널 중앙에 오도록 panel을 다시 좌우 배열해서 배치한다.
     * @param {Number} n 현재 화면에 보여져야할 content의 인덱스
     * @param {Boolean} bResize 화면 크기가 변화되어 다시 사이즈를 업데이트 해야 할경우 true
     * @param {Boolean} bFireEvent 커스텀이벤트 발생여부
     */
    _refresh : function(n, bResize){
        if(typeof n === 'undefined'){
            n = this.getContentIndex();
        }
        var nCenter = n;
        if(this.option('bUseCircular')){
            nCenter = n%3;
        }

        if(bResize){
             this._setElementSize();
        }
        this._htWElement.base.css(this._sCssPrefix+"PerspectiveOrigin", "50% 50%");

        for(var i=0,nLen = this._htWElement.aPanel.length;i<nLen;i++){
            if(i === nCenter){
                this._htWElement.aPanel[i].show().css('zIndex',10);
            }else{
                this._htWElement.aPanel[i].hide().css('zIndex',1);
            }
        }

        this._htIndexInfo.nContentIndex = n;
        this._htIndexInfo.welElement = this._htWElement.aPanel[nCenter];

    },

    /**
     * @override
     * @description n 컨텐츠로 이동한다
 * @param {Number} n 컨텐츠 인덱스
 * @param {Number} nDruation  애니메이션 시
 * @param {Boolean} flicking  커스텀 이벤트 발생여부
     */
    _moveTo : function(n, nDruation, bFireEvent){
         this.refresh(n, false, bFireEvent);
    },

      /**
     * @description 이전 컨텐츠로 이동한다.
 * @param {Number} nDuration 애니메이션 시간
     */
   _movePrev : function(nDuration){
       this._bMoveDirection = 'prev';
       this._bMove = true;
       this._nDeg = 1;

        var n = this.option('nFlickThreshold');
        this._setFlipElement();
        this._onEnd({
            nDistanceX : n+10,
            nDistanceY : n+10,
            nX : 10,
            nY : 10
        }, nDuration);
    },

     /**
     * @description 이후 컨텐츠로 이동한다.
 * @param {Number} nDuration 애니메이션 시간
     */
    _moveNext : function(nDuration){
       this._bMoveDirection = 'next';
       this._bMove = true;
       this._nDeg = 1;
        this._setFlipElement();
       var n = this.option('nFlickThreshold')*-1;
       var nPos = this.option('bHorizontal')? this._htWElement.base.width() :  this._htWElement.base.height();

       this._onEnd({
            nDistanceX : n-10,
            nDistanceY : n-10,
            nX : nPos -10,
            nY : nPos -10
        }, nDuration);
    }
}).extend(jindo.m._FlickingAnimation_);
