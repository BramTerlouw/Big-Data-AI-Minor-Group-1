import argparse
import asyncio
import json
import logging
import random
import string
import time
import aiohttp
import websockets
from StreamLogic import stream_logic
from aiortc import RTCPeerConnection, RTCSessionDescription


pcs = set()


class StopSignalReceived(Exception):
    pass


async def chat_client(websocket):
    print("Connection opened")

    async def send_message(message):
        await websocket.send(message)

    async def receive_message():
        while True:
            message = await websocket.recv()
            yield message

    return send_message, receive_message


def transaction_id():
    return "".join(random.choice(string.ascii_letters) for x in range(12))


class JanusPlugin:
    def __init__(self, session, url):
        self._queue = asyncio.Queue()
        self._session = session
        self._url = url

    async def send(self, payload):
        message = {"janus": "message", "transaction": transaction_id()}
        message.update(payload)
        async with self._session._http.post(self._url, json=message) as response:
            data = await response.json()
            assert data["janus"] == "ack"

        response = await self._queue.get()
        assert response["transaction"] == message["transaction"]
        return response


class JanusSession:
    def __init__(self, url):
        self._http = None
        self._poll_task = None
        self._plugins = {}
        self._root_url = url
        self._session_url = None

    async def attach(self, plugin_name: str) -> JanusPlugin:
        message = {
            "janus": "attach",
            "plugin": plugin_name,
            "transaction": transaction_id(),
        }
        async with self._http.post(self._session_url, json=message) as response:
            data = await response.json()
            assert data["janus"] == "success"
            plugin_id = data["data"]["id"]
            plugin = JanusPlugin(self, self._session_url + "/" + str(plugin_id))
            self._plugins[plugin_id] = plugin
            return plugin

    async def create(self):
        self._http = aiohttp.ClientSession()
        message = {"janus": "create", "transaction": transaction_id()}
        async with self._http.post(self._root_url, json=message) as response:
            data = await response.json()
            assert data["janus"] == "success"
            session_id = data["data"]["id"]
            self._session_url = self._root_url + "/" + str(session_id)

        self._poll_task = asyncio.ensure_future(self._poll())

    async def destroy(self):
        if self._poll_task:
            self._poll_task.cancel()
            self._poll_task = None

        if self._session_url:
            message = {"janus": "destroy", "transaction": transaction_id()}
            async with self._http.post(self._session_url, json=message) as response:
                data = await response.json()
                assert data["janus"] == "success"
            self._session_url = None

        if self._http:
            await self._http.close()
            self._http = None

    async def _poll(self):
        while True:
            params = {"maxev": 1, "rid": int(time.time() * 1000)}
            async with self._http.get(self._session_url, params=params) as response:
                data = await response.json()
                if data["janus"] == "event":
                    plugin = self._plugins.get(data["sender"], None)
                    if plugin:
                        await plugin._queue.put(data)
                    else:
                        print(data)


async def subscribe(session, room, feed, send_message):
    pc = RTCPeerConnection()
    pcs.add(pc)

    @pc.on("track")
    async def on_track(track):
        print("Track %s received" % track.kind)

        if track.kind == "video":
            while True:
                try:
                    frame = await track.recv()

                    # Convert the frame to a numpy array
                    img = frame.to_ndarray(format="bgr24")

                    if sessionActive:
                        # Send a message with the received frame
                        procData = {"sender": "bot", "type": "message", "body": {"response": "processing frame"}}
                        await send_message(json.dumps(procData))

                        result = stream_logic(frame)






                        # Plaats hier de logica die de frame naar frame logic stuurt en feedback terug krijgt
                        # zoals iets als results = streamlogic(frame)


                    else:
                        # wait when session is not active
                        await asyncio.sleep(0.1)

                except Exception as e:
                    print("Error processing frame:", e)
                    break

    # subscribe
    plugin = await session.attach("janus.plugin.videoroom")
    response = await plugin.send(
        {"body": {"request": "join", "ptype": "subscriber", "room": room, "feed": feed}}
    )

    # apply offer
    await pc.setRemoteDescription(
        RTCSessionDescription(
            sdp=response["jsep"]["sdp"], type=response["jsep"]["type"]
        )
    )

    # send answer
    await pc.setLocalDescription(await pc.createAnswer())
    response = await plugin.send(
        {
            "body": {"request": "start"},
            "jsep": {
                "sdp": pc.localDescription.sdp,
                "trickle": False,
                "type": pc.localDescription.type,
            },
        }
    )


async def run(room, session, ws_url):
    global sessionActive
    sessionActive = False

    while True:
        # connect to websocket
        async with websockets.connect(ws_url) as websocket:
            send_message, receive_message_generator = await chat_client(websocket)

            # Wait for "ping" message and reply with "pong"
            try:
                async for message in receive_message_generator():
                    try:
                        message_data = json.loads(message)
                    except json.JSONDecodeError:
                        errorData = {"sender": "bot", "type": "error", "body": {"response": "wrong json format"}}
                        await send_message(json.dumps(errorData))
                        print("Error: Unable to decode message")
                        continue

                    if message_data.get("body", {}).get("request") == "stop" and message_data.get("sender") == "player":
                        stopData = {"sender": "bot", "type": "message", "body": {"response": "stopped"}}
                        await send_message(json.dumps(stopData))
                        raise StopSignalReceived()

                    elif message_data.get("body", {}).get("request") == "ping" and message_data.get("sender") == "player":
                        # join video room
                        await session.create()
                        plugin = await session.attach("janus.plugin.videoroom")
                        response = await plugin.send(
                            {
                                "body": {
                                    "display": "Referee Bot",
                                    "ptype": "publisher",
                                    "request": "join",
                                    "room": room,
                                }
                            }
                        )
                        publishers = response["plugindata"]["data"]["publishers"]

                        if publishers:

                            pongData = {"sender": "bot", "type": "message", "body": {"response": "pong"}}
                            await send_message(json.dumps(pongData))
                            print("Received 'ping', replied with 'pong'")

                            print("Publisher found")
                            for publisher in publishers:
                                print("id: %(id)s, display: %(display)s" % publisher)

                            # receive video
                            await subscribe(
                                session=session, room=room, feed=publishers[0]["id"], send_message=send_message
                            )

                            # exchange media
                            print("Exchanging media")
                            async for message in receive_message_generator():
                                try:
                                    message_data = json.loads(message)
                                    if message_data.get("sender") != "player":
                                        continue

                                    if message_data.get("body", {}).get("request") == "stop":
                                        stopData = {"sender": "bot", "type": "message", "body": {"response": "stopped"}}
                                        await send_message(json.dumps(stopData))
                                        raise StopSignalReceived()

                                    elif message_data.get("body", {}).get("request") == "start":
                                        startData = {"sender": "bot", "type": "message", "body": {"response": "started"}}
                                        await send_message(json.dumps(startData))
                                        print("Start command received")
                                        sessionActive = True

                                    elif message_data.get("body", {}).get("request") == "pause":
                                        pauseData = {"sender": "bot", "type": "message", "body": {"response": "paused"}}
                                        await send_message(json.dumps(pauseData))
                                        print("Pause command received")
                                        sessionActive = False

                                except json.JSONDecodeError:
                                    errorData = {"sender": "bot", "type": "error", "body": {"response": "wrong json format"}}
                                    await send_message(json.dumps(errorData))
                                    print("Error: Unable to decode message")
                                    continue
            except StopSignalReceived:
                print("Stop command received, exiting...")
                break

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Janus")
    parser.add_argument("url", help="Janus root URL, e.g. http://localhost:8088/janus")
    parser.add_argument(
        "--room",
        type=int,
        required=True,
        help="The room ID to join.",
    )
    parser.add_argument(
        "--key",
        type=str,
        required=True,
        help="key to join the message room",
    )
    parser.add_argument("--verbose", "-v", action="count")
    args = parser.parse_args()

    if args.verbose:
        logging.basicConfig(level=logging.DEBUG)

    # create signaling and peer connection
    session = JanusSession(args.url)

    loop = asyncio.get_event_loop()

    ws_url = "ws://app:8081/api/v1/session/ws/" + args.key

    try:
        # Set the timeout to 30 minutes (30*60 seconds), so the bot stops after 30 minutes
        timeout = 30 * 60
        loop.run_until_complete(
            asyncio.wait_for(
                run(room=args.room, session=session, ws_url=ws_url),
                timeout=timeout,
            )
        )
    except KeyboardInterrupt:
        pass
    except StopSignalReceived:
        print("Exiting due to stop command")
    except asyncio.TimeoutError:
        print("Exiting due to 30-minute timeout")

    finally:
        # destroy session
        loop.run_until_complete(session.destroy())
        # close peer connections
        coros = [pc.close() for pc in pcs]
        loop.run_until_complete(asyncio.gather(*coros))
        exit(0)