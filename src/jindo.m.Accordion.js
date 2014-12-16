/**
	@fileOverview 모바일 전용 아코디언
	@version #__VERSION__#
	@since 2011. 7. 13.
**/
/**
	제목탭과 내용탭이 쌍으로 펼쳐지고 접혀지는 컴포넌트

	@class jindo.m.Accordion
	@extends jindo.m.UIComponent
	@keyword accordion, accordian, 아코디언
	@group Component

	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Support Android 3.0/4.0 지원 갤럭시<br />jindo 2.0.0 mobile 버전 지원
	@history 0.9.0 Release 최초 릴리즈
**/

jindo.m.Accordion = jindo.$Class({
	/* @lends jindo.m.Accordion.prototype */
	/**
		초기화 함수

		@constructor
		@param {String|HTMLElement} el Accordion 컴포넌트를 적용한 레이어의 id 혹은 HTMLElement
		@param {Object} [htOption] 초기화 옵션 객체
			@param {String} [htOption.sClassPrefix='accordion-'] 초기 HTML/CSS구조에서 필요한 className 앞에 붙는 prefix를 정의
			@param {String} [htOption.sDirection='vertical'] Accordion이 펼쳐질 방향
				<ul>
				<li>vertical : 세로</li>
				<li>horizontal : 가로</li>
				</ul>
			@param {Number} [htOption.nDefalutIndex=-1] 디폴트로 확장될 인덱스, 선언하지 않을시 확장하지 않음
			@param {Boolean} [htOption.bUseToggle=false] Header에 클릭발생시 Block의 확장(Expand)/축소(Collapse) 토글여부
			@param {String} [htOption.sTransitionTimingFunction=ease] Block의 확장(Expand)/축소(Collapse) Effect효과
				<ul>
				<li>ease : 속도가 급가속되다가 급감속되는 효과 (거의 끝에서 급감속됨)</li>
				<li>linear : 등속효과</li>
				<li>ease-in : 속도가 점점 빨라지는 가속 효과</li>
				<li>ease-out : 속도가 천천히 줄어드는 감속효과</li>
				<li>ease-in-out : 속도가 천천히 가속되다가 천천히 감속되는 효과 (가속과 감속이 부드럽게 전환됨)</li>
				</ul>
			@param {Number} [htOption.nDuration=500] Block의 확장(Expand)/축소(Collapse) Effect처리 지속시간
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
	**/
	$init : function(el,htOption) {
		var htDefaultOption = {
			bActivateOnload : true,
			sClassPrefix : 'accordion-',
			sDirection : 'vertical',
			nDefalutIndex :  -1,
			bUseToggle : false,
			sTransitionTimingFunction : "ease",
			nDuration : 500
		};
		this.option(htDefaultOption);
		this.option(htOption || {});

		this._initVar(el);

		this._setWrapperElement();
		if(this.option("bActivateOnload")) {
			this.activate();
		}

		this._setSize();
		this._setDefaultExpand();
	},

	/**
		변수 초기화 함수
		인스턴스 변수를 초기화한다.

		@param {String|HTMLElement} el Accordion 컴포넌트를 적용한 레이어의 id 혹은 HTMLElement
	**/
	_initVar : function(el) {
		this._elContainer = (typeof el == "string") ? jindo.$(el) : el;
		this._aAccordionBlock = jindo.$$("." + this.option("sClassPrefix") + "block", this._elContainer);

        this._setBlockGpu();
		var htInfo = jindo.m.getDeviceInfo();
		var nVersion = parseFloat(htInfo.version,10);
		if(htInfo.android && (nVersion <3) ){
			var elDummyTag = jindo.$$.getSingle("._accordion_dummy_atag_", this._elContainer);
			if(!elDummyTag){
				elDummyTag = jindo.$("<a href='javascript:void(0);' class='_accordion_dummy_atag_'></a>");
				elDummyTag.style.position = "absolute";
				elDummyTag.style.left = "-1000px";
				elDummyTag.style.top = "-1000px";
				elDummyTag.style.width = 0;
				elDummyTag.style.height = 0;
				jindo.$Element(this._elContainer).append(elDummyTag);
			}
		}

		this._nExpand = -1;
		this._wfTransitionEnd = jindo.$Fn(this._onTransitionEnd, this).bind();
	},

	_setBlockGpu : function(){
	    var bUseCss3d = jindo.m.useCss3d();
	    var sCssPrefix = jindo.m.getCssPrefix();

	    if(!bUseCss3d){
	        return;
	    }

	    jindo.$A(this._aAccordionBlock).forEach(function(el, index, array){
	        jindo.$Element(el).css(sCssPrefix + "Transform", "translateZ(0)");
        }, this);

	},

	/**
		jindo.m.Accordion 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
	**/
	_setWrapperElement : function() {

	},

	/**
		jindo.m.Accordion 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		this._attachEvent();
	},

	/**
		jindo.m.Accordion 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEvent();
	},

	/**
		jindo.m.Accordion 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		this._htEvent = {};

		jindo.$A(this._aAccordionBlock).forEach(function(el, index, array){
			this._htEvent["click_" + index] = {
				ref : jindo.$Fn(this._onClick, this).attach(this.getHandler(index), "click"),
				el	: this.getHandler(index)
			};
		}, this);
	},

	/**
		특정 이벤트를 해제한다.

		@param {String} sEventKey 이벤트 키
	**/
	_detachEvent : function(sEventKey) {
		if(sEventKey) {
			var htTargetEvent = this._htEvent[sEventKey];
			htTargetEvent.ref.detach(htTargetEvent.el, sEventKey.substring(0, sEventKey.indexOf("_")));
		}
	},

	/**
		jindo.m.Accordion 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEventAll : function() {
		for(var p in this._htEvent) {
			this._detachEvent(p);
		}

		this._htEvent = null;
	},

	/**
		아코디언 핸들클릭시 이벤트 핸들러

		@param {jindo.$Event} we 랩핑된 이벤트객체
		@ignore
	**/
	_onClick : function(we){
		we.stop();
		var elBlock = this._getBlock(we.element);
		var nIndex = (elBlock) ? jindo.$A(this._aAccordionBlock).indexOf(elBlock) : null;

		var nCurrentIndex = this.getExpandIndex();
		var bUseToggle = this.option("bUseToggle");
		if(typeof nIndex == 'number'){
			if(nIndex == nCurrentIndex) {
				if(bUseToggle) {
					this.collapse(nCurrentIndex);
					this._nExpand = -1;
				}
			} else {
				this.expand(nIndex);
				if(nCurrentIndex > -1) {
					this.collapse(nCurrentIndex);
				}
			}
		}
	},

	/**
	 * 아코디언 블럭의 각 사이즈 정보세팅함수
	 */
	_setSize : function() {
		this._htBlockSize = {};
		var nHeaderSize, nBodySize;
		jindo.$A(this._aAccordionBlock).forEach(function(el, index, array){
			nHeaderSize = this._getHeaderSize(index);
			nBodySize = this._getBodySize(index);
			this._htBlockSize[index] = {
				nHeaderSize : nHeaderSize,
				nBodySize : nBodySize
			};

			if(this.option("sDirection") == "vertical") {
				jindo.$Element(el).height(nHeaderSize);
			} else {
				jindo.$Element(el).width(nHeaderSize);
			}
		}, this);
	},

	/**
		아코디언 블럭의 헤더 사이즈 반환함수

		param {Number} nIndex 아코디언 블럭의 인덱스
		@return {Number} 아코디언 nIndex번째 블럭의 헤더 사이즈
	**/
	_getHeaderSize : function(nIndex) {
		var welHead = jindo.$Element(this.getHead(nIndex));
		var nHeaderSize = (this.option("sDirection") == "vertical") ? welHead.height() : welHead.width();
		return nHeaderSize;
	},

	/**
		아코디언 블럭의 바디 사이즈 반환함수

		param {Number} nIndex 아코디언 블럭의 인덱스
		@return {Number} 아코디언 nIndex번째 블럭의 바디 사이즈
	**/
	_getBodySize : function(nIndex) {
		var welBody = jindo.$Element(this.getBody(nIndex));
		var nBodySize = (this.option("sDirection") == "vertical") ? welBody.height() : welBody.width();
		return nBodySize;
	},

	/**
		아코디언 블럭의 전체 사이즈(header + body) 반환함수

		@param {Number} nIndex 아코디언 블럭의 인덱스
		@return {Number} 아코디언 nIndex번째 블럭의 사이즈
	**/
	_getSize : function(nIndex) {
		if(!this._htBlockSize || !this._htBlockSize[nIndex]) {
			this._setSize();
		}
		var nSize = this._htBlockSize[nIndex]["nHeaderSize"] + this._htBlockSize[nIndex]["nBodySize"];
		return nSize;
	},

	/**
		 디폴트로 Expnad할 블럭 처리함수
	**/
	_setDefaultExpand : function() {
		var nDefaultIndex = this.option("nDefalutIndex");
		if(nDefaultIndex > -1) {
			setTimeout(jindo.$Fn(function() {
				this.expand(nDefaultIndex);
			}, this).bind(),100);
		}
	},

	/**
		아코디언 블럭의 헤더 반환함수

		@method getHead
		@param {Number} nIndex 아코디언 블럭의 인덱스
		@return {HTMLElement} 아코디언 블럭의 header 엘리먼트
	**/
	getHead : function(nIndex){
		return jindo.$$.getSingle('dt', this._aAccordionBlock[nIndex]);
	},

	/**
		아코디언 블럭의 바디 반환함수

		@method getBody
		@param {Number} nIndex 아코디언 블럭의 인덱스
		@return {HTMLElement} 아코디언 블럭의 body 엘리먼트
	**/
	getBody : function(nIndex){
		return jindo.$$.getSingle('dd', this._aAccordionBlock[nIndex]);
	},

	/**
		아코디언 블럭 반환함수

		@param {HTMLElement} el 아코디언 블럭의 핸들 엘리먼트
		@return {jindo.$Element} 랩핑된 엘리먼트 객체
	**/
	_getBlock : function(el){
		var sClassPrefix = this.option("sClassPrefix") +"block";
		//return jindo.$Element(el).hasClass('.'+sClassPrefix)? el: jindo.$$.getSingle("! ." + sClassPrefix, el);

		//var elBlock = this._getClosest(sClassPrefix, el);
		var elBlock = jindo.m.getClosest(sClassPrefix, el);
		return elBlock;
	},

	/**
		아코디언 블럭의 핸들러 반환함수

		@method getHandler
		@param {Number} nIndex 아코디언 블럭의 인덱스
		@return {HTMLElement} 아코디언 블럭의 핸들러 엘리먼트
	**/
	getHandler : function(nIndex){
		var elHead = this.getHead(nIndex);
		return jindo.$$.getSingle('.'+this.option('sClassPrefix')+'handler', elHead) || elHead;
	},

	/**
		현재 Expand되어 있는 아코디언 블럭의 Index 반환함수

		@method getExpandIndex
		@return {Number} 아코디언 블럭의 Index(전체가 collapse되어있는 경우 -1을 반환한다.)
	**/
	getExpandIndex : function(){
		return this._nExpand;
	},

	/**
		아코디언 블럭 Expand 처리함수

		@method expand
		@param {Number} nIndex 아코디언 블럭의 인덱스
	**/
	expand : function(nIndex){
		this._elBlock = this._aAccordionBlock[nIndex];
		if(typeof this._elBlock == 'undefined'){ return;}
		/**
			Block이 확장(Expand)되기 전에 발생

			@event beforeExpand
			@param {String} sType 커스텀 이벤트명
			@param {Number} nBeforeIndex  기존에 확장(Expand)되어있는 Block의 인덱스 <br />- 모두 축소(Collapse)된 상태라면 -1 반환
			@param {Number} nIndex  확장(Expand)처리할 Block의 인덱스
			@param {HTMLElement} elBlock 확장(Expand)처리할 Block 엘리먼트
			@param {Function} stop 수행시 Block이 확장(Expand)되지 않음
		**/
		if(!this.fireEvent("beforeExpand", {
			sType : "beforeExpand",
			elBlock : this._elBlock,
			nBeforeIndex : this._nExpand,
			nIndex : nIndex
		})){ return; }

		this._setTransition(this._elBlock, this._getSize(nIndex));
		this._nExpand = nIndex;
		/**
			Block이 확장(Expand)된 후에 발생

			@event expand
			@param {String} sType 커스텀 이벤트명
			@param {Number} nIndex 확장(Expand)처리한 Block의 인덱스
			@param {HTMLElement} elBlock 확장(Expand)처리한 Block 엘리먼트
			@param {Function} stop 수행시 Block이 확장(Expand)되지 않음
		**/
		this.fireEvent("expand", {
			sType : "expand",
			elBlock : this._elBlock,
			nIndex : nIndex
		});
	},

	/**
		아코디언 블럭 collapse 처리함수

		@method collapse
		@param {Number} nIndex 아코디언 블럭의 인덱스
	**/
	collapse : function(nIndex){
		this._elBlock = this._aAccordionBlock[nIndex];
		if(typeof this._elBlock == 'undefined'){ return;}

		/**
			Block이 축소(Collapse)되기 전에 발생

			@event beforeCollapse
			@param {String} sType 커스텀 이벤트명
			@param {Number} nIndex 축소(Collapse)처리할 Block의 인덱스
			@param {HTMLElement} elBlock 축소(Collapse)처리할 Block 엘리먼트
			@param {Function} stop 수행시 Block이 축소(Collapse)되지 않음
		**/
		if(!this.fireEvent("beforeCollapse", {
			sType : "beforeCollapse",
			elBlock : this._elBlock,
			nIndex : nIndex
		})){ return; }

		this._setTransition(this._elBlock, this._getHeaderSize(nIndex));
		if(this._nExpand == nIndex) { this._nExpand = -1; }

		/**
			Block이 축소(Collapse)된 후에 발생

			@event collapse
			@param {String} sType 커스텀 이벤트명
			@param {Number} nIndex 축소(Collapse)처리한 Block의 인덱스
			@param {HTMLElement} elBlock 축소(Collapse)처리한 Block 엘리먼트
			@param {Function} stop 수행시 Block이 축소(Collapse)되지 않음
		**/
		this.fireEvent("collapse", {
			sType : "collapse",
			elBlock : this._elBlock,
			nIndex : nIndex
		});
	},

	/**
		전체 Collapse 처리함수

		@method collapseAll
	**/
	collapseAll  : function(){
		var nIndex = this.getExpandIndex();

		if(nIndex > -1){
			this.collapse(nIndex);
		}

		this._nExpand = -1;
	},

	/**
		Effect 설정함수

		@method setEffect
		@param {Object} htEffect 이펙트 옵션
			@param {String} htEffect.sTransitionTimingFunction Effect Type (ease|linear|ease-in|ease-out|ease-in-out)
			@param {Number} htEffect.nDuration Effect 처리시간(단위 ms)
	**/
	setEffect : function(htEffect) {
		if(htEffect.sTransitionTimingFunction && (htEffect.sTransitionTimingFunction == "ease" || htEffect.sTransitionTimingFunction == "linear" || htEffect.sTransitionTimingFunction == "ease-in" || htEffect.sTransitionTimingFunction == "ease-out" || htEffect.sTransitionTimingFunction == "ease-in-out")) {
			this.option("sTransitionTimingFunction", htEffect.sTransitionTimingFunction);
		}

		if(htEffect.nDuration && htEffect.nDuration > 0) {
			this.option("nDuration", htEffect.nDuration);
		}
	},

	/**
		아코디언 블럭의 Expand/Collapse 처리시 Effect 처리함수

		@param {HTMLElement} elBlock 아코디언 블럭 엘리먼트
		@param {Number} nBlockSize 아코디언 블럭 사이즈
		@param {String} sTransitionTimingFunction Effect Type (ease|linear|ease-in|ease-out|ease-in-out)
		@param {Number} nDuration Effect 처리시간(단위 ms)
	**/
	_setTransition : function(elBlock, nBlockSize, sTransitionTimingFunction, nDuration){
		sTransitionTimingFunction = sTransitionTimingFunction || this.option("sTransitionTimingFunction");
		nDuration = nDuration || this.option("nDuration");

		if(nDuration > 0){
			this._attachTransitionEnd(elBlock);
		}

		var sTransition = "";
		var sDirection = this.option("sDirection");
		elBlock.style.webkitTransition = "";
		elBlock.style.mozTransition = "";

		if(sDirection === "vertical") {
			sTransition  = "height " + nDuration + "ms " + sTransitionTimingFunction;
			elBlock.style.webkitTransition = sTransition;
			elBlock.style.mozTransition = sTransition;
			elBlock.style.height = nBlockSize + "px";
		} else if(sDirection === "horizontal") {
			sTransition  = "width " + nDuration + "ms " + sTransitionTimingFunction;
			elBlock.style.webkitTransition = sTransition;
			elBlock.style.mozTransition = sTransition;
			elBlock.style.width = nBlockSize + "px";
		}

		if(nDuration === 0) {
			this._onTransitionEnd({srcElement: elBlock});
		}
	},

	/**
		아코디언 블럭의 Expand/Collapse 처리시 Effect 처리 종료함수
	**/
	_attachTransitionEnd : function(elBlock){
		this._elTransition = elBlock;
		this._elTransition.addEventListener('webkitTransitionEnd', this._wfTransitionEnd, false);
	},

	/**
	 * Effect 처리와 관련된 이벤트 해제 처리함수
	 */
	_detachTransitionEnd : function(el){
		el.removeEventListener('webkitTransitionEnd', this._wfTransitionEnd, false);
		this._elTransition = null;

	},

	/**
	 * TransitionEnd 이벤트 핸들러
	 */
	_onTransitionEnd : function(evt){

		//리랜더링을 하게 끔..
		var elDummyTag = jindo.$$.getSingle("._accordion_dummy_atag_", this._elContainer);
		if(elDummyTag){
			elDummyTag.focus();
		}

		this._detachTransitionEnd(evt.srcElement);

	},

	/**
		객체를 release 시킨다.

		@method destroy
	**/
	destroy : function() {
		this._detachEventAll();

		this._elContainer = null;
		this._aAccordionBlock = null;
		this._elBlock = null;
		this._htBlockSize = null;
		this._nExpand = null;
	}
}).extend(jindo.m.UIComponent);
