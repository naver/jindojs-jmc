module("Touch Component Test", {
	setup: function() {
		var el = jindo.$('div1');
		oTouch = new jindo.m.Touch(el,{
		});
	},
	teardown : function() {
	}
} );

// test("기울기구하기", function() {
// 	window.innerWidth = 300;
// 	window.innerHeight = 800;
// 	oTouch._setSlope();

// 	var htslope = oTouch.getSlope();

// 	equal(htslope.nHSlope, 1.33, "swipe 기울기");
// 	equal(htslope.nVSlope, 5.33, 'scroll 기울기');
// });

// test("기울기 저장하기", function() {
// 	oTouch.setSlope(5,1.2);

// 	var htslope = oTouch.getSlope();

// 	equal(htslope.nHSlope, 1.2, "swipe 기울기");
// 	equal(htslope.nVSlope, 5, 'scroll 기울기');
// });

// test('reset 함수', function(){
// 	oTouch._resetTouchInfo();

// 	ok(!oTouch.bStart, 'reset함수 실행');
// 	ok(oTouch._htMoveInfo.nStartX == 0, '좌표 정보 reset');
// });

// test('움직임 분석', function(){
// 	oTouch._htMoveInfo.nStartX = 0;
// 	oTouch._htMoveInfo.nStartY = 0;

// 	var nMoveType = oTouch._getMoveType([{nX:3, nY:3}]);
// 	equal(nMoveType, 3, '5픽셀이하이면 tap으로 분석한다');

// 	var nMoveType = oTouch._getMoveType([{nX:10, nY:5}]);
// 	equal(nMoveType, -1, '움직임이 5픽셀 이상이면서  분석 기준 픽셀보다 작으면 분석 불가능');

// 	var nMoveType = oTouch._getMoveType([{nX: 30, nY:5}]);
// 	equal(nMoveType, 0, 'swipe 로 분석');

// 	var nMoveType = oTouch._getMoveType([{nX: 5, nY:39}]);
// 	equal(nMoveType, 1, 'scroll 이벤트로 분석');

// 	var nMoveType = oTouch._getMoveType([{nX: 25, nY:39}]);
// 	equal(nMoveType, 2, 'diagonal 이벤트로 분석');

// });

// test('_startLongTapTimer', function(){
// 	var bLongTap = false;
// 	oTouch.attach({
// 		'longTap' : function(oCustomEvt){
// 			bLongTap = true;
// 		}
// 	});
// 	oTouch._startLongTapTimer([{el: 'element', nX : 10, nY : 10}], {});
// 	ok(typeof oTouch._nLongTapTimer != 'undefined', '롱탭 타이머 시작');
// 	stop();

// 	setTimeout(function(){
// 		ok(bLongTap, 'longTap 커스텀 이벤트 발생함');
// 		start();
// 	}, 1500);
// });

// test('_deleteLongTapTimer', function(){
// 	oTouch.attach({
// 		'longTap' : function(oCustomEvt){
// 		}
// 	});
// 	oTouch._startLongTapTimer([{el: 'element', nX : 10, nY : 10}], {});
// 	ok(typeof oTouch._nLongTapTimer != 'undefined', '롱탭 타이머 시작');
// 	oTouch._deleteLongTapTimer();
// 	ok(typeof oTouch._nLongTapTimer === 'undefined', '롱탭 타이머 삭제');

// });

// test('_isDblTap', function(){
// 	//현재 정보를 tap으로 설정한다.
// 	oTouch._nTapTimer = 25;
// 	oTouch.nMoveType = 3;

// 	oTouch.htEndInfo = {
// 		movetype : 3,
// 		nX : 110,
// 		nY : 20
// 	};

// 	var nGap = oTouch.option('nTapThreshold')-1;
// 	ok(oTouch._isDblTap(oTouch.htEndInfo.nX+nGap, oTouch.htEndInfo.nY+nGap) , '더블탭으로 판단한다');

// 	nGap = oTouch.option('nTapThreshold')+5;
// 	ok(!oTouch._isDblTap(oTouch.htEndInfo.nX+nGap, oTouch.htEndInfo.nY+nGap) , 'nTapThreshold 이상일 경우 더블탭으로 판단하지 않는다.');
// });


// test('_getCustomEventParam', function(){
// 	oTouch._htMoveInfo = {
// 		nStartX : 0,
// 		nStartY : 0,
// 		nBeforeX : 20,
// 		nBeforeY : 20,
// 		nStartTime : 1,
// 		aPos : [0]
// 	};

// 	var htParam = oTouch._getCustomEventParam([{
// 		nX : 40,
// 		nY : 50,
// 		nTime : 20
// 	}]);
// 	equal(htParam.nDistanceX , 40, 'X축으로 최종이동 거리');
// 	equal(htParam.nDistanceY , 50, 'Y축으로 최종이동 거리');
// 	equal(htParam.nVectorX , 20, 'X축으로  바로 직전과의 차이');
// 	equal(htParam.nVectorY , 30, 'X축으로  바로 직전과의 차이');

// });


test('touch 이벤트', function(){
	var htPos = {
		pageX : 100,
		pageY : 50
	}
	var htParam ={
		element : jindo.$('div1'),
		pos : function(){return htPos;},
		oEvent : {
			stop : function(){return true;}
		},
		$value :  function(){return {
			timeStamp : 0,
			changedTouches : [{ target : jindo.$('div1'), pageX : htPos.pageX, pageY : htPos.pageY}],
			touches : [{ target : jindo.$('div1'), pageX : htPos.pageX, pageY : htPos.pageY}]
		}}
	};
	oTouch._onStart(htParam);

	equal(oTouch._htMoveInfo.nStartX, htPos.pageX, 'onStart에서의 info 설정');
	equal(oTouch._htMoveInfo.nStartY, htPos.pageY, 'onStart에서의 info 설정');

	htPos.pageX = 150;
	htPos.pageY = 50;
	oTouch._onMove(htParam);
	equal(oTouch._htMoveInfo.nBeforeX, htPos.pageX, 'onMove에서의 info 설정');
	equal(oTouch._htMoveInfo.nBeforeY, htPos.pageY, 'onMove에서의 info 설정');

	equal(oTouch.nMoveType,  0,'moveType 분석');

	htPos.pageX = 100;
	htPos.pageY = 30;

	oTouch._onEnd(htParam);

	equal(oTouch.htEndInfo.movetype,  0,'touchEnd에서는 마지막 터치 정보 moveType');
	equal(oTouch.htEndInfo.nX,  htPos.pageX ,'touchEnd에서는 마지막 터치 정보  X');
	equal(oTouch.htEndInfo.nY,  htPos.pageY ,'touchEnd에서는 마지막 터치 정보  Y');
});
