var PrintModule = (function () {
    var $root
    var TOTAL_TIME = 0;
    var IS_COMPLETE_TIME = 14400 //14400 : 4시간 > 초단위
    function init() {
        $root = $('.wrap');
        eventBind();
        getMyInfo(false);
    }

    function eventBind() {
        $root.on('click', '#print', printPage)
        $root.on('click','#locationMain',logout)
    }

    function getMyInfo(is_print) {
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
            TOTAL_TIME = Number(response.total_watch_time)
            if (TOTAL_TIME < IS_COMPLETE_TIME) {
                alert('수료시간 4시간 이후로 수료증을 발급하실 수 있습니다.');
                history.go(-1);
            }
            var start_date = response.event_begin_at;
            var end_date = response.event_end_at;
            var date = start_date.split('-').join('. ') + ' ~ ' + end_date.split('-')[1] + '. ' + end_date.split('-')[2];
            var TOTAL_TIME = Number(response.total_watch_time);
            var hour = parseInt(TOTAL_TIME / 3600);
            var html = ''
            html += '<div class="page_border">'
            html += '    <h1>수 료 증</h1>'
            html += '    <ul class="">'
            html += '        <li><span>성 함</span><span>' + response.name + '</span></li>'
            html += '        <li><span>면 허 번 호</span><span>' + response.license_number + '</span></li>'
            html += '        <li><span>기 간</span><span>' + date + '</span></li>'
            html += '    </ul>'
            html += '    <p>귀하는 온라인으로 진행된<br>제 84회 대한치과보철학회 학술대회에서<br>강의시청 총 '+hour+'시간을 완료하여<br>다음과 같이 수료증을 수여합니다.</p>'
            html += '    <div class="txt-c print_bot">'
            html += '        <div class="bot_day"></div>'
            html += '        <div class="bot_name">대한치과보철학회 회장 권 긍 록&nbsp;&nbsp;(인)<span class="drop"></span></div>'
            html += '        <div class="bot_info"></div>'
            html += '    </div>'
            html += '</div>'
            document.querySelector('.js-print').innerHTML = html;
            if (is_print === true) {
                var isFirefox = typeof InstallTrigger !== 'undefined';
                if(isFirefox){
                    alert('firefox 브라우저는 프린트기능을 지원하지 않습니다.\n다른 브라우저를 이용해주세요.');
                    return false;
                }
                window.print();
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

    function printPage() {
        console.log('print!')
        getMyInfo(true);
    }

    window.onafterprint = function () {
        // location.href="./result.html"
        // logout();
    }

    function logout() {
        var settings = {
            "url": "/api/v1/auth/logout",
            "method": "GET",
            "timeout": 0,
        };

        $.ajax(settings).done(function (response) {
            console.log(response);
            location.replace('./index.html');
        }).fail(function (response) {
            alert(ALERT_TEXT_OBJ.basic[2] + response.status);
        });
    }

    return {
        init: init
    };
})();
(function () {
    PrintModule.init();
})();
