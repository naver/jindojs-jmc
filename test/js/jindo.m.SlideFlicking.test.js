/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
 var aAjaxData = [
    '<p>Layer1</p>',
    '<p>Layer2</p>',
    '<p>Layer3</p>',
    '<p>Layer4</p>',
    '<p>Layer5</p>',
    '<p>Layer6</p>',
    '<p>Layer7</p>'
];

module("jindo.m.SlideFlicking", {
    setup: function() {
            /** 객체 생성 */
            oFlicking1 = new jindo.m.SlideFlicking('mflick1', {
                "bUseCircular" : false,
                "nDefaultIndex" : 2
            });
            // http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/17
            oFlicking2 = new jindo.m.SlideFlicking('mflick2', {
                "nTotalContents" : aAjaxData.length,
                "bUseMomentum" : true,
                "bUseCircular" : true
            }).attach({
                'flicking' : function(oCustomEvt){
                    if(oCustomEvt.bCorrupt) {
                        // 전체 panel의 정보가 바뀔경우. 즉, nMoveCount가 1보다 클경우, 3개 panel의 모든 정보를 바꾼다.
                        this.getElement().html(aAjaxData[this.getContentIndex()]);
                        this.getNextElement().html(aAjaxData[this.getNextIndex()]);
                        this.getPrevElement().html(aAjaxData[this.getPrevIndex()]);

                    } else {
                        //플리킹 효과를 통해 현재 화면을 움직였을 경우
                        if(oCustomEvt.bNext){
                            //왼쪽으로 움직였을 경우 오른쪽 panel만 업데이트
                            this.getNextElement().html(aAjaxData[this.getNextIndex()]);
                        } else {
                            //오른쪽으로 움직였을 경우 왼쪽 panel만 업데이트
                            this.getPrevElement().html(aAjaxData[this.getPrevIndex()]);
                        }

                    }
            	}
            });
            /** 객체 생성 */
            oFlicking4 = new jindo.m.SlideFlicking('mflick4', {
                "bUseCircular" : true,
                "bUseTimingFunction" : true,
                "nTotalContents" : 2
            });
            /** 객체 생성 */
            oFlicking6 = new jindo.m.SlideFlicking('mflick6', {
                "bUseCircular" : true,
                "nTotalContents" : 7,
                "nDefaultIndex" : 2
            });
        },
        teardown : function() {
        	/** 객체 소멸 */
            oFlicking1.destroy();
            oFlicking2.destroy();
            oFlicking4.destroy();
        }
} );


test("기본설정", function() {
    stop();
    setTimeout(function(){
        // 비순환
        ok(oFlicking1.getContentIndex() == 2, 'nDefaultIndex 설정 옵션은 2번째 컨텐트');
        ok(oFlicking1.getTotalContents() == 5, "전체 플리킹 개수 ");
        ok(oFlicking1.getNextIndex() == 3, "다음 컨텐츠의 인덱스 정보 = 3 ");
        ok(oFlicking1.getPrevIndex() == 1, "이전 컨텐츠의 인덱스 정보 = 1 ");
        oFlicking1.moveTo(0,0);
        ok(oFlicking1.getContentIndex() == 0, '현재 index는 0번째 컨텐트');
        ok(oFlicking1.getPrevIndex() == 0, "이전 컨텐츠의 인덱스 정보 = 0 ");
        ok(oFlicking1.getNextIndex() == 1, "다음 컨텐츠의 인덱스 정보 = 1 ");
        oFlicking1.moveTo(4,0);
        ok(oFlicking1.getContentIndex() == 4, '현재 index는 4번째 컨텐트');
        ok(oFlicking1.getPrevIndex() == 3, "이전 컨텐츠의 인덱스 정보 = 3 ");
        ok(oFlicking1.getNextIndex() == 4, "다음 컨텐츠의 인덱스 정보 = 4 ");

        // 순환
        ok(oFlicking2.getContentIndex() == 0, '기본 설정 옵션은 0번째 컨텐트');
        ok(oFlicking2.getTotalContents() == aAjaxData.length, "전체 플리킹 개수 ");
        ok(oFlicking2.getNextIndex() == 1, "다음 컨텐츠의 인덱스 정보 = 1 ");
        ok(oFlicking2.getPrevIndex() == 6, "이전 컨텐츠의 인덱스 정보 = 6 ");
        ok(oFlicking2.getTotalContents() == aAjaxData.length, "전체 플리킹 개수 ");
        start();
    },500);
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/6
test('순환/비순환 moveTo()', function(){
    oFlicking2.moveTo(3, 1000);
    stop();

    setTimeout(function(){
        equal(oFlicking2.getContentIndex(), 3 ,'moveTo() 3번째 컨텐츠 이동');
        oFlicking2.moveTo(-1,0);
        equal(oFlicking2.getContentIndex(), 3 ,'moveTo() -1일 경우 이동하지 않음');
        oFlicking2.moveTo(10,0);
        equal(oFlicking2.getContentIndex(), 3 ,'moveTo() 초과일 경우 이동하지 않음');
        start();
    },1500);
});


test('비순환 moveNext()', function(){
    oFlicking1.moveTo(2,0);
    oFlicking1.moveNext();
    stop();

    setTimeout(function(){
        equal(oFlicking1.getContentIndex(), 3 ,'moveNext() 3번째 컨텐츠 이동');
        oFlicking1.moveNext();
        setTimeout(function(){
            equal(oFlicking1.getContentIndex(), 4 ,'moveNext() 4번째 컨텐츠 이동');
            oFlicking1.moveNext();
            setTimeout(function(){
                equal(oFlicking1.getContentIndex(), 4 ,'moveNext() 4번째 컨텐츠 이동');
              oFlicking1.moveNext();
                setTimeout(function(){
                    equal(oFlicking1.getContentIndex(), 4 ,'moveNext() 4번째 컨텐츠 이동');
                  start();
                },500);
            },500);
        },500);
    },500);
});


test('순환 moveNext()', function(){
    oFlicking2.moveTo(5,0);
    oFlicking2.moveNext();
    stop();

    setTimeout(function(){
        equal(oFlicking2.getContentIndex(), 6 ,'moveNext() 6번째 컨텐츠 이동');
        oFlicking2.moveNext();

        setTimeout(function(){
	equal(oFlicking2.getContentIndex(), 0 ,'moveNext() 0번째 컨텐츠 이동');
            oFlicking2.moveNext();
            setTimeout(function(){
                equal(oFlicking2.getContentIndex(), 1 ,'moveNext() 1번째 컨텐츠 이동');
                oFlicking2.moveNext();
                setTimeout(function(){
                    equal(oFlicking2.getContentIndex(), 2 ,'moveNext() 2번째 컨텐츠 이동');
                    start();
                },500);
            },500);
        },500);
    },500);
});

//http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/27
test("ios 인경우 패널의 reference 가 없어지는 문제 수정", function() {
    jindo.m.useTimingFunction = function() {
        return false;
    };
    var oFlicking = new jindo.m.SlideFlicking("mflick3", {
        "bUseCircular" : true,
        "nTotalContents" : aAjaxData.length,
        "bUseMomentum" : true
    });

    var aPanel = oFlicking.getPanels();
    oFlicking.moveTo(5,0);
    oFlicking.moveNext();
    stop();

    setTimeout(function(){
        equal(oFlicking.getContentIndex(), 6 ,'moveNext() 6번째 컨텐츠 이동');
        var aP1 = oFlicking.getPanels();
        ok(aPanel[0] === aP1[0],'패널 확인');
        ok(aPanel[1] === aP1[1],'패널 확인');
        ok(aPanel[2] === aP1[2],'패널 확인');
        oFlicking.moveNext();

        setTimeout(function(){
    equal(oFlicking.getContentIndex(), 0 ,'moveNext() 0번째 컨텐츠 이동');
            var aP2 = oFlicking.getPanels();
            ok(aPanel[0] === aP2[0],'패널 확인');
            ok(aPanel[1] === aP2[1],'패널 확인');
            ok(aPanel[2] === aP2[2],'패널 확인');
            oFlicking.moveNext();
            setTimeout(function(){
                equal(oFlicking.getContentIndex(), 1 ,'moveNext() 1번째 컨텐츠 이동');
                var aP3 = oFlicking.getPanels();
                ok(aPanel[0] === aP3[0],'패널 확인');
                ok(aPanel[1] === aP3[1],'패널 확인');
                ok(aPanel[2] === aP3[2],'패널 확인');
                oFlicking.moveNext();
                setTimeout(function(){
                    equal(oFlicking.getContentIndex(), 2 ,'moveNext() 2번째 컨텐츠 이동');
                    var aP4 = oFlicking.getPanels();
                    ok(aPanel[0] === aP4[0],'패널 확인');
                    ok(aPanel[1] === aP4[1],'패널 확인');
                    ok(aPanel[2] === aP4[2],'패널 확인');
                    start();
                },500);
            },500);
        },500);
    },500);
});


test('비순환 movePrev()', function(){
    oFlicking1.moveTo(3,0);
    oFlicking1.movePrev();
    stop();

    setTimeout(function(){
        equal(oFlicking1.getContentIndex(), 2 ,'movePrev() 2번째 컨텐츠 이동');
        oFlicking1.movePrev();
        setTimeout(function(){
            equal(oFlicking1.getContentIndex(), 1 ,'movePrev() 1번째 컨텐츠 이동');
            oFlicking1.movePrev();
            setTimeout(function(){
                equal(oFlicking1.getContentIndex(), 0 ,'movePrev() 0번째 컨텐츠 이동');
              oFlicking1.movePrev();
                setTimeout(function(){
                    equal(oFlicking1.getContentIndex(), 0 ,'movePrev() 0번째 컨텐츠 이동');
                  start();
                },500);
            },500);
        },500);
    },500);
});

test('순환 movePrev()', function(){
    oFlicking2.moveTo(2,0);
    oFlicking2.movePrev();
    stop();

    setTimeout(function(){
        equal(oFlicking2.getContentIndex(), 1 ,'movePrev() 1번째 컨텐츠 이동');
        oFlicking2.movePrev();
        setTimeout(function(){
            equal(oFlicking2.getContentIndex(), 0 ,'movePrev() 0번째 컨텐츠 이동');
            oFlicking2.movePrev();
            setTimeout(function(){
                equal(oFlicking2.getContentIndex(), 6 ,'movePrev() 6번째 컨텐츠 이동');
              oFlicking2.movePrev();
                setTimeout(function(){
                    equal(oFlicking2.getContentIndex(), 5 ,'movePrev() 5번째 컨텐츠 이동');
                  start();
                },500);
            },500);
        },500);
    },500);
});

test('isPlaying()', function(){
	oFlicking2.moveTo(1, 1000);
	ok(oFlicking2.isPlaying(), '현재 움직이고 있어요.');

	stop()
	setTimeout(function(){
		ok(!oFlicking2.isPlaying(), '움직임이 끝난 이후에는 false로 리턴');
		start();
	},2000);
});


test('offsetBug가 true일 경우 로직 확인 - 비순환 slide 일 경우에만 적용됨', function(){
    jindo.m.hasOffsetBug = function() {
        return true;
    };
    jindo.m.useCss3d = function() {
        return false;
    };
    jindo.m.useTimingFunction = function() {
        return false;
    };
    var oFlicking = new jindo.m.SlideFlicking("mflick3", {
        "bUseCircular" : false
    });
    ok(oFlicking._hasOffsetBug(),"offset버그가 존재한다");
    equal(parseInt(oFlicking._htWElement["container"].css("left"),10),0, "left는 0");
    equal(parseInt(oFlicking._htWElement["container"].css("top"),10),0, "top는 0");
    equal(oFlicking._htWElement["container"].css(jindo.m.getCssPrefix() + "Transform"),"translate(0px, 0px)", "translate도 translate(0px, 0px)");
    oFlicking.moveNext(100);
    stop();

    setTimeout(function(){
        equal(parseInt(oFlicking._htWElement["container"].css("left"),10),-100, "left는 -100");
        equal(parseInt(oFlicking._htWElement["container"].css("top"),10),0, "top는 0");
        equal(oFlicking._htWElement["container"].css(jindo.m.getCssPrefix() + "Transform"),"translate(0px, 0px)", "translate도 translate(0px, 0px)");

        oFlicking.moveNext(100);
        setTimeout(function(){
            equal(parseInt(oFlicking._htWElement["container"].css("left"),10),-200, "left는 -200");
            equal(parseInt(oFlicking._htWElement["container"].css("top"),10),0, "top는 0");
            equal(oFlicking._htWElement["container"].css(jindo.m.getCssPrefix() + "Transform"),"translate(0px, 0px)", "translate도 translate(0px, 0px)");
            oFlicking.destroy();
            start();
        },1000);
     },1000);
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/48
test("킷켓 하이라이트 문제 확인 모듈", function() {
	jindo.m.patch(jindo.m.Component.VERSION).add({
		"_hasKitkatHighlightBug" : function() {
			return 1;
		}
	});
	oFlicking1 = new jindo.m.SlideFlicking('mflick1', {
            "bUseCircular" : false,
            "nDefaultIndex" : 2
      });
	equal(oFlicking1._hasKitkatHighlightBug, true, "킷켓 하이라이트 버그가 존재하는 경우");
	equal(oFlicking1._htWElement["container"].hasClass(jindo.m.KITKAT_HIGHLIGHT_CLASS), true, "킷켓 하이라이트 잔상을 방지하기 위해, -webkit-tap-highlight-color: rgba(0,0,0,0) 으로 하위를 설정");
	oFlicking1._tapImpl();
	equal(oFlicking1._htWElement["container"].hasClass(jindo.m.KITKAT_HIGHLIGHT_CLASS), false, "클릭시 -webkit-tap-highlight-color: rgba(0,0,0,0) 을 제거");
	stop();
	setTimeout(function() {
		equal(oFlicking1._htWElement["container"].hasClass(jindo.m.KITKAT_HIGHLIGHT_CLASS), true, "킷켓 하이라이트 잔상을 방지하기 위해, -webkit-tap-highlight-color: rgba(0,0,0,0) 으로 하위를 설정");
		start();
	},300);
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/44
// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/16
asyncTest("beforeFlicking에서 stop 시 멈추는 문제 수정", function() {
    var nIndex = oFlicking1.getContentIndex();
    var nLeft = oFlicking1._nX;
    var nWidth = oFlicking1._htWElement["view"].width();
    equal(nIndex * nWidth, -nLeft, "좌표계와 인덱스 정보가 일치한다.");
    oFlicking1.attach({
        "beforeFlicking": function(we) {
            equal(we.nContentsNextIndex, nIndex+1, "다음 인덱스 정보가 정확한가?");
            we.stop();
            oFlicking1.detachAll();
            start();
        }
    });
    oFlicking1.moveNext(500);
    stop();

    setTimeout(function() {
         equal(oFlicking1.getContentIndex(), nIndex, "stop이 되어 원복되어있는가?");
        start();
    },1000);
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/18
test('컨텐츠의 개수가 무조건 3으로 설정되는 문제 수정()', function(){
    equal(aAjaxData.length, oFlicking2.getTotalContents(), "Total content값과 데이터의 길이는 같다");

    oFlicking2 = new jindo.m.SlideFlicking('mflick2', {
        "nTotalContents" : 20,
        "bUseMomentum" : true,
        "bUseCircular" : true
    });
    equal(oFlicking2.getTotalContents() ,20, "Total content값과 데이터의 길이는 같다");
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/40
test('컨텐츠의 개수가 2인 경우 순환 플리킹, bUseTimingFunction=true일 경우 애니메이션 방식 정상 동작 여부 확인', function(){
    equal(oFlicking4.getTotalContents() ,2, "Total content값이 2이다");
    // http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/5
    equal(oFlicking4._oAnimation._oMorph._getEffectCSS(oFlicking4.option("fpPanelEffect")), oFlicking4.option("fpPanelEffect").toString(), "bUseTimingFunction이 true일 경우에는 effect 타입이 null 이 아닌값이 나온");
    equal(oFlicking4.getTotalContents() ,2, "Total content값이 2이다");

    oFlicking4.moveNext();
    stop();

    setTimeout(function(){
        equal(oFlicking4.getContentIndex(), 1 ,'moveNext() 1번째 컨텐츠 이동');
        oFlicking4.moveNext();
        setTimeout(function(){
            equal(oFlicking4.getContentIndex(), 0 ,'moveNext() 0번째 컨텐츠 이동');
            oFlicking4.moveNext();
            setTimeout(function(){
                equal(oFlicking4.getContentIndex(), 1 ,'moveNext() 1번째 컨텐츠 이동');
              oFlicking4.moveNext();
                setTimeout(function(){
                    equal(oFlicking4.getContentIndex(), 0 ,'moveNext() 0번째 컨텐츠 이동');
                  start();
                },500);
            },500);
        },500);
    },500);
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/42
test('flicking시 bCorrupt 정상여부 확인', function(){
    var oFlicking = new jindo.m.SlideFlicking('mflick5', {
        "nTotalContents" : aAjaxData.length,
        "bUseCircular" : true
    });
    equal(oFlicking.getContentIndex(), 0,  "첫번째 위치는 0");
    // duration이 0이고 2개 이상 이동시
    oFlicking.attach("flicking" , function(we) {
            equal(we.nMoveCount, 3, "3개 이동");
            equal(we.bNext, true, "다음으로 이동");
            equal(we.bLeft, true, "다음으로 이동");
            equal(we.bCorrupt, true, "duration 이 0이고, 2개 이상 이동할 경우에는 bCorrupt가 true");
            equal(oFlicking.getContentIndex(), 3,  "이동한 위치는 3");

    });
    oFlicking.moveTo(3,0);
    oFlicking.detachAll();

    var nCount = 0;
    // duration이 0이 아니고, 2개 이상 이동시
    oFlicking.attach("flicking" , function(we) {
            equal(we.nMoveCount, 2, "2개 이동");
            equal(we.bNext, false, "이전으로 이동");
            equal(we.bLeft, false, "이전으로 이동");
            equal(we.bCorrupt, false, "duration 이 0이고, 2개 이상 이동할 경우에는 bCorrupt가 true");
            nCount++;
    });
    oFlicking.moveTo(1,1000);
    stop();
    setTimeout(function() {
        equal(nCount, 2, "총 2번 flicking 하였습니다.");
        equal(oFlicking.getContentIndex(), 1,  "이동한 위치는 1");
        oFlicking.detachAll();

        // duration 이 0이고 하나씩 이동시
        oFlicking.attach("flicking" , function(we) {
            equal(we.nMoveCount, 1, "1개 이동");
            equal(we.bNext, false, "이전으로 이동");
            equal(we.bLeft, false, "이전으로 이동");
            equal(we.bCorrupt, false, "duration 이 0이고, 2개 이상 이동할 경우에는 bCorrupt가 true");
            equal(oFlicking.getContentIndex(), 0,  "이동한 위치는 0");
        });
        oFlicking.movePrev(0);
        oFlicking.detachAll();


        // duration 이 0아니고, 하나씩 이동시
        oFlicking.attach("flicking" , function(we) {
            equal(we.nMoveCount, 1, "1개 이동");
            equal(we.bNext, false, "이전으로 이동");
            equal(we.bLeft, false, "이전으로 이동");
            equal(we.bCorrupt, false, "duration 이 0이고, 2개 이상 이동할 경우에는 bCorrupt가 true");
            equal(oFlicking.getContentIndex(), aAjaxData.length-1,  "이동한 위치는 " + (aAjaxData.length-1));
            start();
        });
        oFlicking.movePrev(1000);
    },1200);
});

// http://gitlab.jindo.nhncorp.com/sculove/jindo-mobile-component/issues/41
test('플리킹 초기시 view가 display:none일 경우 오류 수정', function(){
    jindo.$Element("mflick5").hide();
    var oFlicking = new jindo.m.SlideFlicking('mflick5', {
        "nTotalContents" : aAjaxData.length,
        "bUseCircular" : true
    });
    jindo.$Element("mflick5").show();
    oFlicking.resize(); //hide되서 다시 show 될 경우에 resize를 해줘야함.
    oFlicking.moveTo(5,0);
    oFlicking.moveNext();
    stop();

    setTimeout(function(){
        equal(oFlicking.getContentIndex(), 6 ,'moveNext() 6번째 컨텐츠 이동');
        oFlicking.moveNext();

        setTimeout(function(){
            equal(oFlicking.getContentIndex(), 0 ,'moveNext() 0번째 컨텐츠 이동');
            oFlicking.moveNext();
            setTimeout(function(){
                equal(oFlicking.getContentIndex(), 1 ,'moveNext() 1번째 컨텐츠 이동');
                oFlicking.moveNext();
                setTimeout(function(){
                    equal(oFlicking.getContentIndex(), 2 ,'moveNext() 2번째 컨텐츠 이동');
                    start();
                },500);
            },500);
        },500);
    },500);
});

// https://github.com/naver/jindojs-jmc/issues/1
test('when "bUseCircluar" option is "true" and "nDefaultIndex" is over 1, a position of panel elements is wrong' , function(){
    var nTotalContents= 7;
    equal(oFlicking6.getElement().html(), "2 index", "2 is ok");
    oFlicking6 = new jindo.m.SlideFlicking('mflick6', {
        "bUseCircular" : true,
        "nTotalContents" : nTotalContents,
        "nDefaultIndex" : 0
    });
    equal(oFlicking6.getElement().html(), "0 index", "0 is ok");
    oFlicking6 = new jindo.m.SlideFlicking('mflick6', {
        "bUseCircular" : true,
        "nTotalContents" : nTotalContents,
        "nDefaultIndex" : 1
    });
    equal(oFlicking6.getElement().html(), "1 index", "1 is ok");
    oFlicking6 = new jindo.m.SlideFlicking('mflick6', {
        "bUseCircular" : true,
        "nTotalContents" : nTotalContents,
        "nDefaultIndex" : 3
    });
    equal(oFlicking6.getElement().html(), "0 index", "3 is ok");
    oFlicking6 = new jindo.m.SlideFlicking('mflick6', {
        "bUseCircular" : true,
        "nTotalContents" : nTotalContents,
        "nDefaultIndex" : 4
    });
    equal(oFlicking6.getElement().html(), "1 index", "4 is ok");
    oFlicking6 = new jindo.m.SlideFlicking('mflick6', {
        "bUseCircular" : true,
        "nTotalContents" : nTotalContents,
        "nDefaultIndex" : 5
    });
    equal(oFlicking6.getElement().html(), "2 index", "5 is ok");
    oFlicking6 = new jindo.m.SlideFlicking('mflick6', {
        "bUseCircular" : true,
        "nTotalContents" : nTotalContents,
        "nDefaultIndex" : 6
    });
});

// https://github.com/naver/jindojs-jmc/issues/2
test("jindo.m.Flick returns wrong index at 'beforeFlicking' when 'bActivatedOnLoad' option of jindo.m.Flick was 'false'" , function(){
    var oFlicking7 = new jindo.m.SlideFlicking('mflick7', {
        "bUseCircular" : true,
        "nTotalContents" : 7,
        "bActivateOnload" : false
    });
    oFlicking7.attach({
        "beforeFlicking" :  function(e) {
            equal(e.nContentsNextIndex, 0, "초기 activated 될때 nContentsNextIndex값은 0");
            equal(e.bNext, null, "초기 activated 될때 bNext값은 null");
            setTimeout(function() {
                start();
            },100);
        }
    });

    oFlicking7.activate();
    stop();
});