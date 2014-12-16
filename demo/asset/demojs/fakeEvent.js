var SimulateEvent;
var FakeEvent = (function(){
    var bIsHighVersion2 = !!((parseInt((jindo.$Jindo.VERSION || jindo.$Jindo().version || jindo.VERSION).replace(/\./g,""),10)||1) >= 200);
    if(bIsHighVersion2){
        var sRealEvent,fpRealCallback;
        jindo.$Element.prototype.oldAttach = jindo.$Element.prototype.attach;
        jindo.$Element.prototype.attach = function(sEvent, fpCallback) {
            sRealEvent = sEvent;
            fpRealCallback = fpCallback;
            this.oldAttach.apply(this, Array.prototype.slice.apply(arguments));
        }
        jindo.$Element.prototype.oldDetach = jindo.$Element.prototype.detach;
        jindo.$Element.prototype.detach = function(sEvent, fpCallback) {
            sRealEvent = sEvent;
            this.oldDetach.apply(this, Array.prototype.slice.apply(arguments));
        }



        jindo.$Element._eventBind(document,"click",function(){},false);
        jindo.$Element._oldEventBind = jindo.$Element._eventBind;
        jindo.$Element._eventBind = function(oEle,_sEvent,fAroundFunc,bUseCapture){
            SimulateEvent.add(oEle,sRealEvent.toLowerCase(),fAroundFunc,fpRealCallback);
            jindo.$Element._oldEventBind.apply(jindo.$Element, Array.prototype.slice.apply(arguments));
        }

        jindo.$Element._unEventBind(document,"click",function(){},false);
        jindo.$Element._oldUnEventBind = jindo.$Element._unEventBind;
        jindo.$Element._unEventBind = function(oEle,_sEvent,fAroundFunc,bUseCapture){
            SimulateEvent.remove(oEle,sRealEvent.toLowerCase(),fAroundFunc);
            jindo.$Element._oldUnEventBind.apply(jindo.$Element, Array.prototype.slice.apply(arguments));
        }
    }else{
        jindo.$Fn.prototype.oldAttach = jindo.$Fn.prototype.attach;
        jindo.$Fn.prototype.attach = function(oElement, sEvent, bUseCapture) {
            // console.log(this);
            // console.log(this.bindForEvent);
            this.___func = this.bindForEvent();
            SimulateEvent.add(jindo.$(oElement), sEvent.toLowerCase(), this.___func,this);
            this.oldAttach.apply(this, Array.prototype.slice.apply(arguments));
        }

        jindo.$Fn.prototype.oldDetach = jindo.$Fn.prototype.detach;
        jindo.$Fn.prototype.detach = function(oElement, sEvent, bUseCapture) {
            SimulateEvent.remove(jindo.$(oElement), sEvent.toLowerCase(), this.___func);
            delete this.___func;
            this.oldDetach.apply(this, Array.prototype.slice.apply(arguments));
        }
    }
    //TODO detach, delegate, undelegate적용

    function pos(oElement){
        return jindo.$Element(oElement).offset();
    }

    var point;
    window.addEventListener("load",function(){
        point = document.createElement("div");
        point.id="point";
        document.body.appendChild(point);
    });
    function position(oElement,x,y){
        point.style.cssText = "z-index:100;-webkit-border-radius: 10px;opacity:0.5;background:red;width:20px;height:20px;position: absolute;position:absolute;left:"+(x-10)+"px;top:"+(y-10)+"px";
    }

    function getAttirbute(oElement, sKey){
        if(oElement.getAttribute){
            return oElement.getAttribute(sKey);
        }else{
            return oElement[sKey];
        }
    }

    function setAttirbute(oElement, sKey, sValue){
        if(oElement.setAttribute){
            oElement.setAttribute(sKey, sValue);
        }else{
            oElement[sKey] = sValue;
        }
    }

    function random(){
        return new Date().getTime() + parseInt(Math.random() * 100000000,10);
    }


    var oMouseButton = {
        "left" : 0,
        "center" : 1,
        "right" : 2
    };

    function TouchEventMock(oElement, sEvent, oOption){
        this.target = oElement;
        this.type = sEvent;
        oOption = oOption||{};

        this.wheelDelta = 0;
        this.relatedTarget = "";
        this.which = "";
        this.keyCode = "";
        this.button = "";
        this.altKey = false;
        this.ctrlKey = false;
        this.metaKey = false;
        this.shiftKey = false;

        this.pageX = 0;
        this.pageY = 0;
        this.clientX = 0;
        this.clientY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.timeStamp = (new Date()).getTime();

        if(oOption.touches){
            this.touches = this.setTouches(oElement,oOption.touches);
        }else{
            this.touches = [{
               "target" : oElement,
               "clientX" : 0,
               "clientY" : 0,
               "pageX" : 0,
               "pageY" : 0,
               "screenX" : 0,
               "screenY" : 0,
               "identifier" :  random()
            }];
        }

        if(oOption.changedTouches){
            this.changedTouches = this.setTouches(oElement,oOption.changedTouches);
        }else{
            this.changedTouches = this.touches;
        }

        if(oOption.targetTouches){
            this.targetTouches = this.setTouches(oElement,oOption.targetTouches);
        }else{
            this.targetTouches = this.touches;
        }
    }

    TouchEventMock.prototype.setTouches = function(oElement,aTouches){
        var aTouchList = [], oTouch;
        var oScroll = jindo.$Document().scrollPosition();
        var oTarget;
        for(var i = 0 , l = aTouches.length; i < l; i++){
            oTouch = aTouches[i];
            if(oTouch.target){
                oTarget = jindo.$Element(oTouch.target)._element;
            }else{
                oTarget = oElement;
            }
            aTouchList.push({
                "identifier" :  random(),
                "target" : oTarget,
                "pageX" : oTouch.pageX,
                "pageY" : oTouch.pageY,
                "clientX" : oTouch.pageX - oScroll.left,
                "clientY" : oTouch.pageY - oScroll.top,
                "screenX" : 0,
                "screenY" : 0
            });
        }
        return aTouchList;
    }

    function EventMock(oElement, sEvent, oOption){
        this.target = oElement;
        this.type = sEvent;
        oOption = oOption||{};

        this.wheelDelta = typeof oOption.wheel == "undefined"?0:oOption.wheel*120;
        this.relatedTarget = "";
        if(oOption.relatedTarget){
            this.relatedTarget = jindo.$Element(oOption.relatedTarget)._element;
        }
        this.which = oOption.key?oOption.key.charCodeAt():"";
        this.keyCode = this.which;
        this.button = "";

        if(typeof oOption.mousebutton != "undefined"){
            this.button = oMouseButton[oOption.mousebutton];
            this.which = 1;
        }else if(/^mouse/.test(sEvent)){
            this.button = 0;
            this.which = 1;
        }
        this.altKey = !!oOption.alt;
        this.ctrlKey = !!oOption.ctrl;
        this.metaKey = !!oOption.meta;
        this.shiftKey = !!oOption.shift;

        //TODO 이건 나중에 하도록 함.
        this.pageX = oOption.pageX;
        this.pageY = oOption.pageY;

        var oScroll = jindo.$Document().scrollPosition();
        this.clientX = this.pageX - oScroll.left;
        this.clientY = this.pageY - oScroll.top;

        var oPos = pos(oElement);
        this.offsetX = this.pageX - oPos.left;
        this.offsetY = this.pageY - oPos.top;
    }

    function preventDefault(){
        // TODO 나중에 구현하는 걸로.
    }
    function stopPropagation(){
        // TODO 나중에 구현하는 걸로.
    }

    EventMock.prototype.preventDefault = preventDefault;
    EventMock.prototype.stopPropagation = stopPropagation;

    TouchEventMock.prototype.preventDefault = preventDefault;
    TouchEventMock.prototype.stopPropagation = stopPropagation;


    SimulateEvent = {
        oStorage : {},
        add : function (oElement,sEvent,fpFunc){
            var sUniqeNum = getAttirbute(oElement,"__jindo__fake__sKey");

            if(!sUniqeNum){
                sUniqeNum = "e"+ random();
                this.oStorage[sUniqeNum] = {};

                setAttirbute(oElement,"__jindo__fake__sKey", sUniqeNum);
            }

            if(!this.oStorage[sUniqeNum][sEvent]){
                this.oStorage[sUniqeNum][sEvent] = [];
            }

            this.oStorage[sUniqeNum][sEvent].push(fpFunc);
        },
        remove : function(oElement,sEvent,fpFunc){
            var sUniqeNum = getAttirbute(oElement,"__jindo__fake__sKey");
            if(sUniqeNum){
                var aEvent = this.oStorage[sUniqeNum][sEvent];
                var aNewEvent = [];
                if(aEvent.length>0){
                    for(var i = 0, l = aEvent.length; i < l; i++){
                        if(aEvent[i] != fpFunc){
                            aNewEvent.push(aEvent[i]);
                        }
                    }
                }
                if(aNewEvent.length > 0){
                    this.oStorage[sUniqeNum][sEvent] = aNewEvent;
                }else{
                    delete this.oStorage[sUniqeNum][sEvent];
                }
            }
        },
        getListenerList : function(oElement, sEvent){
            var sUniqNum = getAttirbute(oElement,"__jindo__fake__sKey");
            if(sUniqNum&&this.oStorage[sUniqNum]&&this.oStorage[sUniqNum][sEvent]){
                return this.oStorage[sUniqNum][sEvent];
            }
            return false;
        },
        getElementAndListenerList : function(oElement, sEvent){
            var aInfoMap = [], eParent, sNodeType, oMap;
            while (oElement) {
                var sNodeType = oElement.nodeType;
                if(sNodeType == 1 || sNodeType == 9 || sNodeType ==11){
                    oMap = this.getElementAndListenerMap(oElement,sEvent);
                    if(oMap){
                        aInfoMap.push(oMap);
                    }
                }
                oElement = oElement.parentNode;
            }
            return aInfoMap;
        },
        getElementAndListenerMap : function(oElement,sEvent){

            var aList = this.getListenerList(oElement,sEvent);
            if(aList){
                return {
                    "listener" : aList,
                    "element" : oElement
                }
            }
            return false;
        },
        // eventToAvoid:function(sType, oElement, sEvent){
            // var sUniqeNum = getAttirbute(oElement,"__jindo__fake__sKey");
            // var aFunc = this.oStorage[sUniqeNum][sEvent];
//
            // sType = sType.replace(/^(.)/,function(s){return s.toUpperCase();});
            // if(bIsHighVersion2){
                // var weEle = jindo.$Element(oElement);
                // for(var i = 0, l = aFunc.length; i < l; i++){
                    // weEle["old"+sType](sEvent,aFunc[i].refer);
                // }
            // }else{
                // for(var i = 0, l = aFunc.length; i < l; i++){
                    // aFunc[i].refer["old"+sType](oElement,sEvent);
                // }
            // }
        // },
        scroll : function(oElement, sEvent, oOption){
            if(sEvent=='scroll'&&oOption){
                var nScrollTop = oOption.scrollTop;
                var nScrollLeft = oOption.scrollLeft;
                if(typeof nScrollTop != "undefined" || typeof nScrollLeft != "undefined"){
                    if(typeof nScrollTop != "undefined"){
                        oElement.scrollTop = nScrollTop;
                    }
                    if(typeof nScrollLeft != "undefined"){
                        oElement.scrollLeft = nScrollLeft;
                    }
                }
            }
        },
        fire : function(oElement, sEvent, oOption){

            this.scroll(oElement, sEvent, oOption);
            var aInfoMap = this.getElementAndListenerList(oElement, sEvent);
            var oMock;
            if(/^touch/.test(sEvent)){
                oMock = new TouchEventMock(oElement, sEvent, oOption);
                var oEvent1 = oMock.touches[0];
                var oEvent2 = oMock.touches[1];
                position(oElement,parseInt(oEvent1.pageX,10),parseInt(oEvent1.pageY,10));
                if(oEvent2){
                    position(oElement,parseInt(oEvent2.pageX,10),parseInt(oEvent2.pageY,10));
                }
            }else{
                oMock = new EventMock(oElement, sEvent, oOption);
                position(oElement,parseInt(oMock.pageX,10),parseInt(oMock.pageY,10));
            }
            for(var  i = 0, mapLength = aInfoMap.length; i < mapLength; i++){
                oMock.currentTarget = aInfoMap[i].element;
                for(var j = 0, listenerLength = aInfoMap[i].listener.length ; j < listenerLength ; j++){
                    aInfoMap[i].listener[j](oMock);
                }

            }
        },
        reset : function(){
            this.oStorage = {};
        }
    }


    return {
        "fire" :jindo.$Fn(SimulateEvent.fire,SimulateEvent).bind(),
        "reset" : jindo.$Fn(SimulateEvent.reset,SimulateEvent).bind(),
        "draw" : position
    };
})();


jindo.$Element.prototype.xFakeEvent = function(sEvent,oOption){
    FakeEvent.fire(this._element,sEvent,oOption);
    return this;
}

// {
    // "wheel"  : "정수".
    // "key"    : "a",
    // "relatedTarget" :ele
    // "mousebutton" : "left,center,right",
    // "alt" :"true/false",
    // "ctrly":"true/false",
    // "meta" :"true/false",
    // "shift" :"true/false",
    // "x" : "0",
    // "y" : "0"
// }
//
// {
    // "target" : "발생한 곳",
    // "currentTarget" : "정의한 곳"
    // "wheelDelta" :"wheel 정보 / 120",
    // "relatedTarget" : "어디서 왔는지",
    // "which" :  "keycode",
    // "keyCode" :  "keycode",
    // "button" : "0,1,2 (left, mid, right)"
    // "altKey" :"true/false",
    // "ctrlKey":"true/false",
    // "metaKey" :"true/false",
    // "shiftKey" :"true/false",
    // "type" : "이벤트명"
    // clientY : 최상단에서 위치
    // offsetX : 엘리먼트에서 위치
    // pageX : client+스크롤
//
// }
//
// clientY : 최상단에서 위치
// offsetX : 엘리먼트에서 위치
// pageX : client+스크롤
// preventDefault
// stopPropagation
//
//
// charCodeAt()//charcode
// String.fromCharCode()//to string


