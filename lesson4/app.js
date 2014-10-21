var cheerio    = require('cheerio');
var superAgent = require('superagent');
var eventproxy = require('eventproxy');
var express    = require('express');
var url        = require('url');

var targetUrl = 'http://www.qiushibaike.com/';

var app = express();

app.get('/', function (req, res) {
    getData(function (data) {
        res.send(data);
    });
});

/**
 * 获取糗事百科的第一页链接&内容&评论
 * @param {function} cb
 * @return {array}
 */
function getData(cb) {
    superAgent.get(targetUrl).end(function (err, res) {
        if(err) {return console.error(err)}

        var urls = [];
        var $ = cheerio.load(res.text);

        // 获取所有链接
        $('.qiushi_comments').each(function (index, element) {
            var $element = $(element);
            var href = url.resolve(targetUrl, $element.attr('href'));

            urls.push(href);
        });

        // 获取链接内的第一条评论
        var ep = new eventproxy();

        // 批量请求链接
        urls.forEach(function (url) {
            superAgent.get(url).end(function (err, res) {
                if(err) {return console.error(err)}

                // 提交结果到ep
                ep.emit('finishOfComment', [url, res.text]);
            });
        });

        // 处理接收的结果
        ep.after('finishOfComment', urls.length, function (results) {
            results = results.map(function (pair) {
                var $ = cheerio.load(pair[1]);

                return {
                    url: pair[0],
                    content:  $('.content').text().trim(),
                    comment1: $('.comment-block .replay .body').eq(0).text().trim()
                }
            });

            // callback
            cb(results);
        });
    });
}


app.listen(3000, function () {
	console.log('app is running at port 3000');
});
