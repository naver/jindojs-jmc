/**
	@fileOverview 정년도/월의 달력을 지정한 엘리먼트에 표시하는 컴포넌트이다. 미리 지정해놓은 엘리먼트에 삽입되기 때문에 원하는 디자인과 마크업 구조를 적용할 수 있다
	@author sculove
	@version #__VERSION__#
	@since 2012. 05. 14.
**/
/**
	정년도/월의 달력을 지정한 엘리먼트에 표시하는 컴포넌트이다. 미리 지정해놓은 엘리먼트에 삽입되기 때문에 원하는 디자인과 마크업 구조를 적용할 수 있다

	@class jindo.m.Calendar
	@extends jindo.m.UIComponent
	@uses jindo.m.Transition
	@keyword calendar, 달력
	@group Component
	@invisible
**/
jindo.m.Calendar = jindo.$Class({
	/* @lends jindo.m.Calendar.prototype */
	/**
		초기화 함수

		@constructor
		@param {String|HTMLElement} el
		@param {Object} [htOption] 초기화 옵션 객체
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
			@param {String} [htOption.sClassPrefix='calendar-'] Class의 prefix명
			@param {Boolean} [htOption.bUseEffect=false] 이펙트 사용 여부
			@param {Number} [htOption.nEffectDuration=200] fade-in/out Duration시간
			@param {String} [htOption.sTitleFormat='yyyy.mm'] className이 '[prefix]title' 인 엘리먼트를 찾아서 해당 형식대로 날짜를 출력한다. 다음의 형식을 사용할 수 있다.
			@param {Array} [htOption.aMonthTitle=[]] 월 이름
			@param {Object} [htOption.htToday] 오늘
	**/
	$init : function(el, htOption) {
		var oDate = new Date();
		this.option({
			bActivateOnload : true,
			sClassPrefix : "calendar-",
			bUseEffect : false,
			nEffectDuration : 200,
			sTitleFormat : "yyyy.mm", //달력의 제목부분에 표시될 형식
			aMonthTitle : ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"], //월 이름
			htToday : {nYear:oDate.getFullYear() , nMonth:oDate.getMonth() + 1 , nDate: oDate.getDate()}
		});
		this.option(htOption || {});
		this._initVar();
		this._setWrapperElement(el);
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},

	/**
		jindo.m.Calendar 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar : function() {
		this._bVisible = false;
		this._oToday = this.option("htToday");
		this._oViewDate = null;
		this._nSelectDate = -1;
		this._sClassPrefix = this.option("sClassPrefix");
		this._aDayInfo = [];
		if(this.option("bUseEffect")) {
			this._oTransition = new jindo.m.Transition();
		}
	},

	/**
		jindo.m.Calendar 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
	**/
	_setWrapperElement : function(el) {
		this._htWElement = {};
		this._htWElement["calendarBase"] = jindo.$Element(el);
		this._htWElement["calendarBase"].css({
			"position" : "absolute",
			"display" : "none"
		});

		// 날짜 정보 추출
		var aTh = this._htWElement["calendarBase"].queryAll("th");
		for(var i=0, nLength=aTh.length; i<nLength; i++) {
			this._aDayInfo.push(jindo.$Element(aTh[i]).text());
		}
		this._htWElement["calendarTitle"] = jindo.$Element(this._htWElement["calendarBase"].query("." + this._sClassPrefix + "title"));
		this._htWElement["calendarTable"] = jindo.$Element(this._htWElement["calendarBase"].query("table"));
		this._htWElement["calendarTbody"] = jindo.$Element(this._htWElement["calendarTable"].query("tbody"));
		this._htWElement["yearPreBtn"] = jindo.$Element(this._htWElement["calendarBase"].query("." + this._sClassPrefix + "btn-prev-year"));
		this._htWElement["preBtn"] = jindo.$Element(this._htWElement["calendarBase"].query("." + this._sClassPrefix + "btn-prev-mon"));
		this._htWElement["yearNextBtn"] = jindo.$Element(this._htWElement["calendarBase"].query("." + this._sClassPrefix + "btn-next-year"));
		this._htWElement["nextBtn"] = jindo.$Element(this._htWElement["calendarBase"].query("." + this._sClassPrefix + "btn-next-mon"));
		this._htWElement["closeBtn"] = jindo.$Element(this._htWElement["calendarBase"].query("." + this._sClassPrefix + "btn-close"));
	},

	getCalendarBase : function() {
		return this._htWElement["calendarBase"];
	},

	/**
		jindo.m.Calendar 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		this._attachEvent();
	},
	/**
		jindo.m.Calendar 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEvent();
	},
	/**
		jindo.m.Calendar 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function(){
		this._htEvent = {};
		// 이전 년도 버튼
		if(this._htWElement["yearPreBtn"]){
			this._htEvent["pre_year_click"] = {
					el  : this._htWElement["yearPreBtn"],
					ref : jindo.$Fn(this._onYearPre, this).attach(this._htWElement["yearPreBtn"], "click")
			};
		}
		// 이전 달 버튼
		if(this._htWElement["preBtn"]){
			this._htEvent["pre_click"] = {
					el  : this._htWElement["preBtn"],
					ref : jindo.$Fn(this._onPre, this).attach(this._htWElement["preBtn"], "click")
			};
		}
		// 다음 년도 버튼
		if(this._htWElement["yearNextBtn"]){
			this._htEvent["next_year_click"] = {
					el  : this._htWElement["yearNextBtn"],
					ref : jindo.$Fn(this._onYearNext, this).attach(this._htWElement["yearNextBtn"], "click")
			};
		}
		// 다음 달 버튼
		if(this._htWElement["nextBtn"]){
			this._htEvent["next_click"] = {
					el  : this._htWElement["nextBtn"],
					ref : jindo.$Fn(this._onNext, this).attach(this._htWElement["nextBtn"], "click")
			};
		}
		// 닫기 버튼.
		if(this._htWElement["closeBtn"]){
			this._htEvent["close_click"] = {
					el  : this._htWElement["closeBtn"],
					ref : jindo.$Fn(this._onClose, this).attach(this._htWElement["closeBtn"], "click")
			};
		}
		// 날짜 선택.
		this._htEvent["table_click"] = {
				el  : this._htWElement["calendarTable"],
				ref : jindo.$Fn(this._onDate, this).attach(this._htWElement["calendarTable"], "click")
		};
	},
	/**
		이전달 클릭시 처리
	**/
	_onPre : function(we){
		this._moveDate("pre");
		we.stop();
	},
	/**
		이전년도 클릭시 처리
	**/
	_onYearPre : function(we){
		this._moveDate("preYear");
		we.stop();
	},
	/**
		다음달 클릭시 처리
	**/
	_onNext : function(we){
		this._moveDate("next");
		we.stop();
	},
	/**
		다음년도 클릭시 처리
	**/
	_onYearNext : function(we){
		this._moveDate("nextYear");
		we.stop();
	},
	/**
		닫기 클릭시 처리.
	**/
	_onClose : function(we){
		this.hide();
		we.stop();
	},
	/**
		날짜 선택시 처리.
	**/
	_onDate : function(we){
		if(!this._bVisible) { return; }
		var wel = jindo.$Element(we.element),
			sCellDate = "";
		if(wel.$value().tagName != "td"){
			wel = wel.parent(function(v){
				return (v.$value().tagName.toLowerCase() == "td");
			})[0];
		}
		if(wel) {
			sCellDate = wel.attr("data-cal-date");
			if(sCellDate && sCellDate.length == 8){
				this._nSelectDate = sCellDate * 1;
				/**
                    Calendar에서 일자를 선택 하기 전 발생합니다.

                    @event beforeSelectDate
                    @param {String} sType 커스텀이벤트명
                    @param {Object} oSelectDate 선택 된 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
                    @param {Function} stop 일자를 선택하지 않는다. 
                **/
                if(!this.fireEvent("beforeSelectDate", {
                    wel : wel,
                    oSelectDate : this.getSelectDate()
                })) {
                    return false;
                }
				
				/**
					Calendar에서 일자를 선택 할 경우 발생합니다.

					@event selectDate
					@param {String} sType 커스텀이벤트명
					@param {Object} oSelectDate 선택 된 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
					@param {Function} stop 일자를 선택하지 않는다.
				**/
				if(this.fireEvent("selectDate", {
					// nSelectDate : this._nSelectDate,
					wel : wel,
					oSelectDate : this.getSelectDate()
				})) {
					wel.addClass(this._sClassPrefix + 'selected');
					this.hide();
				}
			}
		}
		we.stopDefault();
		return false;
	},

	/**
		Calendar 월 이동 계산 처리
	**/
	_moveDate : function(sMode){
		if(!this._bVisible) { return; }
		var oOldDate = {
				nYear : this._oViewDate.nYear,
				nMonth : this._oViewDate.nMonth,
				nDate : this._oViewDate.nDate
			},
			oMoveDate = {
				nDate : this._oViewDate.nDate
			};
		switch(sMode) {
			case "pre" : oMoveDate.nYear = (oOldDate.nMonth == 1) ? oOldDate.nYear - 1 : oOldDate.nYear;
				oMoveDate.nMonth = (oOldDate.nMonth == 1) ? 12 : oOldDate.nMonth - 1;
				break;
			case "preYear" : oMoveDate.nYear = oOldDate.nYear - 1;
				oMoveDate.nMonth = oOldDate.nMonth;
				break;
			case "next" : oMoveDate.nYear = (oOldDate.nMonth == 12) ? oOldDate.nYear + 1 : oOldDate.nYear;
				oMoveDate.nMonth = (oOldDate.nMonth == 12) ? 1 : oOldDate.nMonth + 1;
				break;
			case "nextYear" : oMoveDate.nYear = oOldDate.nYear + 1;
				oMoveDate.nMonth = oOldDate.nMonth;
				break;
		}
		/**
			Calendar에서 현재 날짜에서 이전 달(년도) / 다음 달(년도)로 이동하기전 호출된다.

			@event beforeMoveDate
			@param {String} sType 커스텀이벤트명
			@param {Object} oOldDate 이동 하기전 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
			@param {Object} oMoveDate 이동할 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
			@param {Function} stop 이전달(년도) / 다음달(년도) 로 이동하지 않는다.
		**/
		if(this.fireEvent("beforeMoveDate", {
				oOldDate :  oOldDate,
				oMoveDate : oMoveDate
			})) {
			this._drawCalendar(oMoveDate);
			/**
				Calendar에서 현재 날짜에서 이전 달(년도) / 다음 달(년도)로 이동할 경우 발생한다.

				@event moveDate
				@param {String} sType 커스텀이벤트명
				@param oOldDate {Objec} 이동 하기전 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
				@param oMoveDate {Object} 이동할 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
			**/
			this.fireEvent("moveDate", {
				oOldDate : oOldDate,
				oMoveDate : oMoveDate
			});
		}
	},

	/**
		jindo.m.Calendar 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEvent : function(){
		for(var p in this._htEvent) {
			var ht = this._htEvent[p];
			ht.ref.detach(ht.el, p.substring(p.lastIndexOf("_")+1));
		}
		this._htEvent = null;
	},

	/**
		Calendar 를 보여 준다.

		@method show
		@example
			oCalendar.show();
	**/
	show : function(oDrawDate, oSelectedDate){
		if(!oDrawDate){
			oDrawDate = this._oToday;
		}
		/**
			Calendar가 나타나기전 발생한다.

			@event beforeShowCalendar
			@param {String} sType 커스텀이벤트명
			@param {Object} oDrawDate 그려질 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
			@param {Function} stop 캘린더를 노출하지 않는다. 
		**/
		if(this.fireEvent("beforeShowCalendar",{
				oDrawDate  : oDrawDate
			})) {
			this._nSelectDate = this._getDateNumber(oSelectedDate);
			// Calendar 생성.
			if(this._getDateNumber(oDrawDate, "YearMonth") != (this._oViewDate) ? this._getDateNumber(this._oViewDate, "YearMonth") : 0 ){
				this._drawCalendar(oDrawDate);
			} else {
				this._drawDayColor();
			}
			var self=this;

			this._htWElement["calendarBase"].show();
			if(this.option("bUseEffect")){
				this._htWElement["calendarBase"].opacity(0);
				this._oTransition.clear();
				this._oTransition.queue(this._htWElement["calendarBase"].$value(), this.option("nEffectDuration"), {
					htStyle : {
						opacity : "0.9999"
					},
					fCallback : function(){
						self._afterShow(oDrawDate);
					}
				});
				setTimeout(function() {
					self._oTransition.start();
				},10);
			} else {
				this._afterShow(oDrawDate);
			}
		}
	},
	_afterShow : function(oSelectDate) {
		this._htWElement["calendarBase"].css("zIndex", "1000");
		this._bVisible = true;
		/**
			Calendar가 나타날 경우 발생한다.

			@event showCalendar
			@param {String} sType 커스텀이벤트명
			@param {Object} oDrawDate 그려질 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
		**/
		this.fireEvent("showCalendar",{
			oDrawDate : oSelectDate
		});
	},
	/**
		Calendar 를 숨긴다.

		@method hide
		@example
			oCalendar.hide();
	**/
	hide : function(){
		var oSelectDate = this.getSelectDate();
		/**
			Calendar가 사라지기 전 발생한다.

			@event beforeHideCalendar
			@param {String} sType 커스텀이벤트명
			@param {Object} oSelectDate 선택된 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
			@param {Function} stop calendar 가 사라지지 않는다. 
		**/
		if(this.fireEvent("beforeHideCalendar",{
				"oSelectDate"  : oSelectDate
			})) {
			this._bVisible = false;
			// 이펙트 사용.
			if(this.option("bUseEffect")){
				var self=this;
				this._oTransition.queue(this._htWElement["calendarBase"].$value(), this.option("nEffectDuration"), {
					htStyle : {
						opacity : 0
					},
					fCallback : function(){
						self._afterHide(oSelectDate);
					}
				});
				self._oTransition.start();
			} else {
				this._afterHide(oSelectDate);
			}
		}
	},
	_afterHide : function(oSelectDate) {
		this._htWElement["calendarBase"].css("zIndex", "0").hide();
		/**
			Calendar가 사라질 경우 발생한다.

			@event hideCalendar
			@param {String} sType 커스텀이벤트명
			@param {Object} oSelectDate 선택된 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
		**/
		this.fireEvent("hideCalendar",{
			"oSelectDate"  : oSelectDate
		});
	},
	/**
		Calendar 의 노출 여부를 반환.

		@method isVisible
		@return {boolean} Calendar 노출 여부.
		@example
			var bVisible = oCalendar.isVisible();	// bVisible true : 노출 false : 비노출
	**/
	isVisible : function(){
		return this._bVisible;
	},
	/**
		Calendar 의 선택 날짜를 반환.

		@method getSelectDate
		@return {Object} Calendar 선택 날짜 객체. {nYear:년도 , nMonth: 월, nDate: 날 }
		@example
			var htDate = oCalendar.getSelectDate();
			htDate.nYear; // 선택 년도
			htDate.nMonth; // 선택 월
			htDate.nDate; // 선택 날짜
	**/
	getSelectDate : function(){
		var sSelectDate, oSelectDate;
		if(this._nSelectDate && this._nSelectDate > 0){
			sSelectDate = this._nSelectDate + "";
			oSelectDate = {
				nYear : Number(sSelectDate.substr(0,4)),
				nMonth : Number(sSelectDate.substr(4,2)),
				nDate : Number(sSelectDate.substr(6,4))
			};
		}
		return oSelectDate;
	},
	/**
		Calendar Table을 그린다.
	**/
	_drawCalendar : function(oDrawDate){
		this._oViewDate = {
			nYear : oDrawDate.nYear,
			nMonth : oDrawDate.nMonth,
			nDate : oDrawDate.nDate
		};
		// if(this.fireEvent("beforeDraw",{
		// 	nYear : oDrawDate.nYear,
		// 	nMonth : oDrawDate.nMonth
		// })) {
			this._drawCalendarHeaderHtml();
			this._drawCalendarBodyHtml();
			this._drawDayColor();
			// this.fireEvent("afterDraw", {
			// 	nYear : oDrawDate.nYear,
			// 	nMonth : oDrawDate.nMonth
			// });
		// }
	},
	/**
		Calendar 현재 날짜 선택 날짜를 표시한다.
	**/
	_drawDayColor : function(){
		var nTodayDate = this._getDateNumber(this._oToday),
			nSelectDate = this._nSelectDate, // 선택한 날
			aCells = this._htWElement["calendarTbody"].queryAll('td');
		// 그려진 날짜를 비교하여 오늘 날짜와 선택 한날짜에 CSS 클래스 적용.
		var bSelectable = true;
		for (var i = 0, nLength = aCells.length, welCell; i < nLength; i++) {
			welCell = jindo.$Element(aCells[i]);
			var nDate = welCell.attr('data-cal-date') * 1;
			if(this._htSelectableData){
				bSelectable = this.isBetween(this.getStringToObject(nDate), this._htSelectableData.htDateFrom , this._htSelectableData.htDateTo);
			}
			
			if(!bSelectable){
                welCell.addClass(this._sClassPrefix + "unselectable");
            }
			
			if( !welCell.hasClass(this._sClassPrefix + 'prev-mon') && !welCell.hasClass(this._sClassPrefix + 'next-mon') ) {
				
				
				welCell[nTodayDate === nDate ? 'addClass' : 'removeClass'](this._sClassPrefix + 'today');
				welCell[(nSelectDate > -1 && nSelectDate === nDate) ? 'addClass' : 'removeClass'](this._sClassPrefix + 'selected');
				// if(!bSelectable){
					// welCell.addClass(this._sClassPrefix + "unselectable");
				// }
				if(nTodayDate == nSelectDate) {
					welCell.removeClass(this._sClassPrefix + 'today');
				}
			}
		}
	},

	/**
		Calendar Header 부분을 구성 한다.
	**/
	_drawCalendarHeaderHtml : function() {
		var nYear = this._oViewDate.nYear,
			nMonth = this._oViewDate.nMonth;
		if (nMonth < 10) {
			nMonth = ("0" + (nMonth * 1)).toString();
		}
		if(this._htWElement["calendarTitle"]) {
			this._htWElement["calendarTitle"].text(this.option("sTitleFormat").replace(/yyyy/g, nYear).replace(/y/g, (nYear).toString().substr(2,2)).replace(/mm/g, nMonth).replace(/m/g, (nMonth * 1)).replace(/M/g, this.option("aMonthTitle")[nMonth-1]));
		}
	},

	/**
		Calendar 본체 부분을 구성 한다.
	**/
	_drawCalendarBodyHtml : function() {
		var aHTML = [],oDate, nFirstTime, nLastTime,
			bPaintLastDay = false,
			nNowTime, aClassName, nNowDate, nDay,bPrevMonth,bNextMonth;

		// 해당 월의 마지막 날
		oDate = new Date(this._oViewDate.nYear, this._oViewDate.nMonth, 0);
		nLastTime = oDate.getTime();
		// 해당 월의 첫날
		oDate = new Date(this._oViewDate.nYear, this._oViewDate.nMonth - 1, 1);
		nFirstTime = oDate.getTime();

		while (oDate.getDay() !== 0) {
			oDate.setDate(oDate.getDate() - 1);
		}

		while(!bPaintLastDay){
			aHTML.push('<tr>');
			for (var i = 0; i < 7; i++) {
				nNowTime = oDate.getTime();
				aClassName = [];
				nNowDate = '';
				nDay = oDate.getDay();
				bPrevMonth = false;
				bNextMonth = false;

				if (nNowTime < nFirstTime) {
					aClassName.push(this._sClassPrefix + 'prev-mon');
					bPrevMonth = true;
				}
				if (nLastTime < nNowTime) {
					aClassName.push(this._sClassPrefix + 'next-mon');
					bNextMonth = true;
				}
				if (nDay === 0) { aClassName.push(this._sClassPrefix + 'sun'); }
				if (nDay === 6) { aClassName.push(this._sClassPrefix + 'sat'); }
				nNowDate = oDate.getFullYear() * 10000 + (oDate.getMonth() + 1) * 100 + oDate.getDate();
				aHTML.push('<td class="' + aClassName.join(' ') + '" data-cal-date="' + nNowDate + '"><a href="javascript:void(0)" class="' + this._sClassPrefix + 'date">' + oDate.getDate() + '</a></td>');
				oDate.setDate(oDate.getDate() + 1);
				if (nLastTime === nNowTime) {
					bPaintLastDay = true;
				}
				// this.fireEvent("draw", {
				// 	bPrevMonth : bPrevMonth,
				// 	bNextMonth : bNextMonth,
				// 	// elDate :
				// 	// elDateContainer :
				// 	// sHTML :
				// 	nYear : oDate.getFullYear(),
				// 	nMonth : oDate.getMonth() + 1,
				// 	nDate : oDate.getDate()
				// });
			}
			aHTML.push('</tr>');
		}
		this._htWElement["calendarTbody"].html(aHTML.join(''));
	},

	/**
		연월일을 포함한 HashTable이 특정 두 날 사이에 존재하는지 확인한다.

		@method isBetween
		@param {Object} htDate 비교를 원하는 날
		@param {Object} htFrom 시작 날짜
		@param {Object} htTo 끝 날짜
		@return {Boolean}
		@example
			oCalendar.isBetween({nYear:2010, nMonth:5, nDate:12}, {nYear:2010, nMonth:1, nDate:1}, {nYear:2010, nMonth:12, nDate:31}); => true
	**/
	isBetween : function(htDate, htFrom, htTo) {
		if (this.getDateObject(htDate).getTime() > this.getDateObject(htTo).getTime() || this.getDateObject(htDate).getTime() < this.getDateObject(htFrom).getTime()) {
			return false;
		} else {
			return true;
		}
	},

	/**
	 * 선택 가능한 날짜를 정의한다.
	 */
	setSelectableDate : function(htDateFrom, htDateTo){
		this._htSelectableData = {
			htDateFrom : htDateFrom,
			htDateTo : htDateTo
		};
	},
	
	/**
		요일 정보를 반환한다.

		@method getDayName
		@param  {Number} nIdx 요일 인덱스 (0~6)
		@return {String}		요일명
	**/
	getDayName : function(nIdx) {
		return this._aDayInfo[nIdx];
	},

	/**
		Date 객체를 구한다.

		@method getDateObject
		@param {Object} htDate 날짜 객체
		@return {Date}
		@example
			jindo.Calendar.getDateObject({nYear:2010, nMonth:5, nDate:12});
			jindo.Calendar.getDateObject(2010, 5, 12); //연,월,일
	**/
	getDateObject : function(htDate) {
		if (arguments.length == 3) {
			return new Date(arguments[0], arguments[1] - 1, arguments[2]);
		}
		return new Date(htDate.nYear, htDate.nMonth - 1, htDate.nDate);
	},

	getStringToObject : function(sDate){
		sDate = sDate + "";
		return {
			nYear : parseInt(sDate.substring(0, 4),10),
			nMonth : parseInt(sDate.substring(4, 6),10),
			nDate : parseInt(sDate.substring(6, 8),10)
		};
	},
	/**
		Date객체를 String으로 변경한다.

		@param {Object} htDate Date객체
		@param {String} sType YearMonth 인 경우, 년과 월로 계산. 그외는 년,월,일로 계산
		@return {Number} 숫자형태의 날짜
	**/
	_getDateNumber : function(htDate, sType){
		var nDate;
		if(sType === "YearMonth") {
			nDate = (htDate) ? (htDate.nYear * 10000 + htDate.nMonth * 100) : -1;
		} else {
			nDate = (htDate) ? (htDate.nYear * 10000 + htDate.nMonth * 100 + htDate.nDate) : -1;
		}
		return nDate;
	},
	/**
		jindo.m.Calendar 에서 사용하는 모든 객체를 release 시킨다.

		@method destroy
	**/
	destroy : function() {
		this.deactivate();
		this._bVisible = false;
		this._oToday = null;
		this._oViewDate = null;
		this._nSelectDate = -1;
		this._sClassPrefix = null;
		if(this.option("bUseEffect")){
			this._oTransition.destroy();
			this._oTransition = null;
		}
		this._aDayInfo = null;
	}
}).extend(jindo.m.UIComponent);
