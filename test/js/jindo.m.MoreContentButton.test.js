/** Module의 setup과 teardown은 각 테스트 마다 호출됨 */
var oMore = null;
var nGoTopEvent = 0;
var welGoTop = jindo.$Element(jindo.$$.getSingle('.more_top'));

module("MoreContentButton", {
	setup: function() {
		oMore = new jindo.m.MoreContentButton(jindo.$('contentMore'),{
			nTotalItem : 100, //실제 아이템 개수
			nShowMaxItem : 27, //최대 더보기 하여 보여줄 개수
			nItemPerPage : 6			
		});
		welMore = jindo.$Element(jindo.$$.getSingle('.more_button'));
		oMore.attach({
			'beforeMore' : function(oEvt){
				
			},
			'more' : function(oEvt){
				
			},
			'goTop' : function(oEvt){
				nGoTopEvent++;
			}
		});
	},
	teardown : function() {
		/** 객체 소멸 */
		oMore.destroy();
		oMore = null;
	}
} );

test("Ajax 호출없음", function() {
	oMore.showLoadingImg();
	ok(oMore._htWElement.elLoading.visible(), "로딩중");
	oMore.hideLoadingImg();
	ok(!oMore._htWElement.elLoading.visible(), "로딩중아님");
	
	ok(oMore.getItemCount()== 27 , '최대 더보기이 설정됨');
	
	ok(oMore.getCurrentPage() == 1, '현재페이지 설정없으면 1페이지로 설정됨');
	oMore.movePageTo(2);
	ok(oMore.getCurrentPage() == 2, '현재 페이지 설정');
	oMore.updateInfo();
	
	equal(oMore._htWElement.elMoreCnt.text(), '6', '더보기 count');
	equal(oMore._htWElement.elTotal.text() , 100, '전체아이템개수');
	equal(oMore._htWElement.elCurrent.text() , 12, '현재 count');
	
	ok(typeof oMore.oAjax == 'undefined', 'ajax 설정이 안되어 있음');
	
	welMore.fireEvent('click', {left : true, middle : false, right : false });
	
	equal(oMore.getCurrentPage() , 3, '다음페이지 이동');	
		
	
	welGoTop.fireEvent('click');
	equal(nGoTopEvent , 1, '맨위로 버튼 클릭');
	
	oMore.setTotalItem(205);
	oMore.reset();
	equal(oMore._htWElement.elTotal.text() , 205, '전체아이템 개수 재설정');
	
	oMore.setShowMaxItem(111);	
	equal(oMore.getShowMaxItem() , 111, '최대 더보기 개수 설정');
	
});

oCustomMore = null;
module("MoreContentButton Ajax", {
	setup: function() {
		oMore = new jindo.m.MoreContentButton(jindo.$('contentMore'),{
			nTotalItem : 100, //실제 아이템 개수
			nShowMaxItem : 45, //최대 더보기 하여 보여줄 개수
			nItemPerPage : 6,
			htAjax : {
				sApi : './mockupData.html'
			},
			nPage : 2
		});
		welMore = jindo.$Element(jindo.$$.getSingle('.more_button'));
		oMore.attach({
			'beforeMore' : function(oEvt){
				
			},
			'more' : function(oEvt){
				oCustomMore = oEvt;
			}
		});
	},
	teardown : function() {
		oMore.destroy();
		oMore = null;
	}
} );

test('Ajax 호출 있음', function(){
	
	ok(typeof oMore.oAjax != 'undefined', 'ajax 객체 설정됨');
	
	equal(oMore.option('htAjax').sApi ,'./mockupData.html', 'API 설정');
	
	equal(oMore.getCurrentPage() ,2, '초기 설정을 2페이지로');
	
	equal(oMore.option('htAjax').htAjaxOption.type , 'xhr', 'ajax 옵션 초기값');
	
	welMore.fireEvent('click', {left : true, middle : false, right : false });
	
	stop();
	
	setTimeout(function(){
		equal(oMore.getCurrentPage() ,3, '페이지이동');
		
		ok(oCustomMore != null, '커스텀이벤트 발생');
		equal(oCustomMore.oResponse.json().aData.length, 30 , 'ajax 응답 커스텀이벤트에서 받기');
		
		equal(oMore._getQueryString(oMore.getCurrentPage()).start , 12,'ajax querystring 설정' );
		equal(oMore._getQueryString(oMore.getCurrentPage()).display , 6,'ajax querystring 설정' );
		
		start();	
	}, 500);	
	
});


