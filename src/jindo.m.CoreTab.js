/**
    @fileOverview 탭컴포넌트 상위 컴포넌트
    @author sculove
    @version #__VERSION__#
    @since 2012. 3. 19.
**/
/**
    탭컴포넌트 상위 컴포넌트

    @class jindo.m.CoreTab
    @extends jindo.m.UIComponent
    @uses jindo.m.SlideEffect {0,}
    @keyword tab, 탭
    @group Component

    @history 1.11.0 Bug jindo 1.x.x 에서 스크립트 오류 수정
    @history 1.7.0 Bug 안드로이드 4.x 갤럭시 시리즈에서 하이라이트 사라지지 않는 문제 제거
    @history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
    @history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
    @history 1.0.0 - -
    @history 0.9.5 - -
    @history 0.9.0 Release 최초 릴리즈
    @invisible
**/
jindo.m.CoreTab = jindo.$Class({
    /* @lends jindo.m.CoreTab.prototype */
    /**
        초기화 함수

        @constructor
        @param {Varient} el Tab Layout Wrapper
        @param {Object} [htOption] 초기화 옵션 객체
            @param {String} [htOption.sClassPrefix='tc-'] 기본 prefix classname
            @param {Number} [htOption.nDefaultIndex=0] 초기 index 값
            @param {Number} [htOption.nPanelDuration=0] 애니메이션 효과 시간(ms)
            @param {Number} [htOption.nHeight=0] 높이값
            @param {Number} [htOption.nWidth=0] 넓이값
            @param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate() 수행여부
    **/
    $init : function(el, htUserOption) {
        this.option({
            sClassPrefix        : "tc-",
            nDefaultIndex       : 0,
            nPanelDuration      : 0,
            nHeight             : 0,
            nWidth              : 0,
            bActivateOnload     : true
        });
        this.option(htUserOption || {});
        this._initVar();
        this._setWrapperElement(el);
    },

    /**
        jindo.m.CoreTab 에서 사용하는 모든 인스턴스 변수를 초기화한다.
    **/
    _initVar : function() {
        this._sPrefix = this.option('sClassPrefix');
        this._nCurrentIndex = -1;
        this._aTab = [];
        this._aPanel = [];
        this._oPanelEffect = null;
    },

    /**
        jindo.m.CoreTab 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
    **/
    _setWrapperElement : function(el) {
        this._htWElement = {};
        el = (typeof el == "string" ? jindo.$(el) : el);
        if(!el) {
            return;
        }
        this._htWElement["baseElement"] = jindo.$Element(el);
        this._htWElement["tab_container"] = jindo.$Element(this._htWElement["baseElement"].query('.' + this._sPrefix + 'tab-cont'));
        this._htWElement["panel_container"] = jindo.$Element(this._htWElement["baseElement"].query('.' + this._sPrefix + 'panel-cont'));

        // 탭 외부를 선택시 하이라이트 되는 문제
        if(this._htWElement["tab_container"]) {
            this._htWElement["tab_container"].css('-' + jindo.m.getCssPrefix() + '-tap-highlight-color', 'transparent');
        }
    },

    /**
        초기 tab, panel 데이터 초기화
    **/
    _initData : function() {
        var isPanelEffect = this.option("nPanelDuration"),
            nWidth,nHeight,i,nLength;
        this._aTab = this._htWElement["tab_container"].queryAll('.' + this._sPrefix + 'tab');
        this._aPanel = this._htWElement["panel_container"].queryAll('.' + this._sPrefix + 'panel');

        // jindo 1.x 대응 코드
        for(i=0, nLength=this._aTab.length; i < nLength; i++) {
            this._aTab[i] = jindo.$Element(this._aTab[i]);
            this._aPanel[i] = jindo.$Element(this._aPanel[i]);
        }

        if(isPanelEffect) {
            nWidth = (this.option("nWidth") == 0 ? this._htWElement["panel_container"].width() - parseInt(this._aPanel[0].css("paddingLeft"),10) - parseInt(this._aPanel[0].css("paddingRight"),10) : this.option("nWidth")) + "px";
            nHeight = this.option("nHeight") + "px";
        }

        for(i=0, nLength=this._aTab.length; i < nLength; i++) {
            this._aTab[i] = this._aTab[i].attr("data-index", i);
            if(isPanelEffect) {
                this._aPanel[i].css({
                    width : nWidth,
                    height : nHeight,
                    position : "absolute"
                });
            }
        }
        if(isPanelEffect) {
            this._oPanelEffect = new jindo.m.LayerEffect(this._aPanel[0].$value());
            this._htWElement["panel_container"].css({
                position : "relative",
                "overflow" : "hidde",
                height : nHeight
            });
        }
    },

    /**
        내부 data-index를 얻는다.
        @param  {jindo.$Element} welElement index를 얻고자하는 jindo.$Element
        @return {Number}            index 값
    **/
    _getIdx : function(welElement) {
        return parseInt(welElement.attr("data-index"),10);
    },

    /**

        @param  {jindo.$Element} welElement 확인하고자 하는 엘리먼트
        @return {jindo.$Element}            Tab의 jindo.$Element
    **/
    _getTabElement : function(welElement) {
        var sTabClassName = this._sPrefix + "tab",
            sMoreTabClassName = this._sPrefix + "more-tab";
        if(welElement.hasClass(sTabClassName) || welElement.hasClass(sMoreTabClassName)) {
            return welElement;
        } else if(this._htWElement["tab_container"].isParentOf(welElement) && (!welElement.hasClass(sTabClassName) || !welElement.hasClass(sMoreTabClassName))) {
            return welElement.parent(function(v){
                return v.hasClass(sTabClassName) || v.hasClass(sMoreTabClassName);
            },2)[0];
        }
        return welElement;
    },

    /**
        jindo.m.CoreTab 컴포넌트를 활성화한다.
        activate 실행시 호출됨
    **/
    _onActivate : function() {
        this._attachEvent();
    },

    /**
        jindo.m.CoreTab 컴포넌트를 비활성화한다.
        deactivate 실행시 호출됨
    **/
    _onDeactivate : function() {
        this._detachEvent();
    },

    /**
        jindo.m.CoreTab 에서 사용하는 모든 이벤트를 바인드한다.
    **/
    _attachEvent : function() {
        this._htEvent = {};
        this._htEvent["tab_click"] = {
            el  : this._htWElement["tab_container"],
            ref : jindo.$Fn(this._onSelect, this).attach( this._htWElement["tab_container"], "click")
        };
    },
    /**
        jindo.m.CoreTab 에서 사용하는 모든 이벤트를 해제한다.
    **/
    _detachEvent : function() {
        for(var p in this._htEvent) {
            var ht = this._htEvent[p];
            ht.ref.detach(ht.el, p.substring(p.lastIndexOf("_")+1));
        }
        this._htEvent = null;
        if(this._oPanelEffect) {
            this._oPanelEffect.detachAll();
        }
    },

    /**
        현재 Tab의 인덱스를 반환한다.
        @return {Number} 현재 tab의 index를 반환함 (index는 0부터)
    **/
    getCurrentIndex : function() {
        return this._nCurrentIndex;
    },

    /**
     * 현재 Tab의 페이지를 반환한다.
     * @return {Number} 현재 tab의 현재 페이지를 반환함 (page수는 1부터)
     */
    // getCurrentPage : function() {
    //  return (this._nCurrentIndex + 1);
    // },

    /**
        현재 Tab을 반환
        @param {Number} nIdx 옵션 (index는 0부터)
        @return {HTMLElement, Array} index가 있을 경우, index에 해당하는 TAB HTMLElement반환
                                        index가 없을 경우, TAB HTMLElement 배열을 반환
        @example
         var aTab = oComponent.getTab();
         var elTab = oComponent.getTab(2);
    **/
    getTab : function(nIdx) {
        if(nIdx !== null && this._aTab.length > nIdx) {
            return this._aTab[nIdx];
        } else {
            return this._aTab;
        }
    },

    /**
        현재 Panel을 반환
        @param {Number} nIdx 옵션 (index는 0부터)
        @return {HTMLElement, Array} index가 있을 경우, index에 해당하는 Panel HTMLElement반환
                                        index가 없을 경우, Panel HTMLElement 배열을 반환
        @example
         var aPanel = oComponent.getPanel();
         var elPanel = oComponent.getPanel(2);
    **/
    getPanel : function(nIdx) {
        if(nIdx !== null && this._aPanel.length > nIdx) {
            return this._aPanel[nIdx];
        } else {
            return this._aPanel;
        }
    },

    /**
        탭을 선택했을 시, 이벤트 처리
        @param {Object} we
    **/
    _onSelect : function(we) {
        if(we.element) {
            if(this._oPanelEffect && this._oPanelEffect.isPlaying() ) {
                we.stop(jindo.$Event.CANCEL_ALL);
                return false;
            }
            var welElement = this._getTabElement(jindo.$Element(we.element));
            this._onAfterSelect(welElement);
        }
    },

    /**
        index에 해당하는 패널 선택
        @param {Object} nIdx
    **/
    select : function(nIdx) {
        if(nIdx !== null && nIdx >= 0 && this._aTab.length > nIdx && (this._nCurrentIndex != nIdx)) {

            /**
            패널이 선택되기 전 발생

            @event beforeSelect
            @param {String} sType 커스텀 이벤트명
            @param {Number} nIndex 선택되기전의 tab 인덱스 번호 (0부터 시작)
            @param {HTMLElement} elTab 선택되기 전 tab Element
            @param {HTMLElement} elPanel 선택되기 전 panel Element
            @param {Function} stop 수행시 패널이 선택되지 않는다.
          **/
            if (this._fireEventBefore("beforeSelect")) {
                var sSelect = this._sPrefix + "selected";
                this._beforeSelect(nIdx);

                // 변경할 탭 선택
                this._aTab[nIdx].addClass(sSelect);
                this._aPanel[nIdx].addClass(sSelect);
                this._aPanel[nIdx].show();
                if(this._nCurrentIndex > -1){
                    this._aTab[this._nCurrentIndex].removeClass(sSelect);
                    if(this._oPanelEffect) {
                        this._slide(this._nCurrentIndex, nIdx);
                    } else {
                        this._aPanel[this._nCurrentIndex].removeClass(sSelect);
                        this._aPanel[this._nCurrentIndex].hide();
                    }
                }
                this._nCurrentIndex = nIdx;
                 /**
                패널이 선택되기 전 발생

                @event select
                @param {String} sType 커스텀 이벤트명
                @param {Number} nIndex 선택되기전의 tab 인덱스 번호 (0부터 시작)
                @param {HTMLElement} elTab 선택되기 전 tab Element
                @param {HTMLElement} elPanel 선택되기 전 panel Element
                @param {Function} stop 수행시 영향받는것 없다.
              **/
                this._fireEvent("select");
            }
        }
    },

    /**
        슬라이드 효과를 준다.
        @param  {Number} nBeforeIdx [전에 선택된 index]
        @param  {Number} nIdx        [현재 선택하려는 index]
    **/
    _slide : function(nBeforeIdx, nIdx) {
        var self=this,
            isLeft = nBeforeIdx < nIdx,
            nWidth = this._aPanel[nIdx].width();
         /**
            패널 슬라이드 효과가 발생하기 전에 발생

            @event slide
            @param {String} sType 커스텀 이벤트명
            @param {Number} nIndex 선택되기전의 tab 인덱스 번호 (0부터 시작)
            @param {HTMLElement} elTab 선택되기 전 tab Element
            @param {HTMLElement} elPanel 선택되기 전 panel Element
            @param {Function} stop 수행시 슬라이드 효과가 발생하지 않는다
        **/
        if (this._fireEventBefore("beforeSlide")) {
            this._oPanelEffect.setLayer(this._aPanel[nIdx].$value());
            this._oPanelEffect.attach("afterEffect", function() {
                self._onPannelAfterEffct(nBeforeIdx, nIdx);
            });
            this._aPanel[nIdx].css({
                "left" : isLeft ? nWidth : -nWidth,
                "zIndex" : 9
            });

            this._oPanelEffect.slide({
                sDirection : isLeft ? 'left' : "right",
                nDuration : this.option("nPanelDuration"), //효과 애니메이션 적용시간 (ms)
                nSize : nWidth
            });
        }
    },

    /**
        slide완료 후 작업
        @param  {Number} nBeforeIdx [전에 선택된 index]
        @param  {Number} nIdx        [현재 선택하려는 index]
    **/
    _onPannelAfterEffct : function(nBeforeIdx, nIdx) {
        this._aPanel[nBeforeIdx].removeClass(this._sPrefix + "selected");
        this._aPanel[nBeforeIdx].hide();
        this._aPanel[nBeforeIdx].css("zIndex",1);
        this._aPanel[nIdx].css("zIndex" , 2);
        this._oPanelEffect.detachAll("afterEffect");
        /**
            패널 슬라이드 효과가 발생한 후에 발생

            @event slide
            @param {String} sType 커스텀 이벤트명
            @param {Number} nIndex 선택된 tab 인덱스 번호 (0부터 시작)
            @param {HTMLElement} elTab 선택된 tab Element
            @param {HTMLElement} elPanel 선택된 panel Element
            @param {Function} 수행시 영향받는것은 없다
        **/
        this._fireEvent("slide");
    },

    /**
        Before 사용자 이벤트 호출
    **/
    _fireEventBefore : function(sType) {
        return this.fireEvent(sType, {
            nIndex : this._nCurrentIndex,
            elTab : this._aTab[this._nCurrentIndex],
            elPanel : this._aPanel[this._nCurrentIndex]
        });
    },

    /**
        사용자 이벤트 호출
    **/
    _fireEvent : function(sType) {
        this.fireEvent(sType, {
            nIndex : this._nCurrentIndex,
            elTab : this._aTab[this._nCurrentIndex],
            elPanel : this._aPanel[this._nCurrentIndex]
        });
    },

    /**
        jindo.m.CoreTab 에서 사용하는 모든 객체를 release 시킨다.
        @method destroy
    **/
    destroy : function() {
        for(var p in this._htWElement) {
            this._htWElement[p] = null;
        }
        this._htWElement = null;

        for(p in this._aTab) {
            this._aTab[p] = null;
        }
        this._aTab = null;

        for(p in this._aPanel) {
            this._aPanel[p] = null;
        }
        this._aPanel = null;

        if(this._oPanelEffect) {
            this._oPanelEffect.destroy();
            this._oPanelEffect = null;
        }
    }
}).extend(jindo.m.UIComponent);