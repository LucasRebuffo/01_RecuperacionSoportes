// /*
// Javascript File with popup windows logic
//  */



// // ***** FUNCTIONS *****
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// // ***** HTML OBJECTS *****
const trashAllButton = document.querySelector("#trashAll");
const recButton = document.querySelector("#rec");
const saveProject = document.querySelector("#save_project");
const menuButton = document.querySelector("#menu");
const name_input = document.getElementById("robot-name");

// // ***** VARIABLES *****
let dataChanged = true;
let robotName = name_input.value;


// // ***** LISTENERS ******
// // Create Robot from save button
saveProject.addEventListener('click', createRobot);
// //Change robot name from name input
name_input.addEventListener("change", (e) => {
    robotName = e.target.value
});
// // Delete all events from trash button
trashAllButton.addEventListener('click', () => {
    changeEvents([]);
    menu.rowSelected = null;
    menu.eventSelected = null;
    dataChanged = true;
    changeFirst(true);
});
// // Start or pause recorder from rec button
recButton.addEventListener("click", async () => {
    let rec = await toggleAndReceiveRec();
    recButton.style.color = rec ? "red" : "black"
});
// // ***** FUNCTIONS *****
async function createRobot() {
    let events = await getEvents();
    let Robot = JSON.parse(JSON.stringify(Project));
    let vars = [];
    let waitObject = false;
    Robot.profile.name = robotName;
    let evs = [...events]; // Event copy

    while (evs.length > 0) {
        let event = evs[0];
        Robot = createCommand(event, vars, Robot, waitObject, evs)
    }
    for (let command in Robot.commands) {
        Robot.commands[command].index = command
    }
    for (let v of vars) {
        let variable = JSON.parse(JSON.stringify(Vars));
        variable.name = v;
        Robot.vars.push(variable)
    }
    // if (events.length > 0) download(Robot)
    download(Robot)

}

function download(robot) {
    changeFirst(true);
    let filename = robot.profile.name + '.json';
    let element = document.createElement('a');
    let data = encodeURIComponent(JSON.stringify({project: robot}));
    element.id = 'download_robot';
    element.setAttribute('href', `data:text/plain;charset=utf-8,${data}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element)
}

function toggleAndReceiveRec() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ message: "toggle_rec" }, response => {
          resolve(response);
        });
    });
}
function createCommand(event, vars, parent, wait, evs) {
    let varCount = vars.length + 1;
    let cmd = JSON.parse(JSON.stringify(Commands));
    
    cmd.father = event["type"];
    cmd.id = uuidv4();
    cmd.description = event.description ? event.description : "";
    switch (event['type']) {
        case 'openBrowser':
            cmd.father = "use";
            cmd.command = `{\"tipo\":\"0\",\"url\":\"${event.selector.url}\"}`;
            cmd.option = "chrome";
            cmd.data_ = {
                tipo: "0",
                url: `${event.selector.url}`
            };
            evs.shift();
            debugger
            wait = true;

            break;
        case 'openUrl':
            cmd.command = event.selector[event.defaultSelector];
            break;
        case 'clickWeb':
            cmd.father = "module";
            cmd.command = `{\"module_name\":\"webpro\",\"module\":\"clickPro\",\"data\":\"${event.selector[event.defaultSelector]}\",\"data_type\":\"${event.defaultSelector}\",\"wait\":\"5\"}`;
            cmd.group = "scripts";
            evs.shift();
            break;
        case 'sendKeyWeb':
            cmd.command = event.value;
            evs.shift();
            break;
        case 'swichtoframe':
            cmd.father = "module";
            cmd.command = `{\"module_name\":\"webpro\",\"module\":\"changeIframePro\",\"data\":\"${event.selector[event.defaultSelector]}\",\"data_type\":\"${event.defaultSelector}\",\"wait\":\"5\"}`;
            cmd.group = "scripts";
            evs.shift();
            wait = true;
            break;
        case 'textObject':
            cmd.father = "module";
            cmd.command = `{\\"module_name\\":\\"webpro\\",\\"module\\":\\"getText\\",\\"data\\":\\"${event.selector[event.defaultSelector]}\\",\\"data_type\\":\\"${event.defaultSelector}\\",\\"wait\\":\\"5\\",\\"result\\":\\"text_${varCount}\\"}`;
            let varName = `text_${varCount}`;
            vars.push(varName);
            evs.shift();
            break;
        case 'waitforobject':
            cmd.command = `{\"object\":\"${event.selector[event.defaultSelector]}\",\"wait_for\":\"visible\",\"wait_time\":\"30\",\"before\":0,\"after\":0}`;
            cmd.option = `${event.defaultSelector}`;
            let res = `res_${varCount}`;
            cmd.getvar = res;
            vars.push(res);
            break;
        case 'evaluateIf':
            cmd.command = `{${vars[vars.length - 1]}}`;
            cmd.group = "logic";
            while (evs.length > 0) {
                let event = evs[0];
                cmd = createCommand(event, vars, cmd, wait, evs)
            }
            for (let child in cmd.children) {
                cmd.children[child].index = child
            }
            break
        case 'swichtodefaultcontent':
            evs.shift();
            break

    }
    if (parent.children) {
        parent.children.push(cmd)
    } else {
        parent.commands.push(cmd);
    }

    if (wait) {
        wait = false
        const waitCommand = {
            type: "waitforobject",
            selector: evs[0].selector,
            defaultSelector: evs[0].defaultSelector
        };
        parent = createCommand(waitCommand, vars, parent, wait, evs);
        const ifCommand = {
            type: "evaluateIf",
            selector: "{res}",
        }
        parent = createCommand(ifCommand, vars, parent, false, evs);
    }
    return parent
}
   
/*******************************TABLE CONSTRUCTOR ****************/
class Menu {
    constructor() {
        this.command = document.getElementById('command');
        this.target = document.getElementById('target');
        this.row_value = document.getElementById('value_input');
        this.row_description = document.getElementById('description_input');
        this.oldEvents = [];
        this.rowSelected = null;
        this.eventSelected = null;
    }
    init() {
        this.command.addEventListener("change", async (e) => {
            let change = await changeEventById(this.eventSelected, e.target.value, 'type')
            if (change) {
                dataChanged = true;
            }
        });
        this.target.addEventListener("change", async (e) => {
            let change = await changeEventById(this.eventSelected, e.target.value, 'defaultSelector')
            dataChanged = true
        });
        this.row_value.addEventListener("input", async (e) => {
            let change = await changeEventById(this.eventSelected, e.target.value, 'value')
            dataChanged = true
        });
        this.row_description.addEventListener("change", async (e) => {
            let change = await changeEventById(this.eventSelected, e.target.value, 'description')})
            dataChanged = true
    }
    addRow(item) {
        const table = document.querySelector("tbody");
        const tableLenght = table.rows.length;
        let tr = table.insertRow();
        tr.id = "row-" + item.uuid;
        tr.classList.add("events");
        for (let j in item) {
            let data;
            if (j === "type") {
                let td = document.createElement('td');
                td = tr.insertCell(0);
                data = document.createTextNode(tableLenght + 1);
                td.appendChild(data);
                td = tr.insertCell(1);
                data = document.createTextNode(item[j]);
                td.appendChild(data)
            } else if (j === "selector") {
                let td = document.createElement('td');
                td = tr.insertCell(2);
                data = document.createTextNode(item[j][item.defaultSelector]);
                td.appendChild(data)
            } else if (j === "value") {
                let td = document.createElement('td');
                td = tr.insertCell(3);
                data = document.createTextNode(item[j]);
                td.appendChild(data)
                td = tr.insertCell(4);
                let viewButton = createViewButton(item);
                td.appendChild(viewButton);
                td = tr.insertCell(5);
                let deleteButton = createDeleteButton(item);
                td.appendChild(deleteButton);
            }
        }
    }
    deleteRow (item) {
        try {
            const table = document.querySelector("tbody");
            const row = document.getElementById('row-' + item?.uuid || '');
            if (row) {
                const rowIndex = row.rowIndex - 1;
                table.deleteRow(rowIndex);
            }
        } catch (error) {
            console.log('error deleting row', error, item)
        }
    }
    showRowData (item) {
        console.log(item)
        this.clearEventOptions();
        this.rowSelected = document.getElementById('row-' + item.uuid);
        this.eventSelected = item;
        addTargetOptions(item);
        if(['clickWeb', 'textObject', 'sendKeyWeb'].includes(item.type)){
            addOption(this.command, ["clickWeb", "textObject", "sendKeyWeb"], item.type)
        } else if(item.type === "openBrowser" || item.type === "openUrl" ){
            addOption(this.command, ["openBrowser", "openUrl"], item.type)
        }
        if(item.type != "sendKeyWeb" ){
            this.row_value.setAttribute("readonly", null);
        }
        this.command.value = item.type;
        this.row_value.value = item.value;
        this.row_description.value = item.description ? item.description : ""
    }
    updateRowValue(item) {
        let row = document.getElementById("row-" + item.uuid);
        for (let x in item) {
            if (x === "type") {
                row.cells[1].innerHTML = item[x];
                if (item[x] === "sendKeyWeb") {
                    this.row_value.removeAttribute("readonly");
                } else {
                    this.row_value.setAttribute("readonly", null);
                    this.row_value.value = "";
                }
            } else if (x === "selector") {
                row.cells[2].innerHTML = item[x][this.target.value];
            } else if (x === "value") {
                row.cells[3].innerHTML = item[x];
            }
        }
    }
    clearEventOptions() {
        const length_target = this.target.options.length;
        for (let i = length_target - 1; i >= 0; i--) {
            this.target.options[i] = null
        }
        const length_command = this.command.options.length;
        for (let i = length_command - 1; i >= 0; i--) {
            this.command.options[i] = null
        }
        this.row_value.removeAttribute("readonly")
        this.description = null
    }
    //el recorder siempre va a agregar cosas al final del array, asi que simplemente creo una row nueva 
    //va a borrar la row por el uuid, no por index
    patchTable(patches) {
        patches.forEach(patch => {
            const { type, item} = patch;
            switch (type) {
                case 'add':
                    this.addRow(item);
                    break;
                case 'remove':
                    this.deleteRow(item);
                    break;
                case 'update':
                    this.updateRowValue(item);
                    break;
                default:
                    break;
            }
        });
    }
}
/******menu helper functions */
function createDeleteButton (item) {
    let deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.classList.add('btn');
        deleteButton.classList.add('btn-outline-danger');
        deleteButton.classList.add('btn-sm');
        let icon = document.createElement('i');
        icon.classList.add('fa');
        icon.classList.add('fa-trash');
        deleteButton.appendChild(icon);
        deleteButton.addEventListener('click', async (e) => {
                e.stopPropagation();
                let del = await deleteEventById(item.uuid);
                if (del) {
                    dataChanged = true;
                    changeFirst(true);
                    menu.rowSelected = null;
                    menu.eventSelected = null;
                }
            }
    );
    return deleteButton;
}
function createViewButton (item) {
    let viewButton = document.createElement('button');
    viewButton.classList.add('view-button');
    viewButton.classList.add('btn');
    viewButton.classList.add('btn-outline-primary');
    viewButton.classList.add('btn-sm');
    let icon = document.createElement('i');
    icon.classList.add('fa');
    icon.classList.add('fa-eye');
    viewButton.appendChild(icon);
    viewButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            document.querySelector('tbody').style.pointerEvents = 'none';
            let view = await viewEventById(item.uuid);
            if (view) {
                menu.showRowData(view);
            } else {
                console.log('Event not found')
            }
            document.querySelector('tbody').style.pointerEvents = 'auto';

        }
    );
    return viewButton;
}
function addTargetOptions (item) {
    for (let selector in item.selector) {
        if (item.selector[selector]) {
            let option = document.createElement("option");
            if (item.defaultSelector === selector) {
                option.selected = true
            }
            option.text = selector;
            menu.target.add(option)
        }
    }
}
function addOption(element, options, selected) {
    for (let op of options){
        let option = document.createElement("option");
        option.text = op
        if (selected === op){
            option.selected = true
        }
        element.add(option)
    }
}
/*********************PATCH FUNCTIONS ***************************/
  function diff(oldEvents, newEvents) {
    const patches = [];
    const oldMap = new Map(oldEvents.map(item => [item['uuid'], item]));
  
    for (let i = 0; i < newEvents.length; i++) {
      const newItem = newEvents[i];
      const id = newItem['uuid'];
  
      if (oldMap.has(id)) {
        const oldItem = oldMap.get(id);
        if (!isDeepEqual(oldItem, newItem)) {
          patches.push({ type: 'update', index: i, item: newItem });
        }
        oldMap.delete(id);
      } else {
        patches.push({ type: 'add', index: i, item: newItem });
      }
    }
  
    oldMap.forEach((item, id) => {
      const index = oldEvents.findIndex(obj => obj['uuid'] === id);
      patches.push({ type: 'remove', item });
    });
  
    return patches;
  }

  function isDeepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
// Events sending and receiving

function changeEvents(value) {
    chrome.runtime.sendMessage({ message: "change_events", events: value });
}
function changeFirst(value) {
    chrome.runtime.sendMessage({ message: "change_first", first: value });
}

function getEvents() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ message: "get_events" }, response => {
        resolve(response);
      });
    });
}
function checkForNewEvent() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ message: "get_new_event" }, response => {
        resolve(response);
      });
    });
}
function changeNewEvent(value) {
    chrome.runtime.sendMessage({ message: "change_new_event", newEvent: value });
}
function deleteEventById(id) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ message: "delete_event_by_id", id}, response => {
          resolve(response);
        });
    });
}
function viewEventById(id) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ message: "view_event_by_id", id}, response => {
          resolve(response);
        });
    });
}
function changeEventById(event, value, key) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ message: "change_event_by_id", id: event.uuid, value, key}, response => {
          resolve(response);
        });
    });
}
//*****************WEBPAGE INITIALIZATION**********************
//
const menu = new Menu();
menu.init();
setInterval(async () => {
    try {
        let events = await getEvents();
        let newEvents = await checkForNewEvent();
        if (newEvents || dataChanged) {
            const patches = diff(menu.oldEvents, events);
            menu.patchTable(patches);
            dataChanged = false;
            changeNewEvent(false);
        }
        menu.oldEvents = events;
    } catch (error) {
      console.error("Error occurred:", error);
    }
  }, 300);