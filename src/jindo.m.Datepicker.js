/**
	@fileOverview Form Element의 Input Form에 날짜를 쉽게 입력할 수 있도록 Calendar를 제공하는 컴포넌트
	@author sshyun, sculove
	@version #__VERSION__#
	@since 2011. 9. 22.
**/
/**
	Form Element의 Input Form에 날짜를 쉽게 입력할 수 있도록 Calendar를 제공하는 컴포넌트

	@class jindo.m.Datepicker
	@extends jindo.m.UIComponent
	@uses jindo.m.Calendar
	@keyword input, date, picker, 달력, 날짜, 선택
	@group Component

  @history 1.9.0 Bug 복수 생성에서 bAutoHide = true 일때 버그 수정    
  @history 1.8.0 Update 캘린더 컴포넌트 에서 선택할 수 없는 날짜에 대한 css classname 처리 
  @history 1.8.0 Update 버튼을 통해 캘린더가 노출 될 수 있도록 처리 
  @history 1.7.0 Bug 안드로이드 4.x 갤럭시 시리즈에서 하이라이트 사라지지 않는 문제 제거
	@history 1.3.0 Update jindo.Calendar →jindo.m.Calendar로 교체<br />
						[beforeDraw] Custom 이벤트 삭제<br />
						[draw] Custom 이벤트 삭제<br />
						[afterDraw] Custom 이벤트 삭제
	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 1.1.0 Bug 다중인스턴스일시 동일월 경우 날짜표시 안되는 문제 혜결<br />
						2012년 1월 31일 선택 후, 2012년 2월 달 달력으로 이동시 31일 자리에 선택표시가 나오는 문제 해결<br />
						오늘 날짜와 선택날짜가 동일할 경우, 선택날짜가 표시되도록 수정
	@history 0.9.5 Release 최초 릴리즈
**/
jindo.m.Datepicker = jindo.$Class({
	/* @lends jindo.m.Datepicker.prototype */
	/**
		초기화 함수

		@constructor
		@param {Varient} el input 엘리먼트 또는 ID
		@param {Object} [htOption] 초기화 옵션 객체
			@param {String} [htOption.sClassPrefix="calendar-"] Class의 prefix명
			@param {String} [htOption.sFormat="yyyy-mm-dd"] 선택 날짜 값에 대한 포맷 다음의 형식을 사용할 수 있다.
				<table class="tbl_board">
				<tr>
				<th>표시형식</th>
				<th>설명</th>
				<th>결과</th>
				</tr>
				<tbody>
				<tr>
				<td>yyyy</td>
				<td>4자리 연도</td>
				<td>2010</td>
				</tr>
				<tr>
				<td>yy</td>
				<td>2자리 연도</td>
				<td>10</td>
				</tr>
				<tr>
				<td>mm</td>
				<td>월</td>
				<td>9</td>
				</tr>
				<tr>
				<td>dd</td>
				<td>일</td>
				<td>26</td>
				</tr>
				<tr>
				<td>day</td>
				<td>[prefix]sun ~ [prefix]sat 클래스가 '요일표시 해더영역' 의 값으로 표기</td>
				<td>일</td>
				</tr>
				</tbody>
				</table>
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
			@param {Boolean} [htOption.bAutoHide=false] input과 Calendar 외의 영역을 선택 했을때 Calendar를 사라지게 할지 여부
	**/
	$init : function(el, htOption) {
		this.option({
			sClassPrefix : "calendar-",
			sFormat : "yyyy-mm-dd",
			bActivateOnload : true,
			bAutoHide : false
		});
		this.option(htOption || {});
		this._initVar();
		this._initCalendar(el);
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},

	$static : {
		INDEX_ATTR : "data-datepickerid"
	},

	/**
		jindo.m.Datepicker 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar : function() {
		this._oCalendar = null;
		this._htDatePickerSet = {};
		this._htSelectedDatePickerSet = null;
	},

	/**
		jindo.m.Datepicker 에서 사용하는 Calendar를 초기화한다.
		@param {Varient} el Calendar Base 엘리먼트 또는 ID
	**/
	_initCalendar : function(el) {
		var sClassPrefix = this.option("sClassPrefix"),
			htCalendarOption = this.option();
		htCalendarOption.bActivateOnload = true;
		// console.log(htCalendarOption);
		this._oCalendar = new jindo.m.Calendar( (jindo.$Element(el) ? jindo.$Element(el) : this._insertCalendarTemplate()), htCalendarOption);
	},

	/**
		선택가능한 날짜인지 확인한다.
		@param {Object} htDatePickerSet
		@param {Object} htDate
	**/
	_isSelectable : function(htDatePickerOption, htDate) {
		return this._oCalendar.isBetween(htDate, htDatePickerOption["htSelectableDateFrom"], htDatePickerOption["htSelectableDateTo"]);
	},

	/**
		DatePicker를 적용할 셋을 추가한다.
		@param {Element} elInput 날짜가 입력될 input 엘리먼트
		@param {Object} htOption Datepicker Calendar Option 정보
		@return {this} this
		@method addDatePickerSet
		@example
			oDatePicker.addDatePickerSet(
				jindo.$("input"), //날짜가 입력될 input 엘리먼트
				{
					nYear : 1983, //기본으로 설정될 연도
					nMonth : 5, //기본으로 설정될 월
					nDate : 12, //기본으로 설정될 일
					htSelectableDateFrom : { //선택가능한 첫 날짜
						nYear : 1900,
						nMonth : 1,
						nDate : 1
					},
					htSelectableDateTo : { //선택가능한 마지막 날짜
						nYear : 2100,
						nMonth : 12,
						nDate : 31
					},
					sPosition: "bottomLeft", // Calendar 위치. input을 기준으로
						 //   bottomLeft : Calenadr 를 input 의 아래 왼쪽에 위치
						 //   bottomRight : Calenadr 를 input 의 아래 오른쪽끝에 위치
						 //   topLeft : Calenadr 를 input 의 위쪽 왼쪽에 위치
						 //   topRight : Calenadr 를 input 의 위쪽 오른쪽끝에 위치
						 //   leftTop : Calenadr 를 input 의 왼쪽에 상단에 위치
						 //   leftBottom : Calenadr 를 input 의 왼쪽에 하단에 위치
						 //   rightTop : Calenadr 를 input 의 오른쪽에 상단에 위치
						 //   rightBottom : Calenadr 를 input 의 오른쪽에 하단에 위치
					zIndex: 50,				// Calendar 가 나타날 경우 z-index 값
					elButton : {Element}	// input 외 버튼으로도 캘린더를 open 할 수 있도록 추가 
				}
			);
	**/
	addDatePickerSet : function(elInput, htOption) {
		if (typeof elInput == "undefined") {
			return this;
		}
		var sDatePikerSetId = "DATEPICKER_" + (new Date()).getTime() +"_" + Math.floor((Math.random() * 100)),
			welInput = jindo.$Element(elInput),
			htCalendarOption = this._oCalendar.option(),
			htDefaultOption = {
				nYear : htCalendarOption.htToday.nYear,
				nMonth : htCalendarOption.htToday.nMonth,
				nDate : htCalendarOption.htToday.nDate,
				htSelectableDateFrom : { //선택가능한 첫 날짜
					nYear : 1900,
					nMonth : 1,
					nDate : 1
				},
				htSelectableDateTo : { //선택가능한 마지막 날짜
					nYear : 2100,
					nMonth : 12,
					nDate : 31
				},
				sPosition: "bottomLeft",
				zIndex: 50,
				sDatePikerSetId : sDatePikerSetId,
				elButton : ""
			};

		if (typeof htOption != "undefined") {
			//빈 값은 기본값으로 셋팅해줌.
			for (var value in htOption) {
				if (typeof htDefaultOption[value] != "undefined") {
					htDefaultOption[value] = htOption[value];
				}
			}
		}
		htOption = htDefaultOption;
		welInput.wrap("<span style='position:relative;display:inline-block;'></span>");
		welInput = jindo.$Element(elInput);
		welInput.attr("readOnly",true).attr(jindo.m.Datepicker.INDEX_ATTR, sDatePikerSetId);
		htOption.elInput = welInput.$value();
		htOption.wfFocusFunc = this._attachFocusEvent(welInput);
		if(htDefaultOption["elButton"]){
			htOption.wfClickFunc = jindo.$Fn(jindo.$Fn(this._onClick,this).bind(sDatePikerSetId), this).attach(htDefaultOption["elButton"],"click");
		}
		this._htSelectedDatePickerSet = this._htDatePickerSet[sDatePikerSetId] = htOption;
		return this;
	},

	/**
		DatePicker를 적용할 셋을 제거한다.
		@param {Element} elInput Datepicker를 제거할 input 엘리먼트
		@return {this} this
		@method removeDatePickerSet
		@example
			var elInput = jindo.$("input") //Datepicker를 제거할 input 엘리먼트
			oDatePicker.removeDatePickerSet(elInput);
	**/
	removeDatePickerSet : function(elInput) {
		var welInput = jindo.$Element(elInput),
			sDatePikerSetId = welInput.attr(jindo.m.Datepicker.INDEX_ATTR),
			htDatePickerSet = this._htDatePickerSet[sDatePikerSetId];
		this._detachFocusEvent(htDatePickerSet.wfFocusFunc, welInput);

		if (htDatePickerSet === this._htSelectedDatePickerSet) {
			this._htSelectedDatePickerSet = null;
		}
		delete this._htDatePickerSet[sDatePikerSetId];
		return this;
	},

	/**
		jindo.m.Datepicker 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		this._attachEvent();
	},
	/**
		jindo.m.Datepicker 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this.hide();
		this._detachEvent();
	},
	/**
		jindo.m.Datepicker 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		this._htEvent = {};
		if(this.option("bAutoHide")) {
			this._htEvent["document"] = jindo.$Fn(this._onDocument, this).attach(document, "touchend");
		}
		this._htEvent["selectDate"] = jindo.$Fn(this._onSelectDate, this).bind();
		this._htEvent["deliveryEvent"] = jindo.$Fn(this._onDeliveryEvent, this).bind();
		this._oCalendar.attach({
			"selectDate" : this._htEvent["selectDate"],
			"beforeMoveDate" : this._htEvent["deliveryEvent"],
			"moveDate" : this._htEvent["deliveryEvent"],
			"beforeHideCalendar" : this._htEvent["deliveryEvent"],
			"hideCalendar" : this._htEvent["deliveryEvent"],
			"beforeShowCalendar" : this._htEvent["deliveryEvent"],
			"showCalendar" : this._htEvent["deliveryEvent"]
			// "beforeDraw" : this._htEvent["deliveryEvent"],
			// "afterDraw" : this._htEvent["deliveryEvent"]
		});
	},


	/**
		Calendar 템플릿을 생성 한다.
	**/
	_insertCalendarTemplate : function(){
		var aHtml = [],
			welCalendar = jindo.$Element("jmc_calt"),
			sPrefix = this.option("sClassPrefix");
		if(!welCalendar) {
			aHtml.push('<div>');
			aHtml.push('<a href="javascript:void(0)" class="' + sPrefix + 'btn ' + sPrefix + 'btn-prev-year">&lt;&lt;</a>');
			aHtml.push('<a href="javascript:void(0)" class="' + sPrefix + 'btn ' + sPrefix + 'btn-prev-mon">&lt;</a>');
			aHtml.push('<strong class="' + sPrefix + 'title"></strong>');
			aHtml.push('<a href="javascript:void(0)" class="' + sPrefix + 'btn ' + sPrefix + 'btn-next-mon">&gt;</a>');
			aHtml.push('<a href="javascript:void(0)" class="' + sPrefix + 'btn ' + sPrefix + 'btn-next-year">&gt;&gt;</a>');
			aHtml.push('</div><table cellspacing="0" cellpadding="0" style="');
			aHtml.push('-' + jindo.m.getCssPrefix() + '-tap-highlight-color:transparent;"><thead><tr>');
			aHtml.push('<th class="' + sPrefix + 'sun">일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th class="' + sPrefix + 'sat">토</th>');
			aHtml.push('</tr></thead><tbody>');
			aHtml.push('<tr class="' + sPrefix + 'week">');
			aHtml.push('<td><a href="javascript:void(0)" class="' + sPrefix + 'date"></a></td>');
			aHtml.push('<td><a href="javascript:void(0)" class="' + sPrefix + 'date"></a></td>');
			aHtml.push('<td><a href="javascript:void(0)" class="' + sPrefix + 'date"></a></td>');
			aHtml.push('<td><a href="javascript:void(0)" class="' + sPrefix + 'date"></a></td>');
			aHtml.push('<td><a href="javascript:void(0)" class="' + sPrefix + 'date"></a></td>');
			aHtml.push('<td><a href="javascript:void(0)" class="' + sPrefix + 'date"></a></td>');
			aHtml.push('<td><a href="javascript:void(0)" class="' + sPrefix + 'date"></a></td>');
			aHtml.push('</tr></tbody></table>');
			aHtml.push('<div class="' + sPrefix + 'bottom"><a href="javascript:void(0)" class="' + sPrefix + 'btn ' + sPrefix + 'btn-close">닫기</a></div>');
			welCalendar = jindo.$Element('<div id="jmc_calt" class="' + sPrefix + 'base" style="position:absolute;display:none"></div>');
			welCalendar.html(aHtml.join(""));
			welCalendar.appendTo(document.body);
		}
		return welCalendar;
	},

	/**
		jindo.m.Calendar 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEvent : function(){
		var htDatepickerset = null;
		if(this.option("bAutoHide")) {
			this._htEvent["document"].detach(document, "touchend");
		}

		for(var p in this._htDatePickerSet) {
			htDatepickerset = this._htDatePickerSet[p];
			this._detachFocusEvent(htDatepickerset.wfFocusFunc, htDatepickerset.elInput);
			this._detachClickEvent(htDatepickerset.wfClickFunc, htDatepickerset.elButton);
		}
		this._oCalendar.detachAll();
		this._htSelectedDatePickerSet = null;
		this._htEvent = null;
	},
	/**
		input 에 포커스 이벤트 처리. Calendar를 생성하여 디스플레이 해준다.
	**/
	_onFocus : function(we){
		if(!this.isActivating()){
			return false;
		}
		this.show(we.element);
	},

	/**
	 * input 외의 button 을 추가하여 버튼 클릭시 캘린더가 나타날 수 있도록 처리 
	 */
	_onClick : function(sSetId){
		if(!this.isActivating()){
			return false;
		}
		this.show(this._htDatePickerSet[sSetId].elInput);
	},
	/**
		Document Touch 이벤트 처리
		@update
        @history 1.9.0 Bug 복수 생성시 input 영역을 정상적으로 처리 하지 못하는 이슈 해결.
	**/
	_onDocument : function(we){
		var el = we.element,
			wel = jindo.$Element(el),
			welCalendarBase = this._oCalendar.getCalendarBase(),
		    sDatePikerSetId = wel.attr(jindo.m.Datepicker.INDEX_ATTR),
		    elInput = null;
		   
        this._htSelectedDatePickerSet = sDatePikerSetId ? this._htDatePickerSet[sDatePikerSetId] : this._htSelectedDatePickerSet;
		elInput = this._htSelectedDatePickerSet.elInput;
			
		if(welCalendarBase.$value() != el && !welCalendarBase.isParentOf(wel) && elInput != el) {
			this.hide();
			if(elInput) {
				elInput.blur();
			}
		}
		return true;
	},
	/**
		Calendar 날짜 선택 이벤트 핸들러.
		@update
		@history 1.9.0 Update 날짜 선택시 선택할 수 없는 날짜({Prefix} + "unselectable") 이 있으면 선택 할 수 없도록 수정
	**/
	_onSelectDate : function(we){
		if(!this._oCalendar.isVisible()) {
			return;
		}
		if(we.wel.hasClass(this.option("sClassPrefix") + "unselectable")){
		    we.stop();
		    return false;
		}
		if (this._isSelectable(this._htSelectedDatePickerSet, we.oSelectDate)) {
			var el = this._htSelectedDatePickerSet.elInput;
			
			/**
                날짜가 선택되기 전 발생 

                @event selectDate
                @param {String} sType 커스텀이벤트명
                @param {Object} oSelectDate 선택된 날짜 
                @param {Object} oCalendar 캘린더 instance
                @param {Function} stop 선택된 날짜를 처리하지 않는다. 
            **/
			if(!this.fireEvent("selectDate", {
				oSelectDate : we.oSelectDate,
				oCalendar : this._oCalendar
			})){
				we.stop();
			    return false;
			}
			this.setDate(el, we.oSelectDate);
			el.blur();
			return true;
		} else {
			we.stop(jindo.$Event.CANCEL_ALL);
			return false;
		}
	},

	_onDeliveryEvent : function(we) {
	    if(!this.fireEvent(we.sType, we)){
            we.stop();
	        return false;
	    }
	    // console.log(this.fireEvent(we.sType, we), we.sType);
		we.oCalendar = this._oCalendar;
		return true;
	},

	/**
		Datepicker Calendar 선택 날짜를 설정 한다.
		@param {Element} elInput 변경 Datepicker Input 엘리먼트
		@param {Object} htDate 설정, 날짜 {nYear : 2011, nMonth : 9, nDate : 30} 형식
		@method setDate
		@example
			var elInput = jindo.$("input");
			var htDate = {nYear : 2011, nMonth : 9, nDate : 30};
			oDatepicker.setDate(elInput, htDate);
	**/
	setDate : function(elInput, htDate){
		if(!this.isActivating()) {
			return false;
		}
		var sDatepickerId = (elInput) ? elInput.getAttribute(jindo.m.Datepicker.INDEX_ATTR) : null,
			htDatePickerSet = this._htDatePickerSet[sDatepickerId];

		if(!sDatepickerId || !this._isSelectable(htDatePickerSet, htDate)){
			return false;
		}
		elInput.value = this._formatDate(htDate);
		htDatePickerSet.nYear = htDate.nYear;
		htDatePickerSet.nMonth = htDate.nMonth;
		htDatePickerSet.nDate = htDate.nDate;
		this._htDatePickerSet[sDatepickerId] = htDatePickerSet;
	},

	/**
		날짜 표시 형식 변환 후 반환.
	**/
	_formatDate : function(htDate){
		var oDate = new Date(htDate.nYear, htDate.nMonth-1, htDate.nDate),
			sDay = this._oCalendar.getDayName(oDate.getDay());
		return this.option("sFormat").replace(/(yyyy|yy|mm|dd|day)/gi,
			function($1){
				switch ($1){
					case 'yyyy': return oDate.getFullYear();
					case 'yy': return oDate.getFullYear().toString().substr(2);
					case 'mm':
						var sMonth = (oDate.getMonth()+1) + "";
						sMonth = sMonth.length === 1 ? '0' + sMonth : sMonth;
						return sMonth;
					case 'dd':
						var sDate = oDate.getDate() + "";
						sDate = sDate.length === 1 ? '0' + sDate : sDate;
						return sDate;
					case 'day' : return sDay;
				}
			}
		);
	},

	/**
		Datepicker에서 선택 한 날짜를 삭제한다.
		@param {Element} elInput 변경 Datepicker Input 엘리먼트
		@method deleteDate
		@example
			var elInput = jindo.$("input");
			oDatepicker.deleteDate(elInput);
	**/
	deleteDate : function(elInput){
		if(!elInput){ return; }
		var welInput = jindo.$Element(elInput),
			htDatePickerSet = this._htDatePickerSet[welInput.attr(jindo.m.Datepicker.INDEX_ATTR)],
			oDate = new Date();
		elInput.value = "";
		htDatePickerSet.nYear = oDate.getFullYear();
		htDatePickerSet.nMonth = oDate.getMonth() + 1;
		htDatePickerSet.nDate = oDate.getDate();

		if(this._isCurrentDatePicker(welInput.$value())) {
			this.hide();
		}
		
      /**
            선택된 날짜 초기화 이후 발생  

            @event clear
            @param {String} sType 커스텀이벤트명
            @param {Object} oCalendar 캘린더 instance
        **/
		this.fireEvent("clear",{
			oCalendar : this._oCalendar
		});
	},

	/**
		현재 데이터 피커가 자신에 할당되어 있는지 여부 반
	**/
	_isCurrentDatePicker : function(elInput){
		var sDatepickerId = (elInput) ? elInput.getAttribute(jindo.m.Datepicker.INDEX_ATTR) : null,
			sSelectDatepickerId = this._htSelectedDatePickerSet.sDatePikerSetId;
		return (sDatepickerId == sSelectDatepickerId);
	},

	/**
		Datepicker 객체를 활성화 한다.
		@param {Element} elInput 변경 Datepicker Input 엘리먼트. 없을 경우 등록된 모든 Input에 대해 활성화.
		@method enable
		@example
			var elInput = jindo.$("input");
			oDatepicker.enable(elInput);
			oDatepicker.enable(); //등록된 모든 Input 에 대해 활성화
	**/
	enable : function(elInput){
		if(elInput){
			var welInput = jindo.$Element(elInput);
			welInput.$value().disabled = false;
		} else {
			var htDatePickerSet = this._htDatePickerSet;
			for ( var sKey in htDatePickerSet) {
				htDatePickerSet[sKey].elInput.disabled = false;
			}
		}
		
      /**
            DatePicker 컴포넌트 활성화 이후 발생 

            @event enable
            @param {String} sType 커스텀이벤트명
            @param {Object} oCalendar 캘린더 instance
        **/
		this.fireEvent("enable",{
			oCalendar : this._oCalendar
		});
	},

	_attachFocusEvent : function(welInput) {
		return jindo.$Fn(this._onFocus,this).attach(welInput,"focus");
	},

	_detachFocusEvent : function(wfFocusFunc, welInput) {
		wfFocusFunc.detach(welInput,"focus");
	},
	
	_detachClickEvent : function(wfClickFunc, elButton){
		wfClickFunc.detach(elButton, "click");
		
	},
	/**
		Datepicker 객체를 비활성화 한다.
		@param {Element} elInput 변경 Datepicker Input 엘리먼트. 없을 경우 등록된 모든 Input에 대해 비활성화.
		@method disable
		@example
			var elInput = jindo.$("input");
			oDatepicker.disable(elInput);
			oDatepicker.disable(); //등록된 모든 Input 에 대해 비활성화
	**/
	disable : function(elInput){
		var htDatePickerSet = this._htDatePickerSet;
		if(elInput){
			var welInput = jindo.$Element(elInput);
			welInput.$value().disabled = true;
		} else {
			for ( var sKey in htDatePickerSet) {
				htDatePickerSet[sKey].elInput.disabled = true;
			}
		}
		this.hide();
		
      /**
            DatePicker 컴포넌트가 비활성화 이후 발생  

            @event disable
            @param {String} sType 커스텀이벤트명
            @param {Object} oCalendar 캘린더 instance
        **/
		this.fireEvent("disable",{
			oCalendar : this._oCalendar
		});
	},

	/**
		Calelndar를 위치할 Position 설정.
		@param {Element} elInput 변경 Datepicker Input 엘리먼트. 없을 경우 등록된 모든 Input에 대해 비활성화.
		@param {String} sPosition 위치명 
				@param {String} sPosition.leftTop 왼쪽 위
				@param {String} sPosition.leftBottom 왼쪽 아래
				@param {String} sPosition.rightTop 오른쪽 위
				@param {String} sPosition.rightBottom 오른쪽 아래
				@param {String} sPosition.bottomLeft 아래쪽 왼쪽
				@param {String} sPosition.bottomRight 아래쪽 오른쪽
				@param {String} sPosition.topLeft 위쪽 왼쪽
				@param {String} sPosition.topRight 위쪽 오른쪽
		@method setPosition
	**/
	setPosition : function(elInput, sPosition) {
		var welInput = jindo.$Element(elInput),
			htDatePickerSet = this._htDatePickerSet[welInput.attr(jindo.m.Datepicker.INDEX_ATTR)],
			welCalendarBase = this._oCalendar.getCalendarBase(),
			htCss = {},
			elCalendarBase = welCalendarBase.$value(),
			bVisible = welCalendarBase.visible();
		if(!bVisible) {
			welCalendarBase.css("left","-999px");
			welCalendarBase.show();
		}
		var nCalendarHeight = welCalendarBase.height(),
			nCalendarWidth = welCalendarBase.width(),
			nInputHeight = welInput.height(),
			nInputWidth = welInput.width();
		sPosition = sPosition || htDatePickerSet.sPosition;
		elCalendarBase.style.left = null;
		elCalendarBase.style.right = null;
		elCalendarBase.style.top = null;
		if(!bVisible) {
			welCalendarBase.hide();
		}
		switch (sPosition) {
			case "leftTop":
				htCss.top = "0px";
				htCss.left = "-" + nCalendarWidth + "px";
				break;
			case "leftBottom":
				htCss.top = "-" + (nCalendarHeight - nInputHeight) + "px";
				htCss.left = "-" + nCalendarWidth + "px";
				break;
			case "rightTop":
				htCss.top = "0px";
				htCss.left = nInputWidth + "px";
				break;
			case "rightBottom":
				htCss.top = "-" + (nCalendarHeight - nInputHeight) + "px";
				htCss.left = nInputWidth + "px";
				break;
			case "bottomLeft":
				htCss.top = nInputHeight + "px";
				htCss.left = "0px";
				break;
			case "bottomRight":
				htCss.top = nInputHeight + "px";
				htCss.right = "0px";
				break;
			case "topLeft":
				htCss.top = "-" + nCalendarHeight + "px";
				htCss.left = "0px";
				break;
			case "topRight":
				htCss.top = "-" + nCalendarHeight + "px";
				htCss.right = "0px";
				break;
		}
		htDatePickerSet.sPosition = sPosition;
		welCalendarBase.css(htCss);
	},

	/**
		Datepicker 달력을 보여준다.
		@param {Element} elInput Calendar를 보여줄 Datepicker Input 엘리먼트.
		@method show
		@example
			var elInput = jindo.$("input");
			oDatepicker.show(elInput);
	**/
	show : function(elInput){
		var welInput = jindo.$Element(elInput),
			welCalendarBase = this._oCalendar.getCalendarBase(),
			htDatePickerSet = this._htDatePickerSet[welInput.attr(jindo.m.Datepicker.INDEX_ATTR)],
			oDrawDate  = {"nYear" : htDatePickerSet.nYear, "nMonth" : htDatePickerSet.nMonth, "nDate" : htDatePickerSet.nDate};
		this._htSelectedDatePickerSet = htDatePickerSet;
		welInput.parent().append(welCalendarBase);
		if(htDatePickerSet.zIndex != "none"){
			welCalendarBase.css("zIndex", htDatePickerSet.zIndex);
		}
		this.setPosition(elInput, htDatePickerSet.sPosition);
		if(htDatePickerSet.htSelectableDateFrom && htDatePickerSet.htSelectableDateTo){
			this._oCalendar.setSelectableDate(htDatePickerSet.htSelectableDateFrom, htDatePickerSet.htSelectableDateTo);
		}
		// this._oCalendar.setSelectableDate();
		this._oCalendar.show(oDrawDate, elInput.value ? oDrawDate : 0);
	},

	/**
		Datepicker 달력을 닫는다.
		@method hide
		@example
			oDatepicker.hide();
	**/
	hide : function(){
		if(this._oCalendar.isVisible()) {
			this._oCalendar.hide();
		}
	},

	/**
		jindo.m.Datepicker 에서 사용하는 모든 객체를 release 시킨다.

		@method destroy
		@example
			oDatepicker.destroy();
	**/
	destroy : function() {
		this.deactivate();
		this._oCalendar = null;
		this._htDatePickerSet = null;
	}
}).extend(jindo.m.UIComponent);