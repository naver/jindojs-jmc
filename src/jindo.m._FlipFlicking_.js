
/**
   Flip flicking 플러그인

    @class jindo.m._FlipFlicking_
    @invisible
    @extends  jindo.m._FlickingAnimation_
    @keyword flip, flicking
    @group Component
**/
jindo.m._FlipFlicking_ = jindo.$Class({
    /** @lends jindo.m._FlipFlicking_.prototype */
    /**
        초기화 함수
    **/
    sAnimationName  : 'flip',

    $init : function(){
        this._bMoveDirection = null;
        this._bMove = false;
        this._initFlicking();
    },
    _initFlicking : function(){
        this._setElementSize();
        this._setElementStyle();
        this._prepareFlip();
    },

    _prepareFlip : function(){
       if(typeof this._htWElement.left === 'undefined'){
           this._htWElement.base.css(this._sCssPrefix+'Perspective',1200);

           var sPrevClass = this.option('sClassPrefix') + "left";
           var sNextClass = this.option('sClassPrefix') + "right";

           this._htWElement.container.append(jindo.$('<div class="'+sPrevClass+'" style="position:absolute;overflow:hidden;left:0px;top:0px;outline:1px solid rgba(255, 0, 0, .0);"></div>'));
           this._htWElement.container.append(jindo.$('<div class="'+ sNextClass +'"  style="position:absolute;overflow:hidden;left:0px;top:0px;outline:1px solid rgba(255, 0, 0, .0);"></div>'));
           this._htWElement.container.height(this._htWElement.base.height());

           this._htWElement.left = jindo.$Element(jindo.$$.getSingle("."+sPrevClass,  this._htWElement.container.$value()));
           this._htWElement.right = jindo.$Element(jindo.$$.getSingle("."+sNextClass,  this._htWElement.container.$value()));
           if(this.option('bHorizontal')){
               this._htWElement.left.css("height", "100%");
               this._htWElement.right.css("height", "100%");
           }else{
               this._htWElement.left.css("width" ,"100%");
               this._htWElement.right.css("width", "100%");
           }

       }

       if(this.option('bHorizontal')){
           this._htWElement.left.width(this.nCenter);
           this._htWElement.right.width(this.nCenter);
       }else{
           this._htWElement.left.height(this.nCenter);
           this._htWElement.right.height(this.nCenter);
       }
    },

     /**
     *  플리킹에 필요한 스타일을 추가한다.
     */
    _setElementStyle : function(){
        this._htWElement.base.css('overflow','hidden');
        this._htWElement.container.css('position','relative').height( this.nHeight );
         jindo.$A(this._htWElement.aPanel).forEach(function(value,index, array){
            var wel = value;
            wel.css('position', 'absolute').css('width','100%').css('height','100%');
        });
    },

     /**
     *  플리킹에 필요한 사이즈를 추가한다.
     */
    _setElementSize : function(){
        this.nWidth = this._htWElement.base.width();
        this.nHeight = this._htWElement.base.height();
        this.nCenter = Math.round((this.option('bHorizontal')? this.nWidth: this.nHeight) / 2);
    },

    _refresh : function(n, bResize ){
        if(typeof n === 'undefined'){
            n = this.getContentIndex();
        }
        var nCenter = n;

        if(this.option('bUseCircular')){
            nCenter = n%3;
        }

        if(bResize){
             this._setElementSize();
             this._prepareFlip();
        }
        this._htWElement.left.hide().show();
        this._htWElement.right.hide().show();

        this._htWElement.right.css(this.option('bHorizontal')?"left" : "top" ,  (this.nCenter) + "px");
        var htCss ={};
        htCss[this._sCssPrefix+"PerspectiveOrigin"] = "50% 50%";

        this._htWElement.base.css(htCss);

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


    _setCloneElement : function(){
        var bH = this.option('bHorizontal');
        var welCurrent = this.getContentElement();
        var welShow;
        if( this._bMoveDirection === 'prev'){
             welShow = this.getPrevElement();
             if(welShow.$value() === welCurrent.$value()){
                 this._htWElement.left.empty().append(jindo.$Element(jindo.$('<div></div>')).show().width(this.nWidth));
             }else{
                 this._htWElement.left.empty().append(jindo.$Element(welShow.$value().cloneNode(true)).show().width(this.nWidth));
             }

             this._htWElement.right.empty().append(jindo.$Element(welCurrent.$value().cloneNode(true)).css(bH?"margin-left" :"margin-top", "-" + (this.nCenter) + "px").width(this.nWidth).height(this.nHeight));
             welShow.before(this._htWElement.left).after(this._htWElement.right);
        }else if( this._bMoveDirection === 'next'){
             welShow = this.getNextElement();
             this._htWElement.left.empty().append(jindo.$Element(welCurrent.$value().cloneNode(true)).show().width(this.nWidth));
             if(welShow.$value() === welCurrent.$value()){
                 this._htWElement.right.empty().append(jindo.$Element(jindo.$('<div></div>')).show().css(bH?"margin-left" :"margin-top", "-" + (this.nCenter) + "px").width(this.nWidth).height(this.nHeight));
             }else{
                this._htWElement.right.empty().append(jindo.$Element(welShow.$value().cloneNode(true)).show().css(bH?"margin-left" :"margin-top", "-" + (this.nCenter) + "px").width(this.nWidth).height(this.nHeight));
             }
             welCurrent.before(this._htWElement.left).after(this._htWElement.right);
        }
    },

    _onAfterMove : function(nDis, nVector, nPos){
          if(this._bMoveDirection === null){
              if(nDis > 0){  //
                      this._bMoveDirection = 'prev';
              }else if(nDis < 0){
                      this._bMoveDirection = 'next';
              }else{
                      return;
              }
              this._setCloneElement();

              this._restoreAnchor();
              this._setAnchorElement();
              this._clearAnchor();
          }else{
               var nSize = this.option('bHorizontal')? this.nWidth : this.nHeight;
               var welCurrent = this.getContentElement(),
                   welTarget,nAngle;
               if(this._bMoveDirection === 'prev'){
                      welTarget  = this.getPrevElement();
                      nAngle = (welTarget.$value() === welCurrent.$value())? 60 : 180;
                      this._nDeg =Math.max(0, Math.min(nAngle, Math.round((nDis * 1/(nSize)) * nAngle)));
                      this._setPrevRotate(welCurrent , welTarget,  this._htWElement.left, this._htWElement.right, this._nDeg);

               }else if(this._bMoveDirection === 'next'){
                      welTarget = this.getNextElement();
                      nAngle = (welTarget.$value() === welCurrent.$value())? 60 : 180;
                      this._nDeg = Math.max(0, Math.min(nAngle, Math.round((nDis * -1/(nSize)) * nAngle)));
                      this._setNextRotate(welCurrent ,welTarget,  this._htWElement.left, this._htWElement.right, this._nDeg);
               }
          }

          this._bMove = true;

    },

    _onAfterEnd : function(){
        if(this._bMove){
            this._flipAnimate();
        }
    },
    _rotate : function(wel, nDeg){
        if(wel){
            var sRotate = this.option('bHorizontal')?  "rotateY(" + nDeg + "deg)" : "rotateX(" + nDeg + "deg)";

            var htCss ={};
                htCss[this._sCssPrefix + "Transition"] = this._sCssPrefix+"-transform 0s linear";
                htCss[this._sCssPrefix +"Transform"] = "perspective(500px) " + sRotate + " rotateZ(0deg)";

            wel.css(htCss);
        }

        return wel;
    },



    _setBackgroundShadow : function(wel, nDeg){
         var n = (nDeg > 90) ? (180 - nDeg) : nDeg,
            h,
            hex = "#000000";

         h = Number(Math.round((n / 90) * 255)).toString(16);
            if (h.length < 2) {
                h = h + h;
            }
            hex = "#" + h + h + h;

            wel.css("background-image", "-webkit-gradient(linear, 100% 0%, 0% 0%, from("+ hex +"), to("+ hex +"))");
             wel.css("background-image", "-ms-gradient(linear, 100% 0%, 0% 0%, from("+ hex +"), to("+ hex +"))");


            return wel;

    },

    _clearBackgrond : function(wel){
         return wel.css({
            "background-image" : "",
            "background-color" : "#fff"
        });
    },


    _setNextRotate : function(welCurrent, welShow, welLeft, welRight, nDeg){
         //console.log('_set next', nDeg);
        var nCurrentDeg = this.option('bHorizontal')? -nDeg : nDeg;
        var nShowDeg = this.option('bHorizontal')? (180 - nDeg):  -(180 - nDeg);
        if(welCurrent.$value() === welShow.$value()){
            welShow = null;
        }

        this._rotate(welCurrent, nCurrentDeg).addClass('gradient');
        if(welShow){
            this._rotate(welShow, nShowDeg).addClass('gradient');
        }

       // welShow.addClass("gradient").rotateY(180 - nDeg);

           if (nDeg === 0) {
                welLeft.hide();
                welRight.hide();

                if(welShow){
                    this._rotate(welShow, 0).hide();
                }
             //   welShow.rotateY(0).hide().removeClass("gradient");
            } else if (nDeg < 90) {

                setTimeout(function(){
                    //welLeft.show('').offset();
               },0);
                welLeft.show('inline-block');
               welRight.show();
               welLeft.css('zIndex', 110);
               welCurrent.css('zIndex', 100);
               welRight.css('zIndex', 90);
               this._clearBackgrond(welLeft.first());
               this._setBackgroundShadow(welRight.first(), nDeg);

                welCurrent.show();
                if(welShow){
                welShow.hide();
                }
            } else if (nDeg < 180){
                welShow.show().css('zIndex', 100);

                welCurrent.hide();
                welLeft.show().css('zIndex', 90);
                welRight.show().css('zIndex', 110);

                this._setBackgroundShadow(welLeft.first(), nDeg);
                this._clearBackgrond(welRight.first());
                welShow.show();

                welCurrent.hide();

            } else {
                welLeft.hide();
                welRight.hide();

                //welShow.removeClass("gradient");
            }

    },

    _setPrevRotate : function(welCurrent, welShow, welLeft, welRight,nDeg){
        //console.log('_set prev', nDeg);
        var bH = this.option('bHorizontal');
        var nCurrentDeg = bH? nDeg : -nDeg;
        var nShowDeg = bH? -(180 - nDeg) :  (180 - nDeg);
        //var nCurrentDeg =nDeg;
        //var nShowDeg = -(180 - nDeg);

        if(welCurrent.$value() === welShow.$value()){
            welShow = null;
        }

        this._rotate(welCurrent,nCurrentDeg).addClass('gradient');
        if(welShow){
            this._rotate(welShow, nShowDeg ).addClass('gradient');
        }

        if (nDeg === 0) {
                welLeft.hide();
                welRight.hide();

                welCurrent.removeClass("gradient");
                if(welShow){
                    this._rotate(welShow, 0).hide().removeClass("gradient");
                }
               // welShow.rotateY(0).hide().removeClass("gradient");
            } else if (nDeg < 90) {
                //welCloneLeft.show().first().setBackgroundShadow(nDeg);
                //welCloneRight.show().first().clearBackground();
                welLeft.show().css('zIndex', 90);
                welRight.show().css('zIndex', 110);
                this._setBackgroundShadow(welLeft.first(), nDeg);
                this._clearBackgrond(welRight.first());

                welCurrent.show().css('zIndex', 100);
                if(welShow){
                    welShow.hide();
                }
            } else if (nDeg < 180){
                //welCloneLeft.show().first().clearBackground();
                //welCloneRight.show().first().setBackgroundShadow(nDeg);
                welLeft.show().css('zIndex', 110);
                welRight.show().css('zIndex',90);
                this._clearBackgrond(welLeft.first());
                this._setBackgroundShadow(welRight.first());

                welCurrent.hide();
                if(welShow){
                    welShow.show().css('zIndex', 100);
                }
            } else {
                welLeft.hide();
                welRight.hide();

                if(welShow){
                    welShow.removeClass("gradient");
                }
            }
    },

    _flipAnimate : function(){
        this._bFinished = false;
        var bRepos = (this._htIndexInfo.sDirection === null)? true : false;
        var welCurrent = this.getContentElement();
        var self = this;
        var welShow = null;
         if(this._bMoveDirection === 'next'){
              welShow = this.getNextElement();
         }else if(this._bMoveDirection === 'prev'){
              welShow = this.getPrevElement();
         }

         if(welCurrent.$value() === welShow.$value()){
             bRepos = true;
             this._htIndexInfo.sDirection = null;
         }

        var nDuration = bRepos? this.option('nBounceDuration') : this.option('nDuration');
        var nTotalDig = bRepos? 0 : 180;
         if(this._nDeg === 0){
              this._bFinished = true;
              setTimeout(function(){
                          self._onTransitionEnd();
               },10);
          }else{
              var startTime = (new Date()).getTime(),
                  nStartDeg = this._nDeg;
               (function timer(){
                                var now = (new Date()).getTime(),nEaseOut;
                                if (now >= startTime + nDuration) {
                                      cancelAnimationFrame(self._nTimerAnimate);
                                      self._onTransitionEnd();
                                      return;
                                 }
                                 now = (now - startTime) / nDuration - 1;
                                 nEaseOut = Math.sqrt(1 - Math.pow(now,2));
                                 var nDeg = (nTotalDig - nStartDeg)*nEaseOut + nStartDeg;
                                 self._nDeg = Math.min(nDeg, 180);
                                 if(self._bMoveDirection === 'next'){
                                     self._setNextRotate(welCurrent, welShow, self._htWElement.left, self._htWElement.right, self._nDeg);
                                 }else{
                                     self._setPrevRotate(welCurrent, welShow, self._htWElement.left, self._htWElement.right, self._nDeg);
                                 }
                                 self._nTimerAnimate = requestAnimationFrame(timer);

                  }());
          }
    },


    _onAfterStart : function(){
        this._resetInfo();
    },

    _resetInfo : function(){
        this._bMoveDirection = null;
        this._bMove = false;
        this._nDeg = -1;
        this._bFinished = true;
        this._htWElement.left.css('zIndex', 1);
        this._htWElement.right.css('zIndex', 1);
    },

    _onTransitionEnd : function(){
        var bFireEvent = true;
        if(this._htIndexInfo.sDirection === null){
            bFireEvent = false;
        }

        jindo.$A(this._htWElement.aPanel).forEach(function(value, i, array){
            value.$value().style[this._sCssPrefix +'TransitionDuration'] = null;
            value.$value().style[this._sCssPrefix +'Transform'] = '';
        },this);

        this._resetInfo();
        this._endAnimation(bFireEvent);
    },

     /**
     * @description 이전 컨텐츠로 이동한다.
 * @param {Number} nDuration 애니메이션 시간
     */
   _movePrev : function(nDuration){
       this._bMoveDirection = 'prev';
       this._bMove = true;
       this._nDeg = 1;
       this._setCloneElement();

        var n = this.option('nFlickThreshold');
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
       this._setCloneElement();
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
