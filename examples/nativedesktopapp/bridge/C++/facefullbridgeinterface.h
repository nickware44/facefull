/////////////////////////////////////////////////////////////////////////////
// Name:
// Purpose:
// Author:      Nickolay Babbysh
// Created:     02.10.2021
// Copyright:   (c) NickWare Group
// Licence:
/////////////////////////////////////////////////////////////////////////////

#ifndef FACEFULLBRIDGEINTERFACE_H
#define FACEFULLBRIDGEINTERFACE_H

#include <string>
#include <map>
#include <functional>

class FacefullBridgeInterface {
public:
    typedef std::function<void(const std::string&)> EventHandler;
    FacefullBridgeInterface();
    void doEventAttach(const std::string& eventname, EventHandler function);
    void doEventSend(const std::string &eventname, const std::string &data = "");
    bool isWindowReady() const;
    ~FacefullBridgeInterface() = default;
private:
    std::multimap<std::string, EventHandler> Events;
    bool WindowReady;
protected:
    virtual void onWindowReady() = 0;
    virtual void onWindowMove() = 0;
    virtual void onWindowMaximize() = 0;
    virtual void onWindowMinimize() = 0;
    virtual void onWindowClose() = 0;
    void doEventCatch(const std::string&);
    virtual void WebViewEventExecutor(const std::string&) = 0;
};


#endif //FACEFULLBRIDGEINTERFACE_H
