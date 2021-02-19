var FLOATING_BANNER_ARR = [

]
var FOTTER_BANNER_ARR = [
    {
        'name' : '덴탈아리랑',
        'photo_1' : './static/images/footer/logo_01.png',
        'link' : '#', //클릭시 넘어가는 링크
        'order' : 10
    },
    {
        'name' : '건치',
        'photo_1' : './static/images/footer/logo_02.png',
        'link' : '#',
        'order' : 20
    },
    {
        'name' : 'dentin',
        'photo_1' : './static/images/footer/logo_03.png',
        'link' : '#',
        'order' : 30
    },
    {
        'name' : '덴탈이슈',
        'photo_1' : './static/images/footer/logo_04.png',
        'link' : '#',
        'order' : 40
    },
    {
        'name' : '덴탈포커스',
        'photo_1' : './static/images/footer/logo_05.png',
        'link' : '#',
        'order' : 50
    },
    {
        'name' : '구애보',
        'photo_1' : './static/images/footer/logo_06.jpg',
        'link' : '#',
        'order' : 60
    },
    {
        'name' : '덴탈투데이',
        'photo_1' : './static/images/footer/logo_07.png',
        'link' : '#',
        'order' : 70
    },
    {
        'name' : 'seminar biz',
        'photo_1' : './static/images/footer/logo_08.png',
        'link' : '#',
        'order' : 80
    },
    {
        'name' : '치의신보',
        'photo_1' : './static/images/footer/logo_09.png',
        'link' : '#',
        'order' : 90
    },
    {
        'name' : 'DenfoLine',
        'photo_1' : './static/images/footer/logo_10.png',
        'link' : '#',
        'order' : 100
    },
    {
        'name' : '치과신문',
        'photo_1' : './static/images/footer/logo_11.png',
        'link' : '#',
        'order' : 110
    },
    {
        'name' : '치과의사신문',
        'photo_1' : './static/images/footer/logo_12.png',
        'link' : '#',
        'order' : 120
    },
    {
        'name' : 'DENTIST',
        'photo_1' : './static/images/footer/logo_13.png',
        'link' : '#',
        'order' : 130
    }
]
var MainModule = (function () {
    var $root
    function init() {
        $root = $('.wrap');
        eventBind();
        checkIsMobile();
        settingFooterSlider();
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

    // var floatPosition2 = parseInt($(".slide_wrap").css('top'));
    // $(window).scroll(function() {
    //   var scrollTop = $(window).scrollTop();
    //   var newPosition = scrollTop + floatPosition2 + "px";
    //   $(".slide_wrap").stop().animate({
    //     "top": newPosition
    //   }, 500);
    // }).scroll();

    function closePopEvent() {
        $('.pop_bg').hide();
        $(this).closest('.pop_wrap').hide();
        // $('.pop_wrap').hide();
        document.body.style.overflow = 'auto';
    }

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
            location.href = './result.html';
        }
    }

    function getUrlParameter(str) {
        var now_url = location.href;
        var str_param = '';
        var url_arr = now_url.split('?').pop().split('&');
        for (var i = 0; i < url_arr.length; i++) {
            if (url_arr[i].indexOf(str) !== -1) {
                str_param = url_arr[i].split('=').pop();
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

    function settingFooterSlider(){
        console.log('test')
        var bx_el = $('.js-bx_wrap')
        if(bx_el.length > 0){
            var html = ''
            for(var i=0; i<FOTTER_BANNER_ARR.length;i++){
                var el = FOTTER_BANNER_ARR[i]
                html += '<div>'
                // html += '    <a href="'+el.link+'" target="_blank">'
                html += '        <img src="'+el.photo_1+'" alt="'+el.name+'">'
                // html += '    </a>'
                html += '</div>'
            }
            bx_el.html(html)
            startBxslider()
        }
    }

    function startBxslider(){
        var bx_el = $('.js-bx_wrap')
        var n = $(".js-bx_wrap div").length;
        bx_el.bxSlider({
            minSlides: 3,
            // maxSlides: 4,
            ticker: true,
            slideWidth: 'auto',
            slideMargin: 10,
            speed: 5000 * n,
            tickerHover: true
        })
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

    function calcWatchTime(sec){
        var TOTAL_TIME = sec
        var hour = String(parseInt(TOTAL_TIME / 3600)); //1 h = 3600 sec
        var min = String(parseInt((TOTAL_TIME % 3600) / 60));
        var sec = String(TOTAL_TIME % 60);
        hour = (hour.length<2) ? '0' + hour : hour;
        min = (min.length<2) ? '0' + min : min;
        sec = (sec.length<2) ? '0' + sec : sec;
        var return_val = hour+':'+min+':'+sec
        document.querySelector('.js-user_time').innerHTML = return_val
    }

    return {
        init: init,
        closePopEvent: closePopEvent,
        popVerticalMiddle: popVerticalMiddle,
        getUrlParameter: getUrlParameter,
        setLoadHtml: setLoadHtml,
        calcWatchTime: calcWatchTime
    };
})();
(function () {
    MainModule.init();
})();
