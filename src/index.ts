// cannister code goes here

import { v4 as uuidv4 } from "uuid";
import { StableBTreeMap, ic } from "azle";
import express from "express";

/**
    This type represents a message that can be listed on a board.
*/
class Message {
    id: string;
    title: string;
    body: string;
    attachmentURL: string;
    createdAt: Date;
    updatedAt: Date | null
 }


 //Now that we've defined our message types, we need a place to store these messages. For this, we'll be creating a storage variable 

 const messagesStorage = StableBTreeMap<string, Message>(0);

/** The next step is to create an HTTP server that will handle requests to our canister. 
This server will be responsible for processing incoming requests and returning appropriate responses.
*/
 const app = express();
   app.use(express.json());

//Following on, we will create a function to add new messages.

app.post("/messages", (req, res) => {
    const message: Message =  {id: uuidv4(), createdAt: getCurrentDate(), ...req.body};
    messagesStorage.insert(message.id, message);
    res.json(message);
 });

 //The next step involves creating a function to retrieve all messages that have been added to our canister.

  app.get("/messages", (req, res) => {
    res.json(messagesStorage.values());
 });

 //next step is to create a function that allows us to retrieve a specific message by its unique identifier.


app.get("/messages/:id", (req, res) => {
    const messageId = req.params.id;
    const messageOpt = messagesStorage.get(messageId);
    if (!messageOpt) {
       res.status(404).send(`the message with id=${messageId} not found`);
    } else {
       res.json(messageOpt.Some);
    }
 });


 //The next step is to create a function that allows us to update an existing message. 

  app.put("/messages/:id", (req, res) => {
   const messageId = req.params.id;
   const messageOpt = messagesStorage.get(messageId);
   if (!messageOpt) {
      res.status(400).send(`couldn't update a message with id=${messageId}. message not found`);
   } else {
      const message = messageOpt.Some;
      const updatedMessage = { ...message, ...req.body, updatedAt: getCurrentDate()};
      messagesStorage.insert(message.id, updatedMessage);
      res.json(updatedMessage);
   }
});

//The final step in our canister development is to create a function that allows for message deletion.

app.delete("/messages/:id", (req, res) => {
    const messageId = req.params.id;
    const deletedMessage = messagesStorage.remove(messageId);
    if (!deletedMessage) {
       res.status(400).send(`couldn't delete a message with id=${messageId}. message not found`);
    } else {
       res.json(deletedMessage.Some);
    }
 });


 app.listen();


 function getCurrentDate() {
    const timestamp = new Number(ic.time());
    return new Date(timestamp.valueOf() / 1000_000);
}