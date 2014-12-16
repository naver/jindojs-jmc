var _flow = (function(){
    function getRandNum(value) {
        return Math.floor(Math.random() * (value + 1));
    }
    
    function randColor() {
        var rgbHexadecimal = 0,rgbHexadecimal = 0;
        var red = 0;
        var green = 0;
        var blue = 0;
    
        red = getRandNum(255);
        cred = 255 - red;
        green = getRandNum(255);
        cgreen = 255 - green;
        blue = getRandNum(255);
        cblue = 255 - blue;
    
        red = red.toString(16);
        cred = cred.toString(16);
        green = green.toString(16);
        cgreen = cgreen.toString(16);
        blue = blue.toString(16);
        cblue = cblue.toString(16);
        
    
        if(red.length < 2)  red = "0" + red;
        if(cred.length < 2)     cred = "0" + cred;
        if(green.length < 2)    green = "0" + green;
        if(cgreen.length < 2)   cgreen = "0" + cgreen;
        if(blue.length < 2)     blue = "0" + blue;
        if(cblue.length < 2)    blue = "0" + cblue;
    
        rgbHexadecimal = "#" + red + green + blue;
        crgbHexadecimal = "#" + cred + cgreen + cblue;
    
        return [rgbHexadecimal,crgbHexadecimal];
    }
    var log, logWrap;
    window.addEventListener("load",function(){
        logWrap = document.createElement("div");
        logWrap.style.cssText = "z-index:100;width:100%; min-height:15px; padding:10px 0;position: fixed; top: 0px; left: 0px; background-color: #E47833; font-weight: bold;font-weight:normal; -webkit-text-stroke-width:.02em; text-align: center;color: #FFFFFF";
        logWrap.innerHTML = "<span style=\"display:inline-block;width:0;height:15px;vertical-align:middle;\"></span><span id=\"log\" style=\"display:inline-block;vertical-align:middle\">Ready</span>";
        document.body.appendChild(logWrap);
        log = document.getElementById("log");
    });
    var stepQueue = {};
    var key;
    function step(sDescription,fpRun){
        stepQueue[sDescription] = fpRun;
        
        if(key){
            clearTimeout(key);
        }
        key = setTimeout(function(){
            next();
        },1000);
    };
    function done(){
        logWrap.style.backgroundColor = "#E47833";
        logWrap.style.color = "#FFFFFF";
        log.innerHTML = "END!";
    }
    
    function next(sURL){
        if(sURL){
            done();
            setTimeout(function(){
                location.href = sURL;            
            },1000);
        }else{
            setTimeout(function(){
                var color = randColor();
                var hasQueue = false;
                for(var i in stepQueue){
                    hasQueue = true;
                    logWrap.style.backgroundColor = color[0];
                    logWrap.style.color = color[1];
                    log.innerHTML = i;
                    stepQueue[i]();
                    delete stepQueue[i];
                    break; 
                }
                if(!hasQueue){
                    done();
                }
            },1000);
        }
    }
    return {
        "step" : step,
        "next"  : next  
    };
})();

var step = _flow.step;
// var run = _flow.next;
var next = _flow.next;
