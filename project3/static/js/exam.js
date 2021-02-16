var ExamModule = (function () {
    var $root
    var is_next = false
    var VOD_ID
    var EXAM_ANSWER = [];
    var ANSWER_MIN_CNT = 0;
    var LIMIT_DATE = new Date('2020-09-21T09:00:00'); //해당 날짜 지나면 시청불가
    var NOW_DATE = new Date();
    var IS_COMPLETE_EXAM = false;
    console.log(LIMIT_DATE, NOW_DATE, LIMIT_DATE < NOW_DATE)
    function init() {
        $root = $('.wrap');
        VOD_ID = MainModule.getUrlParameter('id');//main.js
        console.log("넘어온 VOD_ID: ", VOD_ID);
        // if (LIMIT_DATE < NOW_DATE) {
        //     alert('문제풀이는 2020년 9월 21일 오전 9시까지만 하실 수 있습니다.');
        //     location.replace('./list.html');
        //     return false;
        // }
        if (VOD_ID == '' || VOD_ID == null || VOD_ID == undefined) {//영상이 없다면
            alert(ALERT_TEXT_OBJ.basic[0]);//잘못된 접근입니다.
            location.replace('./list.html');//list.html 로 페이지 변경(뒤로가기 불가능), location.href : 페이지로 이동(뒤로가기 가능)
            return false;
        }
        eventBind();
        getVODDetail();
        getMyInfo();
    }

    function eventBind() {
        $root.on('click', '.js-exam_btns button', clickExamButton)
        $root.on('click', '#submit', submitExam);//다음강의로 이동
    }

    function getMyInfo() {
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
            var server_time = response.server_time
            console.log("회원 response:",response);//로그인한 회원 정보
            console.log("app_id:", response.app_id);
            if(response.app_id != 4){
                alert('이벤트에 연결되어있지 않은 회원입니다.');
                location.replace('./index.html')
            }

            console.log("ACCESS_USER_ARR", ACCESS_USER_ARR);//지정된 회원
            var is_access = false;
            for(var i=0;i<ACCESS_USER_ARR.length;i++){
                if(ACCESS_USER_ARR[i].name == response.name && ACCESS_USER_ARR[i].phone == response.phone){
                    is_access = true;
                    break;
                }
            }
            if(!is_access && (new Date(moment(server_time).format())<new Date(moment(DEFAULT_START_TIME).format()) || new Date(moment(server_time).format())>new Date(moment(DEFAULT_END_TIME).format()))){
                alert(ALERT_TEXT_OBJ.date);//접속 가능한 시간이 아닙니다.
                location.replace('./index.html')
                return false;
                console.log('접속불가!!!!')
            }
            var user_cnt_el = document.querySelector('.js-user_count');//로그인 접속자 카운트
            if(user_cnt_el != null && user_cnt_el != '' && user_cnt_el != undefined){
                var user_count_number = Number(response.active_user_count);
                user_count_number = (user_count_number>3000) ? 3000 : (user_count_number<1) ? 1 : user_count_number// 3000보다 크면 3000유지, 1보다 작으면 1유지
                user_cnt_el.innerText = user_count_number;
            }
        });
    }

    function getVODDetail() {
        var settings = {
            "url": "/api/v1/vod/" + VOD_ID,
            "method": "GET",
            "timeout": 0
        };

        $.ajax(settings).done(function (response) {
            // if (response.is_exam_passed === 1) { //이미 문제풀이가 완료됨.
            //     // location.replace('./movie.html?id=' + VOD_ID)
            //     IS_COMPLETE_EXAM = true;
            // }else{
                $('.js-exam_btns').prepend('<button class="">제출하기</button>');//js-exam_btns앞에 부착
            // }
            getExamData();
        }).fail(function (response) {
            if (response.status === 412) {
                alert(ALERT_TEXT_OBJ.vod[0]);//현재는 시청할 수 없는 강의
                location.replace('./list.html');
            } else {
                alert(ALERT_TEXT_OBJ.basic[2] + response.status);
                console.log("response.status", response.status);
            }
        });

    }

    function getExamData() {
        var data_obj = {
            'vod_id': VOD_ID
        }
        var settings = {
            "url": "/api/v1/question",
            "method": "GET",
            "timeout": 0,
            "data": data_obj
        };

        $.ajax(settings).done(function (response) {
            var html = ''
            console.log("response: ",response);
            ANSWER_MIN_CNT = response.minimum_correct_answer_amount//최소정답수량
            console.log("ANSWER_MIN_CNT:", ANSWER_MIN_CNT);

            /*
                $.each(function(index, element))
                : 배열을 관리하고자 할때 사용함
                function(반복문 한바퀴마다 실행)
                index(반복문이 몇번째인지 알수 있는 인덱스)
                element(현재 반복문에서 셀렉트되는 엘리먼트)
            */
            $.each(response.properties.question, function (key, value) {//배열(객체), 콜백함수
                // console.log("response.properties.question:", response.properties.question);//문제 상세 정본
                EXAM_ANSWER.push(value.right_answer)//문제 정답 번호
                console.log("value: ",value);
                html += '<dl>'
                html += '    <dt>' + value.title + '</dt>'
                html += '    <dd>'
                $.each(value.case, function (case_k, case_v) {
                    console.log("case_k:",case_k);
                    console.log("case_v:",case_v);
                    html += '        <div>'
                    html += '            <label>'
                    html += '                <input type="radio" name="exam_' + key + '" data-cnt="' + (case_k + 1) + '"> <span>' + case_v + '</span>'
                    html += '            </label>'
                    html += '        </div>'
                })
                console.log("key:", key);
                html += '    </dd>'
                html += '</dl>'
            })
            document.querySelector('.js-exam_content').innerHTML = html;
        }).fail(function (response) {
            if (response.status === 411) {
                alert('강의시청완료 후 문제풀이를 하실 수 있습니다.');
                location.replace('./movie.html?id=' + VOD_ID)
            } else if (response.status === 412) {
                alert('해당 문제풀이를 찾을 수 없습니다.');
                location.replace('./list.html')
            } else {
                alert(ALERT_TEXT_OBJ.basic[2] + response.status);
            }
        });
    }

    function clickExamButton() {
        var this_index = $(this).index(); // 0 : 제출하기(단,IS_COMPLETE_EXAM true면 닫기임), 1: 닫기
        if (this_index === 0 && IS_COMPLETE_EXAM === false) {
            var post_data_arr = {};//선택된 정답
            var dl_els = document.querySelectorAll('.js-exam_content dl');//문제수
            for (var i = 0; i < dl_els.length; i++) {
                var question_title = dl_els[i].querySelector('dt').innerText.replace(/^\s+|\s+$/g, '');// g: 대상문자열 내에 모든 패턴들을 검색, 앞뒤 공백제거
                var check_els = dl_els[i].querySelector('input[type="radio"]:checked');
                if (check_els == undefined || check_els == null || check_els == '') {
                    dl_els[i].querySelectorAll('input[type="radio"]')[0].focus();//문제가 여러개 일때 이동할 수 있게 
                    alert('[' + question_title + '] 문항의 답을 선택하세요.');
                    return false;
                }
                                //i = 0부터 문제수 , 
                post_data_arr['answers[' + i + ']'] = check_els.getAttribute('data-cnt');
                //array number는 0부터, 답변번호는 1부터 시작
            }
            //체크 다 되었으니 넘어가기
            postQuestionSubmit(post_data_arr);
            // MainModule.popVerticalMiddle();
        } else {
            location.replace('./movie.html?id=' + VOD_ID)
        }
    }

    //문제가 완료 된 후 다음 강의로 이동하기
    function postQuestionSubmit(obj) {
        console.log(obj);// answer[0//문제 번째], vod_id
        NOW_DATE = new Date();
        // if (LIMIT_DATE < NOW_DATE) {
        //     alert('문제풀이는 2020년 9월 21일 오전 9시까지만 하실 수 있습니다.');
        //     location.replace('./list.html');
        //     return false;
        // }
        var data_obj = obj;
        data_obj.vod_id = VOD_ID;
        var answer_cnt = 0;
        var answer_html_arr = []
        var answer_str = '';
        console.log("EXAM_ANSWER: ",EXAM_ANSWER);//문제 정답 
        for (var i = 0; i < EXAM_ANSWER.length; i++) {//정답 갯수 
            switch (i) {
                case 0:
                    answer_str = '첫';
                    break;
                case 1:
                    answer_str = '두';
                    break;
                case 2:
                    answer_str = '세';
                    break;
                case 3:
                    answer_str = '네';
                    break;
                case 4:
                    answer_str = '다섯';
                    break;
                case 5:
                    answer_str = '여섯';
                    break;
                case 6:
                    answer_str = '일곱';
                    break;
                case 7:
                    answer_str = '여덟';
                    break;
                case 8:
                    answer_str = '아홉';
                    break;
                case 9:
                    answer_str = '열';
                    break;
            
                default:
                    break;
            }

            if (EXAM_ANSWER[i] == data_obj['answers[' + i + ']']) {
                console.log("data_obj",data_obj);
                answer_cnt++;//for문이 끝나면 몇개 맞췄는지 
                if(i <= 9)
                {
                    answer_html_arr.push(answer_str+'번째 문항 정답입니다.')//10문항까지 한글표시
                }
                else
                {
                    answer_html_arr.push((i+1)+'번 정답입니다.')//11번째부터 는 숫자로 표시
                }
                
            }else{//오답일 경우
                if(i <= 9)
                {
                    answer_html_arr.push(answer_str+'번째 문항 정답 :'+EXAM_ANSWER[i]+'번')
                }
                else
                {
                    answer_html_arr.push((i+1)+'번 정답 :'+EXAM_ANSWER[i]+'번')
                }
                
            }
        }
        // document.querySelector('.js-pop_exam h1 span').innerHTML = answer_cnt
        var html = ''
        if(answer_cnt<1){
            html += '<h1>오답입니다.</h1>'
            // var answer_html_arr = []
            // for(var i=0;i<EXAM_ANSWER.length;i++){
            //     answer_html_arr.push((i+1)+'번 정답 :'+EXAM_ANSWER[i]+'번')
            // }
            // html += '<p>'+answer_html_arr.join('<br>')+'<br>다음 강의로 이동해주세요.</p>'
            // $('.js-pop_exam p').prepend('<div style="margin-bottom:8px;">(정답 : '+EXAM_ANSWER[0]+')</div>')
        }else{
            html += '<h1>정답입니다.</h1>'
            // html += '<p>다음 강의로 이동해주세요.</p>'
            // $('.js-pop_exam p').prepend('축하드립니다!<br>')
        }
        html += '<p>'+answer_html_arr.join('<br>') + '<br>다음 강의로 이동해주세요.</p>'
        document.querySelector('.js-pop_exam_text').innerHTML = html
        // if(answer_cnt<ANSWER_MIN_CNT){
        //     var html = ''
        //     html += '<h1>정답 : <span>'+answer_cnt+'</span>개</h1>'
        //     html += '<p>3문항 이상 부터 다음 강의로<br>이동하실 수 있습니다.</p>'
        //     html += '<button id="submit" class="btn">문제 풀이 다시하기</button>'
        //     document.querySelector('.js-pop_exam').innerHTML = html
        //     MainModule.popVerticalMiddle(1);
        //     return false;
        // }else{
        //     document.querySelector('.js-pop_exam h1 span').innerHTML = answer_cnt
        // }
        
        //서버에 보내기(결과값 저장)
        var settings = {
            "url": "/api/v1/question/store",
            "method": "POST",
            "timeout": 0,
            "data": data_obj
        };
        $.ajax(settings).done(function (response) {
            is_next = true;
            MainModule.popVerticalMiddle(0);
        }).fail(function (response) {
            if (response.status === 411) {
                alert('강의시청완료 후 문제풀이를 하실 수 있습니다.');
                location.replace('./movie.html?id=' + VOD_ID)
            } else if (response.status === 412) {
                alert('해당 문제풀이를 찾을 수 없습니다.');
                location.replace('./list.html')
            } else if (response.status === 413) {
                var html = ''
                html += '<h1>정답 : <span>' + answer_cnt + '</span>개</h1>'
                html += '<p>3문항 이상 부터 다음 강의로<br>이동하실 수 있습니다.</p>'
                html += '<button id="submit" class="btn">문제 풀이 다시하기</button>'
                document.querySelector('.js-pop_exam').innerHTML = html
                MainModule.popVerticalMiddle(0);
            } else {
                alert(ALERT_TEXT_OBJ.basic[2] + response.status);
            }
        });
    }

    function submitExam() {
        if (!is_next) {
            location.reload();
        } else {
            location.replace('./list.html')
        }
    }

    return {
        init: init
    };
})();
(function () {
    ExamModule.init();
})();
