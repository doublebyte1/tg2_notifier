require('dotenv').config();
const fetch = require('node-fetch');
require("dotenv").config();
var util = require('util');
var http = require('http');
var HttpStatus = require('http-status-codes');
var express = require('express');
var telegram = require('telegram-bot-api');

const stockOnly = true;
const userId = process.env.TGTG_USER_ID;
const userToken = process.env.TGTG_USER_TOKEN;
const telegramToken = process.env.TELEGRAM_API_TOKEN;
let oldStr = "";

var app = express();app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {

    console.log('Tg2g Notifier listening on port 3000!');

    var api = new telegram({
        token: telegramToken,
    });
    const chatId = -363155949

    function checkFavorites(){

        var request = require('request');
        var options = {
        'method': 'POST',
        'url': 'https://apptoogoodtogo.com/api/item/v6/',
        'headers': {
            'User-Agent': 'TGTG/20.2.2 Dalvik/2.1.0 (Linux; U; Android 9; Moto G Build/PQ1A.181205.006)',
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json; charset=utf-8',
            'Host': 'apptoogoodtogo.com'
        },
        body: `{\"user_id\":\"${userId}\",\"origin\":{\"latitude\":41.4150093,\"longitude\":2.1579298},\"radius\":5000.0,\"page_size\":100,\"page\":1,\"discover\":false,\"favorites_only\":true,\"item_categories\":[],\"diet_categories\":[],\"pickup_earliest\":null,\"pickup_latest\":null,\"search_phrase\":null,\"with_stock_only\":${stockOnly},\"hidden_only\":false}`

        };
        request(options, function (error, response) { 
        if (error) throw new Error(error);

        var json = JSON.parse(response.body); 
        //console.log(json);
        if (json.items){
            const dt = new Date();
            console.log('{ "timestamp": "' + dt.toUTCString() + '", "status": "' 
                + HttpStatus.getStatusText(parseInt(response.statusCode)) + '", "items": ' 
                    + json.items.length + '}');

            if (json.items.length > 0){
                let str = "<b>Some items are available on:</b>\n";

                for(const store of json.items) {
                    //console.log(store['store']);
                    str+='<u>' + store['store']['store_name'] + '</u>\n';
                }

                if (oldStr !== str){
                    api.sendMessage({
                        chat_id: chatId,
                        text: str,
                        parse_mode: "HTML"
                    })
        
                }
                oldStr = str;


            }
            
         } 
        });

    }

    function fn60sec() {
    // runs every 60 sec and runs on init.
        checkFavorites();
    }
    fn60sec();
    setInterval(fn60sec, 60*1000);


    setInterval(function() {
    checkFavorites();
    }, 60 * 1000); // 60 * 1000 milsec


});
