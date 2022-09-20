'use strict';
let tvGroups = document.getElementById('tvGroups');
let tvPosts = document.getElementById('tvPosts');
let progressBar = document.getElementById('progressBar');
let progress = document.getElementById('progress');
let notifi = document.getElementById('notifi');
let btnReloadPage = document.getElementById('btnReloadPage');
let countProcess = 0;
(function() {
  
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if(message.type == 'PROCESS_LOAD'){
      console.log(message);
      countProcess += message.data.process;
      progressBar.setAttribute("aria-valuemax",message.data.count);
      progressBar.setAttribute("aria-valuenow",countProcess);
      progressBar.style.width = ((countProcess/message.data.count)*100).toFixed(0) +"%";
    }
    if(message.type == 'SUCCESS_LOAD'){
      notifi.style.display = 'block';
    }
});
document.getElementById('btnScan').addEventListener('click', function (e) {
  countProcess = 0;
  progress.style.display = 'block';
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        type: "RUN"
      }
    , function(response) {
    });
  });
  
})
btnReloadPage.addEventListener('click', function (e) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        type: "RELOAD_PAGE"
      }
    , function(response) {
        if(response.type == 'RELOAD_COMPLETE'){
            setTimeout(GetUUID,2000);
        }
    });
  });
  
})
window.onload = function() {
    GetUUID();
}
function GetUUID(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, 
          {
            type: "GET_DATA"
          }
        , function(response) {
            console.log(response);
            if(response.status == 'success') {
              tvGroups.value = response.data.groups_ID;
              tvPosts.value = response.data.post_id;
            }
        });
      });
}
})();




