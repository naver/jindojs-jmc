var oObj1 = document.createElement('a');
var oObj2 = document.createElement('b');
var oObj3 = document.createElement('h');

test("get", function() {

	var oKF = new jindo.m.Keyframe({ fEffect : jindo.m.Effect.linear });

	oKF.set(0.1, [
		oObj1, { '@left' : '300px', 'scrollTop' : 100 },
		oObj2, { '@top' : '300px' },
		oObj3, { '@transform' : 'translate3d(0%,0,50px) scale(2,4) rotateX(30deg)'}
	]);

	oKF.set(0.5, [
		oObj1, { '@left' : jindo.m.Effect.easeIn('600px') }
	]);

	oKF.set(0.9, [
		oObj2, { '@top' : '100px', 'scrollTop' : 10 },
		oObj3, { '@transform' : 'translate3d(10px,100px,250px) scale(1,1) rotateX(-270deg)'}
	]);

	try {
		oKF.get(0.1);
		ok(false, 'preprocess 를 호출하라는 에러가 발생하지 않음');
	} catch(e) {
		ok(true, 'preprocess 를 호출하라는 에러가 발생해야 함');
	}

	oKF.preprocess();

	function checkGet(rate, data1, data2, data3) {

		var get = oKF.get(rate);
		var waGet = jindo.$A(get);

		equal(get.length, 6, '반환 갯수 확인 - ' + rate);

		for (var i = 0; i < 6; i += 2) {

			switch (get[i]) {
			case oObj1:
				deepEqual(get[i + 1], data1, '첫번째 객체의 속성');
				break;
			case oObj2:
				deepEqual(get[i + 1], data2, '두번째 객체의 속성');
				break;
			case oObj3:
				deepEqual(get[i + 1], data3, '세번째 객체의 속성');
				break;
			}

		}

	}

	//////////////////////////////// GET 0.0
	checkGet(0.0, {
		'@left' : '300px', 'scrollTop' : 100
	}, {
		'@top' : '300px', 'scrollTop' : 10
	}, {
		'@transform' : 'translateZ(50px) translateX(0px) translateY(0px) scaleX(2) scaleY(4) rotateX(30deg)'
	});

	//////////////////////////////// GET 0.1
	checkGet(0.1, {
		'@left' : '300px', 'scrollTop' : 100
	}, {
		'@top' : '300px', 'scrollTop' : 10
	}, {
		'@transform' : 'translateZ(50px) translateX(0px) translateY(0px) scaleX(2) scaleY(4) rotateX(30deg)'
	});

	//////////////////////////////// GET 0.2
	checkGet(0.2, {
		'@left' : '304.6875px', 'scrollTop' : 100
	}, {
		'@top' : '275px', 'scrollTop' : 10
	}, {
		'@transform' : 'translateZ(75px) translateX(1.25px) translateY(12.5px) scaleX(1.875) scaleY(3.625) rotateX(-7.5deg)'
	});

	//////////////////////////////// GET 0.4
	checkGet(0.4, {
		'@left' : '426.5625px', 'scrollTop' : 100
	}, {
		'@top' : '225px', 'scrollTop' : 10
	}, {
		'@transform' : 'translateZ(125px) translateX(3.75px) translateY(37.5px) scaleX(1.625) scaleY(2.875) rotateX(-82.5deg)'
	});

	//////////////////////////////// GET 0.5
	checkGet(0.5, {
		'@left' : '600px', 'scrollTop' : 100
	}, {
		'@top' : '200px', 'scrollTop' : 10
	}, {
		'@transform' : 'translateZ(150px) translateX(5px) translateY(50px) scaleX(1.5) scaleY(2.5) rotateX(-120deg)'
	});

	//////////////////////////////// GET 0.9
	checkGet(0.9, {
		'@left' : '600px', 'scrollTop' : 100
	}, {
		'@top' : '100px', 'scrollTop' : 10
	}, {
		'@transform' : 'translate3d(10px,100px,250px) scale(1,1) rotateX(-270deg)'
	});

	//////////////////////////////// GET 1.0
	checkGet(1.0, {
		'@left' : '600px', 'scrollTop' : 100
	}, {
		'@top' : '100px', 'scrollTop' : 10
	}, {
		'@transform' : 'translate3d(10px,100px,250px) scale(1,1) rotateX(-270deg)'
	});

});

test("frame", function() {

	var oKF = new jindo.m.Keyframe({ fEffect : jindo.m.Effect.linear });

	oKF.set(0.1, [
		oObj1, { '@left' : '300px', '@bottom' : '100px' },
		oObj2, { '@top' : '300px', 'foo' : 100, '@left' : '30px', '@textIndent' : '67px' },
		oObj3, { '@transform' : 'scale(2) translateX(30px)', '@left' : '50px' }
	]);

	oKF.set(0.5, [
		oObj1, { '@left' : '600px' },
		oObj2, { '@left' : jindo.m.Effect.stepStart('50px'), '@textIndent' : jindo.m.Effect.stepEnd('-300px') },
		oObj3, { '@transform' : 'scale(2.5) translateY(-30px)', '@left' : '0%' }
	]);

	oKF.set(0.9, [
		oObj2, { '@top' : '100px', 'bottom' : '10px', 'foo' : 200 }
	]);

	try {
		oKF.frame(0.1);
		ok(false, 'preprocess 를 호출하라는 에러가 발생하지 않음');
	} catch(e) {
		ok(true, 'preprocess 를 호출하라는 에러가 발생해야 함');
	}

	oKF.preprocess();

	function parseCssText(cssText) {
		var ret = {};
		cssText.replace(/([a-z\-]+)\s*:\s*([^;]*);/g, function(_, key, val) {
			ret[key] = val;
		});
		return ret;
	};

	oKF.frame(0.0000000009);
	deepEqual(parseCssText(oObj2.style.cssText), { 'top' : '300px', 'left' : '30px', 'text-indent' : '67px' }, 'frame(0.0000000009)');

	oKF.frame(0.1);
	deepEqual(parseCssText(oObj1.style.cssText), { 'left' : '300px', 'bottom' : '100px' }, 'frame(0.1)');
	equal(oObj2.foo, '100');
	deepEqual(parseCssText(oObj2.style.cssText), { 'top' : '300px', 'left' : '30px', 'text-indent' : '67px' });
	deepEqual(parseCssText(oObj3.style.cssText), { 'left' : '50px', "-webkit-transform" : "scaleX(2) scaleY(2) translateX(30px) translateY(0px)" });

	oKF.frame(0.1000000001);
	deepEqual(parseCssText(oObj2.style.cssText), { 'top' : '300px', 'left' : '50px', 'text-indent' : '67px' }, 'frame(0.1000000001)');

	oKF.frame(0.3);
	deepEqual(parseCssText(oObj1.style.cssText), { 'left' : '450px', 'bottom' : '100px' }, 'frame(0.3)');
	equal(oObj2.foo, '125');
	deepEqual(parseCssText(oObj2.style.cssText), { 'top' : '250px', 'left' : '50px', 'text-indent' : '67px' });
	deepEqual(parseCssText(oObj3.style.cssText), { 'left' : '25px', "-webkit-transform" : "scaleX(2.25) scaleY(2.25) translateX(15px) translateY(-15px)" });

	oKF.frame(0.4999999999);
	deepEqual(parseCssText(oObj2.style.cssText), { 'top' : '200px', 'left' : '50px', 'text-indent' : '67px' }, 'frame(0.4999999999)');

	oKF.frame(0.5);
	deepEqual(parseCssText(oObj2.style.cssText), { 'top' : '200px', 'left' : '50px', 'text-indent' : '-300px' }, 'frame(0.5)');

	oKF.frame(0.5000000001);
	deepEqual(parseCssText(oObj2.style.cssText), { 'top' : '200px', 'left' : '50px', 'text-indent' : '-300px' }, 'frame(0.5000000001)');

	oKF.frame(0.6);
	deepEqual(parseCssText(oObj1.style.cssText), { 'left' : '600px', 'bottom' : '100px' }, 'frame(0.6)');
	equal(oObj2.foo, '162.5');
	deepEqual(parseCssText(oObj2.style.cssText), { 'top' : '175px', 'left' : '50px', 'text-indent' : '-300px' });
	deepEqual(parseCssText(oObj3.style.cssText), { 'left' : '0%', "-webkit-transform" : "scale(2.5) translateY(-30px)" });

	oKF.frame(1.0);
	deepEqual(parseCssText(oObj1.style.cssText), { 'left' : '600px', 'bottom' : '100px' }, 'frame(1.0)');
	equal(oObj2.foo, '200');
	deepEqual(parseCssText(oObj2.style.cssText), { 'top' : '100px', 'left' : '50px', 'text-indent' : '-300px' });
	deepEqual(parseCssText(oObj3.style.cssText), { 'left' : '0%', "-webkit-transform" : "scale(2.5) translateY(-30px)" });

});

test("get2", function() {

	var checkRange = function(from, to) {

		var v;

		var oKF = new jindo.m.Keyframe({ fEffect : jindo.m.Effect.linear });
		oKF.set(from, [ oObj1, { '@left' : '200px' } ]);
		oKF.set(to, [ oObj1, { '@left' : '600px' } ]);
		oKF.preprocess();

		deepEqual(oKF.get(v=from-5)[1], { '@left' : '200px' }, from + ' ~ ' + to + ' #1 : ' + v);
		deepEqual(oKF.get(v=from)[1], { '@left' : '200px' }, from + ' ~ ' + to + ' #2 : ' + v);
		deepEqual(oKF.get(v=(from+to)/2)[1], { '@left' : '400px' }, from + ' ~ ' + to + ' #3 : ' + v);
		deepEqual(oKF.get(v=to)[1], { '@left' : '600px' }, from + ' ~ ' + to + ' #4 : ' + v);
		deepEqual(oKF.get(v=to+5)[1], { '@left' : '600px' }, from + ' ~ ' + to + ' #5 : ' + v);

	};

	checkRange(0, 1);
	checkRange(10, 20);
	checkRange(-10, 0);
	checkRange(0, 500);
	checkRange(-500, 300);
	checkRange(-500, -100);

});

test("set2", function() {

	var checkRange = function(from, to) {

		var v;

		var oKF = new jindo.m.Keyframe({ fEffect : jindo.m.Effect.linear });
		var oProps = { '@left' : { } };
		oProps['@left'][from] = '200px';
		oProps['@left'][to] = '600px';

		oKF.set(oObj1, oProps);
		oKF.preprocess();

		deepEqual(oKF.get(v=from-5)[1], { '@left' : '200px' }, from + ' ~ ' + to + ' #1 : ' + v);
		deepEqual(oKF.get(v=from)[1], { '@left' : '200px' }, from + ' ~ ' + to + ' #2 : ' + v);
		deepEqual(oKF.get(v=(from+to)/2)[1], { '@left' : '400px' }, from + ' ~ ' + to + ' #3 : ' + v);
		deepEqual(oKF.get(v=to)[1], { '@left' : '600px' }, from + ' ~ ' + to + ' #4 : ' + v);
		deepEqual(oKF.get(v=to+5)[1], { '@left' : '600px' }, from + ' ~ ' + to + ' #5 : ' + v);

	};

	checkRange(0, 1);
	checkRange(10, 20);
	checkRange(-10, 0);
	checkRange(0, 500);
	checkRange(-500, 300);
	checkRange(-500, -100);

});

test("set3", function() {

	var checkRange = function(from, to) {

		var v;

		var oKF = new jindo.m.Keyframe({ fEffect : jindo.m.Effect.linear });
		var oProps = {};
		oProps[from] = { '@left' : '200px' };
		oProps[to] = { '@left' : '600px' };

		oKF.set(oObj1, oProps);
		oKF.preprocess();

		deepEqual(oKF.get(v=from-5)[1], { '@left' : '200px' }, from + ' ~ ' + to + ' #1 : ' + v);
		deepEqual(oKF.get(v=from)[1], { '@left' : '200px' }, from + ' ~ ' + to + ' #2 : ' + v);
		deepEqual(oKF.get(v=(from+to)/2)[1], { '@left' : '400px' }, from + ' ~ ' + to + ' #3 : ' + v);
		deepEqual(oKF.get(v=to)[1], { '@left' : '600px' }, from + ' ~ ' + to + ' #4 : ' + v);
		deepEqual(oKF.get(v=to+5)[1], { '@left' : '600px' }, from + ' ~ ' + to + ' #5 : ' + v);

	};

	checkRange(0, 1);
	checkRange(10, 20);
	checkRange(-10, 0);
	checkRange(0, 500);
	checkRange(-500, 300);
	checkRange(-500, -100);

});