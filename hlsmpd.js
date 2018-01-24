
// КЛАСС ПЛЕЕРА

'use strict';

// new hlsmpd ( id of div element, source link, autoplay = true/false )
class hlsmpd {
	constructor(id, url, autopl) {
		// Get player DOM
		this.player = g('#' + id);// DOM Element
		if (this.player == null) {
			throw 'Can\'t find #' + id;
		}

		// If JS enabled – clear message
		g('.di_alert', this.player)[0].innerHTML = '';
		g('.di_alert', this.player)[0].classList.add('hidd');

		// VARS
		this.started = 0;// Init bool
		this.waittime = 75;// Timeout for first frame
		this.waitlimit = 100;// TO Limit
		this.timing = 7;// Timeout for the next Sec
		this.timinglim = 7;// Limit = 3,5 Sec for 1 Sec
		// this.timingInt - Interval
		// this.status - Pause0/Play1

		// Autoplay
		if(autopl == undefined) {
			this.autoplay = false;
		}else{
			this.autoplay = autopl;
		}

		// URL and extension
		this.url = url;
		url = url.split('.');
		this.form = url[url.length - 1];
		
		// Errors / Ошибки
		this.errno = 0;// Err number
		this.disabledbrowser = "<span>Attention:</span> Your brouser can't play this video – use the last version of Chrome, Opera or Mozilla.<br \><span>Внимание:</span> Ваш браузер не может воспроизвести видео. Используйте Chrome, Opera или Mozilla последней версии.";//1
		this.timeoutexp = "Timeout expired. Something went wrong, try to reload the page or wait a bit more.<br \>Таймаут закончился. Что-то пошло не так, попробуйте перезагрузить страницу или подождите еще.";//2
		this.badconnection = "Download rate is too small. Check the enternet connaction, please.<br \>Скорость загрузки слишком мала. Проверьте соединение с интернетом.";//3

		// Init
		switch(this.form) {

			// MPD
			case 'mpd':
				// If unsupported
				try {
					this.xplayer = dashjs.MediaPlayer().create();
					this.xplayer.initialize(g("video", this.player)[0], this.url, this.autoplay);
				} catch (e) {
					g('.di_alert', this.player)[0].innerHTML = e + '<br \>' + this.disabledbrowser;
					g('.di_alert', this.player)[0].classList.remove('hidd');
					this.errno = 1;
					throw e + this.disabledbrowser;
				}
			break;

			// HLS
			case 'm3u8':
				// If unsupported
				try {
					this.xplayer = g('video', this.player)[0];
					// If browser allow HLS
					if (this.xplayer.canPlayType('application/vnd.apple.mpegurl')) {
						this.xplayer.src = this.url;
						this.xplayer.addEventListener('canplay', this.xplay.bind(this));
					} else if (Hls.isSupported()) {
						var hls = new Hls();
						hls.loadSource(this.url);
						hls.attachMedia(this.xplayer);
						hls.on(Hls.Events.MANIFEST_PARSED, this.xplay.bind(this));
					}
				} catch (e) {
					g('.di_alert', this.player)[0].innerHTML = e + '<br \>' + this.disabledbrowser;
					g('.di_alert', this.player)[0].classList.remove('hidd');
					this.errno = 1;
					throw e + this.disabledbrowser;
				}
			break;
			// Other extension = STOP
			default:
				throw 'Wrong extension: ' + form;
			return;
		}

		// Showing "waiter"
		g('a', g('.di_ppause', this.player)[0])[0].setAttribute('class', 'di_wait');

		// Add events for buttons
		var that = this;
		g('a', g('.di_ppause', this.player)[0])[0].onclick = function() {that.diplay()};
		g('video', this.player)[0].onclick = function() {that.diplay()};
		g('.di_progress', this.player)[0].onclick = function() {that.settime(event)};

		// Init controls
		this.inplayer();
	}
	// Start HLS Player
	xplay() {
		if(this.autoplay) {
			this.xplayer.play();
		}
	}


	// Waiting for head information
	inplayer() {
		// If got...
		if((this.form == 'mpd' && this.xplayer.duration()) || (this.form == 'm3u8' && this.xplayer.duration)) {
			// Set vars
			this.started = 1;
			this.waittime = this.waitlimit;

			// Autoplay
			if(this.autoplay) {
				this.status = 1;
				g('a', g('.di_ppause', this.player)[0])[0].setAttribute('class', 'di_pause');
			}else{
				g('a', g('.di_ppause', this.player)[0])[0].setAttribute('class', 'di_play');
			}

			// Clear messages
			g('.di_alert', this.player)[0].innerHTML = '';
			g('.di_alert', this.player)[0].classList.add('hidd');

			// Starting PBar updater and showing duration
			this.im = setInterval(this.shcurr.bind(this), 500);
			this.iplayer();
		}else{
			// Wait...
			if(this.waittime) {
				this.waittime--;
			}else{
				// If waiting too long
				g('.di_alert', this.player)[0].innerHTML = this.timeoutexp;
				g('.di_alert', this.player)[0].classList.remove('hidd');
				this.errno = 2;
			}
			setTimeout(this.inplayer.bind(this), 100);
		}
	}


	// Basic init of control panel
	iplayer() {
		switch(this.form) {
			case 'mpd':
				g('.di_ft', this.player)[0].innerHTML = this.xplayer.convertToTimeCode(this.xplayer.duration());
			break;
			case 'm3u8':
				g('.di_ft', this.player)[0].innerHTML = this.sectotime(this.xplayer.duration);
				var that = this;
				this.xplayer.addEventListener('seeked', this.hlseeked.bind(this), false);
			break;
		}
		// Init Sec control
		if(this.autoplay) {
			this.timingInt = setInterval(this.timecontrol.bind(this), 500);
		}
	}
	// HLS Seeked -> Init timecontrol
	hlseeked() {
		var st = ['di_play', 'di_pause'];
		g('a', g('.di_ppause', this.player)[0])[0].setAttribute('class', st[this.status]);

		this.timing = this.timinglim;
		this.timingInt = setInterval(this.timecontrol.bind(this), 500);
	}


	// Progress bar auto updating
	shcurr() {
		var nt;
		// PBar changing
		switch(this.form) {
			case 'mpd':
				g('.di_pb', this.player)[0].style.width = this.xplayer.time() / this.xplayer.duration() * 100 + '%';
				nt = this.xplayer.convertToTimeCode( Math.floor(this.xplayer.time()) );
			break;
			case 'm3u8':
				g('.di_pb', this.player)[0].style.width = this.xplayer.currentTime / this.xplayer.duration * 100 + '%';
				nt = this.sectotime( Math.floor(this.xplayer.currentTime) );
			break;
		}
		// Time changing
		if(g('.di_ctime', this.player)[0].innerHTML != nt) {
			this.timing = this.timinglim;
			g('.di_ctime', this.player)[0].innerHTML = nt;
			
			// If too slow Internet - clear this message
			if(this.errno == 3) {
				g('.di_alert', this.player)[0].innerHTML = '';
				g('.di_alert', this.player)[0].classList.add('hidd');
			}
		}
	}
	// Convert Sec to Time format
	sectotime(s) {
		var m = Math.floor(s / 60);
		var h = 0;
		s = Math.floor(s - m * 60);
		if(s < 10) {
			s = '0' + s;
		}
		if(m > 59) {
			h = Math.floor(m / 60);
			m =  Math.floor(m - h * 60);
			if(m < 10) {
				m = '0' + m;
			}
			return h + ':' + m + ':' + s;
		}else{
			return m + ':' + s;
		}
	}


	// Sec control
	timecontrol() {
		if(this.status == 1) {
			// Countdown...
			if(this.timing) {
				this.timing--;
			}else{
				// Time left
				g('.di_alert', this.player)[0].innerHTML = this.badconnection;
				g('.di_alert', this.player)[0].classList.remove('hidd');
				this.errno = 3;
			}
		}
	}


	// Play/Pause button
	diplay() {
		if(this.status == 1) {
			this.xplayer.pause();
			g('a', g('.di_ppause', this.player)[0])[0].setAttribute('class', 'di_play');
			this.status = 0;
		}else{
			this.xplayer.play();
			g('a', g('.di_ppause', this.player)[0])[0].setAttribute('class', 'di_pause');
			this.status = 1;
			// Reset Sec waiting timer
			this.timing = this.timinglim;

			// Play removes all messages
			if(this.errno) {
				g('.di_alert', this.player)[0].innerHTML = '';
				g('.di_alert', this.player)[0].classList.add('hidd');
			}
		}
	}


	// Seeking
	settime(event) {
		var l = g('.di_progress', this.player)[0].offsetWidth;
		var p = event.clientX - this.getOffset(g('.di_progress', this.player)[0]).left;
		// Showing "waiter"
		g('a', g('.di_ppause', this.player)[0])[0].setAttribute('class', 'di_wait');
		clearInterval(this.timingInt);// Stop timecontrol

		switch(this.form) {
			case 'mpd':
				var t = Math.floor(this.xplayer.duration() / l * p);
				this.xplayer.seek(t);
			break;
			case 'm3u8':
				var t = Math.floor(this.xplayer.duration / l * p);
				this.xplayer.currentTime = t;
			break;
		}
		// PBar changes
		g('.di_pb', this.player)[0].style.width = p / l * 100 + '%';

		// Waiting for video...
		setTimeout(this.setting.bind(this), 150);
	}
	// Some "magic" for seeking
	getOffset(elem) {
	    if (elem.getBoundingClientRect) {
		    var box = elem.getBoundingClientRect()

		    var body = document.body
		    var docElem = document.documentElement

		    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
		    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft

		    var clientTop = docElem.clientTop || body.clientTop || 0
		    var clientLeft = docElem.clientLeft || body.clientLeft || 0

		    var top  = box.top +  scrollTop - clientTop
		    var left = box.left + scrollLeft - clientLeft

		    return { top: Math.round(top), left: Math.round(left) }

	    } else {
	        var top=0, left=0
		    while(elem) {
		        top = top + parseInt(elem.offsetTop)
		        left = left + parseInt(elem.offsetLeft)
		        elem = elem.offsetParent
		    }

		    return {top: top, left: left}
	    }
	}


	// Play after seeking
	setting() {
		var st = ['di_play', 'di_pause'];
		// Just for MPD (HLS goes by Event Listener)
		if(this.form == 'mpd') {
			if(this.xplayer.isSeeking()) {
				// Waiting for video...
				if(this.waittime) {
					this.waittime--;
				}else{
					g('.di_alert', this.player)[0].innerHTML = this.timeoutexp;
					g('.di_alert', this.player)[0].classList.remove('hidd');
					this.errno = 2;
				}
				setTimeout(this.setting.bind(this), 150);
			}else{
				// Deleting all messages
				g('.di_alert', this.player)[0].innerHTML = '';
				g('.di_alert', this.player)[0].classList.add('hidd');
				g('a', g('.di_ppause', this.player)[0])[0].setAttribute('class', st[this.status]);

				// Reset time limits
				this.waittime = this.waitlimit;
				this.timing = this.timinglim;
				this.timingInt = setInterval(this.timecontrol.bind(this), 500);
			}
		}
	}


	// Something for future dev.
	get get_extension() {
		return this.form;
	}
	get get_player() {
		return this.xplayer;
	}
}