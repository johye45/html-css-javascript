var DEFAULT_START_TIME = '2020-11-29 09:00:00'
var DEFAULT_END_TIME = '2020-12-09 02:00:00'
var ACCESS_USER_ARR = [
    {"name" : '서진철',"phone" : "01044556588"},
    {"name" : '김정은',"phone" : "01095271710"},
    {"name" : '박진곤',"phone" : "01088834359"},
    {"name" : '이윤주',"phone" : "01024199642"},
    {"name" : '김선재',"phone" : "01046466423"},
    {"name" : '이규복',"phone" : "01040852871"},
    {"name" : '김종엽',"phone" : "0103743546"},
    {"name" : '백상현',"phone" : "01062806490"},
    {"name" : '허중보',"phone" : "01080079099"},
    {"name" : '김우식',"phone" : "01037139042"},
    {"name" : '김은주',"phone" : "01099798717"},
    {"name" : '김보희',"phone" : "01067221121"},
    {"name" : '강효진',"phone" : "01073718612"},
    {"name" : '조혜',"phone" : "01055180157"}
]
var MainModule = (function () {
    var $root
    function init() {
        $root = $('.wrap');
        eventBind();
        checkIsMobile();
        startBxslider();
        // getMyInfo();
    }

    function eventBind() {
        $root.on('click', '.logout', logoutUser)
        $root.on('click', '.js-main_show_pop', popVerticalMiddle)
        $root.on('click', '.js-main_hide_pop', closePopEvent)
    }

    var floatPosition = parseInt($(".float_banner").css('top'));
    $(window).scroll(function() {
      var scrollTop = $(window).scrollTop();
      var newPosition = scrollTop + floatPosition + "px";
      $(".float_banner").stop().animate({
        "top": newPosition
      }, 500);
    }).scroll();

    function closePopEvent() {
        $('.pop_bg').hide();
        $(this).closest('.pop_wrap').hide();
        // $('.pop_wrap').hide();
        document.body.style.overflow = 'auto';
    }

    //팝업 가운데로
    function popVerticalMiddle(type) {
        $('.pop_bg').show();

        var this_index = type;
        // if (type == 1) {
        //     this_index = 0;
        // } else if (type > 1) {
        //     this_index = type
        // } else {
        //     this_index = this.getAttribute('data-pop_index')
        // }
        
        if (this_index == undefined || this_index == null || this_index == '') {
            this_index = 0;
        }
        var pop_el = document.querySelectorAll('.pop_wrap')[this_index];
        pop_el.style.visiblelity = 'hidden';
        pop_el.style.display = 'block'
        var top = ($(window).height() - $(".pop_wrap").eq(this_index).outerHeight()) / 2 + $(window).scrollTop()
        var left = ($(window).width() - $(".pop_wrap").eq(this_index).outerWidth()) / 2 + $(window).scrollLeft()
        top = (top <= 0) ? 0 : top;
        left = (left <= 0) ? 0 : left;
        pop_el.style.marginTop = top + "px"
        pop_el.style.marginLeft = left + "px"
        $('.pop_wrap').eq(this_index).show();
        document.body.style.overflow = 'hidden';
    }

    function logoutUser() {
        if (confirm('로그아웃 하시겠습니까?')) {
            location.href = './result.html';//로그아웃시 result.html 페이지로 이동하기 -->수료증 출력
        }
    }

    function getUrlParameter(str) {
        var now_url = location.href;
        var str_param = '';
        var url_arr = now_url.split('?').pop().split('&');
        for (var i = 0; i < url_arr.length; i++) {
            if (url_arr[i].indexOf(str) !== -1) {//-1이 아니면 즉 true이면 
                //indexOf('id')가 일치하는 문자열이 없으면 -1반환(false)

                //만약 id=30 이라면 30 리턴됨, str_param = 30
                str_param = url_arr[i].split('=').pop();//=을 기준으로 마지막 요소 리턴 
                break;
            }
        }
        return str_param
    }

    function getMyInfo() {
        var settings = {
            "url": "/api/v1/user/my_page",
            "method": "GET",
            "timeout": 0
        };

        $.ajax(settings).done(function (response) {
            // console.log(response);
            var user_cnt_el = document.querySelector('.js-user_count');
            if (user_cnt_el != null && user_cnt_el != '' && user_cnt_el != undefined) {
                user_cnt_el.innerText = response.active_user_count;
            }
        });
    }

    function checkIsMobile() {
        var this_href = location.href.split('/').pop();
        if(this_href != 'index.html'){
            if (/Mobi/i.test(navigator.userAgent) || /Android/i.test(navigator.userAgent)) {
                console.log('is mobile');
                alert('모바일로 시청하실 수 없습니다.');
                document.body.innerHTML = '<h1 style="position:absolute; left:0; right:0; top:40%; text-align:center; font-size:2.4rem;">모바일로 시청하실 수 없습니다.</h1>'
            }
        }
    }

    function startBxslider(){
        var bx_el = $('.js-bx_wrap')
        if(bx_el){
            var n = $(".js-bx_wrap div").length;
            bx_el.bxSlider({
                minSlides: 5,
                ticker: true,
                slideWidth: 'auto',
                slideMargin: 10,
                speed: 5000 * n
            })
        }
    }

    function setLoadHtml(){
        var target_el = $('.js-load_wrap');
        var html = '<div class="load_bg" style="display:block;">'
        html += '    <div class="load_wrap">'
        html += '        <div class="lds-spinner">'
        html += '            <div></div>'
        html += '            <div></div>'
        html += '            <div></div>'
        html += '            <div></div>'
        html += '            <div></div>'
        html += '            <div></div>'
        html += '            <div></div>'
        html += '            <div></div>'
        html += '            <div></div>'
        html += '            <div></div>'
        html += '            <div></div>'
        html += '            <div></div>'
        html += '        </div>'
        html += '        <div class="load_text"></div>'
        html += '    </div>'
        html += '</div>'
        target_el.html(html)
    }

    return {
        init: init,
        closePopEvent: closePopEvent,
        popVerticalMiddle: popVerticalMiddle,
        getUrlParameter: getUrlParameter,
        setLoadHtml: setLoadHtml
    };
})();
(function () {
    MainModule.init();
})();
