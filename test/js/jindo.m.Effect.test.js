var aEffect = [
	"linear", "sinusoidal", "overphase", "pulse", "mirror", "wave",
	"easeInQuad", "easeOutQuad", "easeInOutQuad", "easeOutInQuad", 
	"easeIn", "easeOut", "easeInOut", "easeOutIn", 
	"easeInQuart", "easeOutQuart", "easeInOutQuart", "easeOutInQuart",
	"easeInQuint", "easeOutQuint", "easeInOutQuint", "easeOutInQuint",
	"easeInCircle", "easeOutCircle", "easeInOutCircle", "easeOutInCircle", 
	"easeInSine", "easeOutSine", "easeInOutSine", "easeOutInSine",
	"easeInExpo", "easeOutExpo", "easeInOutExpo", "easeOutInExpo", 
	"easeInBack", "easeOutBack", "easeInOutBack", 
	"easeInElastic", "easeOutElastic", "easeInOutElastic", 
	"easeOutBounce", "easeInBounce", "easeInOutBounce", 
	"cubicEase", "cubicEaseIn", "cubicEaseOut", "cubicEaseInOut", "cubicEaseOutIn",
	"stepEnd", "stepStart"
	
];

var makeGraph = function(sEffect) {
	var f = jindo.m.Effect[sEffect](0, 200);
	if (sEffect == "pulse") {
		f = jindo.m.Effect[sEffect](3)(0, 200);	
	}
	if (sEffect == "wave") {
		f = jindo.m.Effect[sEffect](2, 0.5)(0, 200);
	}
	var elGraph = jindo.$(sEffect);
	
	for (var i = 0, nValue; i <= 200 ;i += 1) {
		nValue = (f(i / 200));
		var elDot = jindo.$('<div class="dot" style="left:'+i+'px; bottom:' + Math.round(nValue) + 'px;" />');
		elGraph.appendChild(elDot);
	}
}

for (var i = 0, sEffect; sEffect = aEffect[i]; i++) {
	makeGraph(sEffect);
}

module("Effect");
test("인스턴스 생성시 에러", function() {
	var nOccured = 0;
	try { new jindo.m.Effect() } catch(e) { nOccured++; }
	try { jindo.m.Effect.linear('block', 'block') } catch(e) { nOccured++; }
	equal(nOccured, 2);
});

test('linear 숫자로 테스트', function() {
	var f = jindo.m.Effect.linear(100, 200);
	equal(f(0), 100);
	equal(f(0.5), 150);
	equal(f(1.0), 200);
});

test('단위넣고 테스트', function() {
	var f = jindo.m.Effect.linear('100px', '200px');
	equal(f(0), '100px');
	equal(f(0.5), '150px');
	equal(f(1.0), '200px');
});

test('단위가 다르면 에러 발생', function() {
	var nOccured = 0;

	try { jindo.m.Effect.linear(100, '200px')(.1); } catch(e) { nOccured++; }
	try { jindo.m.Effect.linear('100', '200px')(.1); } catch(e) { nOccured++; }
	try { jindo.m.Effect.linear('100%', '200px')(.1); } catch(e) { nOccured++; }
	try { jindo.m.Effect.linear('100px', '200pt')(.1); } catch(e) { nOccured++; }
	try { jindo.m.Effect.linear('#ff00ff', 200)(.1); } catch(e) { nOccured++; }
	try { jindo.m.Effect.linear('rgb(255, 127, 0)', '200px')(.1); } catch(e) { nOccured++; }
	equal(nOccured, 6);
});

test('색상 단위 테스트', function() {
	var f = jindo.m.Effect.linear('#f0f', 'rgb(0, 255, 0)');
	equal(f(0), '#FF00FF');
	equal(f(0.5), '#808080');
	equal(f(1.0), '#00FF00');
	
	var f = jindo.m.Effect.linear('#000000', 'rgb(2, 2, 2)');
	equal(f(0), '#000000');
	equal(f(0.5), '#010101');
	equal(f(1.0), '#020202');

	var f = jindo.m.Effect.linear('#000000', 'rgba(2, 2, 2, 0)');
	equal(f(0), '#000000');
	equal(f(0.5), 'rgba(1,1,1,0.5)');
	equal(f(1.0), 'rgba(2,2,2,0)');

	var f = jindo.m.Effect.linear('#000000', 'rgba(2, 2, 2, 0)');
	equal(f(0), '#000000');
	equal(f(0.5), 'rgba(1,1,1,0.5)');
	equal(f(1.0), 'rgba(2,2,2,0)');

	var f = jindo.m.Effect.linear('hsl(120, 50%, 20%)', 'hsl(700,20%,80%)');
	equal(f(0), 'hsl(120,50%,20%)');
	equal(f(0.5), 'hsl(410,35%,50%)');
	equal(f(1.0), 'hsl(700,20%,80%)');

	var f = jindo.m.Effect.linear('hsla(120, 50%, 20%, .4)', 'hsla(900,20%,80%,1)');
	equal(f(0), 'hsla(120,50%,20%,0.4)');
	equal(f(0.5), 'hsla(510,35%,50%,0.7)');
	equal(f(1.0), 'hsl(900,20%,80%)');

	var f = jindo.m.Effect.linear('rgb(0, 255, 0)', 'hsl(700,20%,80%)');
	equal(f(0), '#00FF00');
	equal(f(0.5), '#6BE165');
	equal(f(1.0), '#D6C2C9');

	var f = jindo.m.Effect.linear('rgba(0, 255, 0, 0)', 'hsla(700,20%,80%,1)');
	equal(f(0), 'rgba(0,255,0,0)');
	equal(f(0.5), 'rgba(107,225,101,0.5)');
	equal(f(1.0), '#D6C2C9');

});
				
test("시작값 나중에 지정 (setStart)", function() {
	var nOccured = 0;
	var f = jindo.m.Effect.linear(200);
	f.setStart(100);
	equal(f(0.5), 150);
	
	try {
		f.setStart("100px");
		f(0.5);
	} catch (e) {
		nOccured++;
	}
	equal(nOccured, 1);
});

test("시작값, 종료값 나중에 지정 (start, end property)", function() {
	var nOccured = 0;
	var f = jindo.m.Effect.linear();
	f.start = 100;
	f.end = 200;
	equal(f(0.5), "150");
	
	f.start = "100px";
	try {
		f(0.5);
	} catch (e) {
		nOccured++;
	}
	equal(nOccured, 1);
});

module("linear");
test("linear(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.linear(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});

module("sinusoidal");
test("sinusoidal(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.sinusoidal(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});

module("overphase");
test("overphase(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.overphase(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});

module("mirror");
test("mirror(0, 100) 이펙트의 초기값은 0, 중간값은 100, 마지막 값은 0이다.", function() {
	var f = jindo.m.Effect.mirror(0, 100);
	equal(f(0), 0);
	equal(f(0.5), 100);
	equal(f(1), 0);
});

module("pulse");
test("pulse(3)(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.pulse(2)(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});

module("wave");
test("wave(2, 0.5)(0, 100) 이펙트의 초기값은 0, 마지막 값은 0이다.", function() {
	var f = jindo.m.Effect.wave(2, 0.5)(0, 100);
	equal(f(0), 0);
	equal(f(1), 0);
});


module("easeIn");
test("easeIn(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeIn(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeOut");
test("easeOut(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeOut(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeInOut");
test("easeInOut(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInOut(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeOutIn");
test("easeOutIn(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeOutIn(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});

module("easeInSine");
test("easeInSine(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInSine(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeOutSine");
test("easeOutSine(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeOutSine(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeInOutSine");
test("easeInOutSine(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInOutSine(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeOutInSine");
test("easeOutInSine(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeOutInSine(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});

module("easeInQuad");
test("easeInQuad(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInQuad(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeOutQuad");
test("easeOutQuad(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeOutQuad(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeInOutQuad");
test("easeInOutQuad(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInOutQuad(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeOutInQuad");
test("easeOutInQuad(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeOutInQuad(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});

module("easeInQuart");
test("easeInQuart(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInQuart(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeOutQuart");
test("easeOutQuart(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeOutQuart(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeInOutQuart");
test("easeInOutQuart(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInOutQuart(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeOutInQuart");
test("easeOutInQuart(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeOutInQuart(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});

module("easeInQuint");
test("easeInQuint(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInQuint(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeOutQuint");
test("easeOutQuint(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeOutQuint(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeInOutQuint");
test("easeInOutQuint(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInOutQuint(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeOutInQuint");
test("easeOutInQuint(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeOutInQuint(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});



module("easeInExpo");
test("easeInExpo(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInExpo(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeOutExpo");
test("easeOutExpo(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeOutExpo(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeInOutExpo");
test("easeInOutExpo(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInOutExpo(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeOutInExpo");
test("easeOutInExpo(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeOutInExpo(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});



module("easeInCircle");
test("easeInCircle(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInCircle(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeOutCircle");
test("easeOutCircle(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeOutCircle(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeInOutCircle");
test("easeInOutCircle(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInOutCircle(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeOutInCircle");
test("easeOutInCircle(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeOutInCircle(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});



module("easeInBack");
test("easeInBack(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInBack(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeOutBack");
test("easeOutBack(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeOutBack(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeInOutBack");
test("easeInOutBack(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInOutBack(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});

module("bounce");
test("bounce(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.bounce(0, 100)
	equal(f(0), 0);
	equal(f(1), 100);
});


module("easeInElastic");
test("easeInElastic(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInElastic(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeOutElastic");
test("easeOutElastic(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeOutElastic(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeInOutElastic");
test("easeInOutElastic(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInOutElastic(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});


module("easeInBounce");
test("easeInBounce(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInBounce(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeOutBounce");
test("easeOutBounce(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeOutBounce(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});
module("easeInOutBounce");
test("easeInOutBounce(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.easeInOutBounce(0, 100);
	equal(f(0), 0);
	equal(f(1), 100);
});



module("cubicEase");
test("cubicEase(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.cubicEase(0, 100)
	equal(f(0), 0);
	equal(f(1), 100);
});

module("cubicEaseIn");
test("cubicEaseIn(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.cubicEaseIn(0, 100)
	equal(f(0), 0);
	equal(f(1), 100);
});

module("cubicEaseOut");
test("cubicEaseOut(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.cubicEaseOut(0, 100)
	equal(f(0), 0);
	equal(f(1), 100);
});

module("cubicEaseInOut");
test("cubicEaseInOut(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.cubicEaseInOut(0, 100)
	equal(f(0), 0);
	equal(f(1), 100);
});

module("cubicEaseOutIn");
test("cubicEaseOutIn(0, 100) 이펙트의 초기값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.cubicEaseOutIn(0, 100)
	equal(f(0), 0);
	equal(f(1), 100);
});

module("stepStart");
test("stepStart(0, 100) 이펙트의 초기값은 0, 중간값은 100, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.stepStart(0, 100)
	equal(f(0), 0);
	equal(f(0.5), 100);
	equal(f(1), 100);
});

module("stepEnd");
test("stepEnd(0, 100) 이펙트의 초기값은 0, 중간값은 0, 마지막 값은 100이다.", function() {
	var f = jindo.m.Effect.stepEnd(0, 100)
	equal(f(0), 0);
	equal(f(0.5), 0);
	equal(f(1), 100);
});

module("단위가 없는 0 으로의 변화");
test("linear(0, 100px) 의 0.5 시점은 50px", function() {
	var f = jindo.m.Effect.linear(0, '100px')
	equal(f(0.5), '50px');
});

module("단위가 있는 0 으로의 변화");
test("linear(0%, 100px) 의 0.5 시점은 50px", function() {
	var f = jindo.m.Effect.linear('0%', '100px')
	equal(f(0.5), '50px');
});

module("단위가 있는 0 으로의 변화");
test("linear(0px, 100%) 의 0.5 시점은 50%", function() {
	var f = jindo.m.Effect.linear('0px', '100%')
	equal(f(0.5), '50%');
});

module("다양한 종류의 시작값, 종료값 지원 #1");
test("linear('0% 50px', '100px 250px') 의 0.5 시점은 '50px 150px'", function() {
	var f = jindo.m.Effect.linear('0% 50px', '100px 250px')
	equal(f(0.5), '50px 150px');
});

module("다양한 종류의 시작값, 종료값 지원 #2");
test("linear('-500px 100px 3em 20%', '300px 0% 5em 80%') 의 0.5 시점은 '-100px 50px 4em 50%'", function() {
	var f = jindo.m.Effect.linear('-500px 100px 3em 20%', '300px 0% 5em 80%')
	equal(f(0.5), '-100px 50px 4em 50%');
});

module("다양한 종류의 시작값, 종료값 지원 #3");
test("linear('50px', '0px 20px 30px 40px') 의 0.5 시점은 '25px 35px 40px 45px'", function() {
	var f = jindo.m.Effect.linear('50px', '0px 20px 30px 40px')
	equal(f(0.5), '25px 35px 40px 45px');
});

module("다양한 종류의 시작값, 종료값 지원 #4");
test("linear('50px 100px', '0px 20px 30px 40px') 의 0.5 시점은 '25px 60px 40px 70px'", function() {
	var f = jindo.m.Effect.linear('50px 100px', '0px 20px 30px 40px')
	equal(f(0.5), '25px 60px 40px 70px');
});

module("다양한 종류의 시작값, 종료값 지원 #5");
test("linear('50px 100px 0px', '0px 20px 30px 40px') 의 0.5 시점은 '25px 60px 15px 70px'", function() {
	var f = jindo.m.Effect.linear('50px 100px 0px', '0px 20px 30px 40px')
	equal(f(0.5), '25px 60px 15px 70px');
});

module("다양한 종류의 시작값, 종료값 지원 #6");
test("linear('0% 0% 0% 0%', '100px 120px 60em 50%') 의 0.5 시점은 '50px 60px 30em 25%'", function() {
	var f = jindo.m.Effect.linear('0% 0% 0% 0%', '100px 120px 60em 50%')
	equal(f(0.5), '50px 60px 30em 25%');
});
