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
    var USER_INFO_OBJ = {
        'admin_level': null
    }
    var load_url;
    function init() {
        $root = $('.wrap');
        load_url_num = (Math.floor((Math.random() * 3) + 0)) //해당 번호로 갖고온 url사용하기 
        load_url = MOVIE_URL_ARR[load_url_num]
        USED_NUM_ARR.push(load_url_num);
        
        var session_data = sessionStorage.getItem('nav_check_data')
        if(session_data != null){
            session_data = JSON.parse(session_data);
            main_category_id = session_data.main_category_id
            sub_category_id = session_data.sub_category_id
        }
        console.log(session_data)

        eventBind();
        getMyInfo();
        getEposterList();
        getEboothList();
    }

    function eventBind() {
        $root.on('click', '.js-video', locationCheckLecture)
        $root.on('click', '.js-nav', changeTab)
        $root.on('click', '.js-eposter_cnt', showEposter)
        $root.on('click', '.js-ebooth_cnt', showEbooth)
        $root.on('click', '.js-eposter_pop_list li', showEposter)
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
            console.log(response);
            var server_time = response.server_time
            if (response.app_id != 4){
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
            USER_INFO_OBJ.admin_level = response.admin_level
            var user_cnt_el = document.querySelector('.js-user_count');
            if (user_cnt_el != null && user_cnt_el != '' && user_cnt_el != undefined) {
                var user_count_number = Number(response.active_user_count);
                user_count_number = (user_count_number > 3000) ? 3000 : (user_count_number < 1) ? 1 : user_count_number
                user_cnt_el.innerText = user_count_number;
            }
            getCategoryList()
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
        $.ajax(settings).done(function (response) {
            console.log(response)
            var html = ''
            $.each(response, function (key, value) {
                var sub_html = ''
                if (value.sub_categories.length > 0) {
                    is_sub_category.push(value.id)
                    sub_html += '<div class="sub_nav_wrap">'
                    $.each(value.sub_categories, function (sub_key, sub_val) {
                        sub_html += '<span class="js-nav sub_nav" data-id="' + sub_val.id + '">' + sub_val.name + '</span>'
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
            if(main_category_id == 'eposter' || main_category_id == 'ebooth'){
                document.querySelector('.js-nav[data-id="'+main_category_id+'"]').classList.add('active')
                console.log(document.querySelector('.js-video_list').parentNode)
                document.querySelector('.js-video_list').parentNode.style.display = 'none';
                document.querySelector('.'+main_category_id+'_wrap').style.display = ''
            }else{
                var nav_check_el = document.querySelector('.js-nav[data-id="'+main_category_id+'"]')
                if (main_category_id == '' || nav_check_el == null || nav_check_el == undefined || nav_check_el == '') {
                    for (var i = 0; i < response.length; i++) {
                        var el = response[i]
                        if (is_speacial_category.indexOf(el.id) == -1 || (is_speacial_category.indexOf(el.id) != -1 && SPEACIAL_USER_LV == USER_INFO_OBJ.admin_level)) {
                            main_category_id = el.id
                            nav_els[i].classList.add('active')
                            $('.js-section').eq(0).attr('data-color',i)
                            break;
                        }
                    }
                }else{
                    if(main_category_id == 11){
                        document.querySelector('.js-abstract_list').style.display = 'none'
                    }
                    nav_check_el.classList.add('active')
                    $('.js-section').eq(0).attr('data-color',$('.js-nav[data-id="'+main_category_id+'"]').index('.js-nav'))
                    if(sub_category_id != ''){
                        document.querySelector('.js-nav[data-id="'+sub_category_id+'"]').classList.add('sub_nav_active')
                    }
                }
                getVodList()
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
        MainModule.setLoadHtml();
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
            response.sort(function (a, b) {
                if (a.order < b.order) return -1;
                if (a.order > b.order) return 1;
                if (a.id < b.id) return -1;
                if (a.id > b.id) return 1;
                return 0;
            });
            console.log(response)
            $.each(response, function (key, value) {
                // null : 시작도안함, 0 : 진행중, 1 : 시청완료
                // var is_finished = (value.is_finished === 1 && value.is_exam_passed === 1) ? 'is_complete' : (value.is_finished === 0 || value.is_finished === 1 || value.required_type === 1) ? '' : 'is_lock'
                if(value.show_type==1){
                    var is_finished = ''
                    if(value.is_finished === 1){
                        if(value.question_count < 1){
                            is_finished = 'is_complete'
                        }else if(value.is_exam_passed == 1){
                            is_finished = 'is_complete'
                        }
                    }
                    // var is_finished = (value.is_finished === 1) ? 'is_complete' : (value.is_finished === 0) ? '' : 'is_lock'
                    var is_photo = (value.photo_1 == '') ? './static/images/logo.png' : load_url + value.photo_1
                    html += '<div class="dis-table list_cnt js-video" data-id="' + value.id + '" data-finish="' + is_finished + '">'
                    html += '    <div class="list_img">'
                    html += '        <img src="' + is_photo + '" alt="' + value.title + '">'
                    html += '    </div>'
                    html += '    <div class="list_content">'
                    html += '        <div class="title">' 
                    html += (value.file_2 != '') ? '<a class="list_ab_btn js-abstract" href="#" onclick="window.open(\''+load_url+value.file_2+'\', \'_blank\', \'width=600 height=600\')"">초록보기</a>' : ''
                    html += (value.title_en != '') ? '<h1>'+value.title_en+'</h1>' : ''
                    html += (value.summary != '') ? '<span>'+value.summary+'</span>' : ''
                    html += '<h2>'+value.title+'</h2>'
                    html += '    </div>'
                    html += '        <div class="sub_title">'
                    html += '            <span>' + value.contents.replace(/(\n|\r\n)/g, '<br>') + '</span>'
                    html += '        </div>'
                    html += '    </div>'
                    html += '</div>'
                    var push_vod_obj = {
                        'id': value.id,
                        'is_finished': value.is_finished,
                        'is_exam_passed': value.is_exam_passed,
                        'required_type': value.required_type,
                        'order': value.order
                    }
                    vod_type_arr.push(push_vod_obj)
                    // if (value.is_finished === 0) { //진행중 강의
                    //     my_lecture_id = value.id
                    // }
                }
                
            })
            document.querySelector('.js-video_list').innerHTML = html;

            // required_lecture_data = searchObject(1, 'required_type', vod_type_arr);
            if (searchObject(1, 'required_type', vod_type_arr) != undefined) {
                required_lecture_data = searchObject(1, 'required_type', vod_type_arr);
            }

            if (searchObject(0, 'is_exam_passed', vod_type_arr) != undefined) {
                duration_lecture_data = searchObject(0, 'is_exam_passed', vod_type_arr);
            }
            var is_lecture_complete_data
            for (var i = 0; i < vod_type_arr.length; i++) {
                if (vod_type_arr[i]['required_type'] !== 1 && vod_type_arr[i]['is_exam_passed'] != 1) {
                    is_lecture_complete_data = vod_type_arr[i];
                }
            }
            // if(duration_lecture_data.id ==='' && required_lecture_data.is_exam_passed != null && is_lecture_complete_data!=undefined){ //이건 첫접속(필수강의 자동 on이니 활성화) 일 때 alert창 안뜨는 조건문 있음
            //     alert('이수하실 강의를 선택해 주세요')
            // }
            // if (duration_lecture_data.id === '' && is_lecture_complete_data != undefined) {
            //     alert('수료하실 강의를 선택해 주세요')
            // }
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

    function locationCheckLecture(e) {
        if (!e.target.classList.contains('js-abstract')) {
            var this_id = Number(this.getAttribute('data-id'));
            var select_lecture_data = searchObject(this_id, 'id', vod_type_arr);
            
            var settings = {
                "url": "/api/v1/vod/" + select_lecture_data.id,
                "method": "GET",
                "timeout": 0,
            };
        
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

    function searchObject(idKey, key, myArray) {
        for (var i = 0; i < myArray.length; i++) {
            if (myArray[i][key] === idKey) {
                return myArray[i];
            }
        }
    }

    function changeTab(e) {
        var _this = $(this)
        var this_id = this.getAttribute('data-id');
        var section_els = document.querySelectorAll('.js-section');
        var this_key = this.getAttribute('data-key');
        if (e.target.classList.contains('sub_nav')) { // 서브카테고리
            sub_category_id = this_id
            _this.closest('.js-nav_wrap').find('.sub_active').removeClass('sub_active');
            _this.closest('.js-nav_wrap').find('.sub_nav_active').removeClass('sub_nav_active');
            _this.addClass('sub_nav_active')
            if(this_id == 11){
                document.querySelector('.js-abstract_list').style.display = 'none'
             }else{
                 document.querySelector('.js-abstract_list').style.display = ''
             }
            showSection(0)
            getVodList()
        } else { //메인카테고리
            main_category_id = this_id;
            sub_category_id = '';
            var this_type = this.getAttribute('data-type');
            if (this_type == 3) {
                _this.closest('.js-nav_wrap').find('.sub_nav_active').removeClass('sub_nav_active');
                _this.closest('.js-nav_wrap').find('.sub_active').removeClass('sub_active');
                showSection(1)
            } else if (this_type == 4) {
                _this.closest('.js-nav_wrap').find('.sub_nav_active').removeClass('sub_nav_active');
                _this.closest('.js-nav_wrap').find('.sub_active').removeClass('sub_active');
                showSection(2)
            } else {
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
                _this.closest('.js-nav_wrap').find('.sub_active').removeClass('sub_active');
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
            _this.closest('.js-nav_wrap').find('.active').removeClass('active');
            _this.addClass('active');
        }
        setSessionStorage();
    }

    function setSessionStorage(){
        var data = {
            'main_category_id' : main_category_id,
            'sub_category_id' : sub_category_id
        }
        sessionStorage.setItem('nav_check_data',JSON.stringify(data));
    }


    function showSection(num) {
        var section_els = document.querySelectorAll('.js-section');
        for (var i = 0; i < section_els.length; i++) {
            if (i === num) {
                section_els[i].style.display = ''
            } else {
                section_els[i].style.display = 'none'
            }
        }
    }

    function getEposterList() {
        var html = '';
        var eposter_pop_html = ''
        var eposter_list_html = ''

        var settings = {
            "url": "/api/v1/eposter?module_id=6",
            "method": "GET",
            "timeout": 0,
        };

        $.ajax(settings).done(function (response) {
            for (var i = 0; i < response.length; i++) {
                var element = response[i]
                // var content_el = response[i].documents[0] //무조건 1개만 설정되서 0으로 고정
                var is_checked = (element.is_liked === 1) ? 'checked' : ''
                if (element.is_liked === 1) {
                    my_eposter_like = my_eposter_like + 1
                }
                // span 및 input html 추가 X :: 추가시 showEposterPopup() 수정필요
                var is_location = (element.location_en != '' && element.location_en != null && element.location_en != undefined) ? '/' + element.location_en : ''
                html += '<div class="eposter_cnt js-eposter_cnt" data-id="' + element.id + '">'
                html += '<div class="dis-table eposter_room">'
                html += '    <div class="eposter_room_info">' + element.location + '</div>'
                html += '</div>'
                html += '<div class="eposter_title">' + element.desc.replace(/(\n|\r\n)/g, '<br>').toUpperCase() + '</div>'
                html += '<div class="eposter_name">' + element.name + is_location + '</div>'
                html += '<div class="eposter_email">' + element.name_en + '</div>'
                html += '</div>'

                //epost popup list html
                eposter_list_html += '<li data-id="' + element.id + '">'
                eposter_list_html += '    <div class="mini_img">'
                eposter_list_html += '        <img src="' + load_url + element.photo_1_thumb + '">'
                eposter_list_html += '    </div>'
                eposter_list_html += '    <div class="popup_list_title">'
                eposter_list_html += '        <h6>' + element.location + '</h6>'
                eposter_list_html += '        <span>' + element.name + is_location + '</span>'
                eposter_list_html += '    </div>'
                eposter_list_html += '</li>'
            }
            document.querySelector('.js-eposter_total').innerHTML = response.length
            document.querySelector('.js-eposter_list').innerHTML = html
            document.querySelector('.js-eposter_pop_list').innerHTML = eposter_list_html
        });
    }

    function showEposter() {
        var this_id = this.getAttribute('data-id');
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
            MainModule.popVerticalMiddle(0);
            var active_eposter_el = document.querySelector('.js-eposter_pop_list li[data-id="' + this_id + '"]');
            var eposter_active_class_els = document.querySelectorAll('.js-eposter_pop_list li.active');
            for (var i = 0; i < eposter_active_class_els.length; i++) {
                eposter_active_class_els[i].classList.remove('active');
            }
            active_eposter_el.classList.add('active');
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
                html += '    <img src="' + load_url + element.photo_1 + '" alt="'+element.name+'">'
                html += '</div>'
            }
            document.querySelector('.js-ebooth_list').innerHTML = html
        });
    }

    function showEbooth() {
        var this_id = this.getAttribute('data-id');
        var settings = {
            "url": "/api/v1/ebooth/"+this_id,
            "method": "GET",
            "timeout": 0
        };

        $.ajax(settings).done(function (response) {
            var href_home_url = response.homepage
            href_home_url = (href_home_url.indexOf('http://') ==-1 && href_home_url.indexOf('https://') ==-1) ? 'http://'+href_home_url : href_home_url
            // var href_sns_url = response.sns
            // href_sns_url = (href_sns_url.indexOf('http://') == -1) ? 'http://'+href_sns_url : href_sns_url
            var pop_html = ''
            // pop_html += '<div class="ebooth_logo"><img src="'+load_url+response.photo_1+'" alt="'+response.name+'"></div>'
            pop_html += '<div class="ebooth_info_wrap">'
            pop_html += '    <div>'
            pop_html += '        <div>'
            pop_html += (response.homepage != '') ? ' <a href="'+href_home_url+'" target="_blank">' : ''
            pop_html += '       <img src="'+load_url+response.photo_1+'" alt="'+response.name+'">'
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
            pop_html += (response.desc != '') ? '<div class="ebooth_html">'+response.desc+'</div>' : ''
            // pop_html += '<div class="ebooth_html">'+response.desc+'</div>' //추후 html content
            document.querySelector('.js-ebooth_content').innerHTML = pop_html
            // if(is_video == 'pdf'){
            //     eboosh_bx_slider = $('.js-ebooth_slide').bxSlider({
            //         slideHeight: 300,
            //         pager: false,
            //         touchEnabled:false
            //     })
            // }
            MainModule.popVerticalMiddle(1);
        });
    }

    return {
        init: init
    };
})();
(function () {
    ListModule.init();
})();
