var $ = jQuery;
var btn = {
	login: $('#login'),
	logout: $('#logout'),
	services: $('#services')
};
var user = {
	name: $('input[name="username"]'),
	password: $('input[name="password"]'),
	auto: $('input[name="auto"]')
};
var aler = $('.alert');
var url = {
	login: 'http://202.204.105.195/cgi-bin/do_login',
	logout: 'http://202.204.105.195/cgi-bin/force_logout',
	services: 'http://202.204.105.195:8800/do_services.php'
};


function post(url, data, fn) {
	data = data || {};
	var content = require('querystring').stringify(data);
	var parse_u = require('url').parse(url, true);
	var isHttp = parse_u.protocol == 'http:';
	var options = {
		host: parse_u.hostname,
		port: parse_u.port || (isHttp ? 80 : 443),
		path: parse_u.path,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': content.length
		}
	};
	var req = require(isHttp ? 'http' : 'https').request(options, function(res) {
		var _data = '';
		res.on('data', function(chunk) {
			_data += chunk;
		});
		res.on('end', function() {
			fn != undefined && fn(_data);
		});
	});
	req.write(content);
	req.end();
}

if(localStorage.username && localStorage.password) {
	user.name.val(localStorage.username);
	user.password.val(localStorage.password);
}

if(localStorage.auto) user.auto.attr('checked', true);

if(user.auto[0].checked) {
	btn.login.click();
}

btn.login.click(function() {
	if (!user.name.val() || !user.password.val()) {
		aler.html('请输入学号和密码！').addClass('display alert-danger');
		setTimeout('aler.removeClass("display")', 1000);
	} else {
		post(url.login, {
			n: 100,
			is_pad: 1,
			type: 1,
			username: user.name.val(),
			password: user.password.val()
		}, function(data) {
			if(data.indexOf('登录成功') == -1) {
				aler.html(data).addClass('display alert-danger');
				setTimeout('aler.removeClass("display")', 1000);
			} else {
				localStorage.username = user.name.val();
				localStorage.password = user.password.val();
				localStorage.auto = user.auto[0].checked;
				aler.html('登录成功').removeClass('alert-danger').addClass('display alert-success');
				setTimeout('aler.removeClass("display")', 1000);
				var gui = require('nw.gui');
				menu = new gui.Menu();
				menu.append(new gui.MenuItem({
					type: 'normal',
					label: '显示',
					click: function() {
						tray.remove();
						tray = null;
						return gui.Window.get().show();
					}
				}));
				menu.append(new gui.MenuItem({
					type: 'normal',
					label: '退出',
					click: function() {
						return gui.Window.get().close();
					}
				}));
				var tray = new gui.Tray({
					icon: 'menu_icon.png',
					menu: menu
				});
				tray.on('click', function() {
					tray.remove();
					tray = null;
					return gui.Window.get().show();
				});
				gui.Window.get().hide();
			}
		});
	}

});


btn.logout.click(function() {
	post(url.logout, {
		drop: 0,
		n: 1,
		type: 1,
		username: user.name.val(),
		password: user.password.val()
	}, function(data) {
		switch(data) {
	 		case "user_tab_error":
	 			var message = "认证程序未启动";
	 			break;
	 			
	 		case "username_error":
	 			var message = "用户名错误";
	 			break;
	 			
	 		case "password_error":
	 			var message = "密码错误";
	 			break;
	 			
	 		case "logout_ok":
	 			var message = "注销成功，请等1分钟后登录。";
	 			aler.html(message).removeClass('alert-danger').addClass('display alert-success');
	 			setTimeout('aler.removeClass("display")', 1000);
	 			return false;
	 			break;
	 			
	 		case "logout_error":
	 			var message = "您不在线上";
	 			break;
	 			
	 		default:
	 			var message = "找不到认证服务器";
	 			break;		
	 	} 	
	 	aler.html(message).addClass('display alert-danger');
		setTimeout('aler.removeClass("display")', 1000);
	});
});