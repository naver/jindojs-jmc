/**
	@fileOverview 엘리먼트의 css 스타일을 조정해 부드러운 움직임(변형)을 표현한다
	@author "oyang2"
	@version #__VERSION__#
	@since 2011. 12. 13.
**/
/**
	jindo.m.Transition 컴포넌트는 엘리먼트의 css 스타일을 조정해 부드러운 움직임(변형)을 표현한다

	@class jindo.m.Transition
	@extends jindo.m.Component
	@uses jindo.m.Morph
	@keyword transition, 트랜지션
	@group Component
    
	@history 1.9.0 Update jindo.m.Morph 기반으로 변경
	@history 1.3.0 Update {bUseCss3d} 옵션삭제
	@history 1.3.0 Update {bUseTimingFunction} 옵션추가
	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.2.0 Update {bUseCss3d} Option 추가
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 1.1.0 Update Android의 경우 translate호출시에 [css3+자바스크립트] 형식을 혼합해서 사용하는 형식으로 수정
	@history 1.1.0 Update 스크립트로 TimingFunction을 구현
	@history 1.0.0 Release 최초 릴리즈
**/
jindo.m.Transition = jindo.$Class({
	_aTaskQueue : null,

	/* @lends jindo.m.Transition.prototype */
	/**
		초기화 함수
		@constructor

		@param {Object} [htOption] 초기화 옵션 객체
			@param {String} [htOption.sTransitionTimingFunction='ease-in-out'] css Timeing function을 설정
			<ul>
			<li>ease : 속도가 급가속되다가 급감속되는 효과 (거의 끝에서 급감속됨)</li>
			<li>linear : 등속효과</li>
			<li>ease-in : 속도가 점점 빨라지는 가속 효과</li>
			<li>ease-out : 속도가 천천히 줄어드는 감속효과</li>
			<li>ease-in-out : 속도가 천천히 가속되다가 천천히 감속되는 효과 (가속과 감속이 부드럽게 전환됨)</li>
			</ul>
			@param {Function} [htOption.bUseTimingFunction=jindo.m._isUseTimingFunction()] translate 혹은 translate3d 속성을 css3의 TimingFunction을 사용할지 여부. <br /> false로 설정할 경우 자바스크립트의 setTimeout을 이용하여 애니메이션을 처리한다.
	**/
	$init : function(htOption) {
	    
		this.option({
			/**
				기본 속성 지정
				@to do
			**/
			sTransitionTimingFunction : 'ease-in-out',
			bUseTimingFunction : jindo.m._isUseTimingFunction()
		});
		
		this.option(htOption || {});
		
		var self = this;
	    this._oMorph = new jindo.m.Morph({
	        "bUseTransition" : this._htOption.bUseTimingFunction,
	        "fEffect" : this._getEffect(this.option("sTransitionTimingFunction"))
	    }).attach({
	        "end" : function(){
	            self._onTransitionEnd();
	        },
	        "pause" : function(){
	            self._onTransitionEnd();
	        }
	    });
	    
	    this._aTaskQueue = [];
	    this._bIsPlaying = false;
	    
		this._initVar();
	},

	/**
		jindo.m.Transition 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar: function() {
		this._aTaskQueue = [];
		this._bIsPlaying = false;
		this._sCssPrefix = jindo.m.getCssPrefix();

		this._aBeforeStatus = []; //transition 시작전 element의 style 상태를 저장한 배열

		if(this._sCssPrefix.length > 0){
			this._sCssPrefix = '-' + this._sCssPrefix.toLowerCase()+'-';
		}
		this._htCurrentTask = null;

		// this._bNoUseCss3d = !this.option('bUseTimingFunction');
		//안드로이드 전용 타이머.
		// this._nTimerAnimate = null;
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
		Transition 을 시작한다.
		@method start
	**/
	start : function(){
		if(!this._oMorph.isPlaying() && !this.isPlaying() && this.isExistTask()){
			this._prepareTask();
		}
	},

	/**
		현재 트랜지션이 진행중인지 리턴한다.

		@method isPlaying
		@return {Boolean} 현재 트랜지션이 진행중인지 여부
	**/
	isPlaying : function(){
		return this._bIsPlaying;
	},


	/**
		다음 진행할 트랜지션이 있는지 리턴한다.

		@method isExistTask
		@return {Boolean} 다음 진행할 트랜지션이 있는지 여부
	**/
	isExistTask : function(){
		if(!this._aTaskQueue){
			return false;
		}
		var nLen = this._aTaskQueue.length;
		var bValue = (nLen > 0)? true : false;

		return bValue;
	},

	/**
		Transition을 큐에 담는다.
		여러 단계의 Transition을 담아두고 순차적으로 실행시킬때 사용한다.
		@remark start() 메소드가 호출되기 전까지 수행되지 않는다.

		@method queue
		@param {HTMLElement} el 트랜지션 대상 에리먼트
		@param {Number} nDuration 트랜지션 수행 시간
		@param {Object} htCommand 적용할 명령 해시 테이블
		@return {this}
		@example 여러개의 명령을 지정하는 예제
			oTransition.queue(jindo.$('div1'),
					1000, {
						htStyle : {
							"left : "200px",
							"top" : "50px",
							"width" : "200px",
							"height" : "200px",
							"background-color" : "#CCC"
						}
					}
			);

		@example 여러개의 명령을 지정하는 예제(css3 명령 지정예제)
			oTransition.queue(jindo.$('div1'),
					1000, {
						htStyle : {
							"width" : "200px",
							"height" : "200px",
							"background-color" : "#CCC"
						},
						htTransform : {
							"transform" : "translate(100px,100px)"
						}
					}
			);

		@example 콜백함수를 지정하는 예제
			oTransition.queue(jindo.$('div1'),
					1000, {
						htStyle : {
							"width" : "200px",
							"height" : "200px",
							"background-color" : "#CCC"
						},
						htTransform : {
							"transform" : "translate(100px,100px)"
						},
						fCallback : function(){
							alert("트랜지션 끝");
						}
					}
			);
		@example 콜백에 스타일을 지정하는 예제
			oTransition.queue(jindo.$('div1'),
					1000, {
						htStyle : {
							"width" : "200px",
							"height" : "200px",
							"background-color" : "#CCC"
						},
						htTransform : {
							"transform" : "translate(100px,100px)"
						},
						fCallback : {
							htStyle : {
								"background-color" : "red"
							},
							htTransform : {
								"transform" : "rotate(30deg)"
							}
						}
					}
			);
	**/
	queue : function(elTarget, nDuration, aCommand){
		var htTask = {
			sType : 'style',
			sTaskName : '',
			elTarget : elTarget,
			nDuration : nDuration
		};

		htTask.htDefault = {};
		htTask.htStyle = aCommand.htStyle || {};
		htTask.htTransform = aCommand.htTransform || {};
		htTask.sTaskName = aCommand.sTaskName || null;
		htTask.fCallback =  aCommand.fCallback;
		
		var htTmpData = {};
		htTmpData = this._getTranslateStyle(aCommand.htStyle || {}, htTmpData);
		htTmpData = this._getTranslateStyle(aCommand.htTransform || {}, htTmpData);
		
		this._pushTask(nDuration, elTarget, htTmpData, htTask);
		return this;
	},

    _getTranslateStyle : function(htStyle, htReturn){
        var htData = htReturn || {};
        for ( var i in htStyle){
            htData["@"+i] = htStyle[i];
        }
        return htData;
    },
    
	/**
		현재 트랜지션을 중지한다. bAfter가 true이면 현재 트랜지션이 완료된 상태로 중지한다.<br />
		false 값이면 현재 트랜지션 이전 상태로 중지한다.

		@method stop
		@param {Boolean} bAfter
	**/
	stop : function(bAfter){
		//console.log('stop! ' + this._bIsPlaying);
		if(!this.isPlaying()){
			return;
		}
		//console.log('STOP!2 호출');
		if(typeof bAfter === 'undefined'){
			bAfter = true;
		}

		/**
			Transition의 stop 메소드를 통해 중지하였을 때 발생

			@event stop
			@param {String} sType 커스텀 이벤트명
			@param {String} sTaskName 사용자가 설정한 sTaskName. 설정한 값이 없을 경우 null값 반환
			@param {HTMLElement} element Transition 대상 엘리먼트
			@param {Number} nDuration Transiton이 수행되는 시간
			@param {Function} stop 수행시 Transition이 중지 되지 않고 그대로 실행된다.
		**/
		if(!this._fireCustomEvent('stop', {
			element : this._htCurrentTask.elTarget,
			sTaskName : this._htCurrentTask.sTaskName,
			nDuration : this._htCurrentTask.nDuration
		})){
			return;
		}

		this._stopTransition(bAfter);
	},

	/**
		현재 queue에 쌓여있는 모든 태스크를 삭제한다. 현재 트랜지션이 실행중이면 중지하고 삭제한다.
		@remark bStopAfter가 true이면 현재 트랜지션이 완료된 상태로 중지하고 false 값이면 현재 트랜지션 이전 상태로 중지한다.

		@method clear
		@param {Boolean} bStopAfter
		@history 1.1.0 Update Method 추가
	**/
	clear : function(bStopAfter){
		this.stop(bStopAfter);
		this._aTaskQueue = [];
		//console.log('TranslateCrear!');
	},

	/**
		현재 태스크를 재시작한다.
	**/
	_resume : function(){
		if(this._htCurrentTask){
			this._doTask();
		}
	},

	/**
		현재 진행중인 태스크를 중지한다. bAfter가 true 이면 태스크 이후의 설정으로 바꾸고 false 이면 태스크 전의 설정으로 바꿔준다.
		@param {Boolean} bAfter
	**/
	_stopTransition : function(bAfter){
        var nPause = 0;
		//transition 이전 상태로 되돌려야 할 경우
		if(!bAfter){
			//console.log(this._elCurrent);
			var nIndex = this._getBeforeStatusElement(this._elCurrent);
			if(nIndex > -1){
				//console.log(this._aBeforeStatus[nIndex].style);
				jindo.$Element(this._elCurrent).attr('style', this._aBeforeStatus[nIndex].style);
			}
		}else{
		    nPause = 1;
		}

		
        this._oMorph.pause(nPause);
		this._bIsPlaying = false;
		this._htCurrentTask = null;

	},

	/**
		진행할 태스크를 준비하고 실행한다.
	**/
	_prepareTask : function(){
		var htTask = this._popTask();

		if(htTask === null || !htTask){
		    this._oMorph.clear();
			this._bIsPlaying = false;
			return;
		}
		this._htCurrentTask = htTask;

		this._resume();
	},

	/**
		htTask를 queue에 추가 한다.
		@param {Object}
	**/
	_pushTask : function(nDuration, elTarget, htTransData, htTask){
		this._aTaskQueue.push({
		    "nDuration" : nDuration, 
		    "elTarget" : elTarget, 
		    "htTask" : htTransData,
		    "sTaskName" : htTask.sTaskName,
		    "fCallback" : htTask.fCallback
	    });
	},

	/**
		현재 queue 에저장된 작업에서 진행 해야 할 작업을 리턴한다,
		@return {HashTable | null}
	**/
	_popTask : function(){
		if(!this.isExistTask()){
			return null;
		}
		var htTask = this._aTaskQueue.shift();
		if(htTask){
			return htTask;
		}else{
			return null;
		}

	},

	/**
		현재 태스크를 실행한다.
	**/
	_doTask : function(){
		//console.log('//// doTask ' +this._htCurrentTask.sTaskName);
		if(this._htCurrentTask){
			this._bIsPlaying = true;
			/**
				Transition이 시작 될때 발생

				@event start
				@param {String} sType 커스텀 이벤트명
				@param {String} sTaskName 사용자가 설정한 sTaskName. 설정한 값이 없을 경우 null값 반환
				@param {HTMLElement} element Transition 대상 엘리먼트
				@param {Number} nDuration Transiton이 수행되는 시간
				@param {Function} stop 수행시 Transition이 실행되지 않는다. 전체 Transtion 실행도 멈춘다
			**/
			if(!this._fireCustomEvent('start', {
				element : this._htCurrentTask.elTarget,
				sTaskName : this._htCurrentTask.sTaskName,
				nDuration : this._htCurrentTask.nDuration
			})){
				//this._htCurrentTask;
				return;
			}
			
			this._oMorph.pushAnimate(
			    this._htCurrentTask.nDuration == 0 ? -1 : this._htCurrentTask.nDuration, 
			    [this._htCurrentTask.elTarget, this._htCurrentTask.htTask]);
			this._oMorph.play();


			var el = this._htCurrentTask.elTarget;
			var wel = jindo.$Element(el);
			this._elCurrent = el;

			this._setBeforeStatus(wel);
		}
	},


	/**
		wel의 태스크 실행전 css로 복구한다.
		@param {Element}wel
	**/
	_setBeforeStatus : function(wel){
		var nIndex = this._getBeforeStatusElement(wel.$value());

		if(nIndex > -1){
			this._aBeforeStatus[nIndex].style = wel.attr('style');
		}else{
			this._aBeforeStatus.push({
				el : wel.$value(),
				style : wel.attr('style')
			});
		}
	},

	/**
		저장된 이전 task에서 el에 관련된 task의 index를 리턴한다.
		@param {HTMLElement} el
		@return {Number} index
	**/
	_getBeforeStatusElement : function(el){
		var nIndex = -1;

		for(var i=0,nLen = this._aBeforeStatus.length; i<nLen; i++){
			if(this._aBeforeStatus[i].el === el){
				nIndex = i;
				break;
			}
		}

		return nIndex;
	},

	/**
		커스텀 이벤트를 발생시킨다.
		@param {String} 커스텀 이벤트 이름
		@param {Object} 커스텀 이벤트 파라미터
	**/
	_fireCustomEvent : function(sName, htParam){
		return this.fireEvent(sName,htParam);
	},

	/**
		트랜지션이 모두 종료된 시점에 발생하며 콜백함수가 있으면 콜백을 실행시키고 다음 작업이 있으면 다음 작업을 시작한다.
	**/
	_onTransitionEnd : function(){

		//불필요한  transition css 속성 제거
		var self = this;
		if(this._htCurrentTask){
			var sCallbackType = typeof this._htCurrentTask.fCallback;
			if(sCallbackType == 'function'){
				// if(this._bNoUseCss3d){
						// setTimeout(function(){
							// try {
									// self._htCurrentTask.fCallback();
							// } catch(e) {}
						// },5);
				// }else{
					self._htCurrentTask.fCallback();
				// }
			}else if(sCallbackType == 'object'){
				var wel = jindo.$Element(this._htCurrentTask.elTarget), p;
				for (p in this._htCurrentTask.fCallback.htTransform){
					var sValue = this._htCurrentTask.fCallback.htTransform[p];
					if(p == 'transform'){
						var sPrefix = this._sCssPrefix+p;
						var sText = wel.$value().style[sPrefix];
						if(sText.length > 0){
							//@to-do transform 추가하거나 기존값이면 대체하는 로직 추가할것;
							//sValue = sText + sValue;
							sValue = sValue;
						}
					}
					wel.$value().style[this._sCssPrefix+p] = sValue;
				}
				for (p in this._htCurrentTask.fCallback.htStyle) {
					wel.css(p, this._htCurrentTask.fCallback.htStyle[p]);
				}
			}

			/**
				Transition이 끝날 때 발생

				@event end
				@param {String} sType 커스텀 이벤트명
				@param {String} sTaskName 사용자가 설정한 sTaskName. 설정한 값이 없을 경우 null값 반환
				@param {HTMLElement} element Transition 대상 엘리먼트
				@param {Number} nDuration Transiton이 수행되는 시간
				@param {Function} stop 수행시 영향을 받는것은 없다
			**/
			this._fireCustomEvent('end',{
				element : this._htCurrentTask.elTarget,
				sTaskName : this._htCurrentTask.sTaskName,
				nDuration : this._htCurrentTask.nDuration
			});
    		setTimeout(function(){
    			self._prepareTask();
    		},10);
		}
	},

	/**
		jindo.m.Transition 에서 사용하는 모든 객체를 release 시킨다.
		@method destroy
	**/
	destroy : function() {

		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
		this._aTaskQueue = null;
		this._bIsPlaying = null;
		this._sCssPrefix = null;
		this._aBeforeStatus = null;
		// this._bNoUseCss3d = null;
		// this._nTimerAnimate = null;

		this._htCurrentTask = null;
	}
}).extend(jindo.m.Component);