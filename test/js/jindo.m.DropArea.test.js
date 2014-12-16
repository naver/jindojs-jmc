/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
var isMobile = (jindo.m.getDeviceInfo().android || jindo.m.getDeviceInfo().iphone || jindo.m.getDeviceInfo().ipad);
var isIos = (jindo.m.getDeviceInfo().iphone || jindo.m.getDeviceInfo().ipad);

module("jindo.m.DropArea Template", {
	setup: function() {
		/** 객체 생성 */
		var el = jindo.$('drop');
		var elDrag = jindo.$('drag');
		
		oDrag = new jindo.m.DragArea(elDrag);
		
		oDrop = new jindo.m.DropArea(el,{
			oDragInstance : oDrag
		});
	},
	teardown : function() {
		/** 객체 소멸 */
		oDrop.destroy();
		oDrag.destroy();
		
	}
} );

test("_initVar", function() {
	ok(oDrop._waOveredDroppableElement.$value().length === 0 , "_waOveredDroppableElement");
	ok(oDrop._aItem === null, '_aItem');
	ok(oDrop._aItemRect === null, '_aItemRect');
	ok(oDrop._elHandle === null, '_elHandle');
	ok(oDrop._elDragging === null, '_elDragging');
	ok(oDrop._htWElement.base.$value() === jindo.$('drop'), 'drop base element');
});

test('_getRectInfo', function(){
	var welDrop1 = jindo.$Element(jindo.$('drop1'));
	
	var htInfo  = oDrop._getRectInfo(welDrop1.$value());
	
	equal(welDrop1.offset().top , htInfo.nTop, 'top');
	equal(welDrop1.offset().left, htInfo.nLeft, 'left');
	equal(welDrop1.offset().top+welDrop1.height(), htInfo.nBottom, 'bottom');
	equal(welDrop1.offset().left+welDrop1.width(), htInfo.nRight, 'right');	
});

test('_reCalculate', function(){
	var aItem = jindo.$$('.drop-area', jindo.$('drop'));
	
	oDrop._reCalculate();
	
	equal(oDrop._aItem.length, 2, 'aItem check');
});

test('_findDroppableElement', function(){
	var elLink = jindo.$('txtA1');
	
	var elDropArea = oDrop._findDroppableElement(elLink);
	
	equal(elDropArea, jindo.$('drop1'), '자식 엘리먼트에서 drop 엘리먼트 찾기');	
});

test('_addOveredDroppableElement', function(){
	var aOver = [];
	oDrop.attach({
		'over' : function(oCustomEvent){
			aOver.push(oCustomEvent.elDrop);
		}
	});
	
	var elDrop1 = jindo.$('drop1');
	oDrop._addOveredDroppableElement(elDrop1);
	
	equal(aOver[0], elDrop1, '커스텀 이벤트 over 확인');
	equal(oDrop._waOveredDroppableElement.$value()[0], elDrop1, 'Drop 내부 엘리먼트 확인');	
});

test('_removeOveredDroppableElement', function(){
	var aOut = [];
	var elDrop1 = jindo.$('drop1');
	oDrop.attach({
		'out' : function(oCustomEvent){
			aOut.push(oCustomEvent.elDrop);
		}
	});
	
	oDrop._removeOveredDroppableElement(elDrop1);
	equal(aOut.length ,0 , 'over 된 엘리먼트가 없으면  out은 발생하지 않는다');
	oDrop._addOveredDroppableElement(elDrop1);
	oDrop._removeOveredDroppableElement(elDrop1);
	
	equal(aOut[0], elDrop1, '커스텀이벤트 out 확인');
	equal(oDrop._waOveredDroppableElement.$value().length, 0, 'Drop 내부 엘리먼트 확인');
	
});


test('_clearOveredDroppableElement', function(){
	var aDrop = [];
	var elDrop1 = jindo.$('drop1');
	oDrop.attach({
		'drop' : function(oCustomEvent){
			aDrop.push(oCustomEvent.elDrop);
		}
	});
	
	oDrop._clearOveredDroppableElement();
	equal(aDrop.length, 0 , 'over 된 엘리먼트가 없다면  drop되는것은 없다');
	
	oDrop._addOveredDroppableElement(elDrop1);
	
	oDrop._clearOveredDroppableElement();
	equal(aDrop[0], elDrop1, 'drop 커스텀 이벤트 발생');
	equal(oDrop._waOveredDroppableElement.$value().length, 0, 'Drop 내부 엘리먼트 확인');
	
});

test('getOveredLists', function(){
	var elDrop1 = jindo.$('drop1');
	var elDrop2 = jindo.$('drop2');
	var aOver = oDrop.getOveredLists();
	
	equal(aOver.length , 0, 'over 된것이 없을 경우');
	
	oDrop._addOveredDroppableElement(elDrop1);
	oDrop._addOveredDroppableElement(elDrop1);
	equal(aOver.length , 1, '한개의 엘리먼트를 여러번 over 되어도 1개만 저장');
	
	oDrop._addOveredDroppableElement(elDrop2);
	equal(aOver.length , 2, '두개 over 될 경우');
	
});