var newLink;
console.log("CanvasDownloader extension injected")
chrome.runtime.onMessage.addListener(function (request) {
    if (request.downloadlink != null){
        newLink = request.downloadlink;
    }
    else if (request.popupMessage != null){
        if (newLink !=null){
            alert("Starting to Download")
            chrome.runtime.sendMessage({downloadInit: true});
        }
        else {
            alert("nothing to download")
        }
    }
})
