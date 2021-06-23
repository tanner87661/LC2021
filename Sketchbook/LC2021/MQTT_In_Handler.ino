/*
void mqttTransmit(byte txMode, char* topic, char* payload) //mode (0:send, 1:subscribe), topic, payload
{
  switch (txMode)
  {
    case 0: //subscribe
//      Serial.println(topic);
      if (lnMQTT)
        lnMQTT->subscribe(topic);
      break;
    case 1: //transmit
      if (useM5Viewer == 4)
        processMQTTtoM5(true, topic, payload);
      if (globalClient != NULL)
        processDataToMQTTBWebClient("MQTTOut", topic, payload);
      if (lnMQTT)
        lnMQTT->publish(topic, payload);
      break;
  }
}

void callbackMQTTMessage(char* topic, byte *  payload, unsigned int length)
{
    DynamicJsonDocument doc(6 * length);
    DeserializationError error = deserializeJson(doc, payload);
//    Serial.println(topic);
    if (!error)
    {
      if ((useM5Viewer == 4) || (globalClient != NULL))
      {
        char myMqttMsg[400];
        serializeJson(doc, myMqttMsg);
        if (useM5Viewer == 4)
          processMQTTtoM5(false, topic, myMqttMsg);
        if (globalClient != NULL)
          processDataToMQTTBWebClient("MQTTIn", topic, myMqttMsg);
      }
      if (myChain) myChain->processMQTTCmd(topic, doc);
      if (myButtons) myButtons->processMQTTCmd(topic, doc);
    }
    else
      Serial.printf("deserializeJson() wsProcessing failed: %s\n", error.c_str());
}

void processDataToMQTTBWebClient(String thisCmd,  char* topic, char* payload) //if a web browser is conneted, all LN messages are sent via Websockets
                                                     //this is the hook for a web based OLCB viewer
{
    DynamicJsonDocument doc(1200);
    char myMqttMsg[800];
    doc["Cmd"] = "MQTT";
    doc["CmdType"] = thisCmd;
    doc["Topic"] = topic;
    doc["Payload"] = payload;
    serializeJson(doc, myMqttMsg);
    globalClient->text(myMqttMsg);
//    Serial.println(myMqttMsg);
    lastWifiUse = millis();
}

*/
