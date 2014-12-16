/**
    @fileOverview  flicking 상위 클래스
    @author "oyang2"
    @version #__VERSION__#
    @since  2012. 05. 24

**/
/**
   flicking 상위 클래스

    @class jindo.m._FlickingAnimation_
    @uses jindo.m.Flicking
    @invisible
    @keyword flicking
    @group Component
**/

jindo.m._FlickingAnimation_ = jindo.$Class({
     /** @lends jindo.m._FlickingAnimation_.prototype */
    /**
     * @description 초기화 함수
     * @constructs
     */
     $init : function(sId, htUserOption){
         this.option(htUserOption || {});
         this._setWrapperElement(sId);
         this._initVar();
         this._initTouch();
         this._createDummyTag();

         if(this.option("bActivateOnload")) {
             this.activate();
         }
     },

     _initVar : function(){
         this._oTouch = null; //touch 인스턴스
         this._doFlicking = false;
         this._bTouchStart  = false;
         this._bMove = false;

         var nDefaultIndex = this.option('nDefaultIndex')||0;
         if(!this._checkIndex(nDefaultIndex)){ nDefaultIndex = 0;}
         if(this.option('bUseCircular')){ nDefaultIndex = nDefaultIndex%3;}

         this._htIndexInfo = {
             nContentIndex : nDefaultIndex,
             nNextContentIndex : nDefaultIndex,
             welElement : this._htWElement.aPanel[nDefaultIndex],
             welNextElement : this._htWElement.aPanel[nDefaultIndex],
             sDirection : null
         };

         var htInfo = jindo.m.getDeviceInfo();
         this._isIos = (htInfo.iphone || htInfo.ipad);
         this._bAndroid = htInfo.android && (!htInfo.bChrome);
         this._nVersion = htInfo.version;
         this._fnDummyFnc = function(){return false;};
         this._bClickBug = jindo.m.hasClickBug();
         this._sCssPrefix = jindo.m.getCssPrefix();
         this._elTransition  = null;

         this._wfTransitionEnd = jindo.$Fn(this._onTransitionEnd, this).bind();


         //더미 엘리먼트를 만들어서 focus 호출해야 하는 것들
         this._bDummyTagException = (this._bAndroid && (this._nVersion < "3") );
     },

     /**
      *  플리킹 내부에서 쓰는 엘리먼트를 저장한다.
      */
     _setWrapperElement : function(sId){
         this._htWElement = {}; //baseElement
         var el = jindo.$(sId);
         var sClass = '.'+ this.option('sClassPrefix');
         // zIndex 2000 추가
         this._htWElement.base = jindo.$Element(el).css("zIndex", this.option("nZIndex"));
         this._htWElement.container = jindo.$Element(jindo.$$.getSingle(sClass+'container',el));
         var aContents = jindo.$$(sClass+this.option('sContentClass'), el);

         this._htWElement.aPanel = jindo.$A(aContents).forEach(function(value,index, array){
             array[index] = jindo.$Element(value);
         }).$value();

         //ie10 대응 코드
         // if(typeof this._htWElement.base.$value().style.msTouchAction !== 'undefined'){
             // this._htWElement.base.css('msTouchAction','none');
         // }
     },

     /**
      * 플리킹 시작전에 설정해야 하는 스타일 및 사이즈들을 설정한다.
      */
     _initFlicking : function(){
         this._setElementStyle();
         this._setElementSize();
     },

     /**
      * @override 할것
      */
     _setElementStyle : function(){

     },

     /**
      * @override 할것
      */
     _setElementSize : function(){

     },

     /**
      *     플리킹 내부에서 사용하는 터치컴포넌트 인스턴스 생성한다.
      */
     _initTouch : function(){
         this._oTouch = new jindo.m.Touch(this._htWElement.base.$value(),{
            nSlopeThreshold : 4,
            nMoveThreshold : 0,
            nEndEventThreshold : (jindo.m.getDeviceInfo().win)? 400:0,
            bActivateOnload : false,
            bHorizental : this.option("bHorizontal"),
            bVertical : false
        });
     },

     /**
       안드로이드 전용 랜더링 버그 해결을 위한 더미 태그를 만든다.
     */
    _createDummyTag : function(){
        //android 포커스를 위한 더미 태그가 필요
        if(this._bDummyTagException) {
            //debugger;
            this._htWElement.aDummyTag = [];
            for(var i=0,nLen = this._htWElement.aPanel.length;i<nLen;i++){
                var wel =this._htWElement.aPanel[i];
                var elDummyTag = jindo.$$.getSingle("._cflick_dummy_atag_", wel.$value());
                if(!elDummyTag){
                    elDummyTag = jindo.$("<a href='javascript:void(0);' class='_cflick_dummy_atag_'></a>");
                    elDummyTag.style.position = "absolute";
                    elDummyTag.style.left = "-1000px";
                    elDummyTag.style.top = "-1000px";
                    elDummyTag.style.width = 0;
                    elDummyTag.style.height = 0;
                    wel.append(elDummyTag);
                }
                this._htWElement.aDummyTag.push(elDummyTag);
            }
        }
    },

    /**
        안드로이드에서 css 속성을 사용해서 transform 이후에 포커스를 잃는 현상의 버그 수정하는 코드
    **/
    _focusFixedBug : function(){
        if(!this._htWElement || typeof this._htWElement.aDummyTag === 'undefined'){
            return;
        }

        for(var i=0,nLen= this._htWElement.aDummyTag.length;i<nLen;i++){
            this._htWElement.aDummyTag[i].focus();
        }
    },

     /**
      *     터치 이벤트의 start 이벤트 핸들러
      */
     _onStart : function(oCustomEvent){
         if (this._doFlicking) {
             return;
         }

       /**
            플리킹영역에 터치가 시작되었을 때 발생한다

            @event touchStart
            @param {String} sType 커스텀 이벤트명
            @param {HTMLElement} element 현재 터치된 영역의 Element
            @param {Number} nX 터치 영역 X좌표
            @param {Number} nY 터치 영역 Y좌표
            @param {object} oEvent jindo.$Event object
            @param {Function} stop 플리킹 액션이 수행되지 않는다
            @history 1.2.0 Update Custom Event 추가
        **/
       if(!this.fireEvent('touchStart', oCustomEvent)){
           oCustomEvent.stop();
           return;
        }

        this._bTouchStart = true;
        this._clearAnchor();
        this._onAfterStart();
     },

     /**
      * @override
      */
     _onAfterStart : function(){

     },

     _onMove : function(oCustomEvent){
        var bH = this.option('bHorizontal');
        /** 시스템 스크롤 막기 */
        var weParent = oCustomEvent.oEvent;
        if(oCustomEvent.sMoveType === jindo.m.MOVETYPE[0]) {  //수평이고,수평스크롤인 경우 시스템 스크롤 막기
            if(bH) {
                weParent.stop(jindo.$Event.CANCEL_ALL);
            }else{
             /**
                플리킹 액션이 아닌 기본 스크롤 기능이 발생될 때

                @event scroll
                @param {String} sType 커스텀 이벤트명
                @param {Function} stop 수행시 영향 받는것 없다.
                @history 1.5.0 Update Custom Event 추가
            **/
                this.fireEvent('scroll');
                this._bTouchStart = false;
                return;
            }
        } else if(oCustomEvent.sMoveType === jindo.m.MOVETYPE[1]) {   //수직이고, 수직스크롤인 경우 시스템 스크롤 막기
            if(!bH) {
                weParent.stop(jindo.$Event.CANCEL_ALL);
            }else{
                this.fireEvent('scroll');
                this._bTouchStart = false;
                return;
            }
        }else if(oCustomEvent.sMoveType === jindo.m.MOVETYPE[2]) {
            //대각선 일때 시스템 스크롤 막기
            if(this.option('bUseDiagonalTouch')){
                weParent.stop(jindo.$Event.CANCEL_ALL);
            }else{
                this.fireEvent('scroll');
                this._bTouchStart = false;
                return;
            }
        }

        if (this._doFlicking) {
            return;
        }
        if(!this._bTouchStart){
            return;
        }

        /**
            플리킹영역에 터치 움직임이 있을 때 발생한다. Touch이벤트의 'touchMove'와 동일하다

            @event touchMove
            @param {String} sType 커스텀 이벤트명
            @param {String} sMoveType 현재 분석된 움직임
            @param {HTMLElement} stopelement 현재 터치된 영역의 Element
            @param {Number} nX 터치영역의 X좌표
            @param {Number} nY 터치 영역의 Y좌표
            @param {Number} nVectorX 이전 touchMove(혹은 touchStart)의 X좌표와의 상대적인 거리.(직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
            @param {Number} nVectorY 이전 touchMove(혹은 touchStart)의 Y좌표와의 상대적인 거리.(직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
            @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리.(touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
            @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리.(touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
            @param {Number} nStartX touchStart의 X좌표
            @param {Number} nStartY touchStart의 Y좌표
            @param {Object} oEvent jindo.$Event object
            @param {Function} stop수행시 영향 받는것 없다.
            @history 1.2.0 Update Custom Event 추가
        **/
        this.fireEvent('touchMove', oCustomEvent);

        var nDis = bH? oCustomEvent.nDistanceX : oCustomEvent.nDistanceY;
        var nVector = bH? oCustomEvent.nVectorX : oCustomEvent.nVectorY;
        var nPos = bH? oCustomEvent.nX : oCustomEvent.nY;

        this._onAfterMove(nDis, nVector, nPos);
        this._bMove = true;
     },

     /**
      * @override
      */
     _onAfterMove : function(nDis, nVector, nPos){

     },

     /**
      * touchend bind 코드
      */
     _onEnd : function(oCustomEvent, nDuration){
            if (this._doFlicking) {
                return;
            }
            if(!this._bTouchStart){
                return;
            }

            this._doFlicking = true;

            var bH = this.option('bHorizontal');

            //스크롤일경우 뒤의 click이벤트를 막기위한 코드 젤리빈의 경우 아래 코드 실행시 시스템 스크롤의 가속 기능이 꺼진다.
            if( !(this._bAndroid && (this._nVersion >= "4.1")) ){
                if (oCustomEvent.sMoveType === jindo.m.MOVETYPE[0] || oCustomEvent.sMoveType === jindo.m.MOVETYPE[1] || oCustomEvent.sMoveType === jindo.m.MOVETYPE[2]) {
                    oCustomEvent.oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
                }
            }

            //탭 혹은 롱탭일때
            if (oCustomEvent.sMoveType === jindo.m.MOVETYPE[3] || oCustomEvent.sMoveType === jindo.m.MOVETYPE[4]) {
                this._restoreAnchor();
            }

            var nTime = this.option('nDuration');
            var htInfo = this._getSnap(oCustomEvent.nDistanceX, oCustomEvent.nDistanceY, nTime, oCustomEvent.sMoveType);

            var nDis = bH? oCustomEvent.nDistanceX: oCustomEvent.nDistanceY;
            var nVector = bH? oCustomEvent.nVectorX : oCustomEvent.nVectorY;
            var nPos = bH? oCustomEvent.nX : oCustomEvent.nY;

            //플리킹이 다시 되돌아 갈때..(기준픽셀을 채우지 못하여 되돌아 갈때 )
            if(htInfo.sDirection === null){
                nTime = this.option('nBounceDuration');
                if(nDis === 0 || ((oCustomEvent.sMoveType === jindo.m.MOVETYPE[2]) && !this.option('bUseDiagonalTouch')) ) {
                    this._endAnimation(false);
                    //return;
                }
            }

            var htParam = {
                  nContentsIndex : this.getContentIndex(),
                  nContentsNextIndex: htInfo.nContentIndex
            };

            if(this._bFlickLeft !== null){
                //가로일때는   bLeft,  세로일때는 bTop 으로
                if(this.option('bHorizontal')){
                    htParam.bLeft = this._bFlickLeft;
                }else{
                    htParam.bTop = this._bFlickLeft;
                }
            }
            if(htInfo.sDirection !== null){
                /**
                    플리킹되기 전에 발생한다

                    @event beforeFlicking
                    @param {String} sType 커스텀 이벤트명
                    @param {Number} nContentsIndex 현재 콘텐츠의 인덱스
                    @param {Number} nContentsNextIndex (Number) :플리킹될 다음 콘텐츠의 인덱스
                    @param {Boolean} bLeft 플리킹 방향이 왼쪽인지에 대한 여부 (세로 플리킹일 경우 이 값은 없다)
                    @param {Boolean} bTop 플리킹 방향이 위쪽인지에 대한 여부 (가로 플리킹일 경우 이 값은 없다)
                    @param {Function} stop 플리킹되지 않는다.
                **/
                if(!this.fireEvent('beforeFlicking', htParam)){
                    this.restorePosition();
                    return;
                }
            } else {
                 /**
                    플리킹 임계치에 도달하지 못하고 사용자의 액션이 끝났을 경우, 원래 인덱스로 복원하기 전에 발생하는 이벤트

                    @event beforeRestore
                    @param {String} sType 커스텀 이벤트명
                    @param {Number} nContentsIndex 현재 콘텐츠의 인덱스
                    @param {Function} stop 플리킹이 복원되지 않는다.
                **/
                if(!this.fireEvent('beforeRestore', {
                    nContentsIndex : this.getContentIndex()
                })) {
                    return;
                }
            }

            this._htIndexInfo.nNextContentIndex = htInfo.nContentIndex;
            this._htIndexInfo.welNextElement = htInfo.welElement;
            this._htIndexInfo.sDirection = htInfo.sDirection;

            nDis = bH? oCustomEvent.nDistanceX : oCustomEvent.nDistanceY;
            nVector = bH? oCustomEvent.nVectorX : oCustomEvent.nVectorY;
            nPos = bH? oCustomEvent.nX : oCustomEvent.nY;

            this._onAfterEnd(nDis, nVector, nPos, nDuration);
            /**
                플리킹영역에 터치가 끝났을 때 발생한다. Touch이벤트의 'touchEnd'와 동일하다.

                @event touchEnd
                @param {String} sType 커스텀 이벤트명
                @param {String} sMoveType 현재 분석된 움직임
                @param {HTMLElement} element 현재 터치된 영역의 Element
                @param {Number} nX 터치영역의 X좌표
                @param {Number} nY 터치 영역의 Y좌표
                @param {Number} nVectorX 이전 touchMove(혹은 touchStart)의 X좌표와의 상대적인 거리.(직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
                @param {Number} nVectorY 이전 touchMove(혹은 touchStart)의 Y좌표와의 상대적인 거리.(직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
                @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리.(touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
                @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리.(touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
                @param {Number} nStartX touchStart의 X좌표
                @param {Number} nStartY touchStart의 Y좌표
                @param {Object} oEvent jindo.$Event object
                @param {Function} stop수행시 영향 받는것 없다.
            **/
            this.fireEvent('touchEnd', oCustomEvent);
     },

     /**
      * @override
      */
     _onAfterEnd : function(){

     },

     _endAnimation : function(bFireEvent){
            var self = this;
            if(typeof bFireEvent === 'undefined'){
                bFireEvent = true;
            }
            this._doFlicking = false;
            this._bTouchStart =  false;
            this._bMove = false;

            var isFireRestore = this._htIndexInfo.sDirection == null &&
            this._htIndexInfo.nContentIndex === this._htIndexInfo.nNextContentIndex ? true : false;
            //index 정보 업데이트
            this._resetIndexInfo(this._htIndexInfo.nNextContentIndex, this._htIndexInfo.welNextElement);
            if(bFireEvent){
                /**
                    현재 화면에 보이는 콘텐츠가 바뀔경우 수행된다.

                    @event afterFlicking
                    @param {String} sType 커스텀 이벤트명
                    @param {Number} nContentsIndex 현재 콘텐츠의 인덱스
                    @param {Boolean} bLeft 플리킹 방향이 왼쪽인지에 대한 여부 (세로 플리킹일 경우 이 값은 없다)
                    @param {Boolean} bTop 플리킹 방향이 위쪽인지에 대한 여부 (가로 플리킹일 경우 이 값은 없다)
                    @param {Function} stop 수행시 영향을 받는것은 없다.
                **/
                this._fireCustomEvent('afterFlicking');
            }
            if(isFireRestore) {
                /**
                    플리킹 임계치에 도달하지 못하고 사용자의 액션이 끝났을 경우, 원래 인덱스로 복원한 후에 발생하는 이벤트

                    @event restore
                    @param {String} sType 커스텀 이벤트명
                    @param {Number} nContentsIndex 현재 콘텐츠의 인덱스
                    @history 1.7.0 Update Custom Event 추가
                **/
                this.fireEvent("restore", {
                    nContentsIndex : this._htIndexInfo.nContentIndex
                });
            }

            //ios 업데이트
            this._restoreAnchor();
            this._setAnchorElement();
            setTimeout(function(){
                self._createDummyTag();
                self._focusFixedBug();
            }, 5);
            this._bFlickLeft = null;
     },

     /**
        컨텐츠인덱스 정보를 다시 세팅한다.
    **/
    _resetIndexInfo : function(n, el){
        this._htIndexInfo.nContentIndex = n;
        this._htIndexInfo.nNextContentIndex = n;

        if(typeof el === 'undefined'){
            if(this.option('bUseCircular')){
                n = n%3;
            }
            el =  this._htWElement.aPanel[n];
        }

        this._htIndexInfo.welElement = el;
        this._htIndexInfo.welNextElement = el;
        this._htIndexInfo.sDirection = null;
    },

    _checkIndex : function(n){
        var bRet = true;
        if(isNaN((n*1)) || n < 0){
            bRet = false;
        }
        var nMax = this.getTotalContents()-1;
        if( n > nMax){
            bRet = false;
        }

        return bRet;
    },

     /**
      * @override
      */
     refresh : function(n, bResize, bFireEvent){
         var self = this;
         if(typeof n === 'undefined'){
            n = this.getContentIndex();
         }

         if(!this._checkIndex(n)){
             return;
         }

         if(typeof bResize === 'undefined'){
            bResize = true;
         }

         if(typeof bFireEvent === 'undefined'){
            bFireEvent = true;
         }

        if(bFireEvent){
                /**
                    현재 화면에 보이는 콘텐츠가 바뀔경우 수행된다.

                    @event beforeMove
                    @param {String} sType 커스텀 이벤트명
                    @param {Number} nContentsIndex 현재 콘텐츠의 인덱스
                    @param {Number} nContentsNextIndex (Number) :이동 할 콘텐츠의 인덱스
                    @param {Function} stop 이동하지 않는다.
                **/
            if(!this._fireCustomEvent('beforeMove',{
                  nContentsIndex : this.getContentIndex(),
                  nContentsNextIndex : n
            })){
                return;
            }
        }
        this._refresh(n, bResize);
        this._resetIndexInfo(n);

        if(bFireEvent){
                    /**
                        현재 화면에 보이는 콘텐츠가 바뀔경우 수행된다

                        @event move
                        @param {String} sType 커스텀 이벤트명
                        @param {Number} nContentsIndex 현재 콘텐츠의 인덱스
                        @param {Function} stop 수행시 영향을 받는것은 없다
                    **/
            this._fireCustomEvent('move');
        }

        //ios 업데이트
        this._restoreAnchor();
        this._setAnchorElement();

        //android css transform 이후에 포커싱 안되는 문제를 해결하기 위한 코드
        this._createDummyTag();
        setTimeout(function(){
            self._focusFixedBug();
        }, 100);

     },

     /**
      * @override
      */
     _refresh : function(n, bResize){

     },

       /**
        * @override
        n번째 컨텐츠로 화면을 이동한다.

        @param {Number} n 이동해야하는 컨텐츠 인덱스
        @param {Number} nDuration  애니메이션시간
        @param {Boolean} beforeMove, move 커스텀이벤트 발생여부
    **/

     moveTo : function(nIndex, nDuration, bFireEvent){
        if((typeof nIndex === 'undefined') || (nIndex == this.getContentIndex()) ){
            return;
        }
        if(nIndex < 0 || nIndex >= this.getTotalContents() ){
            return;
        }

        if(typeof nDuration === 'undefined'){
            nDuration = this.option('nDuration');
        }

        if(typeof bFireEvent === 'undefined'){
            bFireEvent = true;
        }
        this._moveTo(nIndex, nDuration, bFireEvent);
     },

     /**
        플리킹 이후에 움직여야하는 거리와 컨텐트 인덱스를 구한다
        @return {Object}
    **/
    _getSnap : function(nDistanceX, nDistanceY, nDuration, sType){
        var nFinalDis = this.option('bHorizontal')? nDistanceX : nDistanceY;

        var welElement = this._htIndexInfo.welElement;
        var nContentIndex = this.getContentIndex();
        var sDirection = null;

        //가로 대각선일 경우

        if(!((sType === jindo.m.MOVETYPE[2]) && !this.option('bUseDiagonalTouch')) && this._bMove){
            if(Math.abs(nFinalDis) >= this.option('nFlickThreshold') ){
                if(nFinalDis < 0 ){ //왼쪽 방향 혹은 위쪽 방향으로 밀고 있을 때
                    welElement = this.getNextElement();
                    nContentIndex =  this.getNextIndex();
                    this._bFlickLeft = true; //
                    sDirection = 'next';
                }else{ //오른쪽 방향 혹은 아래 방향으로 밀때
                    welElement = this.getPrevElement();
                    nContentIndex = this.getPrevIndex();
                    this._bFlickLeft = false;
                    sDirection  = 'prev';
                }
            }
        }
        if(this._htIndexInfo.welElement.$value() === welElement.$value()){
            sDirection = null;
        }

        return {
            elElement : welElement.$value(),
            welElement: welElement,
            nContentIndex : nContentIndex,
            sDirection : sDirection
        };
    },

    /**
        화면전환시에 리사이즈처리 및 위치 처리를 한다.
    **/
    _onResize : function(evt){
        if(this.option('bAutoResize')){
            this.refresh(this.getContentIndex(), true, false);
        }
        /**
            단말기가 회전될 때 발생한다

            @event rotate
            @param {String} sType 커스텀 이벤트명
            @param {Boolean} isVertical 수직여부
            @param {Function} stop 수행시 영향을 받는것은 없다
            @history 1.5.0 Update Custom Event 추가
        **/
        this.fireEvent("rotate",{
            isVertical : evt.isVertical
        });
    },

     /**
        커스텀이벤트 발생시킨다
        @param {String} 커스텀 이벤트 명
        @param {Object} 커스텀 이벤트 파라미터
        @return {Boolean}
    **/
    _fireCustomEvent : function(sEventName, htParam){
        if(typeof htParam === 'undefined'){
            htParam =  {
                //nContentsIndex : this.getContentIndex()
                nContentsIndex : this._htIndexInfo.nContentIndex
            };
            //가로일때는   bLeft,  세로일때는 bTop 으로
            if(this._bFlickLeft){
                if(this.option('bHorizontal')){
                    htParam.bLeft = this._bFlickLeft;
                }else{
                    htParam.bTop = this._bFlickLeft;
                }
            }
        }

        return this.fireEvent(sEventName,htParam);
    },

    restorePosition : function(){
        this._onAfterEnd();
    },


     /**
        scroll 이벤트 핸들러
        ios6의 경우 기본 스크롤이 활성화된 상태에서 플리킹작업은 진행하면 플리킹이 완료되었는지 알수가 없다.
        이를 보완하는 코드 추가
     **/
     // _onScroll : function(){
     //     if(this._doFlicking){
     //          var n = this.getIndexByElement(this.getElement().$value());
     //          var self = this;
     //          setTimeout(function(){
     //              if(self._doFlicking){
     //                    var n = self._htIndexInfo.nContentIndex;
     //                    var bFireEvent = false;
     //                    if(self._htIndexInfo.nNextContentIndex !== self._htIndexInfo.nContentIndex){
     //                        n = self._htIndexInfo.nNextContentIndex;
     //                        bFireEvent = true;
     //                    }
     //                    self._endAnimation(bFireEvent);
     //                    self.refresh(n, true, false);
     //               }
     //          }, (this.option('nDuration') + 20));
     //    }
     // },

     /**
      *
      */
     movePrev : function(nDuration){
         if(this._doFlicking){
            return;
         }

         var welPrev = this.getPrevElement();
         if(welPrev.$value() === this.getElement().$value()){
               return;
         }
         if(typeof nDuration === 'undefined'){
             nDuration = this.option('nDuration');
         }
         this._bTouchStart = true;
         this._bMove = true;
         this._movePrev(nDuration);
     },

     /**
      * @override
      */
     _movePrev : function(nDuration){
         var n = this.option('nFlickThreshold');
         this._onEnd({
            nDistanceX : n+10,
            nDistanceY : n+10,
            nX : 10,
            nY : 10
         }, nDuration);
     },


     moveNext : function(nDuration){
         if(this._doFlicking){
            return;
         }
         var welNext = this.getNextElement();
         if(welNext.$value() === this.getElement().$value()){
            return;
         }

         if(typeof nDuration === 'undefined'){
             nDuration = this.option('nDuration');
         }

         this._bTouchStart = true;
         this._bMove = true;
         this._moveNext(nDuration);
     },

     /**
      * @override
      */
     _moveNext : function(nDuration){
         var n = this.option('nFlickThreshold')*-1;
         var nPos = this.option('bHorizontal')? this._htWElement.base.width() :  this._htWElement.base.height();

           this._onEnd({
                nDistanceX : n-10,
                nDistanceY : n-10,
                nX : 10,
                nY : 10
            }, nDuration);
     },

     /**
      *  transitionEnd 이벤트 attach
      */
     _attachTransitionEnd : function(el, nTime){
         if(el !== this._elTransition ){
             this._elTransition = el;
             var self = this;
             if(nTime === 0){
                 setTimeout(function(){
                    self._onTransitionEnd();
                 }, 10);
             }else{
                jindo.m.attachTransitionEnd(el, this._wfTransitionEnd);
             }
          }
     },

     _detachTarnsitonEnd : function(){
         if(this._elTransition){
            jindo.m.detachTransitionEnd(this._elTransition, this._wfTransitionEnd);
            this._elTransition = null;
         }
     },


     getIndexByElement : function(el){
        var bValue = -1;
        for(var i=0, nLen = this._htWElement.aPanel.length; i<nLen; i++){
            if(this._htWElement.aPanel[i].$value() === el){
                bValue = i;
                break;
            }
        }
        return bValue;
     },

     /**
        현재 화면에 중앙에 보이는 컨텐츠 혹은 패널의 래핑된 엘리먼트를 리턴한다.

        @method getElement
        @return {jindo.$Element} el
    **/
    getElement : function(){
        var el = null;

        // if(!this.option('bUseCircular')){
            // el = this._htWElement.aPanel[this.getContentIndex()];
        // }else{
            // el = jindo.$Element(this._htIndexInfo.welElement);
        // }
//
        // return el;

        return this._htIndexInfo.welElement;
    },

    /**
        현재 화면에 중앙에 보이는 컨텐츠 혹은 패널의 래핑된 엘리먼트를 리턴한다. (deprecated 예정)

        @method getContentElement
        @return {jindo.$Element} el
    **/
    getContentElement: function(){
        return this.getElement();
    },

    /**
        현재 플리킹 화면에 보이는 컨텐츠의 인덱스를 리턴한다.
        @method getContentIndex
        @return {Number} n
    **/
    getContentIndex : function(){
        //return this.getIndexByElement(this.getElement().$value());
        return this._htIndexInfo.nContentIndex;
    },



    /**
        이후 컨텐츠의 패널 엘리먼트의 래핑된 엘리먼트를 리턴한다.

        @method getNextElement
        @return {jindo.$Element} el
        @history 1.1.0 Update Method 추가
    **/
    getNextElement : function(){
        var n = this.getNextIndex();

        if(this.option('bUseCircular')){
            n = this.getIndexByElement(this.getElement().$value());
            n = ((n+1)>2)?  0 : (n+1);
        }

        return this._htWElement.aPanel[n];
    },

    /**
        이전 컨텐츠의 패널 엘리먼트의 래핑된 엘리먼트를 리턴한다.

        @method getPrevElement
        @return {jindo.$Element} el
        @history 1.1.0 Update Method 추가
    **/
    getPrevElement : function(){

        var n = this.getPrevIndex();

        if(this.option('bUseCircular')){
            n = this.getIndexByElement(this.getElement().$value());
            n = ((n-1)< 0)? 2: (n-1);
            //console.log(n);
        }
        return this._htWElement.aPanel[n];
    },

    /**
        전체 컨텐츠의 개수를 리턴한다.

        @method getTotalContents
        @return {Number} n
        @history 1.1.0 Update Method 추가
    **/
    getTotalContents : function(){
        var bValue = this._htWElement.aPanel.length;

        if(this.option('bUseCircular')){
            if(typeof this.option('nTotalContents') ==='undefined'){
                bValue = 3;
            }else{
                bValue = this.option('nTotalContents');
            }
        }
        return bValue;

    },

    /**
        전체 패널의 개수를 리턴한다.

        @method getTotalPanels
        @return {Number} n
    **/
    getTotalPanels : function(){
         if(this.option('bUseCircular')){
             return 3;
         }else{
             return  this.getTotalContents();
         }
    },

    /**
        전체 패널의 배열을 반환한다.

        @method getPanels
        @return {Array} n
    **/
    getPanels : function(){
         return this._htWElement.aPanel;
    },

    /**
        이전 컨텐츠의 인덱스를 리턴한다.

        @method getPrevIndex
        @return {Number} n
    **/
    getPrevIndex : function(){

        var n = this.getContentIndex()-1;

        if(this.option('bUseCircular') && (n < 0) ){
            n = this.getTotalContents() - 1;
        }

        n = Math.max(0, n);

        return n;
    },


    /**
        이후 컨텐츠의 인덱스를 리턴한다.

        @method getNextIndex
        @return {Number} n
    **/
    getNextIndex : function(){
        var n = this.getContentIndex()+1;

        var nMax = this.getTotalContents() - 1;
        if(this.option('bUseCircular') && (n > nMax) ){
            n = 0;
        }

        n = Math.min(nMax, n);

        return n;
    },

    /**
     * @override
     */
    _onTransitionEnd : function(){

    },
     /**
        flicking 내에 a 엘리먼트를 모두 가져와서 세팅한다. (ios에서만)
     **/
     _setAnchorElement : function(el){
        //ios에서만 처리되도록 수정.
        if(this._bClickBug){
            this._aAnchor = jindo.$$("A", this._htWElement.container.$value());
        }
     },

     /**
        Anchor 삭제
     **/
     _clearAnchor : function() {
        if(this._aAnchor && !this._bBlocked) {
            var aClickAddEvent = null;
            for(var i=0, nILength=this._aAnchor.length; i<nILength; i++) {
                if (this._fnDummyFnc !== this._aAnchor[i].onclick) {
                    this._aAnchor[i]._onclick = this._aAnchor[i].onclick;
                }
                this._aAnchor[i].onclick = this._fnDummyFnc;
                aClickAddEvent = this._aAnchor[i].___listeners___ || [];
                for(var j=0, nJLength = aClickAddEvent.length; j<nJLength; j++) {
                    ___Old__removeEventListener___.call(this._aAnchor[i], "click", aClickAddEvent[j].listener, aClickAddEvent[j].useCapture);
                }
            }
            this._bBlocked = true;
        }
     },

     /**
        Anchor 복원. for iOS
     **/
     _restoreAnchor : function() {
        if(this._aAnchor && this._bBlocked) {
            var aClickAddEvent = null;
            for(var i=0, nILength=this._aAnchor.length; i<nILength; i++) {
                if(this._fnDummyFnc !== this._aAnchor[i]._onclick) {
                    this._aAnchor[i].onclick = this._aAnchor[i]._onclick;
                } else {
                    this._aAnchor[i].onclick = null;
                }
                aClickAddEvent = this._aAnchor[i].___listeners___ || [];
                for(var j=0, nJLength = aClickAddEvent.length; j<nJLength; j++) {
                    ___Old__addEventListener___.call(this._aAnchor[i], "click", aClickAddEvent[j].listener, aClickAddEvent[j].useCapture);
                }
            }
            this._bBlocked = false;
        }
     },

     /**
        jindo.m.Flicking 컴포넌트를 활성화한다.
        activate 실행시 호출됨
     **/
     _onActivate : function() {
         this._attachEvent();
         this._setAnchorElement();
         this._oTouch.activate();
     },

    /**
        jindo.m.Flicking 컴포넌트를 비활성화한다.
        deactivate 실행시 호출됨
    **/
     _onDeactivate : function() {
         this._detachEvent();
         this._oTouch.deactivate();
     },

    /**
        jindo.m.Flicking 에서 사용하는 모든 이벤트를 바인드한다.
    **/
    _attachEvent : function() {
        this._htEvent = {};
        /* Touch 이벤트용 */
        this._htEvent["touchMove"] = jindo.$Fn(this._onMove, this).bind();
        this._htEvent["touchEnd"] = jindo.$Fn(this._onEnd, this).bind();
        this._htEvent["touchStart"] = jindo.$Fn(this._onStart, this).bind();

        /* Touch attach */
        this._oTouch.attach("touchStart", this._htEvent["touchStart"]);
        this._oTouch.attach("touchMove", this._htEvent["touchMove"]);
        this._oTouch.attach("touchEnd", this._htEvent["touchEnd"]);

        /* rotate */
       this._htEvent["rotate"] = jindo.$Fn(this._onResize, this).bind();
       /* pageshow 이벤트 처리 */
       jindo.m.bindRotate(this._htEvent["rotate"]);
       jindo.m.bindPageshow(this._htEvent["rotate"]);
    },

    /**
        jindo.m.Flicking 에서 사용하는 모든 이벤트를 해제한다.
    **/
    _detachEvent : function() {
        /* touch detach */
        this._oTouch.detachAll();

        /* rotate */
        jindo.m.unbindRotate(this._htEvent["rotate"]);
        jindo.m.unbindPageshow(this._htEvent["rotate"]);

        /*그외*/
        for(var p in this._htEvent){
            var htTargetEvent = this._htEvent[p];
            if (typeof htTargetEvent.ref !== "undefined") {
                htTargetEvent.ref.detach(htTargetEvent.el, p);
            }
        }
        this._htEvent = null;
    },
    /**
        jindo.m.Flicking 에서 사용하는 모든 객체를 release 시킨다.
        @method destroy
    **/
    destroy: function() {
        this.deactivate();

        for(var p in this._htWElement) {
            this._htWElement[p] = null;
        }
        this._htWElement = null;

        this._oTouch = null;
        this._o_FlickingAnimation_ = null;
        for(var p1 in this._htIndexInfo){
            this._htIndexInfo[p] = null;
        }

        this._isIos = null;
        this._bAndroid = null;
        this._nVersion = null;
        this._fnDummyFnc = null;
        this._doFlicking = null;
        this._bClickBug = null;
        this._b3dExecption = null;
        this._bDummyTagException = null;
    }

}).extend(jindo.m.UIComponent);
