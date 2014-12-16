/**
    @fileOverview 여러 패널로 나뉘어진 영역에 탭을 이용한 슬라이드 네비게이팅을 제공하는 컴포넌트
    @author sculove
    @version #__VERSION__#
    @since 2011. 7. 14.
**/
/**
    여러 패널로 나뉘어진 영역에 탭을 이용한 슬라이드 네비게이팅을 제공하는 컴포넌트

    @class jindo.m.SlideTab
    @extends jindo.m.CoreTab
    @uses jindo.m.SlideEffect
    @keyword slidetab
    @group Component

    @history 1.12.0 Bug 컨텐츠와 nCountPerView 값이 배수로 떨어 질때 버그 수정 
    @history 1.8.0 Bug Array 함수 확장했을시 나는 스크립트 오류 수정
    @history 1.7.0 초기 nDefaultIndex 값을 한 페이지에서 노출될 개수보다 높게 정의했을때 애니메이션 기능 되던 문제.<br />
                            select(nPage) 함수 호출시 다음/이전 페이지의 첫번째 탭으로 이동되던 문제.  
    @history 1.7.0 Bug resize 함수 오류 수정
    @history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
    @history 1.2.0 Update 패널 슬라이드 기능 추가
    @history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
    @history 0.9.0 Release 최초 릴리즈
**/
jindo.m.SlideTab = jindo.$Class({
    /* @lends jindo.m.SlideTab.prototype */
    /**
        초기화 함수

        @constructor
        @param {String|HTMLElement} el SlideTab할 Element (필수)
        @param {Object} [htOption] 초기화 옵션 객체
            @param {Number} [htOption.nDefaultIndex=0] 초기 선택되는 Tab컴포넌트 index를 지정한다.
            @param {Number} [htOption.nSlideDuration=200] 이전, 다음버튼 클릭시에 slide되어 완전히 보여지는 시간 (단위 ms)
            @param {String} [htOption.sTimingFunction="ease-in-out"] Slide시 애니메이션 효과
            <ul>
            <li>ease : 속도가 급가속되다가 급감속되는 효과 (거의 끝에서 급감속됨)</li>
            <li>linear : 등속효과</li>
            <li>ease-in : 속도가 점점 빨라지는 가속 효과</li>
            <li>ease-out : 속도가 천천히 줄어드는 감속효과</li>
            <li>ease-in-out : 속도가 천천히 가속되다가 천천히 감속되는 효과 (가속과 감속이 부드럽게 전환됨)</li>
            </ul>
            @param {Number} [htOption.nCountPerVeiw=3] Tab 컴포넌트의 한 페이지당 표시되는 tab 수. 이 값은 최상위 tab컴포넌트의 width값에 의해 분할된다.
            @param {Boolean} [htOption.bActivateOnload=true] <auidoc:see content="jindo.m.FloatingLayer">FloatingLayer</auidoc:see>  컴포넌트가 로딩 될때 활성화 시킬지 여부를 결정한다.<br />
                false로 설정하는 경우에는 Tab.activate()를 호출하여 따로 활성화 시켜야 한다.
    **/
    $init : function(el,htOption) {
        this.option({
             nSlideDuration : 200,
             sTimingFunction : "ease-in-out",
             nCountPerVeiw : 3
        });
        this.option(htOption || {});
        this._initData();
        if(this.option("bActivateOnload")) {
            this.resize();
            this.activate();
        }
        this.select(this.option("nDefaultIndex"), {"bEffect": false});
    },

    /**
        jindo.m.SlideTab 에서 사용하는 모든 인스턴스 변수를 초기화한다.
        @override
    **/
    _initVar: function() {
        this.$super._initVar();
        this._nCurrentPage = 1;
        this._nTotalPage = 1;
        this._nPageWidth = 0;
        this._aDummyTab = [];
        this._oEffect = null;
        this._isNext = null;
    },

    /**
        jindo.m.SlideTab 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
        @override
    **/
    _setWrapperElement: function(el) {
        var sPrefix = this._sPrefix;
        this.$super._setWrapperElement(el);
        this._htWElement["tab_view"] = jindo.$Element(this._htWElement["baseElement"].query('.' + sPrefix + 'tabview'));
        this._htWElement["tab_container"] = jindo.$Element(this._htWElement["baseElement"].query('.' + sPrefix + 'tab-cont'));
        this._htWElement["prev"] = jindo.$Element(this._htWElement["baseElement"].query('.' + sPrefix + 'prev'));
        this._htWElement["next"] = jindo.$Element(this._htWElement["baseElement"].query('.' + sPrefix + 'next'));
        this._htWElement["baseElement"].css("position","relative");
        this._htWElement["tab_view"].css("overflow","hidden");
    },

    /**
        초기 tab, panel 데이터 초기화
        @override
    **/
    _initData : function() {
        this.$super._initData();
        var nCountPreView = this.option("nCountPerVeiw"),
            el = null,
            nRemainPage;

        // total Page 사이즈 결정
        this._nTotalPage = parseInt(this._aTab.length / nCountPreView, 10);
        nRemainPage = this._aTab.length % nCountPreView;
        if(nRemainPage > 0 ) {
            this._nTotalPage++;
        }
        // 9개의 컨텐츠에서 CountPreView 값이 3이 되면 nRemainPage 가 0이 되어 하단 dummy tab 생성시 불필요한 li 태그가 생성되어 이를 보정.
        // 또한 상단 nTotalPage 값은 보정 전 체크가 필요 하므로 상단에 적용한다. - 20131211 my mania
        nRemainPage = nRemainPage == 0 ? nCountPreView : nRemainPage;
        // dummy tab 생성
        for(var j=0, nLength=nCountPreView - nRemainPage; j< nLength; j++) {
            el = jindo.$("<li></li>");
            this._aDummyTab.push(jindo.$Element(el));
            this._htWElement["tab_container"].append(el);
        }
        // Effect 생성
        this._oEffect = new jindo.m.LayerEffect(this._htWElement["tab_container"].$value());
    },

    /**
        현재 Tab의 페이지를 반환한다.

        @method getCurrentPage
        @return {Number} 현재 tab의 현재 페이지를 반환함 (page수는 1부터)
    **/
    getCurrentPage : function() {
        return this._nCurrentPage;
    },

    /**
        현재 Tab의 총 페이지수를 반환

        @method getTotalPage
        @return {Number} 현재 Tab의 총 페이지수를 반환. (초기값 1)
    **/
    getTotalPage : function() {
        return this._nTotalPage;
    },

    /**
        Tab을 View에 맞게 조절 및 Page 설정값 조정
        @method resize
    **/
    resize : function() {
        var nTabWidth, nPrePageWidth = this._nPageWidth;
        // tab 사이즈 결정
        this._nPageWidth = this._htWElement["tab_view"].width() - this._htWElement["prev"].width() - this._htWElement["next"].width();
        nTabWidth = this._nPageWidth / this.option("nCountPerVeiw");

        if(nPrePageWidth > this._nPageWidth) {  // 기존 사이즈 보다 작아지는 경우
            this._setTabWidth(nTabWidth);
            this._htWElement["tab_container"].width(this._nPageWidth * this._nTotalPage);
        } else {        // 기존 사이즈 보다 커지는 경우
            this._htWElement["tab_container"].width(this._nPageWidth * this._nTotalPage);
            this._setTabWidth(nTabWidth);
        }
        this._htWElement["tab_container"].css("left", (this._nCurrentPage-1) * -this._nPageWidth );
    },

    /**
        Tab의 width를 설정한다.
    **/
    _setTabWidth : function(nTabWidth) {
        jindo.$A(this._aTab).forEach(function(v,i,a) {
            v.width(nTabWidth);
        });
        jindo.$A(this._aDummyTab).forEach(function(v,i,a) {
            v.width(nTabWidth);
        });
    },

    /**
        beforePrev 사용자 이벤트 호출
    **/
    _fireEventBeforePrev : function() {

        /**
            이전버튼 이벤트 발생 전에 발생

            @event beforePrev
            @param {String} sType 커스텀 이벤트명
            @param {Number} nPage 이전버튼 이벤트 발생 전 페이지 번호 (1번부터 시작)
            @param {Number} nIndex 이전버튼 이벤트 발생 전에 선택된 tab 인덱스 번호 (0부터 시작)
            @param {Number} nTotalPage 총 페이지 개수
            @param {Function} stop prev를 중지한다. beforePrev이후 커스텀 이벤트(prev)가 발생하지 않는다.
        **/
        return this.fireEvent("beforePrev", {
            nPage : this._nCurrentPage,
            nIndex : this._nCurrentIndex,
            nTotalPage : this._nTotalPage
        });
    },

    /**
        Prev 사용자 이벤트 호출
    **/
    _fireEventPrev : function() {
        /**
            이전버튼 이벤트 발생 후에 발생

            @event prev
            @param {String} sType 커스텀 이벤트명
            @param {Number} nPage 이전버튼 이벤트 발생 후 페이지 번호 (1번부터 시작)
            @param {Number} nIndex 이전버튼 이벤트 발생 후에 선택된 tab 인덱스 번호 (0부터 시작)
            @param {Number} nTotalPage 총 페이지 개수
            @param {Function} stop stop stop를 호출하여 영향 받는 것이 없음.
        **/
        this.fireEvent("prev", {
            nPage : this._nCurrentPage,
            nIndex : this._nCurrentIndex,
            nTotalPage : this._nTotalPage
        });
    },

    /**
        beforeNext 사용자 이벤트 호출
    **/
    _fireEventBeforeNext : function() {
        /**
            이전버튼 이벤트 발생 후에 발생

            @event beforeNext
            @param {String} sType 커스텀 이벤트명
            @param {Number} nPage 이후버튼 이벤트 발생 전 페이지 번호 (1번부터 시작)
            @param {Number} nIndex 이후버튼 이벤트 발생 전에 선택된 tab 인덱스 번호 (0부터 시작)
            @param {Number} nTotalPage 총 페이지 개수
            @param {Function} stop next를 중지한다. beforeNext이후 커스텀 이벤트(next)가 발생하지 않는다.
        **/
        return this.fireEvent("beforeNext", {
            nPage : this._nCurrentPage,
            nIndex : this._nCurrentIndex,
            nTotalPage : this._nTotalPage
        });
    },

    /**
        Prev 사용자 이벤트 호출
    **/
    _fireEventNext : function() {
        /**
            이후버튼 이벤트 발생 후에 발생

            @event next
            @param {String} sType 커스텀 이벤트명
            @param {Number} nPage 이후버튼 이벤트 발생 후 페이지 번호 (1번부터 시작)
            @param {Number} nIndex 이후버튼 이벤트 발생 후에 선택된 tab 인덱스 번호 (0부터 시작)
            @param {Number} nTotalPage 총 페이지 개수
            @param {Function} stop stop stop를 호출하여 영향 받는 것이 없음.
        **/
        this.fireEvent("next", {
            nPage : this._nCurrentPage,
            nIndex : this._nCurrentIndex,
            nTotalPage : this._nTotalPage
        });
    },

    _onAfterSelect : function(welElement) {
        this.select(this._getIdx(welElement));
    },

    /**
        index에 해당하는 패널 선택
        @param {Object} nIdx
    **/
    _beforeSelect : function(nIdx) {
    },

    /**
     * index에 해당하는 패널 선택
     * @param {Object} nIdx
     * @history 1.7.0 htOption 추가 {bSelect : 버튼 클릭을 통해 실행된 경우 , bEffect : 사용자가 임의로 움직임을 처리 하기 위한 duration 정보}
     * @history 1.5.0 Bug 셀렉트 될 경우, 해당 뷰로 이동하는 버그 수정
     */
    select : function(nIdx, htOption) {
        this.$super.select(nIdx);
        var nPage = parseInt(nIdx / ~~this.option("nCountPerVeiw"),10) + 1,
            nDiff = nPage - this.getCurrentPage();
        if( nDiff > 0 ) {
            this.next(nDiff, htOption);
        } else if(nDiff < 0) {
            this.prev(-nDiff, htOption);
        }
    },

    /**
     * @description jindo.m.SlideTab 에서 사용하는 모든 이벤트를 바인드한다.
     * @override
     */
    _attachEvent : function() {
        this.$super._attachEvent();
        this._htEvent["prev_click"] = {
            ref: jindo.$Fn(this._onPrev, this).attach(this._htWElement["prev"], "click"),
            el: this._htWElement["prev"]
        };
        this._htEvent["next_click"] = {
            ref : jindo.$Fn(this._onNext, this).attach( this._htWElement["next"], "click"),
            el : this._htWElement["next"]
        };
        this._oEffect.attach("afterEffect", jindo.$Fn(this._onAfterEffect, this).bind());
    },

    /**
     * @description jindo.m.SlideTab 에서 사용하는 모든 이벤트를 해체한다.
     * @override
     */
    _detachEvent : function() {
        this._oEffect.detachAll();
        this.$super._detachEvent();
    },

    /**
     * 효가가 완료되었을 경우, 현재 페이지값을 변경하고, 현재 페이지의 첫번째 tab을 선택
     *  버튼을 통해 이동한(this._bSelect == true) 경우 페이지의 첫번째 아이템을 선택할 수 있도록 처리 하기 위한<br />
     *  반대로 버튼을 통하지 않았을 경우 (select(4)) 선택한 탭이 위치한 페이지로 이동만 가능하도록 한다.
     */
    _onAfterEffect : function() {
        if(this._isNext) {
            this._nCurrentPage++;
            this._fireEventNext();
        } else {
            this._nCurrentPage--;
            this._fireEventPrev();
        }
        this._isNext = null;
        
        if(this._bSelect){
            this.select((this._nCurrentPage-1) * this.option("nCountPerVeiw"));
        }
    },

    /**
     * 이번 버튼이 눌러졌을 경우 이벤트 처리
     * @param {Object} we
     */
    _onPrev : function(we) {
        if(this._oPanelEffect && this._oPanelEffect.isPlaying() ) {
            we.stop(jindo.$Event.CANCEL_ALL);
            return false;
        }
        this.prev(1, {"bSelect" : true});
    },

    /**
     * @description 이전으로 이동한다.
     * @param {Number} 이전으로 이동할 페이지수 (기본값 1)
     * @history 1.7.0 htOption 추가 {bSelect : 버튼 클릭을 통해 실행된 경우(true) 첫번째 탭을 선택한다 , bEffect : 사용자가 임의로 움직임을 처리 하기 위한 duration 정보}
     * @history 1.5.0 Update Method 추가
     */
    prev : function(nNum, htOption) {
        if(nNum != undefined && nNum <= 0){
            return false;
        }
        nNum = nNum || 1;
        htOption = !htOption ? {} : htOption;
        this._bSelect = htOption.bSelect || false;
        var nPrevPage = this._nCurrentPage - nNum + 1;
        if ((nPrevPage > 1) && !this._oEffect.isPlaying()) {
            if(!htOption.bEffect && htOption.bEffect != undefined){
                this._htWElement["tab_container"].css("left" , this._nPageWidth * nNum);
                this._onAfterEffect();
            }else{
                if (this._fireEventBeforePrev()) {
                    this._oEffect.slide({
                        sDirection: "right",
                        nDuration: this.option("nSlideDuration"),
                        sTransitionTimingFunction : this.option("sTimingFunction"),
                        nSize: this._nPageWidth * nNum
                    });
                }
            }
            this._nCurrentPage = nPrevPage;
            this._isNext = false;
        }
    },

    /**
     * 이후 버튼이 눌러졌을 경우 이벤트 처리
     * @param {Object} we
     */
    _onNext : function(we) {
//      console.log(this._nCurrentPage, this._nTotalPage);
        if(this._oPanelEffect && this._oPanelEffect.isPlaying() ) {
            we.stop(jindo.$Event.CANCEL_ALL);
            return false;
        }
        this.next(1, {"bSelect" : true});
    },

    /**
     * @description 다음으로 이동한다.
     * @param {Number} 다음으로 이동할 페이지수 (기본값 1)
     * @history 1.7.0 htOption 추가 {bSelect : 버튼 클릭을 통해 실행된 경우(true) 첫번째 탭을 선택한다  , bEffect : 사용자가 임의로 움직임을 처리 하기 위한 duration 정보}
     * @history 1.5.0 Update Method 추가
     */
    next : function(nNum, htOption) {
        if(nNum != undefined && nNum <= 0){
            return false;
        }
        nNum = nNum || 1;
        htOption = !htOption ? {} : htOption;
        this._bSelect = htOption.bSelect || false;
        var nNextPage = this._nCurrentPage + nNum -1;
        if ((nNextPage < this._nTotalPage) && !this._oEffect.isPlaying()) {
            if (this._fireEventBeforeNext()) {
                this._nCurrentPage = nNextPage;
                this._isNext = true;
                if(!htOption.bEffect && htOption.bEffect != undefined){
                    this._htWElement["tab_container"].css("left" , -this._nPageWidth * nNum);
                    this._onAfterEffect();
                }else{
                    this._oEffect.slide({
                        sDirection: "left",
                        nDuration: this.option("nSlideDuration"),
                        sTransitionTimingFunction : this.option("sTimingFunction"),
                        nSize: this._nPageWidth * nNum
                    });
                }
            }
        }
    },

    /**
        jindo.m.SlideTab 에서 사용하는 모든 객체를 release 시킨다.
        @override
        @method destroy
    **/
    destroy : function() {
        this.deactivate();
        for(var p in this._aDummyTab) {
            this._aDummyTab[p] = null;
        }
        this._aDummyTab = null;
        this._initVar();

        if(this._oEffect) {
            this._oEffect.destroy();
            this._oEffect = null;
        }
        this.$super.destroy();
    }
}).extend(jindo.m.CoreTab);