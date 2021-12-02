require('dotenv').config();
const fetch = require('node-fetch');
require("dotenv").config();
var util = require('util');
var http = require('http');
var HttpStatus = require('http-status-codes');
var express = require('express');
var telegram = require('telegram-bot-api');

const stockOnly = false;
const userId = process.env.TGTG_USER_ID;
//const userToken = process.env.TGTG_USER_TOKEN;
const telegramToken = process.env.TELEGRAM_API_TOKEN;
const email = process.env.TGTG_EMAIL;
const password = process.env.TGTG_PWD;
const access_token = process.env.TGTG_TOKEN;
let oldStr = "";

const url='https://apptoogoodtogo.com/api';

var app = express();app.get('/', function (req, res) {
  res.send('Hello World!');
});

var api = new telegram({
    token: telegramToken,
});
const chatId = -363155949

/*
function loginByEmail(){

    var request = require('request');
    var options = {
      'method': 'POST',
      'url': `${url}/auth/v2/loginByEmail`,
      'headers': {
        'Content-Type': 'application/json'
      },
      body: `{\"device_type\":\"UNKNOWN\",\"email\":\"${email}\",\"password\":\"${password}\"}`
    
    };

    request(options, function (error, response) {
      if (error) throw new Error(error);
      var json = JSON.parse(response.body); 
      console.log("Got refresh token: " + json.refresh_token);
      refreshToken(json.refresh_token);

    });

};


function refreshToken(refresh_token){

    var request = require('request');
    var options = {
    'method': 'POST',
    'url': `${url}/auth/v1/token/refresh?User-Agent=TGTG/20.9.2 Dalvik/2.1.0 (Linux; U; Android 9; Moto G Build/PQ1A.181205.006)&Accept-Language=en-GB&Content-Type=application/json; charset=utf-8&Host=apptoogoodtogo.com&Connection=close&Accept-Encoding=gzip, deflate`,
    'headers': {
        'Content-Type': 'application/json'
    },
    body: `{\"refresh_token\":\"${refresh_token}\"}`

    };
    request(options, function (error, response) {
        if (error) throw new Error(error);

        var json = JSON.parse(response.body); 
        console.log("Got access token: " + json.access_token);
      
    
        fn60sec(json.access_token);
        setInterval(fn60sec, 60*1000);
    
        setInterval(function() {
        checkFavorites(json.access_token);
        //}, 60 * 1000); // 60 * 1000 milsec
        }, 120 * 1000); // 60 * 1000 milsec
  

    });

}
*/
function checkFavorites(access_token){

    var axios = require('axios');
    var data = `{"user_id":"${userId}","origin":{"latitude":41.4150419,"longitude":2.1577982},"radius":30.0,"page_size":100,"page":1,"discover":false,"favorites_only":true,"item_categories":[],"diet_categories":[],"with_stock_only":${stockOnly},"hidden_only":false,"we_care_only":false}`;
    
    var config = {
      method: 'post',
      url: `${url}/item/v7/`,
      headers: { 
        'Cookie': 'datadome=5Mw8-dI-oHWoh6nITLamuWQoVACw2.zlJvWc.5njmP_h60FCeoaNG3RTAnsK.~dwhIeb22BmJiHEfNKYar5pSwL5.PYfvoK11Sb6tC48fD_5x1QXzCjG6bJ-n7THEai; datadome=uknuyh3-BcanNwm9fY3TweX6XgaHrz6X~vWiu8-TS.qNsQllW3TAvo30~hYAs_as47PyB2w9QGGOgaqH64a3hvs.KzQSC0HSF2-2oHLWAQLIE4n2e4K00Hi8zYEgCwX', 
        'Accept': 'application/json', 
        'User-Agent': 'TGTG/21.11.1 Dalvik/2.1.0 (Linux; U; Android 9; Moto G Build/PQ1A.181205.006)', 
        'Accept-Language': 'en-GB', 
        'Authorization': `Bearer ${access_token}`, 
        'Content-Type': 'application/json; charset=utf-8', 
        'Content-Length': '262', 
        'Host': 'apptoogoodtogo.com', 
        'Connection': 'close', 
        'Accept-Encoding': 'gzip, deflate'
      },
      data : data
    };

      axios(config)
      .then(function (response) {

        var json = response.data; 

         if (json.items){
            console.log("found items");
            const dt = new Date();
            console.log('{ "timestamp": "' + dt.toUTCString() + '", "status": "' 
                + HttpStatus.getStatusText(parseInt(response.status)) + '", "items": ' 
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
         else console.log("no items found"); 
        
      })
      .catch(function (error) {
        console.log(error);
      });


}


function fn60sec(access_token) {
    // runs every 60 sec and runs on init.
    checkFavorites(access_token);
    }



app.listen(3000, function () {

    console.log('Tg2g Notifier listening on port 3000!');

    fn60sec(access_token);
    setInterval(fn60sec, 60*1000);

    setInterval(function() {
    checkFavorites(access_token);
    //}, 60 * 1000); // 60 * 1000 milsec
    }, 120 * 1000); // 60 * 1000 milsec

});
