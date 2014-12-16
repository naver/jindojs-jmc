/**
    @fileOverview 페이지의 고정영역 내부를 터치하여 스크롤링 할 수 있고, 인덱스 표기 기능 및 스크롤바가 있는 컴포넌트
    @author sculove
    @version #__VERSION__#
    @since 2012. 4. 2.
**/
/**
    페이지의 고정영역 내부를 터치하여 스크롤링 할 수 있고, 인덱스 표기 기능 및 스크롤바가 있는 컴포넌트

    @class jindo.m.IndexScroll
    @extends jindo.m.Scroll
    @group Component

    @history 1.14.0 Update fEffect 추가
    @history 1.14.0 Update bUseTranslate 옵션 제거
    @history 1.14.0 Update Kitkat 하이라이트 이슈 수정
    @history 1.14.0 Update beforePosition nNextLeft, nNextTop, nVectorX, nVectorY 속성 추가
    @history 1.14.0 Update rotate 이벤트 추가
    @history 1.12.0 Update css3d, translate 를 사용할 수 있도록 변경
    @history 1.10.0 Bug useTimingFunction이 true일 경우, 인덱스 정보가 정확하지 않는 문제 수정
    @history 1.7.0 Bug 안드로이드 4.x 갤럭시 시리즈에서 하이라이트 사라지지 않는 문제 제거
    @history 1.7.0 Update base엘리먼트에 z-index = 2000으로 설정 (Css3d사용시 충돌하는 버그 수정)
    @history 1.5.0 Support Window Phone8 지원
    @history 1.4.0 Support iOS 6 지원
    @history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
    @history 1.2.0 Release 최초 릴리즈
**/
jindo.m.IndexScroll = jindo.$Class({
    /* @lends jindo.m.IndexScroll.prototype */
    /**
        초기화 함수

        @constructor
        @param {String|HTMLElement} el Scroll할 Element (필수)
        @remark <auidoc:see content="jindo.m.Scroll">jindo.m.Scroll</auidoc:see>의 옵션과 동일하다
        @param {Object} [htOption] 초기화 옵션 객체
            @param {Boolean} [htOption.bUseIndexView=false] 인덱스뷰를 보여준다.
            인덱스뷰에 표기될 내용은 기본적으로 <strong>[sClassPrefix]index</strong>로 지정된 엘리먼트의 text 정보로 구성되어 진다.<br />
            인덱스의 text정보와 다르게 다르게 인덱스뷰를 구성하기 위해서는 <strong>[sClassPrefix]index</strong>로 지정된 엘리먼트에 <strong>data-text</strong> 속성을 지정하여 표시할 인덱스이름 정보를 변경할 수 있다.<br />
            인덱스뷰의 디자인은 <strong>[sClassPrefix]indexview</strong>, <strong>[sClassPrefix]indexview-item</strong> 클래스 통해 조절가능하다.
    **/
    $init : function(el,htUserOption) {
        this.option("bUseTimingFunction", false);

        if(this instanceof jindo.m.IndexScroll) {
          if(this.option("bActivateOnload")) {
            this.activate();
          }
        }
    },

    /**
        jindo.m.IndexScroll 에서 사용하는 모든 인스턴스 변수를 초기화한다.
    **/
    _initVar: function() {
        this.$super._initVar();
        this._aIndexInfo = null;
        this._bUseIndex = true;
        if( (jindo.m.getDeviceInfo().iphone || jindo.m.getDeviceInfo().ipad) && (parseInt(jindo.m.getDeviceInfo().version,10) < 5) ) {
            this._sEvent = "click";
        } else {
            this._sEvent = "touchstart";
        }
    },

    /**
        jindo.m.IndexScroll 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
    **/
    _setWrapperElement: function(el) {
        this.$super._setWrapperElement(el);
        this._createFixedIndex();
        this._createIndexView();
    },

    /**
        section Element를 추출하여 정보를 갱신한다.
    **/
    _refreshIndexInfo : function() {
        var aIndexElement = this._htWElement["scroller"].queryAll("." + this.option("sClassPrefix") + "index"),
            aIndexInfo = [],
            nWrapperMarginTop = this._htWElement["wrapper"].offset().top;
        for(var i=0, nLength = aIndexElement.length; i < nLength; i++) {
            aIndexInfo.push(this._getIndexInfo(jindo.$Element(aIndexElement[i]), nWrapperMarginTop));
        }
        for(i=0, nLength = aIndexInfo.length-1; i < nLength; i++) {
            aIndexInfo[i].nNextTop = aIndexInfo[i+1].nTop;
            aIndexInfo[i].nLast = aIndexInfo[i+1].nTop - aIndexInfo[i].nHeight;
        }
        // console.log(aIndexInfo);
        this._aIndexInfo = aIndexInfo;
        if(this.option("bUseIndexView")) {
            this._refreshIndexView();
        }
    },

    /**
        인덱스뷰 생성
    **/
    _createIndexView : function() {
        var nId = this.option("sClassPrefix") + "_indexview__";
        this._htWElement["indexview"] = jindo.$Element(nId);
        if(!this._htWElement["indexview"]) {
            this._htWElement["indexview"] = jindo.$Element("<ul id='" + nId + "' class='" + this.option("sClassPrefix") + "indexview' style='position:absolute;z-index:2002;-" + jindo.m.getCssPrefix() + "-tap-highlight-color:transparent;'>");
            this._htWElement["indexview"].appendTo(document.body);
        }
    },

    /**
        인덱스뷰 보이기

        @method showIndexView
        @history 1.4.0 Update 메소드 추가
    **/
    showIndexView : function() {
        if(this.option("bUseIndexView") && this._htWElement["indexview"]) {
            this._htWElement["indexview"].show();

        }
    },

    /**
        인덱스뷰 감추기

        @method hideIndexView
        @history 1.4.0 Update 메소드 추가
    **/
    hideIndexView : function() {
        if(this.option("bUseIndexView") && this._htWElement["indexview"]) {
            this._htWElement["indexview"].hide();
        }
    },

    /**
        인덱스뷰데이터 갱신
    **/
    _refreshIndexView : function() {
        var htOffset = this._htWElement["wrapper"].offset(),
            sName,wel,nTop,nLeft,
            sHTML = "";
        for(var i=0, nLength = this._aIndexInfo.length; i<nLength; i++ ) {
            wel = this._aIndexInfo[i].wel;
            sName = wel.attr("data-text") ? wel.attr("data-text") : wel.text();
            sHTML += "<li class='" + this.option("sClassPrefix") + "indexview_item' data-index='"+ i + "'>" + sName + "</li>";
        }
        this._htWElement["indexview"].html(sHTML);

        nTop = htOffset.top + this._htWElement["wrapper"].height()/2;
        nLeft = htOffset.left + this._htWElement["wrapper"].width();
        this._htWElement["indexview"].css({
            top : (nTop - this._htWElement["indexview"].height()/2) + "px",
            left : (nLeft - this._htWElement["indexview"].width() - 10) + "px"
        });
    },

    _attachEvent : function() {
        this.$super._attachEvent();
        this._htEvent["position"] = jindo.$Fn(this._onPosition, this).bind();
        this.attach("position", this._htEvent["position"]);
        if(this.option("bUseIndexView")) {
            this._htEvent["indexview"] = jindo.$Fn(this._onIndexView, this).attach(this._htWElement["indexview"], this._sEvent);
        }
    },

    _detachEvent : function() {
        this.detach("position", this._htEvent["position"]);
        if(this.option("bUseIndexView")) {
            this._htEvent["indexview"].detach(this._htWElement["indexview"], this._sEvent);
        }
    },

    /**
        인덱스뷰 선택시 이동
        @param  {jindo.$Event} we
    **/
    _onIndexView : function(we) {
        if(we.element.tagName == "LI") {
            var wel = jindo.$Element(we.element),
                nIdx = wel.attr("data-index");
            this.scrollTo(0,this._aIndexInfo[nIdx].nTop);
        }
    },

    /**
        스크롤 포지션 변경시 처리
        @param  {jindo.$Event} we 스크롤변경
    **/
    _onPosition : function(we) {
        if(this._bUseIndex) {
            this._setPosFixedIndex(-we.nTop);
        }
    },

    /**
        섹션 정보를 반환한다.
        @param  {jindo.$Element} welIndex 섹션 엘리먼트
        @param  {Number} Wrapper의 Top offset
        @return {Object} 섹션정보(위치값)
    **/
    _getIndexInfo : function(welIndex, nWrapperMarginTop) {
        var htInfo = {};
        htInfo.wel = welIndex;
        htInfo.nTop = welIndex.offset().top - nWrapperMarginTop;
        htInfo.nHeight = welIndex.height();
        htInfo.nBottom = htInfo.nTop + htInfo.nHeight;
        // console.log(htInfo.nTop,htInfo.nHeight, htInfo.nBottom);
        return htInfo;
    },

    /**
        fixed된 index을 표기하거나 sliding 한다.
        @param {Number} nTop 현재스크롤의 top 위치
    **/
    _setPosFixedIndex : function(nTop) {
        var nBeforeIndex = this._nBeforeIndex;
        var nIdx = this._getCurrentIdx(nTop),
            htIndexInfo = this._aIndexInfo[nIdx],
            nMoveTop;
        // console.log(nIdx, htIndexInfo);
        if(nIdx == -1) {
            this._htWElement["index_top"].hide();
            this._htWElement["index_bottom"].hide();
        } else {
            if(htIndexInfo.nLast && (htIndexInfo.nLast <= nTop && nTop < htIndexInfo.nNextTop) ) {
                nMoveTop = htIndexInfo.nLast - nTop;
                if(nBeforeIndex != nIdx){
                    this._htWElement["index_top"].html(htIndexInfo.wel.outerHTML());
                }
                // this._htWElement["index_top"].css("top", nMoveTop + "px");
                this._htWElement["index_top"].css(this.sCssPrefix + "Transform", "translate" + this.sTranOpen +"0, " + nMoveTop + "px" + this.sTranEnd).show();
                if(nBeforeIndex != nIdx){
                    this._htWElement["index_bottom"].html(this._aIndexInfo[nIdx+1].wel.outerHTML()).show();
                    this._bShowIndex = true;
                }
                // this._htWElement["index_bottom"].css("top" , (nMoveTop + htIndexInfo.nHeight) + "px").show();
                this._htWElement["index_bottom"].css(
                    this.sCssPrefix + "Transform" , "translate" + this.sTranOpen + "0, " + (nMoveTop + htIndexInfo.nHeight) + "px" +  this.sTranEnd
                );
            } else {
                if(nBeforeIndex != nIdx || this._bShowIndex){
                    this._htWElement["index_top"].html(htIndexInfo.wel.outerHTML())
                        // .css("top", "0px").show();
                        .css(this.sCssPrefix + "Transform" , "translate" + this.sTranOpen + "0, 0" + this.sTranEnd).css("display", "block");
                    this._htWElement["index_bottom"].hide();
                    this._bShowIndex = false;

                }
            }
        }
        this._nBeforeIndex =  nIdx;
    },

    /**
        fixed된 index를 숨기기.

        @method hideIndex
        @history 1.4.0 Update 메소드 추가
    **/
    hideIndex : function() {
        this._bUseIndex = false;
        this._htWElement["index_top"].hide();
        this._htWElement["index_bottom"].hide();
    },

    /**

        fixed된 index를 보이기

        @method showIndex
        @history 1.4.0 Update 메소드 추가
    **/
    showIndex : function() {
        this._bUseIndex = true;
        this._setPosFixedIndex(this._nTop);
        this._htWElement["index_top"].show();
    },

    /**
     * [_getCurrentIdx description]
     * @param  {Numbrt} nPos nPos에 해당하는 스크롤의 top 정보
     * @return {Number}      top정보를 바탕으로 현재 section이 속해있는 index를 반환한다.
     */
    _getCurrentIdx : function(nPos) {
        for(var i=0, nLength = this._aIndexInfo.length; i < nLength; i++) {
            if(this._aIndexInfo[i].nTop > nPos) {
                break;
            }
        }
        return i-1;
    },
    /**
        fixedSection으로 사용될 2개의 Element를 생성한다.
    **/
    _createFixedIndex : function() {
        var sStyle = 'position:absolute;width:100%;top:0;z-index:2001; display:none';
        this._htWElement["index_top"] = jindo.$Element(this._htWElement["wrapper"].query("._scroller_index_scroll_top_"));
        if(!this._htWElement["index_top"]) {
             this._htWElement["index_top"] = jindo.$Element("<div style='" + sStyle +"' class='_scroller_index_scroll_top_'></div>");
             this._htWElement["wrapper"].append( this._htWElement["index_top"]);
        }
        this._htWElement["index_bottom"] = jindo.$Element(this._htWElement["wrapper"].query("._scroller_index_scroll_bottom_"));
        if(!this._htWElement["index_bottom"]) {
             this._htWElement["index_bottom"] = jindo.$Element("<div style='" + sStyle +"' class='_scroller_index_scroll_bottom_'></div>");
             this._htWElement["wrapper"].append( this._htWElement["index_bottom"]);
        }
    },

    /**
        Scroll영역의 내용이 변경될 경우, refresh를 호출하여 변경된 내용의 값을 갱신한다.
        @remark refresh는 wrapper 엘리먼트가 보일경우 정상적으로 동작한다.

        @method refresh
    **/
    refresh : function() {
        if(this.option("bUsePullDown")) {
            this.option("bUsePullDown",false);
        }
        if(this.option("bUsePullUp")) {
            this.option("bUsePullUp",false);
        }
        if(this.option("bUseHScroll")) {
            this.option("bUseHScroll",false);
        }
        this.option("bUseCss3d",false);
        this.$super.refresh();
        this._refreshIndexInfo();
    }
}).extend(jindo.m.Scroll);