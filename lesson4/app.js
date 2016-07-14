/**
 * Created by 小熊 on 2016/7/11.
 */

//cnodejs.org 网站有并发连接数的限制，所以当请求发送太快的时候会导致返回值为空或报错

var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var express = require('express');
var url = require('url');
//var app = express();
var cnodeUrl = 'http://cnodejs.org/';
superagent.get(cnodeUrl)
.end(function (err,res){
        if(err) {
            return console.error(err);
        }
        var topicUrls = [];
        var $ = cheerio.load(res.text);
        $('#topic_list .topic_title').each(function (idx,element) {
            var $element = $(element);
            var href = url.resolve(cnodeUrl,$element.attr('href'));
            topicUrls.push(href);
        });
        //console.log($);
        var ep = new eventproxy();
        ep.after('topic_html',topicUrls.length,function (topics) {
            topics = topics.map(function (topicPair){
                //console.log(topicPair);
                var topicUrl = topicPair[0];
                var topicHtml = topicPair[1];
                var $ = cheerio.load(topicHtml);
                var userinfo = $('.user_info .dark').attr('href');
                var c = 'http://cnodejs.org/user/AndyLeeCN'

                //console.log(userinfo);
                var j = [];
                superagent.get(c)
                    .end(function (err,r) {
                        //console.log(r.text);
                        var a =cheerio.load(r.text);
                        jifen1 =[];
                        var jifen = a('.user_profile').find('span').html();
                        j.push(jifen);
                        //console.log(j);

                    });
                //console.log(j);

                return({
                    title: $('.topic_full_title').text().trim(),
                    href: topicUrl,
                    comment1: $('.reply_content').eq(0).text().trim(),
                    author1: $('.user_info .dark').html()
                    //jifen: j
                });
                //console.log(j);
            });
            console.log('final:');
            console.log(topics);

        });
        topicUrls.forEach(function (topicUrl) {
            superagent.get(topicUrl)
                .end(function (err,res) {
                    console.log('fetch' + topicUrl + 'successful');
                    ep.emit('topic_html',[topicUrl,res.text]);
                });
        });
    });
//app.listen(3000,function(req,res) {
//    console.log('app is running at port 3000');
//})