
/*===================== General =====================*/

let facefull = null;

function bind(func, context) {
    return function() {
        return func.apply(context, arguments);
    };
}

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index+replacement.length);
}

function fixEvent(e) {
    e.currentTarget = this;
    e.target = e.srcElement;
    if (e.type === 'mouseover' || e.type === 'mouseenter') e.relatedTarget = e.fromElement;
    if (e.type === 'mouseout' || e.type === 'mouseleave') e.relatedTarget = e.toElement;
    if (e.pageX == null && e.clientX != null) {
        let html = document.documentElement;
        let body = document.body;
        e.pageX = e.clientX + (html.scrollLeft || body && body.scrollLeft || 0);
        e.pageX -= html.clientLeft || 0;
        e.pageY = e.clientY + (html.scrollTop || body && body.scrollTop || 0);
        e.pageY -= html.clientTop || 0;
    }
    if (!e.which && e.button) {
        e.which = e.button & 1 ? 1 : (e.button & 2 ? 3 : (e.button & 4 ? 2 : 0));
    }
    return e;
}

function facefullCreate(native = false) {
    facefull = new Facefull(native);
}

function Facefull(native = false) {
    this.Subpages = [];
    this.Tablists = [];
    this.Scrollboxes = [];
    this.Comboboxes = [];
    this.Loadingbars = [];
    this.Categorylists = [];
    this.SelectableLists = [];
    this.Tooltips = [];
    this.PopupMenus = [];
    this.DropAreas = [];
    this.Tabs = [];
    this.LastGlobalOpenedPopupMenu = null;
    this.LastGlobalOpenedPopupMenuTarget = null;
    this.Subpagelevel = 0;
    this.MainMenuItem = null;
    this.OverlayZIndex = 200;
    this.EventTable = [];
    this.native = native;

    this.doEventHandlerAttach = function(comm, handler = function(data = ""){}) {
        this.EventTable[comm] = {handler: handler};
    }

    this.doEventHandle = function(comm, data) {
        if (this.EventTable[comm] !== undefined && this.EventTable[comm] !== null) {
            this.EventTable[comm].handler(data);
        }
    }

    this.doEventSend = function(comm, data = "") {
        document.title = "0";
        document.title = comm+"|"+data;
    }

    this.getColorFromGrid = function(id) {
        let colors = [
            '#FF4A0C',
            '#be6e00',
            '#5D9D32',
            '#3A9470',
            '#BF1332',
            '#951656',
            '#5E1B92',
        ];
        return colors[id-Math.floor(id/colors.length)*colors.length];
    }

    this.doCSSLoad = function(file) {
        let link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", file);
        document.getElementsByTagName("head")[0].appendChild(link);
    }

    this.doCSSUnload = function(file) {
        let ehead = document.getElementsByTagName("head")[0];
        for (let i = 0; i < ehead.childElementCount; i++) {
            let erule = ehead.children[i];
            if (erule.getAttribute("href") === file) ehead.removeChild(erule);
        }
    }

    this.doHex2String = function(hexdata) {
        let hexstr = hexdata.toString();
        let str = "";
        for (let i = 0; i < hexstr.length; i += 4) {
            str += String.fromCharCode(parseInt(hexstr.substr(i, 4), 16));
        }
        return str;
    }

    this.doCloseAllSubpages = function() {
        for (let i = 0; i < this.Subpages.length; i++) {
            let TL = this.Subpages[i];
            TL.doSubpageClose();
        }
    }

    this.doCloseAllTablists = function() {
        for (let i = 0; i < this.Tablists.length; i++) {
            let TL = this.Tablists[i];
            TL.doTabClose();
        }
    }

    this.doCloseAllPopup = function(event) {
        event = event || fixEvent.call(this, window.event);
        if (!event || (!event.target.classList.contains("Opened") && !event.target.parentElement.classList.contains("Opened") && !event.target.parentElement.parentElement.classList.contains("Opened"))) {
            for (let i in this.Comboboxes) {
                if (this.Comboboxes.hasOwnProperty(i))
                    this.Comboboxes[i].doCloseComboboxList();
            }
        }
        if (event.target === this.LastGlobalOpenedPopupMenuTarget) return;
        if (!event || (event.target.className !== "PopupMenu" && event.target.parentElement.className !== "PopupMenu" && event.target.parentElement.parentElement.className !== "PopupMenu"))
            this.doCloseGlobalPopupMenu();
    }

    this.doCloseGlobalPopupMenu = function() {
        if (this.LastGlobalOpenedPopupMenu) this.LastGlobalOpenedPopupMenu.style.display = "none";
    }

    this.doUpdateAllScrollboxes = function() {
        for (let i in this.Scrollboxes) {
            if (this.Scrollboxes.hasOwnProperty(i))
                this.Scrollboxes[i].doUpdateScrollbar();
        }
    }

    this.doWindowHeaderInit = function() {
        let ewcaption = document.getElementsByClassName("WindowCaption");
        let ewmover = document.getElementsByClassName("WindowMover");
        let ewctrlmin = document.getElementsByClassName("WindowControl Min");
        let ewctrlmax = document.getElementsByClassName("WindowControl Max");
        let ewctrlclose = document.getElementsByClassName("WindowControl Close");
        if (ewcaption.length) ewcaption[0].onmousedown = bind(function() {
            facefull.doEventSend("doWindowMove");
        }, this);
        if (ewmover.length) ewmover[0].onmousedown = bind(function() {
            facefull.doEventSend("doWindowMove");
        }, this);
        if (ewctrlmin.length) ewctrlmin[0].onclick = bind(function() {
            facefull.doEventSend("doWindowMinimize");
        }, this);
        if (ewctrlmax.length) ewctrlmax[0].onclick = bind(function() {
            if (ewctrlmax[0].classList.contains("Restore")) ewctrlmax[0].classList.remove("Restore");
            else ewctrlmax[0].classList.add("Restore");
            facefull.doEventSend("doWindowMaximize");
        }, this);
        if (ewctrlclose.length) ewctrlclose[0].onclick = bind(function() {
            facefull.doEventSend("doWindowClose");
        }, this);
    }

    this.doInit = function() {
        let subpages = document.querySelectorAll(".Subpage");
        for (let i = 0; i < subpages.length; i++) {
            let did = subpages[i].getAttribute("data-subpagename");
            this.Subpages[did] = new Subpage(subpages[i]);
        }
        let tablists = document.querySelectorAll(".Tablist");
        for (let i = 0; i < tablists.length; i++) this.Tablists.push(new Tablist(tablists[i]));
        let sboxes = document.querySelectorAll(".Box.Scrolling");
        for (let i = 0; i < sboxes.length; i++) {
            let did = sboxes[i].getAttribute("data-scrollboxname");
            this.Scrollboxes[did] = new Scrollbox(sboxes[i]);
        }
        let comboxes = document.querySelectorAll(".Combobox");
        for (let i = 0; i < comboxes.length; i++) {
            let did = comboxes[i].getAttribute("data-comboboxname");
            this.Comboboxes[did] = new Combobox(comboxes[i]);
        }
        let slists = document.querySelectorAll(".List.Selectable");
        for (let i = 0; i < slists.length; i++) {
            let did = slists[i].getAttribute("data-listname");
            this.SelectableLists[did] = new SelectableList(slists[i]);
        }

        // let lbarsc = document.querySelectorAll(".Loadingbar");
        // for (let i = 0; i < lbarsc.length; i++) {
        //     if (lbarsc[i].className === "Loadingbar Random") this.Loadingbars.push(new Loadingbar(lbarsc[i], 'random'));
        //     else this.Loadingbars.push(new Loadingbar(lbarsc[i], 'classic'));
        // }
        let catlists = document.querySelectorAll(".Categorylist");
        for (let i = 0; i < catlists.length; i++) this.Categorylists.push(new Categorylist(catlists[i]));

        this.MainMenuItem = new MainMenu(document.querySelectorAll(".MainMenuItems").item(0));

        let tooltips = document.querySelectorAll(".TooltipTarget");
        for (let i = 0; i < tooltips.length; i++) this.Tooltips.push(new Tooltip(tooltips[i]));

        let popupmenus = document.querySelectorAll(".PopupMenuTarget");
        for (let i = 0; i < popupmenus.length; i++) this.PopupMenus.push(new PopupMenu(popupmenus[i]));

        let drops = document.querySelectorAll(".DropArea");
        for (let i = 0; i < drops.length; i++) {
            let did = drops[i].getAttribute("data-dropname");
            this.DropAreas[did] = new DropArea(drops[i]);
        }

        let tabs = document.querySelectorAll(".Tabs");
        for (let i = 0; i < tabs.length; i++) {
            let did = tabs[i].getAttribute("data-tabsname");
            this.Tabs[did] = new Tabs(tabs[i]);
        }

        window.addEventListener("mousedown", bind(function(event) {
            this.doCloseAllPopup(event);
        }, this));
        window.addEventListener("resize", bind(function() {
            this.doUpdateAllScrollboxes();
        }, this));

        if (native) this.doWindowHeaderInit();
    }
}

/*===================== Subpage =====================*/

function Subpage(e) {
    this.esubpage = e;
    this.ebackbutton = this.esubpage.children[0].children[0];
    this.opened = false;

    this.doSubpageClose = function() {
        if (!this.opened) return;
        //this.esubpage.style.visibility = "hidden";
        //this.esubpage.style.opacity = "0";
        this.esubpage.classList.remove("Show");
        if (facefull.Subpagelevel > 0) facefull.Subpagelevel--;
        //console.log(facefull.Subpagelevel);
        this.opened = false;
    };

    this.doSubpageOpen = function() {
        //this.esubpage.style.visibility = "inherit";
        //this.esubpage.style.opacity = "1";
        //console.log("SE "+facefull.Subpagelevel);
        if (this.opened) return;
        this.esubpage.classList.add("Show");
        this.esubpage.style.zIndex = (facefull.Subpagelevel+1)*10;
        facefull.Subpagelevel++;
        //console.log("SO "+facefull.Subpagelevel);
        this.opened = true;
    };

    this.isOpened = function() {
        return this.opened;
    };

    let SPL = document.querySelectorAll("[data-subpageopen='"+this.esubpage.getAttribute("data-subpagename")+"']");
    for (let i = 0; i < SPL.length; i++) SPL[i].onclick = bind(this.doSubpageOpen, this);
    this.ebackbutton.onclick = bind(this.doSubpageClose, this);
}

/*===================== Tablist =====================*/

function Tablist(e) {
    this.etablist = e;
    this.currenttab = document.getElementById("T"+this.etablist.getAttribute("data-defaulttabname"));
    //this.currenttab.style.visibility = "inherit";
    //this.currenttab.style.opacity = "1";
    this.currenttab.style.display = "block";
    this.currenttabitem = null;
    this.pseudotabs = this.etablist.classList.contains("Pseudotabs");
    this.lasttabitem = null;

    this.doTabClose = function() {
        //this.currenttab.style.opacity = "0";
        //this.currenttab.style.visibility = "hidden";
        this.currenttab.style.display = "none";
        if (this.currenttabitem != null)  this.currenttabitem.className = "";
        this.currenttab = document.getElementById("T"+this.etablist.getAttribute("data-defaulttabname"));
        //this.currenttab.style.visibility = "inherit";
        //this.currenttab.style.opacity = "1";
        this.currenttab.style.display = "block";
    };

    this.doTabOpen = function(event) {
        //this.currenttab.style.opacity = "0";
        //this.currenttab.style.visibility = "hidden";
        this.lasttabitem = this.currenttabitem;
        if (!this.pseudotabs) this.currenttab.style.display = "none";
        if (this.currenttabitem != null) this.currenttabitem.className = "";
        if (event.target.tagName === "LI") this.currenttabitem = event.target;
        else if (event.target.parentElement.tagName === "LI") this.currenttabitem = event.target.parentElement;
        else if (event.target.parentElement.parentElement.tagName === "LI") this.currenttabitem = event.target.parentElement.parentElement;
        this.currenttabitem.className = "Selected";
        if (!this.pseudotabs) this.currenttab = document.getElementById("T"+this.currenttabitem.getAttribute("data-tabname"));
        //this.currenttab.style.visibility = "visible";
        //this.currenttab.style.opacity = "1";
        if (!this.pseudotabs) this.currenttab.style.display = "block";
        //document.querySelectorAll(".MainMenu").item(0).className = "MainMenu Narrow";
    };

    this.doAddNewTab = function (name, type, text, caption) {
        let enewtabitem = document.createElement("li");
        enewtabitem.setAttribute("data-tabname", name);
        if (type === true) enewtabitem.innerHTML = "<div><div data-caption=\""+caption+"\">"+text+"</div></div>";
        else enewtabitem.innerHTML = text;
        enewtabitem.onclick = bind(this.doTabOpen, this);
        if (name === this.etablist.getAttribute("data-defaulttabname")) {
            enewtabitem.className = "Selected";
            this.currenttabitem = enewtabitem;
        }
        this.etablist.children[0].appendChild(enewtabitem);
    };

    this.doClearTabs = function() {
        this.etablist.children[0].innerHTML = "";
    };

    this.doSelectLastItem = function() {
        if (this.currenttabitem != null) this.currenttabitem.className = "";
        this.currenttabitem = this.lasttabitem;
        this.currenttabitem.className = "Selected";
    };

    this.doSelectItemByID = function(id) {
        if (this.etablist.children[0].children.length <= id) return;
        if (this.currenttabitem != null) this.currenttabitem.className = "";
        this.currenttabitem = this.etablist.children[0].children[id];
        this.currenttabitem.className = "Selected";
    };

    this.getSelectedItemName = function() {
        return this.currenttabitem.children[0].children[0].innerHTML;
    };

    this.getSelectedItemElement = function() {
        return this.currenttabitem.children[0].children[0];
    };

    this.getSelectedItemID = function() {
        let ID = 0;
        for (let i = 0; i < this.etablist.children[0].children.length; i++) {
            if (this.etablist.children[0].children[i] == this.currenttabitem) {
                ID = i;
                break;
            }
        }
        return ID;
    };

    this.getTabs = function() {
        return this.etablist.children[0].children;
    };

    for (let i = 0; i < this.etablist.children[0].children.length; i++) {
        if (this.etablist.children[0].children[i].getAttribute("data-tabname") === this.etablist.getAttribute("data-defaulttabname")) {
            this.currenttabitem = this.etablist.children[0].children[i];
            this.currenttabitem.className = "Selected";
        }
        this.etablist.children[0].children[i].onclick = bind(this.doTabOpen, this);
    }
}

/*===================== Scrollbox =====================*/

function Scrollbox(e) {
    this.escrollbox = e;
    this.escrolldata = e.children[0];

    this.CreateScrollbar = function() {
        this.escrollbarblock = document.createElement("div");
        this.escrollbartrack = document.createElement("div");
        this.escrollbarblock.className = "Scrollbar-block";
        this.escrollbartrack.className = "Scrollbar-track";
        this.escrollbox.appendChild(this.escrollbarblock);
        this.escrollbarblock.appendChild(this.escrollbartrack);
        this.escrollbartrack.style.height = this.escrollbox.offsetHeight * this.escrollbox.offsetHeight / this.escrolldata.offsetHeight + "px";
        this.escrollbartrack.ondragstart = function() {
            return false;
        };
        this.escrollbartrack.onmousedown = bind(this.OnStartMoveScrollbarTrack, this);
        this.escrollbox.onwheel = bind(this.OnWheelScrollbar, this);
        this.escrollbox.onmousewheel = bind(this.OnWheelScrollbar, this);
    };

    this.RemoveScrollbar = function() {
        if (this.escrollbarblock !== undefined) {
            this.escrollbox.removeChild(this.escrollbarblock);
            this.escrolldata.style.marginTop = "0px";
            delete this.escrollbartrack;
            delete this.escrollbarblock;
        }
    };

    this.doUpdateScrollbar = function() {
        if (this.escrollbox.offsetHeight < this.escrolldata.offsetHeight) {
            if (this.escrollbarblock !== undefined) {
                this.escrollbartrack.style.height = this.escrollbox.offsetHeight * this.escrollbox.offsetHeight / this.escrolldata.offsetHeight + "px";
                if (this.escrollbartrack.offsetTop+this.escrollbartrack.offsetHeight > this.escrollbox.offsetHeight)
                    this.escrollbartrack.style.marginTop = this.escrollbox.offsetHeight - this.escrollbartrack.offsetHeight + "px";
                this.escrolldata.style.marginTop = - this.escrollbartrack.offsetTop * (this.escrolldata.offsetHeight-this.escrollbox.offsetHeight)/(this.escrollbox.offsetHeight-this.escrollbartrack.offsetHeight) + "px";
            }
            else this.CreateScrollbar();
        } else this.RemoveScrollbar();
    };

    this.OnStartMoveScrollbarTrack = function(event) {
        event = event || fixEvent.call(this, window.event);
        this.scrollbartrackoffset = event.clientY - this.escrollbartrack.offsetTop;
        document.onmousemove = bind(this.OnMoveScrollbarTrack, this);
        document.onmouseup = bind(this.OnEndMoveScrollbarTrack, this);
    };

    this.OnMoveScrollbarTrack = function(event) {
        event = event || fixEvent.call(this, window.event);
        this.doMoveScrollbar(event.clientY-this.scrollbartrackoffset);
    };

    this.OnEndMoveScrollbarTrack = function() {
        document.onmousemove = null;
        document.onmouseup = null;
    };

    this.OnWheelScrollbar = function(event) {
        let d = 25;
        event = event || window.event;
        let ep = event.target;
        let hasnested = false;
        while (ep !== undefined && ep !== null && ep !== this.escrollbox) {
            if (ep.classList.contains("Scrolling")) hasnested = true;
            ep = ep.parentElement;
        }
        if (hasnested) return;
        if ((event.deltaY || event.detail || event.wheelDelta) < 0) d = -d;
        let delta = 0;
        if (this.escrollbartrack !== undefined) {
            delta = d * this.escrollbartrack.offsetHeight / this.escrollbox.offsetHeight;
            this.doMoveScrollbar(this.escrollbartrack.offsetTop+delta);
        } else this.doMoveScrollbar(0);
        //doCloseAllPopup(0);
    };

    this.doMoveScrollbar = function(pos) {
        if (this.escrollbartrack === undefined) {
            this.escrolldata.style.marginTop = "0";
            return;
        }
        this.escrollbartrack.style.marginTop = pos + "px";
        if (this.escrollbartrack.offsetTop+this.escrollbartrack.offsetHeight > this.escrollbox.offsetHeight)
            this.escrollbartrack.style.marginTop = this.escrollbox.offsetHeight - this.escrollbartrack.offsetHeight + "px";
        else if (this.escrollbartrack.offsetTop < 0)
            this.escrollbartrack.style.marginTop = 0 + "px";
        this.escrolldata.style.marginTop = -this.escrollbartrack.offsetTop * (this.escrolldata.offsetHeight-this.escrollbox.offsetHeight)/(this.escrollbox.offsetHeight-this.escrollbartrack.offsetHeight) + "px";
    };

    this.doScrollToEnd = function() {
        this.escrollbartrack.style.marginTop = this.escrollbox.offsetHeight - this.escrollbartrack.offsetHeight + "px";
        this.escrolldata.style.marginTop = -this.escrollbartrack.offsetTop * (this.escrolldata.offsetHeight-this.escrollbox.offsetHeight)/(this.escrollbox.offsetHeight-this.escrollbartrack.offsetHeight) + "px";
    }

    this.setScrollPosition = function(position) {
        let dx = 0;
        if (this.escrollbartrack !== undefined)
            dx = this.escrollbartrack.offsetHeight / this.escrollbox.offsetHeight;
        this.doMoveScrollbar(position*dx);
    };

    this.setScrollEnd = function() {
        this.doMoveScrollbar(this.escrollbox.offsetHeight);
    }

    this.isScrollOnEnd = function() {
        if (this.escrollbartrack === undefined) return true;
        return this.escrollbartrack.offsetTop+this.escrollbartrack.offsetHeight === this.escrollbox.offsetHeight;
    }
    
    this.getScrollbox = function () {
        return this.escrollbox;
    };

    if (this.escrollbox.offsetHeight < this.escrolldata.offsetHeight) this.CreateScrollbar();
    this.escrolldata.style.marginTop = "0px";
}

/*===================== Combobox =====================*/

function Combobox(e) {
    this.ecombobox = e;
    this.ecomboboxtitle = e.children[0];
    this.ecomboboxdata = e.children[2];
    this.state = 0;

    this.doOpenComboboxList = function() {
        this.ecomboboxdata.style.display = "block";
        this.ecombobox.classList.add("Opened");
    };

    this.doCloseComboboxList = function() {
        this.ecomboboxdata.style.display = "none";
        this.ecombobox.classList.remove("Opened");
    };

    this.doSetComboboxTitle = function(title, caption) {
        this.ecomboboxtitle.innerHTML = title;
        this.ecomboboxtitle.setAttribute("data-caption", caption);
    };

    this.doChangeState = function(event) {
        event = event || fixEvent.call(this, window.event);
        if (event.target.classList.contains("Disabled")) return;
        if (this.ecomboboxdata.style.display === "block") this.doCloseComboboxList();
        else this.doOpenComboboxList();
        if (event.target.tagName === "LI") {
            for (let i = 0; i < this.ecomboboxdata.childElementCount; i++) {
                if (this.ecomboboxdata.children[i] === event.target) {
                    this.state = i;
                    break;
                }
            }
            this.doSetComboboxTitle(event.target.innerHTML, event.target.getAttribute("data-caption"));
        }
    };

    this.setState = function(state) {
        this.state = state;
        this.doSetComboboxTitle(this.ecomboboxdata.children[state].innerHTML, this.ecomboboxdata.children[state].getAttribute("data-caption"));
    };

    this.getState = function() {
        return this.state;
    };

    this.doAddItem = function(title, caption) {
        let item = document.createElement("li");
        item.innerHTML = title;
        item.setAttribute("data-caption", caption);
        this.ecomboboxdata.appendChild(item);
    };

    this.doClear = function() {
        this.ecomboboxtitle.innerHTML = "";
        this.ecomboboxdata.innerHTML = "";
    };

    e.onclick = bind(this.doChangeState, this);
}

/*===================== MainMenu =====================*/

function MainMenu(e) {
    this.emainmenu = e;
    this.currentmenuitem = this.emainmenu.children[0];
    this.currentmenuitem.classList.add("Active");
    this.currentpage = document.getElementById("P"+this.currentmenuitem.getAttribute("data-pagename"));
    this.currentpage.classList.add("Show");

    this.doPageOpen = function(e) {
        this.currentpage.classList.remove("Show");
        this.currentmenuitem.classList.remove("Active");
        this.currentmenuitem = e;
        this.currentmenuitem.classList.add("Active");
        this.currentpage = document.getElementById("P"+this.currentmenuitem.getAttribute("data-pagename"));
        this.currentpage.classList.add("Show");
        //CloseAllSubpages();
        //CloseAllTablists();
        facefull.doUpdateAllScrollboxes();
    };

    this.doPageOpenByEvent = function(event) {
        this.doPageOpen(event.target);
    }

    this.doPageOpenByName = function(pname) {
        for (let i = 0; i < this.emainmenu.children.length; i++)
            if (this.emainmenu.children[i].getAttribute("data-pagename").toLowerCase() === pname) this.doPageOpen(this.emainmenu.children[i]);
    }

    this.getElement = function() {
        return this.emainmenu;
    }

    for (let i = 0; i < this.emainmenu.children.length; i++) this.emainmenu.children[i].onclick = bind(this.doPageOpenByEvent, this);
}

/*===================== Alert =====================*/

function AlertShow(caption, text, type = "info", buttons = "OK", callbacks = [], captionlid = "", textlid = "") {
    document.getElementById("AE").classList.remove("Warning");
    document.getElementById("AE").classList.remove("Error");
    switch (type) {
        case "info":
            break;
        case "warning":
            document.getElementById("AE").classList.add("Warning");
            break;
        case "error":
            document.getElementById("AE").classList.add("Error");
            break;
    }

    let eabok = document.getElementById("AB-OK");
    let eaby = document.getElementById("AB-Y");
    let eabn = document.getElementById("AB-N");
    eabok.style.display = "none";
    eaby.style.display = "none";
    eabn.style.display = "none";

    switch (buttons) {
        case "OK":
            eabok.style.display = "block";
            eaby.onclick = function() {
                AlertHideCustom(document.getElementById('AE'));
                if (callbacks.length > 0) callbacks[0]();
            }
            break;
        case "YESNO":
            eaby.style.display = "block";
            eabn.style.display = "block";
            eaby.onclick = function() {
                AlertHideCustom(document.getElementById('AE'));
                if (callbacks.length > 0) callbacks[0]();
            }
            eabn.onclick = function() {
                AlertHideCustom(document.getElementById('AE'));
                if (callbacks.length > 1) callbacks[1]();
            }
            break;
    }

    document.getElementById("AE").children[0].innerHTML = caption;
    document.getElementById("AE").children[0].setAttribute("data-caption", captionlid);
    document.getElementById("AE").children[1].innerHTML = text;
    document.getElementById("AE").children[1].setAttribute("data-caption", textlid);
    document.getElementById("AE").classList.remove("Scaled");
    document.getElementById("OV").style.display = "block";
    document.getElementById("AE").style.display = "block";
    document.getElementById("WA").className = "WorkArea Blur";
    setTimeout(function() {
        document.getElementById("AE").classList.remove("Scaled");
    }, 4);
}

function AlertHide() {
    document.getElementById("OV").style.display = "none";
    document.getElementById("AE").style.display = "none";
    document.getElementById("AE").classList.add("Scaled");
    document.getElementById("WA").className = "WorkArea";
}

function AlertShowCustom(eid) {
    let e = document.getElementById(eid);
    e.classList.remove("Scaled");
    //let ov = dociment.createElement("div");
    //ov.classList.add("Overlay");
    //document.getElementById("W").appendChild(ov);
    facefull.OverlayZIndex += 5;
    document.getElementById("OV").style.display = "block";
    document.getElementById("OV").style.zIndex = facefull.OverlayZIndex;
    e.style.display = "block";
    e.style.zIndex = facefull.OverlayZIndex + 1;
    document.getElementById("WA").className = "WorkArea Blur";
    setTimeout(function() {
        e.classList.remove("Scaled");
    }, 4);
}

function AlertHideCustom(e) {
    facefull.OverlayZIndex -= 5;
    e.style.display = "none";
    e.classList.add("Scaled");
    let eas = document.getElementsByClassName("Alert");
    let adflag = false;
    for (let i = 0; i < eas.length; i++) {
        if (eas[i].style.display === "block") {
            adflag = true;
            break;
        }
    }
    if (adflag) document.getElementById("OV").style.zIndex = facefull.OverlayZIndex;
    else {
        document.getElementById("OV").style.display = "none";
        document.getElementById("WA").className = "WorkArea";
        facefull.OverlayZIndex = 200;
    }
}

/*===================== Progressbar =====================*/

function setProgressbarPosition(pbid, pos) {
    if (pos > 100) pos = 100;
    else if (pos < 0) pos = 0;
    document.getElementById(pbid).children[0].style.width = pos+"%";
}

/*===================== Categorylist =====================*/

function Categorylist(e) {
    this.ecatlist = e;
    this.scrollbox = null;
    //this.itemheight = 36;
    this.ecats = [];
    this.nocheckboxes = false;
    this.defaultopened = false;
    this.itemdata = [];
    this.selectable = this.ecatlist.classList.contains("Selectable");
    this.selecteditemeid = null;
    this.onTryChangeState = null;
    this.onSelect = null;
    this.onCheck = null;

    this.doInit = function() {
        //this.ecats = this.ecatlist.children[0].children;
        for (let i = 0; i < this.ecats.length; i++) {
            this.ecats[i].children[0].onclick = bind(this.onCategoryClick, this);
            let icount = this.ecats[i].children[1].childElementCount;
            let csum = 0;
            for (let k = 0; k < icount; k++) {
                csum += this.ecats[i].children[1].children[k].offsetHeight;
            }
            this.ecats[i].children[1].style.height = csum + "px";
            this.ecats[i].children[1].className = "Closed";
            for (let j = 0; j < this.ecats[i].children[1].childElementCount; j++)
                this.ecats[i].children[1].children[j].onclick = bind(this.onItemClick, this);
        }
        if (this.ecatlist.parentElement.classList.contains("Scrolldata")) { // TODO: Scrollbox updater
            for (let i = 0; i < facefull.Scrollboxes.length; i++)
                if (facefull.Scrollboxes[i].getScrollbox() === this.ecatlist.parentElement.parentElement)
                    this.scrollbox = facefull.Scrollboxes[i];
        }
    };

    this.doAddHeaderBlock = function(caption, text) {
        let ehb = document.createElement("li");
        ehb.setAttribute("data-caption", caption);
        ehb.className = "Header";
        ehb.innerHTML = text;
        this.ecatlist.children[0].appendChild(ehb);
    };

    this.doAddCategory = function(caption, text, idmod = "0") {
        let ecat = document.createElement("li");
        if (!this.nocheckboxes) {
            ecat.innerHTML = "<div><input type=\"checkbox\" id=\"CLC-"+caption+"MOD"+idmod+"\" style=\"display:none\"><label for=\"CLC-"+caption+"MOD"+idmod+"\" class=\"Checkbox\"></label><span data-caption=\""+caption+"\">"+text+"</span><div class=\"ArrowP\"></div></div><ul></ul>";
        } else {
            ecat.innerHTML = "<div><span data-caption=\""+caption+"\">"+text+"</span><div class=\"ArrowP\"></div></div><ul></ul>";
        }
        ecat.children[0].onclick = bind(this.onCategoryClick, this);
        if (!this.defaultopened) ecat.children[1].className = "Closed";
        this.ecatlist.children[0].appendChild(ecat);
        this.ecats.push(ecat);
    };

    this.doAddItemToCategoryD = function(cid, caption, text, data, idmod = "0") {
        this.doAddItemToCategory(cid, caption, text, idmod);
        if (this.itemdata[cid] === null || this.itemdata[cid] === undefined) this.itemdata[cid] = [];
        this.itemdata[cid].push(data);
    };

    this.doAddItemToCategory = function(cid, caption, text, idmod = "0") {
        let eitem = document.createElement("li");
        if (!this.nocheckboxes) {
            let id = "CLC-"+caption+cid+"-E"+this.ecats[cid].children[1].childElementCount+"MOD"+idmod;
            eitem.innerHTML = "<input type=\"checkbox\" id=\""+id+"\" style=\"display:none\"><label for=\""+id+"\" class=\"Checkbox\"></label><span class=\"ListItem\" data-caption=\""+caption+"\">"+text+"</span>";
        } else {
            eitem.innerHTML = "<span class=\"ListItem\" data-caption=\""+caption+"\">"+text+"</span>";
        }
        eitem.onclick = bind(this.onItemClick, this);
        eitem.setAttribute("data-id", caption);
        this.ecats[cid].children[1].appendChild(eitem);
        //let icount = this.ecats[cid].children[1].childElementCount;
        //this.ecats[cid].children[1].style.height = this.itemheight * icount + "px";
        this.ecats[cid].children[0].children[this.ecats[cid].children[0].childElementCount-1].style.display = "inline-block";
    };

    this.onCategoryClick = function(event) {
        event = event || fixEvent.call(this, window.event);
        let ecat;
        if (event.target.parentElement.tagName === "LI") ecat = event.target.parentElement;
        else if (event.target.parentElement.parentElement.tagName === "LI") ecat = event.target.parentElement.parentElement;
        else ecat = event.target.parentElement.parentElement.parentElement;
        if (event.target.tagName === "INPUT" || event.target.className === "Checkbox") {
            let ech = event.target.parentElement.children[0]; // || event.target.tagName === "SPAN"
            if (!this.nocheckboxes) this.doCheckUncheckCategory(ech, ecat.children[1]);
            if (this.onTryChangeState !== null) this.onTryChangeState();
            return;
        }
        if (ecat.children[1].className === "Closed") this.doOpenCategory(ecat);
        else this.doCloseCategory(ecat);
        let sb = this.scrollbox;
        if (sb === undefined || sb === null) return;
        setTimeout(function() {
            sb.doUpdateScrollbar();
        }, 50);
    };

    this.doUpdateCategoryState = function(el) {
        let states = 0;
        let ecatch = el.parentElement.children[0].children[0];
        for (let i = 0; i < el.childElementCount; i++) states += el.children[i].children[0].checked;
        if (states === el.childElementCount) {
            ecatch.checked = true;
            ecatch.indeterminate = false;
        } else if (states > 0) {
            ecatch.checked = false;
            ecatch.indeterminate = true;
        } else {
            ecatch.checked = false;
            ecatch.indeterminate = false;
        }
    };

    this.onItemClick = function(event) {
        let ech;
        if (event.target.className === "Checkbox" || event.target.tagName === "INPUT") ech = event.target.parentElement.children[0];
        else if (this.selectable) {
            if (event.target.tagName === "SPAN") ech = event.target.parentElement;
            else ech = event.target;
            if (this.selecteditemeid !== null) this.selecteditemeid.classList.remove("Selected");
            ech.classList.add("Selected");
            this.selecteditemeid = ech;
            if (this.onSelect !== null) this.onSelect(ech.getAttribute("data-id"), ech);
            return;
        } else return;
        let el = ech.parentElement.parentElement;
        this.doUpdateCategoryState(el);
        if (this.onCheck !== null) this.onCheck();
        if (this.onTryChangeState !== null) this.onTryChangeState(ech.parentElement);
    };

    this.doCheckUncheckCategory = function(ec, el) {
        let checked = ec.checked; // || (!ec.checked && ec.indeterminate);
        for (let i = 0; i < el.childElementCount; i++) {
            if (el.children[i].children[0].tagName === "INPUT") el.children[i].children[0].checked = checked;
        }
    };

    this.doCloseCategory = function(e) {
        if (!this.nocheckboxes) e.children[0].children[3].className = "ArrowP";
        else e.children[0].children[1].className = "ArrowP";
        e.children[1].className = "Closed";
    };

    this.doOpenCategory = function(e) {
        if (!this.nocheckboxes) e.children[0].children[3].className = "ArrowP Opened";
        else e.children[0].children[1].className = "ArrowP Opened";
        e.children[1].className = "";
    };

    this.doCheckAll = function() {
        for (let i = 0; i < this.ecats.length; i++) {
            this.ecats[i].children[0].children[0].checked = true;
            if (!this.nocheckboxes) this.doCheckUncheckCategory(this.ecats[i].children[0].children[0], this.ecats[i].children[1]);
        }
    };

    this.doUncheckAll = function() {
        for (let i = 0; i < this.ecats.length; i++) {
            this.ecats[i].children[0].children[0].checked = false;
            if (!this.nocheckboxes) this.doCheckUncheckCategory(this.ecats[i].children[0].children[0], this.ecats[i].children[1]);
        }
    };

    this.doClear = function() {
        this.ecatlist.children[0].innerHTML = "";
        this.ecats = [];
    };

    this.setCategoryChecked = function (cid, state) {
        this.ecats[cid].children[0].children[0].checked = state;
        this.doUpdateCategoryState(this.ecats[cid].children[1]);

    };

    this.setItemChecked = function (cid, iid, state) {
        this.ecats[cid].children[1].children[iid].children[0].checked = state;
        this.doUpdateCategoryState(this.ecats[cid].children[1]);
    };

    this.setDefaultOpened = function() {
        this.defaultopened = true;
    };

    this.setNoCheckboxes = function() {
        this.nocheckboxes = true;
    };

    this.setYCheckboxes = function() {
        this.nocheckboxes = false;
    };

    this.getItem = function(cid, iid) {
        return this.ecats[cid].children[1].children[iid];
    };

    this.getItemData = function(cid) {
        return this.itemdata[cid];
    };

    this.getCategoryLabel = function(cid) {
        return this.ecats[cid].children[0].children[2];
    };

    this.getChecklistByCategory = function(cid) {
        let checklist = [];
        for (let j = 0; j < this.ecats[cid].children[1].childElementCount; j++) {
            let eitem = this.ecats[cid].children[1].children[j].children[0];
            checklist.push(eitem.tagName==="INPUT"?eitem.checked:this.ecats[cid].children[0].children[0].checked);
        }
        return checklist;
    };
    
    this.getChecklist = function() {
        let checklist = [];
        for (let i = 0; i < this.ecats.length; i++) {
            checklist.push(this.ecats[i].children[0].children[0].checked);
            for (let j = 0; j < this.ecats[i].children[1].childElementCount; j++) {
                let eitem = this.ecats[i].children[1].children[j].children[0];
                checklist.push(eitem.tagName==="INPUT"?eitem.checked:this.ecats[i].children[0].children[0].checked);
            }
        }
        return checklist;
    };

    this.getChecklistWOC = function() {
        let checklist = [];
        for (let i = 0; i < this.ecats.length; i++) {
            for (let j = 0; j < this.ecats[i].children[1].childElementCount; j++) {
                checklist.push(this.ecats[i].children[1].children[j].children[0].checked);
            }
        }
        return checklist;
    };

    this.getItemlistWOC = function() {
        let itemlist = [];
        for (let i = 0; i < this.ecats.length; i++) {
            for (let j = 0; j < this.ecats[i].children[1].childElementCount; j++) {
                itemlist.push(this.ecats[i].children[1].children[j]);
            }
        }
        return itemlist;
    };

    this.getChecklistC = function() {
        let checklist = [];
        for (let i = 0; i < this.ecats.length; i++) {
            checklist.push(this.ecats[i].children[0].children[0].checked);
        }
        return checklist;
    };

    this.getChecklistStr = function() {
        let checkliststr = "";
        let checklist = this.getChecklist();
        for (let i = 0; i < checklist.length; i++) {
            if (checklist[i]) checkliststr += "1";
            else checkliststr += "0";
        }
        return checkliststr;
    };

    this.getChecklistWOCStr = function() {
        let checkliststr = "";
        let checklist = this.getChecklistWOC();
        for (let i = 0; i < checklist.length; i++) {
            if (checklist[i]) checkliststr += "1";
            else checkliststr += "0";
        }
        return checkliststr;
    };

    this.getChecklistCStr = function() {
        let checkliststr = "";
        let checklist = this.getChecklistC();
        for (let i = 0; i < checklist.length; i++) {
            if (checklist[i]) checkliststr += "1";
            else checkliststr += "0";
        }
        return checkliststr;
    };

    this.getCategoryCount = function() {
        return this.ecats.length;
    };

    this.getCategoryItemCount = function(cid) {
        return this.ecats[cid].children[1].childElementCount;
    };

    this.doShowList = function() {
        this.ecatlist.style.display = "block";
    };

    this.doHideList = function() {
        this.ecatlist.style.display = "none";
    };

    this.doInit();
}

/*===================== Popup Menu =====================*/

function PopupMenu(e) {
    this.epmtarget = e;
    this.epm = document.getElementById(this.epmtarget.getAttribute("data-popupmenu"));
    this.epm.onmouseup = bind(function() {
        setTimeout(function() {
            facefull.doCloseGlobalPopupMenu();
        }, 10);
    }, this);

    this.doOpenPopupMenu = function() {
        if (!this.epmtarget.classList.contains("PopupMenuTarget")) return;
        let did = this.epmtarget.getAttribute("data-id");
        if (did !== undefined) this.epm.setAttribute("data-id", did);
        this.epm.style.left = this.epmtarget.offsetLeft + "px";
        this.epm.style.top = this.epmtarget.offsetTop + this.epmtarget.offsetHeight + 10 + "px";
        this.epm.style.display = "block";
        facefull.LastGlobalOpenedPopupMenu = this.epm;
        facefull.LastGlobalOpenedPopupMenuTarget = this.epmtarget;
    }

    this.epmtarget.onclick = bind(this.doOpenPopupMenu, this);
}

/*===================== Tooltip =====================*/

function Tooltip(e) {
    this.etooltiptarget = e;
    this.edefaulttooltip = document.getElementById("TT");
    this.timer = null;

    this.onMouseOver = function() {
        let dc = this.etooltiptarget.getAttribute("data-tooltip-text");
        let dcid = this.etooltiptarget.getAttribute("data-tooltip-textid");
        let dw = this.etooltiptarget.getAttribute("data-tooltip-width");
        if (dcid && dcid !== "") this.edefaulttooltip.setAttribute("data-caption", dcid);
        if (dc && dc !== "") this.edefaulttooltip.innerHTML = dc;
        this.edefaulttooltip.style.width = dw + "px";

        let pos = this.etooltiptarget.getAttribute("data-tooltip-pos");
        let ts = 0;

        switch(pos) {
            case 'left':
                this.edefaulttooltip.style.left = this.etooltiptarget.offsetLeft - parseInt(dw) - 30 + "px";
                ts = (this.etooltiptarget.offsetHeight-this.edefaulttooltip.offsetHeight) / 2;
                this.edefaulttooltip.style.top = this.etooltiptarget.offsetTop + ts + "px";
                break;
            case 'right':
                this.edefaulttooltip.style.left = this.etooltiptarget.offsetLeft + this.etooltiptarget.offsetWidth + 10 + "px";
                ts = (this.etooltiptarget.offsetHeight - this.edefaulttooltip.offsetHeight) / 2;
                this.edefaulttooltip.style.top = this.etooltiptarget.offsetTop + ts + "px";
                break;
            case 'bottom':
                this.edefaulttooltip.style.top = this.etooltiptarget.offsetTop + this.etooltiptarget.offsetHeight + 20 + "px";
                ts = (this.etooltiptarget.offsetWidth-this.edefaulttooltip.offsetWidth) / 2;
                this.edefaulttooltip.style.left = this.etooltiptarget.offsetLeft + ts + "px";
                break;
        }

        this.timer = setTimeout(bind(function() {
            this.edefaulttooltip.style.visibility = "visible";
        }, this), 800);
    };

    this.onMouseOut = function() {
        clearTimeout(this.timer);
        this.edefaulttooltip.style.visibility = "hidden";
    };

    this.etooltiptarget.onmouseover = bind(this.onMouseOver, this);
    this.etooltiptarget.onmouseout = bind(this.onMouseOut, this);
}

/*===================== Pulse chart =====================*/

function doCreatePulseChart(eid, values, labels, data = []) {
    this.e = document.getElementById(eid);
    this.e.innerHTML = "";
    for (let i = 0; i < values.length; i++) {
        let epb = document.createElement("div");
        let epvb = document.createElement("div");
        let epv = document.createElement("div");
        let epl = document.createElement("div");
        epb.className = "PulseBlock";
        if (data.length) epb.setAttribute("data-info", data[i]);
        epvb.className = "PulseValueBox";
        epv.className = "PulseValue";
        epl.className = "PulseLabel";

        epv.style.height = values[i]+"%";
        epl.innerHTML = labels[i];

        epvb.appendChild(epv);
        epb.appendChild(epvb);
        epb.appendChild(epl);

        this.e.appendChild(epb);
    }
}

/*===================== Selectable list =====================*/

function SelectableList(e) {
    this.elist = e;
    this.sid = 0;

    this.doSelect = function(sid) {
        if (this.sid !== null && this.sid >= 0 && this.sid < this.elist.children.length) this.elist.children[this.sid].classList.remove("Selected");
        this.sid = sid;
        if (this.sid !== null && this.sid >= 0 && this.sid < this.elist.children.length) this.elist.children[this.sid].classList.add("Selected");
    }

    this.doAdd = function(data) {
        let eli = document.createElement("li");
        let i = this.elist.children.length;
        eli.innerHTML = data;
        eli.onclick = bind(function() {
            this.doSelect(i);
        }, this);
        this.elist.appendChild(eli);
    }

    this.doClear = function() {
        this.elist.innerHTML = "";
    }

    this.getState = function() {
        return this.sid
    }

    this.getSelectedElement = function() {
        return this.sid !== null && this.sid >= 0?this.elist.children[this.sid]:null;
    }

    for (let i = 0; i < this.elist.children.length; i++) {
        this.elist.children[i].onclick = bind(function() {
            this.doSelect(i);
        }, this);
    }
}

/*===================== DropArea =====================*/

function DropArea(e) {
    this.eda = e;
    this.onFilesCaptured = function(filedata) {};

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        this.eda.addEventListener(eventName, function(e) {
            e.preventDefault()
            e.stopPropagation()
        }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        this.eda.addEventListener(eventName, bind(function(){
            this.eda.classList.add('Active');
        }, this), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        this.eda.addEventListener(eventName, bind(function(){
            this.eda.classList.remove('Active');
        }, this), false);
    });

    this.doDropCapture = function(e) {
        let dt = e.dataTransfer;
        let files = dt.files;
        this.onFilesCaptured(files);
    }

    this.eda.addEventListener('drop', bind(this.doDropCapture, this), false);
}

/*===================== Tabs =====================*/

function Tabs(e) {
    this.etabs = e;
    this.elasttab = null;

    this.onTabChanged = function(i){};

    this.doInitTabs = function() {
        for (let i = 0; i < this.etabs.children.length; i++) {
            this.etabs.children[i].onclick = bind(function() {
                if (this.elasttab) this.elasttab.classList.remove("Selected");
                this.etabs.children[i].classList.add("Selected");
                this.elasttab = this.etabs.children[i];
                this.onTabChanged(i);
            }, this);
        }
    }

    this.doSelectTab = function(num) {
        this.etabs.children[num].onclick();
    }

    this.doInitTabs();
}
