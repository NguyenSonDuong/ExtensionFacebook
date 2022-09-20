'use strict';
let tvGroups = document.getElementById('tvGroups');
let tvPosts = document.getElementById('tvPosts');
let progressBar = document.getElementById('progressBar');

(function() {
  
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log(message);
    if(message.type == 'PROCESS_LOAD'){
      progressBar.setAttribute("aria-valuemax",message.data.count)
      progressBar.setAttribute("aria-valuenow",message.data.process)
    }
});
document.getElementById('btnScan').addEventListener('click', function (e) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        type: "RUN"
      }
    , function(response) {
      console.log(response.farewell);
    });
  });
  
})
window.onload = function() {
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




