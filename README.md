
# Paddle API with Computer vision

bliep


## Creators

- Merlijn Busch, Bram Terlouw and Bastiaan van der Bijl


## Requirements

**Python:** 3.9.13 or experience may vary

**Docker:** on wsl2 or linux with Nvidia GPU support

**Camera(webcam) or virtual webcam(OBS):** for streaming video 

## Installation

To install the docker

```bash
  docker compose up
```
## How does it work?


## API communication



### Verify position endpoint


#### Post to localhost:8081/api/v1/session/verify
```formdata
file: <Your image>
user_id: <id>
athlete_name: <athlete name>
coach_name: <coach name>
location: <location>
```
#### Expected reply
```json
{
  "message": "Persons are standing in correct position, proceed with filming!",
  "room": "80985793",
  "sessionCode": "b65a728d-0904-4bbd-80d4-cdd7d72094ba"
}
```
---
### Start session endpoint


#### Post to localhost:8081/api/v1/session/start/YOUR SESSIONCODE

#### Expected reply
```json
{
  "message": "session has started"
}
```

### Get session results endpoint


#### Get at localhost:8081/api/v1/session/results/YOUR USERID

#### Expected reply
```json
{
  "_id": {
    "$oid": "6488c3ca86e6fab21ea10c1c"
  },
  "session_key": "b65a728d-0904-4bbd-80d4-cdd7d72094ba",
  "session_key_used": true,
  "amount_socket_joins": 2,
  "picture": "data:image/png;base64",
  "game_data": {
    "athlete_name": "asdads",
    "coach_name": "dsaads",
    "location": "adssad"
  },
  "room": "27018870",
  "userId": "3",
  "status": "Processed",
  "uploadDate": {
    "$date": "2023-06-13T19:30:18.419Z"
  },
  "outputDate": {
    "$date": "2023-06-13T19:30:19.497Z"
  },
  "score": [
    {
      "distHumans": 92,
      "playerPos": "left",
      "playerHeight": 175,
      "distPlayerPaddle": 27
    },
    {
      "distHumans": 92,
      "playerPos": "left",
      "playerHeight": 175,
      "distPlayerPaddle": 27,
      "possibleIntersect": true
    }
  ]
}
```


## Websocket communication

connect to the websocket on: ws://localhost:8081/api/v1/session/ws/YOUR SESSIONCODE

#### Make the bot lock on to your stream
```json
{
  "sender": "player",
  "body": {"request": "connect"}
}
```
#### Expected reply
```json
{
  "sender": "bot",
  "type": "message",
  "body": {"response": "connected", "status": "info"}
}
```

---


#### Make the bot start rating the session
```json
{
  "sender": "player",
  "body": {"request": "start"}
}
```
#### Expected reply
```json
{
  "sender": "bot",
  "type": "message",
  "body": {"response": "started", "status": "succes"}
}
```

#### End the stream session with the bot
```json
{
  "sender": "player",
  "body": {"request": "stop"}
}
```
#### Expected reply
```json
{
  "sender": "bot",
  "type": "message",
  "body": {"response": "stopped", "status": "warning"}
}
```
## Webinterface guide

**Step 1:** Login with a user ID of your own choosing (_Does not matter if you have never logged in before_).

**Step 2:** On the dashboard, a overview can be seen where earlier sessions are displayed, click on one for more information.

**Step 3:** In the sidebar on the left, click on **Start Training** to begin a training.

**Step 4:** Make sure you have a working camera or virtual camera, click on the button in the interface to take picture for verification.

**Step 5** Wait for processing, if the position is correct, you may enter the streaming room, otherwise retry with a adjusted position.

**Step 6:** In the session room, when ready click on the **Start recording** button, wait for conformation notifications and the streaming starts.

**Step 7:** When the user is done streaming, click on **End recording**, the session will be disposed and user is redirected to the dashboard.

**Step 8:** Verify that the session is visible on the dashboard (_This can take a few seconds_).