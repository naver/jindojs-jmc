


var touchSimulator  = (function(){
    
    function Move(oConfig,fpCallback){
        this.config = oConfig;
        this.fpCallback = fpCallback||function(){};
        this.limit = {
            "x" : oConfig.x.from,
            "y" : oConfig.y.from
        }
        this.current = {
            "x" : oConfig.x.to,
            "y" : oConfig.y.to
        }
        
        var nStep = Math.abs(oConfig.speed); 
        
        this.config.step = {
            "x" : nStep, 
            "y" : nStep 
        }
        
        // console.log(this.limit.x - this.current.x);
        // console.log(this.limit.y - this.current.y);
        var bHorizontalForward  = this.limit.x - this.current.x;
        var bVerticalForward = this.limit.y - this.current.y;
        
                
        if(bHorizontalForward >= 0){
            //커짐.
            //true이면 멈추어야 함.
            this.overflowX = function(nCurrent){
                return nCurrent >= this.limit.x; 
            }   
        }else{
            this.overflowX = function(nCurrent){
                return nCurrent <= this.limit.x; 
            }
            this.config.step.x  = nStep * -1;
        }
        
        if(bVerticalForward >= 0){
            this.overflowY = function(nCurrent){
                return nCurrent >= this.limit.y; 
            }   
        }else{
            this.overflowY = function(nCurrent){
                return nCurrent <= this.limit.y; 
            }       
            this.config.step.y  = nStep * -1;
        }
        // console.log(bHorizontalForward, bVerticalForward);
        this.weEle = $Element(oConfig.id);
        
    }
    
    Move.prototype = {
        "run" : function(){
            this.start();
            var oConfig = this.config;
            if(oConfig.speed < 100){
                this.sId = setInterval($Fn(function(){
                    var oIsEnd = this.move();
                    if(oIsEnd.horizontalEnd&&oIsEnd.verticalEnd){
                        this.end();
                    }
                },this).bind(),17);
            }else{
                while(true){
                    var oIsEnd = this.move();
                    if(oIsEnd.horizontalEnd&&oIsEnd.verticalEnd){
                        break;
                    }
                }
                this.end();
            }
        },
        "move" : function(){
            var nCurrentX = this.current.x;
            var nCurrentY = this.current.y;
            var bIsHorizontalEnd = this.overflowX(nCurrentX);
            if(bIsHorizontalEnd){
                this.current.x = this.limit.x;
            }else{
                this.current.x += this.config.step.x;
                
            }
            var bIsVerticalEnd = this.overflowY(nCurrentY);
            if(bIsVerticalEnd){
                this.current.y = this.limit.y;
            }else{
                this.current.y += this.config.step.y;
                
            }  
            // console.log(this.current.x, this.config.step.x);
            // console.log("move",this.current.x, this.current.x);
            // console.log(bIsHorizontalEnd, bIsVerticalEnd);
            this.weEle.xFakeEvent("touchmove",{"touches":[{"pageX":this.current.x,"pageY":this.current.y}]});
            
            return {
                "horizontalEnd" : bIsHorizontalEnd,
                "verticalEnd" : bIsVerticalEnd
            }

        },
        "start" : function(){
            var oConfig = this.config;
            // console.log("move",oConfig.x.to, oConfig.y.to);
            this.weEle.xFakeEvent("touchstart",{"touches":[{"pageX":oConfig.x.to,"pageY":oConfig.y.to}]});
            
            // this.sId = setInterval($Fn(this.move,this).bind(),oConfig.speed);
        },
        "end" : function(){
            // console.log("end",this.current.x, this.current.x);
            this.weEle.xFakeEvent("touchend",{"touches":[{"pageX":this.current.x,"pageY":this.current.y}]});
            this.sId&&clearInterval(this.sId);
            this.fpCallback(this);
        }
    };
    
    Move.prototype.contructor = Move;
    
    var Repeat = {
        "run" : function(oConfig,fpCallback){
            this.config = oConfig;
            
            this.init(oConfig);
            this.currentCount = 1;
            this.callback = fpCallback||next||function(){};
            this.start();
                        // {
            // id : "view"
            // x : {to:100,from:100},
            // y : {to:100,from:100},
            // speed : 17,
            // times : 2
        // }   
            
            
        },
        "init" : function(oConfig){
            if(!oConfig.id){
                throw new Error("아이디를 넣어야 함.");
            }
            
            if(typeof this.config.x.to === "undefined"){
                throw new Error("적어도 x의 시작(to)포인트는 있어야 합니다.");
            }else{
                if(typeof this.config.x.from === "undefined"){
                    this.config.x.from = this.config.x.to;
                }
            }
            if(typeof this.config.y.to === "undefined"){
                throw new Error("적어도 y의 시작(to)포인트는 있어야 합니다.");
            }else{
                if(typeof this.config.y.from === "undefined"){
                    this.config.y.from = this.config.y.to;
                }
            }
            
            if(typeof oConfig.speed === "undefined"){
                this.config.speed = 15;
            }
            // if(typeof oConfig.step === "undefined"){
                // this.config.step = 10;
            // }
            if(typeof oConfig.times === "undefined"){
                this.config.times = 1;
            }
            
            
        },
        "start" : function () {
            new Move(this.config,$Fn(function(oScope){
                this.currentCount++;
                if(this.currentCount <= this.config.times){
                    oScope.current.x = oScope.config.x.to;
                    oScope.current.y = oScope.config.y.to;
                    oScope.start();
                }else{
                    this.callback();
                }
            },this).bind()).run();
        },
        'stop' : function(){
            this.currentCount = this.config.times;  
        }
    }
    return Repeat;
})();

