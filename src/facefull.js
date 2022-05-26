/////////////////////////////////////////////////////////////////////////////
// Name:        facefull.js
// Purpose:     Main Facefull module
// Author:      Nickolay Babbysh
// Version:     0.9.6
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
    this.Scrollboxes = [];
    this.Comboboxes = [];
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
            try {
                this.EventTable[comm].handler(data);
            } catch (err) {
                console.error(err.stack);
            }
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
        this.Viewports = new ViewportManager();

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
        if (this.current === id) return;
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

/*===================== ViewportManager =====================*/

function ViewportManager() {
    this.ruletable = [];
    this.devdeftable = [];

    this.isRuleActive = function(devdef) {
        let activeflag = true;
        if (devdef.width !== "none") {
            activeflag &= window.innerWidth <= devdef.width;
        }
        if (devdef.height !== "none") {
            activeflag &= window.innerHeight <= devdef.height;
        }
        return activeflag;
    }

    this.doAddDeviceDefinition = function(name, width, height = "none", os = "none") {
        this.devdeftable[name] = {width: width, height: height, os: os};
    }

    this.doAddRule = function(devdefname, rulecallback) {
        this.ruletable.push({devdefname: devdefname, action: rulecallback});
    }

    this.doProcessRules = function() {
        this.ruletable.forEach(rule => {
            let devdef = this.devdeftable[rule.devdefname];
            if (devdef) {
                rule.action(this.isRuleActive(devdef));
            }
        });
    }
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

/*===================== Scrollbox =====================*/

function Scrollbox(e) {
    this.escrollbox = e;
    this.escrolldata = e.children[0];
    this.lasttouchshift = 0;

    this.doCreateScrollbar = function() {
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
        this.escrollbartrack.addEventListener("mousedown", bind(this.onStartMoveScrollbarTrack, this));
        this.escrollbox.addEventListener("wheel", bind(this.onWheelScrollbar, this));
        this.escrollbox.addEventListener("mousewheel", bind(this.onWheelScrollbar, this));
        this.escrollbarblock.addEventListener("touchstart", bind(this.onTouchStartScrollbar, this));
        this.escrollbarblock.addEventListener("touchmove", bind(this.onTouchMoveScrollbar, this));
        this.escrollbox.addEventListener("touchstart", bind(this.onTouchStartScrollbox, this));
        this.escrollbox.addEventListener("touchmove", bind(this.onTouchMoveScrollbox, this));
    };

    this.doRemoveScrollbar = function() {
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
            else this.doCreateScrollbar();
        } else this.doRemoveScrollbar();
    };

    this.onStartMoveScrollbarTrack = function(event) {
        event = event || fixEvent.call(this, window.event);
        this.scrollbartrackoffset = event.clientY - this.escrollbartrack.offsetTop;
        document.onmousemove = bind(this.onMoveScrollbarTrack, this);
        document.onmouseup = bind(this.onEndMoveScrollbarTrack, this);
    };

    this.onMoveScrollbarTrack = function(event) {
        event = event || fixEvent.call(this, window.event);
        this.doMoveScrollbar(event.clientY-this.scrollbartrackoffset);
    };

    this.onEndMoveScrollbarTrack = function() {
        document.onmousemove = null;
        document.onmouseup = null;
    };

    this.onWheelScrollbar = function(event) {
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
        this.escrolldata.style.marginTop = -this.escrollbartrack.offsetTop * (this.escrolldata.offsetHeight-this.escrollbox.offsetHeight) / (this.escrollbox.offsetHeight-this.escrollbartrack.offsetHeight) + "px";
    };

    this.doMoveScrolldata = function(pos) {
        if (this.escrollbartrack === undefined) {
            this.escrolldata.style.marginTop = "0";
            return;
        }
        this.escrolldata.style.marginTop = pos + "px";
        if (this.escrolldata.offsetHeight+this.escrolldata.offsetTop < this.escrollbox.offsetHeight)
            this.escrolldata.style.marginTop = -(this.escrolldata.offsetHeight-this.escrollbox.offsetHeight) + "px";
        else if (this.escrolldata.offsetTop > 0)
            this.escrolldata.style.marginTop = 0 + "px";
        this.escrollbartrack.style.marginTop = -this.escrolldata.offsetTop / (this.escrolldata.offsetHeight-this.escrollbox.offsetHeight) * (this.escrollbox.offsetHeight-this.escrollbartrack.offsetHeight) + "px";
    };

    this.onTouchStartScrollbar = function(event) {
        let touches = event.changedTouches;
        if (touches.length >= 0) {
            this.lasttouchshift = touches[0].pageY;
        }
    };

    this.onTouchMoveScrollbar = function(event) {
        let touches = event.changedTouches;
        if (touches.length >= 0) {
            if (this.escrollbartrack !== undefined) {
                let delta = touches[0].pageY - this.lasttouchshift;
                this.lasttouchshift = touches[0].pageY;
                this.doMoveScrollbar(this.escrollbartrack.offsetTop+delta);
            } else this.doMoveScrollbar(0);
        }
    };

    this.onTouchStartScrollbox = function(event) {
        let touches = event.changedTouches;
        if (touches.length >= 0) {
            this.lasttouchshift = touches[0].pageY;
        }
    };

    this.onTouchMoveScrollbox = function(event) {
        let touches = event.changedTouches;
        if (touches.length >= 0) {
            let ep = event.target;
            let hasnested = false;
            while (ep !== undefined && ep !== null && ep !== this.escrollbox) {
                if (ep.classList.contains("Scrolling")) hasnested = true;
                ep = ep.parentElement;
            }
            if (hasnested) return;
            if (this.escrollbartrack !== undefined) {
                let delta = touches[0].pageY - this.lasttouchshift;
                this.lasttouchshift = touches[0].pageY;
                this.doMoveScrolldata(this.escrolldata.offsetTop+delta);
            } else this.doMoveScrolldata(0);
        }
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

    if (this.escrollbox.offsetHeight < this.escrolldata.offsetHeight) this.doCreateScrollbar();
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
                AlertHideCustom('AE');
                if (callbacks.length > 0) callbacks[0]();
            }
            break;
        case "YESNO":
            eaby.style.display = "block";
            eabn.style.display = "block";
            eaby.onclick = function() {
                AlertHideCustom('AE');
                if (callbacks.length > 0) callbacks[0]();
            }
            eabn.onclick = function() {
                AlertHideCustom('AE');
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

function AlertHideCustom(eid) {
    let e = document.getElementById(eid);
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
        this.epm.style.display = "block";
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
            case 'top-right':
                this.epm.style.left =  this.epmtarget.offsetLeft + (this.epmtarget.offsetWidth-width) + "px";
                this.epm.style.top = this.epmtarget.offsetTop - this.epm.offsetHeight - 10 + "px";
                break;
        }

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
    this.touchtooltipshow = false;
    this.onCustomText = function(){};

    this._doTooltipInit = function() {
        let customtooltip = this.etooltiptarget.getAttribute("data-tooltip-custom-name");
        if (customtooltip !== null && customtooltip !== undefined) this.edefaulttooltip = document.getElementById(customtooltip);
        let dc = this.etooltiptarget.getAttribute("data-tooltip-text");
        let dcid = this.etooltiptarget.getAttribute("data-tooltip-textid");
        let dw = this.etooltiptarget.getAttribute("data-tooltip-width");
        this.edefaulttooltip.setAttribute("data-caption", "");
        this.edefaulttooltip.innerHTML = "";
        if (dcid && dcid !== "") this.edefaulttooltip.setAttribute("data-caption", dcid);
        if (dc && dc !== "") this.edefaulttooltip.innerHTML = dc;
        this.edefaulttooltip.style.width = dw + "px";
    }

    this.onMouseOver = function() {
        if (this.edefaulttooltip.classList.contains("Touch")) return;
        this._doTooltipInit();
        let pos = this.etooltiptarget.getAttribute("data-tooltip-pos");
        let ts = 0;

        switch (pos) {
            case 'left':
                let dw = this.etooltiptarget.getAttribute("data-tooltip-width");
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

        this.onCustomText();

        this.timer = setTimeout(bind(function() {
            this.edefaulttooltip.style.visibility = "visible";
        }, this), 800);
    };

    this.onMouseOut = function() {
        clearTimeout(this.timer);
        this.edefaulttooltip.style.visibility = "hidden";
    };

    this.onTouchStart = function() {
        this.touchtooltipshow = true;
        setTimeout(bind(function() {
            if (this.touchtooltipshow) {
                this._doTooltipInit();
                this.onCustomText();
                this.edefaulttooltip.style.top = (window.innerHeight-150) + "px";
                let ts = (window.innerWidth-this.edefaulttooltip.offsetWidth) / 2;
                this.edefaulttooltip.style.left = ts + "px";
                this.edefaulttooltip.style.visibility = "visible";
                setTimeout(bind(function() {
                    this.edefaulttooltip.style.visibility = "hidden";
                }, this), 3000);
            }
        }, this), 800);
    };

    this.onTouchEnd = function() {
        this.touchtooltipshow = false;
    };

    this.etooltiptarget.onmouseover = bind(this.onMouseOver, this);
    this.etooltiptarget.onmouseout = bind(this.onMouseOut, this);
    this.etooltiptarget.ontouchstart = bind(this.onTouchStart, this);
    this.etooltiptarget.ontouchend = bind(this.onTouchEnd, this);
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

        let vmax = Math.max.apply(null, values);
        epv.style.height = (values[i]/vmax*100)+"%";
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
            eli.addEventListener("click", bind(this.doOpenClose, this));
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
            if (eaction.classList.contains("Opened")) {
                if (levelfound > level) {
                    eitemfound.classList.add("Hidden");
                    if (eitemfound.children[eitemfound.children.length-1].classList.contains("Opened"))
                        eitemfound.children[eitemfound.children.length-1].classList.remove("Opened");
                }
            } else {
                if (levelfound === level+1) {
                    eitemfound.classList.remove("Hidden");
                }
            }
            if (levelfound <= level) break;
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
    this.lasttouchshift = 0;
    this.baseshift = 0;
    this.width = 0;

    this.onTabChanged = function(i){};

    this.onTouchStart = function(event) {
        let touches = event.changedTouches;
        if (touches.length >= 0) {
            this.width = 0;
            for (let i = 0; i < this.etabs.children.length; i++) {
                let style = getComputedStyle(this.etabs.children[i]);
                this.width += this.etabs.children[i].offsetWidth + parseInt(style.marginRight);
            }
            this.lasttouchshift = touches[0].pageX;
            if (!this.baseshift) {
                this.etabs.style.marginLeft = 0;
                this.baseshift = this.etabs.offsetLeft;
            }
        }
    }

    this.onTouchMove = function(event) {
        let touches = event.changedTouches;
        if (touches.length >= 0) {
            let diff = touches[0].pageX - this.lasttouchshift;
            this.lasttouchshift = touches[0].pageX;
            if (parseInt(this.etabs.style.marginLeft)+diff > 0) {
                this.etabs.style.marginLeft = 0;
                return;
            }
            let shift = -(parseInt(this.etabs.style.marginLeft)+diff);
            //console.log((this.width-shift+this.baseshift*2)-window.innerWidth)
            if (this.width-shift+this.baseshift*2 < window.innerWidth) {
                this.etabs.style.marginLeft = -(this.width-window.innerWidth+this.baseshift*2) + "px";
                return;
            }
            this.etabs.style.marginLeft = parseInt(this.etabs.style.marginLeft) + diff + "px";
        }
    }

    this.doInitTabs = function() {
        for (let i = 0; i < this.etabs.children.length; i++) {
            this.etabs.children[i].onclick = bind(function() {
                if (this.elasttab) this.elasttab.classList.remove("Selected");
                this.etabs.children[i].classList.add("Selected");
                this.elasttab = this.etabs.children[i];
                this.onTabChanged(i);
            }, this);
        }
        this.etabs.style.marginLeft = 0;
        this.etabs.addEventListener("touchstart", bind(this.onTouchStart, this));
        this.etabs.addEventListener("touchmove", bind(this.onTouchMove, this));
    }

    this.doSelectTab = function(num) {
        if (num === -1) {
            if (this.elasttab) this.elasttab.classList.remove("Selected");
            this.elasttab = null;
            return;
        }
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

    this.setPos = function(pos, label = true) {
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
        if (label) {
            this.elabel.style.display = "block";
            this.elabel.innerHTML = pos;
        } else this.elabel.style.display = "none";
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
