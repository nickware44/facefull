let List1 = [];
let List2 = [];
let List3 = [];

facefullCreate();

window.addEventListener('load', function () {
    App();
});

function App() {
    facefull.doInit();
    facefull.Themes.setDefaultThemeName("Dark theme");
    facefull.Themes.doAttachThemeFile("Light theme", ["facefull/theme-light.min.css", "src/style-light.css"]);

    facefull.MainMenuBox.onPageOpen = function(name) {
        facefull.doUpdateAllScrollboxes();
    }

    facefull.Circlebars["P1CB1"].setPos(90);
    facefull.Circlebars["P1CB2"].setPos(10);
    facefull.Circlebars["P1CB3"].setPos(55);

    let pv = [];
    let pl = [];
    for (let i = 0; i < 16; i++) {
        pv.push((10-Math.abs(8-i))*Math.random()*20);
        pl.push(i+1);
    }
    doCreatePulseChart("P1", pv, pl);
    doGenPanel3List();

    facefull.Tabs["LT"].onTabChanged = function(tabnum) {
        let el1h = document.getElementById("L1H");
        let el2h = document.getElementById("L2H");
        let el3h = document.getElementById("L3H");
        let el1sb = document.getElementById("L1SB");
        let el2sb = document.getElementById("L2SB");
        let el3sb = document.getElementById("L3SB");
        el1h.style.display = "none";
        el2h.style.display = "none";
        el3h.style.display = "none";
        el1sb.style.display = "none";
        el2sb.style.display = "none";
        el3sb.style.display = "none";
        switch (tabnum) {
            case 0:
                el1h.style.display = "block";
                el1sb.style.display = "block";
                facefull.Scrollboxes["L1SB"].doUpdateScrollbar();
                break;
            case 1:
                el2h.style.display = "block";
                el2sb.style.display = "block";
                facefull.Scrollboxes["L2SB"].doUpdateScrollbar();
                break;
            case 2:
                el3h.style.display = "block";
                el3sb.style.display = "block";
                facefull.Scrollboxes["L3SB"].doUpdateScrollbar();
        }
    }

    facefull.Tabs["LT"].doSelectTab(0);

    doLoadList1();
    doLoadList2();
    doLoadList3();

    facefull.Themes.getThemeList().forEach(theme => {
        facefull.Comboboxes["SD"].doAddItem(theme.themename);
    });
    facefull.Comboboxes["SD"].setState(0);
    facefull.Comboboxes["SD"].onChangeState = function(state) {
        facefull.Themes.doApplyTheme(state);
    };

    facefull.HotkeyHolders["HH1"].onHotkey = function(hotkey) {
        AlertShow("Alert", "Hotkey pressed!");
    }
    facefull.HotkeyHolders["HH1"].onHotkeySet = function(hotkey) {
        console.log(hotkey);
    }

    facefull.ItemPickers["IP1"].onSelect = function(id) {
        let str = "Selected color: ";
        switch (id) {
            case 0:
                str += "yellow";
                break;
            case 1:
                str += "light blue";
                break;
            case 2:
                str += "green";
                break;
            case 3:
                str += "red";
                break;
            case 4:
                str += "purple";
                break;
            case 5:
                str += "gray";
                break;
        }
        document.getElementById("IPC").innerHTML = str;
    }
    facefull.ItemPickers["IP1"].doSelect(0);

    facefull.Counters["CV1"].onBeforeCount = function(direction) {
        if (facefull.Counters["CV1"].getValue()+direction > 50) {
            facefull.Counters["CV1"].setValue(50);
            return false;
        } else if (facefull.Counters["CV1"].getValue()+direction < 0) {
            facefull.Counters["CV1"].setValue(0);
            return false;
        }
        return true;
    }

    facefull.Lists["L3"].onOpenCloseSubItems = function(id, state) {
        facefull.Scrollboxes["L3SB"].doUpdateScrollbar();
    }
}

function doShowTestMessage() {
    AlertShow("Test message",
        "Are you alright?",
        "warning",
        "YESNO",
        [function() {
            AlertShow("Alert", "Nice!", "info");
        }, function() {
            AlertShow("Alert", "Hang on!", "error");
        }]);
}

function doGenPanel3List() {
    let epb = document.getElementById("PB");
    for (let i = 0; i < 8; i++) {
        epb.innerHTML += "<li>Item "+(i+1)+"</li>"
    }
    facefull.Scrollboxes["P3SB"].doUpdateScrollbar();
}

function doPopupList1ItemDelete() {
    let uitemid = document.getElementById("L1PM").getAttribute("data-id");
    AlertShow("Delete item from list 1",
        "Do you really want to delete item from list 1?",
        "warning",
        "YESNO",
        [function() {
            doList1ItemDelete(uitemid);
        }, function() {
        }]);
}

function doPopupList2ItemDelete() {
    let uitemid = document.getElementById("L2PM").getAttribute("data-id");
    AlertShow("Delete item from list 2",
        "Do you really want to delete item from list 2?",
        "warning",
        "YESNO",
        [function() {
            doList2ItemDelete(uitemid);
        }, function() {
        }]);
}

function doLoadList1() {
    for (let i = 0; i < 15; i++)
        List1.push({name: "List 1 item "+(i+1)});
    setList1();
}

function setList1() {
    let i = 0;
    facefull.Lists["L1"].doClear();
    List1.forEach(item => {
        i++;
        facefull.Lists["L1"].doAdd([i, item.name], 0, {
            action: "popupmenu",
            popupmenu_name: "L1PM",
            popupmenu_pos: "bottom-right"
        });
    });
    facefull.Scrollboxes["L1SB"].doUpdateScrollbar();
}

function doList1ItemDelete(itemid) {
    List1.splice(itemid, 1);
    setList1();
}

function doLoadList2() {
    for (let i = 0; i < 30; i++)
        List2.push({name: "List 2 item "+(i+1), somecolumn: "Column data"});
    setList2();
}

function setList2() {
    let i = 0;
    facefull.Lists["L2"].doClear();
    List2.forEach(item => {
        i++;
        facefull.Lists["L2"].doAdd([i, item.name, item.somecolumn], 0, {
            action: "popupmenu",
            popupmenu_name: "L2PM",
            popupmenu_pos: "bottom-right"
        });
    });
    facefull.Scrollboxes["L2SB"].doUpdateScrollbar();
}

function doList2ItemDelete(itemid) {
    List2.splice(itemid, 1);
    setList2();
}

function doLoadList3() {
    for (let i = 0; i < 5; i++) {
        let sublist = [];
        if (i === 0 || i === 1)
            for (let j = 0; j < 5; j++) {
                sublist.push({name: "List 3 subitem "+(j+1), sublist: sublist})
            }
        List3.push({name: "List 3 item "+(i+1), sublist: sublist});
    }

    setList3();
}

function setList3() {
    facefull.Lists["L3"].doClear();
    List3.forEach(item => {
        if (item.sublist.length) {
            facefull.Lists["L3"].doAdd([item.name], 0, {
                action: "arrow",
                checkbox: "checked"
            });
            item.sublist.forEach(subitem => {
                facefull.Lists["L3"].doAdd([subitem.name], 1, {
                    action: "arrow",
                    checkbox: "checked"
                });
                subitem.sublist.forEach(subsubitem => {
                    facefull.Lists["L3"].doAdd([subsubitem.name], 2, {
                        action: "popupmenu",
                        popupmenu_name: "L3PM",
                        popupmenu_pos: "bottom-right",
                        checkbox: "checked"
                    });
                });
            });
        } else {
            facefull.Lists["L3"].doAdd([item.name], 0, {
                action: "popupmenu",
                popupmenu_name: "L3PM",
                popupmenu_pos: "bottom-right",
                checkbox: "checked"
            });
        }
    });
    facefull.Scrollboxes["L3SB"].doUpdateScrollbar();
}

function doList3ItemInfo() {
    let itemid = document.getElementById("L3PM").getAttribute("data-id");
    let tree = facefull.Lists["L3"].getItemTree();
    let flattree = tree.flat(Infinity);

    AlertShow("Checklist item", "Item level: "+flattree[itemid].level+
        ", current level item index: "+flattree[itemid].current_level_index+
        ", parent item index: "+flattree[itemid].parent_index);
}

function doOpenAlertInfo() {
    AlertShow("Info alert", "The message.", "info", "OK");
}

function doOpenAlertError() {
    AlertShow("Error alert", "The message.", "error", "OK");
}
