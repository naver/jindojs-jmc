/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
module("LayerManager Test", {
	setup: function() {
		/** 객체 생성 */
		oLm = new jindo.m.LayerManager("layer");
	},
	teardown : function() {
		/** 객체 소멸 */
		oLm.destroy();
		oLm = null;
	}
} );

test("hide", function() {
	oLm.show();
	equal(oLm.getVisible(),true, "Layer Show!"); 
	oLm.hide();
	equal(oLm.getVisible(),false, "Layer hidden");		
});

test("show", function() {
	oLm.hide();
	equal(oLm.getVisible(),false, "Layer hidden"); 
	oLm.show();
	equal(oLm.getVisible(),true, "Layer Show!");		
});

test("link, unlink", function() {
	oLm.show();
	equal(oLm.getVisible(),true, "Layer Show");
	
	var aLinks=oLm.getLinks();
	equal(aLinks.length,0, "초기 Link는 0");
	oLm.link("showlayer","layer");
	equal(aLinks.length,2, "추가된 Link는 2");
	oLm.unlink("layer","showlayer");
	equal(aLinks.length,0, "삭제된 Link는 0");
	
	oLm.link("showlayer","layer");
	equal(aLinks.length,2, "추가된 Link는 2");
	
	var welShowlayer = jindo.$Element("showlayer");
	var welLayer = jindo.$Element("layer");
	var welNoeventRed = jindo.$Element("noeventRed");
	
	welShowlayer.fireEvent("click", {left : true, middle : false, right : false });
	equal(oLm.getVisible(),true, "Layer Show");
	welLayer.fireEvent("click", {left : true, middle : false, right : false });
	equal(oLm.getVisible(),true, "Layer Show");
//	welNoeventRed.fireEvent("click", {left : true, middle : false, right : false });
//	equal(oLm.getVisible(),false, "Layer hidden");	
});

test("toggle", function() {
	oLm.show();
	equal(oLm.getVisible(),true, "Layer Show");
	oLm.toggle();
	equal(oLm.getVisible(),false, "Layer hidden");
	oLm.toggle();	
	equal(oLm.getVisible(),true, "Layer Show");
	oLm.toggle();	
	equal(oLm.getVisible(),false, "Layer hidden");
});

//test("event", function() {
//	oLm.show();
//	equal(oLm.getVisible(),true, "Layer Show!");
//	
//	var welDoc = jindo.$Element(document);
//	welDoc.fireEvent("touchstart", {left : true, middle : false, right : false });
//	welDoc.fireEvent("touchend", {left : true, middle : false, right : false });
//	equal(oLm.getVisible(),false, "Layer hidden"); 
//});

test("getLayer", function() {
	var el = oLm.getLayer();
	ok(el === jindo.$("layer"), "getLayer가 같은가?");
});

test("사용자 이벤트 확인", function() {
	oLm.attach("beforeShow", function(we) {
			elLayer = we.elLayer; 
			aLinkedElement = we.aLinkedElement;
			ok(oLm.getLayer() == elLayer, "beforeShow Event호출 - Layer 객체 동일");
			ok(oLm.getLinks() == aLinkedElement, "beforeShow Event호출 - Link 객체 동일");
			equal(oLm.getVisible(),false, "Layer before Show!");
		})
		.attach("show", function(we) {
			elLayer = we.elLayer; 
			aLinkedElement = we.aLinkedElement;
			ok(oLm.getLayer() == elLayer, "show Event호출 - Layer 객체 동일");
			ok(oLm.getLinks() == aLinkedElement, "show Event호출 - Link 객체 동일");
			equal(oLm.getVisible(),true, "Layer Show!");
		})
		.attach("beforeHide", function(we) {
			elLayer = we.elLayer; 
			aLinkedElement = we.aLinkedElement;
			ok(oLm.getLayer() == elLayer, "beforeHide Event호출 - Layer 객체 동일");
			ok(oLm.getLinks() == aLinkedElement, "beforeHide Event호출 - Link 객체 동일");
			equal(oLm.getVisible(),true, "Layer Hide!");
		})
		.attach("hide", function(we) {
			elLayer = we.elLayer; 
			aLinkedElement = we.aLinkedElement;
			ok(oLm.getLayer() == elLayer, "hide Event호출 - Layer 객체 동일");
			ok(oLm.getLinks() == aLinkedElement, "hide Event호출 - Link 객체 동일");
			equal(oLm.getVisible(),false, "Layer Hide!");
		})
		.attach("ignore", function(we) {
			ok(true, "ignore 이벤트 호출");
		});
	oLm.link("showlayer", "layer");
	oLm.show();
	equal(oLm.getVisible(),true, "Layer Show!");


	var welLayer = jindo.$Element("layer");
	welLayer.fireEvent("click", {left : true, middle : false, right : false });
	equal(oLm.getVisible(),true, "click Layer show");	
	
//	var welDoc = jindo.$Element(document);
//	welDoc.fireEvent("click", {left : true, middle : false, right : false });
//	equal(oLm.getVisible(),false, "click document hidden"); 
});
