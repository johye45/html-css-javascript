var ResultModule = (function () {
    var $root
    var IS_COMPLETE_TIME = 14400 //14400 : 4시간 > 초단위
    var TOTAL_TIME = 0; //내 수강시간 초단위, 4시간 이상이어야 수료증출력가능
    function init() {
        $root = $('.wrap');
        eventBind();
        getMyinfo();
    }

    function eventBind() {
        $root.on('click', '.js-result_btn_wrap button', clickResultBtns)
    }

    function getMyinfo() {
        var data_obj = {
            'event_id' : 4
        }
        var settings = {
            "url": "/api/v1/user/my_page",
            "method": "GET",
            "timeout": 0,
            "data" : data_obj
        };

        $.ajax(settings).done(function (response) {
            console.log(response);
            console.log("response.data")
            var server_time = response.server_time
            if(response.app_id != 4){
                alert('이벤트에 연결되어있지 않은 회원입니다.');
                location.replace('./index.html')
            }
            var is_access = false;
            for(var i=0;i<ACCESS_USER_ARR.length;i++){
                if(ACCESS_USER_ARR[i].name == response.name && ACCESS_USER_ARR[i].phone == response.phone){
                    is_access = true;
                    break
                }
            }
            if(!is_access && (new Date(moment(server_time).format())<new Date(moment(DEFAULT_START_TIME).format()) || new Date(moment(server_time).format())>new Date(moment(DEFAULT_END_TIME).format()))){
                alert(ALERT_TEXT_OBJ.date)
                location.replace('./index.html')
                return false;
                console.log('접속불가!!!!')
            }
            var user_cnt_el = document.querySelector('.js-user_count');
            if(user_cnt_el != null && user_cnt_el != '' && user_cnt_el != undefined){
                var user_count_number = Number(response.active_user_count);
                user_count_number = (user_count_number>3000) ? 3000 : (user_count_number<1) ? 1 : user_count_number
                user_cnt_el.innerText = user_count_number;
            }
            TOTAL_TIME = Number(response.total_watch_time);
            document.querySelector('.js-result_info').innerHTML = '<div><div>' + response.name + '</div></div><div><div>' + response.license_number + '</div></div>'//성함, 면허번호
            var hour = parseInt(TOTAL_TIME / 3600);
            var min = parseInt((TOTAL_TIME % 3600) / 60);
            var sec = TOTAL_TIME % 60;
            document.getElementById('duration').innerHTML = hour + '시간 ' + min + '분 ' + sec + '초'//총 시간
            console.log(IS_COMPLETE_TIME,TOTAL_TIME)
            if (TOTAL_TIME >= IS_COMPLETE_TIME) {//접속자가 본 영상 시청 시간이  IS_COMPLETE_TIME보다 크면 수료증 출력이 가능
                document.querySelector('.js-result_btn_wrap button[data-type="1"]').classList.add('active');//수료증 출력
                // $('.js-result_btn_wrap').append('<button data-type="1">수료증 출력</button>')
            }
        }).fail(function (response) {
            if (response.status === 401) {
                alert(ALERT_TEXT_OBJ.basic[4]);
                location.replace('./index.html')
            } else {
                alert(ALERT_TEXT_OBJ.basic[2] + response.status);
            }
        });
    }

    function clickResultBtns() {
        var this_type = Number(this.getAttribute('data-type')); // 0: logout, 1: 수료증
        console.log(this_type)
        if (this_type === 0) {//logout
            var settings = {
                "url": "/api/v1/auth/logout",
                "method": "GET",
                "timeout": 0,
            };
            
            //로그아웃 > 확인 > index.html 페이지로 이동
            $.ajax(settings).done(function (response) {
                console.log(response);
                location.replace('./index.html');
            }).fail(function (response) {
                alert(ALERT_TEXT_OBJ.basic[2] + response.status);
            });
        } else if (this_type === 1) {//수료증체크
            if (TOTAL_TIME >= IS_COMPLETE_TIME) {
                location.href = "./print.html";
            }else{
                alert('수료시간 4시간 이후로 수료증을 발급하실 수 있습니다.');
            }
        }else if(this_type === 2){ //영수증체크
            location.href = "./receipt.html";
        }else if(this_type === 3){ //강의실로 돌아가기
            location.href = "./list.html";
        }
    }

    return {
        init: init
    };
})();
(function () {
    ResultModule.init();
})();
