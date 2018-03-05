/*
 * Created by Sun Wen on 2017/6/26.
 */

var index = {
    login: $(".loginBox"),
    reg: $('.regBox'),
    init: function() {
        this.register();
        this.loginFuns();
        this.logout();
        this.menu();
        this.list('*');
        this.mainBtn();
    },
    menu: function() {
        $.ajax({
            url: '/api/admin/category',
            type: 'get',
            dateType: 'json',
            success: function(rlt) {
                if (rlt.code == 200) {
                    var html = '<a href = "javascript:void(0)" class="active">首页</a>';
                    for (var i = 0; i < rlt.list.length; i++) {
                        html += '<a href="##">' + rlt.list[i].name + '</a>';
                    }
                    $(".menu").append(html)
                }
            }
        })
        $(".menu").on('click', 'a', function() { //获取分类内容信息
            var cates = $(this).html() == '首页' ? '*' : $(this).html();
            $(this).addClass('active').siblings().removeClass("active");
            index.list(cates);
        })
    },
    register: function() { //注册

        this.reg.attr('tabindex', 1).on('keydown', function(e) {
            if (e.keyCode == 13) {
                regFuns()
            }
        })
        this.reg.find('button').click(function() {
            regFuns();
        });

        function regFuns() {
            var username = $('.regBox .u').val();
            var password = $('.regBox .p').val();
            var repassword = $('.regBox .ap').val();
            var nc = $('.regBox .nc').val();
            $.ajax({
                url: '/api/user/register',
                data: {
                    username: username,
                    password: password,
                    repassword: repassword,
                    nicheng: nc,
                    isAdmin: false
                },
                type: 'post',
                dataType: 'json',
                success: function(rlt) {
                    $(".msg").html(rlt.msg);
                    if (rlt.code == 200) {
                        window.location.reload();
                    }
                }
            })
        }
        this.login.find('a').click(function() {
            index.reg.fadeIn();
            index.login.hide();
        });
    },
    loginFuns: function() { // 登录
        this.reg.find('a').click(function() { //点击显示登录框
            index.login.fadeIn();
            index.reg.hide();
        });
        this.login.find('button').click(function() { //登录
            this.blur();
            index.loginFun()
        });
        this.login.attr('tabindex', 1).on('keydown', function(e) {
            if (e.keyCode == 13) {
                index.loginFun()
            }
        })
    },
    loginFun: function() { //登录函数
        var username = $('.loginBox .u').val();
        var password = $('.loginBox .p').val();
        $.ajax({
            url: '/api/user/login',
            data: {
                username: username,
                password: password
            },
            type: 'post',
            dataType: 'json',
            success: function(rlt) {
                $(".msg1").html(rlt.msg)
                if (rlt.code == 200) {
                    window.location.reload();
                }
            }
        })
    },
    logout: function() { //退出登录
        $(".logout").on('click', function() {
            $.ajax({
                type: 'get',
                url: '/api/user/logout',
                dataType: 'json',
                success: function(rlt) {
                    if (rlt.code == 200) {
                        window.location.reload();
                    }
                }
            })
        });
    },
    list: function(cates) { //首页列表
        $.ajax({
            url: '/api/content/list?page=1&cate=' + cates,
            dataType: 'json',
            type: 'get',
            success: function(rlt) {
            	console.log(rlt)
                var html = '';
                for (var i = 0; i < rlt.list.length; i++) {
                    var date = new Date(rlt.list[i].time);
                    var y = date.getFullYear();
                    var mon = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
                    var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
                    var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
                    var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
                    var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
                    var time = y + '-' + mon + '-' + d + ' ' + h + ':' + m + ':' + s;

                    var intro = rlt.list[i].intro;
                    var introLen = rlt.list[i].intro.length;
                    if( introLen >= 80 ){
                        intro = intro.substr(0,80) + '...'
                    }

                    html += '<div class="main-box">' +
                        '<h3>' + rlt.list[i].title + '</h3>' +
                        '<div class="toolbar">' +
                        '<div class="s-b author">作者：<span>' + rlt.list[i].author + '</span></div>' +
                        '<div class="s-b cate">标签：<span>' + rlt.list[i].cate + '</span></div>' +
                        '<div class="s-b time">时间：<span>' + time + '</span></div>' +
                        '<div class="s-b read">阅读：<span>' + rlt.list[i].read + '</span></div>' +
                        '<div class="s-b commont">评论：<span>' + rlt.list[i].commont.length + '</span></div>' +
                        '<div class="s-b like">点赞：<span>' + rlt.list[i].like + '</span></div>' +
                        '</div>' +
                        '<p>' + intro + '</p>' +
                        '<a class="btn btn-warning" href="/admin/content_msg?id=' + rlt.list[i]._id + '">阅读全文</a>' +
                        '</div>'
                }
                $(".list-l").empty().append(html)
            }
        })
    },
    mainBtn: function() {
        $(".toggleBtn").click(function() {
            $(".toggleBtn").toggleClass('closed');
            var r = parseInt($('.list-r').css("margin-right"))
            if ($(this).hasClass('closed')) {
                $('.list-r').animate({ right: '-30%' })
            } else {
                $('.list-r').animate({ right: r })
            }
        });
    }
}
var user = {
    init: function() {
        var pgNum = new Number(1);
        var maxPages = new Number();
        page(pgNum)

        function page(num) {
            $.ajax({
                url: "/api/user/users?page=" + num,
                type: 'get',
                dataType: 'json',
                success: function(rlt) {
                    maxPages = rlt.pages;
                    var html = '<ul class="pagination">' +
                        '<li class="prevBtn"><a href="#" aria-label="Previous">&laquo;</a></li>';
                    for (var i = 0; i < maxPages; i++) {
                        if ((i + 1) == num) {
                            html += '<li class="active"><span>' + (i + 1) + '</span></li>';
                        } else {
                            html += '<li><span>' + (i + 1) + '</span></li>';
                        }
                    }

                    html += '<li class="nextBtn"><a href="#" aria-label="Next">&raquo;</a></li>' +
                        '<li class="allpage"><a href="##">共' + maxPages + '页</a></li>';

                    var list;
                    for (var j = 0; j < rlt.list.length; j++) {
                        bools = rlt.list[j].isAdmin ? '是' : '';
                        list += '<tr>' +
                            '<td>' + rlt.list[j]._id + '</td>' +
                            '<td>' + rlt.list[j].username + '</td>' +
                            '<td>' + rlt.list[j].password + '</td>' +
                            '<td>' + rlt.list[j].nicheng + '</td>' +
                            '<td>' + bools + '</td>' +
                            '</tr>';
                    }
                    $("#users .title").nextAll().remove();
                    $("#users").append(list);
                    $(".pages").empty().append(html);
                }
            })
        }
        $(".pages").on("click", 'li span', function() {
            pgNum = Number($(this).html());
            page(pgNum)
        })
        $(".pages").on("click", '.prevBtn', function() {
            pgNum = pgNum > 1 ? pgNum - 1 : 1;
            page(pgNum)
        })
        $(".pages").on("click", '.nextBtn', function() {
            pgNum = pgNum < maxPages ? pgNum + 1 : maxPages;
            page(pgNum)
        })
        $(".pages").on("click", '.allpage', function() {
            pgNum = maxPages;
            page(pgNum)
        })
    }
}
var category_index = {
    init: function() {
        var cateNum = new Number(1);
        var maxPages2 = new Number();
        category(cateNum)

        function category(num) {
            $.ajax({
                type: 'get',
                url: '/api/admin/category?page=' + num + '&sort=0',
                dataType: 'json',
                success: function(rlt) {
                    var list = '';
                    for (var i = 0; i < rlt.list.length; i++) {
                        list += '<tr>' +
                            '<td class="id">' + rlt.list[i]._id + '</td>' +
                            '<td>' + rlt.list[i].name + '</td>' +
                            '<td class="cz"><a href="/admin/category_edit?id=' + rlt.list[i]._id + '">修改</a> | <a class="delete" href="javascript:void(0)">删除</a><span>删除成功！</span></td>' +
                            '</tr>';
                    }
                    maxPages2 = rlt.pages;
                    var html = '<ul class="pagination">' +
                        '<li class="prevBtn"><a href="#" aria-label="Previous">&laquo;</a></li>';
                    for (var i = 0; i < maxPages2; i++) {
                        if ((i + 1) == num) {
                            html += '<li class="active"><span>' + (i + 1) + '</span></li>';
                        } else {
                            html += '<li><span>' + (i + 1) + '</span></li>';
                        }
                    }

                    html += '<li class="nextBtn"><a href="#" aria-label="Next">&raquo;</a></li>' +
                        '<li class="allpage"><a href="##">共' + maxPages2 + '页</a></li>';



                    $(".category").empty().append(html);
                    $("#category .title").nextAll().remove();
                    $("#category").append(list)
                }
            })
        }

        $(".category").on("click", 'li span', function() {
            cateNum = Number($(this).html());
            category(cateNum)
        })
        $(".category").on("click", '.prevBtn', function() {
            cateNum = cateNum > 1 ? cateNum - 1 : 1;
            category(cateNum)
        })
        $(".category").on("click", '.nextBtn', function() {
            cateNum = cateNum < maxPages2 ? cateNum + 1 : maxPages2;
            category(cateNum)
        })
        $(".category").on("click", '.allpage', function() {
            cateNum = maxPages2;
            category(cateNum)
        });

        $("#category").on('click', '.delete', function() {
            var obj = $(this);
            var id = obj.parent().siblings('.id').html();
            $.ajax({
                url: '/api/category/delete?id=' + id,
                type: 'get',
                dateType: 'json',
                success: function(rlt) {
                    if (rlt.code == 200) {
                        obj.siblings('span').fadeIn();
                        setTimeout(function() {
                            window.location.reload();
                        }, 500)
                    }
                }
            })
        })
    }
}
var admin_index = { //后台首页
    list: function() {
        $.ajax({
            url: '/api/admin/category?sort=1',
            type: 'get',
            dateType: 'json',
            success: function(rlt) {
                if (rlt.code == 200) {
                    var html = '';
                    var color = ['#428bca', '#5cb85c', '#5bc0de', '#f0ad4e', '#d9534f'];
                    for (var i = 0; i < rlt.list.length; i++) {
                        html += '<div class="jumbotron col-md-3 col-xs-3" style="background:' + color[i] + '">' +
                            '<h1><a href="##">' + rlt.list[i].name + '</a></h1>' +
                            '</div>';
                    }
                    $(".boxs").append(html)
                }
            }
        })
    }
}
var content = {
    add: function(cate, bools) { //内容添加
        $.ajax({ //获取列表分类信息
            url: '/api/admin/category?sort=1&pagenum=20&page=1',
            type: 'get',
            dateType: 'json',
            success: function(rlt) {
                if (rlt.code == 200) {
                    var html = '';
                    if (bools) {
                        for (var i = 0; i < rlt.list.length; i++) {
                            if (rlt.list[i].name == cate) {
                                html += '<option selected="true">' + rlt.list[i].name + '</option>';
                            } else {
                                html += '<option>' + rlt.list[i].name + '</option>';
                            }
                        }
                    } else {
                        for (var i = 0; i < rlt.list.length; i++) {
                            html += '<option>' + rlt.list[i].name + '</option>';
                        }
                    }
                    $(".content_add .form-control").append(html);

                }
            }
        })
        var boolsCttAdd = true;

        $(".content_add.add .btn").click(function() { ///分类信息添加
            if (!boolsCttAdd) {
                return;
            }
            boolsCttAdd = false
            var contentJSON = {};
            var cate = $('.content_add').find('[name=cate]').val();
            var title = $('.content_add').find('[name=title]').val();
            var intro = $('.content_add').find('[name=intro]').val();
            var content = $('.content_add').find('[name=content]').val();
            var time = new Date().getTime();

            contentJSON.cate = cate;
            contentJSON.title = title;
            contentJSON.intro = intro;
            contentJSON.content = content;
            contentJSON.time = time;

            $.ajax({
                url: '/api/content/add',
                type: 'post',
                data: contentJSON,
                dateType: 'json',
                success: function(rlt) {
                	boolsCttAdd = true;	
                    if (rlt.code == 200) {
                        setTimeout(function() {
                            window.location.href = 'http://localhost:8080/admin/content_index'
                        }, 500)
                    } else {
                        alert(rlt.msg)
                    }
                }
            })
        })
    },
    getMsg: function() { //获取内容列表
        var getMsgNum = new Number(1);
        var maxPages3 = new Number();
        getMsgFun(getMsgNum)

        function getMsgFun(num) {
            $.ajax({
                url: '/api/content/list?page=' + num + '&cate=*',
                dataType: 'json',
                type: 'get',
                success: function(rlt) {
                    maxPages3 = rlt.pages;
                    var html = '';
                    for (var i = 0; i < rlt.list.length; i++) {

                        var date = new Date(rlt.list[i].time);
                        var y = date.getFullYear();
                        var mon = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
                        var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
                        var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
                        var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
                        var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
                        var time = y + '-' + mon + '-' + d + ' ' + h + ':' + m + ':' + s;

                        html += '<tr>' +
                            '<td class="id">' + rlt.list[i]._id + '</td>' +
                            '<td>' + rlt.list[i].cate + '</td>' +
                            '<td><a href="/admin/content_msg?id='+rlt.list[i]._id+'">'+rlt.list[i].title + '</a></td>' +
                            '<td>' + rlt.list[i].author + '</td>' +
                            '<td>' + time + '</td>' +
                            '<td>' + rlt.list[i].read + '</td>' +
                            '<td>' + rlt.list[i].commont.length + '</td>' +
                            '<td>' + rlt.list[i].like + '</td>' +
                            '<td class="cz"><a href="/admin/content_edit?id=' + rlt.list[i]._id + '">修改</a> | <a class="delete" href="javascript:void(0)">删除</a><span>删除成功！</span></td>' +
                            '</tr>';
                    }

                    var pagebar = '<ul class="pagination">' +
                        '<li class="prevBtn"><a href="#" aria-label="Previous">&laquo;</a></li>';
                    for (var i = 0; i < rlt.pages; i++) {
                        if ((i + 1) == num) {
                            pagebar += '<li class="active"><span>' + (i + 1) + '</span></li>';
                        } else {
                            pagebar += '<li><span>' + (i + 1) + '</span></li>';
                        }
                    }

                    pagebar += '<li class="nextBtn"><a href="#" aria-label="Next">&raquo;</a></li>' +
                        '<li class="allpage"><a href="##">共' + rlt.pages + '页</a></li>';

                    $('#contentList .title').nextAll().remove();
                    $("#contentList").append(html);
                    $(".contentListpg").empty().append(pagebar);
                }
            })
        }
        $(".contentListpg").on("click", 'li span', function() {
            getMsgNum = Number($(this).html());
            getMsgFun(getMsgNum)
        })
        $(".contentListpg").on("click", '.prevBtn', function() {
            getMsgNum = getMsgNum > 1 ? getMsgNum - 1 : 1;
            getMsgFun(getMsgNum)
        })
        $(".contentListpg").on("click", '.nextBtn', function() {
            getMsgNum = getMsgNum < maxPages3 ? getMsgNum + 1 : maxPages3;
            getMsgFun(getMsgNum)
        })
        $(".contentListpg").on("click", '.allpage', function() {
            getMsgNum = maxPages3;
            getMsgFun(getMsgNum)
        });
        $("#contentList").on('click', '.delete', function() { //删除内容
            var obj = $(this);
            var id = obj.parent().siblings('.id').html();
            $.ajax({
                url: '/api/content/delete?id=' + id,
                type: 'get',
                dateType: 'json',
                success: function(rlt) {
                    if (rlt.code == 200) {
                        obj.siblings('span').fadeIn();
                        setTimeout(function() {
                            window.location.reload();
                        }, 500)
                    }
                },
                error: function(a, b) {
                    console.log('error')
                }
            })
        });
    },
    readMsg: function() {
        $.ajax({
            url: '/api/content/list?page=',
            dataType: 'json',
            type: 'get',
            success: function(rlt) {
            	console.log(rlt)
            }

        })
    },
    like : function(){
        $('.like').on('click',function(){
            $.ajax({
                url : '/api/commont/like?id='+GetRequest().id,
                type : 'get',
                success : function(rlt){
                    console.log(rlt)
                    if( rlt.code == 200 ){
                        $(".like span").html(rlt.like)
                    }
                },
                error : function(){
                    alert('error')
                }
            })
        })
    },
    addCommont: function() {	//添加评论
        $(".commont-box .btn").click(function() {
            var txt = $(".commont-box textarea").val();
            if( txt == '' ){
            	alert('请添加评论！');
            	return;
            }
            var urls = GetRequest();
            var u = {
                txt : txt,
                id : urls.id
            }
            $.ajax({
                url: '/api/commont/add',
                type: 'post',
                data: u,
                dataType: 'json',
                success: function(rlt) {
                    if( rlt.code == 200 ){
                    	content.getCommont();
                    	$(".commont-box textarea").val('');
                    }else if(rlt.code == 201){
                        $(".error-msg").html(rlt.msg).fadeIn();
                    }
                }
            })
        })
    },
    getCommont: function() {    //获取评论
    	var page =1;
    	var urls = GetRequest();
    	getCom(page);
    	function getCom(pages){
	    	$.ajax({
	    		url : '/api/commont/getCommont?id='+urls.id,
	            type: 'get',
	            dataType: 'json',
	            success: function(rlt) {
                    console.log(rlt)
	                var len = rlt.data.length;
				    var pageNum = 10;
				    var prevNum = (pages-1)*pageNum;
				    var nextNum = prevNum+pageNum;
				    pages = page;

	                if( nextNum>=len ){
				    	prevNum = (pages-1)*pageNum;
				    	nextNum = prevNum+pageNum;
	                }


	                var pageLen = Math.ceil(len/pageNum);
	                
	                if( nextNum>=len ){
	                	page--
	                	nextNum = len;
	                	pages = pageLen
	                }


	                if(rlt.code ==200 ){
	                	var html = '';
	                	for(var i = prevNum; i<nextNum; i++){

		                    var date = new Date(rlt.data[i].time);
		                    var y = date.getFullYear();
		                    var mon = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
		                    var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
		                    var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
		                    var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
		                    var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
		                    var time = y + '-' + mon + '-' + d + ' ' + h + ':' + m + ':' + s;

                            nicheng = rlt.data[i].nicheng == '管理员' ? '<span class="blue">管理员<span>' : rlt.data[i].nicheng
	                		html+='<li>'+
									'<div class="commont-msg clearfix">'+
										'<h4>'+nicheng+'</h4>'+
										'<span>'+time+'</span>'+
									'</div>'+
									'<p>'+rlt.data[i].content+'</p>'+
								'</li>'
	                	}

                    	$(".commont-box .comTop span i").html(len);
	                	$(".toolbar .commont span").html(len);
	                	$(".commont-list").empty().append(html);
	                	$(".toolbar .time span").html(time);
	                	$(".pagebar .pagenum").html(pages+"/"+pageLen);
		                
	                }
	            }

	    	})
		}
		$(".pagebar .nextBtn").click(function(){
			page++;
			getCom(page);
		})
		$(".pagebar .prevBtn").click(function(){
			page--;
			if ( page < 1 ){
				page=1
			}
			getCom(page);
		})
    }
}

function GetRequest() {
    var url = location.search; //获取url中"?"符后的字串 
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}
