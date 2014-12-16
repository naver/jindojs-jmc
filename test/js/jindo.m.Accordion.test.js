/** 
 * Module의 setup과 teardown은 각 테스트 마다 호출됨 
 */
module("jindo.m.Accordion 클래스", {
	setup : function() {
		// 객체 생성 
		oAccordion = new jindo.m.Accordion(jindo.$("panel"));
		aBlockList = jindo.$$("." + oAccordion.option("sClassPrefix") + "block", oAccordion._elContainer);
		sDirection = oAccordion.option("sDirection");
		sStatus = null;
	},
	teardown : function() {
		// 객체 소멸 
		oAccordion.destroy();
		oAccordion = null;
		aBlockList = null;
		sDirection = null;
		sStatus = null;
	}
});

asyncTest("_initVar()", function() {
	equal(oAccordion._elContainer, jindo.$("panel"), "_initVar() 메소드를 수행하면 this._elContainer이 초기화된다.");
	
	var nAccordionBlockCount = oAccordion._aAccordionBlock.length;
	equal(nAccordionBlockCount, aBlockList.length, "_initVar() 메소드를 수행하면 블럭갯수만큼 블럭정보가 생성된다.");
	for(var i = 0, len = aBlockList.length; i < len; i++) {
		equal(oAccordion._aAccordionBlock[i], aBlockList[i], "_initVar() 메소드를 수행하면 \"" + i + "\"번째 Block의 정보가 this._aAccordionBlock[" + i + "]에 저장된다.");
	}
	
	equal(oAccordion._nExpand, -1, "_initVar() 메소드를 수행하면 this._nExpand 변수가 -1로 초기화된다.");
	setTimeout(function(){ start(); }, 1000);
});

asyncTest("_setSize()", function() {
	var nBlocksSizeCount = jindo.$H(oAccordion._htBlockSize).length();
	equal(nBlocksSizeCount, aBlockList.length, "_setSize() 메소드를 수행하면 블럭갯수만큼 블럭사이즈정보가 생성된다.");
	
	var welHeader, nHeaderSize;
	var welBody, nBodySize;
	for(var i = 0, len = aBlockList.length; i < len; i++) {
		welHeader = jindo.$Element(jindo.$$.getSingle('dt', aBlockList[i]));
		nHeaderSize = (sDirection == "vertical") ? welHeader.height() : welHeader.width();
		equal(oAccordion._htBlockSize[i]["nHeaderSize"], nHeaderSize, "_setSize() 메소드를 수행하면 \"" + i + "\"번째 Block의 Header 사이즈 정보가 this._htBlockSize[" + i + "][\"nHeaderSize\"]에 저장된다.");
		
		welBody = jindo.$Element(jindo.$$.getSingle('dd', aBlockList[i]));
		nBodySize = (sDirection == "vertical") ? welBody.height() : welBody.width();
		equal(oAccordion._htBlockSize[i]["nBodySize"], nBodySize, "_setSize() 메소드를 수행하면 \"" + i + "\"번째 Block의 Body 사이즈 정보가 this._htBlockSize[" + i + "][\"nBodySize\"]에 저장된다.");
	}
	setTimeout(function(){ start(); }, 1000);
});

asyncTest("getExpandIndex()", function() {
	// nDefaultIndex 설정없이 인스턴스 생성 테스트
	equal(oAccordion._nExpand, -1, "nDefalutIndex 설정없이 인스턴스 생성시 디폴트 인덱스는 -1값을 갖는다.");
	setTimeout(function(){ 
		equal(oAccordion._nExpand, -1, "nDefalutIndex 설정없이 인스턴스 생성시 초기화작업 완료후 인덱스는 -1값을 갖는다.");
	}, 1000);
	
	// nDefaultIndex 설정후 인스턴스 생성 테스트	
	setTimeout(function(){ 
		oAccordion.destroy();
		oAccordion = null;
		oAccordion = new jindo.m.Accordion(jindo.$("panel"), {
			nDefalutIndex :  1
		});
		equal(oAccordion._nExpand, -1, "nDefalutIndex = 1 설정후 인스턴스 생성시 디폴트 인덱스는 -1값을 갖는다.");
	}, 2000);
	
	setTimeout(function(){
		equal(oAccordion._nExpand, 1, "nDefalutIndex = 1 설정후 인스턴스 생성시 초기화작업 완료후 인덱스는 1값을 갖는다.");
		start();
	}, 3000);
});

asyncTest("setEffect()", function() {
	oAccordion.setEffect({sTransitionTimingFunction : "linear", nDuration : 1000});
	equal(oAccordion.option("sTransitionTimingFunction"), "linear", "sTransitionTimingFunction값이 정상적으로 설정된다.");
	equal(oAccordion.option("nDuration"), 1000, "nDuration값이 정상적으로 설정된다.");
	
	oAccordion.setEffect({sTransitionTimingFunction : "ease-in-out"});
	equal(oAccordion.option("sTransitionTimingFunction"), "ease-in-out", "sTransitionTimingFunction값이 정상적으로 설정된다.");
	equal(oAccordion.option("nDuration"), 1000, "sTransitionTimingFunction값만 설정한 경우 기존 nDuration값이 정상적으로 유지된다.");
	
	oAccordion.setEffect({sTransitionTimingFunction : "testtesttest"});
	equal(oAccordion.option("sTransitionTimingFunction"), "ease-in-out", "유효하지 않은 sTransitionTimingFunction값이 설정된경우 기존 설정값을 유지한다.");
	
	oAccordion.setEffect({nDuration : 2000});
	equal(oAccordion.option("sTransitionTimingFunction"), "ease-in-out", "nDuration값만 설정한 경우 기존 sTransitionTimingFunction값이 정상적으로 유지된다.");
	equal(oAccordion.option("nDuration"), 2000, "nDuration값이 정상적으로 설정된다.");
	
	oAccordion.setEffect({nDuration : 0});
	equal(oAccordion.option("nDuration"), 2000, "유효하지 않은 nDuration값(0)이 설정된경우 기존 설정값을 유지한다.");
	
	oAccordion.setEffect({nDuration : -1});
	equal(oAccordion.option("nDuration"), 2000, "유효하지 않은 nDuration값(음수값)이 설정된경우 기존 설정값을 유지한다.");
	
	oAccordion.setEffect({nDuration : "testtesttest"});
	equal(oAccordion.option("nDuration"), 2000, "유효하지 않은 nDuration값(문자열)이 설정된경우 기존 설정값을 유지한다.");
	start();
});

asyncTest("beforeExpand callback & expand callback & beforeContract callback & collapse callback", function(){
	oAccordion.attach({
		beforeExpand : function(e) {
			sStatus = "beforeExpand";
			equal(sStatus, "beforeExpand", "beforeExpand callback 수행후에 sStatus는  \"beforeExpand\"값을 가진다.");
		},
		expand : function(e) {
			sStatus = "expand";
			equal(sStatus, "expand", "expand callback 수행후에 sStatus는  \"expand\"값을 가진다.");
		},
		beforeContract : function(e) {
			sStatus = "beforeContract";
			equal(sStatus, "beforeContract", "beforeContract callback 수행후에 sStatus는  \"beforeContract\"값을 가진다.");
		},
		collapse : function(e) {
			sStatus = "collapse";
			equal(sStatus, "collapse", "collapse callback 수행후에 sStatus는  \"collapse\"값을 가진다.");
		}
	});
	
	var nClickIndex = Math.round(Math.random() * (aBlockList.length - 1));
	equal(sStatus, null, "beforeExpand callback 수행전에 sStatus  null값을 가진다.");
	setTimeout(function(){
		oAccordion.collapseAll();
		jindo.$Element(jindo.$$.getSingle('dt', aBlockList[nClickIndex])).fireEvent("click");
		start();
	}, 1000);
});	

asyncTest("expand() / collapse() / collapseAll()", function(){
	var nCurrentIndex, nClickIndex, bUseToggle;
	
	// 블럭을 랜덤 선택하여 클릭함
	setTimeout(function(){
		oAccordion.collapseAll();
		nClickIndex = Math.round(Math.random() * (aBlockList.length - 1));
		jindo.$Element(jindo.$$.getSingle('dt', aBlockList[nClickIndex])).fireEvent("click");
		equal(oAccordion._nExpand, nClickIndex, "[bUseToggle == true] " + (nClickIndex + 1) + "번째(index:" + nClickIndex + ") Block이 클릭되어 펼쳐짐");
		
			// bUseToggle이 true인 경우
			oAccordion.option("bUseToggle", true);
			bUseToggle = oAccordion.option("bUseToggle");

			// 원래 펼쳐져있던 블럭을 클릭함
			setTimeout(function(){
				nCurrentIndex = oAccordion.getExpandIndex();
				nClickIndex = nCurrentIndex;
				jindo.$Element(jindo.$$.getSingle('dt', aBlockList[nClickIndex])).fireEvent("click");
				equal(oAccordion._nExpand, -1, "[bUseToggle == true] 이미 펼쳐진 " + (nClickIndex + 1) + "번째(index:" + nClickIndex + ") Block 클릭 -> 접힌다.");
				// 토글되어 접힌 블럭을 다시 클릭함
				setTimeout(function(){
					jindo.$Element(jindo.$$.getSingle('dt', aBlockList[nClickIndex])).fireEvent("click");
					equal(oAccordion._nExpand, nClickIndex, "[bUseToggle == true] 이미 펼쳐졌다 접혀진 " + (nClickIndex + 1) + "번째(index:" + nClickIndex + ") Block 클릭 -> 펼쳐짐");
					// bUseToggle이 false인 경우
					// 원래 펼쳐져있던 블럭을 클릭함
					setTimeout(function(){
						oAccordion.option("bUseToggle", false);
						bUseToggle = oAccordion.option("bUseToggle");
						nCurrentIndex = oAccordion.getExpandIndex();
						nClickIndex = nCurrentIndex;
						jindo.$Element(jindo.$$.getSingle('dt', aBlockList[nClickIndex])).fireEvent("click");
						equal(oAccordion._nExpand, nClickIndex, "[bUseToggle == false] 이미 펼쳐진 " + (nClickIndex + 1) + "번째(index:" + nClickIndex + ") Block 클릭 -> 아무액션 없음");
							// 전체를 접음
							setTimeout(function(){
								oAccordion.collapseAll();
								equal(oAccordion._nExpand, -1, "모든 블럭이 접힌다.");
								// 블럭을 랜덤 선택하여 클릭함
								setTimeout(function(){
									nClickIndex = Math.round(Math.random() * (aBlockList.length - 1));
									jindo.$Element(jindo.$$.getSingle('dt', aBlockList[nClickIndex])).fireEvent("click");
									equal(oAccordion._nExpand, nClickIndex, "[bUseToggle == false] " + (nClickIndex + 1) + "번째(index:" + nClickIndex + ") Block이 클릭되어 펼쳐짐");
									start();
								}, 1000);
							}, 1000);
					}, 1000);
				}, 1000);
			}, 1000);
	}, 1000);
});


