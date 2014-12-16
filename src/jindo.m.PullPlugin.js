/**
    @fileOverview Pull/Down기능을 사용하는 플러그인.
    @author sculove
    @version #__VERSION__#
    @since 2013. 1. 11.
**/
/**
    @class jindo.m.PullPlugin
    @extends jindo.m.Component
    @uses jindo.m.Scroll
    @keyword scroll, 스크롤
    @group Component
    @invisible
    
    @history 1.6.0 Release 최초 릴리즈
**/
jindo.m.PullPlugin = jindo.$Class({
    /* @lends jindo.m.PullPlugin.prototype */
    /**
        초기화 함수

        @constructor
        @param {Object} [oParent] Plugin 을 사용하기 위한 상위(Parent) object
    **/
    $init : function(oParent) {
        this.option(oParent.option());
        this._initVar(oParent);
        this._initPullDownFunc();
        this._initPullUpFunc();
    },

    /**
        jindo.m.PullPlugin 에서 사용하는 모든 인스턴스 변수를 초기화한다.
    **/
    _initVar: function(oParent) {
        this._oParent = oParent;
        this._htWElement = oParent._htWElement;
        this._isPullDown = false;
        this._isPullUp = false;
        this._isUpdating = false;
        this._nOrgMaxScrollTop = null;

        this._htWElement["pullDown"] = jindo.$Element(this._htWElement["wrapper"].query("." + this.option("sClassPrefix") + "pullDown"));
        this._htWElement["pullUp"] = jindo.$Element(this._htWElement["wrapper"].query("." + this.option("sClassPrefix") + "pullUp"));
    },
    
    /**
        pull Down/up 관련 상태을 초기화합니다.
    **/
    refresh : function() {
        this.option(this._oParent.option());
        this._isUpdating = false;
        this._nOrgMaxScrollTop = null;

        this._isPullDown = this.option("bUsePullDown") && this.option("bUseVScroll") && !this.option("bUseHScroll") && this.option("bUseBounce") && (this._htWElement["pullDown"] !== null);
        this._isPullUp = this.option("bUsePullUp") && this.option("bUseVScroll") && !this.option("bUseHScroll") && this.option("bUseBounce") && (this._htWElement["pullUp"] !== null);
        
        if (this._isPullDown && this.option("fnPullDownIdle")) {
            this._htWElement["pullDown"]._isReady_ = false;
            this._htWElement["pullDown"].show();
            this.option("fnPullDownIdle")(this._htWElement["pullDown"]);
        }
        if (this._isPullUp && this.option("fnPullUpIdle")) {
            this._htWElement["pullUp"]._isReady_ = false;
            this._htWElement["pullUp"].show();
            this.option("fnPullUpIdle")(this._htWElement["pullUp"]);
        }
        // Pulldown/up에 대한 처리
        if(!this.option("bUseVScroll")) {
            if(this._htWElement["pullDown"] !== null) {
                this._htWElement["pullDown"].hide();
            }
            if(this._htWElement["pullUp"] !== null) {
                this._htWElement["pullUp"].hide();
            }
        }

        // pulldown 상태 정리 후 스크롤 사이즈 변경
        this._oParent.nScrollW = this._htWElement["scroller"].width();
        this._oParent.nScrollH = this._htWElement["scroller"].height() - this._getBottomMargin();
        this._oParent.nMinScrollTop = -this._getTopMargin();
        this._oParent.nMaxScrollTop = this._oParent.nWrapperH - this._oParent.nScrollH;
    },

    _getTopMargin : function() {
        return (this._isPullDown ? this._htWElement["pullDown"].height() : 0) + this.option("nOffsetTop");
    },

    _getBottomMargin : function() {
        return (this._isPullUp ? this._htWElement["pullUp"].height() : 0) + this.option("nOffsetBottom");
    },
    
    /**
        pull down 관련 함수 옵션이 설정되지 않았을 경우 초기화한다.
    **/
    _initPullDownFunc : function() {
        if(this.option("bUsePullDown") === true) {
            if(!this.option("fnPullDownIdle")) {
                this.option("fnPullDownIdle", function(wel) {
                    wel.html("업데이트하시려면 아래로 내려주세요");
                });
            }
            if(!this.option("fnPullDownBeforeUpdate")) {
                this.option("fnPullDownBeforeUpdate", function(wel) {
                    wel.html("업데이트 합니다");
                });
            }
            if(!this.option("fnPullDownUpdating")) {
                this.option("fnPullDownUpdating", function(wel) {
                    wel.html("업데이트 중입니다...");
                });
            }
        }
    },

	/**
	 * Pull up 관련 함수 옵션이 설정되지 않았을 경우 초기화 한다.
	 */
    _initPullUpFunc : function() {
        if(this.option("bUsePullUp") === true) {
            if(!this.option("fnPullUpIdle")) {
                this.option("fnPullUpIdle", function(wel) {
                    wel.html("더 보시려면 위로 올려주세요");
                });
            }
            if(!this.option("fnPullUpBeforeUpdate")) {
                this.option("fnPullUpBeforeUpdate", function(wel) {
                    wel.html("로드 합니다");
                });
            }
            if(!this.option("fnPullUpUpdating")) {
                this.option("fnPullUpUpdating", function(wel) {
                    wel.html("로드 중...");
                });
            }
        }
    },
    
    /**
        Update적용시 touchMove 기능 처리
        - notice => ready => pullDown/up 상태

        @param {Jindo.$Event} we
    **/
    touchMoveForUpdate : function(we, nMaxScrollTop) {
        if (this._isUpdating) {
            return;
        }
        var nTopMargin = this._getTopMargin(),
            nBottomMargin = this._getBottomMargin();

        // nOrgMax값이 있을 경우
        nMaxScrollTop = this._nOrgMaxScrollTop || nMaxScrollTop;

        // 위에인 경우
        if (this._isPullDown) {
            if (this._htWElement["pullDown"]._isReady_) {
                if (nTopMargin > this._oParent._nTop) {
                    this._htWElement["pullDown"]._isReady_ = false;
                    if (this.option("fnPullDownIdle")) {
                        this.option("fnPullDownIdle")(this._htWElement["pullDown"]);
                        this._oParent.nMinScrollTop=-nTopMargin;
                    }
                }
            } else {
                if (this._oParent._nTop > nTopMargin) {
                    this._htWElement["pullDown"]._isReady_ = true;
                    if (this.option("fnPullDownBeforeUpdate")) {
                        this.option("fnPullDownBeforeUpdate")(this._htWElement["pullDown"]);
                        this._oParent.nMinScrollTop=0;
                    }
                }
            }
        }

        // 아래인 경우
        if (this._isPullUp) {
            if (this._htWElement["pullUp"]._isReady_) {
                if (this._oParent._nTop >= (nMaxScrollTop - nBottomMargin)) {
                    this._htWElement["pullUp"]._isReady_ = false;
                    if (this.option("fnPullUpIdle")) {
                        this.option("fnPullUpIdle")(this._htWElement["pullUp"]);
                        this._oParent.nMaxScrollTop=nMaxScrollTop;
                    }
                }
            } else {
                if (this._oParent._nTop < (this._oParent.nMaxScrollTop - nBottomMargin)) {
                    this._htWElement["pullUp"]._isReady_ = true;
                    if (this.option("fnPullUpBeforeUpdate")) {
                        this.option("fnPullUpBeforeUpdate")(this._htWElement["pullUp"]);
                        this._nOrgMaxScrollTop = nMaxScrollTop;
                        this._oParent.nMaxScrollTop= nMaxScrollTop - nBottomMargin;
                    }
                }
            }
        }
    },
    
    /**
     * 스크롤이 끝나고 Scroll 객체에서 호출되는 함수
     */
	pullUploading : function() {
        var isUp = null,
            wel = null;
        if(this._isPullDown && this._htWElement["pullDown"]._isReady_) {
            wel = this._htWElement["pullDown"];
            isUp = isUp || false;
        }
        if(this._isPullUp && this._htWElement["pullUp"]._isReady_) {
            wel = this._htWElement["pullUp"];
            isUp = isUp || true;
        }
        if(!wel){
            return false;
        }
        var fn = isUp ? this.option("fnPullUpUpdating") : this.option("fnPullDownUpdating"),
        self = this;

        this._isUpdating = true;
        wel._isReady_ = false;

        if (fn) {
            setTimeout(function(){
                fn(wel);
                if (isUp) {
                    self._fireEventPullUp();
                } else {
                    self._fireEventPullDown();
                }
            }, 0);
        }
    },
    
    
    /**
     * Scroll객체에서 사용자 정의한 함수 호출
     * pull down이 발생했을때 호출
     */
    _fireEventPullDown : function() {
        if(!this._htWElement) {
            return;
        }

        this._oParent.fireEvent("pullDown", {
            welElement : this._htWElement["pullDown"],
            oScroll : this._oParent
        });
    },
    
    /**
        pullUp 사용자 이벤트를 호출한다.
        pull up이 발생했을때 호출
    **/
    _fireEventPullUp : function() {
        if(!this._htWElement) {
            return;
        }

        this._oParent.fireEvent("pullUp", {
            welElement : this._htWElement["pullUp"],
            oScroll : this._oParent
        });
    }
}).extend(jindo.m.Component);