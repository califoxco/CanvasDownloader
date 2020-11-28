var urls = []
var fileurls = []
var listenerStatus = true; 
var binaryData = [];
var finishedDownloading = true;

chrome.webRequest.onSendHeaders.addListener(function(wr){
    if (listenerStatus){
        if(wr.url.match('mp4/seg')){
            urls.push(wr.url)

            chrome.tabs.query({currentWindow:true, active:true},
                function(tabs){
                    chrome.tabs.sendMessage(tabs[0].id, {downloadlink: wr.url})
                })
        }
    }
},{
    urls: ["<all_urls>"],
    types:["xmlhttprequest"]
}, ["requestHeaders"])


/* chrome.runtime.onMessage.addListener(function (request) {
    if (request.downloadInit){
        chrome.downloads.download({
        url: urls[urls.length-1]
        })
    }
}) */

chrome.runtime.onMessage.addListener(function (request) {
    if (request.downloadInit){
        // create file urls
        for(var i = 1; i<2048; i++){
            fileurls.push(urls[urls.length-1].replace(/seg-\d{1,2}/,("seg-"+i)));
        }
        console.log({fileurls})
        finishedDownloading = false;
        startDownload(0)
    }
})

function startDownload(counter){
    if (counter < fileurls.length){
        var xhr = new XMLHttpRequest()
        listenerStatus = false
        xhr.open('GET', fileurls[counter], true)
        xhr.responseType = "blob"
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState == 4 && xhr.status === 200) {

                var blob = xhr.response
                binaryData.push(blob);
                console.log("currentStatus : "+xhr.status)
                console.log("completed "+ counter)
                startDownload(counter+1)
            }
            else if ((xhr.status === 404 || xhr.status === 400) && !finishedDownloading){
                finishedDownloading = true;
                var a = document.createElement('a');
                a.href = window.URL.createObjectURL(new Blob(binaryData, {type: "mp4"}))
                var fileName = Date.now()+".mp4";
                a.download = fileName;
                a.dispatchEvent(new MouseEvent('click'))
                listenerStatus = true;
                urls = []
                fileurls = []
                binaryData = [];
                return
            }
        }
        console.log("starting download "+counter)
        xhr.send()
    }
    else {
        if (!finishedDownloading){
            finishedDownloading = true;
            var a = document.createElement('a');
            a.href = window.URL.createObjectURL(new Blob(binaryData, {type: "mp4"}))
            var fileName = Date.now()+".mp4";
            a.download = fileName;
            a.dispatchEvent(new MouseEvent('click'))
            listenerStatus = true
            urls = []
            fileurls = []
            binaryData = [];
            return
        }
    }
}
