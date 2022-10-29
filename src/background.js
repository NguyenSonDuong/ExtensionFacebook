'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

// chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
//   // const tab = tabs[0];

//   // var callback = function(details) {
//   //   alert(details);
//   //   return {requestHeaders: details.requestHeaders};
//   // };
//   // var filter = {urls: ["<all_urls>"]};
//   // var opt_extraInfoSpec = [ "requestHeaders"];

//   // chrome.webRequest.onBeforeSendHeaders.addListener(
// //   //       callback, filter, opt_extraInfoSpec);
// // });
// chrome.action.onClicked.addListener((tab) => {
//     console.log("XIn chào");
//     chrome.tabs.create({ url: "chrome-extension://" + chrome.runtime.id + "/popup.html" }); 
//   });
// chrome.browserAction.onClicked.addListener(function (tab) { 
chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
    if(message.type == 'SUCCESS_LOAD'){
        console.log(message);
        let comments = message;
        let data = await Request(comments);
        let js = JSON.parse(data);
        console.log(js["content"]);
    }
});

function Request(body){

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "id_groups": body.id_groups,
        "name_groups": body.name_groups,
        "id_post": body.id_post,
        "create_time": body.create_time/1000,
        "comments": body.data
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    console.log("Đến đây rồi");
    return fetch("https://kit502.herokuapp.com/api/v1/facebook-comment/create", requestOptions);


    // return new Promise((res,rej)=>{
    //     var data = JSON.stringify({
    //         "id_groups": "",
    //         "name_groups": "",
    //         "id_post": "",
    //         "create_time": 1665393377,
    //         "comments": body
    //     });
      
    //     var xhr = new XMLHttpRequest();
    //     xhr.withCredentials = true;

    //     xhr.addEventListener("readystatechange", function() {
    //         if(this.readyState === 4 || this.status == 200) {
    //             res(this.responseText);
    //         }else{
    //             rej(this.status);
    //         }
    //     });

    //     xhr.open("POST", "https://kit502.herokuapp.com/api/v1/facebook-comment/create");
    //     xhr.setRequestHeader("Content-Type", "application/json");
    //     xhr.send(data);
    // })
    
}

// });
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === 'POP') {
//     const message = `Hi ${
//       sender.tab ? 'Con' : 'Pop'
//     }, my name is Bac. I am from Background. It's great to hear from you.`;

//     // Log message coming from the `request` parameter
//     console.log(request.payload.message);
//     // Send a response message
//     sendResponse({
//       message,
//     });
//   }
// });
