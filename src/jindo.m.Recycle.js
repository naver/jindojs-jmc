/**
	@fileOverview "DOM 순환"을 손쉽게 개발할 수 있는 컴포넌트
	@author "sculove"
	@version #__VERSION__#
	@since 2014. 10. 31.
**/
/**
	"DOM 순환"을 손쉽게 개발할 수 있는 컴포넌트

	@class jindo.m.Recycle
	@extends jindo.m.Component
	@keyword infinite, recycle, 무한
	@group Component
	@ignore

**/
jindo.m.Recycle = jindo.$Class({
	/* @lends jindo.m.InfiniteCard.prototype */
	/**
		초기화 함수

		@constructor
		@param {String|HTMLElement|jindo.$Elemenet} el 무한카드를 사용할 부모 엘리먼트 (필수)
		@param {Object} [htOption] 초기화 옵션 객체
			@param {Number} [htOption.sClassName=wrp_cds] 카드 엘리먼트가 가진 클래스명
			@param {Number} [htOption.nExpandSize=0] 지정한 만큼 좀 더 넓은 범위의 영역을 기준으로 DOM이 Recycle(교체)이 됨 (단위 : px)
			@param {Number} [htOption.nCardCount=5] Recycle(교체)할 DOM의 개수
			@param {Number} [htOption.nCardSize=5] 카드의 크기
			@param {Number} [htOption.nViewSize=5] 화면에 보일 뷰 크기
			@param {Number} [htOption.bUseCss3d=jindo.m.useCss3d()] 하드웨어 3d 가속 여부
			@param {Number} [htOption.bHorizontal=true] 가로 여부
	**/
	$init: function(el, htOption) {
		this.option({
			sClassName: "wrp_cds",
			nExpandSize: 0,
			nTotalContents : 5,
			nCardCount: 5,
			nCardSize : 0,
			nViewSize : 0,
			bUseCss3d: jindo.m.useCss3d(),
			bHorizontal : true,
		});
		this.option(htOption || {});

		this._initVar();
		this._setWrapperElement(el);
		this.refresh(true);
		this._setInfiniteDom();
	},

	_initVar: function(wel) {
		this._aCards = []; // 카드 캐쉬
		this._htSelected = {}; // 화면에 선택된 엘리먼트 배열

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
		// 안드로이드 2.x 하이라이트 버그
		this._hasOffsetBug = jindo.m.hasOffsetBug();
		this._htSizeInfo = {
			viewSize : 0,
			curPos : 0
		};
	},

	_setWrapperElement: function(el) {
		this._htWElement = {};
		this._htWElement["view"] = jindo.$Element(el).css("position", "relative");
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

	_createDom : function(nStartIndex, nEndIndex, sTag) {
		if(nStartIndex >= nEndIndex) {
			return null;
		}
		sTag = sTag || "div";
		var sClassName = this.option("sClassName"),
			sHtml = "<" + sTag + " class='" + sClassName + "' style='position:absolute;top:0px;",
			sPrefix = jindo.m.getCssPrefix();
		sHtml += (this._bHorizontal ? "width:" : "height") + this._nCardSize + "px;";

		if (this._hasOffsetBug) {
			sHtml += "left:-200%;";
		} else {
			sHtml += "left:0px;";
			sHtml += "-" + sPrefix + "-transition-property:-webkit-transform;";
			sHtml += "-" + sPrefix + "-transform:" + jindo.m._getTranslate("-200%", 0, this.option("bUseCss3d"));
		}
		sHtml += "' index='-1'></" + sTag + ">";

		for (var i = nStartIndex, welDf = jindo.$Element(document.createDocumentFragment()), wel, nDataLen = this._nTotalContents; i < nEndIndex; i++) {
			wel = jindo.$Element(sHtml);
			welDf.append(wel);
			this._aCards.push(wel);
		}
		this._htWElement["view"].append(welDf);
		return {
			start : nStartIndex,
			end : i-1
		};
	},

	// 사용할 DOM을 구성 및 생성한다.
	_setInfiniteDom : function() {
		var aRemoveWel = [],
			waChild = jindo.$A(this._htWElement["view"].child()),
			sTag = "div",
			sSizeKey = this._bHorizontal ? "width" : "height";

		this._htWElement["view"].css("visibility", "hidden");

		// 기존 데이터가 있는 경우
		waChild.forEach(function(v, i, a) {
			// 최초 로컬 데이터의 개수를 기준으로 DOM을 순환한다.
			// 단, MaxCount는 초과하지 않는다
			if (this._nCardCount > i) {
				i == 0 && (sTag = v._element.tagName);
				this._aCards.push(v.attr("index",i));
				this._setPosCard(v, this._getXPos(i) , this._getYPos(i));
				// this._htSelected[i] = true;
			} else {
				aRemoveWel.push(v);
			}
			v[sSizeKey](this._nCardSize);
		}, this);
		this._htCursor.min = this._htBeforeCursor.min = this._htCursor.visibleMin = 0;
		this._htCursor.max = this._htBeforeCursor.max = this._htCursor.visibleMax = this._aCards.length - 1;

		// 부족한 DOM 은 만들어 놓는다.
		this._createDom(this._aCards.length, this._nCardCount, sTag);
		// console.log("제거할 Node:" + aRemoveWel.length);
		(aRemoveWel.length >0) && jindo.$A(aRemoveWel).forEach(function(v, i, a) {
			v.leave();
		});

		this._htWElement["view"].css("visibility", "");
	},

	_getXPos : function(nIndex) {
		return this._bHorizontal ? 	this._nCardSize * nIndex : 0;
	},

	_getYPos : function(nIndex) {
		return this._bHorizontal ? 	0 : this._nCardSize * nIndex;
	},

	// 카드의 위치를 다시 그린.
	_setPosCard: function(wel, nX, nY) {
		// console.info("_setPosCard", arguments);
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
		var htResult = {
				min: parseInt(nStartPos / this._nCardSize, 10),
				max: parseInt(nEndPos  / this._nCardSize, 10) + (nEndPos % this._nCardSize == 0 ? 0 : 1)
			};
		htResult.min = htResult.min < 0 ? 0 : htResult.min;
		htResult.max = htResult.max >= this._nTotalContents ? this._nTotalContents -1 : htResult.max;
		return htResult;
	},

	_updateRange: function(nPos) {
		var nCurrentPos = typeof nPos == "undefined" ? 0 : nPos;
		if (this._htSizeInfo.curPos == nCurrentPos) {
			// console.warn("기존 스크롤의 위치가 동일하여 return");
			return false;
		}

		this._htSizeInfo.curPos = nCurrentPos;
		var isNext = this._htSizeInfo.curPos == undefined ? true : this._htSizeInfo.curPos <= nCurrentPos,
			nExpandSize = this.option("nExpandSize"),
			nStartPos = nCurrentPos - nExpandSize,
			nEndPos = (nStartPos > 0 ? nStartPos : 0) + this._htSizeInfo.viewSize + (2 * nExpandSize),
			htData = this._getRangeData(nStartPos, nEndPos),
			htVisibleData = this._getRangeData(nCurrentPos, nCurrentPos + this._htSizeInfo.viewSize),
			nMin = htData.min,
			nMax = htData.max,
			bReturn = false;

		// Visible 정보 갱신
		this._htCursor.visibleMin = htVisibleData.min;
		this._htCursor.visibleMax = htVisibleData.max;

		// min/max 보정
		var hResult = this._correctRange(nMin, nMax, this._htCursor.visibleMin, this._htCursor.visibleMax, isNext);
		if (this._htCursor.min != hResult.nMin || this._htCursor.max != hResult.nMax) {
			this._htBeforeCursor.min = this._htCursor.min;
			this._htBeforeCursor.max = this._htCursor.max;
			this._htCursor.min = hResult.nMin;
			this._htCursor.max = hResult.nMax;
			bReturn = true;
		}
		// console.info(this._htCursor.min, "->" , this._htCursor.max, "(", this._htCursor.max-this._htCursor.min+1,") visible: " , this._htCursor.visibleMin, "->" , this._htCursor.visibleMax, "(", this._htCursor.visibleMax-this._htCursor.visibleMin+1,")");
		return bReturn;
	},

	// min/max 값을 보정한다.
	_correctRange: function(nMin, nMax, nVisibleMin, nVisibleMax, isNext) {
		// console.warn("보정 전 :" , nMin, "~", nMax, (nMax - nMin+1), ", visible : ", nVisibleMin, "~", nVisibleMax, (nVisibleMax-nVisibleMin+1));
		var nDiff = this._nCardCount - (nMax - nMin + 1),
			nLastDataIndex = this._nTotalContents - 1;

		if (nDiff < 0) {
			nMax += nDiff;
			// this.option("bUseDebug") && (nDiff < 0) && console.warn("지정한 범위(nExpandSize)에 맞게 카드를 배치하기 위해서는 ", -nDiff, "개의 카드가 더 필요합니다.\nnCardCount값을 늘려주시기거나 nExpandSize를 줄여주시기 바랍니다.");
		} else {
			// 범위가 최대 카드 개수를 다 활용하지 못하는 경우
			// 아래로 갈경우에는 아래를 우선으로,
			// 위로 갈경우에는 위를 우선으로 남은 카드개수를 더한다.
			for (var i = 0; i < nDiff; i++) {
				if (isNext) {
					nLastDataIndex > nMax ? nMax++ : nMin--;
				} else {
					0 < nMin ? nMin-- : nMax++;
				}
			}
			nMin = nMin < 0 ? 0 : nMin;
			nMax = nMax > nLastDataIndex ? nLastDataIndex : nMax;
		}
		// console.info("1 correct :" , nMin, "~", nMax, "(" , (nMax - nMin + 1), ") , isNext:", isNext);
		// visible에 따른 보정, visible영역을 벗어난경우에는 보정
		if (nVisibleMin < nMin || nVisibleMax > nMax) {
			var nUsableCount = nMax - nMin;
			nMin = nVisibleMin;
			nMax = nMin + nUsableCount;
			nMin = nMin < 0 ? 0 : nMin;
			nMax = nMax > nLastDataIndex ? nLastDataIndex : nMax;
		}
		// console.info("2 correct :" , nMin, "~", nMax, "(" , (nMax - nMin + 1), ") , isNext:", isNext, " visible : " , nVisibleMin, "~", nVisibleMax);
		return {
			nMin: nMin,
			nMax: nMax
		};
	},

	_removeWel: function(nIndex) {
		// console.warn("삭제할 인덱스", nIndex);
		delete this._htSelected[nIndex];
		var wel = this.getElement(nIndex);
		wel.attr("index", -1); //.hide();
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
			if(!wel) {
				// console.warn("index가 -1인 엘리먼트가 없네요", nIndex);
			}
		}
		return {
			wel: wel,
			isReuse: isReuse
		};
	},

	/**
		갱신할 영역의 카드 위치를 갱신함
		@method update
		@param {Number} pos 기준 위치. 없을 경우, document.body.scrollTop 값을 사용
	**/
	update: function(nPos) {
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
					this._setPos(idx);
				}
			}
			this._htWElement["view"].css("visibility", "");
		}
	},

	_setPos: function(nIndex) {
		var ht = this._getWel(nIndex),
			htParam = {
				wel: ht.wel,
				nIndex: nIndex,
				// bReuse: ht.isReuse,
				// bVisible: this._isVisible(nIndex),
				nX : this._getXPos(nIndex),
				nY : this._getYPos(nIndex)
			};
		// 범위가 넘어간 경우에 대한 방어 코드
		if (!ht.wel) {
			return;
		}
		// console.log(ht.wel.attr("index"),"=>", nIndex, "reuse : ", ht.isReuse);

		ht.wel.attr("index", nIndex);
		if (!ht.isReuse) {
			var htDrawParam = {
				wel: htParam.wel,
				nIndex: nIndex,
				nX: htParam.nX,
				nY: htParam.nY
			};
			/**
				카드가 다시 그려진 후에, 이벤트가 발생한다.
				<br>

				@event draw
				@param {String} sType 커스텀 이벤트명
				@param {$Element} wel 카드 엘리먼트
				@param {Boolean} bVisible 위치가 변경된 카드가 화면 영역에 보여지는 여부
				@param {Number} nIndex 카드 데이터 인덱스 번호
				@param {Number} nX 카드의 X 좌표
				@param {Number} nY 카드의 Y 좌표
				@param {Function} stop 수행시 영향을 받는것이 없음
			**/
			// this.fireEvent("draw", jindo.$Jindo.mixin({}, htDrawParam));
			this.fireEvent("draw", htDrawParam);
			this._setPosCard(ht.wel, htParam.nX, htParam.nY);
		}
		this._htSelected[nIndex] = true;
	},

	_isVisible: function(nIndex) {
		return this._htCursor.visibleMin <= nIndex && this._htCursor.visibleMax >= nIndex;
	},

	/**
	 *	@옵션 정보를 갱신한다.
	 *	@method refresh
	**/
	refresh: function(isNoUpdate) {
		this._htSizeInfo.viewSize = this.option("nViewSize");
		this._bHorizontal = this.option("bHorizontal");
		this._nCardSize = this.option("nCardSize");
		this._nCardCount = parseInt(this.option("nCardCount"),10);
		this._nTotalContents = parseInt(this.option("nTotalContents"),10);
		this._htWElement["view"][this._bHorizontal ? "width" : "height"](this._nTotalContents * this._nCardSize);
		!isNoUpdate && this.update();
	},

	destroy: function() {
		this._aCards.length =0;
		this._htSelected = {}; // 화면에 선택된 엘리먼트 배열
	}
}).extend(jindo.m.Component);