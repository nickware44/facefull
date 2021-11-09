/////////////////////////////////////////////////////////////////////////////
// Name:
// Purpose:
// Author:      Nickolay Babbysh
// Created:     07.11.2021
// Copyright:   (c) NickWare Group
// Licence:
/////////////////////////////////////////////////////////////////////////////

#include "facefullbridge.h"

FacefullBridge::FacefullBridge() {
    // bind FacefullBridge::onEventReceive method to webview title change event
}

void FacefullBridge::onEventReceive() {
    // get webview page title and catch Facefull event by doEventCatch(title);
}

void FacefullBridge::onWindowMaximize() {
    // maximize the window
}

void FacefullBridge::onWindowMinimize() {
    // minimize the window
}

void FacefullBridge::onWindowMove() {
    // move the window when not maximized
}

void FacefullBridge::WebViewEventExecutor(const std::string &str) {
    // something like webview->RunScript(str);
}

void FacefullBridge::onWindowReady() {
    // show the window
}

void FacefullBridge::onWindowClose() {
    // hide the window and exit app
}
