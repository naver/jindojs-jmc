jindo.m.Test = jindo.$Class({
	$init : function(){
		this.sStatus = "";
		this.nActivatedCount = 0;
	},
	_onActivate : function() {
		this.sStatus = "activated";
		this.nActivatedCount++;
		this.aActivateParameter = arguments;
	},
	_onDeactivate : function() {
		this.sStatus = "deactivated";
		this.aDectivateParameter = arguments;
	}
}).extend(jindo.m.UIComponent);

var oUIComponent = new jindo.m.Test();

module("jindo.m.UIComponent", {
});
test("jindo.m.UIComponent는 isActivating, activate, deactivate 메소드를 가진다.", function(){
	ok(typeof oUIComponent.isActivating == "function", "isActivating 메소드를 가져야한다.");
	ok(typeof oUIComponent.activate == "function", "activate 메소드를 가져야한다.");
	ok(typeof oUIComponent.deactivate == "function", "deactivae 메소드를 가져야한다.");
});
test("jindo.m.UIComponent를 상속받은 클래스의 인스턴스는 _onActivate, _onDeactivate 메소드를 가져야한다.", function(){
	ok(typeof oUIComponent._onActivate == "function", "_onActivate 메소드를 가져야한다.");
	ok(typeof oUIComponent._onDeactivate == "function", "_onDeactivate 메소드를 가져야한다.");
});
test("isActivating()", function(){
	ok(oUIComponent.isActivating() == false, "기본 isActivating()의 값은 false이다.");
});
test("activate()", function(){
	oUIComponent.activate();
	ok(oUIComponent.sStatus == "activated" && oUIComponent.nActivatedCount === 1, "_onActivate 메소드가 수행된다.");
	ok(oUIComponent.isActivating() == true, "isActivating()의 값은 true이다.");
	
	oUIComponent.activate();
	ok(oUIComponent.sStatus == "activated" && oUIComponent.nActivatedCount === 1, "isActivating() 값이 true일 때에는 activate()가 수행되어도 _onActivate 메소드가 수행되지 않는다.");
});
test("deactivate()", function(){
	oUIComponent.deactivate();
	oUIComponent.sStatus = "";
	oUIComponent.deactivate();
	ok(oUIComponent.sStatus == "", "isActivating() 값이 false일 때에는 _onDeactivate 메소드가 수행되지 않는다.");
	
	oUIComponent.activate();
	oUIComponent.deactivate();
	ok(oUIComponent.sStatus == "deactivated", "isActivating() 값이 true일 때에는 _onDeactivate 메소드가 수행된다.");
	ok(oUIComponent.isActivating() == false, "수행된 이후에 isActivating()의 값은 false이다.");
});
test("activate()/deactivate()에 파라메터 전달", function(){
	oUIComponent.activate("1234");
	ok(oUIComponent.aActivateParameter[0] == "1234", "activate('1234')를 수행하면 _onActivate에 파라메터 '1234'가 전달된다");
	
	oUIComponent.deactivate("test");
	ok(oUIComponent.aDectivateParameter[0] == "test", "deactivate('test')를 수행하면 _onDeactivate에 파라메터 'test'가 전달된다");
});
