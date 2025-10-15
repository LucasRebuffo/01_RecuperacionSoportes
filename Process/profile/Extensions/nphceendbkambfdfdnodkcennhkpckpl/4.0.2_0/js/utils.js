
// UTILS
// ***** CLASSES *****
class Action{
    constructor(type, target, defaultSelector='xpath') {
        this.type = type;
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
        this.src = target.src;
        this.baseURI = target.baseURI;
    }
}

class AddressBar extends Action{
    constructor(type, url) {
        super(type, false);
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

