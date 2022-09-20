'use strict';
let dataComment = [];
let dataNotJson = "";
let timeOut = 3500;
const regexUserID = /\"USER_ID\"\:\"([0-9]+)\"/gm;
const regexToken = /\"token\":\"(.+?)\"/gm;
const regexidPost = /www\.facebook\.com\/groups\/(.+?)\/posts\/([0-9]+?)\//gm;
const regexidGroups = /content="fb:\/\/group\/([0-9]+)"/gm;
let useid;
let token;
let groupsID;
let postid;
let isConnect = false;


function SendmessToPopup(mess){
  chrome.runtime.sendMessage(mess, function (response) {
      console.dir(response);
  });
}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (isConnect && request.type == 'RUN') {
      if (document.URL.includes("facebook.com")) {
        API(useid, token, "", groupsID+"_"+postid); 
      } else { 
          alert("Mở trang facebook rồi hãng chạy code nhá 😑"); 
      }
    }
    if(request.type == 'GET_DATA'){
      console.log("XIn chào");
        try{
          let sourceData = document.documentElement.innerHTML;
          useid = regexUserID.exec(sourceData)[1];
          token = regexToken.exec(sourceData)[1];
          postid = regexidPost.exec(document.URL)[2];
          groupsID = regexidGroups.exec(sourceData)[1];
          isConnect = true;
          console.log(useid + "==" + token + "==" + groupsID+"_"+postid);
          sendResponse({
            type:'SEND_DATA',
            status:'success',
            data: {
              post_id:postid,
              groups_ID:groupsID,
              token_user:token
            }
          });
        }catch(e){  
          sendResponse({status: "error"});
          console.log(e);
        }
    }
  }
);



let downloadCSVFromJson = (filename, arrayOfJson) => {
  // convert JSON to CSV
  const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
  const header = Object.keys(arrayOfJson[0])
  let csv = arrayOfJson.map(row => header.map(fieldName => 
  JSON.stringify(row[fieldName], replacer)).join(','))
  csv.unshift(header.join(','))
  csv = csv.join('\r\n')

  // Create link and download
  var link = document.createElement('a');
  link.setAttribute('href', 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(csv));
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
let API = (user_id, token, end_cursor, id_post) => {
    fetch("https://www.facebook.com/api/graphql/",
        {
            "headers": {
                "accept": "/",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/x-www-form-urlencoded",
                "sec-ch-prefers-color-scheme": "light",
                "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"", "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-origin",
            },
            "referrer": document.URL,
            "referrerPolicy": "origin-when-cross-origin",
            "body": 'av=' + user_id + '&__user=' + user_id + '&__a=1&fb_dtsg=' + token + '&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometUFICommentsProviderForDisplayCommentsQuery&variables={"UFI2CommentsProvider_commentsKey":"CometGroupPermalinkRootFeedQuery","__false": false,"__true": true,"after":"' + end_cursor + '","before": null,"displayCommentsContextEnableComment": null,"displayCommentsContextIsAdPreview": null,"displayCommentsContextIsAggregatedShare": null,"displayCommentsContextIsStorySet": null,"displayCommentsFeedbackContext": null,"feedLocation":"GROUP_PERMALINK","feedbackSource": 2,"first": 50,"focusCommentID": null,"includeHighlightedComments": false,"includeNestedComments": true,"initialViewOption":"TOPLEVEL","isInitialFetch": false,"isPaginating": true,"last": null,"scale": 1.5,"topLevelViewOption": null,"useDefaultActor": false,"viewOption": null,"id":"' + btoa("feedback:" + id_post) + '" }&server_timestamps=true&doc_id=5315135448570862',
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        }).then(
            (data) => { return data }).then(
                (data2) => {
                    data2.text().then(
                        (data) => {
                            console.log(data);
                            console.log("====================================================");
                            try {
                                let obj = JSON.parse(data);
                                if (obj["data"] == undefined || obj["data"] == null) {
                                    timeOut += 1000;
                                    console.log(timeOut);
                                    setTimeout(() => {
                                        API(user_id, token, end_cursor, id_post);
                                    }, timeOut); return;
                                } 
                                timeOut = 3500; 
                                for (let item of obj["data"]["node"]["display_comments"]["edges"]) { 
                                  dataComment.push(
                                  { 
                                      "username": item["node"]["author"]["name"], 
                                      "message": (item["node"]["body"] == undefined || item["node"]["body"] == null) ? "" : item["node"]["body"]["text"], 
                                      "link_user": item["node"]["author"]["url"], 
                                      "link_comment": item["node"]["url"] ,
                                  }); 
                                } 
                                SendmessToPopup({
                                  type:"PROCESS_LOAD",
                                  data:{
                                    count:obj["data"]["node"]["display_comments"]["count"],
                                    process:obj["data"]["node"]["display_comments"]["edges"].length
                                  }
                                });
                                if (obj["data"]["node"]["display_comments"]["page_info"]["has_next_page"]) 
                                    setTimeout(() => { 
                                        API(user_id, token, obj["data"]["node"]["display_comments"]["page_info"]["end_cursor"], id_post); 
                                    }, timeOut); 
                                else { 
                                    alert("Quét xong nhận kết quả ở đây"); 
                                    document.getElementById("checkComment08042010").firstChild.firstChild.innerHTML = "Xuất";
                                    downloadCSVFromJson("Comment_"+id_post,dataComment);
                                }
                            } catch (e) { 
                              console.error(e); 
                              let obj = JSON.parse(data.substring(0, data.indexOf('{"label":"VideoPlaye'))); 
                              if (obj["data"] == undefined || obj["data"] == null) { 
                                timeOut += 1000; 
                                console.log(timeOut); 
                                setTimeout(() => { 
                                  API(user_id, token, end_cursor, id_post); 
                                }, timeOut); 
                                return; 
                              } 
                              console.log(obj);
                              timeOut = 3500; 
                              for (let item of obj["data"]["node"]["display_comments"]["edges"]) { 
                                dataComment.push(
                                { 
                                  "username": item["node"]["author"]["name"], 
                                  "message": (item["node"]["body"] == undefined || item["node"]["body"] == null) ? "" : item["node"]["body"]["text"], 
                                  "link_user": item["node"]["author"]["url"], 
                                  "link_comment": item["node"]["url"] ,
                                }); 
                                // dataNotJson += item["node"]["author"]["name"] + "\t" + item["node"]["author"]["id"] + "\t" + item["node"]["author"]["url"] + "\t" + ((item["node"]["body"] == undefined || item["node"]["body"] == null) ? "" : item["node"]["body"]["text"]).replace(/(?:\r\n|\r|\n)/g, "") + "\t" + item["node"]["url"] + "\n";
                              } 
                              SendmessToPopup({
                                type:"PROCESS_LOAD",
                                data:{
                                  count:obj["data"]["node"]["display_comments"]["count"],
                                  process:obj["data"]["node"]["display_comments"]["edges"].length
                                }
                              });
                              console.log(dataComment); 
                              if (obj["data"]["node"]["display_comments"]["page_info"]["has_next_page"]) 
                                setTimeout(() => { 
                                  API(user_id, token, obj["data"]["node"]["display_comments"]["page_info"]["end_cursor"], id_post); 
                                }, timeOut); 
                              else { 
                                alert("Quét xong nhận kết quả ở đây"); 
                                document.getElementById("checkComment08042010").firstChild.firstChild.innerHTML = "Xuất";
                                // JSONToCSVConvertor(dataComment, "Comment_"+id_post,id_post)
                                downloadCSVFromJson("Comment_"+id_post,dataComment);
                                // Download("data.json", JSON.stringify(dataComment)); 
                                // Download("data.txt", dataNotJson); 
                                // document.write(JSON.stringify(dataComment)); 
                              } 
                            }
                        });
                });
}; 
