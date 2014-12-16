/**
    @fileOverview 특정 Layer에 애니메이션 효과를 적용하여 보여주거나, 숨기거나, 이동시키는 컴포넌트
    @author "oyang2"
    @version #__VERSION__#
    @since 2011. 12. 13.
**/
/**
    특정 Layer에 애니메이션 효과를 적용하여 보여주거나, 숨기거나, 이동시키는 컴포넌트

    @class jindo.m.LayerEffect
    @extends jindo.m.UIComponent
    @uses jindo.m.Morph
    @keyword layer, effect, animation, 레이어, 효과, 애니메이션
    @group Component
    
    @history 1.15.0 Bug LayerEffect 초기화시 element 참조 오류
    @history 1.10.0 Update LayerEffect 인터페이스 통일
    @history 1.10.0 Update Morph 연동 및 구조 개선
    @history 1.5.0 Update Window Phone8 지원
    @history 1.4.0 Update  iOS 6 지원
    @history 1.2.0 Update Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
    @history 1.1.0 Update Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
    @history 1.1.0 Bug slide시 옵션으로 거리값을 지정해도 설정되지 않던 문제 해결
    @history 0.9.0 Release 최초 릴리즈
**/

jindo.m.LayerEffect = jindo.$Class({
    /* @lends jindo.m.LayerEffect.prototype */
    /**
        초기화 함수

        @constructor
        @param {Object} [htOption] 초기화 옵션 객체
            @param {Number} [htOption.nDuration=250] 애니메이션 적용시간 (ms)
            @param {String} [htOption.fEffect=jindo.m.Effect.linear] 애니메이션에 사용되는 jindo.m.Effect 의 함수들
            @param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate() 수행여부
    **/
    $init : function(el, htUserOption) {
        
        this.option({
            nDuration : 250,
            fEffect : jindo.m.Effect.linear,
            bActivateOnload : true
        });
        
        this._initVar();
	if(arguments[0] && (typeof arguments[0] == "string" || arguments[0].nodeType == 1)){
            this.setLayer(el);
            this.option(htUserOption || {});
        }else{
            this.option(arguments[0] || {});
        }

        this._initTransition();

        if(this.option("bActivateOnload")) {
            this.activate();
        }
    },

    _htEffect :{
        'expand' : "jindo.m.ExpandEffect",
        'contract' : "jindo.m.ContractEffect",
        "fade" : "jindo.m.FadeEffect",
        "pop" : "jindo.m.PopEffect",
        "slide" : "jindo.m.SlideEffect",
        "flip" : "jindo.m.FlipEffect"
    },

    /**
        jindo.m.LayerEffect 에서 사용하는 모든 인스턴스 변수를 초기화한다.
    **/
    _initVar: function() {
        this._htEffectInstance  = {};
        this._htLayerInfo = {};
        this._htWElement = {}; //jindo.m.LayerEffect에서 사용하는 엘리먼트 참조
        this._htCurrentTask = {}; 
        
        this.bAndroid = jindo.m.getDeviceInfo().android;
        this.sClassHighligting = '_effct_hide_highlighting_tmp';
    },

    /**
        Transition 컴포넌트 생성
    **/
    _initTransition : function(){
        // console.log(this.option("fEffect"));
        this._oMorph = new jindo.m.Morph({
            "fEffect" : this.option("fEffect") || (this.option("sEffect") ? this._getEffect(this.option("sEffect")) : null),
            "bUseTransition" : jindo.m.useTimingFunction()
        });
    },
    
     
    _getEffect : function(sValue){
        var oEffect = jindo.m.Effect.cubicEaseInOut;
        // console.log(sValue);
        switch(sValue){
            case "linear" :
                oEffect = jindo.m.Effect.linear; break;
            case "ease" :
                oEffect = jindo.m.Effect.cubicEase; break;
            case "ease-in" :
                oEffect = jindo.m.Effect.cubicEaseIn; break;
            case "ease-out" :
                oEffect = jindo.m.Effect.cubicEaseOut; break;
            case "ease-in-out" :
                oEffect = jindo.m.Effect.cubicEaseInOut; break;
        }
        return oEffect;
    },

    /**
        sType에 해당하는 Effect의 인스턴스 생성한다.
        @param {String} sType
    **/
    _createEffect : function(sType){
        if(this._htEffect[sType] && !this._htEffectInstance[sType]) {

            //console.log("객체 생성 : new " +this._htEffect[sType] + "()" );
            try{
                this._htEffectInstance[sType] = eval("new " + this._htEffect[sType] + "()");
            }catch(e){
                //console.log(e);
            }

            this._htEffectInstance[sType].setLayerInfo(this._htLayerInfo);
        }
    },

    /**
        높이나 넓이값을 조정하여 레이어를 확대한다.
        @remark 현재 레이어가 안보이는 상태일 경우 레이어를 보이게 하고 애니메이션을 수행한다.

        @method expand
        @param {Object} htOption
        @example
            oLayerEffect.expand(
                el,                         // 이펙트가 적용될 엘리먼트
                direction,              // 'up', 'down', 'left', 'right' 설정 가능하며 기본값은 'down' 이다.
                {
                    nDuration : 500, //효과 애니메이션 적용시간 (ms)
                    nDistance : 100  //expand 될 수치 
            });
    **/
    // expand : function(htOption){
        // var sType = 'expand';
        // this._run(sType, htOption);
    // },

    /**
        높이나 넓이값을 조정하여 레이어를 축소한다
        @remrark 현재 레이어가 안보이는 상태일 경우 레이어를 보이게 하고 애니메이션을 수행한다.

        @method contract
        @param {Object} htOption
        @example
            oLayerEffect.contract(
                el,                         // 이펙트가 적용될 엘리먼트
                direction,              // 'up', 'down', 'left', 'right' 설정 가능하며 기본값은 'down' 이다.
                {
                    nDuration : 500 //효과 애니메이션 적용시간 (ms)
            });
    **/
    // contract : function(htOption){
        // var sType = 'contract';
        // this._run(sType, htOption);
    // },

    /**
        레이어의 투명도를 조정하여 숨기거나 보여준다.
        @remark fadeOut 이후에는 레이어를 감춘다.

        @method fade
        @param {Object} htOption
            @param {
        @example
            oLayerEffect.fade(
                el,                         // 이펙트가 적용될 엘리먼트
                direction,              // 'in' 또는 'out' 을 정할 수 있으며 기본값은 'in' 이다.
                {
                    nDuration : 500, //효과 애니메이션 적용시간 (ms)
                    nDistance : 1  //fade 될 opacity 수치 
            });
    **/
    // fade : function(htOption){
        // var sType = "fade";
        // //console.log('\\\\\\ Fade', htOption );
        // if(arguments[0].nodeType == 1){
            // this.setLayer(arguments[0]);
            // arguments[2].sDirection = arguments[1];
            // this._run(sType, arguments[2]);
        // }else{
            // this._run(sType, htOption);
        // }
//         
    // },

    /**
        scale 조정을 통해 pop 효과를 낸다.
        @remark
            popOut 이후에는 레이어를 감춘다.<br />
            - ios3의 경우 scale 값이 0이 아닌 0.1로 세팅합니다. <br />

        @method pop
        @param {Object} scale 조정을 통해 pop 효과를 낸다. popOut 이후에는 레이어를 감춘다.<br />
            - ios3의 경우 scale 값이 0이 아닌 0.1로 세팅합니다.<br />

        @example
            oLayerEffect.pop(
                el,                         // 이펙트가 적용될 엘리먼트
                direction,              // 'in', 'out' 설정 가능하며 기본값은 'in' 이다.
                {
                    nDuration : 500 //효과 애니메이션 적용시간 (ms)
            });
    **/
    // pop : function(htOption){
        // var sType = "pop";
//         
        // if(arguments[0].nodeType == 1){
            // this.setLayer(arguments[0]);
            // arguments[2].sDirection = arguments[1];
            // this._run(sType, arguments[2]);
        // }else{
            // this._run(sType, htOption);
        // }
//         
    // },

    /**
        레이어를 설정된 방향으로 움직인다

        @method slide
        @param {Object} htOption
        @example
            oLayerEffect.slide(
                el,                         // 이펙트가 적용될 엘리먼트
                direction,              // 'up', 'down', 'left', 'right' 설정 가능하며 기본값은 'left' 이다.
                {
                    nDuration : 500, //효과 애니메이션 적용시간 (ms)
                    nDistance : 100  //slide 될 수치 
            });
    **/
    // slide : function(htOption){
        // var sType = "slide";
        // if(arguments[0].nodeType == 1){
            // this.setLayer(arguments[0]);
            // arguments[2].sDirection = arguments[1];
            // this._run(sType, arguments[2]);
        // }else{
            // this._run(sType, htOption);
        // }
    // },

    /**
        레이어을 방향에 따라 뒤집는 효과를 낸다. (iOS 전용)

        @method flip
        @param{Object} htOption 레이어을 방향에 따라 뒤집는 효과를 낸다. (iOS 전용)
        @example
            oLayerEffect.flip(
                el,                         // 이펙트가 적용될 엘리먼트
                direction,              // 'up', 'down', 'left', 'right' 설정 가능하며 기본값은 'left' 이다.
                {
                    nDuration : 500, //효과 애니메이션 적용시간 (ms)
                    elBack : $("back")  // flip 이펙트 이후 뒷판 element 를 표현하고자 할때 추가한다.
            });
    **/
    // flip: function(htOption){
        // var sType = "flip";
        // this._run(sType, htOption);
    // },

    _createFunc : function(){
        var aFunc = ["slide", "pop", "flip", "fade", "expand", "contract"];
        for (var i = 0 , nFor = aFunc.length ; i < nFor ; i++ ){
            this[aFunc[i]] = (function(sFunc){
                return function(htOption){
                    var sType = sFunc;
		    if(typeof arguments[0] == "string" || arguments[0].nodeType == 1){
                        this.setLayer(arguments[0]);
                        var htSecondArg = arguments[2] || {}; 
                        htSecondArg.sDirection = arguments[1];
                        this._run(sType, htSecondArg);
                    }else{
                        this._run(sType, htOption);
                    }
                };
            })(aFunc[i]);
        }
    },

    /**
        현재 effect가 실행 여부를 리턴한다

        @method isPlaying
        @return {Boolean} 애니메이션 실행 여부
    **/
    isPlaying : function(){
        return this._oMorph.isPlaying();
    },

    /**
        커스텀 이벤트 발생
     */
    _fireCustomEvent : function(sType, htOption){
        return this.fireEvent(sType, htOption);
    },


    /**
        sType의 이펙트를 실행
        @param {String} sType
        @param {HashTabl}
     */
    _run : function(sType, htOption){
        if(!this._isAvailableEffect()){
            return;
        }

        this._createEffect(sType);

        if(typeof htOption === 'undefined'){
            htOption = {};
        }

        var oEffect = this._htEffectInstance[sType];

        var el = this.getLayer();
        var nDuration = (typeof htOption.nDuration  === 'undefined')? this.option('nDuration') : parseInt(htOption.nDuration,10);
        var htBefore = oEffect.getBeforeCommand(el, htOption);
        var htCommand = oEffect.getCommand(el, htOption);
        
        // Custom Event 발생시 적용하기 위함.
        this._htCurrentTask = htOption;
        this._htCurrentTask.elLayer = el;
        this._htCurrentTask.sTaskName = htCommand.sTaskName;
        this._htCurrentTask.nDuration = nDuration;
        
        //customEvent
        /**
            애니메이션 효과가 시작하기 직전 발생한다

            @event beforeEffect
            @param {String} sType 커스텀 이벤트명
            @param {HTMLElement} elLayer 애니메이션 효과가 적용된 레이어 엘리먼트
            @param {String} sEffect 적용할 애니메이션 효과 이름 , '-'을 구분한다. (fade-in, slide-left)
            @param {Number} nDuration 애니메이션 적용 시간(ms)
            @param {Function} stop 수행시 애니메이션 효과 시작되지 않는다.
        **/
        if(!this._fireCustomEvent("beforeEffect", {
            elLayer : el,
            sEffect :htCommand.sTaskName,
            nDuration :nDuration
        })){
            return;
        }

        //console.log('LAYER=------- , rund');

        if(htBefore){
            this._oMorph.pushAnimate(-1, [this.getLayer(), htBefore.htStyle]);
        }
        
        var self = this;
        if(htOption.sEffect){
            this._oMorph.pushCall(function(){
               this.option({
                   "fEffect" : self._getEffect(htOption.sEffect)
               });   
            });
        }

        nDuration = nDuration == 0 ? -1 : nDuration;
        
        this._oMorph.pushAnimate(nDuration, [this.getLayer(), htCommand.htStyle]);
        if(htCommand.fCallback){
            if(typeof htCommand.fCallback == 'function'){
                    this._oMorph.pushCall(function(){
                        htCommand.fCallback();   
                    });
            }else if(typeof htCommand.fCallback == 'object'){
                this._oMorph.pushAnimate(-1, [this.getLayer(), htCommand.fCallback.htStyle || {}]);
            }
        }

        this._oMorph.play();
    },

    /**
        el을 을 effect 대상 레이어로 설정한다.

        @method setLayer
        @param {HTMLElement} el 대상 레이어
    **/
    setLayer : function(el){
        this._htWElement["el"] = jindo.$(el);
        this._htWElement["wel"] = jindo.$Element(this._htWElement["el"]);
        var elFocus;
        //android 하이라이팅 문제로 인하여 엘리먼트 추가;
        if(!!this.bAndroid){
            elFocus = jindo.$$.getSingle('.'+this.sClassHighligting, this._htWElement['el']);

            if(!elFocus){
                var sTpl = '<a href="javascript:void(0)" style="position:absolute" class="'+this.sClassHighligting+'"></a>';
                elFocus = jindo.$(sTpl);
                this._htWElement['wel'].append(elFocus);
                elFocus.style.opacity = '0';
                elFocus.style.width= 0;
                elFocus.style.height= 0;
                elFocus.style.left = "-1000px";
                elFocus.style.top = "-1000px";
            }
        }

        this.setSize();
    },

    /**
        현재 이펙트를 멈춘다.
        @remark bAfter 가 true일 경우 이펙트 이후 상태로 멈추고, false 일경우 이펙트 이전 상태로 되돌린다.

        @method stop
        @param {Boolean} bAfter 이펙트 이후 상태로 멈출지 이전으로 되돌릴지 여부
    **/
    stop : function(bAfter){
        if(typeof bAfter === 'undefined'){
            bAfter = true;
        }
        if(this._oMorph){
            this._oMorph.pause(bAfter);
        }
    },

    /**
        현재 큐에 쌓여있는 모든 effect 실행을 삭제한다.
        @remark
            현재 이펙트가 실행중이면 중지하고 삭제한다.<br />
            bAfter 가 true일 경우 이펙트 이후 상태로 멈추고, false 일경우 이펙트 이전 상태로 되돌린다.

        @method clearEffect
        @param {Boolean} bAfter 이펙트 이후 상태로 멈출지 이전으로 되돌릴지 여부
        @history 1.1.0 Update Method 추가
    **/
    clearEffect : function(bAfter){
        if(this._oMorph){
            this.stop(bAfter);
            this._oMorph.clear();
        }
    },
    /**
        현재 레이어를 리턴한다.

        @method getLayer
        @return {HTMLElement} 현재 레이어
    **/
    getLayer : function(){
        return this._htWElement["el"];
    },

    /**
        레이어를 사이즈 및 CSS 정보를 설정한다.

        @method setSize
    **/
    setSize : function(){
        var elToMeasure = this._htWElement['el'].cloneNode(true);
        var welToMeasure = jindo.$Element(elToMeasure);
        welToMeasure.opacity(0);
        this._htWElement['wel'].after(welToMeasure);
        welToMeasure.show();

        this._htLayerInfo["nWidth"] = this._htWElement["wel"].width();
        this._htLayerInfo["nHeight"] = this._htWElement["wel"].height();

        welToMeasure.css({
            position : "absolute",
            top : "0px",
            left : "0px"
        });
        this._htLayerInfo['nMarginLeft'] = parseInt(welToMeasure.css('marginLeft'),10);
        this._htLayerInfo['nMarginTop'] = parseInt(welToMeasure.css('marginTop'),10);
        this._htLayerInfo['nMarginLeft']  = isNaN(this._htLayerInfo['nMarginLeft'] )? 0 : this._htLayerInfo['nMarginLeft'];
        this._htLayerInfo['nMarginTop'] = isNaN(this._htLayerInfo['nMarginTop'])? 0 : this._htLayerInfo['nMarginTop'];
        this._htLayerInfo['nOpacity'] = this._htWElement["wel"].opacity();
        this._htLayerInfo['sPosition'] = this._htWElement["wel"].css('position');
        var sDisplay = this._htWElement['wel'].css('display');

        sDisplay = ((sDisplay === 'none') || (sDisplay.length === 0))? 'block' : sDisplay;
        this._htLayerInfo['sDisplay'] = sDisplay;
        this._htLayerInfo['sClassHighligting'] = this.sClassHighligting;

        welToMeasure.leave();

        this._setEffectLayerInfo();

        //console.log('/////setSize', this._htLayerInfo);
    },

    /**
        레이어정보를 다시 설정한다.
     */
    _setEffectLayerInfo : function(){
        for(var p in this._htEffectInstance){
            this._htEffectInstance[p].setLayerInfo(this._htLayerInfo);
        }
    },
    /**
        transition end 이벤트 핸들러
     */
    _onTransitionEnd : function(oCustomEvent){
        if(this._htCurrentTask){
            /**
                애니메이션 효과가 종료된 직후 발생한다.

                @event afterEffect
                @param {String} sType 커스텀 이벤트명
                @param {HTMLElement} elLayer 애니메이션 효과가 적용된 레이어 엘리먼트
                @param {String} sEffect 적용할 애니메이션 효과 이름 , '-'을 구분한다. (fade-in, slide-left)
                @param {Number} nDuration 애니메이션 적용 시간(ms)
                @param {Function} stop stop를 호출하여 영향 받는 것은 없다.
            **/
            this._fireCustomEvent("afterEffect", {
                elLayer : this._htCurrentTask.elLayer,
                sEffect : this._htCurrentTask.sTaskName,
                nDuration : this._htCurrentTask.nDuration
            });
        }
    },

    /**
        transition stop 이벤트 핸들러
     */
    _onTransitionStop : function(oCustomEvent){
        if(oCustomEvent.sTaskName){
            /**
                애니메이션 효과가 stop 될때 발생한다.

                @event stop
                @param {String} sType 커스텀 이벤트명
                @param {HTMLElement} elLayer 애니메이션 효과가 적용된 레이어 엘리먼트
                @param {String} sEffect 적용할 애니메이션 효과 이름 , '-'을 구분한다. (fade-in, slide-left)
                @param {Number} nDuration 애니메이션 적용 시간(ms)
                @param {Function} stop 호출하여 영향 받는 것은 없다.
            **/
            this._fireCustomEvent("stop", {
                elLayer : this._htCurrentTask.elLayer,
                sEffect : this._htCurrentTask.sTaskName,
                nDuration : this._htCurrentTask.nDuration
            });
        }
    },

    /**
        현재 effect를 실행 시킬수 있는 상태인지 리턴한다
        @return {Boolean}
    **/
    _isAvailableEffect : function(){
        return this.isActivating();
    },

    /**
        jindo.m.LayerEffect 컴포넌트를 활성화한다.
        activate 실행시 호출됨
    **/
    _onActivate : function() {
        this._attachEvent();
        this._createFunc();
    },

    /**
        jindo.m.LayerEffect 컴포넌트를 비활성화한다.
        deactivate 실행시 호출됨
    **/
    _onDeactivate : function() {
        this._detachEvent();
    },


    /**
        jindo.m.LayerEffect 에서 사용하는 모든 이벤트를 바인드한다.
    **/
    _attachEvent : function() {
        this._htEvent = {};
        this._htEvent["end"] = jindo.$Fn(this._onTransitionEnd, this).bind();
        this._htEvent["stop"] = jindo.$Fn(this._onTransitionStop, this).bind();

        if(this._oMorph){
            this._oMorph.attach({
                "end" : this._htEvent["end"],
                "stop" : this._htEvent["stop"]
            });
        }
    },

    /**
        jindo.m.LayerEffect 에서 사용하는 모든 이벤트를 해제한다.
    **/
    _detachEvent : function() {
        this._htEvent = null;

        // if(this._oMorph){
            // this._oMorph.detachAll();
        // }
    },

    /**
        jindo.m.LayerEffect 에서 사용하는 모든 객체를 release 시킨다.
        @method destroy
    **/
    destroy: function() {
        this.deactivate();

        for(var p in this._htWElement) {
            this._htWElement[p] = null;
        }
        this._htWElement = null;

    }
}).extend(jindo.m.UIComponent);


