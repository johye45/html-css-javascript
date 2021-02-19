var ListModule = (function () {
    var $root
    var vod_type_arr = []
    var main_category_id = ''
    var sub_category_id = ''
    // var my_lecture_id = '';
    var required_lecture_data = {
        'id': '',
        'is_finished': '',
        'is_exam_passed': '',
        'required_type': '',
        'order': ''
    }
    var duration_lecture_data = {
        'id': '',
        'is_finished': '',
        'is_exam_passed': '',
        'required_type': '',
        'order': ''
    };
    var load_url_num;
    var MOVIE_URL_ARR = [
        'http://14.49.38.84:80',
        'http://14.49.36.60:80',
        'http://14.49.37.111:80'
    ]; //vod file port
    var USED_NUM_ARR = []
    var is_sub_category = [];
    var is_speacial_category = [11]; //우수보철발표 하드코딩
    var SPEACIAL_USER_LV = 40
    var USER_INFO_OBJ = {//접속한 사용자 level
        'admin_level': null
    }
    var load_url;
    function init() {
        $root = $('.wrap');
        load_url_num = (Math.floor((Math.random() * 3) + 0)) //해당 번호로 갖고온 url사용하기 
        load_url = MOVIE_URL_ARR[load_url_num] //랜덤한 MOVIE_URL_ARR 배정받기
        USED_NUM_ARR.push(load_url_num);
        

        /*getItem으로 받아오는 이유 : 영상 시청후 해당 카테고리로 다시 돌아오기 위함*/
        var session_data = sessionStorage.getItem('nav_check_data'); //setItem 키값으로 보관된 값을 받아온다
        console.log("session_data: ", session_data);//main_category_id, sub_category_id값 넘겨 받음 ->String형태
        if(session_data != null){
            session_data = JSON.parse(session_data);//JSON.parse :  String 객체를 json객체로 변환 <->JSON.stringify() JSON객체를 String으로 변환
            main_category_id = session_data.main_category_id
            sub_category_id = session_data.sub_category_id
        }
        console.log("session_data:",session_data);//JSON형태

        eventBind();
        getMyInfo();
        getEposterList();
        getEboothList();
        
        
    }

    function eventBind() {
        $root.on('click', '.js-video', locationCheckLecture)
        $root.on('click', '.js-nav', changeTab)// 상단 탭 
        $root.on('click', '.js-eposter_cnt', showEposter)//eposter 하나를 선택했을 땨 -> 상세보기로 이동
        $root.on('click', '.js-ebooth_cnt', showEbooth)
        $root.on('click', '.js-eposter_pop_list li', showEposter) //상세보기에서 리스트영역에 있는 eposter를 선택했을 때
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
            console.log(response);//회원정보
            var server_time = response.server_time
            if (response.app_id != 4){//치과보철 app_id=4이다
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
            USER_INFO_OBJ.admin_level = response.admin_level//접속한 사용자 level
            var user_cnt_el = document.querySelector('.js-user_count');
            if (user_cnt_el != null && user_cnt_el != '' && user_cnt_el != undefined) {
                var user_count_number = Number(response.active_user_count);
                user_count_number = (user_count_number > 3000) ? 3000 : (user_count_number < 1) ? 1 : user_count_number
                user_cnt_el.innerText = user_count_number;
            }
            getCategoryList();//처음 카테고리를 접속 시도 했을 때 한번 호출!
        }).fail(function (response) {
            if (response.status === 401) {
                alert(ALERT_TEXT_OBJ.basic[4]);
                location.replace('./index.html')
            } else {
                alert(ALERT_TEXT_OBJ.basic[2] + response.status);
            }
        });
    }


    function getCategoryList() {

        /* 학술대회 개회 인사 영상 */
        var ab_html = ''
        ab_html += '<div class="list_img">'
        ab_html += '<a href="'+load_url+'/data/uploaded/public_uploaded/pdf_abstract.pdf?v=201127" target="_blank">'
        ab_html += '    <img src="'+load_url+'/data/uploaded/public_uploaded/img_abstract.png"> '
        ab_html += '</a>'
        ab_html += '</div>'
        ab_html += '<div class="list_content">'
        ab_html += '<a href="'+load_url+'/data/uploaded/public_uploaded/pdf_abstract.pdf?v=201127" target="_blank">'
        ab_html += '    <div class="title" style="border-bottom: 0;">'
        ab_html += '        <h1>제 84회 대한치과보철학회 학술대회 초록집 다운로드</h1>'
        ab_html += '    </div>'
        ab_html += '</a>'
        ab_html += '</div>'
        document.querySelector('.js-abstract_list').innerHTML = ab_html

        var data_obj = {
            'event_id': 4
        }
        var settings = {
            "url": "/api/v1/vod_category",
            "method": "GET",
            "timeout": 0,
            "data": data_obj
        };
     
        /*학술대회 개회 인사 영상, 학술대회 강의, 논문 발표,20-21 우수보철강의 --> cms에 등록된 정보 */
        $.ajax(settings).done(function (response) {
            console.log("response:",response)//학술대회 개회 인사 영상, 학술대회 강의, 논문 발표,20-21 우수보철강의 
            var html = ''
            $.each(response, function (key, value) {
                console.log("key: ", key);//각 키에 해당하는 value매칭
                console.log("value: ", value);//response배열로 받은 각각의 카테고리탭 정보
                var sub_html = ''//main_category에 소속된 sub_category 
                if (value.sub_categories.length > 0) {//main에 소속된 sub가 있는 것만 
                    is_sub_category.push(value.id)//각 서브 카테고리에 영상 리스트 id값 담기
                    sub_html += '<div class="sub_nav_wrap">'
                    $.each(value.sub_categories, function (sub_key, sub_val) {
                        // console.log("sub_val: ",sub_val);//main에 해당된 sub
                        sub_html += '<span class="js-nav sub_nav" data-id="' + sub_val.id + '">' + sub_val.name + '</span>'//data- 속성을 사용하면 데이터 정보를 담을 수 있다
                    })
                    sub_html += '</div>'
                }
                html += '<div><span class="nav_cnt js-nav" data-id="' + value.id + '" data-key="'+key+'">' + value.name + '</span>' + sub_html + '</div>'
            });
            
            html += '<span class="js-nav" data-id="eposter" data-type="3">E-POSTER</span>'
            html += '<span class="js-nav" data-id="ebooth" data-type="4">E-BOOTH</span>'
            
            document.querySelector('.js-nav_wrap').innerHTML = html
            var nav_els = document.querySelectorAll('.js-nav');
            // nav_els[0].classList.add('active')
            // if(main_category_id == ''){
                //     if(is_speacial_category.indexOf(response[0].id) != -1 && SPEACIAL_USER_LV != USER_INFO_OBJ.admin_level){
                    
                    //     }
                    // }
            console.log("main_category_id: ",main_category_id);
            if(main_category_id == 'eposter' || main_category_id == 'ebooth'){
                document.querySelector('.js-nav[data-id="'+main_category_id+'"]').classList.add('active');//E-POSTER, E-BOOTH에 클래스 active 추가 

                //js-video_list를 감싸고 있는 parentNode , list.html(<section class="list_wrap js-section" data-type="0"> 해당)
                console.log("js-video_list의 parentNode: ",document.querySelector('.js-video_list').parentNode);

                //<section>태그 display = none (eposet, ebooth에는 영상 리스트를 지우기 위해서)
                document.querySelector('.js-video_list').parentNode.style.display = 'none';
                //display속성이 자동으로 none되어있기 때문에 속성을 지우기 위해서! --> eposter와 ebooth에 해당하는 값을 나타내기 위해서
                document.querySelector('.'+main_category_id+'_wrap').style.display = ''
            }else{//eposet와 ebooth가 아닌 경우
                var nav_check_el = document.querySelector('.js-nav[data-id="'+main_category_id+'"]')//main_category 
         
                //처음 접속시에는 main_category_id값이 없으므로 
                if (main_category_id == '' || nav_check_el == null || nav_check_el == undefined || nav_check_el == '') {
                    for (var i = 0; i < response.length; i++) {//response :학술개회 인사영상, 학술대회 강의, 논문 발표, 20-21우수보철강의 
                        var el = response[i]

                        /*
                        is_speacial_category : 우수보철강의 id값 11
                        모든 id값을 저장하기 위해서 아래으 조건문 실행해야 한다
                        선택된 카테고리가 우수보철강의가 아닌경우 or 선택된 강의가 우수보철강의인 경우에는 level이 40인 접속자만 접근
                        */
                        if (is_speacial_category.indexOf(el.id) == -1 || (is_speacial_category.indexOf(el.id) != -1 && SPEACIAL_USER_LV == USER_INFO_OBJ.admin_level)) {
                            main_category_id = el.id//선택된 카테고리의 id를 저장
                            nav_els[i].classList.add('active')//main_category에 active클래스 추가

                            //attr : 속성값 변경 attr('바꿀 속성','변경할 속성값')
                            //eq(0) : js-section중에서 첫번째 요소 
                            //data-color로 main_category 제목 색 변경 - css
                            $('.js-section').eq(0).attr('data-color',i)//js-section video리스트를 감싸고 있는 js-section
                            break;
                        }
                    }
                }else{//두번째부터 접속 시도시 기존의 main_category_id값 유지하므로 영상 시청후 뒤로가기해도 해당 main_category_id를 유지한다
                    if(main_category_id == 11){//우수보철강의인 경우에만
                        document.querySelector('.js-abstract_list').style.display = 'none' //초록집 다운로드 list 가리기
                    }
                    
                    nav_check_el.classList.add('active');//main category 선택시 active클래스 추가
                    $('.js-section').eq(0).attr('data-color',$('.js-nav[data-id="'+main_category_id+'"]').index('.js-nav'))
                    if(sub_category_id != ''){//sub category값이 있으면 
                        document.querySelector('.js-nav[data-id="'+sub_category_id+'"]').classList.add('sub_nav_active')//subcategory값 
                    }
                }
                getVodList();//카테고리 지정이 다 완료되면 리스트 호출
            }
            
            // main_category_id = (main_category_id == '') ? response[0].id : main_category_id
            
        }).fail(function (response) {
            if (response.status === 401) {
                alert(ALERT_TEXT_OBJ.basic[4]);
                location.replace('./index.html')
            } else if (response.status === 411) {
                alert(ALERT_TEXT_OBJ.basic[5]);
                location.replace('./index.html')
            } else {
                alert(ALERT_TEXT_OBJ.basic[2] + response.status);
            }
        });
    }

    function getVodList() {
        MainModule.setLoadHtml();//리스트 div틀 가져오기
        var data_obj = {
            'main_category_id': main_category_id,
            'sub_category_id': sub_category_id
        }
        var settings = {
            "url": "/api/v1/vod",
            "method": "GET",
            "timeout": 0,
            "data": data_obj
        };

        $.ajax(settings).done(function (response) {
            var html = '';
            vod_type_arr = []
            //영상의 순서를 정하기 위해 -->cms의 공지순서대로!
            response.sort(function (a, b) {
                if (a.order < b.order) return -1;
                if (a.order > b.order) return 1;
                if (a.id < b.id) return -1;
                if (a.id > b.id) return 1;
                
                return 0;
            });
            console.log(response);//정렬된 영상 리스트 순서
            
            $.each(response, function (key, value) {
                // null : 시작도안함, 0 : 진행중, 1 : 시청완료
                // var is_finished = (value.is_finished === 1 && value.is_exam_passed === 1) ? 'is_complete' : (value.is_finished === 0 || value.is_finished === 1 || value.required_type === 1) ? '' : 'is_lock'
                if(value.show_type==1){//show_type: 영상 리스트 노출 여부 -> 노출됨: 1
                    var is_finished = ''
                    if(value.is_finished === 1){//영상 시청 여부 -> 시청 완료 : 1
                        if(value.question_count < 1){//문제수가 없으면(문제가 없는 영상이 있음)
                            is_finished = 'is_complete'
                        }else if(value.is_exam_passed == 1){//문제를 통과했다면(영상 시청후 문제를 풀어야 통과되기 때문에 문제 여부는 묻지 않음)
                            is_finished = 'is_complete'
                        }
                    }
                    // var is_finished = (value.is_finished === 1) ? 'is_complete' : (value.is_finished === 0) ? '' : 'is_lock'
                    
                    //등록된 이미지가 없으면 기본 로고 이미지 노출시키고, 아니면 배정된 url과 이미지명에 해당하는 이미지 노출시키기
                    var is_photo = (value.photo_1 == '') ? './static/images/logo.png' : load_url + value.photo_1
                    //console.log("load_url", load_url);
                    //console.log("value.photo_1", value.photo_1);
                    //console.log("value.id: ", value.id);// 영상 리스트 id, main_category_id와 다름
                    //console.log("value.required_type: ", value.required_type);
                    html += '<div class="dis-table list_cnt js-video" data-id="' + value.id + '" data-finish="' + is_finished + '">'//영상 id값, 영상 완료 여부 넘겨받기, 
                    html += '    <div class="list_img">'
                    html += '        <img src="' + is_photo + '" alt="' + value.title + '">'//alt : 이미지에 대한 설명(코멘트)
                    html += '    </div>'
                    html += '    <div class="list_content">'
                    html += '        <div class="title">' 
                            // file_2이미지를 추가하면(cms에서) 초록보기가 뜬다
                    html += (value.file_2 != '') ? '<a class="list_ab_btn js-abstract" href="#" onclick="window.open(\''+load_url+value.file_2+'\', \'_blank\', \'width=600 height=600\')"">초록보기</a>' : ''
                    html += (value.title_en != '') ? '<h1>'+value.title_en+'</h1>' : ''//cms의 Title(Eng)
                    html += (value.summary != '') ? '<span>'+value.summary+'</span>' : ''// 영상 시간 (cms의 국문 공지 요약 부분)
                    html += '<h2>'+value.title+'</h2>'//cms 국문 공지 명 부분
                    html += '    </div>'
                    html += '        <div class="sub_title">'
                                                                        //개행제거 |(or) 엔터 줄바꿈 제거,  <br>태그로 바꾸기 --> textarea를 사용하다 보면 \n으로 넘어오는 경우가 있기 때문에!
                    html += '            <span>' + value.contents.replace(/(\n|\r\n)/g, '<br>') + '</span>'//cms의 국문 공지 내용
                    html += '        </div>'
                    html += '    </div>'
                    html += '</div>'
                    //console.log(" value.order: ",  value.order);
                    var push_vod_obj = {
                        'id': value.id,//각 리스트 id
                        'is_finished': value.is_finished,//영상 시청 여부
                        'is_exam_passed': value.is_exam_passed,// 문제 통과 여부
                        'required_type': value.required_type,//예전에는 필수영상을 시청해야 나머지 영상 시청이 가능했지만 치과보철에서는 그런 구분이 없다
                        'order': value.order//리스트 순서
                    }
                    vod_type_arr.push(push_vod_obj)//영상 리스트 저장하기
                    // if (value.is_finished === 0) { //진행중 강의
                    //     my_lecture_id = value.id
                    // }
                }
                
            })
            document.querySelector('.js-video_list').innerHTML = html;//리스트 추가


            /*치과보철에서 사용 안함
            ------------------------------------------------------------------------------------------------------------------------------*/
            // required_lecture_data = searchObject(1, 'required_type', vod_type_arr);
            //vod_type_arr중 required_type이 1인 경우만 반환됨(필수강의 여부와 필수강의 수료완료 체크하기 위해선)
            if (searchObject(1, 'required_type', vod_type_arr) != undefined) {//undefined가 아니면(required_type이 1인경우만 )
                required_lecture_data = searchObject(1, 'required_type', vod_type_arr);//required_type이 1인 경우 반환해서 required_lecture_data에 담기 
            }

            //문제 통과가 0인 경우 찾기 (문제풀이까지 완료했는지 판단하기 위해서)
            if (searchObject(0, 'is_exam_passed', vod_type_arr) != undefined) {//is_exam_passed가 0인경우만
                duration_lecture_data = searchObject(0, 'is_exam_passed', vod_type_arr);
            }
            
            var is_lecture_complete_data;
            for (var i = 0; i < vod_type_arr.length; i++) {
                if (vod_type_arr[i]['required_type'] !== 1 && vod_type_arr[i]['is_exam_passed'] != 1) {//필수강의가 아니고, 문제풀이까지 완료하지 않은 영상!
                    is_lecture_complete_data = vod_type_arr[i];
                }
            }
            // if(duration_lecture_data.id ==='' && required_lecture_data.is_exam_passed != null && is_lecture_complete_data!=undefined){ //이건 첫접속(필수강의 자동 on이니 활성화) 일 때 alert창 안뜨는 조건문 있음
            //     alert('이수하실 강의를 선택해 주세요')
            // }

            //선택된 강의가 없을때
            // if (duration_lecture_data.id === '' && is_lecture_complete_data != undefined) {
            //     alert('수료하실 강의를 선택해 주세요')
            // }
            /*------------------------------------------------------------------------------------------------------------------------------*/
        }).fail(function (response) {
            if (response.status === 401) {
                alert(ALERT_TEXT_OBJ.basic[4]);
                location.replace('./index.html')
            } else if (response.status === 411) {
                alert(ALERT_TEXT_OBJ.basic[5]);
                location.replace('./index.html')
            } else {
                alert(ALERT_TEXT_OBJ.basic[2] + response.status);
            }
        });
    }

    //배열에서 해당하는 데이터가 있는지 검색하는 함수
    function searchObject(idKey, key, myArray) {
        for (var i = 0; i < myArray.length; i++) {
            if (myArray[i][key] === idKey) {
                return myArray[i];
            }
        }
    }

    //vod 상세정보 가져오기
    function locationCheckLecture(e) {
        console.log("this: ", this);//vedio리스트 선택시
        if (!e.target.classList.contains('js-abstract')) {// js-abstract에 클래스가 존재하는지 확인(file2이미지 확인 하기)-->file2이미지가 없으면
            var this_id = Number(this.getAttribute('data-id'));//리스트 id
            console.log(this_id);
            var select_lecture_data = searchObject(this_id, 'id', vod_type_arr);
            var settings = {
                "url": "/api/v1/vod/" + select_lecture_data.id,
                "method": "GET",
                "timeout": 0,
            };
        
            //성공 : 상세페이지 이동
            $.ajax(settings).done(function (response) {
                location.href = './movie.html?id=' + select_lecture_data.id
            }).fail(function (response) {
                if (response.status === 412) {
                    alert(ALERT_TEXT_OBJ.vod[0]);
                    location.reload();
                } else {
                    alert(ALERT_TEXT_OBJ.basic[2] + response.status);
                }
            });
        }
        
        // if(my_lecture_id === this_id){
        //     location.href="./movie.html?id="+this_id
        // }else{

        // }
    }

  

    function changeTab(e) {
        var _this = $(this)
        //console.log("changeTab this:", this);
        var this_id = this.getAttribute('data-id');//해당되는 탭 id가져오기
        var section_els = document.querySelectorAll('.js-section');//모든 탭 클래스 가져오기
        var this_key = this.getAttribute('data-key');//main_category 정보 key값
        if (e.target.classList.contains('sub_nav')) { // 서브카테고리가 있으면
            sub_category_id = this_id
            //closest() : js-nav_wrap의 가장 가까운 부모 찾기 
            //(선택요소).find(찾을 조건)
            /*
                sub active와 sub_nav_active 구분 이유: 어떤 subcategory를 클릭했는지 구별하기 위해서 
            */
            _this.closest('.js-nav_wrap').find('.sub_active').removeClass('sub_active');//sub_active가 있다면 지우고, 없으면 무시
            _this.closest('.js-nav_wrap').find('.sub_nav_active').removeClass('sub_nav_active');//sub_nav_active가 있다면 지우고, 없으면 무시
            _this.addClass('sub_nav_active');//선택된 subcategory값에 class추가 --> main.css에서 스타일 적용
            if(this_id == 11){// 선택된 탭이 우수보철 강의 이면
                document.querySelector('.js-abstract_list').style.display = 'none' //(초록집 다운로드 가리기)
            }else{
                document.querySelector('.js-abstract_list').style.display = ''
            }
            showSection(0);//영상 리스트가 나오는 탭 
            getVodList();
        } else { //메인카테고리
            main_category_id = this_id;
            sub_category_id = '';
            var this_type = this.getAttribute('data-type');
            if (this_type == 3) {//E-poster
                _this.closest('.js-nav_wrap').find('.sub_nav_active').removeClass('sub_nav_active');
                _this.closest('.js-nav_wrap').find('.sub_active').removeClass('sub_active');
                showSection(1)
            } else if (this_type == 4) {//E-booth
                _this.closest('.js-nav_wrap').find('.sub_nav_active').removeClass('sub_nav_active');
                _this.closest('.js-nav_wrap').find('.sub_active').removeClass('sub_active');
                showSection(2)
            } else {//maincategory에서 eposter와 ebooth가 아닌 다른 탭을 선택했을 때

                //선택된 main_category_id 와 is_special_category(우수보철 강의)가 같고 접속한 사용자 level이 40이 아니면
                if (is_speacial_category.indexOf(Number(main_category_id)) != -1 && SPEACIAL_USER_LV != USER_INFO_OBJ.admin_level) {
                    $.alert({
                        title: '',
                        content: '2020-21 우수보철치과의사 과정 등록자만 수강하실 수 있습니다.',
                        buttons: {
                            확인: function () {
                            },
                            '2020-21우수보철치과의사 과정 안내': function(){
                                window.open('' + load_url + '/data/uploaded/public_uploaded/2020-21_우수보철치과의사_모집광고.jpg', '_blank', 'width=600 height=600')
                            }
                        }
                    });
                    // alert('2020-21 우수보철치과의사 과정 등록자만 수강하실 수 있습니다.');
                    return false;
                }
                _this.closest('.js-nav_wrap').find('.sub_active').removeClass('sub_active');//논문발표 하위카테고리 보이도록
                if (is_sub_category.indexOf(Number(main_category_id)) == -1) {
                    _this.closest('.js-nav_wrap').find('.sub_nav_active').removeClass('sub_nav_active');
                    if(this_id == 11){
                        document.querySelector('.js-abstract_list').style.display = 'none'
                     }else{
                         document.querySelector('.js-abstract_list').style.display = ''
                     }
                    section_els[0].setAttribute('data-color',this_key)
                    showSection(0)
                    getVodList()
                } else {
                    // _this.closest('.js-nav_wrap').find('.sub_nav_active').removeClass('sub_nav_active');
                    section_els[0].setAttribute('data-color',this_key)
                    _this.addClass('sub_active');
                }
            }
            /*
            다른 탭을 눌렀을 때(영상 리스트가 있는 eposter, ebooth가 아닌 or 하위카테고리가 없는)
            클래스명을 지웠다가 추가했다를 반복하는 작업 : 색으로 구분하기 위함과 어떤 탭을 눌렀는지 확인 하기 위해서
            */  
            _this.closest('.js-nav_wrap').find('.active').removeClass('active');
            _this.addClass('active');
        }
        setSessionStorage();
    }

    
    /*
    sessionStorage : 브라우저 세션 기간 동안 만 사용할 수 있으며 탭이나 창을 닫을 때 삭제함
                     새로고침을 해도 유지됨,
                     변경된 사항은 현재 페이지에서 닫힐 때까지 저장되어 사용할 수 있다
                     탭이 닫히면 데이터가 삭제 된다
    */
    // 영상 시청 후 해당 카테고리로 돌아가기 위해 sessionStorage로 저장한다
    function setSessionStorage(){
        var data = {
            'main_category_id' : main_category_id,
            'sub_category_id' : sub_category_id
        }
        sessionStorage.setItem('nav_check_data',JSON.stringify(data));
    }


    //영상리스트가 노출되어야 하는 부분인지 아닌지와 E-Poseter와 E-Booth영역 가려내기위한 함수
    function showSection(num) {//num==1 > E-Poseter, num==2 > E-Booth, num==0 > 영상 리스트가 나오는 탭
        var section_els = document.querySelectorAll('.js-section');
        // console.log("section_els:", section_els.length);//js-section수 만큼 ==3
        // console.log("num: ",num);
        for (var i = 0; i < section_els.length; i++) {
            if (i === num) {
                section_els[i].style.display = ''//강의리스트 display=none 기능 지우기 
            } else {
                section_els[i].style.display = 'none'//강의리스트 display=none
            }
        }
    }
    
    //eposter는 cms의 event의 모듈에서 가져오기 (Add Content에서 추가할 수 있음)
    function getEposterList() {
        
        var html = '';
        var eposter_pop_html = ''
        var eposter_list_html = ''

        var settings = {
            "url": "/api/v1/eposter?module_id=6",//cms의 모듈 : eposter가 하나이므로 id값 지정
            "method": "GET",
            "timeout": 0,
        };

        $.ajax(settings).done(function (response) {
            console.log("eposter response:"  , response);
            for (var i = 0; i < response.length; i++) {
                var element = response[i];
                // var content_el = response[i].documents[0] //무조건 1개만 설정되서 0으로 고정
                /*---------------------------------------------치과보철에는 사용이 안된 기능 : 좋아요 누르는 기능*/
                var is_checked = (element.is_liked === 1) ? 'checked' : ''
                if (element.is_liked === 1) {
                    my_eposter_like = my_eposter_like + 1
                }
                /*---------------------------------------------*/
                // span 및 input html 추가 X :: 추가시 showEposterPopup() 수정필요
                //location : cms의 국문 장소, location_en  : Room(Eng)

                // location_en의 값이 있다면 /추가해서 location_en 적기, 아니면 공백
                var is_location = (element.location_en != '' && element.location_en != null && element.location_en != undefined) ? '/' + element.location_en : ''
                html += '<div class="eposter_cnt js-eposter_cnt" data-id="' + element.id + '">'//eposter id
                html += '<div class="dis-table eposter_room">'
                html += '    <div class="eposter_room_info">' + element.location + '</div>'//P-01 ..
                html += '</div>'
                html += '<div class="eposter_title">' + element.desc.replace(/(\n|\r\n)/g, '<br>').toUpperCase() + '</div>'//국문 세부 사항
                html += '<div class="eposter_name">' + element.name + is_location + '</div>'
                html += '<div class="eposter_email">' + element.name_en + '</div>'
                html += '</div>'

                //epost popup list html
                //epost 누르면 나오는 이미지 
                eposter_list_html += '<li data-id="' + element.id + '">'
                eposter_list_html += '    <div class="mini_img">'
                eposter_list_html += '        <img src="' + load_url + element.photo_1_thumb + '">'
                eposter_list_html += '    </div>'
                eposter_list_html += '    <div class="popup_list_title">'//list 
                eposter_list_html += '        <h6>' + element.location + '</h6>'
                eposter_list_html += '        <span>' + element.name + is_location + '</span>'
                eposter_list_html += '    </div>'
                eposter_list_html += '</li>'
            }
            // .eposter_list_title_wrap>div:last-child::before{content: 'TOTAL : '; } ->style로 TOTAL 
            document.querySelector('.js-eposter_total').innerHTML = response.length
            document.querySelector('.js-eposter_list').innerHTML = html//eposter리스트
            document.querySelector('.js-eposter_pop_list').innerHTML = eposter_list_html
        });
    }

    
    function showEposter() {
        var this_id = this.getAttribute('data-id');
        console.log("showEposter data-id: ", this_id);
        var settings = {
            "url": "/api/v1/eposter/" + this_id,
            "method": "GET",
            "timeout": 0
        };

        $.ajax(settings).done(function (response) {
            var html = ''
            var is_location = (response.location_en != '' && response.location_en != null && response.location_en != undefined) ? '/' + response.location_en : ''
            html += '<h1>' + response.location + '</h1>'
            html += '<h2>' + response.name + is_location + '</h2>'
            html += '<p>' + response.desc.replace(/(\n|\r\n)/g, '<br>').toUpperCase() + '</p>'
            html += '<div class="font0">'
            
            html += '    <a href="#" onclick="window.open(\'' + load_url + response.photo_1 + '\', \'_blank\', \'width=600 height=600\')"><img src="' + load_url + response.photo_1 + '" oncontextmenu="return false;"></a>'
            html += '</div>'
            document.querySelector('.js-eposter_detail').innerHTML = html
            MainModule.popVerticalMiddle(0);//팝업 가운데 
            var active_eposter_el = document.querySelector('.js-eposter_pop_list li[data-id="' + this_id + '"]');//리스트 영역의 각 epost id값
            var eposter_active_class_els = document.querySelectorAll('.js-eposter_pop_list li.active');//E-POSTER LIST 중 하나를 선택
            for (var i = 0; i < eposter_active_class_els.length; i++) {//eposter 갯수 만큼
                eposter_active_class_els[i].classList.remove('active');//다른 epost를 선택했을 때 active클래스 지우기
            }
            active_eposter_el.classList.add('active');//다른 epost를 선택했을 때 해당 epost active클래스 추가

            /* 아래 코드는 해당 epost를 선택했을 때 list영역에도 선택한 epost가 맞춰지도록 하기 위해서*/
            active_eposter_el.setAttribute('tabindex', -1);
            active_eposter_el.focus();
            active_eposter_el.removeAttribute('tabindex');
        });
    }

    function getEboothList() {
        var settings = {
            "url": "/api/v1/ebooth?module_id=7",
            "method": "GET",
            "timeout": 0
        };

        $.ajax(settings).done(function (response) {
            var html = ''
            for (var i = 0; i < response.length; i++) {
                var element = response[i]
                html += '<div class="ebooth_cnt js-ebooth_cnt" data-id="' + element.id + '">'
                html += '    <img src="' + load_url + element.photo_1 + '" alt="'+element.name+'">'//load_url : 랜던하게 배정된 홈페이지 url 
                html += '</div>'
            }
            document.querySelector('.js-ebooth_list').innerHTML = html
        });
    }

    function showEbooth() {
        var this_id = this.getAttribute('data-id');//ebooth 한개 선택시 적용될 id
        // console.log("showEbooth thid__id : ", this_id);
        var settings = {
            "url": "/api/v1/ebooth/"+this_id,
            "method": "GET",
            "timeout": 0
        };
        
        $.ajax(settings).done(function (response) {
            console.log("ebooth response: ", response);
            // console.log("response.photo_1", response.photo_1);
            var href_home_url = response.homepage//ebooth 각 홈페이지
            // console.log("load_url: ", load_url);

            //홈페이지 url에 http://가 없고 https://가 없으면? http:// +홈페이지 url 이고 아니면 넘겨받은 홈페이지 url이다
            href_home_url = (href_home_url.indexOf('http://') ==-1 && href_home_url.indexOf('https://') ==-1) ? 'http://'+href_home_url : href_home_url
            // var href_sns_url = response.sns
            // href_sns_url = (href_sns_url.indexOf('http://') == -1) ? 'http://'+href_sns_url : href_sns_url
            var pop_html = ''//ebooth 상세보기 팝업창
            // pop_html += '<div class="ebooth_logo"><img src="'+load_url+response.photo_1+'" alt="'+response.name+'"></div>'
            pop_html += '<div class="ebooth_info_wrap">'
            pop_html += '    <div>'
            pop_html += '        <div>'
            pop_html += (response.homepage != '') ? ' <a href="'+href_home_url+'" target="_blank">' : ''//_blank 새 윈도우 창을 열어서 웹페이지 열기 기존의 창은 그대로 남겨져 있다
            pop_html += '       <img src="'+load_url+response.photo_1+'" alt="'+response.name+'">'//alt : img의 주소가 잘못 되었거나 이미지를 불러오지 못했을 때 alt속성의 이미지를 대체 한다
            pop_html += (response.homepage != '') ? ' </a>' : ''
            pop_html += '       </div>'
            pop_html += '    </div>'
            pop_html += '    <div class="ebooth_info">'
            pop_html += '        <div class="flex_column ebooth_info_column">'
            pop_html += '            <ul>'
            pop_html += '                <li> <span>Company Name</span> <span>'+response.name+'</span> </li>'
            // pop_html += '                <li> <span>Address</span> <span>대전 서구 관저동로 158</span> </li>'
            // pop_html += '                <li> <span>Representative Number</span> <span>042-600-8890</span> </li>'
            // pop_html += '                <li> <span>Email</span> <span>mino@kyuh.ac.kr</span> </li>'
            pop_html += (response.homepage != '') ? '<li> <span>Homepage</span> <span><a href="'+href_home_url+'" target="_blank">'+response.homepage+'</a></span> </li>' : ''
            // pop_html += '                <li> <span>Homepage</span> <span><a href="'+href_home_url+'" target="_blank">'+response.homepage+'</a></span> </li>'
            // pop_html += '                <li> <span>SNS</span> <span><a href="http://" target="_blank"></a></span> </li>'
            pop_html += '            </ul>'
            if(response.file_1 != '' && response.file_1 != null && response.file_1 != undefined){
                pop_html += '        <div>'
                pop_html += '            <a href="'+load_url+response.file_1+'" target="_blank">Brochure Download</a>'
                pop_html += '        </div>'
            }
            pop_html += '        </div>'
            pop_html += '    </div>'
            pop_html += '</div>'
            // var is_video = response.file_2.split('.').pop();
            // if(is_video == 'pdf'){
            //     pop_html += '<div class="ebooth_info_wrap non-hover">'
            //     pop_html += '    <div><div>'
            //     pop_html += '<div class="ebooth_slide js-ebooth_slide">'
            //     for(var i=1;i<=50;i++){
            //         var this_ebooth_img = response['pdf_photo_'+i]
            //         if(this_ebooth_img == ''){
            //             break;
            //         }
            //         this_ebooth_img = this_ebooth_img.replace(/\s/g,'')
            //         pop_html += '<div>'
            //         pop_html += '    <a href="'+load_url+response.file_2+'" target="_blank"><image src="'+load_url+this_ebooth_img+'"></a>'
            //         pop_html += '</div>'
            //     }
            //     pop_html += '</div>'
            // }else{
            //     pop_html += '<div class="ebooth_info_wrap">'
            //     pop_html += '    <div><div>'
            //     pop_html += '<video controls class="js-video"><source src="' + load_url+response.file_2 + '" type="video/mp4"></video>' //영상영역
            // }
            

            // pop_html += '</div></div>'

            // pop_html += '    <div class="ebooth_info">'
            // pop_html += '<div class="flex_column ebooth_info_column">'
            // pop_html += '        <ul>'
            // pop_html += '            <li>'
            // pop_html += '                <span>Company Name</span>'
            // pop_html += '                <span>'+response.name+'</span>'
            // pop_html += '            </li>'
            // pop_html += '            <li>'
            // pop_html += '                <span>Address</span>'
            // pop_html += '                <span>'+response.institution+'</span>'
            // pop_html += '            </li>'
            // pop_html += '            <li>'
            // pop_html += '                <span>Representative Number</span>'
            // pop_html += '                <span>'+response.position_en+'</span>'
            // pop_html += '            </li>'
            // pop_html += '            <li>'
            // pop_html += '                <span>Email</span>'
            // pop_html += '                <span>'+response.email+'</span>'
            // pop_html += '            </li>'
            // pop_html += '            <li>'
            // pop_html += '                <span>Homepage</span>'
            // pop_html += '                <span><a href="'+href_home_url+'" target="_blank">'+response.homepage+'</a></span>'
            // pop_html += '            </li>'
            // pop_html += '            <li>'
            // pop_html += '                <span>SNS</span>'
            // pop_html += '                <span><a href="'+href_sns_url+'" target="_blank">'+response.sns+'</a></span>'
            // pop_html += '            </li>'
            // pop_html += '        </ul>'
            // if(response.file_1 != '' && response.file_1 != null && response.file_1 != undefined){
            //     pop_html += '        <div>'
            //     pop_html += '            <a href="'+load_url+response.file_1+'" target="_blank">Brochure Download</a>'
            //     pop_html += '        </div>'
            // }
            // pop_html += '</div>'
            // pop_html += '    </div>'
            // pop_html += '</div>'
            pop_html += (response.desc != '') ? '<div class="ebooth_html">'+response.desc+'</div>' : ''//ebooth 팝업창 전체 디자인
            // pop_html += '<div class="ebooth_html">'+response.desc+'</div>' //추후 html content
            document.querySelector('.js-ebooth_content').innerHTML = pop_html//js-ebooth_content영역에 추가
            // if(is_video == 'pdf'){
            //     eboosh_bx_slider = $('.js-ebooth_slide').bxSlider({
            //         slideHeight: 300,
            //         pager: false,
            //         touchEnabled:false
            //     })
            // }
            MainModule.popVerticalMiddle(1);// 0은 eposter index_type, 1은 ebooth index_type에 해당된다
        });
    }

    return {
        init: init
    };
})();
(function () {
    ListModule.init();
})();