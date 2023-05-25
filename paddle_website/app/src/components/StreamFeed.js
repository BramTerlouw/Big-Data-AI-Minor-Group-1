class StreamFeed extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});

        console.log(window.$)

        this.janus = null;
        this.sfutest = null;
        this.opaqueId = "videoroomtest-" + Janus.randomString(12);

        this.pingLoop = true;
        this.startLoop = true;
        this.pauzeLoop = true;
        this.stopLoop = true;

        this.myusername = null;
        this.myroom = null;
        this.sessionCode = null;
        this.socket = null;
        this.messages = [];

        this.myid = null;
        this.mystream = null;
        this.mypvtid = null;

        this.localTracks = {};
        this.localVideos = 0;
        this.feeds = [];
        this.feedStreams = {};
        this.bitrateTimer = [];

        this.doSimulcast =
            this.getQueryStringValue("simulcast") === "yes" ||
            this.getQueryStringValue("simulcast") === "true";

        this.doSvc = this.getQueryStringValue("svc");
        if (this.doSvc === "") this.doSvc = null;

        if (this.getQueryStringValue("room") !== "")
            this.myroom = parseInt(this.getQueryStringValue("room"));

        this.acodec =
            this.getQueryStringValue("acodec") !== "" ? this.getQueryStringValue("acodec") : null;

        this.vcodec =
            this.getQueryStringValue("vcodec") !== "" ? this.getQueryStringValue("vcodec") : null;

        this.doDtx =
            this.getQueryStringValue("dtx") === "yes" || this.getQueryStringValue("dtx") === "true";

        this.subscriber_mode =
            this.getQueryStringValue("subscriber-mode") === "yes" ||
            this.getQueryStringValue("subscriber-mode") === "true";

        this.use_msid =
            this.getQueryStringValue("msid") === "yes" ||
            this.getQueryStringValue("msid") === "true";
    }

    style(){
        return `
        <style>
           #container {
              width: 100vw;
              height: calc(100vh - 5vh);
            
              display: flex;
              flex-direction: row;
              gap: 20px;
              align-items: center;
              justify-content: center;
            }
            
            .streaming-wrapper {
              width: 600px;
              height: 600px;
            
              display: flex;
              flex-direction: column;
              flex-wrap: wrap;
            
              background-color: #f4f4f4;
            }
            
            .side-wrapper {
              width: 50%;
              height: 95%;
              padding: 10px;
            }
            
            .message-wrapper {
              width: 50%;
              height: 100%;
              padding: 10px;
              /* border-left: 1px solid darkgray; */
            
              display: flex;
              flex-direction: column;
              gap: 10px;
            }
            
            .info-panel {
              padding: 5px 15px 10px 15px;
              background-color: #e0e0e0;
            }
            
            .heading {
              padding: 5px 0;
              border-bottom: 1px solid #3db0f0;
            }
            
            .heading-title {
              font-style: italic;
              font-size: 14px;
              color: darkgrey;
            }
            
            .position-info {
              margin: 10px 20px;
            
              color: darkgray;
              font-style: italic;
              font-size: 12px;
            }
            
            .position-info ol {
              padding: 0;
            }
            
            .btn-record {
              width: 100%;
              background-color: #3db0f0;
              border: none;
              color: #fff;
              display: none;
            }
            
            .btn-stop {
              width: 100%;
              background-color: red;
              border: none;
              color: #fff;
              display: none;
            }
            
            .timer {
              width: 100%;
              padding: 0 0 0 5px;
            
              font-style: italic;
              background-color: #fff;
            }
        </style>    
       `;
    }

    content(){
        this.shadowRoot.innerHTML =`
            ${this.style()}
              <section id="container">
                <div class="streaming-wrapper">
                  <div class="side-wrapper">
                    <div class="info-panel">
                      <div class="heading">
                        <p class="heading-title">Step 3: Stream training</p>
                      </div>
            
                      <div class="position-info">
                        <ol>
                          <li>When athlete is ready, start stream.</li>
                          <li>Keep camera centered on the training.</li>
                          <li>See live feedback on streaming device.</li>
                          <li>Stop streaming when training is done.</li>
                        </ol>
                      </div>
                    </div>
            
                    <button id="start" class="btn-record">
                      Start Recording
                    </button>
                    <button id="stop" class="btn-stop">
                      Stop Recording
                    </button>
                    <div class="timer">Thursday 21-06-23 01:22</div>
                    <div class="panel-body" id="videolocal"></div>
                    <button id="dispose_rescources">Destroy</button>
                  </div>
                  <div class="message-wrapper">
                    ${this.messages.map((mes) => {
                            return `<div> ${mes} </div>`;
                    }).join('')}
            
                    ${JSON.stringify(this.messages)}
                  </div>
                </div>
              </section>
        `

        this.shadowRoot.querySelector('#start').addEventListener('click', this.start_stream.bind(this))
        this.shadowRoot.querySelector('#stop').addEventListener('click', this.stop_stream.bind(this))
        this.shadowRoot.querySelector('#dispose_rescources').addEventListener('click', this.dispose_rescources.bind(this))
    }

    connectedCallback(){
        this.content();

        Janus.init({
            debug: "all",
            callback: this.janusInit.bind(this)
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[name] = newValue;
        }
    }

    static get observedAttributes() {
        // return ["route", "token", "program_id"];
    }

    janusInit() {
        const currentURL = window.location.href;
        const url = new URL(currentURL);
        this.myroom = parseInt(url.searchParams.get("room"));
        this.sessionCode = url.searchParams.get("sessionCode");
        this.myusername = "Bram";
        this.setup_stream();
        this.setup_socket();
    }

    async dispose_rescources() {
        window.getElementById("stop").style.display = "none";
        window.getElementById("start").style.display = "block";

        await this.janus.destroy();
        await this.socket.close();
    }

    async start_stream() {
        const _this = this;
        const startMsg = {
            sender: "player",
            body: { request: "start" },
        };

        let startStr = JSON.stringify(startMsg);
        let counter = 0
        const intervalId = setInterval(async () => {
            await _this.socket.send(startStr);

            if (!_this.startLoop || counter >= 25) {
                clearInterval(intervalId);
            }
            counter++;
        }, 1000);

        window.getElementById("start").style.display = "none";
        window.getElementById("stop").style.display = "block";
    }

    async stop_stream() {
        const _this = this;
        let counter = 0

        const pauzeMsg = {
            sender: "player",
            body: { request: "pause" },
        };

        const stopMsg = {
            sender: "player",
            body: { request: "stop" },
        };

        let pauzeStr = JSON.stringify(pauzeMsg);
        let stopStr = JSON.stringify(stopMsg);

        const pauzeInterval = setInterval(async () => {
            await _this.socket.send(pauzeStr);

            if (!_this.pauzeLoop || counter >= 25) {
                clearInterval(pauzeInterval);
                counter = 0
            }
            counter++;
        }, 1000);

        const stopInterval = setInterval(async () => {
            await _this.socket.send(stopStr);

            if (!_this.stopLoop || counter >= 25) {
                clearInterval(stopInterval);
            }
            counter++;
        }, 1000);
        // await _this.dispose_rescources();
    }

    setup_socket() {
        this.socket = new WebSocket(
            "ws://localhost:8081/api/v1/session/ws/" + this.sessionCode
        );

        const _this = this;
        this.socket.onopen = function (event) {
            console.log("WebSocket connection established.");

            const initMsg = {
                sender: "player",
                body: { request: "ping" },
            };

            let initStr = JSON.stringify(initMsg);

            let counter = 0;
            const intervalId = setInterval(() => {
                _this.socket.send(initStr)

                if (!_this.pingLoop || counter >= 25) {
                    clearInterval(intervalId);
                }
                counter++;
            }, 1000);
        };

        this.socket.onmessage = function(event) {
            const response = JSON.parse(event.data);

            if(!response.body.status || !response.body.response)
                return;

            switch (response.body.response) {
                case "pong":
                    console.log("Received response:", response);
                    _this.pingLoop = false;
                    window.getElementById("start").classList.remove("hidden");
                    break;
                case "started":
                    console.log("Received response:", response);
                    _this.startLoop = false;
                    break;
                case "paused":
                    console.log("Received response:", response);
                    _this.pauzeLoop = false;
                    break;
                case "stopped":
                    console.log("Received response:", response);
                    _this.stopLoop = false;
                    break;
            }

            _this.messages.push({
                status: response.body.status,
                message: response.body.response
            })
        };

        this.socket.onerror = function (error) {
            console.error("WebSocket error:", error);
        };

        this.socket.onclose = function (event) {
            console.log("WebSocket connection closed:", event);
        };
    }

    setup_stream() {
        window.$(this).attr("disabled", true).unbind("click");
        // Make sure the browser supports WebRTC
        if (!Janus.isWebrtcSupported()) {
            alert("No WebRTC support... ");
            return;
        }

        // Create session
        const _this = this;
        this.janus = new Janus({
            server: _this.server,
            iceServers: _this.iceServers,
            success: function () {
                this.janus.attach({
                    plugin: "janus.plugin.videoroom",
                    opaqueId: _this.opaqueId,
                    success: function (pluginHandle) {
                        _this.sfutest = pluginHandle;
                        _this.registerUsername();
                    },
                    error: function (error) {},
                    consentDialog: function (on) {},
                    iceState: function (state) {},
                    mediaState: function (medium, on, mid) {},
                    webrtcState: function (on) {
                        window.$("#videolocal").parent().parent().unblock();
                        if (!on) return;
                        _this.sfutest.send({
                            message: { request: "configure", bitrate: 0 },
                        });
                    },
                    slowLink: function (uplink, lost, mid) {},
                    onmessage: function (msg, jsep) {
                        let event = msg["videoroom"];
                        if (event) {
                            if (event === "joined") {
                                // Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
                                _this.myid = msg["id"];
                                _this.mypvtid = msg["private_id"];
                                Janus.log(
                                    "Successfully joined room " + msg["room"] + " with ID " + myid
                                );
                                if (_this.subscriber_mode) {
                                    window.$("#videojoin").hide();
                                    window.$("#videos").removeClass("hide").show();
                                } else {
                                    _this.publishOwnFeed(true);
                                }
                                // Any new feed to attach to?
                                if (msg["publishers"]) {
                                    let list = msg["publishers"];
                                    Janus.debug("Got a list of available publishers/feeds:", list);
                                    for (let f in list) {
                                        if (list[f]["dummy"]) continue;
                                        let id = list[f]["id"];
                                        let streams = list[f]["streams"];
                                        let display = list[f]["display"];
                                        for (let i in streams) {
                                            let stream = streams[i];
                                            stream["id"] = id;
                                            stream["display"] = display;
                                        }
                                        _this.feedStreams[id] = streams;
                                        Janus.debug("  >> [" + id + "] " + display + ":", streams);
                                        _this.newRemoteFeed(id, display, streams);
                                    }
                                }
                            } else if (event === "destroyed") {
                                alert("The room has been destroyed", function () {
                                    window.location.reload();
                                });
                            } else if (event === "event") {
                                if (msg["streams"]) {
                                    let streams = msg["streams"];
                                    for (let i in streams) {
                                        let stream = streams[i];
                                        stream["id"] = _this.myid;
                                        stream["display"] = _this.myusername;
                                    }
                                    _this.feedStreams[_this.myid] = streams;
                                } else if (msg["publishers"]) {
                                    let list = msg["publishers"];
                                    Janus.debug("Got a list of available publishers/feeds:", list);
                                    for (let f in list) {
                                        if (list[f]["dummy"]) continue;
                                        let id = list[f]["id"];
                                        let display = list[f]["display"];
                                        let streams = list[f]["streams"];
                                        for (let i in streams) {
                                            let stream = streams[i];
                                            stream["id"] = id;
                                            stream["display"] = display;
                                        }
                                        _this.feedStreams[id] = streams;
                                        Janus.debug("  >> [" + id + "] " + display + ":", streams);
                                        _this.newRemoteFeed(id, display, streams);
                                    }
                                } else if (msg["leaving"]) {
                                    // One of the publishers has gone away?
                                    let leaving = msg["leaving"];
                                    Janus.log("Publisher left: " + leaving);
                                    let remoteFeed = null;
                                    for (let i = 1; i < 6; i++) {
                                        if (_this.feeds[i] && _this.feeds[i].rfid === leaving) {
                                            remoteFeed = _this.feeds[i];
                                            break;
                                        }
                                    }
                                    if (remoteFeed) {
                                        window.$("#remote" + remoteFeed.rfindex)
                                            .empty()
                                            .hide();
                                        window.$("#videoremote" + remoteFeed.rfindex).empty();
                                        _this.feeds[remoteFeed.rfindex] = null;
                                        remoteFeed.detach();
                                    }
                                    delete _this.feedStreams[leaving];
                                } else if (msg["unpublished"]) {
                                    // One of the publishers has unpublished?
                                    let unpublished = msg["unpublished"];
                                    Janus.log("Publisher left: " + unpublished);
                                    if (unpublished === "ok") {
                                        // That's us
                                        this.sfutest.hangup();
                                        return;
                                    }
                                    let remoteFeed = null;
                                    for (let i = 1; i < 6; i++) {
                                        if (_this.feeds[i] && _this.feeds[i].rfid === unpublished) {
                                            remoteFeed = _this.feeds[i];
                                            break;
                                        }
                                    }
                                    if (remoteFeed) {
                                        window.$("#remote" + remoteFeed.rfindex)
                                            .empty()
                                            .hide();
                                        window.$("#videoremote" + remoteFeed.rfindex).empty();
                                        _this.feeds[remoteFeed.rfindex] = null;
                                        remoteFeed.detach();
                                    }
                                    delete _this.feedStreams[unpublished];
                                } else if (msg["error"]) {
                                    if (msg["error_code"] === 426) {
                                        // This is a "no such room" error: give a more meaningful description
                                        alert(
                                            "<p>Apparently room <code>" +
                                            _this.myroom +
                                            "</code> (the one this demo uses as a test room) " +
                                            "does not exist...</p><p>Do you have an updated <code>janus.plugin.videoroom.jcfg</code> " +
                                            "configuration file? If not, make sure you copy the details of room <code>" +
                                            _this.myroom +
                                            "</code> " +
                                            "from that sample in your current configuration file, then restart Janus and try again."
                                        );
                                    } else {
                                        alert(msg["error"]);
                                    }
                                }
                            }
                        }
                        if (jsep) {
                            Janus.debug("Handling SDP as well...", jsep);
                            _this.sfutest.handleRemoteJsep({ jsep: jsep });
                            // Check if any of the media we wanted to publish has
                            // been rejected (e.g., wrong or unsupported codec)
                            let audio = msg["audio_codec"];
                            if (
                                _this.mystream &&
                                _this.mystream.getAudioTracks() &&
                                _this.mystream.getAudioTracks().length > 0 &&
                                !audio
                            ) {
                                // Audio has been rejected
                                toastr.warning(
                                    "Our audio stream has been rejected, viewers won't hear us"
                                );
                            }
                            let video = msg["video_codec"];
                            if (
                                _this.mystream &&
                                _this.mystream.getVideoTracks() &&
                                _this.mystream.getVideoTracks().length > 0 &&
                                !video
                            ) {
                                // Video has been rejected
                                toastr.warning(
                                    "Our video stream has been rejected, viewers won't see us"
                                );
                                // Hide the webcam video
                                window.$("#myvideo").hide();
                                window.$("#videolocal").append(
                                    '<div class="no-video-container">' +
                                    '<i class="fa fa-video-camera fa-5 no-video-icon" style="height: 100%;"></i>' +
                                    '<span class="no-video-text" style="font-size: 16px;">Video rejected, no webcam</span>' +
                                    "</div>"
                                );
                            }
                        }
                    },
                    onlocaltrack: function (track, on) {
                        Janus.debug("Local track " + (on ? "added" : "removed") + ":", track);
                        // We use the track ID as name of the element, but it may contain invalid characters
                        let trackId = track.id.replace(/[{}]/g, "");
                        if (!on) {
                            // Track removed, get rid of the stream and the rendering
                            let stream = _this.localTracks[trackId];
                            if (stream) {
                                try {
                                    let tracks = stream.getTracks();
                                    for (let i in tracks) {
                                        let mst = tracks[i];
                                        if (mst !== null && mst !== undefined) mst.stop();
                                    }
                                } catch (e) {}
                            }
                            if (track.kind === "video") {
                                window.$("#myvideo" + trackId).remove();
                                _this.localVideos--;
                                if (_this.localVideos === 0) {
                                    // No video, at least for now: show a placeholder
                                    if (window.$("#videolocal .no-video-container").length === 0) {
                                        window.$("#videolocal").append(
                                            '<div class="no-video-container">' +
                                            '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                                            '<span class="no-video-text">No webcam available</span>' +
                                            "</div>"
                                        );
                                    }
                                }
                            }
                            delete _this.localTracks[trackId];
                            return;
                        }
                        // If we're here, a new track was added
                        let stream = _this.localTracks[trackId];
                        if (stream) {
                            // We've been here already
                            return;
                        }
                        window.$("#videos").removeClass("hide").show();
                        if (track.kind === "audio") {
                            // We ignore local audio tracks, they'd generate echo anyway
                            if (_this.localVideos === 0) {
                                // No video, at least for now: show a placeholder
                                if (window.$("#videolocal .no-video-container").length === 0) {
                                    window.$("#videolocal").append(
                                        '<div class="no-video-container">' +
                                        '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                                        '<span class="no-video-text">No webcam available</span>' +
                                        "</div>"
                                    );
                                }
                            }
                        } else {
                            // New video track: create a stream out of it
                            _this.localVideos++;
                            window.$("#videolocal .no-video-container").remove();
                            stream = new MediaStream([track]);
                            _this.localTracks[trackId] = stream;
                            Janus.log("Created local stream:", stream);
                            Janus.log(stream.getTracks());
                            Janus.log(stream.getVideoTracks());
                            window.$("#videolocal").append(
                                '<video class="rounded centered" id="myvideo' +
                                trackId +
                                '" width=100% autoplay playsinline muted="muted"/>'
                            );
                            Janus.attachMediaStream(window.$("#myvideo" + trackId).get(0), stream);
                        }
                        if (
                            _this.sfutest.webrtcStuff.pc.iceConnectionState !== "completed" &&
                            _this.sfutest.webrtcStuff.pc.iceConnectionState !== "connected"
                        ) {
                            window.$("#videolocal")
                                .parent()
                                .parent()
                                .block({
                                    message: "<b>Publishing...</b>",
                                    css: {
                                        border: "none",
                                        backgroundColor: "transparent",
                                        color: "white",
                                    },
                                });
                        }
                    },
                    // eslint-disable-next-line no-unused-vars
                    onremotetrack: function (track, mid, on) {
                        // The publisher stream is sendonly, we don't expect anything here
                    },
                    oncleanup: function () {
                        _this.mystream = null;
                        delete _this.feedStreams[_this.myid];
                        window.$("#videolocal").parent().parent().unblock();
                        _this.localTracks = {};
                        _this.localVideos = 0;
                    },
                });
            },
            error: function (error) {
                console.log(this)
                // Janus.error(error);
                // conso(error, function () {
                //     window.location.reload();
                // });
            },
            destroyed: function () {
                // window.location.reload();
            },
        });
    }

    newRemoteFeed(id, display, streams) {
        const _this = this;
        // A new feed has been published, create a new plugin handle and attach to it as a subscriber
        let remoteFeed = null;
        if (!streams) streams = _this.feedStreams[id];
        _this.janus.attach({
            plugin: "janus.plugin.videoroom",
            opaqueId: _this.opaqueId,
            success: function (pluginHandle) {
                remoteFeed = pluginHandle;
                remoteFeed.remoteTracks = {};
                remoteFeed.remoteVideos = 0;
                remoteFeed.simulcastStarted = false;
                remoteFeed.svcStarted = false;
                let subscription = [];
                for (let i in streams) {
                    let stream = streams[i];
                    if (
                        stream.type === "video" &&
                        Janus.webRTCAdapter.browserDetails.browser === "safari" &&
                        (stream.codec === "vp9" ||
                            (stream.codec === "vp8" && !Janus.safariVp8))
                    ) {
                        continue;
                    }
                    subscription.push({
                        feed: stream.id, // This is mandatory
                        mid: stream.mid, // This is optional (all streams, if missing)
                    });
                    // FIXME Right now, this is always the same feed: in the future, it won't
                    remoteFeed.rfid = stream.id;
                    remoteFeed.rfdisplay = _this.escapeXmlTags(stream.display);
                }
                // We wait for the plugin to send us an offer
                let subscribe = {
                    request: "join",
                    room: _this.myroom,
                    ptype: "subscriber",
                    streams: subscription,
                    use_msid: _this.use_msid,
                    private_id: _this.mypvtid,
                };
                remoteFeed.send({ message: subscribe });
            },
            error: function (error) {},
            iceState: function (state) {},
            webrtcState: function (on) {},
            slowLink: function (uplink, lost, mid) {},
            onmessage: function (msg, jsep) {
                let event = msg["videoroom"];
                if (msg["error"]) {
                    console.log(msg["error"]);
                } else if (event) {
                    if (event === "attached") {
                        // Subscriber created and attached
                        for (let i = 1; i < 6; i++) {
                            if (!_this.feeds[i]) {
                                _this.feeds[i] = remoteFeed;
                                remoteFeed.rfindex = i;
                                break;
                            }
                        }
                        if (!remoteFeed.spinner) {
                            let target = window.getElementById(
                                "videoremote" + remoteFeed.rfindex
                            );
                            remoteFeed.spinner = new Spinner({ top: 100 }).spin(target);
                        } else {
                            remoteFeed.spinner.spin();
                        }
                        window.$("#remote" + remoteFeed.rfindex)
                            .removeClass("hide")
                            .html(remoteFeed.rfdisplay)
                            .show();
                    } else if (event === "event") {
                        // Check if we got a simulcast-related event from this publisher
                        let substream = msg["substream"];
                        let temporal = msg["temporal"];
                        if (
                            (substream !== null && substream !== undefined) ||
                            (temporal !== null && temporal !== undefined)
                        ) {
                            if (!remoteFeed.simulcastStarted) {
                                remoteFeed.simulcastStarted = true;
                                // Add some new buttons
                                _this.addSimulcastSvcButtons(remoteFeed.rfindex, true);
                            }
                            // We just received notice that there's been a switch, update the buttons
                            _this.updateSimulcastSvcButtons(remoteFeed.rfindex, substream, temporal);
                        }
                        // Or maybe SVC?
                        let spatial = msg["spatial_layer"];
                        temporal = msg["temporal_layer"];
                        if (
                            (spatial !== null && spatial !== undefined) ||
                            (temporal !== null && temporal !== undefined)
                        ) {
                            if (!remoteFeed.svcStarted) {
                                remoteFeed.svcStarted = true;
                                // Add some new buttons
                                _this.addSimulcastSvcButtons(remoteFeed.rfindex, true);
                            }
                            // We just received notice that there's been a switch, update the buttons
                            _this.updateSimulcastSvcButtons(remoteFeed.rfindex, spatial, temporal);
                        }
                    } else {
                        // What has just happened?
                    }
                }
                if (jsep) {
                    let stereo = jsep.sdp.indexOf("stereo=1") !== -1;
                    // Answer and attach
                    remoteFeed.createAnswer({
                        jsep: jsep,
                        // We only specify data channels here, as this way in
                        // case they were offered we'll enable them. Since we
                        // don't mention audio or video tracks, we autoaccept them
                        // as recvonly (since we won't capture anything ourselves)
                        tracks: [{ type: "data" }],
                        customizeSdp: function (jsep) {
                            if (stereo && jsep.sdp.indexOf("stereo=1") == -1) {
                                // Make sure that our offer contains stereo too
                                jsep.sdp = jsep.sdp.replace(
                                    "useinbandfec=1",
                                    "useinbandfec=1;stereo=1"
                                );
                            }
                        },
                        success: function (jsep) {
                            let body = { request: "start", room: myroom };
                            remoteFeed.send({ message: body, jsep: jsep });
                        },
                        error: function (error) {},
                    });
                }
            },
            // eslint-disable-next-line no-unused-vars
            onlocaltrack: function (track, on) {},
            onremotetrack: function (track, mid, on, metadata) {
                if (!on) {
                    // Track removed, get rid of the stream and the rendering
                    window.$("#remotevideo" + remoteFeed.rfindex + "-" + mid).remove();
                    if (track.kind === "video") {
                        remoteFeed.remoteVideos--;
                        if (remoteFeed.remoteVideos === 0) {
                            // No video, at least for now: show a placeholder
                            if (
                                window.$("#videoremote" + remoteFeed.rfindex + " .no-video-container")
                                    .length === 0
                            ) {
                                window.$("#videoremote" + remoteFeed.rfindex).append(
                                    '<div class="no-video-container">' +
                                    '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                                    '<span class="no-video-text">No remote video available</span>' +
                                    "</div>"
                                );
                            }
                        }
                    }
                    delete remoteFeed.remoteTracks[mid];
                    return;
                }
                // If we're here, a new track was added
                if (remoteFeed.spinner) {
                    remoteFeed.spinner.stop();
                    remoteFeed.spinner = null;
                }
                if (window.$("#remotevideo" + remoteFeed.rfindex + "-" + mid).length > 0) return;
                if (track.kind === "audio") {
                    // New audio track: create a stream out of it, and use a hidden <audio> element
                    let stream = new MediaStream([track]);
                    remoteFeed.remoteTracks[mid] = stream;
                    Janus.log("Created remote audio stream:", stream);
                    window.$("#videoremote" + remoteFeed.rfindex).append(
                        '<audio class="hide" id="remotevideo' +
                        remoteFeed.rfindex +
                        "-" +
                        mid +
                        '" autoplay playsinline/>'
                    );
                    Janus.attachMediaStream(
                        window.$("#remotevideo" + remoteFeed.rfindex + "-" + mid).get(0),
                        stream
                    );
                    if (remoteFeed.remoteVideos === 0) {
                        // No video, at least for now: show a placeholder
                        if (
                            window.$("#videoremote" + remoteFeed.rfindex + " .no-video-container")
                                .length === 0
                        ) {
                            window.$("#videoremote" + remoteFeed.rfindex).append(
                                '<div class="no-video-container">' +
                                '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                                '<span class="no-video-text">No remote video available</span>' +
                                "</div>"
                            );
                        }
                    }
                } else {
                    // New video track: create a stream out of it
                    remoteFeed.remoteVideos++;
                    window.$(
                        "#videoremote" + remoteFeed.rfindex + " .no-video-container"
                    ).remove();
                    let stream = new MediaStream([track]);
                    remoteFeed.remoteTracks[mid] = stream;
                    Janus.log("Created remote video stream:", stream);
                    window.$("#videoremote" + remoteFeed.rfindex).append(
                        '<video class="rounded centered" id="remotevideo' +
                        remoteFeed.rfindex +
                        "-" +
                        mid +
                        '" width=100% autoplay playsinline/>'
                    );
                    window.$("#videoremote" + remoteFeed.rfindex).append(
                        '<span class="label label-primary hide" id="curres' +
                        remoteFeed.rfindex +
                        '" style="position: absolute; bottom: 0px; left: 0px; margin: 15px;"></span>' +
                        '<span class="label label-info hide" id="curbitrate' +
                        remoteFeed.rfindex +
                        '" style="position: absolute; bottom: 0px; right: 0px; margin: 15px;"></span>'
                    );
                    Janus.attachMediaStream(
                        window.$("#remotevideo" + remoteFeed.rfindex + "-" + mid).get(0),
                        stream
                    );
                    // Note: we'll need this for additional videos too
                    if (!_this.bitrateTimer[remoteFeed.rfindex]) {
                        window.$("#curbitrate" + remoteFeed.rfindex)
                            .removeClass("hide")
                            .show();
                        _this.bitrateTimer[remoteFeed.rfindex] = setInterval(function () {
                            if (!window.$("#videoremote" + remoteFeed.rfindex + " video").get(0))
                                return;
                            // Display updated bitrate, if supported
                            let bitrate = remoteFeed.getBitrate();
                            window.$("#curbitrate" + remoteFeed.rfindex).text(bitrate);
                            // Check if the resolution changed too
                            let width = window.$("#videoremote" + remoteFeed.rfindex + " video").get(
                                0
                            ).videoWidth;
                            let height = window.$("#videoremote" + remoteFeed.rfindex + " video").get(
                                0
                            ).videoHeight;
                            if (width > 0 && height > 0) {
                                let res = width + "x" + height;
                                if (remoteFeed.simulcastStarted) res += " (simulcast)";
                                else if (remoteFeed.svcStarted) res += " (SVC)";
                                window.$("#curres" + remoteFeed.rfindex)
                                    .removeClass("hide")
                                    .text(res)
                                    .show();
                            }
                        }, 1000);
                    }
                }
            },
            oncleanup: function () {
                Janus.log(" ::: Got a cleanup notification (remote feed " + id + ") :::");
                if (remoteFeed.spinner) remoteFeed.spinner.stop();
                remoteFeed.spinner = null;
                window.$("#remotevideo" + remoteFeed.rfindex).remove();
                window.$("#waitingvideo" + remoteFeed.rfindex).remove();
                window.$("#novideo" + remoteFeed.rfindex).remove();
                window.$("#curbitrate" + remoteFeed.rfindex).remove();
                window.$("#curres" + remoteFeed.rfindex).remove();
                if (bitrateTimer[remoteFeed.rfindex])
                    clearInterval(bitrateTimer[remoteFeed.rfindex]);
                bitrateTimer[remoteFeed.rfindex] = null;
                remoteFeed.simulcastStarted = false;
                window.$("#simulcast" + remoteFeed.rfindex).remove();
                remoteFeed.remoteTracks = {};
                remoteFeed.remoteVideos = 0;
            },
        });
    }

    escapeXmlTags(value) {
        if (value) {
            let escapedValue = value.replace(new RegExp("<", "g"), "&lt");
            escapedValue = escapedValue.replace(new RegExp(">", "g"), "&gt");
            return escapedValue;
        }
    }

    addSimulcastSvcButtons(feed, temporal) {
        const _this = this;
        let index = feed;
        let f = _this.feeds[index];
        let simulcast = f && f.simulcastStarted;
        let what = simulcast ? "simulcast" : "SVC";
        let layer = simulcast ? "substream" : "layer";
        window.$("#remote" + index)
            .parent()
            .append(
                '<div id="simulcast' +
                index +
                '" class="btn-group-vertical btn-group-vertical-xs pull-right">' +
                '	<div class"row">' +
                '		<div class="btn-group btn-group-xs" style="width: 100%">' +
                '			<button id="sl' +
                index +
                '-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to higher quality" style="width: 33%">SL 2</button>' +
                '			<button id="sl' +
                index +
                '-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to normal quality" style="width: 33%">SL 1</button>' +
                '			<button id="sl' +
                index +
                '-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to lower quality" style="width: 34%">SL 0</button>' +
                "		</div>" +
                "	</div>" +
                '	<div class"row">' +
                '		<div class="btn-group btn-group-xs hide" style="width: 100%">' +
                '			<button id="tl' +
                index +
                '-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 2" style="width: 34%">TL 2</button>' +
                '			<button id="tl' +
                index +
                '-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 1" style="width: 33%">TL 1</button>' +
                '			<button id="tl' +
                index +
                '-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 0" style="width: 33%">TL 0</button>' +
                "		</div>" +
                "	</div>" +
                "</div>"
            );
        if (simulcast && Janus.webRTCAdapter.browserDetails.browser !== "firefox") {
            // Chromium-based browsers only have two temporal layers, when doing simulcast
            window.$("#tl" + index + "-2").remove();
            window.$("#tl" + index + "-1").css("width", "50%");
            window.$("#tl" + index + "-0").css("width", "50%");
        }
        // Enable the simulcast/SVC selection buttons
        window.$("#sl" + index + "-0")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary")
            .unbind("click")
            .click(function () {
                toastr.info(
                    "Switching " + what + " " + layer + ", wait for it... (lower quality)",
                    null,
                    { timeOut: 2000 }
                );
                if (!window.$("#sl" + index + "-2").hasClass("btn-success"))
                    window.$("#sl" + index + "-2")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary");
                if (!window.$("#sl" + index + "-1").hasClass("btn-success"))
                    window.$("#sl" + index + "-1")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary");
                window.$("#sl" + index + "-0")
                    .removeClass("btn-primary btn-info btn-success")
                    .addClass("btn-info");
                let f = feeds[index];
                if (f.simulcastStarted)
                    f.send({ message: { request: "configure", substream: 0 } });
                else f.send({ message: { request: "configure", spatial_layer: 0 } });
            });
        window.$("#sl" + index + "-1")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary")
            .unbind("click")
            .click(function () {
                toastr.info(
                    "Switching " + what + " " + layer + ", wait for it... (normal quality)",
                    null,
                    { timeOut: 2000 }
                );
                if (!window.$("#sl" + index + "-2").hasClass("btn-success"))
                    window.$("#sl" + index + "-2")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary");
                window.$("#sl" + index + "-1")
                    .removeClass("btn-primary btn-info btn-success")
                    .addClass("btn-info");
                if (!window.$("#sl" + index + "-0").hasClass("btn-success"))
                    window.$("#sl" + index + "-0")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary");
                let f = feeds[index];
                if (f.simulcastStarted)
                    f.send({ message: { request: "configure", substream: 1 } });
                else f.send({ message: { request: "configure", spatial_layer: 1 } });
            });
        window.$("#sl" + index + "-2")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary")
            .unbind("click")
            .click(function () {
                toastr.info(
                    "Switching " + what + " " + layer + ", wait for it... (higher quality)",
                    null,
                    { timeOut: 2000 }
                );
                window.$("#sl" + index + "-2")
                    .removeClass("btn-primary btn-info btn-success")
                    .addClass("btn-info");
                if (!window.$("#sl" + index + "-1").hasClass("btn-success"))
                    window.$("#sl" + index + "-1")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary");
                if (!window.$("#sl" + index + "-0").hasClass("btn-success"))
                    window.$("#sl" + index + "-0")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary");
                let f = feeds[index];
                if (f.simulcastStarted)
                    f.send({ message: { request: "configure", substream: 2 } });
                else f.send({ message: { request: "configure", spatial_layer: 2 } });
            });
        if (!temporal)
            // No temporal layer support
            return;
        window.$("#tl" + index + "-0")
            .parent()
            .removeClass("hide");
        window.$("#tl" + index + "-0")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary")
            .unbind("click")
            .click(function () {
                toastr.info(
                    "Capping " + what + " temporal layer, wait for it... (lowest FPS)",
                    null,
                    { timeOut: 2000 }
                );
                if (!window.$("#tl" + index + "-2").hasClass("btn-success"))
                    window.$("#tl" + index + "-2")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary");
                if (!window.$("#tl" + index + "-1").hasClass("btn-success"))
                    window.$("#tl" + index + "-1")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary");
                window.$("#tl" + index + "-0")
                    .removeClass("btn-primary btn-info btn-success")
                    .addClass("btn-info");
                let f = _this.feeds[index];
                if (f.simulcastStarted)
                    f.send({ message: { request: "configure", temporal: 0 } });
                else f.send({ message: { request: "configure", temporal_layer: 0 } });
            });
        window.$("#tl" + index + "-1")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary")
            .unbind("click")
            .click(function () {
                toastr.info(
                    "Capping " + what + " temporal layer, wait for it... (medium FPS)",
                    null,
                    { timeOut: 2000 }
                );
                if (!window.$("#tl" + index + "-2").hasClass("btn-success"))
                    window.$("#tl" + index + "-2")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary");
                window.$("#tl" + index + "-1")
                    .removeClass("btn-primary btn-info")
                    .addClass("btn-info");
                if (!window.$("#tl" + index + "-0").hasClass("btn-success"))
                    window.$("#tl" + index + "-0")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary");
                let f = _this.feeds[index];
                if (f.simulcastStarted)
                    f.send({ message: { request: "configure", temporal: 1 } });
                else f.send({ message: { request: "configure", temporal_layer: 1 } });
            });
        window.$("#tl" + index + "-2")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary")
            .unbind("click")
            .click(function () {
                toastr.info(
                    "Capping " + what + " temporal layer, wait for it... (highest FPS)",
                    null,
                    { timeOut: 2000 }
                );
                window.$("#tl" + index + "-2")
                    .removeClass("btn-primary btn-info btn-success")
                    .addClass("btn-info");
                if (!window.$("#tl" + index + "-1").hasClass("btn-success"))
                    window.$("#tl" + index + "-1")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary");
                if (!window.$("#tl" + index + "-0").hasClass("btn-success"))
                    window.$("#tl" + index + "-0")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary");
                let f = _this.feeds[index];
                if (f.simulcastStarted)
                    f.send({ message: { request: "configure", temporal: 2 } });
                else f.send({ message: { request: "configure", temporal_layer: 2 } });
            });
    }

    updateSimulcastSvcButtons(feed, substream, temporal) {
        // Check the substream
        const _this = this;
        let index = feed;
        let f = _this.feeds[index];
        let simulcast = f && f.simulcastStarted;
        let what = simulcast ? "simulcast" : "SVC";
        let layer = simulcast ? "substream" : "layer";
        if (substream === 0) {
            toastr.success(
                "Switched " + what + " " + layer + "! (lower quality)",
                null,
                { timeOut: 2000 }
            );
            window.$("#sl" + index + "-2")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary");
            window.$("#sl" + index + "-1")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary");
            window.$("#sl" + index + "-0")
                .removeClass("btn-primary btn-info btn-success")
                .addClass("btn-success");
        } else if (substream === 1) {
            toastr.success(
                "Switched " + what + " " + layer + "! (normal quality)",
                null,
                { timeOut: 2000 }
            );
            window.$("#sl" + index + "-2")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary");
            window.$("#sl" + index + "-1")
                .removeClass("btn-primary btn-info btn-success")
                .addClass("btn-success");
            window.$("#sl" + index + "-0")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary");
        } else if (substream === 2) {
            toastr.success(
                "Switched " + what + " " + layer + "! (higher quality)",
                null,
                { timeOut: 2000 }
            );
            window.$("#sl" + index + "-2")
                .removeClass("btn-primary btn-info btn-success")
                .addClass("btn-success");
            window.$("#sl" + index + "-1")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary");
            window.$("#sl" + index + "-0")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary");
        }
        // Check the temporal layer
        if (temporal === 0) {
            toastr.success("Capped " + what + " temporal layer! (lowest FPS)", null, {
                timeOut: 2000,
            });
            window.$("#tl" + index + "-2")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary");
            window.$("#tl" + index + "-1")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary");
            window.$("#tl" + index + "-0")
                .removeClass("btn-primary btn-info btn-success")
                .addClass("btn-success");
        } else if (temporal === 1) {
            toastr.success("Capped " + what + " temporal layer! (medium FPS)", null, {
                timeOut: 2000,
            });
            window.$("#tl" + index + "-2")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary");
            window.$("#tl" + index + "-1")
                .removeClass("btn-primary btn-info btn-success")
                .addClass("btn-success");
            window.$("#tl" + index + "-0")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary");
        } else if (temporal === 2) {
            toastr.success("Capped " + what + " temporal layer! (highest FPS)", null, {
                timeOut: 2000,
            });
            window.$("#tl" + index + "-2")
                .removeClass("btn-primary btn-info btn-success")
                .addClass("btn-success");
            window.$("#tl" + index + "-1")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary");
            window.$("#tl" + index + "-0")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary");
        }
    }

    publishOwnFeed(useAudio) {
        const _this = this;
        let tracks = [];
        if (useAudio) tracks.push({ type: "audio", capture: true, recv: false });
        tracks.push({
            type: "video",
            capture: true,
            recv: false,
            simulcast: _this.doSimulcast,
            svc: (_this.vcodec === "vp9" || _this.vcodec === "av1") && _this.doSvc ? _this.doSvc : null,
        });

        _this.sfutest.createOffer({
            tracks: tracks,
            customizeSdp: function (jsep) {
                if (_this.doDtx) {
                    jsep.sdp = jsep.sdp.replace(
                        "useinbandfec=1",
                        "useinbandfec=1;usedtx=1"
                    );
                }
            },
            success: function (jsep) {
                let publish = { request: "configure", audio: useAudio, video: true };
                if (_this.acodec) publish["audiocodec"] = _this.acodec;
                if (_this.vcodec) publish["videocodec"] = _this.vcodec;
                _this.sfutest.send({ message: publish, jsep: jsep });
            },
            error: function (error) {
                Janus.error("WebRTC error:", error);
                if (useAudio) {
                    _this.publishOwnFeed(false);
                } else {
                }
            },
        });
    }

    registerUsername() {
        let username = "Bram";
        let register = {
            request: "join",
            room: this.myroom,
            ptype: "publisher",
            display: username,
        };
        this.sfutest.send({ message: register });
    }

    getQueryStringValue(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        let regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null
            ? ""
            : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}

export default StreamFeed;
