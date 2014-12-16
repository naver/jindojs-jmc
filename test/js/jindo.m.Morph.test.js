module("Morph");

asyncTest('none - bUseTransition : ' + true, function() {

	var elBox = jindo.$('box');
	var welBox = jindo.$Element(elBox);

	elBox.scrollTop = 0;

	welBox.css('display', 'none');
	equal(welBox.css('left'), '10px', '시작 left 값 확인');
	equal(welBox.css('top'), '10px', '시작 top 값 확인');
	equal(elBox.scrollTop, 0, '시작 scrollTop 값 확인');

	var morph = new jindo.m.Morph({ 'bUseTransition' : true });

	morph.pushAnimate(1000, [ elBox, {
		'@left' : '50px',
		'@top' : '100px',
		'scrollTop' : 100
	} ]).pushCall(function() {
		equal(welBox.css('left'), '50px', '마지막 left 값 확인');
		equal(welBox.css('top'), '100px', '마지막 top 값 확인');

		elBox.style.cssText = '';
		start();
	})

	morph.play();

});

function checkGeneral(bUseTransition) {

	asyncTest('checkGeneral - bUseTransition : ' + bUseTransition, function() {

		var elBox = jindo.$('box');
		var welBox = jindo.$Element(elBox);

		elBox.scrollTop = 0;

		equal(welBox.css('left'), '10px', '시작 left 값 확인');
		equal(welBox.css('top'), '10px', '시작 top 값 확인');
		equal(elBox.scrollTop, 0, '시작 scrollTop 값 확인');

		var morph = new jindo.m.Morph({ 'bUseTransition' : bUseTransition });
		var _;

		morph.pushAnimate(1000, [ elBox, {
			'@left' : '50px',
			'@top' : '100px',
			'scrollTop' : 100
		} ]).pushCall(function() {

			equal(welBox.css('left'), '50px', '마지막 left 값 확인');
			equal(welBox.css('top'), '100px', '마지막 top 값 확인');
			equal(elBox.scrollTop, 100, '마지막 scrollTop 값 확인');

			_ = new Date();

		}).pushWait(1000).pushCall(function() {

			ok(new Date() - _ >= 1000, '1초가 지난후');
			_ = new Date();

		}).pushAnimate(500, [ elBox, {
			'@left' : '50px',
			'@top' : '100px',
		} ]).pushCall(function() {

			ok(new Date() - _ >= 500, '0.5초가 지난후');

			elBox.style.cssText = '';
			start();

		});

		morph.play();

	});

}

checkGeneral(false);
checkGeneral(true);

function checkInterrupt(bUseTransition) {

	asyncTest('checkInterrupt - bUseTransition : ' + bUseTransition, function() {

		var elBox = jindo.$('box');
		var welBox = jindo.$Element(elBox);

		elBox.scrollTop = 0;

		equal(welBox.css('left'), '10px', '시작 left 값 확인');
		equal(welBox.css('top'), '10px', '시작 top 값 확인');
		equal(elBox.scrollTop, 0, '시작 scrollTop 값 확인');

		var morph = new jindo.m.Morph({ 'bUseTransition' : bUseTransition });
		var _;

		morph.pushAnimate(1000, [ elBox, {
			'@left' : [ 0, '50px' ],
			'@top' : jindo.m.Effect.linear(0, '100px'),
			'scrollTop' : 100
		} ]);

		morph.play();

		setTimeout(function() {
			
			morph.pause();

			var left = parseInt(welBox.css('left'), 10);
			var top = parseInt(welBox.css('top'), 10);

			ok(20 < left && left < 30 && 45 < top && top < 55, '멈추었을때 오차허용범위안에 위치 (' + left + ', ' + top + ')');

			morph.clear();

			morph.pushAnimate(1000, [ elBox, {
				'@left' : '100px',
				'@top' : '0px'
			} ]).pushCall(function() {
				equal(welBox.css('left'), '100px', '마지막 left 값 확인');
				equal(welBox.css('top'), '0px', '마지막 top 값 확인');

				elBox.style.cssText = '';
				start();
			});

			morph.play();

		}, 500);

	});

}

checkInterrupt(false);
checkInterrupt(true);
