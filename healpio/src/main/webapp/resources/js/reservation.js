
	let now = new Date(); // 현재 날짜 및 시간
	let selectedDay = null; // 선택된 일자
	let selectedTime = null; // 선택된 시간
	let selectedDate = null; // 선택된 날짜
	let maxCapacity = null; // 최대 수용인원 설정
	let currentCapacity = null; // 현재 수용인원 초기화
	let activeDays = null;
	let availableTimes = []; // 기본값으로 빈 배열을 설정

	let buttonStates = {}; // 날짜별 버튼 상태를 저장하는 객체
	
	window.addEventListener('load', fetchClassDetails);
	
	document.addEventListener("DOMContentLoaded", fetchClassDetails); // 중복 호출 제거
	
//	document.addEventListener("DOMContentLoaded", function() {
//		fetchClassDetails();  // 데이터를 먼저 가져옵니다.
//	});
	
	// URL에서 class_no 값을 추출하는 함수
	function getParamsFromURL() {
	    const urlParams = new URLSearchParams(window.location.search);
	    return {
	        class_no: urlParams.get('class_no'),
	        date: urlParams.get('reservation_date')  // 오타 수정
	    };
	}

	function fetchClassDetails() {
	    const params = getParamsFromURL();

	    if (params.class_no) {
	        let url = `/reservation/classDetails?class_no=${params.class_no}`;
	        if (params.reservation_date && params.reservation_date !== 'undefined') {
	            url += `&reservation_date=${params.reservation_date}`;
	        }
	        
	        fetch(url)
	            .then(response => {
	                if (!response.ok) {
	                    throw new Error('Network response was not ok');
	                }
	                return response.json();
	            })
	            .then(data => {
	                activeDays = data.activeDays;
//	                availableTimes = data.availableTimes;
	                availableTimes = data.availableTimes[0].split(',');
	                currentCapacity = data.currentCapacity;
	                maxCapacity = data.maxCapacity;
	                
	                console.log(activeDays, availableTimes, maxCapacity, currentCapacity);
	                
	                initializePage();
	            })
	            .catch(error => {
	                console.error('Error fetching class details:', error);
	            });
	    }
	}


    
    function initializePage() {
    	console.log("initializePage started!"); // 추가
        renderCalendar(now.getMonth(), now.getFullYear(), activeDays);
        renderTimeSelection(); // 예약 시간 설정
        resetSelections(); // 달력과 시간 선택을 초기화합니다.
        attachReservationListener(); // 예약하기 버튼 이벤트 설정
        attachModalButtonsListener(); // 모달 버튼 이벤트 설정
    }

	// 달력 생성 함수
	function renderCalendar(month, year) {
//		console.log("Rendering calendar for:", month, year); // 추가
	    let daysInMonth = new Date(year, month + 1, 0).getDate(); // 선택된 월의 일수
	    let firstDayOfMonth = new Date(year, month, 1).getDay(); // 선택된 월의 첫번째 날짜
	
	    // 달력의 헤더 생성 (월, 년)
	    let calendarHeader = `
	        <tr>
	            <th colspan="7">
	                <span class="nav-arrow" id="prevMonth">&lt;</span>
	                ${year}년 ${month + 1}월
	                <span class="nav-arrow" id="nextMonth">&gt;</span>
	            </th>
	        </tr>
	        <tr>
	            <th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th>
	        </tr>`;
	
	    let calendar = document.querySelector('#calendar'); // 달력 엘리먼트 선택
	    calendar.innerHTML = calendarHeader; // 달력 헤더 설정
	
	    // 첫번째 주 채우기
	    let calendarBody = '<tr>';
	    for(let i = 0; i < 7; i++) {
	        calendarBody += i < firstDayOfMonth ? '<td></td>' : `<td>${i - firstDayOfMonth + 1}</td>`;
	    }
	    calendarBody += '</tr>';
	
	    // 나머지 날짜 채우기
	    for(let i = 8 - firstDayOfMonth; i <= daysInMonth; i += 7) {
	        calendarBody += '<tr>';
	        for(let j = i; j < i + 7 && j <= daysInMonth; j++) {
	            calendarBody += `<td>${j}</td>`;
	        }
	        calendarBody += '</tr>';
	    }

	    calendar.innerHTML += calendarBody; // 달력 바디 설정
	
	    // 각 일자에 이벤트 리스너 추가
//	    document.querySelectorAll('#calendar td').forEach((e, i) => {
//	        if (i < 7 || e.innerText === "") return;
	    // 각 일자에 이벤트 리스너 추가
	    document.querySelectorAll('#calendar td').forEach(e => {
	        if (e.innerText === "") return;
	        let date = new Date(year, month, parseInt(e.innerText)); // 해당 날짜 구하기

	        let dayOfWeek = date.getDay(); // 해당 날짜의 요일 구하기

	        // activeDays 배열에 해당 요일이 없다면 리턴
	        if (!activeDays.includes(dayOfWeek)) return;

	        e.addEventListener('click', () => {
	            if (selectedDay === e) {
	                selectedDay.classList.remove('selected');
	                selectedDay = null;
	                selectedDate = null;
	            } else {
	                if (selectedDay) selectedDay.classList.remove('selected');
	                e.classList.add('selected');
	                selectedDay = e;

	                // 선택된 날짜를 저장
	                let dd = String(date.getDate()).padStart(2, '0'); // 일자를 가져와서 문자열로 변환. 숫자가 한 자리일 경우 앞에 0을 붙임.
	                let mm = String(date.getMonth() + 1).padStart(2, '0'); // 월을 가져와서 문자열로 변환. 월은 0부터 시작하므로 1을 더함. 숫자가 한 자리일 경우 앞에 0을 붙임.
	                let yyyy = date.getFullYear(); // 연도를 가져옴.
	                selectedDate = yyyy + '-' + mm + '-' + dd; // 연-월-일 형태의 문자열로 합침.

	                console.log("selectedDate======" + selectedDate); // 결과 출력.
	                
	                // 선택된 날짜 input박스 value값에 넣기
	                document.querySelector('#selectedDate').value = selectedDate;

	                // 모든 예약 시간 선택 버튼을 비활성화
//	                document.getElementById('time-selection').querySelectorAll('button').forEach(e => {
//	                    e.disabled = true;
//	                });

	                // 선택된 날짜의 예약 시간 선택 버튼을 활성화
//	                if (buttonStates[selectedDate]) {
//	                    buttonStates[selectedDate].forEach(time => {
//	                        document.getElementById(`time-${time}`).disabled = false;
//	                    });
//	                }
	            }
	            
	            renderTimeSelection(selectedDate);
	        });
	    });

	 // 이전 달로 이동 버튼에 대한 클릭 이벤트
        document.getElementById('prevMonth').addEventListener('click', () => {
            now.setMonth(now.getMonth() - 1); // 이전 달로 설정
            renderCalendar(now.getMonth(), now.getFullYear()); // 새로운 달력 렌더링
            renderTimeSelection(); // 예약 시간 재설정
            resetSelections(); // 선택된 날짜와 시간 초기화
        });

        // 다음 달로 이동 버튼에 대한 클릭 이벤트
        document.getElementById('nextMonth').addEventListener('click', () => {
            now.setMonth(now.getMonth() + 1); // 다음 달로 설정
            renderCalendar(now.getMonth(), now.getFullYear()); // 새로운 달력 렌더링
            renderTimeSelection(); // 예약 시간 재설정
            resetSelections(); // 선택된 날짜와 시간 초기화
        });
	}
	
	function resetSelections() {
	    if (selectedDay) {
	        selectedDay.classList.remove('selected');
	        selectedDay = null;
	    }
	    if (selectedTime) {
	        selectedTime.classList.remove('selected');
	        selectedTime = null;
	    }
	    document.getElementById('reserve').disabled = true;
	    renderTimeSelection(); // 선택된 날짜와 시간 초기화 후 예약 시간 재설정
	}
	
	
        
	// 예약시간버튼 생성 함수
	  function renderTimeSelection(selectedDate) {
		    let timeSelection = document.getElementById('time-selection');
		    timeSelection.innerHTML = '';

		    // 버튼을 4개씩 묶기 위한 빈 배열 생성
		    let timeButtons = [];

		    for (let i = 8; i <= 22; i++) {
		      let timeButton = document.createElement('button');
		      timeButton.className = 'time-button';

		   // 기존에 시간과 인원을 함께 설정하던 부분을 분리합니다.
		      let timeText = i < 10 ? `0${i}:00` : `${i}:00`;
		      
		        // 해당 시간에 대한 reservation_count 값을 찾는 코드
		      let reservationCountForTime = currentCapacity.find(item => item.reservation_time === timeText)?.reservation_count || 0;

		      
		        timeButton.textContent = `${timeText}\n(${reservationCountForTime}/${maxCapacity}명)`;
		        timeButton.dataset.time = timeText;
		        console.log(currentCapacity);
		        console.log(reservationCountForTime);
		      
		      // 버튼을 비활성화/활성화할 때 데이터 속성에서 시간을 가져옵니다.
		      timeButton.disabled = !(availableTimes.includes(timeButton.dataset.time) && selectedDay) || (reservationCountForTime >= maxCapacity);

		      // 토글버전 추가
		      timeButton.addEventListener('click', () => {
		        if (timeButton.disabled) return;

		        if (selectedTime === timeButton) {
		          selectedTime.classList.remove('selected');
		          selectedTime = null;
		          document.getElementById('reserve').disabled = true;
		        } else {
		          if (selectedTime) selectedTime.classList.remove('selected');
		          timeButton.classList.add('selected');
		          
		          // 아래의 라인은 버튼의 텍스트에서 시간만을 추출하여 selectedTime 인풋 필드에 저장하는 코드입니다.
		          document.querySelector('#selectedTime').value = timeButton.textContent.substring(0, 5);
		          
		          selectedTime = timeButton;
		          document.getElementById('reserve').disabled = false;
		        }
		      });

		      timeButtons.push(timeButton); // 배열에 버튼 추가

		      // 배열에 4개의 버튼이 담겼으면 이를 새로운 행(div)에 배치
		      if (timeButtons.length === 4) {
		        let row = document.createElement('div');
		        for (let j = 0; j < 4; j++) {
		          row.appendChild(timeButtons[j]);
		        }
		        timeSelection.appendChild(row);
		        timeButtons = []; // 배열을 초기화하여 다음 행에 버튼을 배치할 준비
		      }
		    }

		    // 마지막 행에 버튼이 4개 미만이라면 dummy 버튼을 추가
		    if (timeButtons.length > 0) {
		      let row = document.createElement('div');
		      for (let i = 0; i < timeButtons.length; i++) {
		        row.appendChild(timeButtons[i]);
		      }
		      while (row.childNodes.length < 4) {
		        let dummyButton = document.createElement('button');
		        dummyButton.style.visibility = 'hidden';
		        row.appendChild(dummyButton);
		      }
		      timeSelection.appendChild(row);
		    }
		  }




    // 예약하기 버튼에 대한 이벤트 설정 함수
    function attachReservationListener() {
        // 예약하기 버튼에 클릭 이벤트 추가
        document.getElementById('reserve').addEventListener('click', (event) => {
        	event.preventDefault();
        	
            let selectedDate = document.querySelector('#selectedDate').value; // 선택된 날짜 값을 가져오는 로직
            let selectedTime = document.querySelector('#selectedTime').value; // 선택된 시간 값을 가져오는 로직

            document.querySelector('input[name="date"]').value = selectedDate;
            document.querySelector('input[name="time"]').value = selectedTime;
        	
            let currentYear = now.getFullYear(); // 현재 연도 가져오기
            let currentMonth = now.getMonth() + 1; // 현재 월 가져오기(JavaScript에서는 월이 0부터 시작하므로 1을 더해준다)
            // 모달에 표시할 텍스트 설정
            document.getElementById('confirmation-text').innerHTML = `예약하시겠습니까? <br> ${currentYear}년 ${currentMonth}월 ${selectedDay.innerText}일 ${selectedTime}에 예약하시려면 '예'를 클릭하세요.`;
            document.getElementById('modal').style.display = 'block'; // 모달 표시
            // 모달창 배경 보이기
            document.getElementById('myModal').style.display = 'block';
            // 모달창 내용물도 보이기
            document.getElementById('modal-content').style.display = 'block';
        });
    }

    // 모달의 버튼에 대한 이벤트 설정 함수
    function attachModalButtonsListener() {
        // 예약 확인 버튼 클릭 이벤트
        document.getElementById('confirm').addEventListener('click', () => {
//            location.href = "/reservation/confirm"; // 실제 예약 완료 페이지의 URL로 변경
        	document.getElementById('reservationForm').submit();
        });

        // 예약 취소 버튼 클릭 이벤트
        document.getElementById('cancel').addEventListener('click', () => {
            // 모달창 내용물 숨기기
            document.getElementById('modal-content').style.display = 'none';
            // 모달창 배경도 숨기기
            document.getElementById('myModal').style.display = 'none';
        });
    }

    // 모달창 가져오기
    var modal = document.getElementById("myModal");
    // 모달을 여는 버튼 가져오기
    var btn = document.getElementById("reserve");
    // 모달을 닫는 버튼(엑스) 가져오기
    var span = document.getElementsByClassName("close")[0];
    // 사용자가 버튼을 클릭하면 모달창 열기
    btn.onclick = function() {
      modal.style.display = "block";
    }
    // 사용자가 엑스(x)를 클릭하면 모달창 닫기
    span.onclick = function() {
      modal.style.display = "none";
    }
    // 사용자가 모달창 외부를 클릭하면 모달창 닫기
    window.onclick = function(event) {
	    if (event.target == modal) {
	        modal.style.display = "none";
	    }
    }
    