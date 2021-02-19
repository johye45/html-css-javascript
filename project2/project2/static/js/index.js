var IndexModule = (function () {
    var $root
    var login_data_obj = {}
    var is_show_notice_pop = false
    var SPEAKER_BX_EL;
    // var LOGIN_START_DATE = new Date('2020-09-14T09:00:00');
    // var LOGIN_START_DATE = new Date('2020-09-11T09:00:00');
    var alert_temp_text = '<로그인 및 강의 수강은 11월 29일(일) 09시부터 가능합니다.>'
    var server_time = ''
    var TOKEN_LIMIT_TIME = 180; //3분 180(초단위)
    var token_time = 0;//인증번호 시간
    var TOKEN_TIMER;
    var cookiedata;
    function init() {
        $root = $('.wrap');

        

        setDday();
        eventBind();
        speakerSlider();
        getServerTime();
        // checkPopup();
    }

    function eventBind() {
        $root.on('click', '#submit', loginUser)//로그인
        $root.on('click', '#sendToken', sendPhoneNumber)//휴대폰 인증
        //$root.on('keyup','#token',checkEnter)//인증번호 enter
        $root.on('click','.js-pop_notice_x_btn',checkNoticePop)
        $root.on('click','.js-speaker_cnt',showSpeakerPopup)//초청연자
        //$root.on('click', '#noDisplay', popupClose);
    }

    function getServerTime(){
        var settings = {
            "url": "/api/v1/user/get_server_time",
            "method": "GET",
            "timeout": 0
        };

        $.ajax(settings).done(function (response) {
            console.log(response);
            server_time = response
        });
    }

    function speakerSlider(){
        SPEAKER_BX_EL = $('.js-bx_speaker')
        SPEAKER_BX_EL.bxSlider({
            mode:"horizontal",    // 가로 수평으로 슬라이드된다.
            speed:500,        // 이동 속도를 설정한다.(1000= 1초)
            pager:false,    // 현재 위치 페이지 표시 여부를 설정한다.
            moveSlides:1,    // 슬라이드 이동 시 개수를 설정한다.
            slideWidth:'240px',    // 슬라이드 너비를 설정한다.
            minSlides:4,    // 최소 노출 개수를 설정한다.
            maxSlides:4,    // 최대 노출 개수를 설정한다.
            slideMargin:10, // 슬라이드 간의 간격을 설정한다.
            auto:true,         // 자동으로 흐를지 여부를 설정한다.
            autoHover:true, // 마우스오버 시 정지할지를 설정한다.
            controls:false,    // 이전 버튼, 다음 버튼 노출 여부를 설정한
            touchEnabled: false,
            pause: 2000
        })
        $(".js-prev").on("click", function(){
            // 이전 슬라이드 배너로 이동된다.
            SPEAKER_BX_EL.goToPrevSlide();
            // <a>의 링크를 차단한다.
            return false;
        });
        $(".js-next").on("click", function(){
            // 다음 슬라이드 배너로 이동된다.
            SPEAKER_BX_EL.goToNextSlide();
            // <a>의 링크를 차단한다.
            return false;
        });
    }

    function sendPhoneNumber() {
        if(token_time>0){//3분이 흐르고 있으면 
            alert('인증번호 전송은 3분마다 하실 수 있습니다.');
            return false;
        }
        var CHECK_VALUE_ARR = ['name', 'phone']//체크사항
        login_data_obj = {}
        for (var i = 0; i < CHECK_VALUE_ARR.length; i++) {
            var target = document.getElementById(CHECK_VALUE_ARR[i]);//0 name,1 phone
            if (target == null || target == undefined || target == '') {
                alert(ALERT_TEXT_OBJ.basic[0])//'잘못된 접근입니다.'
                // alert(alert_temp_text);
                return false;//잘못되면 튕겨나감
            }
            if (target.value.replace(/\s/g, '') === '') {//문자내 모든 공백 제거 === '' ->alue와 data type비교 true or false 
                alert(ALERT_TEXT_OBJ.login[i]);
                // alert(alert_temp_text);
                target.focus();//커서를 target으로 
                return false;
            }
            login_data_obj[CHECK_VALUE_ARR[i]] = target.value//else문
        }


        //지정된 접근허용자
        var is_access = false;
        for(var i=0;i<ACCESS_USER_ARR.length;i++){//ACCESS_USER_ARR -> main.js
            if(ACCESS_USER_ARR[i].name == login_data_obj.name && 
                ACCESS_USER_ARR[i].phone == login_data_obj.phone){
                is_access = true;
                break
            }
        }

        //서버 시간을 기준으로 현재시간 계산하기       현재시간 < DEFAULT_START_TIME보다 작거나                                 현재시간>DEFAULT_END_TIME이거보다 크거나
        if(!is_access && 
            (new Date(moment(server_time).format())<new Date(moment(DEFAULT_START_TIME).format()) ||
             new Date(moment(server_time).format())>new Date(moment(DEFAULT_END_TIME).format()))){
        //    false   &&   둘중 하나라도 false  => 둘다 false 이면 
           
            alert(ALERT_TEXT_OBJ.date)// '접속이 가능한 시간이 아닙니다.\n2020년 11월 29(일) ~ 12월 08일(화) 까지 접속이 가능합니다.'
            // location.replace('./index.html')
            return false;
            console.log('접속불가!!!!')
        }

        //querySelector(클래스명)
        document.querySelector('.js-token_time').innerHTML = ''
        clearInterval(TOKEN_TIMER);//TOKEN_TIMER중지
        token_time = TOKEN_LIMIT_TIME //token_time = 180초
        updateTokenTime()//인증번호 3분 카운트
        document.getElementById('sendToken').setAttribute('disabled',true)//핸드폰 인증 버튼 비활성화

        //파라미터
        var settings = {
            "url": "/api/v1/user/send_phone_inspect_sms",
            "method": "POST",
            "timeout": 0,
            "data": {
                'app_id' : 5,
                'name' : login_data_obj.name,
                'type' : 1,
                'phone': login_data_obj.phone
            }
        };


        /*
            ajax 메서드
            .done() : 요청이 성공했을 때 실행될 코드를 지정
            .fail() : 요청이 실패했을 때 실행될 코드 지정
            .always() : 요청의 성공/살패 여부에 관계없이 항상 실행될 코드를 지정
            .abort() : 서버와의 커뮤니케이션 취소
        */
                                       
        $.ajax(settings).done(function (response) { //성공 응답
            console.log(response);
            alert('070 번호 수신거부시, 문자수신이 어려울 수 있으니\n문자가 오지 않는 참가자분은 확인해주시길 바랍니다.')
            var input_els = document.querySelectorAll('.login_form input[type="text"]'); //이름, 휴대번호, 인증번호
            for (var i = 0; i < input_els.length; i++) {
                // input_els[i].readOnly = true;
                // input_els[i].setAttribute = ('readonly="readonly"');

                //eq() : 선택한 요소의 인덱스 번호에 해당하는 요소를 찾는다
                $('.login_form input[type="text"]').eq(i).attr('readonly','readonly')//readonly : 수정불가, 읽기만 가능, 값이 전달됨
            }
            var code_el = document.getElementById('token');//인증번호
            var login_btn_el = document.getElementById('submit');
            code_el.removeAttribute('readonly');//인증번호 수정 불가
            login_btn_el.style.display = ''//로그인 버튼 후 감추기
        }).fail(function (response) {//실패 응답
            var input_els = document.querySelectorAll('.login_form input[type="text"]');
            for (var i = 0; i < input_els.length; i++) {
                // input_els[i].readOnly = true;
                // input_els[i].setAttribute = ('readonly="readonly"');
                $('.login_form input[type="text"]').eq(i).attr('readonly','readonly')
            }
            // var code_el = document.getElementById('token');//token : 인증번호 id값
            var login_btn_el = document.getElementById('submit');
            //code_el.removeAttribute('readonly');
            login_btn_el.style.display = ''
            //에러 처리
            if (response.status === 411) {
                // alert(alert_temp_text);
                alert(ALERT_TEXT_OBJ.login[8])
            } else if (response.status === 412) {
                // alert(alert_temp_text);
                alert(ALERT_TEXT_OBJ.login[5]);
            } else if (response.code === 413) {
                // alert(alert_temp_text);
                alert(ALERT_TEXT_OBJ.login[6]);
            } else {
                // alert(alert_temp_text);
                alert(ALERT_TEXT_OBJ.basic[2] + response.status);
            }
        });

        console.log(login_data_obj)
    }

    //3분 카운트 
    function updateTokenTime(){
        TOKEN_TIMER = setInterval(function () {
            token_time--
            var token_html = ''
            var min = parseInt((token_time%3600)/60);
            var sec = token_time%60;
            min = (String(min).length==1) ? '0' + min : min
            sec = (String(sec).length==1) ? '0' + sec : sec
            token_html = min + ':' + sec
            // console.log(token_html)
            document.querySelector('.js-token_time').innerHTML = token_html
            if(token_time<=0){
                document.querySelector('.js-token_time').innerHTML = ''//3분 지나면 공백
                clearInterval(TOKEN_TIMER);//3분 지나면 시간 초기화
                document.getElementById('sendToken').removeAttribute('disabled')// disabled : 읽기가능, 변경불가, 값이 전송안됨
            }
        }, 1000);//(,1초)
    }

    function loginUser() {
        // 인증번호 발생여부 
        // var code_el = document.getElementById('token');
        // if (code_el.value.replace(/\s/g, '') == '') {
        //     alert('인증번호를 입력해주세요.');
        //     return false;
        // }
        
        
        login_data_obj.name = document.getElementById('name').value
        login_data_obj.phone = document.getElementById('phone').value
        
        var check_el = document.querySelectorAll('.login_form input[type="checkbox"]');

        if(login_data_obj.name==""){
            alert(ALERT_TEXT_OBJ.login[0]);
            return false;//입력안하면 돌아가기
        }else if(login_data_obj.phone==""){
            alert(ALERT_TEXT_OBJ.login[1]);
            return false;
        }else{
            //필수 체크박스
            for(var i=0; i<check_el.length;i++){
                console.log(check_el[i])
                if (!check_el[i].checked) {
                    alert(ALERT_TEXT_OBJ.login[(i+3)]);
                    // check_el.focus();
                    return false;
                }
            }

        }

        // login_data_obj.token = code_el.value
        login_data_obj.app_id = 5; //필수값, 하드코딩5, 주어지는 값이다
        login_data_obj.login_type = 3 //license 없이
        login_data_obj.license_number = ''
        var settings = {
            "url": "/api/v1/auth/login",//주어지는 url주소
            "method": "POST",
            "timeout": 0,
            "data": login_data_obj
        };

        $.ajax(settings).done(function (response) {//응답 성공시
            console.log(response);
            alert('로그인이 완료되었습니다.')
            location.href='./list.html';
        }).fail(function (response) {
            if (response.status === 411) {
                alert(ALERT_TEXT_OBJ.basic[3]);
            } else if (response.status === 412) {
                alert(ALERT_TEXT_OBJ.login[7]);
            }else if (response.status === 413) {
                alert(ALERT_TEXT_OBJ.login[9]);
            } else {
                alert(ALERT_TEXT_OBJ.basic[2] + response.status);
            }
        });
      
        
    }


    function showSpeakerPopup(){
        var this_type = this.getAttribute('data-type');
        console.log(this_type)
    }

    function checkNoticePop(){
        var this_type = this.getAttribute('data-type');
        if(this_type != '' && this_type != undefined && this_type != null && this_type != is_show_notice_pop){ //이게 다르다면 다음 notice 노출해야함
            $('.pop_wrap').hide();
            MainModule.popVerticalMiddle((Number(is_show_notice_pop)));
        }else{ //그냥 닫아도 됨
            MainModule.closePopEvent();
        }
    }

    //  function setCookie(name, value, expiredays) {
    //      var date = new Date();
    //      date.setDate(date.getDate() + expiredays);
    //      document.cookie = escape(name) + "=" + escape(value) + "; expires=" + date.toUTCString();
    // }

    //문서시작과 팝업 띄우기
    $(document).ready(function(){
        cookiedata = document.cookie;
        console.log(cookiedata);
        MainModule.popVerticalMiddle(0);//팝업창 가운데 정렬
         if(cookiedata.indexOf("close=done")<0){
             document.getElementById("popup_bg").style.display="block";
             document.getElementById("popup").style.display="block";
             console.log("pop up show");
         }else{
             // $("#popup").hide();
             document.getElementById("popup_bg").style.display="none";
             document.getElementById("popup").style.display="none";
             console.log("pop up hide");
         }

         $(".close").click(function(){
             //alert("닫기?");
             popupClose();
         });
    });

    function setCookie( name, value, expiredays ) { 
        var todayDate = new Date(); 
        todayDate.setDate( todayDate.getDate() + expiredays );
        document.cookie = name + "=" + escape( value ) + "; path=/; expires=" + todayDate.toGMTString() + ";"
    }
  
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
        }
        return "";
    }

    //쿠키 저장한채로 닫기
    function popupClose(){
        if($("input[name='chkbox']").is(":checked") ==true){
            setCookie("close","done",365);//저장 365일
        }
        // $("#pop").hide();
        //그냥 닫기
        document.getElementById("popup_bg").style.display="none";
        document.getElementById("popup").style.display= "none";
    };

    function setDday(){
        var today = new Date(); // ★★★★★★★★ 컴시간 말고 서버시간으로 변경필요
        var start_day = new Date('2020-11-29')
        var diff_day = dateDiff(today,start_day)
        diff_day = diff_day;
        console.log(diff_day)
        if(diff_day < 0){
            diff_day = 'D+' + Math.abs(diff_day)
        }else{
            diff_day = 'D-' + Math.abs(diff_day)
        }
        document.querySelector('.js-dday').innerHTML = diff_day
    }

    function dateDiff(_date1, _date2) {
        var diffDate_1 = _date1 instanceof Date ? _date1 :new Date(_date1);
        var diffDate_2 = _date2 instanceof Date ? _date2 :new Date(_date2);
     
        diffDate_1 =new Date(diffDate_1.getFullYear(), diffDate_1.getMonth()+1, diffDate_1.getDate());
        diffDate_2 =new Date(diffDate_2.getFullYear(), diffDate_2.getMonth()+1, diffDate_2.getDate());
     
        var diff = diffDate_2.getTime() - diffDate_1.getTime();
        diff = Math.ceil(diff / (1000 * 3600 * 24));
     
        return diff;
    }

    return {
        init: init
        // sendPhoneNumber: sendPhoneNumber
    };
})();
(function () {
    IndexModule.init();
})();
