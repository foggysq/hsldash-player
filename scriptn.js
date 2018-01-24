

// Proto for global usage / Прототип для глобального использования
var p;

// Init for DEMO / Инициализация ДЕМО
function playv() {
	// Selecting source / Выбираем источник видео
	var burl = g('@source');
	switch(true) {
		case burl[0].checked:
			url = g('#vsrc0').value; break;
		case burl[1].checked:
			url = g('#vsrc1').value; break;
		case burl[2].checked:
			url = g('#vsrc2').value; break;		
	}

	// Simple check for URL / Простая проверка адреса
	if(url.length == 0) {
		alert('The source link is empty / Ссылка на источник пуста');
		return;
	}

	// Player Class Init / Инициализация плеера ч/з класс
	// hlsmpd (id of DOM, source, autoplay)
	p = new hlsmpd('dipl', url, true);

	var inps = g('@source');
	for (var i = inps.length - 1; i >= 0; i--) {
		inps[i].disabled = true;
		inps[i].setAttribute('onclick', '');
	}
}