let List1 = [];
let List2 = [];

facefullCreate(true);

window.addEventListener('load', function () {
    App();
});

function App() {
    facefull.doInit();

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
        let el1sb = document.getElementById("L1SB");
        let el2sb = document.getElementById("L2SB");
        el1h.style.display = "none";
        el2h.style.display = "none";
        el1sb.style.display = "none";
        el2sb.style.display = "none";
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
        }
    }

    facefull.Tabs["LT"].doSelectTab(0);

    doLoadList1();
    doLoadList2();

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

function doList1ItemDelete(itemid) {
    List1[itemid] = null;
    setList1();
}

function doLoadList1() {
    for (let i = 0; i < 15; i++)
        List1.push({name: "List 1 item"});
    setList1();
}

function setList1() {
    let egrouplist = document.getElementById("L1");
    egrouplist.innerHTML = "";
    for (let i = 0; i < List1.length; i++) {
        if (!List1[i]) continue;
        let gblock = document.createElement("li");
        let gnum = document.createElement("div");
        let gname = document.createElement("div");
        let gaction = document.createElement("div");
        gnum.innerHTML = i + 1;
        gname.innerHTML = List1[i].name;
        gaction.className = "Action PopupMenuTarget TooltipTarget";
        gaction.setAttribute("data-popupmenu", "L1PM");
        gaction.setAttribute("data-popupmenu-pos", "bottom-right");
        gaction.setAttribute("data-id", i);
        new PopupMenu(gaction);
        gblock.appendChild(gnum);
        gblock.appendChild(gname);
        gblock.appendChild(gaction);
        egrouplist.appendChild(gblock);
    }
    facefull.Scrollboxes["L1SB"].doUpdateScrollbar();
}

function doLoadList2() {
    for (let i = 0; i < 30; i++)
        List2.push({name: "List 2 item", somecolumn: "Column data"});
    setList2();
}

function setList2() {
    let egrouplist = document.getElementById("L2");
    egrouplist.innerHTML = "";
    for (let i = 0; i < List2.length; i++) {
        if (!List2[i]) continue;
        let gblock = document.createElement("li");
        let gnum = document.createElement("div");
        let gname = document.createElement("div");
        let gcol = document.createElement("div");
        let gaction = document.createElement("div");
        gnum.innerHTML = i + 1;
        gname.innerHTML = List2[i].name;
        gcol.innerHTML = List2[i].somecolumn;
        gaction.className = "Action PopupMenuTarget";
        gaction.setAttribute("data-popupmenu", "L2PM");
        gaction.setAttribute("data-popupmenu-pos", "bottom-right");
        gaction.setAttribute("data-id", i);
        new PopupMenu(gaction);
        gblock.appendChild(gnum);
        gblock.appendChild(gname);
        gblock.appendChild(gcol);
        gblock.appendChild(gaction);
        egrouplist.appendChild(gblock);
    }
    facefull.Scrollboxes["L2SB"].doUpdateScrollbar();
}

function doList2ItemDelete(itemid) {
    List2[itemid] = null;
    setList2();
}

function doOpenAlertInfo() {
    AlertShow("Info alert", "The message.", "info", "OK");
}

function doOpenAlertError() {
    AlertShow("Error alert", "The message.", "error", "OK");
}
