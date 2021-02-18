var MovieModule = (function () {
    var socket = io.connect('http://14.63.171.200:3002');
    var $root
    var maxTime = 0;//내가 본 최대 시간 
    var video_end = false;
    var exam_end = false;
    var currentTime = 0;// 현재 내가 보고 있는 영상 시간 위치
    var VOD_ID;
    var is_post_watch_time = true;
    var post_watch_time = 0
    var myPlayer
    var LIMIT_DATE = new Date('2020-09-21T09:00:00'); //해당 날짜 지나면 시청불가
    // var LIMIT_DATE = new Date('2020-09-09T13:58:00'); //해당 날짜 지나면 시청불가
    var NOW_DATE = new Date();
    // var MOVIE_URL_ARR = [
    //     'http://14.49.38.84:80',
    //     'http://14.49.36.60:80',
    //     'http://14.49.37.111:80'
    // ]; //vod file port
    var MOVIE_URL_ARR = [
        'http://14.49.38.84:80',
        'http://14.49.38.84:80',
        'http://14.49.38.84:80'
    ];
    var THIS_VOD_URL = ''
    var USED_NUM_ARR = []
    var load_url_num;//랜던 서버 번호
    var IS_LOAD_VOD_ERROR = false;
    var is_first_play = true;
    var USER_ID;
    var USER_LEVEL;
    var SPEACIAL_USER_LV = 40
    var RAMDOM_TOKEN = Math.floor((Math.random() * 100000000))//0~99999999까지의 난수 지정, 중복시청 방지
    var IS_PASS_TIME_ID_ARR = ['117','113']//id 가 117,113인 영상은 문제를 풀지 않아도 영상 시간이 기록된다
    console.log(LIMIT_DATE, NOW_DATE, LIMIT_DATE < NOW_DATE)
    var CHANGE_TIMER;
    var LAST_POST_TIME = 0;
    function init() {
        $root = $('.wrap');
        // console.log(
        //     "%c강의 동영상 유출 금지",
        //     "color:red;font-family:system-ui;font-size:2rem;-webkit-text-stroke: 1px black;text-stroke: 1px black;font-weight:bold"
        //   );
        // if (LIMIT_DATE < NOW_DATE) {
        //     alert('강의는 2020년 9월 21일 오전 9시까지만 시청하실 수 있습니다.');
        //     location.replace('./list.html');
        //     return false;
        // }
        VOD_ID = MainModule.getUrlParameter('id');// id값 반환
        // if (VOD_ID == '' || VOD_ID == null || VOD_ID == undefined) {
        //     alert(ALERT_TEXT_OBJ.basic[0]);
        //     location.replace('./list.html');
        //     return false;
        // }

            //117 or 113이 일치하는 문자열이 없으면 (-1)
        if(IS_PASS_TIME_ID_ARR.indexOf(VOD_ID) != -1){
            console.log('다 보면 넘기기');//117 113이면 다 보면 넘기기
        }

        //서버(3개 MOVIE_URL_ARR[]) 랜덤하게 가져오기  --> 서버 과부화 방지
        load_url_num = (Math.floor((Math.random() * MOVIE_URL_ARR.length) + 0)) //해당 번호로 갖고온 url사용하기 ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
        
        USED_NUM_ARR.push(load_url_num);//몇번째 서버를 사용했는지 저장
        
        getMyInfo()
        eventBind();

    }

    function eventBind() {
        $root.on('click', '.js-lecture_btn_wrap button', clickLectureBtn)//강의 목록, 문제풀이 버튼 감싼  div
        // $root.on('click','#lectureList',locationList)
    }

    function getMyInfo() {
        var settings = {
            "url": "/api/v1/user/my_page",
            "method": "GET",
            "timeout": 0
        };

        // 성공시 동작
        $.ajax(settings).done(function (response) {
            // console.log("response1: ",response);//사용자 정보
            
            var server_time = response.server_time
            if(response.app_id != 4){
                alert('이벤트에 연결되어있지 않은 회원입니다.');
                location.replace('./index.html');//기존페이지를 새로운 index.html 로 변경시킨다
            }
            var is_access = false;//지정된 유저
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
            USER_ID = response.id;
            // console.log("USER_ID:",response.id);//사용자 id
            USER_LEVEL = response.admin_level;//사용자 level(level에 따라 접속 가능한 영상이 제한 됨)
            var user_cnt_el = document.querySelector('.js-user_count');//접속자수  user_cnt_el/3000
            if (user_cnt_el != null && user_cnt_el != '' && user_cnt_el != undefined) {
                var user_count_number = Number(response.active_user_count);//active_user_count :접속자 수
                user_count_number = (user_count_number > 3000) ? 3000 : (user_count_number < 1) ? 1 : user_count_number
                user_cnt_el.innerText = user_count_number;
            }
            websocketVod();//다중접속자
            checkMultiLogin();//같은 계정이 동시간대에 여러 영상을 시청하는 것을 방지 하기 위해 
        }).fail(function (response) {//실패시 
            if (response.status === 401) {
                alert(ALERT_TEXT_OBJ.basic[4]);//로그인 후 이용가능 합니다.
                location.replace('./index.html')//뒤로가기 불가
            } else {
                alert(ALERT_TEXT_OBJ.basic[2] + response.status);//서버문제 
            }
        });
    }

    //하나의 아이디에 RANDOM_TOKEN을 정의해준다 (동시간대 여러 영상 시청 XXX)   
    function checkMultiLogin() {
        // console.log(RAMDOM_TOKEN,'dddd')
        var data_obj = {
            'event_id' : 4,//app_id와는 다르다( 대부분 app_id와 일치시킴 )
            'token' : RAMDOM_TOKEN
        }
        var settings = {
            "url": "/api/v1/vod/send_vod_show_signal?"+data_obj,
            "method": "GET",
            "timeout": 0,
            "data" : data_obj
        };

        $.ajax(settings).done(function (response) {
            // console.log(response);
            getVODDetail()
        });
    }

    //하나의 아이디로 다른 영상을 동시 시청 할 수 없도록 방지하기 위해서!(E-poster, E-booth는 중복된 아이디 가능)
    function websocketVod(){
        // console.log('check multi login')
                    //서버에서 받을 이벤트명, function(data){} 
                    //data = 서버에서 날아온 data를 의미하고 checkMultiLogin의 "data"와 다르다
        //socket.on('이벤트 명',function(data){}) : 서버측에서 이벤트를 받을 때 
        socket.on("duplication_vod_access_check:user_id_"+USER_ID+".event_id_4:App\\Events\\DuplicationVODAccessCheck", function (data) { //다중접속체크
            if(data.token != RAMDOM_TOKEN){
                console.log("data: ",data);
                alert('다중 접속으로 강의를 시청하실 수 없습니다.');
                location.replace('./list.html');
            }
        }.bind(this));
    }

    function getVODDetail() {
        var settings = {
            "url": "/api/v1/vod/" + VOD_ID,
            "method": "GET",
            "timeout": 0
        };

        $.ajax(settings).done(function (response) {
            console.log("response: ",response);
            if(response.category_type == 1 && SPEACIAL_USER_LV != USER_LEVEL){//SPEACIAL_USER_LV=관리자페이지에서 지정된 40level
                alert('권한이 없습니다.');
                location.replace('./list.html');
                return false;
            }
            var vod_url = MOVIE_URL_ARR[load_url_num]
            if(response.file_1 == ''){
                alert('영상이 존재하지 않습니다.');
                history.go(-1);
            }
            // if (myPlayer == undefined) {
                document.getElementById('lecture_movie').innerHTML = '<source src="' + vod_url + response.file_1 + '" type="video/mp4">'
                // document.getElementById('lecture_movie').innerHTML = '<source src="./static/images/test_video_01.mp4" type="video/mp4">'
                console.log('처음 불러올 링크 >> ', MOVIE_URL_ARR[load_url_num]+ response.file_1);
                console.log("response.file_1",response.file_1);
                THIS_VOD_URL = response.file_1;
                // var PROF_VALUE_ARR = ['title', 'summary', 'email','email_en']

                //vod 영상 우측 정보 표시
                var PROF_VALUE_ARR = ['title']
                var info_html = ''
                for (var i = 0; i < PROF_VALUE_ARR.length; i++) {
                    if(response[PROF_VALUE_ARR[i]] != '' && response[PROF_VALUE_ARR[i]] != null && response[PROF_VALUE_ARR[i]] != undefined){
                        info_html += '<li><span>'+response[PROF_VALUE_ARR[i]]+'</span></li>'
                    }
                }
                document.querySelector('.js-prof_info').innerHTML = info_html

                /*영상 시간 지정하기*/
                currentTime = response.watch_time//현재 내가 보고 있는 영상 시간 저장
                console.log("watch_time",response.watch_time);
                maxTime = response.watch_time//내가 본 최대 영상 시간 저장(저장한 이유: currentTime이 도중에 변경되어도 최대값을 유지하기 위해서 )
                post_watch_time = maxTime//서버에 전송된 쵀대 시간 저장(10초단윌 서버와 통신)

                if (response.is_exam_passed === 1) {//exam 완료했는지 안했는지 판별하기
                    console.log("문제 통과 여부: ",response.is_exam_passed);
                    exam_end = true
                    // console.log('문제풀이 완료!')
                    document.getElementById('examBtn').classList.add('active');//새로운 클래스 추가
                } else {
                    document.getElementById('examBtn').style.display = ''//비활성화
                }
                if (response.is_finished === 1) {//영상 시청이 완료 됐는지
                    currentTime = 0;
                    video_end = true;
                    is_post_watch_time = false;//영상 위치 활성화
                    activeExam()
                    // console.log('영상시청 완료!')
                }
                if(response.question_count<1 || IS_PASS_TIME_ID_ARR.indexOf(VOD_ID) != -1 ){//vod에 연결된 문제가 없거나, 117 113vod_id 일때
                    document.querySelector('#examBtn').style.display = 'none';//문제풀이 버튼 숨김
                }
                // getSponsorList();
            // }
            settingVideo();
        }).fail(function (response) {
            if (response.status === 412) {
                alert(ALERT_TEXT_OBJ.vod[0]);
                location.replace('./list.html');
            } else if (response.status === 401) {
                alert(ALERT_TEXT_OBJ.basic[4]);
                location.replace('./index.html')
            } else {
                alert(ALERT_TEXT_OBJ.basic[2] + response.status);
            }
        });
    }

    function settingVideo() {
        videojs('lecture_movie', {
            'width': '960'
        }).ready(function () {
            myPlayer = this;
            myPlayer.on("loadedmetadata", function (e) {
                // currentTime = 40 // 초단위
                // maxTime = 40
                // console.log('test')
                // console.log(e)
                myPlayer.currentTime(currentTime);//마지막으로 시청한 시간
                var duration = Math.floor(myPlayer.duration())// 영상전체시간
                // console.log(duration,myPlayer.duration())
                var min = Math.floor(duration / 60);
                var sec = duration - (60 * min)
                // document.querySelector('.js-prof_info span[data-type="duration_time"]').innerHTML = min + '분 ' + sec + '초';
            });
            // myPlayer.currentTime(10);
            //Set initial time to 0

            //This example allows users to seek backwards but not forwards.
            //To disable all seeking replace the if statements from the next
            //two functions with myPlayer.currentTime(currentTime);

            /*영상 컨트롤러바를 이동중일때*/
            // 여기서 영상을 본 최대시간이 내가 선택한 시간보다 커야 이동할 수 있다
            //(따라서 최대시간보다 큰 시간대를 선택해서 옮기면 아래의 코드가 실행되지 않는다
            myPlayer.on("seeking", function (event) {
                if (maxTime < Math.floor(myPlayer.currentTime()) && !video_end) {//maxtime : 내가 본 최대 영상 시간
                    console.log('***1***',maxTime,myPlayer.currentTime());// maxTime보다 크게 선택하면 나온ㄷㅏ
                    clearInterval(CHANGE_TIMER);
                    myPlayer.paused()
                    myPlayer.currentTime(maxTime - 1); // -1을 하지 않으면 마지막으로 본 영상의 시점보다 1초 앞으로 진행된다
                    // alert('시청하신 시간보다 앞으로가기는 하실 수 없습니다.');
                    myPlayer.play();
                    updateCurrentTime()
                    // console.log('seeked maxTime :: ',currentTime,maxTime,myPlayer.currentTime())
                }
            });

            /*영상 컨트롤러바를 이동이 완료된 시점*/
            myPlayer.on("seeked", function (event) {
                // console.log("컨트롤러바 이동이 완료된 시점");
                // if(!video_end){
                // console.log(maxTime > myPlayer.currentTime(),' || ',maxTime < myPlayer.currentTime(),' || ',currentTime < myPlayer.currentTime())
                if (maxTime < Math.floor(myPlayer.currentTime()) && !video_end) {// 여기서 영상을 본 최대시간이 내가 선택한 시간보다 커야 이동할 수 있다
                                                                                //(따라서 최대시간보다 큰 시간대를 선택해서 옮기면 아래의 코드가 실행되지 않는다                                                                             
                    console.log('***2***',maxTime,myPlayer.currentTime())
                    clearInterval(CHANGE_TIMER);
                    myPlayer.paused()
                    myPlayer.currentTime(maxTime - 1);
                    // alert('시청하신 시간보다 앞으로가기는 하실 수 없습니다.');
                    myPlayer.play();
                    updateCurrentTime()
                    // console.log('seeked maxTime :: ',currentTime,maxTime,myPlayer.currentTime())
                }
                // }
            });

            /*영상이 끝났을때*/
            myPlayer.on("ended", function (event) {
                console.log('video end!')
                video_end = true;
                currentTime = Math.floor(myPlayer.currentTime());
                maxTime = Math.floor(currentTime)
                console.log("post_watch_time-maxTime:",post_watch_time-maxTime);// 영상이 완료되면  값은 0 
                if(Math.abs(post_watch_time-maxTime)>10){//Math.abs(): 절대값으로 표현 ,
                    alert('시청한 시간보다 앞으로가기는 하실 수 없습니다.');
                    myPlayer.currentTime(post_watch_time);
                    maxTime = post_watch_time
                    is_post_watch_time = true;
                    return false;
                }
                updateWatchTime();
                is_post_watch_time = false
            });

            myPlayer.on('error', function (event) {
                console.log('비디오 송출 에러!!', event);
                if (USED_NUM_ARR.length >= 3) {//서버갯수가 넘어가면
                    myPlayer.pause();
                    alert('사용자 증가로 접속이 원활하지 않습니다.\n잠시 후 다시 시도해주세요. 감사합니다.');
                    location.replace('./list.html')
                    console.log(event.message);
                    return false;
                } else {
                    checkAnotherUrl()
                }

            });

            // console.log("is_first_play1:",is_first_play);
            myPlayer.on('play',function(e){
                if(is_first_play === true){//첫번째 재생 시점 true
                    is_first_play = false;
                    myPlayer.currentTime(currentTime);
                }
                // console.log("is_first_play2:",is_first_play);
            })


            /*
                서버에 전송 여부 true, false
                영상이 이미 다 완료된 경우 false로 서버에 전송 X 
                영상 시청이 완료되지 않은 경우 true 유지
            */
            var update_time_event = setInterval(function () {
                if (is_post_watch_time === false) {
                    // console.log("is_post_watch_time2:",is_post_watch_time);
                    clearInterval(update_time_event);
                    return false;
                }
                if (!myPlayer.paused()) {//재생중이면
                    
                    updateWatchTime();
                }
            }, 10000);

            // 비디오에 컨트롤 기능이 바뀌면 false로( 영상을 미리 당겨 보는 것 방지)
            $('video').attrchange({//attrchange 함수를 사용하면 -> video태그에중 controls에 대한 변경사항(임의로 바꾸기 등)이 생기면 false유지하기
                trackValues: true,
                callback: function (e) {
                    var _this = $(this);
                    if (_this.attr('controls')) {
                        _this.attr('controls', false);
                    }
                    return false;
                }
            });
        });
        videojs.options.autoplay = true
        updateCurrentTime();//현재 vod재생 시간
        // 출처 - https://blog.naver.com/nanan75/221657098392
        // 앞으로감기시, 최대로 본곳까지는 앞으로 감기 가능하도록 maxTime으로 변경
    }

    function updateCurrentTime(){
        CHANGE_TIMER = setInterval(function () {
            if (!myPlayer.paused()) {
                currentTime = Math.floor(myPlayer.currentTime());
                if (currentTime > maxTime) {
                    maxTime = Math.floor(currentTime)
                }
                // console.log(currentTime,maxTime)
            }
        }, 1000);
    }

    //body태그 안에 oncontextmenu="return false; 이 옵션을 바꾸면 영상이나 정보들이 유포될 수 있으므로
    //바꾼 경우에 다시 false로 돌리기
    //( 우측 마우스 클릭 안됨 )
    $('body').attrchange({
        trackValues: true,
        callback: function (e) {
            var body_el = document.body;
            if (body_el.getAttribute('oncontextmenu') == undefined || body_el.getAttribute('oncontextmenu') == '' || body_el.getAttribute('oncontextmenu') == null) {
                body_el.setAttribute('oncontextmenu', 'return false;');
            }
            return false
        }
    });

    //문제풀이버튼 활성화/비활성화
    function activeExam() {
        if (exam_end === false) {
            var btn_el = document.getElementById('examBtn');
            if (!video_end) {
                btn_el.classList.remove('active');//문제풀이 버튼 비활성화
            } else {
                btn_el.classList.add('active');//문제풀이 버튼 활성화
            }
        }
    }

    function clickLectureBtn() {
        var this_index = $(this).index(); // 0:강의리스트, 1:문제풀이
        myPlayer.pause();
        if (this_index === 0) {
            if (confirm(ALERT_TEXT_OBJ.vod[5])) {
                updateWatchTime();
                setTimeout(function () {
                    location.replace("./list.html")
                }, 500)
                return false
            }
            myPlayer.play();
        } else if (this_index === 1) {
            if (!video_end) {
                alert(ALERT_TEXT_OBJ.vod[4])
            }
            // else if(exam_end === true){
            //     alert(ALERT_TEXT_OBJ.vod[6]);
            // } 
            else {
                location.replace('./exam.html?id=' + VOD_ID)
            }
            myPlayer.play();
        }
    }

    //마지막 보류 수단, 
    //영상 컨트롤러 기능을 막았음에도 불구하고 작동이 된다면 다시 막기 기능이 담겨진 함수
    function updateWatchTime() {
        if (post_watch_time <= maxTime) {//서버에 전송된 시간이 내가 본 최대 시간보다 작거나 같으면
            NOW_DATE = new Date();
            console.log(post_watch_time-maxTime);//영상이 완료되면 0임
            if(Math.abs(post_watch_time-maxTime)>10){// 오류사항으로 서버에 보낸시간과 내가 마지막으로 본 시간이 다를경우에
                alert('시청한 시간보다 앞으로가기는 하실 수 없습니다.');
                myPlayer.currentTime(post_watch_time);//현재 영상 위치 반환
                maxTime = post_watch_time;//저장된 시간을 maxTime에 저장
                is_post_watch_time = true;//다시 서버에 저장하기
                return false;
            }
            post_watch_time = maxTime
            LAST_POST_TIME = post_watch_time;//마지막으로 서버에 보낸 영상 시간 
            var data_obj = {
                'watch_time': maxTime
            }
            // console.log(data_obj.watch_time)
            var settings = {
                "url": "/api/v1/vod/" + VOD_ID + "/update_watch_time",
                "method": "POST",
                "timeout": 0,
                "data": data_obj
            };
            console.log("data_obj",data_obj)
            $.ajax(settings).done(function (response) {
                console.log(response);
                if (response.is_finished === 1) {//영상 끝까지 시청 여부(1= 시청 완료, 0 미완료)
                    if(IS_PASS_TIME_ID_ARR.indexOf(VOD_ID) != -1){//117 113을 시청 했을경우 데이터 넘기기
                        var data_question_obj = {
                            'answers[0]': '0',
                            'vod_id' : IS_PASS_TIME_ID_ARR[IS_PASS_TIME_ID_ARR.indexOf(VOD_ID)] //id가 117 113
                        }
                        var settings = {
                          "url": "/api/v1/question/store",
                          "method": "POST",
                          "timeout": 0,
                          "data": data_question_obj
                        };
                        
                        $.ajax(settings).done(function (response) {
                          console.log(response);
                          console.log("data:",data);
                        }).fail(function (response) {
                            alert(ALERT_TEXT_OBJ.basic[2] + response.status);//서버문제
                            location.reload();//문서 재전송
                        });
                    }
                    activeExam();//117 113이 아닌 경우 문제풀이버튼 함수 호출
                }
            }).fail(function (response) {
                alert(ALERT_TEXT_OBJ.basic[2] + response.status);
                location.reload();
            });
        }
    }

    /*
    
    USED_NUM_ARR : 이전에 사용했던 서버 번호
    load_url_num : 새롭게 매치한 서버 번호

    아래의 코드는 이전에 사용했던 서버 번호를 사용하지 않기 위해 ( 에러가 발생했을 때 수행되기 위해 ) 
    */
    function checkAnotherUrl() {
        console.log("load_url_num: ",load_url_num);
        console.log("USED_NUM_ARR: ",USED_NUM_ARR);
        if(IS_LOAD_VOD_ERROR === true){//초기값 false
            return false;//error!
        }
        do {
            if (USED_NUM_ARR.length >= 3) {//서버갯수가 3보다 크면
                IS_LOAD_VOD_ERROR = true;//error!
                break
            }
            load_url_num = (Math.floor((Math.random() * 3) + 0));//3개중 랜덤하게 
        } while (USED_NUM_ARR.indexOf(load_url_num) !== -1);//일치하는 문자열이 없으면 -1반환--> USED_NUM_ARR와 load_url_num 일치할 경우 다시 배정
        USED_NUM_ARR.push(load_url_num);
        // console.log(load_url_num, USED_NUM_ARR);
        // console.log('다음에 불러올 링크 >> ', MOVIE_URL_ARR[load_url_num]);
        // console.log(MOVIE_URL_ARR[load_url_num] + THIS_VOD_URL)
        // myPlayer.dispose();
        myPlayer.src({
            src: MOVIE_URL_ARR[load_url_num] + THIS_VOD_URL,
            type: 'video/mp4'
        });
        myPlayer.play();
        settingVideo();
    }

    //초기화 이후에도 계속 사용해야 하는 변수들만 객체에 담아 전달
    return {
        init: init
    };
})();//모듈화
(function () {
    MovieModule.init();
})();