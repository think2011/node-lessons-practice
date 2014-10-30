var async = require('async');

var concurrencyCount = 0;
var fetchUrl = function (url, callback) {
    // delay的值在 2000 以内，是随机数。
    var delay = parseInt((Math.random() * 10000000) % 2000, 10);
    concurrencyCount++;

    console.log('现在的并发数是', concurrencyCount, ',正在抓取', url, ',耗时', delay, '毫秒');
    setTimeout(function () {
        concurrencyCount--;
        callback(null, url + 'html content');
    }, delay);
};

// 伪装30条链接
var urls = [];
for(var i = 0; i < 30; i++) {
    urls.push('http://dataSource_' + i);
}

async.mapLimit(urls, 5, function (url, callback) {
    fetchUrl(url, callback);
}, function (err, result) {
    console.log('final:');
    console.log(result);
});