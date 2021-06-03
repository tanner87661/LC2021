/*
IoTT_SerInjector.h

Based on SoftwareSerial.cpp - Implementation of the Arduino software serial for ESP8266.
Copyright (c) 2015-2016 Peter Lerup. All rights reserved.

Adaptation to LocoNet (half-duplex network with DCMA) by Hans Tanner. 
See Digitrax LocoNet PE documentation for more information

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

*/

#ifndef IoTT_SerInjector_h
#define IoTT_SerInjector_h

#include <inttypes.h>
#include <IoTTCommDef.h>
#include <HardwareSerial.h>
#include <ArduinoJson.h>
#include <IoTT_DigitraxBuffers.h>


// This class is compatible with the corresponding AVR one,
// the constructor however has an optional rx buffer size.
// Speed up to 115200 can be used.

//#define lnBusy 0
//#define lnAwaitBackoff 1
//#define lnNetAvailable 2

#define rxBufferSize 64
#define txBufferSize 64
#define verBufferSize 48

#define queBufferSize 50 //messages that can be written in one burst before buffer overflow

class IoTT_SerInjector : public HardwareSerial
{
public:
	IoTT_SerInjector(int receivePin, int transmitPin, bool inverse_logic = false, int uartNr = 1, unsigned int buffSize = 64);
	~IoTT_SerInjector();
	void begin();
	void processLoop();
	void setMsgType(messageType thisType);
	uint16_t lnWriteMsg(lnTransmitMsg txData);
	uint16_t lnWriteMsg(lnReceiveBuffer txData);
	void setTxCallback(txFct newCB);
	void loadLNCfgJSON(DynamicJsonDocument doc);
   
private:
   
   // Member functions
   void handleLNIn(uint8_t inData, uint8_t inFlags = 0);
   void processLNMsg(lnTransmitMsg * recData);
   void processLNReceive();
   void processLNTransmit();
   void processLCBReceive();
   void processLCBTransmit();

   // Member variables
   lnTransmitMsg transmitQueue[queBufferSize];
   uint8_t que_rdPos, que_wrPos;
   lnTransmitMsg lnInBuffer;
   int m_rxPin, m_txPin;
   bool m_invert = true;
   uint8_t m_uart = 1;
   uint8_t m_buffsize = 64;
   uint32_t baudRate;
   bool receiveMode;
   int8_t busyLED = -1;
   bool m_highSpeed = true;
   messageType msgProtocol = LocoNet;

   unsigned int rx_rdPos, rx_wrPos;
   unsigned int tx_rdPos, tx_wrPos;
   unsigned int ver_rdPos, ver_wrPos;
   uint16_t rx_buffer[rxBufferSize];
   uint8_t tx_buffer[txBufferSize];

   uint8_t transmitStatus;
   uint32_t transmitTime;
   uint8_t numWrite, numRead;

   uint8_t    bitRecStatus = 0;    	//LocoNet 0: waiting for OpCode; 1: waiting for package data
									//OLCB:	0: await start char 1: await frame type 2: await ID 3: await end char

   uint8_t    lnBufferPtr = 0; //index of next msg buffer location to read
   uint8_t    lnXOR = 0;
   uint8_t    lnExpLen = 0;
   
};

//this is the callback function. Provide a function of this name and parameter in your application and it will be called when a new message is received
extern void onLocoNetMessage(lnReceiveBuffer * recData) __attribute__ ((weak));

#endif
