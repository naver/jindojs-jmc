/**
	@fileOverview Form Element의 Textarea를의 입력값의 변화를 감지하여 자동으로 높이값을 증가시키는 컴포넌트
	@author sshyun
	@version #__VERSION__#
	@since 2011. 9. 21.
**/
/**
	Form Element의 Textarea를의 입력값의 변화를 감지하여 자동으로 높이값을 증가시키는 컴포넌트

	@class jindo.m.TextArea
	@extends jindo.m.UIComponent
	@keyword textArea
	@group Component

	@history 1.2.0 Release nMaxHeight 값 설정시. expand 이벤트 미발생 문제 수정
	@history 1.3.0 Update [bUseAutoHeight] Option 추가
	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 0.9.5 Bug Android에서 focus시 커스텀 이벤트가 2번 발생하는 문제 해결
	@history 0.9.5 Bug Android에서 blur시 커스텀 이벤트가 2번 발생하는 문제 해결
	@history 0.9.0 Release 최초 릴리즈
**/
jindo.m.TextArea = jindo.$Class({
	/* @lends jindo.m.TextArea.prototype */
	/**
	초기화 함수
		@constructor
		@param {Varient} el textarea 엘리먼트 또는 ID
		@param {Object} [htOption] 초기화 옵션 객체
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
			@param {String} [htOption.sClassPrefix="fta-"] Class의 prefix명
			@param {Boolean} [htOption.bUseRadius=false] Check Box 영역의 모서리 라운드 효과 여부
			@param {String} [htOption.sRadiusSize="0.5em"] Check Box 영역의 모서리 라운드 크기
			@param {Boolean} [htOption.bUseAutoHeight=false] Textarea height 텍스트 크기에 맞게 자동 감소, 증가하는 기능 사용여부
			@param {Number} [htOption.nExpandHeight=30] Textarea height 증가 크기.(px 단위)
			@param {Number} [htOption.nMaxHeight=-1] Textarea 최대 height 크기 .(px 단위), 기본값 : -1(무한대)
	**/
	$init : function(el, htOption) {
		this.option({
			bActivateOnload : true,
			sClassPrefix	: "fta-",
			bUseRadius 		: false,
			sRadiusSize		: "0.5em",
			bUseAutoHeight  : false,
			nExpandHeight	: 30,
			nMaxHeight		: -1
		});
		this.option(htOption || {});
		this._initVar();
		this._setWrapperElement(el);
		// 코너 곡선 여부 추가.
		if(this.option("bUseRadius")){
			this._applyRadiusStyle(this.option("sRadiusSize"));
		}
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},

	/**
		jindo.m.TextArea 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar : function() {
		this._bTouchTextArea = false;
		this._touchMoved = false;
		this._sBeforeValue = "";
		this._nInitHeight = -1;
	},

	/**
		jindo.m.TextArea 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
		@param {Varient} el textarea 엘리먼트 또는 ID
	**/
	_setWrapperElement : function(el) {
		this._htWElement = {};
		var sPrefix = this.option('sClassPrefix');
		el = (typeof el == "string" ? jindo.$(el) : el);
		this._htWElement["textarea"] = jindo.$Element(el);
		this._nInitHeight = this._htWElement["textarea"].height();
	},
	/**
		테두리 라운드 효과 설정.
		@param {String} sRadius 곡선 Radius 값.
	**/
	_applyRadiusStyle : function(sRadius){
		var sCssName = jindo.m.getCssPrefix() + "BorderRadius";
		var oCssProperty = {
			sCssName : sRadius,
			"borderRadius" : sRadius
		};
		this._htWElement["textarea"].css(oCssProperty);
	},

	/**
		jindo.m.TextArea 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		this._attachEvent();
	},
	/**
		jindo.m.TextArea 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEvent();
	},
	/**
		jindo.m.TextArea 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		this._htEvent = {};
		var elTextArea = this._htWElement["textarea"].$value();
		this._htEvent["textarea_focus"] = {
			el  : elTextArea,
			ref : jindo.$Fn(this._onFocus, this).attach( elTextArea, "focus")
		};
		this._htEvent["textarea_blur"] = {
			el  : elTextArea,
			ref : jindo.$Fn(this._onBlur, this).attach( elTextArea, "blur")
		};
		
		this._htEvent["textarea_input"] = {
            el  : elTextArea,
            ref : jindo.$Fn(this._checkHeightAndExpand, this).attach( elTextArea, "input")
        };

	},

	/**
		jindo.m.TextArea 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEvent : function() {
		for(var p in this._htEvent) {
			var ht = this._htEvent[p];
			ht.ref.detach(ht.el, p.substring(p.lastIndexOf("_")+1));
		}
		this._htEvent = null;
	},
	/**
		TextArea 에 Focus 이벤트 처리.
		@param {Object} we 이벤트 객체.
	**/
	_onFocus : function(we){
		this._htWElement["textarea"].addClass(this.option('sClassPrefix') + "textarea-focus");

		/**
			Textarea 에 포커스가 일어 날 때 발생.

			@event focus
			@param {String} sType 커스텀 이벤트명
			@param {Element} elTextArea Textarea 엘리먼트
		**/
		this.fireEvent("focus",{
			elTextArea : this._htWElement["textarea"].$value()
		});
	},
	/**
		TextArea 에 Blur 이벤트 처리.
		@param {Object} we 이벤트 객체.
	**/
	_onBlur : function(we){
		this._htWElement["textarea"].removeClass(this.option('sClassPrefix') + "textarea-focus");

		/**
			Textarea 에 포커스가 없어질 때 발생.

			@event blur
			@param {String} sType 커스텀 이벤트명
			@param {Element} elTextArea Textarea 엘리먼트
		**/
		this.fireEvent("blur",{
			elTextArea : this._htWElement["textarea"].$value()
		});
	},
	/**
		텍스트 영역의 높이가 적으면, 확장한다.
	**/
	_checkHeightAndExpand : function() {
		var sValue = this._htWElement["textarea"].$value().value;
		this._adjustHeight();
		if(sValue != this._sBeforeValue) {
			this._sBeforeValue = sValue;

			/**
				Textarea 값이 변경되었을 때 발생.

				@event change
				@param {String} sType 커스텀 이벤트명
				@param {Element} elTextArea Textarea 엘리먼트
			**/
			this.fireEvent("change",{
				elTextArea : this._htWElement["textarea"].$value()
			});
		}
	},

	/**
		입력 상자의 크기가 현재 까지 입력된 글의 내용을 스크롤 없이 보여주기 충분한지를 체크한다.
		@private
	**/
	_adjustHeight : function() {
		var elTextArea = this._htWElement["textarea"].$value(),
			nLength = this.option("nExpandHeight"),
			nClientHeight = elTextArea.clientHeight,
			nHeight = elTextArea.scrollHeight,
			nMaxHeight = this.option("nMaxHeight"),
			nBeforeLength = this._sBeforeValue.split("\n").length,
			nCurrentLength = elTextArea.value.split("\n").length,
			nTextHeight = parseInt(this._htWElement["textarea"].css("line-height"),10),
			nNextHeight = 0;

		if( nBeforeLength > nCurrentLength) {	// 값의 축소
			if(this.option("bUseAutoHeight")) {
				nNextHeight = (nTextHeight * nCurrentLength);
				if(nMaxHeight != -1 && nNextHeight > nMaxHeight) {
					return;
				}
				if(this._nInitHeight <= nNextHeight) {
					elTextArea.style.height = nNextHeight + "px";
				} else {
					elTextArea.style.height = this._nInitHeight + "px";
				}
			}
		} else if( nBeforeLength < nCurrentLength) {	// 값의 확대
			if(this.option("bUseAutoHeight") && nHeight > nClientHeight) {
				nNextHeight = (nHeight + nLength);
				if(nMaxHeight == -1 || nNextHeight <= nMaxHeight ) {
					elTextArea.style.height = nNextHeight + "px";

					/**
						Textarea 에 여러줄이 입력되어 높이가 늘어날 때 발생.

						@event expand
						@param {String} sType 커스텀 이벤트명
						@param {Element} elTextArea Textarea 엘리먼트
					**/
					this.fireEvent("expand",{
						elTextArea : this._htWElement["textarea"].$value()
					});
				} else if(nMaxHeight == -1 || nNextHeight > nMaxHeight ) {
					if(nHeight != nMaxHeight) {
						elTextArea.style.height = nMaxHeight + "px";
						this.fireEvent("expand",{
							elTextArea : this._htWElement["textarea"].$value()
						});
					}
				}
			}
		}
	},

	/**
		입력 상자의 높이를 늘인다.
		@private
	**/
	_expandHeight : function() {
		var elTextArea = this._htWElement["textarea"].$value(),
			nMaxHeight = this.option("nMaxHeight"),
			nExpandHeight = this.option("nExpandHeight"),
			nScrollHeight = parseInt(elTextArea.scrollHeight,10),
			nHeight = parseInt(elTextArea.style.height,10),
			nNewHeight = nScrollHeight + nExpandHeight;

		// MAX인 경우
		if(nMaxHeight > 0 && nHeight == nMaxHeight) {
			return;
		}
		if (nMaxHeight > 0 && nNewHeight > nMaxHeight) {
			elTextArea.style.height = nMaxHeight + "px";
			// console.log("최대값으로 지정...");
		} else {
			elTextArea.style.height = nNewHeight + "px";
			// console.log("확장~");
		}

	},

	/**
		TextArea 값을 반환.

		@method getValue
		@return {String} TextArea value 값
		@example
		    var sValue = oTextArea.getValue();
	**/
	getValue : function(){
		return this._htWElement["textarea"].$value().value;
	},
	/**
		TextArea 값을 입력.

		@method setValue
		@param {String} sValue TextArea value 값
		@example
			var sValue = "test";
			oTextArea.getValue(sValue);
	**/
	setValue : function(sValue){
		this._htWElement["textarea"].$value().value = sValue;
		this._checkHeightAndExpand();
	},
	/**
		TextArea 값을 지움.

		@method deleteValue
		@example
			oTextArea.deleteValue();
	**/
	deleteValue : function(){
		this._htWElement["textarea"].$value().value = "";
	},
	/**
		TextArea 활성화.

		@method enable
		@example
			oTextArea.enable();
	**/
	enable : function(){
		var elTextArea = this._htWElement["textarea"].$value();
		elTextArea.disabled = false;
		this._htWElement["textarea"].removeClass(this.option("sClassPrefix") + "textarea-disable");

		/**
			Textarea 가 활성화될 때 발생.

			@event enable
			@param {String} sType 커스텀 이벤트명
			@param {Element} elTextArea Textarea 엘리먼트
		**/
		this.fireEvent("enable",{
			elTextArea : elTextArea
		});
	},
	/**
		TextArea 비활성화.

		@method disable
		@example
			oTextArea.enable();
	**/
	disable : function(){
		var elTextArea = this._htWElement["textarea"].$value();
		elTextArea.disabled = true;
		this._htWElement["textarea"].addClass(this.option("sClassPrefix") + "textarea-disable");

		/**
			Textarea 가 비활성화 될 때 발생.

			@event disable
			@param {String} sType 커스텀 이벤트명
			@param {Element} elTextArea Textarea 엘리먼트
		**/
		this.fireEvent("disable",{
			elTextArea : elTextArea
		});
	},
	/**
		Textarea height 증가 크기값 설정

		@method setExpandHeigh
		@param {Number} nExpandHeight 증가 크기값
		@history 0.9.5 Update Method 추가
		@example
			oTextArea.setExpandHeight(50);
	**/
	setExpandHeight : function(nExpandHeight){
		this.option("nExpandHeight", nExpandHeight);
	},
	/**
		Textarea height 증가 크기값 반환

		@method getExpandHeight
		@return {Number} 증가 크기값
		@history 0.9.5 Update Method 추가
		@example
			var nExpandHeight = oTextArea.getExpandHeight();
	**/
	getExpandHeight : function(){
		return this.option("nExpandHeight");
	},
	/**
		Textarea height 최대 크기값 설정

		@method setMaxHeight
		@param {Number} nMaxHeight 최대 크기값
		@history 0.9.5 Update Method 추가
		@example
			oTextArea.setMaxHeight(200);
	**/
	setMaxHeight : function(nMaxHeight){
		this.option("nMaxHeight", nMaxHeight);
		var elTextArea = this._htWElement["textarea"].$value();
		var nScrollHeight = elTextArea.scrollHeight;

		if (nMaxHeight > 0 && nScrollHeight > nMaxHeight){
			elTextArea.style.height = nMaxHeight + "px";
		}
	},
	/**
		Textarea height 최대 크기값 반환

		@method getMaxHeight
		@return {Number} 최대 크기값
		@history 0.9.5 Update Method 추가
		@example
			var nMaxHeight = oTextArea.getMaxHeight();
	**/
	getMaxHeight : function(){
		return this.option("nMaxHeight");
	},
	/**
		jindo.m.TextArea 에서 사용하는 모든 객체를 release 시킨다.
		@method destroy
	**/
	destroy : function() {
		this.deactivate();

		for ( var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;


		this._bTouchTextArea = null;
		this._touchMoved = null;
	}
}).extend(jindo.m.UIComponent);