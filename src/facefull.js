/////////////////////////////////////////////////////////////////////////////
// Name:        facefull.js
// Purpose:     Main Facefull module
// Author:      Nickolay Babbysh
// Version:     0.9.4
// Copyright:   (c) NickWare Group
// Licence:     MIT
/////////////////////////////////////////////////////////////////////////////

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
    this.Categorylists = [];
    this.Lists = [];
    this.Tooltips = [];
    this.PopupMenus = [];
    this.DropAreas = [];
    this.Tabs = [];
    this.Circlebars = [];
    this.Counters = [];
    this.HotkeyHolders = [];
    this.ItemPickers = [];
    this.LastGlobalOpenedPopupMenu = null;
    this.LastGlobalOpenedPopupMenuTarget = null;
    this.Subpagelevel = 0;
    this.MainMenuBox = null;
    this.OverlayZIndex = 200;
    this.EventTable = [];
    this.Themes = null;
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
        for (let i in this.Subpages) {
            if (this.Subpages.hasOwnProperty(i))
                this.Subpages[i].doSubpageClose();
        }
    }

    this.doCloseAllTablists = function() {
        for (let i in this.Tablists) {
            if (this.Tablists.hasOwnProperty(i))
                this.Tablists[i].doTabClose();
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
        if (this.LastGlobalOpenedPopupMenu) {
            if (this.LastGlobalOpenedPopupMenu.epm.contains(event.target) ||
                this.LastGlobalOpenedPopupMenu.epmtarget.contains(event.target) ) return;
        }
        this.doCloseGlobalPopupMenu();
    }

    this.doCloseGlobalPopupMenu = function() {
        if (this.LastGlobalOpenedPopupMenu) this.LastGlobalOpenedPopupMenu.doClosePopupMenu();
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

    this.doInit = function(disableContextmenu = false) {
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

        let lists = document.querySelectorAll(".List");
        for (let i = 0; i < lists.length; i++) {
            let did = lists[i].getAttribute("data-listname");
            this.Lists[did] = new List(lists[i]);
        }

        let catlists = document.querySelectorAll(".Categorylist");
        for (let i = 0; i < catlists.length; i++) this.Categorylists.push(new Categorylist(catlists[i]));

        this.MainMenuBox = new MainMenu(document.querySelectorAll(".MainMenuItems").item(0));

        let tooltips = document.querySelectorAll(".TooltipTarget");
        for (let i = 0; i < tooltips.length; i++) this.Tooltips.push(new Tooltip(tooltips[i]));

        let popupmenus = document.querySelectorAll(".PopupMenuTarget");
        for (let i = 0; i < popupmenus.length; i++) {
            let did = popupmenus[i].getAttribute("data-popupmenu");
            this.PopupMenus[did] = new PopupMenu(popupmenus[i]);
        }

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

        let circles = document.querySelectorAll(".Circlebar");
        for (let i = 0; i < circles.length; i++) {
            let did = circles[i].getAttribute("data-circlebarname");
            this.Circlebars[did] = new Circlebar(circles[i]);
        }

        let counters = document.querySelectorAll(".Counter");
        for (let i = 0; i < counters.length; i++) {
            let did = counters[i].getAttribute("data-countername");
            this.Counters[did] = new Counter(counters[i]);
        }

        let hotkeyholders = document.querySelectorAll(".HotkeyHolder");
        for (let i = 0; i < hotkeyholders.length; i++) {
            let did = hotkeyholders[i].getAttribute("data-hotkeyholdername");
            this.HotkeyHolders[did] = new HotkeyHolder(hotkeyholders[i]);
        }

        let itempickers = document.querySelectorAll(".ItemPicker");
        for (let i = 0; i < itempickers.length; i++) {
            let did = itempickers[i].getAttribute("data-itempickername");
            this.ItemPickers[did] = new List(itempickers[i], "picker");
        }

        window.addEventListener("mousedown", bind(function(event) {
            this.doCloseAllPopup(event);
        }, this));
        window.addEventListener("resize", bind(function() {
            this.doUpdateAllScrollboxes();
        }, this));

        this.Themes = new ThemeManager();

        if (native) {
            if (disableContextmenu) {
                document.addEventListener('contextmenu', function (event) {
                    event.preventDefault();
                    return false;
                }, false);
            }
            this.doWindowHeaderInit();
        }
    }
}

/*===================== ThemeManager =====================*/

function ThemeManager() {
    this.table = [];
    this.current = 0;
    this.onThemeApply = function(id){}

    this.doAttachThemeFile = function(themename, filenames = []) {
        this.table.push({themename: themename, filenames: filenames});
    }

    this.doApplyTheme = function(id) {
        if (this.current) {
            this.table[this.current].filenames.forEach(filename => {
                facefull.doCSSUnload(filename);
            });
        }
        this.current = id;
        if (id) {
            this.table[id].filenames.forEach(filename => {
                facefull.doCSSLoad(filename);
            });
        }
        this.onThemeApply(id);
    }
    
    this.setDefaultThemeName = function(name) {
        this.table[0] = {themename: name, filename: ""};
    }

    this.getCurrentThemeID = function() {
        return this.current;
    }

    this.getThemeList = function() {
        return this.table;
    }

    this.doAttachThemeFile("Original", "");
}

/*===================== Subpage =====================*/

function Subpage(e) {
    this.esubpage = e;
    this.ebackbutton = this.esubpage.children[0].children[0];
    this.opened = false;

    this.doSubpageClose = function() {
        if (!this.opened) return;
        this.esubpage.classList.remove("Show");
        if (facefull.Subpagelevel > 0) facefull.Subpagelevel--;
        this.opened = false;
    };

    this.doSubpageOpen = function() {
        if (this.opened) return;
        this.esubpage.classList.add("Show");
        this.esubpage.style.zIndex = (facefull.Subpagelevel+1)*10;
        facefull.Subpagelevel++;
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
        let d = 60;
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
    this.ecomboboxtitle = e.children[0].children[0];
    this.ecomboboxdata = e.children[1];
    this.state = 0;
    this.onChangeState = function(state){};

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
                    this.onChangeState(this.state);
                    break;
                }
            }
            this.doSetComboboxTitle(event.target.innerHTML, event.target.getAttribute("data-caption"));
        }
    };

    this.setState = function(state) {
        this.state = state;
        this.onChangeState(this.state);
        this.doSetComboboxTitle(this.ecomboboxdata.children[state].innerHTML, this.ecomboboxdata.children[state].getAttribute("data-caption"));
    };

    this.getState = function() {
        return this.state;
    };

    this.doAddItem = function(title, caption = "") {
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
    this.onPageOpen = function(name) {}

    this.doPageOpen = function(e) {
        this.currentpage.classList.remove("Show");
        this.currentmenuitem.classList.remove("Active");
        this.currentmenuitem = e;
        this.currentmenuitem.classList.add("Active");
        let pname = this.currentmenuitem.getAttribute("data-pagename");
        this.currentpage = document.getElementById("P"+pname);
        this.currentpage.classList.add("Show");
        this.onPageOpen(pname);
    };

    this.doPageOpenByEvent = function(event) {
        this.doPageOpen(event.target);
    }

    this.doPageOpenByName = function(pname) {
        for (let i = 0; i < this.emainmenu.children.length; i++)
            if (this.emainmenu.children[i].getAttribute("data-pagename").toLowerCase() === pname) this.doPageOpen(this.emainmenu.children[i]);
    }

    this.isPageOpened = function(id) {
        return this.currentpage.id === "P"+id;
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
            eabok.onclick = function() {
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
    document.getElementById("OV").style.display = "block";
    document.getElementById("AE").style.display = "block";
    document.getElementsByClassName("GlobalArea")[0].classList.add("Blur");
}

function AlertShowCustom(eid) {
    let e = document.getElementById(eid);
    facefull.OverlayZIndex += 5;
    document.getElementById("OV").style.display = "block";
    document.getElementById("OV").style.zIndex = facefull.OverlayZIndex;
    e.style.display = "block";
    e.style.zIndex = facefull.OverlayZIndex + 1;
    document.getElementsByClassName("GlobalArea")[0].classList.add("Blur");
}

function AlertHideCustom(e) {
    facefull.OverlayZIndex -= 5;
    e.style.display = "none";
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
        document.getElementsByClassName("GlobalArea")[0].classList.remove("Blur");
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
    this.autoclose = true;
    this.onChangeState = function(state){}

    if (this.epmtarget.getAttribute("data-popupmenu-autoclose") !== undefined)
        this.autoclose = !(this.epmtarget.getAttribute("data-popupmenu-autoclose")==="0");

    this.epm.onmouseup = bind(function() {
        setTimeout(bind(function() {
            if (!this.autoclose) return;
            facefull.doCloseGlobalPopupMenu();
        }, this), 10);
    }, this);

    this.doOpenPopupMenu = function() {
        if (!this.epmtarget.classList.contains("PopupMenuTarget")) return;

        let notopenedflag = !this.isOpened();

        let did = this.epmtarget.getAttribute("data-id");
        if (did !== undefined) this.epm.setAttribute("data-id", did);

        let pos = this.epmtarget.getAttribute("data-popupmenu-pos");
        let width = parseInt(this.epmtarget.getAttribute("data-popupmenu-width"));
        if (isNaN(width)) width = 200;
        this.epm.style.width = width + "px";
        switch (pos) {
            default:
            case 'bottom-left':
                this.epm.style.left = this.epmtarget.offsetLeft + "px";
                this.epm.style.top = this.epmtarget.offsetTop + this.epmtarget.offsetHeight + 10 + "px";
                break;
            case 'bottom-right':
                this.epm.style.left =  this.epmtarget.offsetLeft + (this.epmtarget.offsetWidth-width) + "px";
                this.epm.style.top = this.epmtarget.offsetTop + this.epmtarget.offsetHeight + 10 + "px";
                break;
            case 'bottom-center':
                this.epm.style.left =  this.epmtarget.offsetLeft - width/2 + this.epmtarget.offsetWidth/2 + "px";
                this.epm.style.top = this.epmtarget.offsetTop + this.epmtarget.offsetHeight + 10 + "px";
                break;
        }

        this.epm.style.display = "block";
        facefull.LastGlobalOpenedPopupMenu = this;
        facefull.LastGlobalOpenedPopupMenuTarget = this.epmtarget;
        if (notopenedflag) this.onChangeState(true);
    }

    this.doClosePopupMenu = function() {
        if (this.isOpened()) this.onChangeState(false);
        this.epm.style.display = "none";
    }

    this.isOpened = function() {
        return this.epm.style.display === "block";
    }

    this.epmtarget.onclick = bind(function() {
        if (this.isOpened()) this.doClosePopupMenu();
        else this.doOpenPopupMenu();
    }, this);
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
        this.edefaulttooltip.setAttribute("data-caption", "");
        this.edefaulttooltip.innerHTML = "";
        if (dcid && dcid !== "") this.edefaulttooltip.setAttribute("data-caption", dcid);
        if (dc && dc !== "") this.edefaulttooltip.innerHTML = dc;
        this.edefaulttooltip.style.width = dw + "px";

        let pos = this.etooltiptarget.getAttribute("data-tooltip-pos");
        let ts = 0;

        switch (pos) {
            case 'left':
                this.edefaulttooltip.style.left = this.etooltiptarget.getBoundingClientRect().left - parseInt(dw) - 30 + "px";
                ts = (this.etooltiptarget.offsetHeight-this.edefaulttooltip.offsetHeight) / 2;
                this.edefaulttooltip.style.top = this.etooltiptarget.getBoundingClientRect().top + ts + "px";
                break;
            case 'right':
                this.edefaulttooltip.style.left = this.etooltiptarget.getBoundingClientRect().left + this.etooltiptarget.offsetWidth + 10 + "px";
                ts = (this.etooltiptarget.offsetHeight - this.edefaulttooltip.offsetHeight) / 2;
                this.edefaulttooltip.style.top = this.etooltiptarget.getBoundingClientRect().top + ts + "px";
                break;
            default:
            case 'bottom':
                this.edefaulttooltip.style.top = this.etooltiptarget.getBoundingClientRect().top + this.etooltiptarget.offsetHeight + 20 + "px";
                ts = (this.etooltiptarget.offsetWidth-this.edefaulttooltip.offsetWidth) / 2;
                this.edefaulttooltip.style.left = this.etooltiptarget.getBoundingClientRect().left + ts + "px";
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

/*===================== List =====================*/

function List(e, mode = "list") {
    this.elist = e;
    this.selectable = this.elist.classList.contains("Selectable");
    this.arrowdefaultopened =  this.elist.getAttribute("data-list-defaultsubopened");
    this.sid = null;
    this.mode = mode;
    this.itemtree = [];
    this.maxlevel = 0;
    this.subitemmargin = this.elist.getAttribute("data-list-submargin");
    this.onSelect = function(id){};
    this.onCheckboxChange = function(id, state){};
    this.onOpenCloseSubItems = function(id, state){};

    this.doInit = function() {
        if (this.selectable || this.mode === "picker") {
            for (let i = 0; i < this.elist.children.length; i++) {
                this.elist.children[i].onclick = bind(function () {
                    this.doSelect(i);
                }, this);
            }
        }
    }

    this.doSelect = function(sid) {
        if (this.sid !== null && this.sid >= 0 && this.sid < this.elist.children.length) this.elist.children[this.sid].classList.remove("Selected");
        this.sid = sid;
        if (this.sid !== null && this.sid >= 0 && this.sid < this.elist.children.length) {
            this.elist.children[this.sid].classList.add("Selected");
            this.onSelect(sid);
        }
    }

    this.doAdd = function(data = [], level = 0, flags = {checkbox: "none", action: "none"}) {
        let eli = this.mode==="picker"?document.createElement("div"):document.createElement("li");
        if (this.mode === "picker") {
            this.elist.appendChild(eli);
            return;
        }
        let lastindx = this.elist.children.length;
        let einput = null;
        if (this.maxlevel < level) this.maxlevel = level;
        for (let i in data) {
            let columndata = data[i];
            let ecolumn = "";
            if (columndata.element !== undefined) {
                eli.appendChild(columndata.element);
                ecolumn = columndata.element
            } else {
                ecolumn = document.createElement("div");
                ecolumn.innerHTML = columndata;
            }

            if (i == 0 && flags.checkbox !== undefined && flags.checkbox !== "none") {
                let name = this.elist.getAttribute("data-listname");
                let echeckbox = document.createElement("div");
                einput = document.createElement("input");
                let elabel = document.createElement("label");
                einput.type = "checkbox";
                einput.id = name+'-I'+lastindx+'-CH';
                if (flags.checkbox === "checked") einput.checked = true;
                elabel.setAttribute("for", name+'-I'+lastindx+'-CH');
                elabel.className = "Checkbox";
                ecolumn.classList.add("Checkboxed");
                elabel.appendChild(ecolumn);
                einput.onclick = bind(this.doCheckboxUpdate, this);
                echeckbox.appendChild(einput);
                echeckbox.appendChild(elabel);
                eli.appendChild(echeckbox);
            } else eli.appendChild(ecolumn);
        }

        let eaction = document.createElement("div");
        if (flags.action !== undefined && flags.action === "arrow") {
            if (this.arrowdefaultopened === undefined || this.arrowdefaultopened === null || this.arrowdefaultopened === "0") eaction.className = "Arrow";
            else eaction.className = "Arrow Opened";
            eli.addEventListener("click", bind(function() {
                this.doOpenClose();
            }, this));
        } else if (flags.action !== undefined && flags.action === "popupmenu") {
            eaction.className = "Action PopupMenuTarget";
            if (flags.popupmenu_name !== undefined)
                eaction.setAttribute("data-popupmenu", flags.popupmenu_name);
            if (flags.popupmenu_pos !== undefined)
                eaction.setAttribute("data-popupmenu-pos", flags.popupmenu_pos);
            else
                eaction.setAttribute("data-popupmenu-pos", "bottom-center");
            eaction.setAttribute("data-id", lastindx);
            new PopupMenu(eaction);
        }
        eli.appendChild(eaction);

        if (this.selectable) {
            eli.addEventListener("click", bind(function() {
                this.doSelect(lastindx);
            }, this));
        }

        if (level > 0) {
            if (this.arrowdefaultopened === undefined || this.arrowdefaultopened === null || this.arrowdefaultopened === "0")
                eli.classList.add("Hidden");
            eli.classList.add("Sub");
            let margin = this.subitemmargin;
            if (margin === undefined || margin === null) margin = 30;
            eli.style.marginLeft = level*margin + "px";
            eli.setAttribute("data-list-itemlevel", level);
        } else eli.setAttribute("data-list-itemlevel", "0");

        eli.setAttribute("data-list-itemid", lastindx);
        this.elist.appendChild(eli);

        if (level > 0 && flags.checkbox !== undefined && flags.checkbox !== "none" && einput !== null) {
            this._doCheckboxRecompute(einput);
        }

        let list = this.itemtree;
        let lastlist = null;
        for (let i = 0; i < level; i++) {
            if (Array.isArray(list[list.length-1])) {
                lastlist = list;
                list = list[list.length-1];
            } else {
                list.push([]);
                lastlist = list;
                list = list[list.length-1];
                break;
            }
        }
        let current_level_index = 0;
        if (list.length-1 >= 0) {
            if (!Array.isArray(list[list.length-1]))
                current_level_index = list[list.length-1].current_level_index + 1;
            else if (list.length-2 >= 0)
                current_level_index = list[list.length-2].current_level_index + 1;
        }
        let parent_index = -1;
        if (lastlist && lastlist.length-2 >= 0) {
            parent_index = lastlist[lastlist.length-2].current_level_index;
        }
        list.push({element: eli, level: level, current_level_index: current_level_index, parent_index: parent_index});
    }

    this.doCheckboxUpdate = function(e) {
        let einput = e.target.tagName === "INPUT" ? e.target : e.target.parentElement.children[0];
        let indx = this._doCheckboxRecompute(einput);
        this.onCheckboxChange(indx, einput.checked);
    }

    this._doCheckboxRecompute = function(einput) {
        let eitem = einput.parentElement.parentElement;
        let level = parseInt(eitem.getAttribute("data-list-itemlevel"));
        let indx = parseInt(eitem.getAttribute("data-list-itemid"));
        for (let i = indx+1; i < this.elist.children.length; i++) {
            let eitemfound = this.elist.children[i];
            let levelfound = parseInt(eitemfound.getAttribute("data-list-itemlevel"));
            if (levelfound > level) {
                if (!(eitemfound.children[0].children.length > 0 && eitemfound.children[0].children[0].tagName === "INPUT")) continue;
                let einputfound = eitemfound.children[0].children[0];
                einputfound.checked = einput.checked;
            } else break;
        }

        for (let l = level; l > 0; l--) {
            for (let i = indx-1; i >= 0; i--) {
                let eitemfound = this.elist.children[i];
                let levelfound = parseInt(eitemfound.getAttribute("data-list-itemlevel"));
                if (levelfound < l) {
                    if (!(eitemfound.children[0].children.length > 0 && eitemfound.children[0].children[0].tagName === "INPUT")) continue;
                    let einputfound = eitemfound.children[0].children[0];
                    let state = 0;
                    let checkscount = 0;
                    let count = 0;
                    for (let li = i+1; li < this.elist.children.length; li++) {
                        let eitemfoundl = this.elist.children[li];
                        let levelfoundl = parseInt(eitemfoundl.getAttribute("data-list-itemlevel"));
                        if (levelfoundl === l) {
                            if (!(eitemfoundl.children[0].children.length > 0 && eitemfoundl.children[0].children[0].tagName === "INPUT")) continue;
                            let einputfoundl = eitemfoundl.children[0].children[0];
                            count++;
                            checkscount += einputfoundl.checked;
                            if (einputfoundl.indeterminate) {
                                state = 2;
                                break;
                            }
                        } else if (levelfoundl < l) break;
                    }
                    if (state !== 2) {
                        if (checkscount === count) state = 1;
                        else if (!checkscount) state = 0;
                        else state = 2;
                    }
                    if (!state) {
                        einputfound.checked = false;
                        einputfound.indeterminate = false;
                    } else if (state === 1) {
                        einputfound.checked = true;
                        einputfound.indeterminate = false;
                    } else {
                        einputfound.checked = false;
                        einputfound.indeterminate = true;
                    }
                    break;
                }
            }
        }
        return indx;
    }

    this.doOpenClose = function(e) {
        let eitem = e.target;
        if (eitem.classList.contains("Checkboxed") || eitem.tagName === "INPUT" || eitem.tagName === "LABEL") return;
        while (eitem.tagName !== "LI") eitem = eitem.parentElement;
        let eaction = eitem.children[eitem.children.length-1];
        let level = parseInt(eitem.getAttribute("data-list-itemlevel"));
        let indx = parseInt(eitem.getAttribute("data-list-itemid"));
        for (let i = indx+1; i < this.elist.children.length; i++) {
            let eitemfound = this.elist.children[i];
            let levelfound = parseInt(eitemfound.getAttribute("data-list-itemlevel"));
            if (levelfound > level) {
                if (eaction.classList.contains("Opened")) eitemfound.classList.add("Hidden");
                else eitemfound.classList.remove("Hidden");
            } else break;
        }
        if (eaction.classList.contains("Opened")) eaction.classList.remove("Opened");
        else eaction.classList.add("Opened");
        this.onOpenCloseSubItems(indx, eaction.classList.contains("Opened"));
    }

    this.doClear = function() {
        this.elist.innerHTML = "";
        this.itemtree = [];
    }

    this.isEmpty = function() {
        return this.itemtree.length === 0;
    }

    this.getState = function() {
        return this.sid
    }

    this.getItemTree = function() {
        return this.itemtree;
    }

    this.getLength = function() {
        return this.elist.children.length;
    }

    this.getSelectedElement = function() {
        return this.sid !== null && this.sid >= 0?this.elist.children[this.sid]:null;
    }

    this.doInit();
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

/*===================== Circlebar =====================*/

function Circlebar(e) {
    this.ecb = e;
    this.ns = "http://www.w3.org/2000/svg";
    this.ecbback = document.createElementNS(this.ns, "circle");
    this.ecbline = document.createElementNS(this.ns, "circle");
    this.elabel = document.createElement("div");

    this.setPos = function(pos) {
        if (pos > 100) pos = 100;
        else if (pos < 0) pos = 0;
        let h = this.ecb.getAttribute("data-circlebar-size");
        if (h < 25) h = 25;
        let r = (h-20)/2;
        let s = 2*Math.PI*r;
        let o = pos/100*s;
        this.ecbback.setAttributeNS(null, "r", r+"px");
        this.ecbline.setAttributeNS(null, "r", r+"px");
        this.ecbline.setAttributeNS(null, "stroke-dasharray", s);
        this.ecbline.setAttributeNS(null, "stroke-dashoffset", s-o);
        this.elabel.innerHTML = pos;
    }

    this.doInit = function() {
        let ecbbody = document.createElementNS(this.ns, "svg");
        ecbbody.setAttributeNS(null, "width", "100%");
        ecbbody.setAttributeNS(null, "height", "100%");
        ecbbody.setAttributeNS(null, "class", "CircleBody");
        this.ecbback.setAttributeNS(null, "cx", "50%");
        this.ecbback.setAttributeNS(null, "cy", "50%");
        this.ecbback.setAttributeNS(null, "class", "CircleProgress CircleBack");
        this.ecbline.setAttributeNS(null, "cx", "50%");
        this.ecbline.setAttributeNS(null, "cy", "50%");
        this.ecbline.setAttributeNS(null, "class", "CircleProgress CircleLine");

        ecbbody.appendChild(this.ecbback);
        ecbbody.appendChild(this.ecbline);
        this.ecb.appendChild(ecbbody);

        this.elabel.className = "CirclebarLabel";
        this.ecb.appendChild(this.elabel);

        this.setPos(0);
    }

    this.doInit();
}

/*===================== Counter =====================*/

function Counter(e) {
    this.ec = e;
    this.ecback = e.children[0];
    this.ecvalue = e.children[1].children[0];
    this.ecforward = e.children[2];
    this.value = 0;
    this.backtimeout = null;
    this.backtimer = null;
    this.forwardtimeout = null;
    this.forwardtimer = null;

    this.onBeforeCount = function(direction){return true;}
    this.onAfterCount = function(direction){}

    this.doCountBack = function() {
        if (!this.onBeforeCount(-1)) return;
        this.value--;
        this.ecvalue.value = this.value;
        this.onAfterCount(-1);
    }

    this.doStartCountBack = function() {
        if (this.backtimeout) return;
        this.backtimeout = setTimeout(bind(function () {
            if (this.backtimer) return;
            this.backtimer = setInterval(bind(function() {
                this.doCountBack();
            }, this), 100);
        }, this), 300);
    }

    this.doEndCountBack = function() {
        if (this.backtimeout && !this.backtimer) this.doCountBack();
        clearInterval(this.backtimer);
        clearTimeout(this.backtimeout);
        this.backtimer = null;
        this.backtimeout = null;
    }

    this.doCountForward = function() {
        if (!this.onBeforeCount(1)) return;
        this.value++
        this.ecvalue.value = this.value;
        this.onAfterCount(1);
    }

    this.doStartCountForward = function() {
        if (this.forwardtimeout) return;
        this.forwardtimeout = setTimeout(bind(function () {
            if (this.forwardtimer) return;
            this.forwardtimer = setInterval(bind(function() {
                this.doCountForward();
            }, this), 100);
        }, this), 300);
    }

    this.doEndCountForward = function() {
        if (this.forwardtimeout && !this.forwardtimer) this.doCountForward();
        clearInterval(this.forwardtimer);
        clearTimeout(this.forwardtimeout);
        this.forwardtimer = null;
        this.forwardtimeout = null;
    }

    this.doParseEditedValue = function() {
        this.setValue(this.ecvalue.value);
    }

    this.setValue = function(value) {
        if (!value.toString().length) value = 0;
        if (Number.isNaN(parseInt(value))) {
            this.ecvalue.value = this.value;
            return false;
        }
        if (!this.onBeforeCount(parseInt(value)-this.value)) {
            this.ecvalue.value = this.value;
            return;
        }
        this.ecvalue.value = parseInt(value);
        this.value = parseInt(value);
        this.onAfterCount();
    }

    this.getValue = function() {
        return this.value;
    }

    this.doInit = function() {
        if (!this.ec.classList.contains("Editable")) this.ecvalue.setAttribute("disabled", "");
        else this.ecvalue.removeAttribute("disabled");
        this.setValue(this.ecvalue.value);

        this.ecback.onmousedown = bind(this.doStartCountBack, this);
        this.ecback.onmouseup = bind(this.doEndCountBack, this);
        this.ecback.onmouseleave = bind(this.doEndCountBack, this);

        this.ecforward.onmousedown = bind(this.doStartCountForward, this);
        this.ecforward.onmouseup = bind(this.doEndCountForward, this);
        this.ecforward.onmouseleave = bind(this.doEndCountForward, this);

        this.ecvalue.oninput = bind(this.doParseEditedValue,this);
    }

    this.doInit();
}

/*===================== Counter =====================*/

function HotkeyHolder(e) {
    this.ehh = e;
    this.modkeys = {shift: false, ctrl: false, alt: false};
    this.hotkey = {mods: this.modkeys, key: ''};
    this.onHotkey = function(hotkey) {}
    this.onHotkeySet = function(hotkey) {}

    this.doInit = function() {
        this.ehh.onclick = bind(function (){
            if (this.ehh.classList.contains("Selected")) {
                this.doUnselectHolder();
            } else {
                this.doSelectHolder();
            }
        }, this);
        this.doReset();
        document.onkeydown = bind(function(event) {
            this.onHotkeyCatch(event);
        }, this);
    }

    this.doSelectHolder = function() {
        this.ehh.classList.add("Selected");
        this.doResetModKeys();
        document.onkeyup = bind(function(event) {
            this.onHotkeyUncatchMod(event);
        }, this);
    }

    this.doUnselectHolder = function() {
        this.ehh.classList.remove("Selected");
        document.onkeyup = null;
    }

    this.doResetModKeys = function() {
        this.modkeys = {shift: false, ctrl: false, alt: false};
    }

    this.doReset = function() {
        this.ehh.innerHTML = "<div>N/A</div>"
        this.doResetModKeys();
        this.hotkey = {mods: this.modkeys, key: ''};
        this.doUnselectHolder();
    }

    this.onHotkeyUncatchMod = function(event) {
        let key = event.keyCode;
        if (key >= 16 && key <= 18) {
            switch (key) {
                case 16:
                    this.modkeys.shift = false;
                    break;
                case 17:
                    this.modkeys.ctrl = false;
                    break;
                case 18:
                    this.modkeys.alt = false;
            }
            event.preventDefault();
        } else if (key === 46) {
            this.doReset();
            event.preventDefault();
        } else if (key === 27) {
            this.doUnselectHolder();
            event.preventDefault();
        }
    }

    this.onHotkeyCatch = function(event) {
        let key = event.keyCode;
        if (key >= 16 && key <= 18) {
            switch (key) {
                case 16:
                    this.modkeys.shift = true;
                    break;
                case 17:
                    this.modkeys.ctrl = true;
                    break;
                case 18:
                    this.modkeys.alt = true;
            }
            event.preventDefault();
        } else if (key >= 48 && key <= 90) {
            if (this.ehh.classList.contains("Selected")) {
                let modstr = '';
                if (this.modkeys.shift) modstr += '<div class="KeyMod Shift"></div><div class="Plus"></div>';
                if (this.modkeys.ctrl) modstr += '<div class="KeyMod Ctrl"></div><div class="Plus"></div>';
                if (this.modkeys.alt) modstr += '<div class="KeyMod Alt"></div><div class="Plus"></div>';
                this.ehh.innerHTML = modstr + '<div>' + String.fromCharCode(key) + '</div>';
                this.hotkey = {mods: this.modkeys, key: String.fromCharCode(key)};
                event.preventDefault();
                this.doUnselectHolder();
                this.onHotkeySet(this.hotkey);
            } else {
                if (this.hotkey.mods.shift === this.modkeys.shift
                        && this.hotkey.mods.ctrl === this.modkeys.ctrl
                        && this.hotkey.mods.alt === this.modkeys.alt
                        && this.hotkey.key === String.fromCharCode(key)) {
                    this.onHotkey(this.hotkey);
                    event.preventDefault();
                }
            }
            this.doResetModKeys();
        }
    }

    this.setHotkey = function(keychar, shiftmod = false, ctrlmod = false, altmod = false) {
        this.doResetModKeys();
        this.hotkey = {mods: this.modkeys, key: ''};
        let modstr = '';
        if (shiftmod) {
            this.hotkey.mods.shift = true;
            modstr += '<div class="KeyMod Shift"></div><div class="Plus"></div>';
        }
        if (ctrlmod) {
            this.hotkey.mods.ctrl = true;
            modstr += '<div class="KeyMod Ctrl"></div><div class="Plus"></div>';
        }
        if (altmod) {
            this.hotkey.mods.alt = true;
            modstr += '<div class="KeyMod Alt"></div><div class="Plus"></div>';
        }
        this.hotkey.key = keychar;
        this.ehh.innerHTML = modstr + '<div>'+keychar+'</div>';
    }

    this.getHotkey = function() {
        return this.hotkey;
    }

    this.doInit();
}
