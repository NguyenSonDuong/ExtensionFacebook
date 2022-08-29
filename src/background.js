'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  // const tab = tabs[0];

  // var callback = function(details) {
  //   alert(details);
  //   return {requestHeaders: details.requestHeaders};
  // };
  // var filter = {urls: ["<all_urls>"]};
  // var opt_extraInfoSpec = [ "requestHeaders"];
  
  // chrome.webRequest.onBeforeSendHeaders.addListener(
  //       callback, filter, opt_extraInfoSpec);
});


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
