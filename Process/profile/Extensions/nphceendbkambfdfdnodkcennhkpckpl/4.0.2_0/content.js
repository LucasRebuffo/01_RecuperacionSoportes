
/*
Javascript File with popup windows logic

Use variables of robot.js and utils.js files

 */

// UTILS
// ***** CLASSES *****
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
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

function getSelector(element) {
    return {
        id: element.id,
        className: element.className,
        xpath: getPathTo(element),
        tagName: element.tagName,
        name: element.name
    };
}

function getPathTo(element) {
    if (element.tagName.toLowerCase() === "html")
        return element.tagName;
    let ix = 0;
    if (element.parentNode) {
        let siblings = element.parentNode.childNodes;
        for (let i = 0; i < siblings.length; i++) {
            let sibling = siblings[i];
            if (sibling === element)
                return getPathTo(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
                ix++;
        }
    }
}


var isSelection = false;

// ***** LISTENERS ******
document.addEventListener('click', getClick);
document.addEventListener('change', sendText);
document.addEventListener('keyup', sendText);
window.addEventListener('mouseup', getText);

function getClick(event) {
    const node = event.target;
    let action = new Action("clickWeb", node);
    let msg = {action: action};
    if (!isSelection) {
        try {
            chrome.runtime.sendMessage(msg);
        } catch (e) {
            console.log(e)
        }
    } else {
        isSelection = false
    }
}

function getText() {
    let selectText = window.getSelection();
    if (selectText.toString().length > 0) {
        isSelection = true;
        const node = selectText.anchorNode.parentNode;
        let action = new Action("textObject", node);
        let msg = {action: action};
        try {
            chrome.runtime.sendMessage(msg);
        } catch (e) {
            console.log(e)
        }
    }
}

function sendText(event) {
    let msg;
    if (event.type === "keyup") {
        if (event.key === "Enter") {
            let action = new Action("sendKeyWeb", null);
            action.selector = {xpath: ""};
            action.value = event.key;
            action.defaultSelector = 'xpath';
            msg = {action: action};
        }
    } else {
        const node = event.target;
        let action = new Action("sendKeyWeb", node);
        msg = {action: action};
    }

    if (msg) {
        chrome.runtime.sendMessage(msg);
    }

}

function searchIFrames() {
    let allIFrames = document.querySelectorAll("iframe")

    if (allIFrames.length > 0) {
        let iFrames = []
        for (let frame of allIFrames) {
            let action = new SwitchToIframe("swichtoframe", frame);
            iFrames.push(action)
        }
        chrome.runtime.sendMessage({iFrames: iFrames});
    }
    //
}
searchIFrames()
