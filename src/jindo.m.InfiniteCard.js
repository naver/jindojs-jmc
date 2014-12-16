/**
	@fileOverview 카드를 무한개 스크롤링 할수 있는 컴포넌트
	@author "sculove"
	@version #__VERSION__#
	@since 2014. 4. 21.
**/
/**
	"반응형 무한 카드 UI"를 손쉽게 개발할 수 있는 컴포넌트

	@class jindo.m.InfiniteCard
	@extends jindo.m.UIComponent
	@keyword infinite, 무한, 카드, card
	@group Component
	@update

    @history 1.16.0 Update bUseRecycle, nCardWidth 옵션 추가
    @history 1.16.0 Update update 이벤트 추가
    @history 1.16.0 Update append 시 속도 개선
    @history 1.16.0 Update repaint 이벤트에서 stop시 update 호출되지 않도록 수정
    @history 1.16.0 Update isCached 추가
    @history 1.16.0 Update repaint 이벤트 bCached 옵션 추가
    @history 1.16.0 Bug View가 window의 width와 다를 경우 크기를 잘못 얻는 문제 수정
    @history 1.16.0 Bug 카드가 부족한 경우에 위나 아래에 카드가 빠지는 문제 수정
    @history 1.16.0 Bug 초기 repaint시 dom이 없을 경우, 화면에 보이는 문제 수정
    @history 1.16.0 Bug 초기화 되기 전에 회전시 오류 수정
    @history 1.15.0 Bug 안드로이드 2.x에서 클릭시 하이라이트가 잘못 생기는 문제 수정
    @history 1.15.0 Update repaint 메소드 htOption 인터페이스 변경
    @history 1.15.0 Update beforeDraw, draw 사용자 이벤트 추가
    @history 1.15.0 Update sExcludeClass 옵션 추가
    @history 1.15.0 Update bUseDebug 옵션 추가
    @history 1.15.0 Update sSizePrefix 옵션 추가
    @history 1.15.0 Update prepend, setContent, resizeView, getSizeInfo 추가, 초기로딩 속도 개선, repaint 속도 개선
    @history 1.14.0 Release 최초 릴리즈
**/
jindo.m.InfiniteCard = jindo.$Class({
	/* @lends jindo.m.InfiniteCard.prototype */
	/**
		초기화 함수

		@constructor
		@param {String|HTMLElement|jindo.$Elemenet} el 무한카드를 사용할 부모 엘리먼트 (필수)
		@param {Object} [htOption] 초기화 옵션 객체
			@param {Number} [htOption.nCardCount=10] Recycle(교체)할 DOM의 개수. 단, bUseRecycle가 false인 경우 이 옵션은 무시된다.
			@param {Number} [htOption.sClassName=wrp_cds] 카드 엘리먼트가 가진 클래스명
			@param {Number} [htOption.nExpandSize=0] 지정한 만큼 좀 더 넓은 범위의 영역을 기준으로 DOM이 Recycle(교체)이 됨 (단위 : px)
			@param {Number} [htOption.bUseCss3d=jindo.m.useCss3d()] 하드웨어 3d 가속 여부
			@param {String} [htOption.sSizePrefix=""] 카드 내의 사이즈 사이즈 정보를 추출하기 위한 속성의 prefix.
			가로는 sSizePrefix + "width", 세로는 sSizePrefix + "height"<br><br>sSizePrefix가 ""일 경우, 비동기식으로 사이즈를 구한다.
			@param {Boolean} [htOption.bUseDebug=false] 디버그 로그를 출력한다
			@param {Boolean} [htOption.bUseRecycle=true] DOM을 순환형태하여 구성할지를 결정한다. bUseRecycle가 false인 경우, nCardCount, sExcludeClass 옵션은 사용되지 않는다.
			@param {Boolean} [htOption.nCardWidth=0] 카드의 크기를 지정한다. 0일 경우, 마크업의 크기를 기준으로 결정. 반면, 사이즈가 주어질 경우, 회전시 카드의 폭은 변하지 않고, 배치시 갯수만 변경된다.
			@param {Boolean} [htOption.sExcludeClass=""] 순환하지 않을 카드를 구분하는 class명 (sExcludeClass 명의 클래스가 있을 경우, 순환하지 않는다.) 단, bUseRecycle가 false인 경우 이 옵션은 무시된다.
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
	**/
	$init: function(el, htOption) {
		this.option({
			nCardCount: 10,
			sClassName: "wrp_cds",
			sExcludeClass: "",
			nExpandSize: 0,
			bUseCss3d: jindo.m.useCss3d(),
			sSizePrefix: "",
			bUseDebug: false,
			bUseRecycle: true,
			nCardWidth : 0,
			bActivateOnload: true
		});
		this.option(htOption || {});

		this._initVar();
		this._setWrapperElement(el);
		this._bInfinite ? this._setInfiniteDom() : this._setDom();
		this.resizeView();
		if (this.option("bActivateOnload")) {
			this.activate();
		}
	},

	$static: {
		FOR_SIZE_CLASS: "__infinite_for_size__"
	},

	_initVar: function(wel) {
		this._aData = []; // data cache
		this._aCards = []; // 카드 캐쉬
		this._htSelected = {}; // 화면에 선택된 엘리먼트 배열

		// this._welDf = jindo.$Element(document.createDocumentFragment());
		this._welTmpDf = jindo.$Element(document.createDocumentFragment());

		// 카드의 최소, 최대 위치 저장
		this._htCursor = {
			min: -1,
			visibleMin: -1,
			max: -1,
			visibleMax: -1
		};
		this._htBeforeCursor = {
			min: -2,
			max: -2,
		};

		// 사이즈 정보
		this._htSizeInfo = {
			height: -1,
			width: -1,
			cardWidth: 0,
			viewTop: 0,
			curPos: 0
		};

		this._sKey = jindo.m.isVertical() ? "v" : "h";
		this._isPrepareMode = this.option("sSizePrefix") != "";
		this._sExcludeClass = this.option("sExcludeClass");
		this._hasExcludeClass = this._sExcludeClass != "";
		this._bInfinite = this.option("bUseRecycle");
		this._bFixedWidth = this.option("nCardWidth") != 0;

		// 안드로이드 2.x 하이라이트 버그
		this._hasOffsetBug = jindo.m.hasOffsetBug();

		// 가로, 세로일때의 높이값을 캐싱
		this._htHeight = {
			v: 0,
			h: 0
		};

		// 사이즈, 위치 값을 캐싱
		this._htCache = {
			v: -1,
			h: -1,
			vPos: -1,
			hPos: -1
		};

		this._nRepaintTimer = -1;
		this._nSizeTimer = -1;
		this._isRepainting = false;
		this._nUnpreparedCount = 0;
		this._fnUnPreparedHandler = jindo.$Fn(this._onCheckPrepared, this).bind();
	},

	_setWrapperElement: function(el) {
		this._htWElement = {};
		this._htWElement["view"] = jindo.$Element(el).css("position", "relative");
		this._htWElement["size"] = null;
		this._htWElement["window"] = window;
	},

	_attachEvent: function() {
		this._htEvent = {};
		this._htEvent["updater"] = jindo.$Fn(this._onUpdate, this);
		this._htEvent["updater"].attach(this._htWElement["window"], "scroll");
	},

	_detachEvent: function() {
		this._htEvent["updater"].detach(this._htWElement["window"], "scroll");
	},

	/**
		카드 데이터의 높이를 변경한다
		@method setHeight
		@param {Number} nIndex 카드데이터의 인덱스 번호 (0부터 시작)
		@param {Number} vHeight 변경될 카드의 높이값
		@return {HashTable} 이전 카드의 높이 정보 반환
			@return {Boolean} .bVertical 현재 단말기의 수직 여부
			@return {Number} .nVHeight 단말기가 수직일때의 이전 카드의 높이값
			@return {Number} .nHHeight 단말기가 수평일때의 이전 카드의 높이값
	**/
	/**
		카드 데이터의 높이를 변경한다
		@method setHeight
		@param {Number} nIndex 카드데이터의 인덱스 번호 (0부터 시작)
		@param {HashTable} htHeight
			@param {Number} htHeight.nVHeight 단말기가 수직일때의 변경될 카드의 높이값
			@param {Number} htHeight.nHHeight 단말기가 수평일때의 변경될 카드의 높이값
		@return {HashTable} 이전 카드의 높이 정보 반환
			@return {Boolean} .bVertical 현재 단말기의 수직 여부
			@return {Number} .nVHeight 단말기가 수직일때의 이전 카드의 높이값
			@return {Number} .nHHeight 단말기가 수평일때의 이전 카드의 높이값
	**/
	setHeight: function(nIndex, vHeight) {
		//console.info("setHeight",nIndex, vHeight);
		var data = this._aData[nIndex],
			htBefore = {
				nVHeight: data.vHeight,
				nHHeight: data.hHeight,
				bVertical: this._sKey == "v"
			},
			htHeight = {
				v: -1,
				h: -1
			};

		if (typeof vHeight == "number") {
			htHeight[this._sKey] = vHeight;
		} else if (typeof vHeight == "object" && vHeight.length == undefined) {
			(typeof vHeight.nVHeight == "number") && (htHeight.v = vHeight.nVHeight);
			(typeof vHeight.nHHeight == "number") && (htHeight.h = vHeight.nHHeight);
		}

		if (data.vHeight != htHeight.v) {
			if (htHeight.v != -1) {
				data.vHeight = htHeight.v;
				this._htCache.vPos = Math.min.call(null, this._htCache.vPos, nIndex);
			}
		}
		if (data.hHeight != htHeight.h) {
			if (htHeight.h != -1) {
				data.hHeight = htHeight.h;
				this._htCache.hPos = Math.min.call(null, this._htCache.hPos, nIndex);
			}
		}
		return htBefore;
	},

	/**
		카드 데이터의 내용을 변경한다
		@method setContent
		@param {Number} nIndex 카드데이터의 인덱스 번호 (0부터 시작)
		@param {String|$Element} vData 카드 데이터의 내용
		@param {Object} htOption setContent에 필요한 옵션을 받는다.
			@param {boolean} htOption.bRedraw true일 경우, 화면에 컨텐츠가 존재하는 경우 컨텐츠의 내용을 update한다. (기본값은 false이다)
			@param {boolean} htOption.bModifiedSize 카드의 사이즈가 변경된 경우, 캐싱된 데이터를 제거한다. (기본값은 false이다)
		@return {String|$Element} 이전 카드 데이터의 내용 반환
	**/
	setContent: function(nIndex, vContent, vParam) {
		// console.warn("setContent", arguments,this._htCache);
		var htOption = typeof vParam == "object" ? jindo.$Jindo.mixin({}, vParam) : {},
			ht = this._aData[nIndex],
			vBeforeData = ht.data,
			wel = this.getElement(nIndex);

		//console.warn("setContent-ing..", ht.data);
		ht.data = (vContent instanceof jindo.$Element) ? vContent.html() : vContent;

		// 화면에 엘리먼트가 있을 경우, 다시 그린다.
		htOption.bRedraw && wel && wel.html(ht.data);
		// 컨텐츠가 변경되었기 때문에 사이즈, 위치 캐싱 모두 삭제
		if (htOption.bModifiedSize) {
			//if (this._sKey == "h") {
			ht.vHeight = -1;
			this._htCache.vPos = Math.min.call(null, this._htCache.vPos, nIndex - 1);
			this._htCache.v = Math.min.call(null, this._htCache.v, nIndex - 1);
			//} else {
			ht.hHeight = -1;
			this._htCache.hPos = Math.min.call(null, this._htCache.hPos, nIndex - 1);
			this._htCache.h = Math.min.call(null, this._htCache.h, nIndex - 1);
			//}
		}
		return vBeforeData;
	},

	/**
		카드 데이터를 반환한다.
		@method get
		@param {Number} nIndex 카드데이터의 인덱스 번호 (0부터 시작)
		@param {Boolean} isFull false일 경우, offsetX,offsetY, height,width값을 정리하여 반환한다.
		@return {Object} 카드 데이터를 반환한다.
	 		@return {Number} .index 카드의 index를 반환한다.
			@return {String} .data 윈도우의 width를 반환한다.
			@return {Number} .height 카드의 width를 반환한다.
			@return {Number} .x 카드의 x를 반환한다.
			@return {Number} .y 카드의 y를 반환한다.
			@return {Number} .offsetX 카드의 offsetX를 반환한다.
			@return {Number} .offsetY 카드의 offsetX를 반환한다.
	**/
	get: function(nIndex, isFull) {
		if (nIndex >= 0 && nIndex < this._aData.length) {
			var ht = this._aData[nIndex];
			return isFull ? ht : {
				index: nIndex,
				data: ht.data,
				// width : ht[this._sKey + "Width"],
				height: ht[this._sKey + "Height"],
				x: ht[this._sKey + "X"],
				y: ht[this._sKey + "Y"],
				offsetX: ht[this._sKey + "X"],
				offsetY: ht[this._sKey + "Y"] + this._htSizeInfo.viewTop
			};
		} else {
			return null;
		}
	},

	/**
		화면에 배치되는 컬럼의 개수를 반환한다.

		@method getColumnCount
		@return {Number} 현재화면에 표시되는 카드의 컬럼수 반환
	**/
	getColumnCount: function() {
		// 카드 크기를 구하지 못하였을 경우(0), 다시 구함
		this._htSizeInfo.cardWidth = this._getCardWidth();
		if (this._htSizeInfo.cardWidth == 0) {
			console.warn("카드의 사이즈를 정상적으로 구할수 없습니다. sClassName 옵션을 잘못 지정하였거나, Element의 visible이 false인 경우 카드의 크기를 정상적으로 구할수 없습니다.");
			return 1;
		} else {
			// console.log((this._htSizeInfo.width / this._htSizeInfo.cardWidth), this._htSizeInfo.width, this._htSizeInfo.cardWidth);
			// return Math.round(this._htSizeInfo.width / this._htSizeInfo.cardWidth);
			var v = this._htSizeInfo.width / this._htSizeInfo.cardWidth;
			return this._bFixedWidth ? parseInt(v) : Math.round(v);
		}
	},

	/**
		카드 데이터의 총 개수를 반환
		@method length
		@return {Number} 카드 데이터의 총 개수
	**/
	length: function() {
		return this._aData.length;
	},

	/**
		엘리먼트에 해당하는 카드의 index를 반환한다.
		@method getIndex
		@param {String|HTMLElement|$Element} wel 엘리먼트
		@return {Number} 카드 인덱스
	**/
	getIndex: function(wel) {
		wel = jindo.$Element(wel);
		var sClassName = this.option("sClassName"),
			welResult;
		if (wel.hasClass(sClassName)) {
			welResult = wel;
		} else {
			var vParent = wel.parent(function(v) {
				return v.hasClass(sClassName);
			});
			vParent = vParent.length > 0 ? vParent[0] : null;
			vParent && (welResult = vParent);
		}
		return (welResult ? parseInt(welResult.attr("index"), 10) : -1);
	},

	/**
		index에 해당하는 카드의 엘리먼트를 반환한다.
		@method getElement
		@param {Number} nIndex 카드 인덱스
		@return {$Element|Array} 카드 엘리먼트, nIndex 생략시, { wel : $Element, nIndex : 해당엘리먼트의 index, bVisible : Window에 보이는 여부} 의 배열을 반환한다.
	**/
	getElement: function(nIndex) {
		var i, v,
			nLen = this._aCards.length;
		if (typeof nIndex == "undefined") {
			var aResult = [],
				k;
			for (i = 0; i < nLen; i++) {
				v = this._aCards[i];
				k = v.attr("index");
				if (k != -1) {
					aResult.push({
						wel: v,
						nIndex: k,
						bVisible: this._isVisible(k)
					});
				}
			}
			return aResult;
		} else {
			for (i = 0; i < nLen; i++) {
				v = this._aCards[i];
				if (nIndex == v.attr("index")) return v;
			}
			return null;
		}
	},

	/**
		카드의 데이터를 append한다.
		@method append
		@param {String|$Element} vData 카드 데이터
		@param {Number} nHeight 카드의 높이값
	**/
	/**
		카드의 데이터를 append한다.
		@method append
		@param {String|$Element} vData 카드 데이터
		@param {Object} vParam
			@param {Number} vParam.nHeight 카드의 높이값
			@param {Number} vParam.isExclude exclude 대상 여부
	**/
	append: function(vData, vParam) {
		if (this._isRepainting) {
			// console.warn("현재 repaint 중에는 데이터를 넣을 수 없습니다.");
			return;
		}
		var htOption = {};
		if (typeof vParam == "number" || typeof vParam == "string") {
			htOption.nHeight = vParam;
		} else if (typeof vParam == "object") {
			htOption = jindo.$Jindo.mixin(htOption, vParam);
		}
		var ht = {
			data: (vData instanceof jindo.$Element) ? vData.html() : vData,
			vHeight: -1,
			hHeight: -1,
			vX: -1,
			vY: -1,
			hX: -1,
			hY: -1,
			isExclude: typeof htOption.isExclude == "undefined" ? false : htOption.isExclude
		};
		if(typeof htOption.nHeight != "undefined") {
			var nHeight = parseInt(htOption.nHeight, 10);
			if(this._bFixedWidth) {
				ht["vHeight"] = ht["hHeight"] = nHeight;
			} else {
				ht[this._sKey + "Height"] = nHeight;
			}
		}
		this._aData.push(ht);
	},

	/**
		카드의 데이터를 prepend한다.
		@method prepend
		@param {String|$Element} vData 카드 데이터
		@param {Number} nHeight 카드의 높이값
	**/
	/**
		카드의 데이터를 prepend한다.
		@method prepend
		@param {String|$Element} vData 카드 데이터
		@param {Object} vParam
			@param {Number} vParam.nHeight 카드의 높이값
			@param {Number} vParam.isExclude exclude 대상 여부
	**/
	prepend: function(vData, vParam) {
		if (this._isRepainting) {
			// console.warn("현재 repaint 중에는 데이터를 넣을 수 없습니다.");
			return;
		}
		var htOption = {};
		if (typeof vParam == "number" || typeof vParam == "string") {
			htOption.nHeight = vParam;
		} else if (typeof vParam == "object") {
			htOption = jindo.$Jindo.mixin(htOption, vParam);
		}
		var ht = {
			data: (vData instanceof jindo.$Element) ? vData.html() : vData,
			vHeight: -1,
			hHeight: -1,
			vX: -1,
			vY: -1,
			hX: -1,
			hY: -1,
			isExclude: typeof htOption.isExclude == "undefined" ? false : htOption.isExclude
		};
		if (htOption.nHeight != "undefined") {
			var nHeight = parseInt(htOption.nHeight, 10);
			if(this._bFixedWidth) {
				ht["vHeight"] = ht["hHeight"] = nHeight;
			} else {
				ht[this._sKey + "Height"] = nHeight;
			}
		} else {
			this._htCache[this._sKey] = -1;
		}
		this._aData.unshift(ht);

		// var waChild = jindo.$A(this._htWElement["view"].queryAll("[index]"));

		// 기존 데이터가 있는 경우
		// waChild.forEach(function(v, i, a) {
		this._aCards.forEach(function(v, i, a) {
			v.attr("index", parseInt(v.attr("index"), 10) + 1);
		}, this);
		this._htCache[this._sKey + "Pos"] = -1;
		this._htSelected = {};
	},

	_getUnprepared: function(wel, sSelector) {
		var sWidthAttr = this.option("sSizePrefix") + "width",
			sHeightAttr = this.option("sSizePrefix") + "height",
			aEle = wel.queryAll(this._isPrepareMode ? "[" + sWidthAttr + "]" : "img"),
			aRemained = [],
			nDataWidth, nDataHeight, nFixedHeight, nFixedWidth;

		// 카드 내의 이미지의 크기가 결정 되어 있는지 확인.
		// 이미지 크기가 결정되어 있지 않는 경우는 img 태그의 data를 기준으로 크기를 할당
		for (var i = 0, nLen = aEle.length, v; i < nLen; i++) {
			v = jindo.$Element(aEle[i]);
			if (this._isPrepareMode) {
				nDataWidth = v.attr(sWidthAttr);
				nDataHeight = v.attr(sHeightAttr);

				if (nDataWidth != null && nDataHeight != null) {
					if (nDataWidth == "" || nDataHeight == "") {
						this.option("bUseDebug") && console.error(v.attr("id"), "의 사이즈 정보가 존재하지 않습니다");
						aRemained.push(v);
					} else {
						// 예전 width, height 고정값 제거
						// this._releaseFixedSize(v._element);
						nFixedWidth = nFixedWidth || v._element.clientWidth;
						nFixedHeight = Math.ceil(nFixedWidth * nDataHeight / nDataWidth);
						v._element.style.height = nFixedHeight + "px";
						v._element.style.width = nFixedWidth + "px";
						// console.warn("style [End] : " , v._element.style && v._element.style.cssText);
					}
				} else {
					aRemained.push(v);
				}
			} else {
				!v._element.complete && aRemained.push(v);
			}
		}
		return aRemained.length > 0 ? aRemained : null;
	},

	// 예전 width, height 고정값 제거
	_releaseFixedSize: function(v) {
		// // 예전 width, height 고정값 제거
		// if( (v.width && String(v.width).indexOf("%") == -1) ||
		//      (v.height && String(v.height).indexOf("%") == -1) ) {
		//      //console.log("before",v._element.width,v._element.height);
		//      delete v.width;
		//      delete v.height;
		//      this.option("bUseDebug") && console.warn(v.attr("id"), "의 width 또는 height의 값이 고정값으로 설정되어 있습니다." ,v.innerHTML);
		// }
		if (v.style.cssText) {
			if (v.style.width && v.style.width.indexOf("%") == -1) {
				v.style.width = null;
			}
			if (v.style.height && v.style.height.indexOf("%") == -1) {
				v.style.height = null;
			}
		}
	},

	// 예전 width, height 고정값 제거 (하위 preparedMode 항목에서)
	_releaseChildFixedSize: function(wel) {
		jindo.$A(wel.queryAll("[" + this.option("sSizePrefix") + "width]")).forEach(function(v, i, a) {
			this._releaseFixedSize(jindo.$Element(v)._element);
		}, this);
	},

	_getCardSize: function(nIndex, sHtml, fn) {
		var isReuse = false,
			wel = this.getElement(nIndex);
		if (!wel) {
			wel = this._htWElement["size"];
			wel.html(sHtml);
		} else {
			isReuse = true;
		}
		var aRemained = this._getUnprepared(wel);
		if (!aRemained) {
			// console.debug("load prepared");
			fn(wel.height());
			if (isReuse && this._isPrepareMode) {
				this._releaseChildFixedSize(wel);
			}
			wel = null;
		} else {
			cancelAnimationFrame(this._nSizeTimer);
			var self = this,
				bComplete = false,
				wa = jindo.$A(aRemained);
			// console.debug("looking for size", wa.length());
			// 브라우저 랜더링을 이용하여 사이즈를 찾아라.
			(function check() {
				wa = wa.filter(function(v, i, a) {
					v = jindo.$Element(v);
					if (!v._element.complete) {
						// console.log(v.attr("src"));
						return true;
					} else {
						return false;
					}
				});
				if (wa.length() == 0) {
					// console.debug("looking for complete size");
					fn(wel.height());
					wel = null;
					// fn(self._htWElement["size"]._element.style.height);
				} else {
					self._nSizeTimer = requestAnimationFrame(check);
				}
			})();
		}
	},

	_createDomForSize: function() {
		// 사이즈 측정용
		var sStyle = "position:absolute;opacity:0;left:-200%;top:0;",
			sPrefix = jindo.m.getCssPrefix();
		// 고정 영역일 경우 사이즈 고정
		this._bFixedWidth && (sStyle += "width:" + this._getCardWidth() + "px;");
		if (!this._hasOffsetBug) {
			sStyle += "-" + sPrefix + "-transition-property:-webkit-transform;";
			sStyle += "-" + sPrefix + "-transform:" + jindo.m._getTranslate(0, 0, this.option("bUseCss3d"));
		}
		this._htWElement["size"] = jindo.$Element(this._htWElement["view"].query("." + jindo.m.InfiniteCard.FOR_SIZE_CLASS) || jindo.$Element("<div class='" + this.option("sClassName") + " " + jindo.m.InfiniteCard.FOR_SIZE_CLASS + "'style='" + sStyle + "'></div>"));

		this._htWElement["view"].append(this._htWElement["size"]);
	},

	_createDom : function(nStartIndex, nEndIndex) {
		if(nStartIndex >= nEndIndex) {
			return null;
		}
		var sClassName = this.option("sClassName"),
			sHtml = "<div class='" + sClassName + "' style='position:absolute;top:0px;",
			sPrefix = jindo.m.getCssPrefix();

		// 고정 영역일 경우 사이즈 고정
		this._bFixedWidth && (sHtml += "width:" + this._getCardWidth() + "px;");
		if (this._hasOffsetBug) {
			sHtml += "left:-200%;";
		} else {
			sHtml += "left:0px;";
			sHtml += "-" + sPrefix + "-transition-property:-webkit-transform;";
			sHtml += "-" + sPrefix + "-transform:" + jindo.m._getTranslate("-200%", 0, this.option("bUseCss3d"));
		}
		sHtml += "' index='-1'></div>";

		for (var i = nStartIndex, wel, nDataLen = this._aData.length; i < nEndIndex; i++) {
			wel = jindo.$Element(sHtml);
			this._welTmpDf.append(wel);
			// 데이터가 있는 경우, 엘리먼트를 바로 반영
			if( i < nDataLen) {
				wel.attr("index", i).html(this._aData[i].data);
			}
			this._aCards.push(wel);
		}
		this._htWElement["view"].append(this._welTmpDf);
		// df = null;
		// console.debug(nStartIndex, i-1);
		return {
			start : nStartIndex,
			end : i-1
		};
	},

	// 현재 있는 DOM을 기준으로 구성한다 (bUseRecycle : false일 경우)
	_setDom: function() {
		var waChild = jindo.$A(this._htWElement["view"].child());
		// 기존 데이터가 있는 경우
		waChild.forEach(function(v, i, a) {
			this._aCards.push(v.attr("index", i));
			this._bFixedWidth && v.width(this._getCardWidth());
			this.append(v);
		}, this);
	},

	// 무한일 경우, 사용할 DOM을 구성 및 생성한다.  (bUseRecycle : true일 경우)
	_setInfiniteDom : function() {
		var aRemoveWel = [],
			nCardCount = parseInt(this.option("nCardCount"), 10),
			waChild = jindo.$A(this._htWElement["view"].child()),
			isExclude;
		// 기존 데이터가 있는 경우
		waChild.forEach(function(v, i, a) {
			// exclude가 있는 경우의 데이터를 저장한다.
			isExclude = this._hasExcludeClass && v.hasClass(this._sExcludeClass);

			// 최초 로컬 데이터의 개수를 기준으로 DOM을 순환한다.
			// 단, MaxCount는 초과하지 않는다
			if (nCardCount > i) {
				this._aCards.push(v.attr("index", i));
			} else {
				aRemoveWel.push(v);
			}
			this.append(v, {
				isExclude: isExclude
			});
			this._bFixedWidth && v.width(this._getCardWidth());
		}, this);

		// 부족한 DOM 은 만들어 놓는다.
		this._createDom(this._aData.length, nCardCount);
		// console.log("제거할 Node:" + aRemoveWel.length);
		(aRemoveWel.length >0) && jindo.$A(aRemoveWel).forEach(function(v, i, a) {
			v.leave();
		});
		// 사이즈 확인용 데이터 추가
		this._createDomForSize();
		// console.log(this._htWElement["view"].attr("data-section"), "data size : " , this._aData.length);
	},

	// 그리드만 구성하는 경우
	_drawGrid: function(p) {
		p = p || this._p(false);
		// console.error(this._htCache[p.sKey] + 1,p);
		this._calculate(this._htCache[p.sKey] + 1,  this._getXPos(), Math.min(this._aCards.length, this._aData.length), p, true);
		this._draw(p);
		this._isPrepareMode && this._releaseChildFixedSize(this._htWElement["view"]);
		this._fireRepaintEvent({
			bUpdate : false,
			bRotate : p.bRotate
		}); // 생성자에서는 이벤트를 호출할수 없음
	},

	// onload, onerror 핸들러
	_onCheckPrepared: function(we) {
		this._nUnpreparedCount--;
		// jindo.$Element(we.element).detach("load", this._fnUnPreparedHandler).detach("error", this._fnUnPreparedHandler);
		if (!this._isWaiting && this._nUnpreparedCount <= 0) {
			this._detachPreparedEvent();
			this._drawGrid();
		}
	},

	// 이미지 로딩/에러 이벤트 할당 (capturing)
	_attachPreparedEvent : function(nCount) {
		// @todo IE 대응 필요
		this._nUnpreparedCount= nCount;
		this._htWElement["view"]._element.addEventListener("load", this._fnUnPreparedHandler, true);
		this._htWElement["view"]._element.addEventListener("error", this._fnUnPreparedHandler, true);
		// 비동기식으로 계산
		// 이미지의 onload, onerror을 이용
		// this._isWaiting = true;
		// for (var i = 0, nLen = aRemained.length; i < nLen; i++) {
		// 	aRemained[i].attach("load", this._fnUnPreparedHandler).attach("error", this._fnUnPreparedHandler);
		// 	this._nUnpreparedCount++;
		// }
		// this._isWaiting = false;
	},

	// 이미지 로딩/에러 이벤트 제거
	_detachPreparedEvent : function() {
		// @todo IE 대응 필요
		this._htWElement["view"]._element.removeEventListener("load", this._fnUnPreparedHandler,true);
		this._htWElement["view"]._element.removeEventListener("error", this._fnUnPreparedHandler,true);
		this._nUnpreparedCount = 0;
	},

	// 초기 그리기.
	_initRepaint: function() {
		this._htWElement["view"].css("visibility", "hidden");
		var p = this._repaintForRotate();
		var aRemained = this._getUnprepared(this._htWElement["view"]);
		this._htWElement["view"].css("visibility", "");
		if (aRemained) {
			// 비동기식으로 계산
			// 이미지의 onload, onerror을 이용
			this._attachPreparedEvent(aRemained.length);
		} else {
			this._drawGrid();
		}
	},

	// 위치를 계산한다.
	_calculate: function(nStartIndex, aX, nLen, p,  bUpdateSize) {
		var  aY = this._getYPos(aX, nStartIndex);
		for (var i = nStartIndex, nPosIndex, v; i < nLen; i++) {
			v = this._aData[i];
			nPosIndex = aY.indexOf(Math.min.apply(null, aY));
			v[p.sX] = aX[nPosIndex];
			v[p.sY] = aY[nPosIndex];
			if(bUpdateSize) {
				(this._bInfinite || (!this._bInfinite && v[p.sHeight] == -1)) && (v[p.sHeight] = this._aCards[i].height());
				if(this._bFixedWidth) {
					v["vHeight"] = v["hHeight"] = v[p.sHeight];
				}
			}
			aY[nPosIndex] += v[p.sHeight];
		}
		// 위치 캐싱 완료~!
		this._setCachePos(p.sPos, aY, nLen);
		// 사이즈 캐싱 완료~!
		bUpdateSize && this._setCacheSize(nLen);
	},

	_draw: function(p) {
		// console.trace("draw");
		for (var i = 0, nLen = Math.min(this._aCards.length, this._aData.length), data; i < nLen; i++) {
			data = this._aData[i];
			this._drawCard(this._aCards[i], data[p.sX], data[p.sY]);
			this._htSelected[i] = true;
		}
		this._htCursor.min = this._htBeforeCursor.min = this._htCursor.visibleMin = 0;
		this._htCursor.max = this._htBeforeCursor.max = this._htCursor.visibleMax = nLen - 1;
	},

	// 카드의 위치를 다시 그린.
	_drawCard: function(wel, nX, nY) {
		var htCss = {
			"position": "absolute",
			"left": "0px",
			"top": "0px"
		};
		if (this._hasOffsetBug) {
			htCss["left"] = nX + "px";
			htCss["top"] = nY + "px";
		} else {
			htCss[jindo.m._toPrefixStr("transitionProperty")] = "-webkit-transform";
			htCss[jindo.m._toPrefixStr("transform")] = jindo.m._getTranslate(nX + "px", nY + "px", this.option("bUseCss3d"));
		}
		wel.css(htCss);
	},

	_getRangeData: function(nStartPos, nEndPos) {
		// console.warn("getRangeData", nStartPos, "->", nEndPos);
		var y = this._sKey + "Y",
			height = this._sKey + "Height",
			nLen = this._aData.length,
			htResult = {
				min: 0,
				max: nLen - 1
			};

		// 범위에 해당하는 min index 구하기
		for (var i = 0, v; i < nLen; i++) {
			v = this._aData[i];
			if ((v[y] + v[height]) >= nStartPos) {
				htResult.min = i;
				break;
			}
		}
		// 범위에 해당하는 max index 구하기
		if (typeof nEndPos != "undefined") {
			for (i = htResult.min; i < nLen; i++) {
				v = this._aData[i];
				if (v[y] <= nEndPos) {
					htResult.max = i;
				} else {
					break;
				}
			}
		}
		return htResult;
	},

	_updateRange: function(nPos) {
		if(typeof nPos == "undefined") {
			this._htSizeInfo.curTop = nPos = document.body.scrollTop;
		}
		var nCurrentPos = nPos - this._htSizeInfo.viewTop;
		if (this._htSizeInfo.curPos == nCurrentPos && jindo.$H(this._htSelected).keys().length != 0) {
			// console.warn("기존 스크롤의 위치가 동일하여 return");
			return false;
		}
		// console.debug(this._htSizeInfo.curPos < nCurrentPos, this._htSizeInfo.curPos, nCurrentPos);
		// this._htSizeInfo.curPos 이 정의되지 않은경우(최초인경우)에는 isDown : true
		var isDown = this._htSizeInfo.curPos == undefined ? true : this._htSizeInfo.curPos <= nCurrentPos;
		this._htSizeInfo.curPos = nCurrentPos;

		var nExpandSize = this.option("nExpandSize"),
			nStartPos = nCurrentPos - nExpandSize,
			nEndPos = (nStartPos > 0 ? nStartPos : 0) + this._htSizeInfo.height + (2 * nExpandSize),
			htData = this._getRangeData(nStartPos, nEndPos),
			htVisibleData = this._getRangeData(nCurrentPos, nCurrentPos + this._htSizeInfo.height),
			nMin = htData.min,
			nMax = htData.max,
			bReturn = false;

		// Visible 정보 갱신
		this._htCursor.visibleMin = htVisibleData.min;
		this._htCursor.visibleMax = htVisibleData.max;

		// min/max 보정
		var hResult = this._correctRange(nMin, nMax, this._htCursor.visibleMin, this._htCursor.visibleMax, isDown);
		if (this._htCursor.min != hResult.nMin || this._htCursor.max != hResult.nMax) {
			this._htBeforeCursor.min = this._htCursor.min;
			this._htBeforeCursor.max = this._htCursor.max;
			this._htCursor.min = hResult.nMin;
			this._htCursor.max = hResult.nMax;
			bReturn = true;
		}
		// console.info(this._htWElement["view"].attr("id"),this._htCursor.min, "->" , this._htCursor.max, "(", this._htCursor.max-this._htCursor.min+1,") visible: " , this._htCursor.visibleMin, "->" , this._htCursor.visibleMax, "(", this._htCursor.visibleMax-this._htCursor.visibleMin+1,")");
		return (bReturn || jindo.$H(this._htSelected).keys().length == 0);
	},

	// min/max 값을 보정한다.
	_correctRange: function(nMin, nMax, nVisibleMin, nVisibleMax, isDown) {
		// console.warn("보정 전 :" , nMin, "~", nMax, (nMax - nMin+1), ", visible : ", nVisibleMin, "~", nVisibleMax, (nVisibleMax-nVisibleMin+1));
		var nCardCount = this.option("nCardCount"),
			nDiff = nCardCount - (nMax - nMin + 1),
			aExclude = [];

		if (this._hasExcludeClass) {
			this._aCards.forEach(function(v, i, a) {
				v.hasClass(this._sExcludeClass) && aExclude.push(v);
			}, this);
		}
		var nExcludeCount = aExclude.length,
			nLastDataIndex = this._aData.length - 1,
			i, no;

		// console.warn(" ** ", nMin, "-", nMax , "(" , (nMax - nMin + 1), ") - remained : ", nDiff, ", nLastIndex : ", nLastDataIndex, nExcludeCount);
		if (nDiff < 0) {
			nMax += nDiff;
			this.option("bUseDebug") && (nDiff < 0) && console.warn("지정한 범위(nExpandSize)에 맞게 카드를 배치하기 위해서는 ", -nDiff, "개의 카드가 더 필요합니다.\nnCardCount값을 늘려주시기거나 nExpandSize를 줄여주시기 바랍니다.");
		} else {
			// 범위가 최대 카드 개수를 다 활용하지 못하는 경우
			// 아래로 갈경우에는 아래를 우선으로,
			// 위로 갈경우에는 위를 우선으로 남은 카드개수를 더한다.
			for (i = 0; i < nDiff; i++) {
				if (isDown) {
					nLastDataIndex > nMax ? nMax++ : nMin--;
				} else {
					0 < nMin ? nMin-- : nMax++;
				}
			}
			nMin = nMin < 0 ? 0 : nMin;
			nMax = nMax > nLastDataIndex ? nLastDataIndex : nMax;
		}
		// console.info("1차 보정 (방향에 따른 보정) :" , nMin, "~", nMax, "(" , (nMax - nMin + 1), ") , isDown:", isDown);

		// sExclude인 경우, 카드의 숫자를 보정한다.
		for (i = 0; i < nExcludeCount; i++) {
			no = jindo.$Element(aExclude[i]).attr("index");
			if (nMin > no || nMax < no) {
				// case 1
				if (isDown) {
					nMin++;
				} else {
					nMax--;
				}
			}
		}
		// console.debug("2차 보정 (exclude) :" , nMin, "~", nMax, "(" , (nMax - nMin + 1), ") , isDown:", isDown);

		// visible에 따른 보정, visible영역을 벗어난경우에는 보정
		if (nVisibleMin < nMin || nVisibleMax > nMax) {
			var nUsableCount = nMax - nMin;
			nMin = nVisibleMin;
			nMax = nMin + nUsableCount;
			nMin = nMin < 0 ? 0 : nMin;
			nMax = nMax > nLastDataIndex ? nLastDataIndex : nMax;
		}
		// console.info("3차 보정 :" , nMin, "~", nMax, "(" , (nMax - nMin + 1), ") , isDown:", isDown, " visible : " , nVisibleMin, "~", nVisibleMax);
		return {
			nMin: nMin,
			nMax: nMax
		};
	},

	_removeWel: function(nIndex) {
		// console.warn("삭제할 인덱스", nIndex);
		delete this._htSelected[nIndex];
		var wel = this.getElement(nIndex);
		if (!this._isExcludeWel(wel)) {
			// this._welDf.append(wel);
			wel.attr("index", -1); //.hide();
			return wel;
		} else {
			return null;
		}
	},

	_isExcludeWel : function(wel) {
		if(this._hasExcludeClass) {
			return wel.hasClass(this._sExcludeClass);
		} else {
			return false;
		}
	},

	/**
		화면에 배치되어야할 카드의 Index를 반환.
		@method getVisibleIndex
		@param {Object} 화면에 보일 min, max 인덱스를 반환
	**/
	getVisibleIndex: function() {
		return {
			min: this._htCursor.visibleMin,
			max: this._htCursor.visibleMax
		};
	},

	_getWel: function(nIndex) {
		var wel = this.getElement(nIndex),
			isReuse = false;
		if (wel) {
			isReuse = true;
		} else {
			wel = this.getElement(-1);
			// if(this._welDf._element.childElementCount > 0) {
			// 	// console.log("-1인 경우", nIndex);
				// wel = this._welDf.query("[index='"+ nIndex + "']");
				// if(!wel) {
					// wel = this._welDf.last();
				// }
			if(!wel) {
				console.warn("index가 -1인 엘리먼트가 없네요", nIndex);
			}
		}
		return {
			wel: wel,
			isReuse: isReuse
		};
	},

	_onUpdate: function(we) {
		this.update();
		// this.startUpdater();
	},

	/**
		갱신할 영역의 카드 위치를 갱신함
		@method update
		@param {Number} pos 기준 위치. 없을 경우, document.body.scrollTop 값을 사용
	**/
	update: function(nPos) {
		this.option("bUseDebug") && console.time(" - update time");
		if (!this._bInfinite || this._isRepainting) {
			// console.warn("현재 repaint 중이기 때문에 updater를 사용할 수 없습니다.");
			return;
		}
		// console.debug("update-", this._htWElement.view.data("section"));
		var bRepaint = jindo.$H(this._htSelected).keys().length == 0;
		// console.time("update");
		if (this._updateRange(nPos)) {
			// 영역밖의 엘리먼트가 있을 경우 제거
			for (var i = 0, nLen = this._aCards.length, k; i < nLen; i++) {
				k = this._aCards[i].attr("index");
				if (k != -1 && (this._htCursor.min > k || this._htCursor.max < k)) {
					this._removeWel(k);
				}
			}
			this._htWElement["view"].css("visibility", "hidden");
			for (var idx = this._htCursor.min ; idx <= this._htCursor.max; idx++) {
				if (!this._htSelected[idx]) {
					this._setPos(idx, bRepaint);
				}
			}
			// (this._welTmpDf._element.childElementCount > 0) && this._htWElement["view"].append(this._welTmpDf);
			this._htWElement["view"].css("visibility", "");
			/**
				스크롤에 의해 각각의 카드가 모두 그려진 후 발생함

				@event update
				@param {String} sType 커스텀 이벤트명
				@param {Function} stop 수행시 영향을 받는것이 없음
			**/
			(typeof this._htEventHandler["update"] != "undefined") && this.fireEvent("update",{});
		}
		this.option("bUseDebug") && console.timeEnd(" - update time");
	},

	_setPos: function(nIndex, bRepaint) {
		var ht = this._getWel(nIndex),
			data = this._aData[nIndex],
			htParam = {
				wel: ht.wel,
				nIndex: nIndex,
				bRepaint: bRepaint,
				bReuse: ht.isReuse,
				bVisible: this._isVisible(nIndex),
				nX: data[this._sKey + "X"],
				nY: data[this._sKey + "Y"]
			};
		// 범위가 넘어간 경우에 대한 방어 코드
		if (!ht.wel) {
			return;
		}
		// debugger;
		//console.log(ht.wel.attr("index"),"=>", nIndex, "reuse : ", ht.isReuse);

		ht.wel.attr("index", nIndex);
		// 동적으로 추가된경우 해당 엘리먼트에 sExcludeClass를 등록한다.
		this._hasExcludeClass && data.isExclude && ht.wel.addClass(this._sExcludeClass);

		if (!ht.isReuse) {
			/**
				카드가 다시 그려지기 전에, 이벤트가 발생한다.
				<br>

				@event beforeDraw
				@param {String} sType 커스텀 이벤트명
				@param {$Element} wel 카드 엘리먼트
				@param {Boolean} bRepaint repaint 호출에 의한 변경 여부
				@param {Boolean} bVisible 위치가 변경된 카드가 화면 영역에 보여지는 여부
				@param {Number} nIndex 카드 데이터 인덱스 번호
				@param {Number} nX 카드의 X 좌표
				@param {Number} nY 카드의 Y 좌표
				@param {Function} stop 수행시 영향을 받는것이 없음
			**/
			var htDrawParam = {
				wel: htParam.wel,
				nIndex: nIndex,
				bRepaint: bRepaint,
				bVisible: htParam.bVisible,
				sData: data.data,
				nX: htParam.nX,
				nY: htParam.nY
			};
			if (this.fireEvent("beforeDraw", jindo.$Jindo.mixin({}, htDrawParam))) {
				ht.wel.html(data.data);
				/**
					카드가 다시 그려진 후에, 이벤트가 발생한다.
					<br>

					@event draw
					@param {String} sType 커스텀 이벤트명
					@param {$Element} wel 카드 엘리먼트
					@param {Boolean} bRepaint repaint 호출에 의한 변경 여부
					@param {Boolean} bVisible 위치가 변경된 카드가 화면 영역에 보여지는 여부
					@param {Number} nIndex 카드 데이터 인덱스 번호
					@param {Number} nX 카드의 X 좌표
					@param {Number} nY 카드의 Y 좌표
					@param {Function} stop 수행시 영향을 받는것이 없음
				**/
				this.fireEvent("draw", jindo.$Jindo.mixin({}, htDrawParam));
			}
		}
		/**
			카드의 위치가 변경될 경우, 이벤트가 발생한다.
			<br>
			nCardCount에서 지정한 순환하는 카드의 수 만큼 이벤트가 발생한다.

			@event position
			@param {String} sType 커스텀 이벤트명
			@param {$Element} wel 카드 엘리먼트
			@param {Boolean} bRepaint repaint 호출에 의한 변경 여부
			@param {Boolean} bReuse 순환형태로 카드가 변경되면서, 카드의 내용이 변경된 경우 false, 그렇지 않을 경우 true
			@param {Boolean} bVisible 위치가 변경된 카드가 화면 영역에 보여지는 여부
			@param {Number} nIndex 카드 데이터 인덱스 번호
			@param {Number} nX 카드의 X 좌표
			@param {Number} nY 카드의 Y 좌표
			@param {Function} stop 수행시 영향을 받는것이 없음
		**/

		this.fireEvent("position", htParam);

		if (bRepaint || data.isExclude || !ht.isReuse) {
			this._drawCard(ht.wel, htParam.nX, htParam.nY);
		}
		// if(typeof this._htEventHandler["position"] != 'undefined') {
		this._htSelected[nIndex] = true;
	},

	_isVisible: function(nIndex) {
		return this._htCursor.visibleMin <= nIndex && this._htCursor.visibleMax >= nIndex;
	},

	// _fireRepaintEvent: function(bRotate, bUseAdjustPosition, isCached) {
	_fireRepaintEvent: function(htParam) {
		// console.trace("_fireRepaintEvent in component : " +  this._htWElement["view"].attr("data-section"));
		htParam = htParam || {};
		htParam.nViewHeight = this._htHeight[this._sKey];
		htParam.bRotate = typeof htParam.bRotate == "undefined" ? false : htParam.bRotate;
		htParam.bRotate = this._htCursor.visibleMin != -1 && htParam.bRotate;
		htParam.bUpdate = typeof htParam.bUpdate == "undefined" ? true : htParam.bUpdate;
		!this._bInfinite && (htParam.bUpdate =false ); // 무한이 아닌경우에는 update가 호출되지 않음
		htParam.bCached = !!htParam.bCached;

		// 회전 되었을 경우, 위치를 이동
		if (htParam.bUseAdjustPosition) {
			if (this._htCursor.visibleMin != -1) {
				window.scrollTo(0, this._aData[this._htCursor.visibleMin][this._sKey + "Y"] + this._htSizeInfo.viewTop);
			}
		}
		this._isRepainting = false;
		this._htSelected = {};
		this._htWElement["view"]._element.style.height = htParam.nViewHeight + "px";

		if(this._bFixedWidth) {
			this._htWElement["view"].css("marginLeft",( (this._htSizeInfo.width % (this._getCardWidth() * this.getColumnCount()))/2 ) + "px");
		}
		/**
			repaint가 호출이 완료 되었을때 호출

			@event repaint
			@param {Number} nViewHeight view의 높이값
			@param {Number} bRotate 회전 여부
			@param {boolean} bCached 캐싱 여부
			@param {Function} stop 수행시 update가 호출되지 않는다.
		**/
		if (this.fireEvent("repaint", htParam)) {
			// console.error("update", htParam.bUpdate);
			htParam.bUpdate && this.update();
		}
		this.option("bUseDebug") && console.timeEnd(" - repaint time");
		// console.debug(" - cached",this._htCache);

		// this.startUpdater();
		// this.update();
	},


	/**
		repaint 진행 여부를 반환
		@method isRepainting
		@return {Boolean} repaint 진행 여부를 반환
	**/
	isRepainting: function() {
		return this._isRepainting;
	},

	/**
	 	뷰 사이즈를 다시 갱신한다.
	 	@method resizeView
	 **/
	resizeView: function() {
		if(this._bFixedWidth) {
			this._htWElement["view"].css({
				"marginLeft" : 0,
				"marginRight" : 0
			});
		}
		this._htSizeInfo = {
			height: window.innerHeight,
			width: this._htWElement["view"].width() + parseInt(this._htWElement["view"].css("marginLeft"),10) + parseInt(this._htWElement["view"].css("marginRight"),10), //window.innerWidth,
			cardWidth : this._getCardWidth(true),
			viewTop: this._htWElement["view"].offset().top,
			curTop: document.body.scrollTop
		};
		this._htSizeInfo.curPos = this._htSizeInfo.curTop - this._htSizeInfo.viewTop;
	},

	_getCardWidth : function(bRefresh) {
		// 캐싱된 것 부터. 단, bRefresh가 true인 경우에는 스킵~!
		if(!bRefresh && this._htSizeInfo && this._htSizeInfo.cardWidth) {
			return this._htSizeInfo.cardWidth;
		}
		if(this._bFixedWidth) {
			return this.option("nCardWidth");
		}
		if(this._bInfinite) {
			this._htSizeInfo.cardWidth = this._htWElement["size"].width();
		} else {
			// 무한이 아닌경우에는 size엘리먼트가 없기 때문에 무조건 첫번째 card의 width르 구함.
			// @todo 즉, 데이터가 하나도 없는 경우에는 문제가됨. 이에 대한 방어코드는 향후 추가
			if(this._aCards.length > 0) {
				this._htSizeInfo.cardWidth = this._aCards[0].width();
			} else {
				this._htSizeInfo.cardWidth = 0;
			}
		}
		return this._htSizeInfo.cardWidth;
	},

	/**
	 	repaint이후, 캐싱된 화면의 사이즈 정보를 반환한다.
	 	@method getSizeInfo
	 	@return {Object} 사이즈 정보를 반환한다.
	 		@return {Number} .nHeight 윈도우의 height를 반환한다.
			@return {Number} .nWidth 윈도우의 width를 반환한다.
			@return {Number} .nCardWidth 카드의 width를 반환한다.
			@return {Number} .nScrollTop document의 scroll top 값을 반환( 카드 배치를 위해, 확인한 document 스크롤의 값 )
			@return {Number} .nViewHeight view영역의 높이를 반환한다.
	 **/
	getSizeInfo: function() {
		return {
			nWidth: this._htSizeInfo.width,
			nHeight: this._htSizeInfo.height,
			nCardWidth: this._htSizeInfo.cardWidth,
			nScrollTop: this._htSizeInfo.curTop,
			nViewHeight: this._htHeight[this._sKey]
		};
	},

	// 위치 캐싱 완료~!
	_setCachePos: function(sPos, aY, nLastIndex) {
		this._htHeight[this._sKey] = Math.max.apply(null, aY);
		this._htCache[sPos] = nLastIndex - 1;
	},

	// 사이즈 캐싱 완료~!
	_setCacheSize: function(nLastIndex) {
		if(this._bFixedWidth) {
			this._htCache["v"] = this._htCache["h"] = nLastIndex - 1;
		} else {
			this._htCache[this._sKey] = nLastIndex - 1;
		}
	},

	//비동기식으로 사이즈와 위치 계산 동작
	_recalculateAsync: function(nStartIndex, aX, nLen, p, htOption) {
		var bNext = true,
			self = this,
			i = nStartIndex,
			nPosIndex, v,
			aY = this._getYPos(aX, nStartIndex);

		cancelAnimationFrame(self._nRepaintTimer);
		this.option("bUseDebug") && console.debug("[repaint-" + this._sKey + "] 사이즈, 위치 다 재계산 : ", nStartIndex, "~", nLen - 1, "(", (nLen - nStartIndex), ")");

		(function process() {
			if (i < nLen) {
				if (bNext) {
					bNext = false;
					v = self._aData[i];
					nPosIndex = aY.indexOf(Math.min.apply(null, aY));
					// console.info("v[p.sHeight]", v[p.sHeight] );
					if (htOption.bForce || v[p.sHeight] == -1) {
						self._getCardSize(i, v.data, function(height) {
							if(self._bFixedWidth) {
								v["vHeight"] = v["hHeight"] = height;
							} else {
								v[p.sHeight] = height;
							}
							v[p.sX] = aX[nPosIndex];
							v[p.sY] = aY[nPosIndex];
							aY[nPosIndex] += v[p.sHeight];
							bNext = true;
							i++;
						});
						// console.log("process 'Size' [", i,"]", v[p.sHeight]);
					} else {
						// console.log("process cached start : ", i);
						for (; i < nLen; i++, nPosIndex = aY.indexOf(Math.min.apply(null, aY)), v = self._aData[i]) {
							if (v[p.sHeight] != -1) {
								v[p.sX] = aX[nPosIndex];
								v[p.sY] = aY[nPosIndex];
								aY[nPosIndex] += v[p.sHeight];
							} else {
								break;
							}
						}
						// console.log("process cached end : ", i);
						bNext = true;
					}
				}
				self._nRepaintTimer = requestAnimationFrame(process);
			} else {
				// 위치 캐싱 완료~!
				self._setCachePos(p.sPos, aY, nLen);
				// 사이즈 캐싱 완료~!
				self._setCacheSize(nLen);
				self._fireRepaintEvent({
					bRotate : p.bRotate,
					bAdjustPosition : htOption.bAdjustPosition,
					bCached : false});
			}
		})();
	},

	//동기식으로 사이즈와 위치 계산 동작
	_recalculateSync: function(nStartIndex, aX, nLen, p, htOption) {
		this.option("bUseDebug") && console.debug("[repaint-" + this._sKey + " prepared mode] 사이즈, 위치 다 재계산 : ", nStartIndex, "~", nLen - 1, "(", (nLen - nStartIndex), ")");
		for (var i = nStartIndex, aY = this._getYPos(aX, nStartIndex), self = this, v, nPosIndex; i < nLen; i++) {
			v = this._aData[i];
			nPosIndex = aY.indexOf(Math.min.apply(null, aY));
			if (htOption.bForce || v[p.sHeight] == -1) {
				this._getCardSize(i, v.data, function(height) {
					if(self._bFixedWidth) {
						v["vHeight"] = v["hHeight"] = height;
					} else {
						v[p.sHeight] = height;
					}
					v[p.sX] = aX[nPosIndex];
					v[p.sY] = aY[nPosIndex];
					aY[nPosIndex] += v[p.sHeight];
				});
				//console.log("process 'Size' [", i,"] height : ", v[p.sHeight], "(" , v[p.sX], ",", v[p.sY], ")");
			} else {
				//console.log("process cached start : ", i);
				for (; i < nLen; i++, nPosIndex = aY.indexOf(Math.min.apply(null, aY)), v = this._aData[i]) {
					if (v[p.sHeight] != -1) {
						v[p.sX] = aX[nPosIndex];
						v[p.sY] = aY[nPosIndex];
						aY[nPosIndex] += v[p.sHeight];
					} else {
						i--;
						break;
					}
				}
				//console.log("process cached end : ", i);
			}
		}
		// 위치 캐싱 완료~!
		this._setCachePos(p.sPos, aY, nLen);
		// 사이즈 캐싱 완료~!
		this._setCacheSize(nLen);
		this._fireRepaintEvent({
			bRotate : p.bRotate,
			bAdjustPosition : htOption.bAdjustPosition,
			bCached : false});
	},

	// bUseRecycle : false인 경우 계산
	_recalculateNoInfinite : function(nStartIndex, nEndIndex, p) {
		this.option("bUseDebug") && console.debug("[repaint-" + this._sKey + "] 사이즈, 위치 다 재계산 [no infinite mode] : ", nStartIndex, "~", nEndIndex, "(", (nEndIndex - nStartIndex + 1), ")");
		for(var i=nStartIndex, aRemained = [], nLen = nEndIndex, aDummy; i < nLen; i++) {
			aDummy = this._getUnprepared(this._aCards[i]);
			if(aDummy) {
				aRemained = aRemained.concat(aDummy);
			}
		}
		if(aRemained.length != 0) {
			this._attachPreparedEvent(aRemained.length);
		} else {
			this._drawGrid(p);
		}
	},

	/**
		카드의 크기를 계산하고, 화면에 배치할 위치를 계산 후, 카드를 재배치한다.
		@param {Number} nIndex repaint를 시작할 위치를 지정한다. (deprecated)
		@method repaint
	**/
	/**
		카드의 크기를 계산하고, 화면에 배치할 위치를 계산 후, 카드를 재배치한다.
		@param {Object} htOption repaint에 필요한 옵션을 받는다.
			@param {Number} htOption.nIndex repaint를 시작할 위치를 지정한다. (deprecated)
			@param {boolean} htOption.bForce 캐싱을 사용하지 않고 repaint 여부를 결정한다.
			@param {boolean} htOption.bAdjustPosition 현재 보고 있는 컨텐츠에 맞게 스크롤의 위치 조정할지 여부를 결정한다. (기본값은 회전일 경우 true, 그렇지 않으면 false이다.)
			@param {boolean} htOption.bSync repaint를 동기적으로 동작할지 여부를 결정한다. (단, sSizePrefix가 지정된 경우에만 사용가능. 기본값은 회전일 경우, true, 그렇지 않을 경우 false이다.)
		@method repaint
	**/
	repaint: function(vParam) {
		if (this._isRepainting) {
			// console.warn("현재 repaint 중입니다.");
			return;
		}
		this._isRepainting = true;
		this._initRepaint();

		// repaint 재정의
		this.repaint = function(vParam) {
			if (this._isRepainting) {
				// console.warn("현재 repaint 중입니다.");
				return;
			}

			this._isRepainting = true;
			this.option("bUseDebug") && console.time(" - repaint time");
			var p = this._repaintForRotate(),
				htOption = {};
			// if (typeof vParam == "number" || typeof vParam == "string") {
			// 	htOption.nIndex = vParam;
			// } else
			if (typeof vParam == "object") {
				htOption = jindo.$Jindo.mixin(htOption, vParam);
			}
			// 회전일 경우,위치조정, 그렇지 않을 경우는 bUseAdjustPosition 값 사용
			htOption.bAdjustPosition = typeof htOption.bAdjustPosition == "undefined" ? p.bRotate : htOption.bAdjustPosition;
			htOption.bSync = typeof htOption.bSync == "undefined" ? p.bRotate : htOption.bSync;

			if(this._bInfinite) {
				this._repaintForInfinite(htOption, p);
			} else {
				this._repaintForNoInfinite(htOption, p);
			}
		};
	},

	// bUseRecycle : false일 경우.
	_repaintForNoInfinite : function(vParam, p) {
		var htIndex = this._createDom(this._aCards.length,this._aData.length),
			nStartIndex;
		if(htIndex) {
			// 노드가 부족한 경우에는 생성 후, 재갱신~!
			this._recalculateNoInfinite(htIndex.start, htIndex.end, p);
		} else {
			var nLen = this._aData.length;
			if (this._htCache[p.sKey] == nLen - 1) {
				var isCached = true;
				if (this._htCache[p.sPos] == nLen - 1) {
					this.option("bUseDebug") && console.debug("[repaint-" + p.sKey + "] 모두 캐싱되어있음");
				} else {
					// nStartIndex = (typeof vParam.nIndex == "undefined" ? this._htCache[p.sPos] + 1 : vParam.nIndex);
					nStartIndex = this._htCache[p.sPos] + 1;
					this.option("bUseDebug") && console.debug("[repaint-" + p.sKey + "] 위치만 재계산 : ", nStartIndex, "~", nLen - 1, "(", (nLen - nStartIndex), ")");
					this._calculate(nStartIndex, this._getXPos(), nLen, p);
					isCached = false;
				}
				this._draw(p);
				this._fireRepaintEvent({
					bRotate : p.bRotate,
					bCached : isCached
				});
			} else {
				// nStartIndex = (typeof vParam.nIndex == "undefined" ? this._htCache[p.sKey] + 1 : vParam.nIndex);
				nStartIndex = this._htCache[p.sKey] + 1;
				this._recalculateNoInfinite(this._htCache[p.sKey] + 1, nLen, p);
			}
		}
	},

	// bUseRecycle : true일 경우.
	_repaintForInfinite : function(vParam, p) {
		// 캐시를 사용하지 않는 경우
		if (vParam.bForce) {
			this._htCache[p.sKey] = -1;
			this._htCache[p.sPos] = -1;
			this.option("bUseDebug") && console.debug("-- repaint 강제 호출 --");
		}
		var aX = this._getXPos(),
			nLen = this._aData.length,
			nStartIndex;

		// 사이즈, 위치 캐싱여부에 따라 확인
		if (this._htCache[p.sKey] == nLen - 1) {
			var isCached = true;
			if (this._htCache[p.sPos] == nLen - 1) {
				this.option("bUseDebug") && console.debug("[repaint-" + p.sKey + "] 모두 캐싱되어있음");
			} else {
				// nStartIndex = (typeof vParam.nIndex == "undefined" ? this._htCache[p.sPos] + 1 : vParam.nIndex);
				nStartIndex = this._htCache[p.sPos] + 1;
				this.option("bUseDebug") && console.debug("[repaint-" + p.sKey + "] 위치만 재계산 : ", nStartIndex, "~", nLen - 1, "(", (nLen - nStartIndex), ")");
				this._calculate(nStartIndex, aX, nLen, p);
				isCached = false;
			}
			this._fireRepaintEvent({
				bRotate : p.bRotate,
				bAdjustPosition : vParam.bAdjustPosition,
				bCached : isCached});
		} else {
			// nStartIndex = (typeof vParam.nIndex == "undefined" ? this._htCache[p.sKey] + 1 : vParam.nIndex);
			nStartIndex = this._htCache[p.sKey] + 1;

			// 데이터가 변경되었을 경우, visible 영역 외 부분의 카드에 데이터를 변경한다.
			var i = 0, k=nStartIndex, nCardLen = this._aCards.length, nIndex, wel;
			if(!p.bRotate && (i < nCardLen && k< nLen)) {
				this._htWElement["view"].css("visibility","hidden");
				while(i < nCardLen && k< nLen) {
					nIndex = this._aCards[i].attr("index");
					if (nIndex == -1 || (this._htCursor.visibleMin > nIndex)) {
						wel = this._aCards[i];
						if(wel && !this._isExcludeWel(wel)) {
							// this._welTmpDf.append(wel);
							wel.html(this._aData[k].data).attr("index", k);
							k++;
						}
					}
					i++;
				}
				// this._htWElement["view"].append(this._welTmpDf);
				this._htWElement["view"].css("visibility","");
			}

			// 애니메이션과 함께 동작할 경우, 동기식 방식은 애니메이션 성능에 지장을 줌.
			if (this._isPrepareMode || vParam.bSync) {
				this._recalculateSync(nStartIndex, aX, nLen, p, vParam);
			} else {
				this._recalculateAsync(nStartIndex, aX, nLen, p, vParam);
			}
		}
	},

	_p : function(bRotate) {
		return {
			bRotate: bRotate,
			sKey : this._sKey,
			sX: this._sKey + "X",
			sY: this._sKey + "Y",
			sHeight: this._sKey + "Height",
			sPos: this._sKey + "Pos"
		};
	},

	// 회전시 repaint 여부 확인 및 사이즈 갱신.
	_repaintForRotate: function() {
		var sKey = jindo.m.isVertical() ? "v" : "h";
		if (this._sKey == sKey) {
			// console.debug("_repaintForRotate cached");
			return this._p(false);
		}
		this._sKey = sKey;
		this.resizeView();
		return this._p(true);
	},

	_onActivate: function() {
		// 사이즈 초기 갱신
		this._bInfinite && this._attachEvent();
	},

	_onDeactivate: function() {
		this._bInfinite && this._detachEvent();
	},

	// x 좌표를 얻는다.
	_getXPos: function() {
		var nCount = this.getColumnCount();
		if (nCount > 1) {
			var aPos = [],
				nX = 0;
			for (var i = 0; i < nCount; i++) {
				nX += (i == 0 ? 0 : this._htSizeInfo.cardWidth);
				aPos.push(nX);
			}
			return aPos;
		} else {
			return [0];
		}
	},

	// y 좌표를 얻는다.
	_getYPos: function(aX, nStartIndex) {
		var aY = Array.apply(null, Array(aX.length)).map(function() {
				return 0;
			}),
			aTmp = aX.concat([]);

		for (var i = 0, nBeforeIdx, data, nYIndex, nCount = 0, nLen = aX.length; nCount < nLen; i++) {
			nBeforeIdx = nStartIndex - (i + 1);
			if (nBeforeIdx >= 0) {
				data = this._aData[nBeforeIdx];
				nYIndex = aTmp.indexOf(data[this._sKey + "X"]);
				if (nYIndex != -1) { // 찾은 경우, -1로 표시
					aTmp[nYIndex] = -1;
					aY[nYIndex] = data[this._sKey + "Y"] + data[this._sKey + "Height"];
					nCount++;
				}
			} else {
				break;
			}
		}
		return aY;
	},

	/**
		카드 계산의 캐싱 여부를 반환한다.
		@param {boolean} isSize true일 경우, 사이즈의 캐싱여부를 반환한다. false일경우 위치, 사이즈의 캐싱여부를 반환한다.
		@method isCached
	**/
	isCached: function(isSize) {
		var nLen = this._aData.length;
		if (isSize) {
			return (this._htCache[this._sKey] == nLen - 1);
		} else {
			return (this._htCache[this._sKey] == nLen - 1) && (this._htCache[this._sKey + "Pos"] == nLen - 1);
		}
	},

	destroy: function() {
		this._aData.length =0; // data cache
		this._aCards.length =0;
		this._htSelected = {}; // 화면에 선택된 엘리먼트 배열
		this._welTmpDf = null;
		this._bInfinite && this._detachEvent();
		this._detachPreparedEvent();
	}
}).extend(jindo.m.UIComponent);