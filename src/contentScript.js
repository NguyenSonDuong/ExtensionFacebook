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
  async function(request, sender, sendResponse) {
    console.log(request);
    if (isConnect && request.type == 'RUN') {
      if (document.URL.includes("facebook.com")) {
        
        if(!postid || !groupsID)
        {
          postid = request.data.id_post;
          groupsID = request.data.id_groups;
        }
        API(useid, token, "", groupsID+"_"+postid); 
      } else { 
          alert("Mở trang facebook rồi hãng chạy code nhá 😑"); 
      }
    }
    if(request.type == 'RELOAD_PAGE'){
      location.reload();
      sendResponse({
        type:'RELOAD_COMPLETE',
        status:'success',
        data: {
        }
      })
    }
    if(request.type == 'GET_DATA'){
      try{
        let sourceData = document.documentElement.innerHTML;
        useid = regexUserID.exec(sourceData)[1];
        token = regexToken.exec(sourceData)[1];
        
        isConnect = true;

        let regex = /facebook.com(.+$)/gm

        let data = await APIGetInforLink(useid,token,regex.exec(document.URL)[1]);
        postid = data["post_id"];
        groupsID = data["group_id"];
        console.log(useid + "==" + token + "==" + groupsID+"_"+postid);
        //560495758018219
        //  
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

let APIGetInforLink = async (user_id, token,link)=>{
  let res = await fetch("https://www.facebook.com/ajax/navigation/", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/x-www-form-urlencoded",
    "sec-ch-prefers-color-scheme": "light",
    "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "viewport-width": "1707",
    "x-fb-lsd": "iurDPnZayM9LpvINQDVKBU",
    "x-fb-qpl-active-flows": "931594241"
  },
  "referrer": "https://www.facebook.com/",
  "referrerPolicy": "origin-when-cross-origin",
  "body": `client_previous_actor_id=${user_id}&route_url=${link}&routing_namespace=fb_comet&__user=${user_id}&__a=1&dpr=1.5&__ccg=GOOD&__comet_req=15&fb_dtsg=${token}`,
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});
let regexx = /[0-9]+$/gm;
let text = await res.text();
console.log(text);
let txtMail = text.replace("for (;;);","").trim();
let jsonObj = JSON.parse(txtMail);
let postID = "";
let groupID = jsonObj["payload"]["payload"]["result"]["exports"]["hostableView"]["props"]["groupID"];
if(jsonObj["payload"]["payload"]["result"]["exports"]["hostableView"]["props"]["storyID"]){
  let basDecode = atob(jsonObj["payload"]["payload"]["result"]["exports"]["hostableView"]["props"]["storyID"]);
  postID = regexx.exec(basDecode)[0];
  console.log(postID);
}
if(jsonObj["payload"]["payload"]["result"]["exports"]["hostableView"]["props"]["hoistStories"] && jsonObj["payload"]["payload"]["result"]["hostableView"]["props"]["hoistStories"][0]){
  let basDecode = atob(jsonObj["payload"]["payload"]["result"]["exports"]["hostableView"]["props"]["hoistStories"][0]);
  postID = regexx.exec(basDecode)[0];
  console.log(postID);
}
let outputData = {
  group_id: groupID,
  post_id: postID
}

return outputData;
}

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
                                    "author": {
                                      "__typename": item["node"]["author"]["__typename"],
                                      "id": item["node"]["author"]["id"],
                                      "name": item["node"]["author"]["name"],
                                      "gender": "FEMALE",
                                      "link": item["node"]["author"]["url"],
                                      "avatar": ""
                                    },
                                    "url": item["node"]["url"] ,
                                    "__typename": item["node"]["__typename"] ,
                                    "created_time": item["node"]["created_time"],
                                    "message": (item["node"]["body"] == undefined || item["node"]["body"] == null) ? "" : item["node"]["body"]["text"], 
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
                                  downloadCSVFromJson("Comment_"+id_post,dataComment);
                                  SendmessToPopup({
                                    type:"SUCCESS_LOAD",
                                    data:dataComment,
                                    id_groups: id_post.split('_')[0],
                                    name_groups: "",
                                    id_post: id_post.split('_')[1],
                                    create_time: Date.now(),
                                  });
                                }
                            } catch (e) { 
                              let obj = JSON.parse(data.substring(0, data.indexOf('{"label":"VideoPlaye'))); 
                              if (obj["data"] == undefined || obj["data"] == null) { 
                                timeOut += 1000; 
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
                                    "author": {
                                      "__typename": item["node"]["author"]["__typename"],
                                      "id": item["node"]["author"]["id"],
                                      "name": item["node"]["author"]["name"],
                                      "gender": item["node"]["author"]["gender"],
                                      "link": item["node"]["author"]["url"],
                                      "avatar": item["node"]["author"]["profile_picture_depth_1"]["uri"]
                                    },
                                    "url": item["node"]["url"] ,
                                    "__typename": item["node"]["__typename"] ,
                                    "created_time": item["node"]["created_time"],
                                    "message": (item["node"]["body"] == undefined || item["node"]["body"] == null) ? "" : item["node"]["body"]["text"], 
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
                              if (obj["data"]["node"]["display_comments"]["page_info"]["has_next_page"]) 
                                setTimeout(() => { 
                                  API(user_id, token, obj["data"]["node"]["display_comments"]["page_info"]["end_cursor"], id_post); 
                                }, timeOut); 
                              else { 
                                downloadCSVFromJson("Comment_"+id_post,dataComment);
                                SendmessToPopup({
                                  type:"SUCCESS_LOAD",
                                  data:dataComment,
                                  id_groups: id_post.split('_')[0],
                                  name_groups: "",
                                  id_post: id_post.split('_')[1],
                                  create_time: Date.now(),
                                });
                              } 
                            }
                        });
                });
}; 
