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
    var token_time = 0;
    var TOKEN_TIMER;
    function init() {
        $root = $('.wrap');
        setDday();
        eventBind();
        speakerSlider()
        getServerTime();
        // checkPopup();
    }

    function eventBind() {
        $root.on('click', '#submit', loginUser)
        $root.on('click', '#sendToken', sendPhoneNumber)
        $root.on('keyup','#token',checkEnter)
        $root.on('click','.js-pop_notice_x_btn',checkNoticePop)
        $root.on('click','.js-speaker_cnt',showSpeakerPopup)
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
            speed:500,        // 이동 속도를 설정한다.
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
        if(token_time>0){
            alert('인증번호 전송은 3분마다 하실 수 있습니다.');
            return false;
        }
        var CHECK_VALUE_ARR = ['name', 'phone']
        login_data_obj = {}
        for (var i = 0; i < CHECK_VALUE_ARR.length; i++) {
            var target = document.getElementById(CHECK_VALUE_ARR[i]);
            if (target == null || target == undefined || target == '') {
                alert(ALERT_TEXT_OBJ.basic[0])
                // alert(alert_temp_text);
                return false;
            }
            if (target.value.replace(/\s/g, '') === '') {
                alert(ALERT_TEXT_OBJ.login[i]);
                // alert(alert_temp_text);
                target.focus();
                return false;
            }
            login_data_obj[CHECK_VALUE_ARR[i]] = target.value
        }

        var is_access = false;
        for(var i=0;i<ACCESS_USER_ARR.length;i++){
            if(ACCESS_USER_ARR[i].name == login_data_obj.name && ACCESS_USER_ARR[i].phone == login_data_obj.phone){
                is_access = true;
                break
            }
        }
        if(!is_access && (new Date(moment(server_time).format())<new Date(moment(DEFAULT_START_TIME).format()) || new Date(moment(server_time).format())>new Date(moment(DEFAULT_END_TIME).format()))){
            alert(ALERT_TEXT_OBJ.date)
            // location.replace('./index.html')
            return false;
            console.log('접속불가!!!!')
        }
        document.querySelector('.js-token_time').innerHTML = ''
        clearInterval(TOKEN_TIMER);
        token_time = TOKEN_LIMIT_TIME
        updateTokenTime()
        document.getElementById('sendToken').setAttribute('disabled',true)
        var settings = {
            "url": "/api/v1/user/send_phone_inspect_sms",
            "method": "POST",
            "timeout": 0,
            "data": {
                'app_id' : 4,
                'name' : login_data_obj.name,
                'type' : 1,
                'phone': login_data_obj.phone
            }
        };

        $.ajax(settings).done(function (response) {
            console.log(response);
            alert('070 번호 수신거부시, 문자수신이 어려울 수 있으니\n문자가 오지 않는 참가자분은 확인해주시길 바랍니다.')
            var input_els = document.querySelectorAll('.login_form input[type="text"]');
            for (var i = 0; i < input_els.length; i++) {
                // input_els[i].readOnly = true;
                // input_els[i].setAttribute = ('readonly="readonly"');
                $('.login_form input[type="text"]').eq(i).attr('readonly','readonly')
            }
            var code_el = document.getElementById('token');
            var login_btn_el = document.getElementById('submit');
            code_el.removeAttribute('readonly');
            login_btn_el.style.display = ''//display속성이 자동으로 none되어있기 때문에 속성을 지우기 위해서!
        }).fail(function (response) {
            var input_els = document.querySelectorAll('.login_form input[type="text"]');
            for (var i = 0; i < input_els.length; i++) {
                // input_els[i].readOnly = true;
                // input_els[i].setAttribute = ('readonly="readonly"');
                $('.login_form input[type="text"]').eq(i).attr('readonly','readonly')
            }
            var code_el = document.getElementById('token');
            var login_btn_el = document.getElementById('submit');
            code_el.removeAttribute('readonly');
            login_btn_el.style.display = ''
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

    function loginUser() {
        var code_el = document.getElementById('token');
        if (code_el.value.replace(/\s/g, '') == '') {
            alert('인증번호를 입력해주세요.');
            return false;
        }

        var check_el = document.querySelectorAll('.login_form input[type="checkbox"]');
        for(var i=0; i<check_el.length;i++){
            console.log(check_el[i])
            if (!check_el[i].checked) {
                alert(ALERT_TEXT_OBJ.login[(i+3)]);
                // check_el.focus();
                return false;
            }
        }
    
        login_data_obj.name = document.getElementById('name').value
        login_data_obj.phone = document.getElementById('phone').value

        login_data_obj.token = code_el.value
        login_data_obj.app_id = 4; //필수값, 하드코딩4
        login_data_obj.login_type = 2 //license 없이
        login_data_obj.license_number = ''
        var settings = {
            "url": "/api/v1/auth/login",
            "method": "POST",
            "timeout": 0,
            "data": login_data_obj
        };

        $.ajax(settings).done(function (response) {
            console.log(response);
            alert('핸드폰 인증 및 로그인이 완료되었습니다.\n ‘PREPARATION FOR THE NEXT DECADE OF PROSTHODONTICS’ 에 오신 것을 환영합니다!')
            location.href='./list.html';
        }).fail(function (response) {
            if (response.status === 411) {
                alert(ALERT_TEXT_OBJ.basic[3]);
            } else if (response.status === 412) {
                alert(ALERT_TEXT_OBJ.login[7]);
            } else {
                alert(ALERT_TEXT_OBJ.basic[2] + response.status);
            }
        });
    }

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
                document.querySelector('.js-token_time').innerHTML = ''
                clearInterval(TOKEN_TIMER);
                document.getElementById('sendToken').removeAttribute('disabled')
            }
        }, 1000);
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

    function checkEnter(e){
        if(e.keyCode === 13){
            loginUser()
        }
    }

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
