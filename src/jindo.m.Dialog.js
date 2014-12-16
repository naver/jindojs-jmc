/**
	@fileOverview 사용자 대화창을 생성하는 컴포넌트
	@author icebelle
	@version #__VERSION__#
	@since 2011. 8. 5
**/
/**
	사용자 대화창을 생성하는 컴포넌트

	@class jindo.m.Dialog
	@extends jindo.m.UIComponent
	@uses jindo.m.LayerEffect, jindo.m.SlideEffect, jindo.m.PopEffect, jindo.m.FlipEffect {0,}
	@keyword dialog, 다이얼로그, 대화상자
	@group Component
	
  @history 1.8.0 Scroll 컴포넌트와 z-index 충돌로 Scroll component z-index 값(2000) 보다 상향 조정(2050)
  @history 1.6.0 Bug 안드로이드 ics에서 화면전환시 사이즈 못맞추는 버그 해결
	@history 1.3.0 Update [sDialogColor] Option 추가
	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 0.9.0 Release 최초 릴리즈
**/

jindo.m.Dialog = jindo.$Class({
	/* @lends jindo.m.Dialog.prototype */
	/**
		초기화 함수

		@constructor
		@param {Object} [htOption] 초기화 옵션 객체
			Dialog에 적용될 Class의 prefix명
			layer와 각 버튼에 prefix+"명칭" 으로 클래스가 구성된다
			@param {String} [htOption.bActivateOnload=true]
			@param {String} [htOption.sClassPrefix="dialog-"]
			@param {String} [htOption.sPosition="center"] Dialog 레이어가 보여질 위치
			<ul>
			<li>"top" : 화면 상단중앙</li>
			<li>"center" : 중앙</li>
			<li>"bottom" : 화면 하단중앙</li>
			<li>"all" : 화면 전체</li>
			</ul>
			@param {Boolean} [htOption.bUseEffect=true] Dialog 레이어가 보여질때 Effect(pop)효과 사용여부
			@param {Boolean} [htOption.bAutoClose=false] Dialog이외의 영역에 클릭(터치)발생시 Dialog 자동닫힘 사용여부
			@param {Boolean} [htOption.bAutoReposition=true] 리사이즈 발생시 Dialog위치 자동재설정 사용여부
			@param {String} [htOption.sFoggyColor="gray"] Foggy레이어 색상
			@param {Number} [htOption.nFoggyOpacity=0.5] Foggy레이어 투명도 (0~1)
			@param {String} [htOption.sEffectType="pop"] 이펙트 종류
			<ul>
			<li>"slide-up" : "slide-up"으로 보여지고, "slide-down"으로 사라짐</li>
			<li>"slide-down" : "slide-down"으로 보여지고, "slide-up"으로 사라짐</li>
			<li>"flip" : "flip"으로 보여지고, 사라짐(iOS전용)</li>
			</ul>
			@param {Number} [htOption.nEffectDuration=500] 이펙트 지속시간(ms단위, 최소값100)
			@param {String} [htOption.sDialogColor="white"] Dialog 레이어의 백그라운드 컬러
	**/
	$init : function(htOption) {
		//console.log("$init")
		var htDefaultOption = {
			bActivateOnload : true,
			sClassPrefix : "dialog-",
			sPosition : "center",
			bUseEffect : true,
			bAutoClose : false,
			bAutoReposition : true,
			sFoggyColor : "gray",
			nFoggyOpacity : 0.5,
			sEffectType : "pop",
			nEffectDuration : 500,
			sDialogColor : "white"
		};
		this.option(htDefaultOption);
		this.option(htOption || {});

		this._setWrapperElement();
		this._initVar();
		this._setDeviceSize();
		this._initElement();

		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},

	/**
		jindo.m.Dialog 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
	**/
	_setWrapperElement : function() {
		this._htWElement = {};
		this._htWElement["dialog_container"] =  jindo.$Element('<div class="' + this.option("sClassPrefix") + 'container"></div>');
		this._htWElement["dialog_foggy"] =  jindo.$Element('<div class="' + this.option("sClassPrefix") + 'fog"></div>');
		this._htWElement["dialog_layer"] =  jindo.$Element('<div class="' + this.option("sClassPrefix") + 'layer"></div>');
		this._htWElement["dialog_clone"] =  jindo.$Element('<div class="' + this.option("sClassPrefix") + 'clone"></div>');
	},

	/**
		인스턴스 변수를 초기화한다.
	**/
	_initVar : function() {
		this._htDialogSize = {
			width : 0,
			height : 0
		};

		this._sTemplate = null;
		this._bIsShown = false;
		this._bProcessingShow = false;
		this._bProcessingHide = false;
		this._htDeviceInfo = jindo.m.getDeviceInfo();
		this._bIOS = (this._htDeviceInfo.iphone || this._htDeviceInfo.ipad) ? true : false;
		this._bIsRenderBug = true; //ios와 android 모두 화면 전환시에 dialog창을 토글 시킨 상태에서 화면 크기를 맞춤
		this._bAndroid = this._htDeviceInfo.android ? true : false;
	},

	/**
		디바이스의 View영역 사이즈를 구한다.
	**/
	_setDeviceSize : function() {
		if (this._bIOS || (this._bAndroid) || !jindo.$Agent().navigator().mobile) {
			this._htDeviceSize = jindo.$Document().clientSize();
		} else {
			this._htDeviceSize = {
				width : window.screen.width,
				height : window.screen.height
			};
		}
	},

	/**
		다이얼로그 컨테이너의 초기위치를 설정한다.
	**/
	_initContainerTop : function() {
		//console.log("_initContainerTop")
		var nTop = 0;
		var bUseEffect = this.option("bUseEffect");
		var sEffectType = this.option("sEffectType");

		if(bUseEffect && (sEffectType == "slide-up" || sEffectType == "slide-down")) {
			// 슬라이드 효과일경우 화면 상단/하단에 위치하도록 설정한다.
			nTop = this._htDeviceSize.height * ((sEffectType == "slide-up") ? 1 : -1);
		}
		// 페이지가 스크롤된 만큼 보정처리한다.
		nTop += window.pageYOffset;

		this._htWElement["dialog_container"].css("top", nTop + "px");
	},

	/**
		Element를 초기화한다.
	**/
	_initElement : function() {
		// 포그레이어 초기화
		this._htWElement["dialog_foggy"].css({
			position : "absolute",
			padding : "0px",
			margin : "0px",
			border : "0px",
			backgroundColor : this.option("sFoggyColor"),
			opacity : this.option("nFoggyOpacity"),
			width : this._htDeviceSize.width + "px",
			height : this._htDeviceSize.height + "px",
			left : "0px",
			top : "0px"
		});
		this._htWElement["dialog_foggy"].appendTo(this._getContainer());

		// 다이얼로그 창 초기화
		this._htWElement["dialog_layer"].css({
			position : "relative",
			backgroundColor : this.option('sDialogColor')
		});
		this._htWElement["dialog_layer"].appendTo(this._getContainer());

		// 다이얼로그 컨테이너 초기화
		this._htWElement["dialog_container"].css({
			position : "absolute",
			overflow : "hidden",
			width : this._htDeviceSize.width + "px",
			height : this._htDeviceSize.height + "px",
			left : "0px",
			zIndex : 2050 // Scroll 컴포넌트의 z-index 보다 높게 처리 
		});
		this._initContainerTop();
		this._htWElement["dialog_container"].hide();
		this._htWElement["dialog_container"].appendTo(document.body);

		if(this.option("bUseEffect")) {
			this._oLayerEffect = new jindo.m.LayerEffect(this._getContainer());
		}

		// 다이얼로그 클론창 초기화
		this._htWElement["dialog_clone"].css({
			position : "absolute",
			left : "-1000px",
			top : "-1000px"
		});
		this._htWElement["dialog_clone"].appendTo(document.body);
		this._htWElement["dialog_clone"].hide();
	},

	/**
		jindo.m.Dialog 컴포넌트를 활성화한다.
	**/
	_onActivate : function() {
		this._attachEvent();
	},

	/**
		jindo.m.Dialog 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEventAll();
	},

	/**
		jindo.m.Dialog 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		this._htEvent = {};
		/*this._htEvent["click"] = {
			ref : jindo.$Fn(this._onClick, this).attach(this._getContainer(), "click"),
			el	: this._getContainer()
		};*/

		// click event 처리
		this._htEvent["click"] = {
			ref : jindo.$Fn(this._onClick, this).attach(this.getDialog(), "click"),
			el	: this.getDialog()
		};

		this._htEvent["touchend"] = {
			ref : jindo.$Fn(this._onClick, this).attach(this._getFoggy(), "touchend"),
			el	: this._getFoggy()
		};

		/*
		this._htEvent["touchstart"] = {
			ref : jindo.$Fn(this._onTouchStart, this).attach(this._getContainer(), "touchstart"),
			el	: this._getContainer()
		};*/

		// 스크롤 방지 처리
		this._htEvent["touchmove"] = {
			ref : jindo.$Fn(this._onTouchMove, this).attach(this._getContainer(), "touchmove"),
			el	: this._getContainer()
		};

		/*
		this._htEvent["touchmove"] = {
			ref : jindo.$Fn(this._onTouchMove, this).attach(document, "touchmove"),
			el	: document
		};*/

		// 리사이즈 처리
		if (this.option("bAutoReposition")) {
			this._htEvent["rotate"] = jindo.$Fn(this._onResize, this).bind();
			jindo.m.bindRotate(this._htEvent["rotate"]);
		}
	},

	/**
		특정 이벤트를 해제한다.
		@param {String} sEventKey 이벤트 키
	**/
	_detachEvent : function(sEventKey) {
		if(sEventKey) {
			var htTargetEvent = this._htEvent[sEventKey];
			if (htTargetEvent.ref) {
				htTargetEvent.ref.detach(htTargetEvent.el, sEventKey);
			}
		}
	},

	/**
		jindo.m.Dialog 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEventAll : function() {
		for(var p in this._htEvent) {
			this._detachEvent(p);
		}
		jindo.m.unbindRotate(this._htEvent["rotate"]);
		this._htEvent = null;
	},

	/**
		다이얼로그 레이어 내부에서 닫기, 확인, 취소 버튼을 처리하기위한 핸들러
		@param {jindo.$Event} we 랩핑된 이벤트객체
	**/
	_onClick : function(we) {
		var sClassPrefix = this.option("sClassPrefix");
		var elClosestClose, elClosestConfirm, elClosestCancel, elClosestLayer, elClosestAnchor;

		if ((elClosestClose = jindo.m.getClosest(("." + sClassPrefix + "close"), we.element))) {

			/**
				닫기 버튼(dialog-close)이 눌렸을 경우에 발생

				@event close
				@param {String} sType 커스텀 이벤트명
				@param {HTMLElement} elLayer 다이얼로그 Element
			**/
			if(this.fireEvent("close", {
				sType : "close",
				elLayer : this.getDialog()
			})) {
				this.hide();
			}
		} else if ((elClosestConfirm = jindo.m.getClosest(("." + sClassPrefix + "confirm"), we.element))) {

			/**
				확인 버튼(dialog-confirm)이 눌렸을 경우에 발생

				@event confirm
				@param {String} sType 커스텀 이벤트명
				@param {HTMLElement} elLayer 다이얼로그 Element
			**/
			if(this.fireEvent("confirm", {
				sType : "confirm",
				elLayer : this.getDialog()
			})) {
				this.hide();
			}
		} else if ((elClosestCancel = jindo.m.getClosest(("." + sClassPrefix + "cancel"), we.element))) {

			/**
				취소 버튼(dialog-cancel)이 눌렸을 경우에 발생

				@event cancel
				@param {String} sType 커스텀 이벤트명
				@param {HTMLElement} elLayer 다이얼로그 Element
			**/
			if (this.fireEvent("cancel", {
				sType : "cancel",
				elLayer : this.getDialog()
			})) {
				this.hide();
			}
		} else if ((elClosestLayer = jindo.m.getClosest(("." + sClassPrefix + "layer"), we.element))) {
			// 다이얼로그 안쪽영역 클릭
			if ((elClosestAnchor = jindo.m.getClosest(("a"), we.element))) {
				// 링크가 클릭된 경우
				return false;
			}
		} else {
			// 다이얼로그 외 바깥영역 클릭
			if(this.option("bAutoClose")) { this.hide(); }
		}
		we.stop();
		return false;
	},

	/**
		터치스타트 이벤트를 처리하기위한 핸들러 - 롱탭/하이라이팅 막기
		@param {jindo.$Event} we 랩핑된 이벤트객체
	**/
	_onTouchStart : function(we) {
		var sClassPrefix = this.option("sClassPrefix");
		var elClosestLayer;
		if (!(elClosestLayer = jindo.m.getClosest(("." + sClassPrefix + "layer"), we.element))) {
			we.stop(jindo.$Event.CANCEL_ALL);
			return false;
		}
	},

	/**
		터치무브 이벤트를 처리하기위한 핸들러 - 스크롤 막기
		@param {jindo.$Event} we 랩핑된 이벤트객체
	**/
	_onTouchMove : function(we) {
		we.stop(jindo.$Event.CANCEL_ALL);
		return false;
	},

	/**
		리사이즈를 처리하기위한 핸들러
		@param {jindo.$Event} we 랩핑된 이벤트객체
	**/
	_onResize : function(we) {
		// Show/Hide를 처리하는 중에 리사이즈 발생시
		if(this._bProcessingShow || this._bProcessingHide) {
			if(this.option("bUseEffect")) {
				this._getLayerEffect().stop();
			} else {
				if(this._bProcessingShow) {
					this._endShowEffect();
				} else {
					this._endHideEffect();
				}
			}
		}

		if(this._oTimeout) {
			clearTimeout(this._oTimeout);
			this._oTimeout = null;
		}
		if (this.isShown() && this._bIsRenderBug) {
			this._htWElement["dialog_container"].hide();
		}
		this._oTimeout = setTimeout(jindo.$Fn(function() {
			this._resizeDocument();

			if (this.isShown() && this._bIsRenderBug) {
				this._htWElement["dialog_container"].show();
			}
			
			if(this.option("bUseEffect")) {
                this._getLayerEffect().setSize();
            }
		}, this).bind(), 300);
	},

	/**
		리사이즈를 처리한다.
	**/
	_resizeDocument : function() {
		this._setDeviceSize();
		// Container Resize
		this._htWElement["dialog_container"].css({
			width : this._htDeviceSize.width + "px",
			height : this._htDeviceSize.height + "px"
		});
		// FogLayer Resize
		this._htWElement["dialog_foggy"].css({
			width : this._htDeviceSize.width + "px",
			height : this._htDeviceSize.height + "px"
		});
		
		// Dialog Resize
		this._resizeDialog(true);

		// LayerEffect Resize
		if(this.option("bUseEffect")) { this._getLayerEffect().setSize(); }
	},

	/**
		setTemplate등으로 다이얼로그가 수정되었을경우 다이얼로그의 리사이즈를 처리한다.
		@param (Boolean} bForced 무조건 _repositionDialog()를 수행할지 여부
	**/
	_resizeDialog : function(bForced) {
		//console.log("_resizeDialog")
		if(this._setDialogSize() || bForced) {
			// Dialog Reposition
			this._repositionDialog();
		}
	},
	/**
		생성된 LayerEffect 컴포넌트의 인스턴스를 가져온다.
		@return {jindo.m.LayerEffect} LayerEffect 컴포넌트의 인스턴스
	**/
	_getLayerEffect : function() {
		return this._oLayerEffect;
	},

	/**
		다이얼로그 컨테이너 엘리먼트를 반환한다.
		@return {HTMLElement} elDialogContainer 다이얼로그 컨테이너 엘리먼트
	**/
	_getContainer : function() {
		return this._htWElement["dialog_container"].$value();
	},

	/**
		Foggy 엘리먼트를 반환한다.
		@return {HTMLElement} Foggy 엘리먼트
	**/
	_getFoggy : function() {
		return this._htWElement["dialog_foggy"].$value();
	},

	/**
		다이얼로그 엘리먼트를 반환한다.

		@method getDialog
		@return {HTMLElement} elDialog 다이얼로그 엘리먼트
	**/
	getDialog : function() {
		return this._htWElement["dialog_layer"].$value();
	},

	/**
		다이얼로그 레이어에 대한 템플릿을 설정한다.
		@remark 다이얼로그 레이어의 내용을 동적으로 설정하기 위해 템플릿 형태로 설정한다.

		@method setTemplate
		@remark Jindo의 jindo.$Template 참고
		@param {String} sTemplate 템플릿 문자열
		@example
			oDialog.setTemplate('<div><a href="#" class="dialog-close"><img width="15" height="14" alt="레이어닫기" src="http://static.naver.com/common/btn/btn_close2.gif"/></a></div><div style="position:absolute;top:30px;left:10px;">{=text}</div><div style="position:absolute;bottom:10px;right:10px;"><button type="button" class="dialog-confirm">확인</button><button type="button" class="dialog-cancel">취소</button></div></div>');
	**/
	setTemplate : function(sTemplate) {
		this._sTemplate = sTemplate;
		this._oTemplate = jindo.$Template(this._sTemplate);


		this._htWElement["dialog_clone"].html(sTemplate);
		this._resizeDialog();
	},

	/**
		설정된 다이얼로그 레이어의 템플릿을 가져온다.

		@method getTemplate
		@return {String} sTemplate 설정된 템플릿 문자열
	**/
	getTemplate : function() {
		return this._sTemplate;
	},

	/**
		다이얼로그 레이어의 사이즈를 저장한다.
	**/
	_setDialogSize : function() {
		//console.log("_setDialogSize")
		var nLayerWidth;
		var nLayerHeight;
		if(this.option("sPosition") == "all") {
			// 다이얼로그 레이어의 사이즈를 디바이스 사이즈로 설정한다.
			nLayerWidth = this._htDeviceSize.width;
			nLayerHeight = this._htDeviceSize.height;
		} else {
			// 실제 다이얼로그 레이어의 사이즈를 구하기위해 클론을 사용한다.
			this._htWElement["dialog_clone"].show();
			nLayerWidth = Math.min(this._htWElement["dialog_clone"].width(), this._htDeviceSize.width);
			nLayerHeight = Math.min(this._htWElement["dialog_clone"].height(), this._htDeviceSize.height);
			this._htWElement["dialog_clone"].hide();
		}

		// 기존에 설정해놨던 사이즈와 동일할 경우 return false; 처리한다.
		if(this._htDialogSize.width == nLayerWidth && this._htDialogSize.height == nLayerHeight) {
			return false;
		}

		// 새로 구한 사이즈를 저장한다.
		this._htDialogSize = {
			width : nLayerWidth,
			height : nLayerHeight
		};

		// 다이얼로그 레이어의 사이즈를 설정한다.
		this._htWElement["dialog_layer"].css({
			width : nLayerWidth + "px",
			height : nLayerHeight + "px"
		});

		return this._htDialogSize;
	},

	/**
		다이얼로그 레이어의 사이즈를 반환한다.
		@return {Object} htDialogSize 다이얼로그 레이어 사이즈정보
	**/
	_getDialogSize : function() {
		return this._htDialogSize;
	},

	/**
		다이얼로그의 위치를 재계산한다.
	**/
	_repositionDialog : function() {
		//console.log("_repositionDialog")

		var htLayerPosition = this._getDialogPosition();
		this._htWElement["dialog_layer"].css({
			top : htLayerPosition.top + "px",
			left : htLayerPosition.left + "px"
		});

		this._htWElement["dialog_container"].css({
			top : window.pageYOffset + "px",
			left : window.pageXOffset + "px"
		});
		

		if(!this.isShown()) {
			var sEffectType = this.option("sEffectType");
			if(sEffectType == "slide-up" || sEffectType == "slide-down") {
				this._initContainerTop();
			}
		}
	},

	/**
		다이얼로그 레이어의 위치를 반환한다.
		@return {Object} htLayerPosition 다이얼로그 레이어 위치정보
	**/
	_getDialogPosition : function() {
		var nWidth = this._htDeviceSize.width;
		var nHeight = this._htDeviceSize.height;
		var nLayerWidth = this._getDialogSize().width;
		var nLayerHeight = this._getDialogSize().height;

		var htLayerPosition = {};
		switch(this.option("sPosition")) {
		case "top":
			htLayerPosition.top = 0;
			htLayerPosition.left = parseInt((nWidth - nLayerWidth) / 2, 10);
			break;
		case "center":
			htLayerPosition.top = parseInt((nHeight - nLayerHeight) / 2, 10);
			htLayerPosition.left = parseInt((nWidth - nLayerWidth) / 2, 10);
			break;
		case "bottom":
			htLayerPosition.top = parseInt(nHeight - nLayerHeight,10);
			htLayerPosition.left = parseInt((nWidth - nLayerWidth) / 2, 10);
			break;
		case "all" :
			htLayerPosition.top = 0;
			htLayerPosition.left = 0;
			break;
		}

		return htLayerPosition;
	},

	/**
		다이얼로그 레이어에 위치를 설정한다.

		@method setPosition
		@param {String} sPosition ("top"|"center"|"bottom"|"all")
	**/
	setPosition : function(sPosition) {
		if(sPosition == "top" || sPosition == "center" || sPosition == "bottom" || sPosition == "all") {
			this.option("sPosition", sPosition);
		}

		this._resizeDialog();
	},

	/**
		이펙트 사용을 설정한다.

		@method useEffect
	**/
	useEffect : function() {
		if(this.option("bUseEffect")) { return false; }
		this.option("bUseEffect", true);
		this._initContainerTop();
	},

	/**
		이펙트 효과를 없앤다.

		@method unuseEffect
	**/
	unuseEffect : function() {
		if(!this.option("bUseEffect")) { return false; }
		this.option("bUseEffect", false);
		this._initContainerTop();
	},

	/**
		이펙트 타입을 설정한다.

		@method setEffectType
		@param {String} sEffectType 이펙트 타입
	**/
	setEffectType : function(sEffectType) {
		this.useEffect();

		if(sEffectType == "pop" || sEffectType == "slide-up" || sEffectType == "slide-down" || sEffectType == "flip") {
			this.option("sEffectType", sEffectType);
			this._initContainerTop();
		}
	},

	/**
		이펙트 지속시간을 설정한다.

		@method setEffectDuration
		@param {Number} nEffectDuration 이펙트 지속시간 (ms단위)
	**/
	setEffectDuration : function(nEffectDuration) {
		this.useEffect();

		if(nEffectDuration && nEffectDuration > 99) {
			this.option("nEffectDuration", nEffectDuration);
		}
	},


	/**
		이펙트 효과를 설정한다.

		@method setEffect
		@param {Object} htEffectOption 이펙트 효과 정보(이펙트 종류, 시간)
	**/
	setEffect : function(htEffectOption) {
		this.useEffect();

		if(htEffectOption.type) {
			this.setEffectType(htEffectOption.type);
		}

		if(htEffectOption.duration) {
			this.setEffectDuration(htEffectOption.duration);
		}
	},

	/**
		다이얼로그 레이어가 보여지고 있는지 가져온다.

		@method isShown
		@return {Boolean} 다이얼로그 레이어의 노출여부
	**/
	isShown : function() {
		return this._bIsShown;
	},

	/**
		다이얼로그를 보여준다.

		@method show
		@param {Object} htTemplate 다이얼로그 템플릿 Text치환 정보
		@param {Object} htEventHandler 커스텀 이벤트 정보
	**/
	show : function(htTemplate, htEventHandler) {
		//console.log("show")
		if(this.isShown()) { return false; }

		this._bProcessingShow = true;

		// 다이얼로그가 보이는 동안에 스크롤을 막기
		this._htEvent["touchstart"] = {
			ref : jindo.$Fn(this._onTouchStart, this).attach(document, "touchstart"),
			el	: document
		};

		// custom event attach
		if(htEventHandler) {
			this._showAttachedEvent = htEventHandler;
			this.attach(htEventHandler);
		}

		// Dialog가 뜬 상태에서는 스크롤 불가처리
		this._resizeDocument();

		// Template처리
		if(typeof htTemplate == "undefined") {
			htTemplate = {};
		} else {
			this._htWElement["dialog_clone"].html(this._oTemplate.process(htTemplate));
			this._resizeDialog();
		}
		this._htWElement["dialog_layer"].html(this._oTemplate.process(htTemplate));

		/**
			Dailog가 보여지기 전에 발생

			@event beforeshow
			@param {String} sType 커스텀 이벤트명
			@param {HTMLElement} elLayer 다이얼로그 Element
			@param {Function} stop 수행시 다이얼로그가 Show되지 않음
		**/
		if(!this.fireEvent("beforeShow", {
			sType : "beforeShow",
			elLayer : this.getDialog()
		})) { return; }

		this._showDialogLayer();
	},

	/**
		이펙트 사용여부에 따라 분기처리한다.
	**/
	_showDialogLayer : function() {
		//console.log("_showDialogLayer")

		if(this.option("bUseEffect")) {
			this._getLayerEffect().attach("afterEffect", jindo.$Fn(this._endShowEffect, this).bind());
			this._startShowEffect();
		} else {
			// Effect 효과 없음
			this._htWElement["dialog_container"].show();
			this._endShowEffect();
		}
	},

	/**
		Show시 보여줄 이펙트효과를 시작한다.
	**/
	_startShowEffect : function() {
		//console.log("_startShowEffect")

		var sEffectType = this.option("sEffectType");
		var nEffectDuration = this.option("nEffectDuration");

		switch(sEffectType) {
		case "slide-up":
			this._htWElement["dialog_container"].show();
			this._getLayerEffect().setSize();
			this._getLayerEffect().slide({
				sDirection : "up",
				nDuration : nEffectDuration
			});
			break;
		case "slide-down":
			this._htWElement["dialog_container"].show();
			this._getLayerEffect().setSize();
			this._getLayerEffect().slide({
				sDirection : "down",
				nDuration : nEffectDuration
			});
			break;
		case "pop":
			this._getLayerEffect().pop({
				sDirection : "in",
				nDuration : nEffectDuration,
				htFrom : {opacity : 1}
			});
			break;
		case "flip":
			this._htWElement["dialog_container"].show();
			this._getLayerEffect().flip({
				nDuration : nEffectDuration,
				elFlipFrom : this._getContainer(),
				elFlipTo : this._getContainer(),
				htFrom : {opacity : 0},
				htTo : {opacity : 1}
			});
			//this._htWElement["dialog_container"].show();
			break;
		}
	},

	/**
		Show시 보여줄 이펙트효과를 끝낸다.
	**/
	_endShowEffect : function() {
		//console.log("_endShowEffect")

		if(this.option("bUseEffect")) { this._getLayerEffect().detachAll("afterEffect"); }

		/**
			Dailog가 보여진 후에 발생

			@event show
			@param {String} sType 커스텀 이벤트명
			@param {HTMLElement} elLayer 다이얼로그 Element
		**/
		this.fireEvent("show", {
			sType : "show",
			elLayer : this.getDialog()
		});

		this._bIsShown = true;
		this._bProcessingShow = false;
	},

	/**
		다이얼로그를 숨긴다.

		@method hide
	**/
	hide : function() {
		//console.log("hide")
		if(!this.isShown()) { return false; }

		this._bProcessingHide = true;

		/**
			Dailog가 숨겨지기 전에 발생

			@event beforeHide
			@param {String} sType 커스텀 이벤트명
			@param {HTMLElement} elLayer 다이얼로그 Element
			@param {Function} stop 수행시 다이얼로그가 Hide되지 않음
		**/
		if(!this.fireEvent("beforeHide", {
			sType : "beforeHide",
			elLayer : this.getDialog()
		})) { return; }

		this._hideDialogLayer();
	},

	/**
		이펙트 사용여부에 따라 분기처리한다.
	**/
	_hideDialogLayer : function() {
		//console.log("_hideDialogLayer")

		if(this.option("bUseEffect")) {
			this._getLayerEffect().attach("afterEffect", jindo.$Fn(this._endHideEffect, this).bind());
			this._startHideEffect();
		} else {
			// Effect 효과 없음
			this._htWElement["dialog_container"].hide();
			this._endHideEffect();
		}
	},

	/**
		Hide시 보여줄 이펙트효과를 시작한다.
	**/
	_startHideEffect : function() {
		//console.log("_startHideEffect")

		var sEffectType = this.option("sEffectType");
		var nEffectDuration = this.option("nEffectDuration");

		switch(sEffectType) {
		case "slide-up":
			this._getLayerEffect().slide({
				sDirection : "down",
				nDuration : nEffectDuration
			});
			break;
		case "slide-down":
			this._getLayerEffect().slide({
				sDirection : "up",
				nDuration : nEffectDuration
			});
			break;
		case "pop":
			this._getLayerEffect().pop({
				sDirection : "out",
				nDuration : nEffectDuration,
				htTo : {opacity : 0}
			});
			break;
		case "flip":
			this._getLayerEffect().flip({
				nDuration : nEffectDuration,
				elFlipFrom : this._getContainer(),
				elFlipTo : this._getContainer(),
				htTo : {opacity : 0}
			});
			break;
		}
	},

	/**
		Hide시 보여줄 이펙트효과를 끝낸다.
	**/
	_endHideEffect : function() {
		//console.log("_endHideEffect")

		if(this.option("bUseEffect")) { this._getLayerEffect().detachAll("afterEffect"); }

		/**
			Dailog가 숨겨진 후에 발생

			@event hide
			@param {String} sType 커스텀 이벤트명
			@param {HTMLElement} elLayer 다이얼로그 Element
		**/
		this.fireEvent("hide", {
			sType : "hide",
			elLayer : this.getDialog()
		});

		// custom event detach
		if(this._showAttachedEvent) {
			for(var evt in this._showAttachedEvent) {
				//console.log(evt)
				this.detachAll(evt);
			}
			this._showAttachedEvent = null;
		}

		// 다이얼로그가 보이는 동안에 스크롤을 막기 해제
		this._detachEvent("touchstart");

		this._htWElement["dialog_container"].hide();
		this._htWElement["dialog_container"].css("opacity", 1);

		if(window.pageYOffset || window.pageXOffset) {
			this._htWElement["dialog_container"].css({
				top : "0px",
				left : "0px"
			});
		}

		this._bIsShown = false;
		this._bProcessingHide = false;
	},

	/**
		객체를 release 시킨다.

		@method destroy
	**/
	destroy : function() {
		this._detachEventAll();

		if(this.option("bUseEffect")) {
			this._getLayerEffect().destroy();
			this._oLayerEffect = null;
		}

		this._htWElement["dialog_container"].leave();
		this._htWElement["dialog_clone"].leave();
		this._htWElement = null;
		this._htDeviceSize = null;
		this._htDialogSize = null;
		this._sTemplate = null;
		this._oTemplate = null;
		this._bIsShown = null;
		this._bProcessingShow = null;
		this._bProcessingHide = null;
		this._oTimeout = null;
		this._htDeviceInfo = null;
		this._bIOS = null;
		this._bIsRenderBug = null;
		this._bAndroid = null;
	}
}).extend(jindo.m.UIComponent);