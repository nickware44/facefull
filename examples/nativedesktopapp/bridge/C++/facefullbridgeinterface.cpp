/////////////////////////////////////////////////////////////////////////////
// Name:
// Purpose:
// Author:      Nickolay Babbysh
// Created:     02.10.2021
// Copyright:   (c) NickWare Group
// Licence:
/////////////////////////////////////////////////////////////////////////////

#include "facefullbridgeinterface.h"

FacefullBridgeInterface::FacefullBridgeInterface() {
    WindowReady = false;
    doEventAttach("doWindowReady", [this](auto data) {
        WindowReady = true;
        onWindowReady();
    });
    doEventAttach("doWindowMove", [this](auto data) {
        onWindowMove();
    });
    doEventAttach("doWindowMaximize", [this](auto data) {
        onWindowMaximize();
    });
    doEventAttach("doWindowMinimize", [this](auto data) {
        onWindowMinimize();
    });
    doEventAttach("doWindowClose", [this](auto data) {
        onWindowClose();
    });

}

void FacefullBridgeInterface::doEventCatch(const std::string &event) {
    if (event.empty()) return;
    size_t p;
    std::string name, data;
    if ((p = event.find('|')) >= 0) {
        name = event.substr(0, p);
        data = event.substr(p+1);
    }
    if (name.empty() || name == "0") return;
    auto R = Events.equal_range(name);
    for (auto it = R.first; it != R.second; ++it) {
        EventHandler handler = it->second;
        handler(data);
    }
}

void FacefullBridgeInterface::doEventAttach(const std::string& name, EventHandler function) {
    Events.insert(std::pair<std::string, EventHandler>(name, function));
}

void FacefullBridgeInterface::doEventSend(const std::string &name, const std::string &data) {
    if (WindowReady) WebViewEventExecutor("facefull.doEventHandle('"+name+"', '"+data+"');");
}

bool FacefullBridgeInterface::isWindowReady() const {
    return WindowReady;
}
