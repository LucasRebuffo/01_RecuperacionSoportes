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
      patches.push({ type: 'remove', index });
    });
  
    return patches;
  }

  function patch(oldEvents, patches) {
    patches.sort((a, b) => b.index - a.index);

    patches.forEach(patch => {
      const { type, index, item } = patch;
      switch (type) {
        case 'add':
          oldEvents.splice(index, 0, item);
          break;
        case 'remove':
          oldEvents.splice(index, 1);
          break;
        case 'update':
          oldEvents[index] = item;
          break;
        default:
          break;
      }
    });
  }

  function isDeepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

describe('diff function', () => {
    let oldEvents = [
        {
            "type": "openBrowser",
            "uuid": "685b2815-f678-41eb-89be-1d82b9dfab2f",
            "selector": {
                "url": "https://jsfiddle.net/"
            },
            "value": "",
            "defaultSelector": "url"
        },
        {
            "type": "clickWeb",
            "uuid": "9b6f243c-5f91-4602-8b2c-d1d53217b973",
            "selector": {
                "id": "",
                "className": "",
                "xpath": "HTML/BODY[1]",
                "tagName": "BODY"
            },
            "value": "",
            "defaultSelector": "xpath"
        },
        {
            "type": "clickWeb",
            "uuid": "bdcd16ae-81a5-4ea7-a879-72a7f0979957",
            "selector": {
                "id": "",
                "className": "CodeMirror-scroll",
                "xpath": "HTML/BODY[1]/FORM[1]/MAIN[1]/DIV[2]/DIV[1]/DIV[1]/DIV[3]/DIV[2]/DIV[6]",
                "tagName": "DIV"
            },
            "value": "",
            "defaultSelector": "xpath"
        },
        {
            "type": "clickWeb",
            "uuid": "a1533d19-5567-4017-8b21-2bd59672b1fd",
            "selector": {
                "id": "",
                "className": "",
                "xpath": "HTML/BODY[1]/FORM[1]/MAIN[1]/DIV[1]/SECTION[1]/DIV[2]/DIV[1]/P[2]/TEXTAREA[1]",
                "tagName": "TEXTAREA",
                "name": "description"
            },
            "value": "",
            "defaultSelector": "xpath"
        },
        {
            "type": "sendKeyWeb",
            "uuid": "a987d92b-0b7b-4ad3-83ac-7ea242195fef",
            "selector": {
                "id": "",
                "className": "",
                "xpath": "HTML/BODY[1]/FORM[1]/MAIN[1]/DIV[1]/SECTION[1]/DIV[2]/DIV[1]/P[2]/TEXTAREA[1]",
                "tagName": "TEXTAREA",
                "name": "description"
            },
            "value": "popo",
            "defaultSelector": "xpath"
        }
    ];
    it('should return an empty array when old and new lists are the same', () => {
        const result = diff(oldEvents, oldEvents);
        expect(result).toEqual([]);
    });
    it('should return patches for adding new items', () => {
        const newEvents =  [
            {
                "type": "openBrowser",
                "uuid": "685b2815-f678-41eb-89be-1d82b9dfab2f",
                "selector": {
                    "url": "https://jsfiddle.net/"
                },
                "value": "",
                "defaultSelector": "url"
            },
            {
                "type": "clickWeb",
                "uuid": "9b6f243c-5f91-4602-8b2c-d1d53217b973",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]",
                    "tagName": "BODY"
                },
                "value": "",
                "defaultSelector": "xpath"
            },
            {
                "type": "clickWeb",
                "uuid": "bdcd16ae-81a5-4ea7-a879-72a7f0979957",
                "selector": {
                    "id": "",
                    "className": "CodeMirror-scroll",
                    "xpath": "HTML/BODY[1]/FORM[1]/MAIN[1]/DIV[2]/DIV[1]/DIV[1]/DIV[3]/DIV[2]/DIV[6]",
                    "tagName": "DIV"
                },
                "value": "",
                "defaultSelector": "xpath"
            },
            {
                "type": "clickWeb",
                "uuid": "a1533d19-5567-4017-8b21-2bd59672b1fd",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]/FORM[1]/MAIN[1]/DIV[1]/SECTION[1]/DIV[2]/DIV[1]/P[2]/TEXTAREA[1]",
                    "tagName": "TEXTAREA",
                    "name": "description"
                },
                "value": "",
                "defaultSelector": "xpath"
            },
            {
                "type": "sendKeyWeb",
                "uuid": "a987d92b-0b7b-4ad3-83ac-7ea242195fef",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]/FORM[1]/MAIN[1]/DIV[1]/SECTION[1]/DIV[2]/DIV[1]/P[2]/TEXTAREA[1]",
                    "tagName": "TEXTAREA",
                    "name": "description"
                },
                "value": "popo",
                "defaultSelector": "xpath"
            },
            {
                "type": "sendKeyWeb",
                "uuid": "a987d92b-1b7b-4ad3-83ac-7ea242195fgf",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]/FORM[1]/MAIN[1]/DIV[1]/SECTION[1]/DIV[2]/DIV[1]/P[2]/TEXTAREA[1]",
                    "tagName": "TEXTAREA",
                    "name": "description"
                },
                "value": "popo",
                "defaultSelector": "xpath"
            },
            {
                "type": "sendKeyWeb",
                "uuid": "b987d93b-0z7b-4ad3-83ac-7ea242195fef",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]/FORM[1]/MAIN[1]/DIV[1]/SECTION[1]/DIV[2]/DIV[1]/P[2]/TEXTAREA[1]",
                    "tagName": "TEXTAREA",
                    "name": "description"
                },
                "value": "popo",
                "defaultSelector": "xpath"
            }
        ];
        const result = diff(oldEvents, newEvents);
        expect(result).toEqual([
            { type: 'add', index: 5, item: newEvents[5] },
            { type: 'add', index: 6, item: newEvents[6] }
        ]);
    });
    it('should return patches for removing items at the end of the list', () => {
        const newEvents =  [
            {
                "type": "openBrowser",
                "uuid": "685b2815-f678-41eb-89be-1d82b9dfab2f",
                "selector": {
                    "url": "https://jsfiddle.net/"
                },
                "value": "",
                "defaultSelector": "url"
            },
            {
                "type": "clickWeb",
                "uuid": "9b6f243c-5f91-4602-8b2c-d1d53217b973",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]",
                    "tagName": "BODY"
                },
                "value": "",
                "defaultSelector": "xpath"
            },
            {
                "type": "clickWeb",
                "uuid": "bdcd16ae-81a5-4ea7-a879-72a7f0979957",
                "selector": {
                    "id": "",
                    "className": "CodeMirror-scroll",
                    "xpath": "HTML/BODY[1]/FORM[1]/MAIN[1]/DIV[2]/DIV[1]/DIV[1]/DIV[3]/DIV[2]/DIV[6]",
                    "tagName": "DIV"
                },
                "value": "",
                "defaultSelector": "xpath"
            }
        ];
    
        const result = diff(oldEvents, newEvents);
        expect(result).toEqual([
            { type: 'remove', index: 3 },
            { type: 'remove', index: 4 }
        ]);
    });
    it('should return patches for removing items in the middle of the list', () => {
        const newEvents = [
            {
                "type": "openBrowser",
                "uuid": "685b2815-f678-41eb-89be-1d82b9dfab2f",
                "selector": {
                    "url": "https://jsfiddle.net/"
                },
                "value": "",
                "defaultSelector": "url"
            },
            {
                "type": "clickWeb",
                "uuid": "9b6f243c-5f91-4602-8b2c-d1d53217b973",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]",
                    "tagName": "BODY"
                },
                "value": "",
                "defaultSelector": "xpath"
            },
            {
                "type": "clickWeb",
                "uuid": "a1533d19-5567-4017-8b21-2bd59672b1fd",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]/FORM[1]/MAIN[1]/DIV[1]/SECTION[1]/DIV[2]/DIV[1]/P[2]/TEXTAREA[1]",
                    "tagName": "TEXTAREA",
                    "name": "description"
                },
                "value": "",
                "defaultSelector": "xpath"
            },
            {
                "type": "sendKeyWeb",
                "uuid": "a987d92b-0b7b-4ad3-83ac-7ea242195fef",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]/FORM[1]/MAIN[1]/DIV[1]/SECTION[1]/DIV[2]/DIV[1]/P[2]/TEXTAREA[1]",
                    "tagName": "TEXTAREA",
                    "name": "description"
                },
                "value": "popo",
                "defaultSelector": "xpath"
            }
        ];
        const result = diff(oldEvents, newEvents);
        expect(result).toEqual([
            { type: 'remove', index: 2 }
        ]);
    });
    it('should return patches for updating items', () => {
        let newEvents = [
            {
                "type": "openBrowser",
                "uuid": "685b2815-f678-41eb-89be-1d82b9dfab2f",
                "selector": {
                    "url": "https://jsfiddle.net/"
                },
                "value": "",
                "defaultSelector": "url"
            },
            {
                "type": "clickWeb",
                "uuid": "9b6f243c-5f91-4602-8b2c-d1d53217b973",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]",
                    "tagName": "BODY"
                },
                "value": "",
                "defaultSelector": "xpath"
            },
            {
                "type": "clickWeb",
                "uuid": "bdcd16ae-81a5-4ea7-a879-72a7f0979957",
                "selector": {
                    "id": "",
                    "className": "CodeMirror-scroll",
                    "xpath": "HTML/BODY[1]/FORM[1]/MAIN[1]/DIV[2]/DIV[1]/DIV[1]/DIV[3]/DIV[2]/DIV[6]",
                    "tagName": "DIV"
                },
                "value": "",
                "defaultSelector": "xpath"
            },
            {
                "type": "clickWeb",
                "uuid": "a1533d19-5567-4017-8b21-2bd59672b1fd",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]/FORM[1]/MAIN[1]/DIV[1]/SECTION[1]/DIV[2]/DIV[1]/P[2]/TEXTAREA[1]",
                    "tagName": "TEXTAREA",
                    "name": "description"
                },
                "value": "",
                "defaultSelector": "xpath"
            },
            {
                "type": "sendKeyWeb",
                "uuid": "a987d92b-0b7b-4ad3-83ac-7ea242195fef",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]/FORM[1]/MAIN[1]/DIV[1]/SECTION[1]/DIV[2]/DIV[1]/P[2]/TEXTAREA[1]",
                    "tagName": "TEXTAREA",
                    "name": "description"
                },
                "value": "mishuleitor",
                "defaultSelector": "xpath"
            }
        ];
    
        const result = diff(oldEvents, newEvents);
        expect(result).toEqual([
            { type: 'update', index: 4, item: newEvents[4] }
        ]);
      });
      it('comparing two empty arrays returns an empty array', () => {
        const result = diff([], []);
        expect(result).toEqual([]);
      });
});

describe('patch function', () => {
    
    it('should add new items to the frontend list', () => {
        let oldEvents = [
            {
                "type": "openBrowser",
                "uuid": "685b2815-f678-41eb-89be-1d82b9dfab2f",
                "selector": {
                    "url": "https://jsfiddle.net/"
                },
                "value": "",
                "defaultSelector": "url"
            },
            {
                "type": "clickWeb",
                "uuid": "9b6f243c-5f91-4602-8b2c-d1d53217b973",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]",
                    "tagName": "BODY"
                },
                "value": "",
                "defaultSelector": "xpath"
            }
        ];
        const patches = [
            { type: 'add', index: 1, item: {
                "type": "mishu",
                "uuid": "2b6f243z-5f51-4612-8b2c-d1d53217b974",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]",
                    "tagName": "BODY"
                },
                "value": "",
                "defaultSelector": "xpath"
                } 
            },
            { type: 'add', index: 2, item: {
                "type": "hola",
                "uuid": "796c3925-f678-41eb-89be-1d82b9dfab2f",
                "selector": {
                    "url": "https://jsfiddle.net/"
                },
                "value": "",
                "defaultSelector": "url"
                } 
            }
        ];
    
        patch(oldEvents, patches);        
        expect(oldEvents).toStrictEqual([
            {
                "type": "openBrowser",
                "uuid": "685b2815-f678-41eb-89be-1d82b9dfab2f",
                "selector": {
                    "url": "https://jsfiddle.net/"
                },
                "value": "",
                "defaultSelector": "url"
            },
            {
                 type: 'mishu',
                 uuid: '2b6f243z-5f51-4612-8b2c-d1d53217b974',
                 selector: { id: '', className: '', xpath: 'HTML/BODY[1]', tagName: 'BODY' },
                 value: '',
                 defaultSelector: 'xpath'
             },
             {
                "type": "clickWeb",
                "uuid": "9b6f243c-5f91-4602-8b2c-d1d53217b973",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]",
                    "tagName": "BODY"
                },
                "value": "",
                "defaultSelector": "xpath"
            },
            {
                "type": "hola",
                "uuid": "796c3925-f678-41eb-89be-1d82b9dfab2f",
                "selector": {
                    "url": "https://jsfiddle.net/"
                },
                "value": "",
                "defaultSelector": "url"
                } 
        ]);
    });

    it('should remove items from the frontend list', () => {
        let oldEvents = [
            {
                "type": "openBrowser",
                "uuid": "685b2815-f678-41eb-89be-1d82b9dfab2f",
                "selector": {
                    "url": "https://jsfiddle.net/"
                },
                "value": "",
                "defaultSelector": "url"
            },
            {
                "type": "clickWeb",
                "uuid": "9b6f243c-5f91-4602-8b2c-d1d53217b973",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]",
                    "tagName": "BODY"
                },
                "value": "",
                "defaultSelector": "xpath"
            },
            {
                "type": "hola",
                "uuid": "796c3925-f678-41eb-89be-1d82b9dfab2f",
                "selector": {
                    "url": "https://jsfiddle.net/"
                },
                "value": "",
                "defaultSelector": "url"
            } 
        ];
        const patches = [
          { type: 'remove', index: 2 },
          { type: 'remove', index: 0 },
        ];
    
        patch(oldEvents, patches);
    
        expect(oldEvents).toEqual([{
            "type": "clickWeb",
            "uuid": "9b6f243c-5f91-4602-8b2c-d1d53217b973",
            "selector": {
                "id": "",
                "className": "",
                "xpath": "HTML/BODY[1]",
                "tagName": "BODY"
            },
            "value": "",
            "defaultSelector": "xpath"
        }]);
    });

    it('should update items in the frontend list', () => {
        let oldEvents = [
            {
                "type": "openBrowser",
                "uuid": "685b2815-f678-41eb-89be-1d82b9dfab2f",
                "selector": {
                    "url": "https://jsfiddle.net/"
                },
                "value": "",
                "defaultSelector": "url"
            },
            {
                "type": "clickWeb",
                "uuid": "9b6f243c-5f91-4602-8b2c-d1d53217b973",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]",
                    "tagName": "BODY"
                },
                "value": "",
                "defaultSelector": "xpath"
            }
        ];
        const patches = [
          { type: 'update', index: 1, item:     {
            "type": "music",
            "uuid": "685b2815-f678-41eb-89be-1d82b9dfab2f",
            "selector": {
                "url": "https://jsfiddle.net/"
            },
            "value": "",
            "defaultSelector": "url"
        } },
          { type: 'update', index: 0, item: {
            "type": "europe",
            "uuid": "9b6f243c-5f91-4602-8b2c-d1d53217b973",
            "selector": {
                "id": "",
                "className": "",
                "xpath": "HTML/BODY[1]",
                "tagName": "BODY"
            },
            "value": "",
            "defaultSelector": "xpath"
        } },
        ];
    
        patch(oldEvents, patches);
    
        expect(oldEvents).toEqual([
            {
                "type": "europe",
                "uuid": "9b6f243c-5f91-4602-8b2c-d1d53217b973",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]",
                    "tagName": "BODY"
                },
                "value": "",
                "defaultSelector": "xpath"
            },
            {
                "type": "music",
                "uuid": "685b2815-f678-41eb-89be-1d82b9dfab2f",
                "selector": {
                    "url": "https://jsfiddle.net/"
                },
                "value": "",
                "defaultSelector": "url"
            }
        ]);
    });
    it('should handle empty patches', () => {
        const oldEvents = [
            {
                "type": "openBrowser",
                "uuid": "685b2815-f678-41eb-89be-1d82b9dfab2f",
                "selector": {
                    "url": "https://jsfiddle.net/"
                },
                "value": "",
                "defaultSelector": "url"
            },
            {
                "type": "clickWeb",
                "uuid": "9b6f243c-5f91-4602-8b2c-d1d53217b973",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]",
                    "tagName": "BODY"
                },
                "value": "",
                "defaultSelector": "xpath"
            }
        ];
        const patches = [];
    
        patch(oldEvents, patches);
    
        expect(oldEvents).toStrictEqual([
            {
                "type": "openBrowser",
                "uuid": "685b2815-f678-41eb-89be-1d82b9dfab2f",
                "selector": {
                    "url": "https://jsfiddle.net/"
                },
                "value": "",
                "defaultSelector": "url"
            },
            {
                "type": "clickWeb",
                "uuid": "9b6f243c-5f91-4602-8b2c-d1d53217b973",
                "selector": {
                    "id": "",
                    "className": "",
                    "xpath": "HTML/BODY[1]",
                    "tagName": "BODY"
                },
                "value": "",
                "defaultSelector": "xpath"
            }
        ]);
    });
});