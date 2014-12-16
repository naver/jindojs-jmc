/**
    @fileOverview 대용량 스크롤 사용가능한 스크롤컴포넌트 플러그인
    @author sculove
    @version #__VERSION__#
    @since 2012. 7. 27.
**/
/**
    가로나 세로에 대해서만 적용됨.

    @class jindo.m.DynamicPlugin
    @extends jindo.m.Component
    @uses jindo.m.Scroll
    @keyword scroll, 스크롤
    @group Component
    @invisible
**/
jindo.m.DynamicPlugin = jindo.$Class({
    /* @lends jindo.m.DynamicPlugin.prototype */
    /**
        초기화 함수

        @ignore
        @constructor
        @param {String|HTMLElement} el Scroll할 Element (필수)
        @param {Object} [htOption] 초기화 옵션 객체
            @param {Number} [htOption.nRatio=1.5] 고정범위 비
            @param {String} [htOption.sListElement="li"] 리스트 엘리먼트 태그
            @param {String} [htOption.sDirection="V"] 가로, 세로 여부
    **/
    $init : function(el,htUserOption) {
        this.option({
            nRatio : 1.5,
            sListElement : "li",
            sDirection : "V"
        });
        this.option(htUserOption || {});
        this._initVar(el);
        // this.refresh();
    },

    /**
        jindo.m.DynamicPlugin 에서 사용하는 모든 인스턴스 변수를 초기화한다.
    **/
    _initVar: function(el) {
        this._wel = jindo.$Element(el);
        this._aListElement = null;
        this._nStartIdx = -1;
        this._nEndIdx = -1;
        this._nRatio = parseInt(this.option("nRatio"),10);
        this._nPos = -1;
        this._nSize = -1;
        this._sDirection = this.option("sDirection");
    },

    /**

        @param  {Number} nPos  현재 위치 정보
    **/
    refresh : function(nPos) {
        var aListElement = this._wel.queryAll(this.option("sListElement"));
        var wel;
        if(!aListElement) {
            return;
        }
        this._aListElement = [];
        for(var i=0, nLength = aListElement.length; i < nLength; i++) {
            wel = jindo.$Element(aListElement[i]);
            this._aListElement.push({
                el : wel.$value(),
                wel : wel,
                htRange : this._getElementPos(wel),
                sDisplay : wel.css("display"),
                sPosition : wel.css("position")
            });
        }
        this._nPos = nPos || 0;
        this._nSize = this._sDirection == "V" ? this._wel.height() : this._wel.width();
        this._covertPositionType();
    },

    /**
        포지션정보를 absolute로 변경하고 top,left값을 설정한다. 또한, 바깥영역의 엘리먼트를 hidden시킨다.
    **/
    _covertPositionType : function() {
        var nStartPos = this._getStartBoundary(),
            nEndPos = this._getEndBoundary();
        for(var i=0, ht, nLength = this._aListElement.length; i < nLength; i++) {
            ht = this._aListElement[i];
            if(this._sDirection == "V") {
                ht.wel.css({
                    "top" : ht.htRange.nStartPos + "px",
                    "width" : "100%"
                });
            } else {
                ht.wel.css({
                    "left" : ht.htRange.nStartPos + "px",
                    "height" : "100%"
                });
            }
            ht.wel.css("position","absolute");
            if(ht.htRange.nStartPos <= -nStartPos) {
                // ht.el.style.display = "none";
                this._nStartIdx = i;
            } else if(ht.htRange.nEndPos <= -nEndPos) {
                ht.el.style.display = ht.sDisplay;
                this._nEndIdx = i;
            } else {
                ht.el.style.display = "none";
            }
        }
    },

    /**
        위치 이동시 엘리먼트를 변경한다.
    **/
    updateListStatus : function(sDirection, nPos) {
        if(!this._aListElement) {
            return;
        }
        this._nPos = nPos;
        var nStartPos = this._getStartBoundary(),
            nEndPos = this._getEndBoundary(),
            nLength = this._aListElement.length,
            ht, i, nWelPos;

        if(sDirection == "forward") {
            for(i=this._nStartIdx+1; i<nLength;i++) {
                ht = this._aListElement[i];
                nWelPos = ht.htRange.nEndPos;
                if(nWelPos < -nStartPos) {
                    ht.el.style.display = "none";
                    this._nStartIdx = i;
                } else {
                    break;
                }
            }
            for(i=this._nEndIdx; i<nLength;i++) {
                ht = this._aListElement[i];
                nWelPos = ht.htRange.nStartPos;
                if(nWelPos < -nEndPos) {
                    ht.el.style.display = ht.sDisplay;
                    this._nEndIdx++;
                } else {
                    break;
                }
            }
        } else if(sDirection == "backward") {
            for(i=this._nEndIdx-1; i >= 0; i--) {
                ht = this._aListElement[i];
                nWelPos = ht.htRange.nStartPos;
                if(nWelPos < -nEndPos) {
                    break;
                } else {
                    ht.el.style.display = "none";
                    this._nEndIdx--;
                }
            }
            for(i=this._nStartIdx; i>=0; i--) {
                ht = this._aListElement[i];
                nWelPos = ht.htRange.nEndPos;
                if(nWelPos < -nStartPos) {
                    break;
                } else {
                    ht.el.style.display = ht.sDisplay;
                    this._nStartIdx--;
                }
            }
        }
    },

    /**
        상단 Range 위치를 반환한다.
        @return {Number} 상단 Range의 위치
    **/
    _getStartBoundary : function() {
        return this._nPos + (this._nSize * this._nRatio);
    },

    /**
        하단 Range 위치를 반환한다.
        @return {Number} 하단 Range의 위치
    **/
    _getEndBoundary : function() {
        return this._nPos - this._nSize - (this._nSize * this._nRatio);
    },

    /**
        엘리먼트의 위치를 반환한다.
        @param  {jindo.$Element} wel        대상 엘리먼트
        @return {Object}            nStartPos, nEndPos
    **/
    _getElementPos : function(wel) {
        var nStartPos,nEndPos;
        if(this._sDirection == "V") {
            nStartPos = wel.offset().top - this._wel.offset().top;
            nEndPos = nStartPos + wel.height();
        } else {
            nStartPos = wel.offset().left - this._wel.offset().left;
            nEndPos = nStartPos + wel.width();
        }
        return {
            nStartPos: nStartPos,
            nEndPos: nEndPos
        };
    }
}).extend(jindo.m.Component);