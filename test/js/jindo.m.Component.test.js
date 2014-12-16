var TestClass = jindo.$Class({}).extend(jindo.m.Component);
var sOptionSetter = "1";
var nClassInitialized = 0;
function fCustomEventHandler1(oCustomEvent) {
	oCustomEvent.nValue = 100;
}
function fCustomEventHandler2(oCustomEvent) {
	oCustomEvent.stop();
}
function fCustomEventHandler3(oCustomEvent) {
}
	
module("Public Method Test", {
	setup : function(){
		this.oClass = new TestClass();
		nClassInitialized++;
	}
});
test("option()", function() {
	ok(this.oClass.option("test", "done") === this.oClass, "option('test', 'done')으로 옵션을 설정하면 해당 객체 인스턴스를 리턴한다.");
	ok(typeof this.oClass.option() === "object", "option()은 옵션 객체를 리턴한다.");
	ok(this.oClass.option()["test"] === "done", "옵션객체는 'test' 프로퍼티를 가지고 'done' 값을 가진다.");
	ok(this.oClass.option("test") === "done", "option('test')은 'done'을 리턴한다.");
	ok(this.oClass.option({"test2":"aaaa", "test3":"bbbb"}) === this.oClass, "option()은 객체타입으로도  설정할 수 있고 해당 객체 인스턴스를 리턴한다.");
});
test("optionSetter()", function() {
	var fOptionSetter = function(){ sOptionSetter = "2" };
	ok(this.oClass.optionSetter("test", fOptionSetter) === this.oClass, "optionSetter('test', 함수)를 호출하면 해당 객체 인스턴스를 리턴한다.");
	ok(typeof this.oClass.optionSetter() === "object", "optionSetter()은 옵션셋터 객체를 리턴한다.");
	ok(typeof this.oClass.optionSetter("test") === "function", "옵션셋터객체는 'test' 프로퍼티를 가지고 타입은 'function' 이다.");
	
	ok(sOptionSetter === "1", "'test' 옵션의 값이 바뀌기전에는 sOptionSetter의 값은 '1'이다.");
	this.oClass.option("test", "name");
	ok(sOptionSetter === "2", "'test' 옵션의 값이 바뀌면 sOptionSetter의 값은 '2'이다.");
	ok(this.oClass.optionSetter({
		"test" : jindo.$Fn(function(){ sOptionSetter = "test" }, this).bind(),
		"test2" : jindo.$Fn(function(){ sOptionSetter = "test2" }, this).bind()
	}) === this.oClass, "optionSetter()는 객체타입으로도 설정할 수 있고 해당 객체 인스턴스를 리턴한다.");
	this.oClass.option({
		"test" : "changed"
	});
	ok(sOptionSetter === "test", "'test' 옵션의 값이 바뀌면 sOptionSetter의 값은 'test'이다.");
	this.oClass.option({
		"test2" : "changed"
	});
	ok(sOptionSetter === "test2", "'test2' 옵션의 값이 바뀌면 sOptionSetter의 값은 'test2'이다.");
});
test("attach/detach/fireEvent()", function() {
	ok(this.oClass.fireEvent("noevent") === true, "fireEvent(이벤트명) 수행시 등록된 핸들러가 없으면 true를 리턴한다.");
	
	var bInlineHandler = false;
	this.oClass.ontest = function(oCustomEvent){
		bInlineHandler = true;
	};
	this.oClass.fireEvent("test");
	ok(bInlineHandler === true, "fireEvent(이벤트명) 수행시 등록된 인라인 핸들러가 있으면 수행된다.");
	
	ok(this.oClass.attach("test", fCustomEventHandler1) === this.oClass, "attach() 메소드로 커스텀이벤트 핸들러를 등록하면 해당 객체 인스턴스를 리턴한다.");
	var oCustomEvent = { nValue : 3 };
	ok(this.oClass.fireEvent("test", oCustomEvent) === true, "test 커스텀이벤트를 발생시키면 true를 리턴한다.");
	ok(this.oClass.fireEvent("test", oCustomEvent, 1, 2, 3) === true, "fireEvent() 메소드는 2개 이상의 파라메터를 전달할 수 있다.");
	ok(oCustomEvent.nValue === 100, "이벤트핸들러가 제대로 수행되어 oCustomEvent의 nValue 값이 100으로 바뀌어야 한다.");
	
	this.oClass.attach("test", fCustomEventHandler2);
	this.oClass.attach("test", fCustomEventHandler3);
	ok(this.oClass.fireEvent("test", oCustomEvent) === false, "하나의 커스텀이벤트에 여러개의 핸들러를 수행시키면 하나의 핸들러라도 stop() 메소드가 수행되면 false를 리턴한다.");
	
	ok(this.oClass.attach({
		"test2" : fCustomEventHandler2,
		"test3" : fCustomEventHandler3
	}) === this.oClass, "attach() 메소드로 커스텀이벤트 핸들러를 등록은 객체타입으로도 설정할 수 있고 해당 객체 인스턴스를 리턴한다.");
	ok(this.oClass.fireEvent("test2", oCustomEvent) === false, "test2 커스텀이벤트를 발생시키면 이벤트 핸들러내에서 stop()을 수행하므로 false를 리턴한다.");

	var nHandlerLength = this.oClass._htEventHandler["test"].length;
	ok(this.oClass.detach("noevent", fCustomEventHandler1) === this.oClass, "detach() 메소드로 존재하지 않는 커스텀이벤트 핸들러를 해제하면 해당 객체 인스턴스를 리턴한다.");
	ok(this.oClass.detach("test", fCustomEventHandler2) === this.oClass, "detach() 메소드로 커스텀이벤트 핸들러를 해제하면 해당 객체 인스턴스를 리턴한다.");
	ok(this.oClass._htEventHandler["test"].length === nHandlerLength - 1, "등록된 핸들러 배열의 길이가 줄어들어야 한다.");
	
	ok(this.oClass.detach({
		"test2" : fCustomEventHandler2
	}) === this.oClass, "detach() 메소드로 커스텀이벤트 핸들러를 해제는 객체타입으로도 설정할 수 있고 해당 객체 인스턴스를 리턴한다.");
});
test("detachAll()", function() {
	this.oClass.attach("test", fCustomEventHandler1);
	this.oClass.attach("test", fCustomEventHandler1);
	this.oClass.attach("test", fCustomEventHandler1);
	ok(this.oClass.detachAll() === this.oClass, "detachAll() 메소드로 모든 커스텀이벤트 핸들러를  해제하면 해당 객체 인스턴스를 리턴한다.");
	var nHandlerLength = 0;
	for (var aHandler in this.oClass._htEventHandler) {
		nHandlerLength += aHandler.length; 
	}
	ok(nHandlerLength === 0, "모든 핸들러가 제거되어야 한다.");
	
	this.oClass.attach("test", fCustomEventHandler1);
	this.oClass.attach("test", fCustomEventHandler1);
	this.oClass.attach("test", fCustomEventHandler1);
	ok(this.oClass._htEventHandler["test"].length === 3, "3개의 test 커스텀이벤트 핸들러를 등록한다.");
	this.oClass.detachAll("test")
	ok(typeof this.oClass._htEventHandler["test"] === "undefined", "detachAll('test') 메소드로 모든 test 커스텀이벤트 핸들러를  해제되어 핸들러 배열이 존재하지 않아야한다.");
	
	ok(this.oClass.detachAll("test") === this.oClass, "이미 test 커스텀이벤트 핸들러가 모두 해제 되었을 때 detachAll('test') 메소드를 호출하면 해당 객체 인스턴스를 리턴한다.");
});

test("이벤트 핸들러에서 detach 한 경우 핸들러들이 제대로 실행되는지 확인", function() {

	var result;
	var foo = new jindo.m.Component();

	foo.attach('foo', function() { result += '1'; });
	foo.attach('foo', function() { result += '2'; });
	foo.attach('foo', function() { result += '3'; });

	result = '';
	foo.fireEvent('foo');
	equal(result, '123');

	var fp4 = function() { result += '4'; };
	var fp5 = function() {
		this.detach('foo', fp4);
		this.detach('foo', fp5);
		this.detach('foo', fp6);
		result += '5';
	};
	var fp6 = function() { result += '6'; };
	var fp7 = function() { result += '7'; };

	foo.attach('foo', fp4);
	foo.attach('foo', fp5);
	foo.attach('foo', fp6);
	foo.attach('foo', fp7);

	result = '';
	foo.fireEvent('foo');
	equal(result, '1234567');

	result = '';
	foo.fireEvent('foo');
	equal(result, '1237');

});

module("Static Method",{
	setup : function(){
		this.oClass = new TestClass();
		nClassInitialized++;
	}
});
test("factory()", function(){
	var aInstance = TestClass.factory([1, 2, 3]);
	nClassInitialized += 3;
	
	ok(aInstance instanceof Array === true, "factory() 메소드는 생성된 인스턴스 배열를 return한다");
	ok(aInstance.length === 3, "3개의 인스턴스를 생성했으므로 배열의 길이는 3이다.");
	for (var i = 0; i < aInstance.length; i++) {
		ok(aInstance[i] instanceof TestClass, "배열의 "+i+"번째 요소는 TestClass의 인스턴스여야 한다.");
	}
});

module("option객체에 정의하여 커스텀이벤트 핸들러 등록하기",{
	setup : function(){
		this.oClass = new TestClass();
	}
});
test("커스텀이벤트 핸들러 등록하기 (sName, htValue로 설정)", function(){
	var htHandler1 = {
		test: function(oCustomEvent){
			this.detach(oCustomEvent.sType, arguments.callee);
			start();
			ok(true, "option으로 등록된 커스텀이벤트 핸들러가 제대로 수행되어야 한다.");
		}
	};
	
	var htHandler2 = {
		test2 : function(oCustomEvent){
			this.detach(oCustomEvent.sType, arguments.callee);
		}
	};
	
	this.oClass.option("htCustomEventHandler", htHandler1);
	ok(this.oClass.option("htCustomEventHandler") === htHandler1, "htCustomEventHandler 옵션이 설정된다.");
	this.oClass.option("htCustomEventHandler", htHandler2);
	ok(this.oClass.option("htCustomEventHandler") === htHandler1, "이미 htCustomEventHandler 옵션이 설정되어있으면 바뀌지 않는다.");
	
	stop();
	this.oClass.fireEvent("test");
});
test("커스텀이벤트 핸들러 등록하기 (hash table로 설정)", function(){
	var htHandler1 = {
		test: function(oCustomEvent){
			this.detach(oCustomEvent.sType, arguments.callee);
			start();
			ok(true, "option으로 등록된 커스텀이벤트 핸들러가 제대로 수행되어야 한다.");
		}
	};
	
	var htHandler2 = {
		test2 : function(oCustomEvent){
			this.detach(oCustomEvent.sType, arguments.callee);
		}
	};
	
	this.oClass.option({
		htCustomEventHandler: htHandler1
	});
	ok(this.oClass.option("htCustomEventHandler") === htHandler1, "htCustomEventHandler 옵션이 설정된다.");
	this.oClass.option({
		htCustomEventHandler: htHandler2
	});
	ok(this.oClass.option("htCustomEventHandler") === htHandler1, "이미 htCustomEventHandler 옵션이 설정되어있으면 바뀌지 않는다.");
	
	stop();
	this.oClass.fireEvent("test");
});
module("option가 공유되지 않아야함.");

test("optionSetter을 사용했을 때 공유되면 안됨",function(){
	//Given
	var nOutside = 0;
	var nInside = 0;
	var Outside = jindo.$Class({ 
        $init : function(){ 
                this.optionSetter("nValue", function(){ 
                	nOutside++;
            	}); 
                this._inside = new Inside(); 
        }, 
         
        go : function(){ 
                 
                var htOption = this.option(); 
                htOption.nValue = 100;	
                this._inside.option(htOption); //이때 inside의 setter함수가 outside의 setter함수로 덮어짐 
                this._inside.option("nValue", 50); //실제로 inside에는 50으로 변경되지만 outside의 setter가 실행됨 
        } 
     
	}).extend(jindo.m.Component); 
	
	var Inside = jindo.$Class({ 
	        $init : function(){ 
	                this.optionSetter("nValue", function(){ 
	                        nInside++; 
	            	}); 
	        }
	         
	}).extend(jindo.m.Component); 
	
	var test = new Outside();
	
	//When 
	test.go();
	
	//Then
	equal(nInside,2);
	equal(nOutside,0);
	
});
