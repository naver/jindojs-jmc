/**
    @fileOverview 여러개의 콘텐츠 영역을 사용자 터치의 움직임을 통해 좌/우, 상/하 로 슬라이드하여 보여주는 컴포넌트
    @author oyang2
    @version #__VERSION__#
    @since 2012-06-16
**/
/**
    여러개의 콘텐츠 영역을 사용자 터치의 움직임을 통해 좌/우, 상/하 로 슬라이드하여 보여주는 컴포넌트

    @class jindo.m.Flicking
    @extends jindo.m.UIComponent
    @keyword flicking, 플리킹
    @group Component
    @deprecated

    @history 1.15.0 Bug moveTo 호출시 스크립트 오류 수정
    @history 1.10.0 Update slide,cover를 SlideFlicking, CoverFlicking 구현체로 변경
    @history 1.10.0 Bug deactivate/activate 처리 버그 수정
    @history 1.9.0 Bug Window8 IE10 플리킹 적용시 스크롤이 안되는 이슈 처리
    @history 1.8.0 Bug Flicking 컴포넌트로 4개 이상의 판으로 동작시, 디바이스 회전후에 contentIndex값이 %3의 값으로 나오는 버그 수정.
    @history 1.7.1 Bug bUseDiagonalTouch=false일 경우, 대각선 플리킹시 플리킹이 약간 움직이는 버그 수정
    @history 1.7.1 Bug 안드로이드 2.x에서 플리킹 사용시 깜박이는 문제 수정
    @history 1.7.0 Bug bUseTimingFunction이 true일 경우, prev로 이동하지 않는 버그 수정
    @history 1.7.0 Update base엘리먼트에 z-index = 2000으로 설정 (Css3d사용시 충돌하는 버그 수정)
    @history 1.6.0 Bug bUseCircular가 false일 경우, 처음 패널에서 전 패널로 가려고 할때, 마지막 패널에서 다음 패널로 가려고 할때, beforeFlicking/afterFlicking이벤트가 발생하지 않도록 수정.
    @history 1.10.0 Deprecated sAnimation 옵션의 slide,cover 효과 제거
    @history 1.6.0 Update 구조개선
    @history 1.5.0 Update Window Phone8 지원
    @history 1.5.0 Update [sroll] 커스텀 이벤트 추가
    @history 1.5.0 Update [rotate] 커스텀 이벤트 추가
    @history 1.4.0 Update iOS 6 지원
    @history 1.4.0 Upate [sAnimation] alignFlip 효과 지원
    @history 1.4.0 Bug 슬라이드 플리킹에서 모멘텀이 발생하는 문제 수정
    @history 1.3.5 Update Android 4.1(젤리빈) 대응
    @history 1.3.5 Update [sAnimation] flip 효과 지원<br />
                        [beforeFlicking] slide 타입에서 stop() 호출하면 다시 제자리로 돌아가는 bounce 기능 추가
    @history 1.3.5 Bug slide 타입에서 ios에서 afterFlicking에서 패널의 마크업을 바꿀 경우 잔상이 보이는 버그 해결
    @history 1.3.0 Update sAnimation, bUseCiarcular 옵션에 따라 플리킹 애니메이션을 지정 할 수 있도록 구조 개선
    @history 1.3.0 Update 갤럭시 S3 4.0.3 업데이트 지원, 갤럭시노트 4.0.3 업데이트 지원, 갤럭시S2 LTE 4.0.3 지원
    @history 1.2.0 Update Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
    @history 1.1.0 Update Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
    @history 0.9.0 Release 최초 릴리즈
**/

jindo.m.Flicking = jindo.$Class({
    /*  @lends jindo.m.Flicking.prototype */
    /**
        초기화 함수

        @constructor
        @param {String|HTMLElement} el 플리킹 기준 Element (필수)
        @param {Object} [htOption] 초기화 옵션 객체
            @param {Boolean} [htOption.bHorizontal=true] 가로여부
            @param {Number} [htOption.nDefaultIndex=0] 초기 로드시의 화면에 보이는 콘텐츠의 인덱스
            @param {String} [htOption.sClassPrefix='flick-'] Class의 prefix명
            @param {String} [htOption.sContentClass='ct'] 컨텐츠 영역의 class suffix명
            @param {Number} [htOption.nDuration=100] 슬라이드 애니메이션 지속 시간
            @param {Number} [htOption.nFlickThreshold=40] 콘텐츠가 바뀌기 위한 최소한의 터치 드래그한 거리 (pixel)
            @param {Number} [htOption.nTotalContents=3] 전체 플리킹할 콘텐츠의 개수.<br/>순환플리킹일 경우, 패널의 개수보다 많이 지정하여 afterFlicking 사용자 이벤트를 이용하여 동적으로 컨텐츠를 구성할 수 있다.
            @param {Boolean} [htOption.bUseCircular=false] 순환플리킹여부를 지정한다. true로 설정할 경우 3판이 연속으로 플리킹된다.
            @param {String} [htOption.sAnimation='slide'] 플리킹 애니메이션을 지정한다. "slide"와 "cover", "flip", "alignFlip" 만 현재 지정가능 (slide, cover는 deprecated)
            @param {Number} [htOption.nFlickDistanceOffset=null] 각 컨텐츠의 위치에서 상대적인 위치 값을 설정하여
플리킹 이동을 이 위치만큼 이동하게 수정가능한 옵션
            @param {Boolean} [htOption.bAutoResize=true] 화면전환시에 리사이즈에 대한 처리 여부
            @param {Number} [htOption.nBounceDuration=100] nFlickThreshold 이하로 움직여서 다시 제자리로 돌아갈때 애니메이션 시간
            @param {Boolean} [htOption.bUseCss3d=jindo.m._isUseCss3d(true)] css3d(translate3d) 사용여부<br />
                모바일 단말기별로 다르게 설정된다. 상세내역은 <auidoc:see content="jindo.m">[jindo.m]</auidoc:see>을 참조하기 바란다.
            @param {Boolean} [htOption.bUseTimingFunction=jindo.m._isUseTimingFunction()] 애니메이션 동작방식을 css의 TimingFunction을 사용할지 여부<br />false일 경우 setTimeout을 이용하여 애니메이션 실행.<br />
            모바일 단말기별로 다르게 설정된다. 상세내역은 <auidoc:see content="jindo.m">[jindo.m]</auidoc:see>을 참조하기 바란다.
            @param {Boolean} [htOption.bUseTranslate=true] css의 translate 속성을 사용할지 여부<br /> false일 경우 "left", "top" 속성을 이용함.
            @param {Boolean} [htOption.bUseDiagonalTouch=true] 대각선스크롤 방향으 터치도 플리킹으로 사용할지 여부
            @param {Boolean} [htOption.bSetNextPanelPos=false] 플리킹할때 다음 패널의 top위치를 항상 맨 위로 사용할지 여부
            @param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
            @param {Number} [htOption.nZIndex=2000] 컴포넌트 base엘리먼트 z-Index 값
        @history 1.8.0 Update [nZIndex] 옵션 추가
        @history 1.7.0 Update [bAutoSize] 옵션 삭제
        @history 1.6.0 Bug [bUseDiagonalTouch] 옵션 버그 수정
        @history 1.5.0 Update [bSetNextPanelPos] 옵션 추가
        @history 1.5.0 Update [bUseDiagonalTouch] 옵션 추가
        @history 1.3.0 Update [sAnimation] Option 추가<br />
        @history 1.3.0 Update [bUseTranslate] Option 추가<br />
        @history 1.3.0 Update [bUseTimingFunction] Option 추가<br />
        @history 1.2.0 Update [nFlickDistanceOffset] Option 추가<br />
        @history 1.2.0 Update [bUseCss3d] Option 추가<br />
        @history 1.2.0 Update [bAutoSize] Option 추가<br />
    **/
    $init : function(sId, htUserOption){
         this.option({
           bHorizontal : true,
           nDefaultIndex : 0,
           sClassPrefix : 'flick-',
           sContentClass : 'ct',
           nDuration : 100,
           nFlickThreshold : 40,
           bUseCircular : false,
           sAnimation : 'slide',
           nFlickDistanceOffset :  null,
           bAutoResize : true,
           nBounceDuration : 100,
           bSetNextPanelPos :  false, //플리킹시에 다음판에 대해서 현재 스크롤 위치에 높이값을 맞출지 여부
           bUseCss3d : jindo.m.useCss3d(), //css3d사용여부 bUseTranslate가 true 일때만 사
           bUseTimingFunction : jindo.m.useTimingFunction(), //스크립트방식으로 애니메이션을 사용할지 csstimingfunction을 사용할지 여부
           bUseTranslate : true, //css의 translate를 사용할지 style 속성의 top, left속성 사용할지 여부
           bActivateOnload : true,
           bUseDiagonalTouch : false, //대각선스크롤을 플리킹에 사용할지 여부
           nDefaultScale : 0.94, //cover효과에서 사용되는 scale 사이즈
           nZIndex : 2000
        });
        this.option(htUserOption || {});
        this._initVar(sId);

        if(this.option("bActivateOnload")) {
             this.activate();
        }
    },

    $static : {
        _htAnimation : {
            'flip' : '_FlipFlicking_',
            'circular-flip' : '_FlipFlicking_',
            'alignFlip' : '_AlignFlipFlicking_',
            'circular-alignFlip' : '_AlignFlipFlicking_',
            // isSwipe
            'circular-slide' : 'SlideFlicking',
            'slide' : 'SlideFlicking',
            'circular-cover' : 'CoverFlicking',
            'cover' : 'CoverFlicking'
        }
    },

    /**
        jindo.m.Flicking 에서 사용하는 모든 인스턴스 변수를 초기화한다.
    **/
    _initVar: function(sId) {
        this._el = jindo.$(sId);
        this._oFlickingImpl = null; //animation plugin
        if(/slide|cover/.test(this.option("sAnimation"))) {
            this._isSwipeType = true;
        } else {
            this._isSwipeType = false;
        }
    },


    /**
        animation 인스턴스 생성한다.
    **/
    _createFlicking : function(){
        var sType = this.option('sAnimation');
        if(this.option('bUseCircular')){
            sType  = 'circular-' + sType;
        }
        try{
            var ht = this.option();
            ht["bActivateOnload"] = false;
            this._oFlickingImpl = new jindo.m[jindo.m.Flicking._htAnimation[sType]](this._el, ht);
        }catch(e){
            console.error('_createFlicking ERROR ! ' + e);
        }
    },


    /**
        n이 중앙에 오도록 panel을 다시 좌우 배열해서 배치한다.

        @method refresh
        @param {Number} n 현재 화면에 보여져야할 content의 인덱스
        @param {Boolean} bResize 화면 크기가 변화되어 다시 사이즈를 업데이트 해야 할경우
        @param {Boolean} bFireEvent 커스텀이벤트 발생여부
    **/
    refresh : function(n, bResize, bFireEvent){
        if(this._oFlickingImpl){
            if(this._isSwipeType) {
                this._oFlickingImpl.resize();
                this._oFlickingImpl.refresh(n,bFireEvent, true);
            } else {
                this._oFlickingImpl.refresh(n,bResize, bFireEvent);
            }
        }
    },



    /**
        el엘리먼트가 몇번째 인덱스인지 리턴한다.

        @method getIndexByElement
        @param {HTMLElement} el
        @return {Number} index
    */
   getIndexByElement : function(el){
        if(this._oFlickingImpl){
            if(this._isSwipeType) {
                return this._oFlickingImpl._getIndexByElement(el);
            } else {
                return this._oFlickingImpl.getIndexByElement(el);
            }
        } else{
            return -1;
        }
   },

    /**
        현재 화면에 중앙에 보이는 컨텐츠 혹은 패널의 래핑된 엘리먼트를 리턴한다.

        @method getElement
        @return {jindo.$Element} el
    **/
    getElement : function(){
        if(this._oFlickingImpl){
            return this._oFlickingImpl.getElement();
        }else{
            return null;
        }
    },

    /**
        현재 화면에 중앙에 보이는 컨텐츠 혹은 패널의 래핑된 엘리먼트를 리턴한다. (deprecated 예정)

        @method getContentElement
        @deprecated
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
        if(this._oFlickingImpl){
            return this._oFlickingImpl.getContentIndex();
        }else{
            return null;
        }
    },


    /**
        이후 컨텐츠의 패널 엘리먼트의 래핑된 엘리먼트를 리턴한다.

        @method getNextElement
        @return {jindo.$Element} el
        @history 1.1.0 Update Method 추가
    **/
    getNextElement : function(){
       if(this._oFlickingImpl){
            return this._oFlickingImpl.getNextElement();
        }else{
            return null;
        }
    },

    /**
        이전 컨텐츠의 패널 엘리먼트의 래핑된 엘리먼트를 리턴한다.

        @method getPrevElement
        @return {jindo.$Element} el
        @history 1.1.0 Update Method 추가
    **/
    getPrevElement : function(){
        if(this._oFlickingImpl){
            return this._oFlickingImpl.getPrevElement();
        }else{
            return null;
        }
    },

    /**
        전체 컨텐츠의 개수를 리턴한다.

        @method getTotalContents
        @return {Number} n
        @history 1.1.0 Update Method 추가
    **/
    getTotalContents : function(){
        if(this._oFlickingImpl){
            return this._oFlickingImpl.getTotalContents();
        }else{
            return null;
        }
    },

    /**
        전체 패널의 개수를 리턴한다.

        @method getTotalPanels
        @return {Number} [$Element]
    **/
    getTotalPanels : function(){
        if(this._oFlickingImpl){
            return this._oFlickingImpl.getTotalPanels();
        }else{
            return null;
        }
    },

    /**
        전체 패널의 배열을 반환한다.

        @method getPanels
        @history 1.7.0 Update Method 추가
        @return {Array} n
    **/
    getPanels : function(){
        if(this._oFlickingImpl){
            return this._oFlickingImpl._htWElement.aPanel;
        }else{
            return null;
        }
    },

    /**
        이전 컨텐츠의 인덱스를 리턴한다.

        @method getPrevIndex
        @return {Number} n
    **/
    getPrevIndex : function(){
       if(this._oFlickingImpl){
            return this._oFlickingImpl.getPrevIndex();
        } else{
            return null;
        }
    },


    /**
        이후 컨텐츠의 인덱스를 리턴한다.

        @method getNextIndex
        @return {Number} n
    **/
    getNextIndex : function(){
       if(this._oFlickingImpl){
            return this._oFlickingImpl.getNextIndex();
        } else{
            return null;
        }
    },

    /**
        다음 플리킹화면으로 이동한다.

        @method moveNext
        @param {Number} nDuration 플리킹 애니메이션 시간
    **/
    moveNext : function(nDuration){
        if(!this.isActivating()){
            return;
        }
        if(this._oFlickingImpl){
            this._oFlickingImpl.moveNext(nDuration);
        }
    },

    /**
        이전  플리킹화면으로 이동한다.

        @method movePrev
        @param {Number} nDuration 플리킹 애니메이션 시간
    **/
    movePrev : function(nDuration){
       if(!this.isActivating()){
            return;
        }
        if(this._oFlickingImpl){
            this._oFlickingImpl.movePrev(nDuration);
        }
    },


    /**
        n 번째 컨텐츠로 현재 플리킹화면을 이동한다.

        @method moveTo
        @param {Number} n 이동해야하는 컨텐츠 인덱스
        @param {Number} nDuration 애니메이션 시간
        @param {Number} bFireEvent 커스텀 이벤트 발생여부
    **/
    moveTo : function(nIndex, nDuration, bFireEvent){
        if((typeof nIndex === 'undefined') || (nIndex == this.getContentIndex()) ){
            return;
        }
        if(nIndex < 0 || nIndex >= this.getTotalContents() ){
            return;
        }
        if(this._oFlickingImpl){
            if(this._isSwipeType) {
                this._oFlickingImpl._moveTo(nIndex, {
                    duration : typeof nDuration === "undefined" ? 0 : nDuration,
                    fireEvent : bFireEvent,
                    fireMoveEvent : true});
            } else {
                this._oFlickingImpl.moveTo(nIndex, nDuration, bFireEvent);
            }
        }
    },


    /**
        현재 애니메이션중인지 여부를 리턴한다.

        @method isAnimating
        @return {Boolean}  bAnimation
    **/
    isAnimating : function(){
        if(this._oFlickingImpl){
            if(this._isSwipeType) {
                return this._oFlickingImpl.isPlaying();
            } else {
                return this._oFlickingImpl._doFlicking;
            }
        }
    },

    /**
        jindo.m.Flicking 컴포넌트를 활성화한다.
        activate 실행시 호출됨
    */
    _onActivate : function() {
        if(!this._oFlickingImpl){
            this._createFlicking();
        }
        if(this._oFlickingImpl && !this._oFlickingImpl.isActivating()) {
            this._oFlickingImpl.activate();
            this._attachEvent();
            if(!this._isSwipeType) {
                this.refresh(this.getContentIndex(), true, false);
            }
        }
    },

    /**
        jindo.m.Flicking 컴포넌트를 비활성화한다.
        deactivate 실행시 호출됨
    */
    _onDeactivate : function() {
        this._oFlickingImpl.deactivate();
        this._detachEvent();
    },

    /**
        jindo.m.Flicking 에서 사용하는 모든 이벤트를 바인드한다.
    **/
    _attachEvent : function() {
        if(!this._oFlickingImpl){
            return;
        }
        var self = this;
        this._oFlickingImpl.attach({
            /**
                플리킹영역에 터치가 시작되었을 때 발생한다 (jindo.m.Touch의 touchStart 속성과 동일)
                <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchStart">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
                @event touchStart
                @history 1.2.0 Update Custom Event 추가
            **/
           'touchStart' : function(oCustomEvent){
               if(!self.fireEvent('touchStart', oCustomEvent)){
                   oCustomEvent.stop();
               }

           },
            /**
                플리킹영역에 터치 움직임이 있을 때 발생한다.  (jindo.m.Touch의 touchMove 속성과 동일)
                <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchMove">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
                @event touchMove
                @history 1.2.0 Update Custom Event 추가
            **/
           'touchMove' : function(oCustomEvent){
               self.fireEvent('touchMove', oCustomEvent);
           },
           /**
                플리킹영역에 터치가 끝났을 때 발생한다.  (jindo.m.Touch의 touchMove 속성과 동일)
                <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchEnd">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
                @event touchEnd
                @history 1.2.0 Update Custom Event 추가
            **/
           'touchEnd' : function(oCustomEvent){
                self.fireEvent('touchEnd', oCustomEvent);

           },

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
           'beforeFlicking' : function(oCustomEvent){
               if(!self.fireEvent('beforeFlicking', oCustomEvent)){
                   oCustomEvent.stop();
               }
           },

            /**
                현재 화면에 보이는 콘텐츠가 플리킹액션을 통해 바뀔경우 수행된다.

                @event afterFlicking
                @param {String} sType 커스텀 이벤트명
                @param {Number} nContentsIndex 현재 콘텐츠의 인덱스
                @param {Boolean} bLeft 플리킹 방향이 왼쪽인지에 대한 여부 (세로 플리킹일 경우 이 값은 없다)
                @param {Boolean} bTop 플리킹 방향이 위쪽인지에 대한 여부 (가로 플리킹일 경우 이 값은 없다)
                @param {Function} stop 수행시 영향을 받는것은 없다.
            **/
           'afterFlicking' : function(oCustomEvent){
               self.fireEvent('afterFlicking', oCustomEvent);
           },

           /**
                현재 화면에 보이는 콘텐츠가 바꾸기 직전에  수행된다.

                @event beforeMove
                @param {String} sType 커스텀 이벤트명
                @param {Number} nContentsIndex 현재 콘텐츠의 인덱스
                @param {Number} nContentsNextIndex (Number) :이동 할 콘텐츠의 인덱스
                @param {Function} stop 이동하지 않는다.
            **/
           'beforeMove' : function(oCustomEvent){
               if(!self.fireEvent('beforeMove', oCustomEvent)){
                   oCustomEvent.stop();
               }
           },
            /**
                    현재 화면에 보이는 콘텐츠가 바뀔경우 수행된다

                    @event move
                    @param {String} sType 커스텀 이벤트명
                    @param {Number} nContentsIndex 현재 콘텐츠의 인덱스
                    @param {Function} stop 수행시 영향을 받는것은 없다
                **/
           'move' : function(oCustomEvent){
               self.fireEvent('move', oCustomEvent);
           },
             /**
                플리킹 액션이 아닌 기본 스크롤 기능이 발생될 때

                @event scroll
                @param {String} sType 커스텀 이벤트명
                @param {Function} stop 수행시 영향 받는것 없다.
                @history 1.5.0 Update Custom Event 추가
            **/
           'scroll' : function(oCustomEvent){
               self.fireEvent('scroll');
           },
           /**
                플리킹 임계치에 도달하지 못하고 사용자의 액션이 끝났을 경우, 원래 인덱스로 복원하기 전에 발생하는 이벤트

                @event beforeRestore
                @param {String} sType 커스텀 이벤트명
                @param {Number} nContentsIndex 현재 콘텐츠의 인덱스
                @param {Function} stop 플리킹이 복원되지 않는다.
                @history 1.7.0 Update Custom Event 추가
            **/
           'beforeRestore' : function(oCustomEvent){
               if(!self.fireEvent('beforeRestore', oCustomEvent)){
                   oCustomEvent.stop();
               }
           },

            /**
                플리킹 임계치에 도달하지 못하고 사용자의 액션이 끝났을 경우, 원래 인덱스로 복원한 후에 발생하는 이벤트

                @event restore
                @param {String} sType 커스텀 이벤트명
                @param {Number} nContentsIndex 현재 콘텐츠의 인덱스
                @history 1.7.0 Update Custom Event 추가
            **/
           'restore' : function(oCustomEvent){
               self.fireEvent('restore', oCustomEvent);
           },

           /**
              단말기가 회전될 때 발생한다

              @event rotate
              @param {String} sType 커스텀 이벤트명
              @param {Boolean} isVertical 수직여부
              @param {Function} stop 수행시 resize가 호출되지 않음
          **/
           'rotate' : function(oCustomEvent){
               self.fireEvent('rotate', oCustomEvent);
           }
        });
    },

    /**
        jindo.m.Flicking 에서 사용하는 모든 이벤트를 해제한다.
    **/
    _detachEvent : function() {
        /* 커스텀 이벤트 */
        if(this._oFlickingImpl){
            this._oFlickingImpl.detachAll();
        }
    },

    /**
        jindo.m.Flicking 에서 사용하는 모든 객체를 release 시킨다.
        @method destroy
    **/
    destroy: function() {
        this.deactivate();
        this._el = null;
        this._oFlickingImpl = null;
        this._isSwipeType = false;
    }
}).extend(jindo.m.UIComponent);