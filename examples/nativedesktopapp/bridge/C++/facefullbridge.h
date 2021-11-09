/////////////////////////////////////////////////////////////////////////////
// Name:
// Purpose:
// Author:      Nickolay Babbysh
// Created:     07.11.2021
// Copyright:   (c) NickWare Group
// Licence:
/////////////////////////////////////////////////////////////////////////////

#ifndef FACEFULLBRIDGE_H
#define FACEFULLBRIDGE_H

#include "facefullbridgeinterface.h"
#include "frame.h"

class FacefullBridge : public FacefullBridgeInterface {
public:
    FacefullBridge();
    void onEventReceive();
    void onWindowMinimize() override;
    void onWindowMaximize() override;
    void onWindowMove() override;
    void WebViewEventExecutor(const std::string&) override;
    void onWindowReady() override;
    void onWindowClose() override;
};


#endif //FACEFULLBRIDGE_H
