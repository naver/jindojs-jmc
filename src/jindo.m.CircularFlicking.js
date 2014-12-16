/**
	@fileOverview 3개의 Panel영역을 무한대로 순환하여 플리킹할 수 있는 컴포넌트
	@author "oyang2"
	@version #__VERSION__#
	@since 2011. 11. 01.
**/
/**
	3개의 Panel영역을 무한대로 순환하여 플리킹할 수 있는 컴포넌트

	@class jindo.m.CircularFlicking
	@extends jindo.m.UIComponent
	@uses jindo.m.Flicking
    @uses jindo.m.SlideFlicking
	@deprecated
	@keyword rolling, circular, 롤링, 순환, 회전, 플리킹
	@group Component

    @history 1.11.0 Update 패널개수가 2개 이하일 경우, 하위호환성을 위해 강제로 panel을 만들어 주도록 수정
    @history 1.10.0 Update jindo.m.SlideFlicking 구조로 변경
    @history 1.5.0 deprecated
	@history 1.4.0 Update OS 6 지원
	@history 1.3.5 Update Android 4.1(젤리빈) 대응
	@history 1.3.5 Bug ios에서 afterFlicking에서 패널의 마크업을 바꿀 경우 잔상이 보이는 버그 해결
	@history 1.3.0 Update 갤럭시 s3 ICS 대응
	@history 1.3.0 Update 애니메이션 구조 개선
	@history 1.2.0 Update Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.2.0 Bug android 4.x에서 발생하는 세로플리킹 오류 해결
	@history 1.2.0 New [nBounceDuration] Option 추가<br />
						[bUseCss3d] Option 추가
	@history 1.1.0 Update Android 3.0/4.0 지원<br />Support jindo 2.0.0 mobile 버전 지원
	@history 1.1.0 Update Android의 경우 translate호출시에 [css3+자바스크립트] 형식을 혼합해서 사용하는 형식으로 수정
	@history 1.1.0 Update [bUsePreserve3dForAndorid] Option 삭제
	@history 0.9.5 Bug iOS에서 가로모드에서 플리킹 후 깜박이는 문제 해결
	@history 0.9.5 Update Class prefix 변경('ct' → 'panel')<br />
						[bUsePreserve3dForAndorid] Option 추가<br />
						getItemIndex() Method 삭제
	@history 0.9.0 Release 최초 릴리즈
**/
jindo.m.CircularFlicking = jindo.$Class({
	/* @lends jindo.m.CircularFlicking.prototype */
	/**
		초기화 함수

		@constructor
		@param {HTMLElement | String} el 플리킹 기준 엘리먼트 (혹은 id)
		@param {Object} [htOption] 초기화 옵션 객체
			@param {Boolean} [htOption.bHorizontal=true] 가로여부 (세로 플리킹일 경우 false로 설정한다)
			@param {String} [htOption.sClassPrefix='flick-'] Class의 prefix명
			@param {Number} [htOption.nDuration=200] 콘텐츠가 바뀌기 위한 최소한의 터치 드래그한 거리 (pixel)
			@param {Number} [htOption.nFlickThreshold=40] 슬라이드 애니메이션 시간
			@param {Number} [htOption.nTotalContents=3] 전체 플리킹할 콘텐츠의 개수(패널의 개수보다 많을 수 있다)
			@param {Number} [htOption.nBounceDuration=100] nFlickThreshold 이하로 움직여서 다시 제자리로 돌아갈때 애니메이션 시간
			@param {Boolean} [htOption.bUseCss3d=true] css3d(translate3d) 사용여부
			@param {Boolean} [htOption.bUseTimingFunction=true] css의 translate 속성을 사용할지 여부<br /> false일 경우 "left", "top" 속성을 이용함.
			@param {Boolean} [htOption.bUseTranslate=true] 애니메이션 동작방식을 css의 TimingFunction을 사용할지 여부<br /> false일 경우 setTimeout을 이용하여 애니메이션 실행.
			@param {Boolean} [htOption.bUseDiagonalTouch=true] 대각선스크롤 방향으 터치도 플리킹으로 사용할지 여부
			@param {Boolean} [htOption.bSetNextPanelPos=false] 플리킹할때 다음 패널의 top위치를 항상 맨 위로 사용할지 여부
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부

		@example
			var oCircularFlicking = new jindo.m.CircularFlicking('layer1', {
				bHorizontal : true,  //가로 플리킹 여부 세로 플리킹일 경우 false
				sClassPrefix : 'flick-',
				nDuration : 200, //flicking 타임
				nFlickThreshold : 40, //페이지 단위로 옮길때 최소 move 거리
				nTotalContents : 3,
				nBounceDuration : 100, //바운스에 대한 시간설정
				bUseCss3d : jindo.m._isUseCss3d(), //ios와 크롬은 true, 안드로이드 기본브라우저는 false
				bUseTimingFunction : jindo.m._isUseTimingFunction(), //스크립트방식으로 애니메이션을 사용할지 csstimingfunction을 사용할지 여부
				bUseTranslate : true, //css의 translate를 사용할지 style 속성의 top, left속성 사용할지 여부
				bUseDiagonalTouch : true, //대각선스크롤을 플리킹에 사용할지 여부
                bSetNextPanelPos :  false, //플리킹시에 다음판에 대해서 현재 스크롤 위치에 높이값을 맞출지 여부
				bActivateOnload : true
			});
	**/
    $init : function(sId, htUserOption) {
        this.option({
            bHorizontal : true,
            sClassPrefix : 'flick-',
            nFlickThreshold : 40,
            nDuration : 100,
            nTotalContents : 3,
            nBounceDuration : 100,
            bActivateOnload : true,
            bSetNextPanelPos : false,   //플리킹시에 다음판에 대해서 현재 스크롤 위치에 높이값을 맞출지 여부
            bUseCss3d : jindo.m.useCss3d(), //css3d사용여부 bUseTranslate가 true 일때만 사
            bUseTimingFunction : jindo.m.useTimingFunction(), //스크립트방식으로 애니메이션을 
            bUseTranslate : true, //css의 translate를 사용할지 style 속성의 top, left속성 사용할지 여부
            bUseDiagonalTouch : true //대각선스크롤을 플리킹에 사용할지 여부
        });

        this.option(htUserOption || {});

        this._initVar();
        this._setWrapperElement(sId);
        this._initFlicking(sId);

        if(this.option("bActivateOnload")) {
            this.activate();
        }
    },
    /**
		jindo.m.CircularFlicking 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
    _initVar: function() {
        this._oFlicking = null;
    },


   /**
		Flickking 컴포넌트 초기화 한다.
	**/
    _initFlicking : function(el){
        var htOption = this.option();
        htOption["sContentClass"] = "panel";
        htOption["sAnimation"] = "slide";
        htOption["bUseCircular"] = true;
        htOption["bActivateOnload"] = false;
        
        this._oFlicking = new jindo.m.Flicking(jindo.$Element(el), htOption).attach({
            'touchStart' : jindo.$Fn(this._onTouchStart,this).bind(),
            'touchMove' : jindo.$Fn(this._onTouchMove, this).bind(),
            'touchEnd' : jindo.$Fn(this._onTouchEnd,this).bind(),
            'beforeMove' :  jindo.$Fn(this._onBeforeMove,this).bind(),
            'move' :  jindo.$Fn(this._onMove,this).bind(),
            'rotate' : jindo.$Fn(this._onRotate,this).bind(),
            'scroll' : jindo.$Fn(this._onScroll,this).bind(),
            'beforeFlicking' : jindo.$Fn(this._onBeforeFlicking, this).bind(),
            'afterFlicking' : jindo.$Fn(this._onAfterFlicking,this).bind()
        });
    },

    /**
        jindo.m.CircularFlicking 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
    **/
    _setWrapperElement: function(el) {
        this._htWElement = {
            "circularFlickBase" : jindo.$Element(el)
        };

        // CircularFlicking panel 시 하위호환성 문제로 임시로 최소 패널 3개를 맞춰주는 코드
        var welContainer = jindo.$Element(this._htWElement.circularFlickBase.query("." + this.option("sClassPrefix") + "container"));

        var aPanels = welContainer.queryAll("." + this.option("sClassPrefix") + "panel");
        if(aPanels && aPanels.length < 3) {
            var nLen = 3-aPanels.length;
            for(var i=0; i<nLen; i++) {
                welContainer.$value().appendChild(jindo.$('<div class="' + this.option("sClassPrefix") + 'panel">'));
            }
        } 

        // var sClass = '.'+ this.option('sClassPrefix');
        // this._htWElement.base = jindo.$Element(el);

        // this._htWElement.container = jindo.$Element(jindo.$$.getSingle(sClass+'container',el));

        // WRAPPER -> CONTAINER로 수정
        // var aPanel = jindo.$$(sClass+"panel", el);
        // this._htWElement.aPanel = jindo.$A(aPanel).forEach(function(value,index, array){
        //     var wel = jindo.$Element(value);
        //     array[index] = wel;
        // }).$value();
    },



    /**
        현재 화면 중앙에 보이는 영역에 Panel의 인덱스를 리턴한다.

        @method getPanelIndex
        @return {Number} n
        @history 0.9.5 Update Method 추가
    **/
    getPanelIndex : function(){
        return this._oFlicking.getIndexByElement(this.getPanelElement().$value());

    },

    /**
        현재 화면 중앙에 보이는 영역에 Panel의 엘리먼트를 래핑된 형태로 리턴한다.

        @method getPanelElement
        @return {jindo.$Element}
        @history 1.1.0 Update Method 추가
    **/
    getPanelElement : function(){
        return this._oFlicking.getElement();
    },

    /**
        현재 화면에서 오른쪽(아래쪽) 영역에 Panel의 인덱스를 리턴한다.

        @method getRightPanelIndex
        @return {Number} n
        @history 0.9.5 Update Method 추가
    **/
    getRightPanelIndex : function(){
        return this._oFlicking.getIndexByElement(this.getRightPanelElement().$value());
    },

    /**
        현재 화면에서 오른쪽(아래쪽) 영역에 Panel 엘리먼트를 래핑된 형태로 리턴한다.

        @method getRightPanelElement
        @return {jindo.$Element}
        @history 1.1.0 Update Method 추가
    **/
    getRightPanelElement : function(){
        return this._oFlicking.getNextElement();
    },


    /**
        현재 화면 왼쪽(위쪽) 영역에 Panel의 인덱스를 리턴한다.

        @method getLeftPanelIndex
        @return {Number} n
        @history 0.9.5 Update Method 추가
    **/
    getLeftPanelIndex : function(){
         return this._oFlicking.getIndexByElement(this.getLeftPanelElement().$value());
    },

    /**
        현재 화면 왼쪽(위쪽) 영역에 Panel 엘리먼트를 래핑된 형태로 리턴한다.

        @method getLeftPanelElement
        @return {jindo.$Element}
        @history 1.1.0 Update Method 추가
    **/
    getLeftPanelElement : function(){
        return this._oFlicking.getPrevElement();
    },


   /**
        컴포넌트의 옵션값 nTotalContent을 기준으로 현재 화면에 보이는 콘텐츠 영역의 Content의 인덱스를 반환한다.
        @remark Panel의 인덱스가 아닌 Content의 인덱스를 리턴한다.

        @method getContentIndex
        @return {Number} n
        @history 0.9.5 Update Method 추가
    **/
    getContentIndex : function(){
        return this._oFlicking.getContentIndex();
    },

   /**
        오른쪽(아래쪽) Panel의 content의 인덱스를 리턴한다.

        @method getRightContentIndex
        @return {Number} n
        @history 0.9.5 Update Method 추가
    **/
    getRightContentIndex : function(){
        return this._oFlicking.getNextIndex();
    },

    /**
        왼쪽(위쪽) Panel의 content의 인덱스를 리턴한다

        @method getLeftContentIndex
        @return {Number} n
        @history 0.9.5 Update Method 추가
    **/
    getLeftContentIndex : function(){
        return this._oFlicking.getPrevIndex();
    },


    /**
        touchStart 발생 처리
    **/
    _onTouchStart : function(oCustomEvt){
        /**
            플리킹 영역에 터치가 시작되었을 때 발생한다.
            @remark Touch이벤트의 'touchStart'와 동일하다.

            @event touchStart
            @param {String} sType 커스텀이벤트명
            @param {HTMLElement} element 현재 터치된 영역의 Element
            @param {Number} nX 터치영역의 X좌표
            @param {Number} nY 터치 영역의 Y좌표
            @param {Object} oEvent jindo.$Event object
            @param {Function} stop  플리킹 액션이 수행되지 않는다
        **/

        var bRet = this.fireEvent('touchStart', oCustomEvt);
        if(!bRet){
            oCustomEvt.stop();
            return;
        }
    },

    /**
        touchMove가 발생할때 처리
     */
    _onTouchMove : function(oCustomEvt){
         /**
            플리킹 영역에서 터치 움직임이 있을 때 발생한다.
            @remark Touch이벤트의 'touchMove'와 동일하다.

            @event touchMove
            @param {String} sType 커스텀이벤트명
            @param {String} sMoveType (String) : 현재 분석된 움직임
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
            @param {Function} stop 수행시 영향 받는것 없다.
        **/
        this.fireEvent('touchMove', oCustomEvt);
    },

    /**
        touchEnd 가 발생할때 처리
    **/

    _onTouchEnd : function(oCustomEvt){
         /**
            플리킹 영역에서 터치가 끝났을 때 발생한다.
            @remark Touch이벤트의 'touchEnd'와 동일하다.

            @event touchEnd
            @param {String} sType 커스텀이벤트명
            @param {String} sMoveType (String) : 현재 분석된 움직임
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
            @param {Function} stop 수행시 영향 받는것 없다.
        **/
         this.fireEvent('touchEnd', oCustomEvt);
    },

    /**
        beforeMove 가 발생할때 처리
    **/
    _onBeforeMove :function(oCustomEvt){
        var nPanelIndex = oCustomEvt.nContentsNextIndex % 3;
        /**
                플리킹 액션없이 패널 혹은 컨텐츠가 바뀌기 전에 발생한다.
                @remark setContentIndex/refresh 메소드를 통해 각 패널이 바뀔 경우

                @event beforeMove
                @param {String} sType 커스텀이벤트명
                @param {Number} nPanelIndex 현재 화면에 보이는 패널의 인덱스
                @param {Number} nNextPanelIndex 플리킹되어 중앙 화면에 보일 패널의 인덱스
                @param {Number} nContentIndex 현재 화면에 보이는 컨텐츠의 인덱스
                @param {Number} nNextContentIndex 플리킹되어 중앙 화면에 보일 컨텐츠의 인덱스
                @param {Function} stop  수행시 영향을 받는것은 없다

                @history 0.9.5 Update Custom Event 추가
        **/
        if(!this.fireEvent('beforeMove',{
                nPanelIndex : this.getPanelIndex(),
                nContentIndex : oCustomEvt.nContentsIndex,
                nNextPanelIndex : nPanelIndex,
                nNextContentIndex : oCustomEvt.nContentsNextIndex
            })){
                oCustomEvt.stop();
            }
    },

    /**
        move 가 발생할 때 처리
     */
    _onMove :function(oCustomEvt){
            /**
                플리킹 액션없이 패널 혹은 컨텐츠가 바뀌었을 경우
                @remark setContentIndex/refresh 메소드를 통해 각 패널이 바뀔 경우

                @event move
                @param {String} sType 커스텀이벤트명
                @param {Number} nPanelIndex 현재 화면에 보이는 중앙 영역의 패널의 인덱스
                @param {Number} nPanelLeftIndex 왼쪽 (혹은 위쪽)영역에 있는 패널의 인덱스
                @param {Number} nPanelRightIndex 오른쪽 (혹은 아래쪽)영역에 있는 패널의 인덱스
                @param {Number} nContentIndex 현재 화면에 보이는 컨텐츠의 인덱스
                @param {Number} nContentLeftIndex 왼쪽 (혹은 위쪽)영역에 컨텐츠의 인덱스
                @param {Number} nContentRightIndex 오른쪽 (혹은 아래쪽)영역에 컨텐츠 인덱스
                @param {Function} stop  수행시 영향을 받는것은 없다

                @history 0.9.5 Update Custom Event 추가
            **/
         this.fireEvent('move',{
             nPanelIndex : this.getPanelIndex(),
             nPanelLeftIndex :  this.getLeftPanelIndex(),
             nPanelRightIndex : this.getRightPanelIndex(),
             nContentIndex : this.getContentIndex(),
             nContentLeftIndex : this.getLeftContentIndex(),
             nContentRightIndex :  this.getRightContentIndex()
         });
    },
    /**
        rotate 발생 처리
     */
    _onRotate :function(evt){
        /**
                단말기를 전환하였을 경우 발생.

                @event rotate
                @param {String} sType 커스텀이벤트명
                @param {Boolean} isVertical 수직 여부
                @param {Function} stop  수행시 영향을 받는것은 없다

                @history 1.5.0 Update Custom Event 추가
         **/
        this.fireEvent('rotate', evt);
    },

    /**
        scroll 발생 처리
     */
    _onScroll :function(){
        /**
                플리킹 액션이 아닌 기본 스크롤 액션이 발생할 경우.

                @event scroll
                @param {String} sType 커스텀이벤트명
                @param {Function} stop  수행시 영향을 받는것은 없다

                @history 1.5.0 Update Custom Event 추가
         **/
        this.fireEvent('scroll');
    },
    /**
        beforeFlicking 발생 처리
     */
    _onBeforeFlicking  : function(oCustomEvent){
        //console.log(oCustomEvent);
        var htParam = {
            nContentIndex : oCustomEvent.nContentsIndex,
            nNextContentIndex : oCustomEvent.nContentsNextIndex,
            nPanelIndex : this.getPanelIndex(),
            nNextPanelIndex : this.getLeftPanelIndex()
        };
        if(oCustomEvent.bTop){
            htParam["bTop"] = oCustomEvent.bTop;

        }
        if(oCustomEvent.bLeft){
            htParam["bLeft"] = oCustomEvent.bLeft;
        }
        if(htParam["bTop"] || htParam["bLeft"]){
                htParam["nNextPanelIndex"]  = this.getRightPanelIndex();
        }
        /**
            플리킹 액션을 통해 panel이 바뀌기 전에 발생한다.
            @remark 플리킹 액션은 터치를 통해 플리킹 되거나 movePrev()/moveNext()메소드를 통해 플리킹되는 경우이다

            @event beforeFlicking
            @param {String} sType 커스텀이벤트명
            @param {Number} nPanelIndex 현재 화면에 보이는 패널의 인덱스
            @param {Number} nNextPanelIndex 플리킹되어 중앙 화면에 보일 패널의 인덱스
            @param {Number} nContentIndex 현재 화면에 보이는 컨텐츠의 인덱스
            @param {Number} nNextContentIndex 플리킹되어 중앙 화면에 보일 컨텐츠의 인덱스
            @param {Boolean} bLeft 플리킹 방향이 왼쪽인지 대한 여부
            @param {Function} stop 수행시 영향을 받는것은 없다

            @history 1.3.5 Update stop() 호출하면 다시 제자리로 돌아가는 bounce 기능 추가
            @history 0.9.5 Update Custom Event 추가
        **/
        if(!this.fireEvent('beforeFlicking', htParam)){
            oCustomEvent.stop();
        }
    },

    /**
       afterFlicking 발생 처리
     */
    _onAfterFlicking : function(oCustomEvent) {
        var htParam = {
             nPanelIndex : this.getPanelIndex(),
             nPanelLeftIndex : this.getLeftPanelIndex(),
             nPanelRightIndex : this.getRightPanelIndex(),
             nContentIndex : this.getContentIndex(),
             nContentLeftIndex : this.getLeftContentIndex(),
             nContentRightIndex:  this.getRightContentIndex()
        };

        if(oCustomEvent.bTop){
            htParam["bTop"] = oCustomEvent.bTop;

        }
        if(oCustomEvent.bLeft){
            htParam["bLeft"] = oCustomEvent.bLeft;
        }
        this._htWElement.aPanel = this._oFlicking._oFlickingImpl._htWElement.aPanel;
        /**
                플리킹 액션을 통해 panel이 바뀐 이후에 발생한다.
                @remark 플리킹 액션은 터치를 통해 플리킹 되거나 movePrev()/moveNext()메소드를 통해 플리킹되는 경우이다.

                @event afterFlicking
                @param {String} sType 커스텀이벤트명
                @param {Number} nPanelIndex 현재 화면에 보이는 중앙 영역의 패널의 인덱스
                @param {Number} nPanelLeftIndex 왼쪽 (혹은 위쪽)영역에 있는 패널의 인덱스
                @param {Number} nPanelRightIndex 오른쪽 (혹은 아래쪽)영역에 있는 패널의 인덱스
                @param {Number} nContentIndex 현재 화면에 보이는 컨텐츠의 인덱스
                @param {Number} nContentLeftIndex 왼쪽 (혹은 위쪽)영역에 컨텐츠의 인덱스
                @param {Number} nContentRightIndex 오른쪽 (혹은 아래쪽)영역에 컨텐츠 인덱스
                @param {Boolean} bLeft 가로플리킹일 경우 플리킹 방향이 왼쪽인지 여부(세로 플리킹일 경우 이 값은 없다)
                @param {Boolean} bTop 세로플리킹일 경우 플리킹 방향이 위쪽인지 여부 (가로 플리킹일 경우 이 값은 없다)
                @param {Function} stop 수행시 영향을 받는것은 없다

        **/
        this.fireEvent('afterFlicking', htParam);
    },
    /**
        nDuration 시간만큼 다음(오른쪽 콘텐츠, 아래)로 이동한다.

        @method moveNext
        @param {Number} nDuration 애니메이션 시간
    **/
    moveNext : function(nDuration){
        if(!this.isActivating()){
            return;
        }

        this._oFlicking.moveNext();
    },

    /**
        nDuration 시간만큼 이전(왼쪽 콘텐츠, 위쪽)로 이동한다.

        @method movePrev
        @param {Number} nDuration 애니메이션 시간
    **/
    movePrev : function(nDuration){
        if(!this.isActivating()){
            return;
        }

        this._oFlicking.movePrev();
    },

    /**
        n배열이 중앙에 오도록 panel을 다시 좌우 배열해서 배치한다.

        @method refresh
        @param {Number} n 현재 화면에 보여져야할 content의 인덱스
        @param {Boolean} bResize 화면 크기가 변화되어 다시 사이즈를 업데이트 해야 할경우
        @param {Boolean} bFireEvent 커스텀이벤트 발생여부
    **/
    refresh : function(n, bResize, bFireEvent){
        var self = this;

        if(!this.isActivating()){
            return;
        }

        if(typeof bResize === 'undefined'){
            bResize = false;
        }
        if(typeof bFireEvent === 'undefined'){
            bFireEvent = false;
        }

        this._oFlicking.refresh(n, bResize, bFireEvent);
    },

    /**
        현재 중앙에 보이는 컨텐츠의 인덱스를 n으로 설정한다.

        @method setContentIndex
        @param {Number} n 컨텐츠 인덱스
        @param {Boolean} bRefresh panel의 위치를 다시 잡을지에 대한 여부
        @history 0.9.5 Update Method 추가
    **/
    setContentIndex : function(n, bRefresh){
        if(!this.isActivating()){
            return;
        }

        n = parseInt(n,10);
        if(n < 0 || n > (this.option('nTotalContents')-1)){
            return;
        }

        if(typeof bRefresh === 'undefined'){
            bRefresh = true;
        }

        this.refresh(n, bRefresh, true);
    },


    /**
        jindo.m.Flicking 컴포넌트를 활성화한다.
        activate 실행시 호출됨
    **/
    _onActivate : function() {
        this._oFlicking.activate();
    },

    /**
        jindo.m.Flicking 컴포넌트를 비활성화한다.
        deactivate 실행시 호출됨
    **/
    _onDeactivate : function() {
        this._oFlicking.deactivate();
    },

    /**
        jindo.m.Flicking 에서 사용하는 모든 객체를 release 시킨다.
        @method destroy
    **/
    destroy: function() {
        this.deactivate();
        this._oFlicking = null;
        for(var p in this._htWElement) {
            this._htWElement[p] = null;
        }
    }
}).extend(jindo.m.UIComponent);
