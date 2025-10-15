//TODO: que haga esto solo si esta grabando?
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
        chrome.scripting.executeScript({
            target: { tabId: tabId, allFrames: true },
            files: ["./content.js"]
        })
            .then(() => {
            })
            .catch(err => console.log(err));
    }
});

// ***** VARIABLES *****

// Globals Variables - You can modify from popup
var newEvent = true;
var events = [];
var rec = false;
var first = true;

// Local Variables - You can only modify from background
let iFrames = [];
let urlTab;

let windowId = null;
let onIframe = {src: null};



chrome.runtime.onMessage.addListener(receiver);
chrome.action.onClicked.addListener(tab => {
    events = [];
    chrome.windows.create({
        url: chrome.runtime.getURL("recorder.html"),
        type: "popup",
        width: 1000,
    }, win => {
        windowId = win.id;
    })
});

/*
Receiver Create the actions done or save all content iFrames

params:
- data: data sent from website, it's may be iFrames or actions
- sender: website information.
- sendResponse: callback to send response to content website
*/
function receiver(data, sender, sendResponse) {
    // console.log("data", data);
    switch (data.message) {
        case "get_events":
            sendResponse(events);
            break;
        case "change_events":
            events = data.events;
            break;
        case "change_first":
            first = data.first;
            break;
        case "change_new_event":
            newEvent = data.newEvent;
            break;
        case "delete_event_by_id":
            try {
                const index = events.findIndex(event => event.uuid === data.id);
                events.splice(index, 1);
                sendResponse(true);
            } catch (error) {
                sendResponse(false);
            }
            break;
        case "view_event_by_id":
            try {
                const index = events.findIndex(event => event.uuid === data.id);
                sendResponse(events[index]);
            } catch (error) {
                sendResponse(false);
            }
            break;
        case "change_event_by_id":
            try {
                const event = events.find(event => event.uuid === data.id);
                if (data.key === "type" && data.value !== 'sendKeyWeb') {
                    event.value = "";
                }
                event[data.key] = data.value;
                sendResponse(true);
            } catch (error) {
                sendResponse(false);
            }
            break;
        case "toggle_rec":
            rec = !rec;
            sendResponse(rec);
            break;
        case "get_new_event":
            sendResponse(newEvent);
            break;
    }
    if (sender?.origin.startsWith("chrome-extension://") || sender?.origin.startsWith("chrome://") || sender?.origin.startsWith("chrome-devtools://")) {
        return;
    }

    if (data.iFrames) {
        iFrames.push(data)
    } else if (rec) { // Only save actions if recorder is active
        if(first){ // is it first action to record?
            first = false;
            urlTab = sender.tab.url;
            let action = new AddressBar("openBrowser", urlTab); // Create open Browser module
            events.push(action)
        }
        if (sender.url !== sender.tab.url) { // True when actions was on an iframe
            if (onIframe.src !== sender.url) {
                loop1: // finding iframe tag
                    for (let page of iFrames) {
                        for (let frame of page.iFrames) {
                            if (frame.src === sender.url) {
                                onIframe = frame; // save the last iframe where it was
                                if (onIframe.baseURI === sender.tab.url) {
                                    events.push(frame);
                                    break loop1
                                }
                            }
                        }
                    }
            }
        }else {
            if (onIframe.src) {
                onIframe = {src: null};
                let action = new Action("swichtodefaultcontent", null);
                events.push(action)
            }
        }
        events.push(data.action);
        newEvent = true;
    }
}


//TODO: tiene que estar en un file separado :C
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
// ***** CLASSES *****
class Action{
    constructor(type, target, defaultSelector='xpath') {
        this.type = type;
        this.uuid = uuidv4(); 
        if(target){
            this.selector = getSelector(target);
            this.value = target.value ? target.value : "";
            this.defaultSelector = defaultSelector;
        }

    }
}

class SwitchToIframe extends Action{
    constructor(type, target, defaultSelector='xpath'){
        super(type, target, defaultSelector);
        this.uuid = uuidv4(); 
        this.src = target.src;
        this.baseURI = target.baseURI;
    }
}

class AddressBar extends Action{
    constructor(type, url) {
        super(type, false);
        this.uuid = uuidv4(); 
        this.selector = {url: url}
        this.value = ""
        this.defaultSelector = "url"
    }
}
