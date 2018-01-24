## HSL/MPEG-DASH Player
Online player for HSL and MPEG-DASH.

# Quick Start for Users
Insert this code where player should be (e.g. id = 'dipl'):
```
<!-- Player / Плеер -->
<div id="dipl" class="di_player">
	<div class="di_alert">To launch video player Javascript is needed.<br \>Для проигрывания видео необходим Javascript.</div>
	<video></video>
	<div class="di_panel">
		<div class="di_ppause">
			<a class="di_play"></a>
		</div>
		<div class="di_ctime">00:00:00</div>
		<div class="di_progress" onclick="settime(event)">
			<div class="di_pb" style="width: 1%;"></div>
		</div>
		<div class="di_ft">00:00:00</div>
	</div>
</div>
```

And add this at the end of the body, like this:
```
<body>
...
	<!-- Libraries -->
	<script src="https://cdn.dashjs.org/latest/dash.all.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
	<script src="http://fous.name/player/ess.3.2.js"></script>
	<!-- Player -->
	<script type="text/javascript" src="http://fous.name/player/hlsmpd.js"></script>
	<script type="text/javascript">
		var url = 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8';
		var autoplay = false;
		var player = new hlsmpd('dipl', url, autoplay);
	</script>
</body>
```

For more information see: [DEMO](http://fous.name/player/), index.html and hlsmpd.js in Git.

Создан на основе:
[hls.js](https://github.com/video-dev/hls.js/) и [dash.js](https://github.com/Dash-Industry-Forum/dash.js)
