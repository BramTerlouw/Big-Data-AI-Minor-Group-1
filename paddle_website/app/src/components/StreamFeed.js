class StreamFeed extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});

        this.is_stop_stream_clicked = false;
        this.is_start_stream_clicked = false;

        this.janus = null;
        this.sfutest = null;
        this.opaqueId = "videoroomtest-" + Janus.randomString(12);

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
            
             .wrapper {
                display: flex;
                justify-content: space-between;
                align-items: center;
        
                padding: 12px 15px;
                
                border-radius: 10px;
                box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
            }
        
            .wrapper-succes {
               background-color: #DCECDF;
               border-left: 10px solid #00A825;
            }
        
            .wrapper-danger {
               background-color: #EEDCDC;
               border-left: 10px solid #BA0000;
            }
        
            .wrapper-warning {
               background-color: #ffe8c3;
               border-left: 10px solid #e7a029;
            }
        
            .wrapper-info {
               background-color: #cce3ff;
               border-left: 10px solid #3e84e5;
            }
        
            .message {
               margin: 0;
               font-weight: 500;
            }
        
            .status-wrapper {
               display: flex;
               align-items: center;
               gap: 10px;
            }
        
            .status {
               font-style: italic;
            }
        
            .status-succes {
               color: #00A825;
            }
        
            .status-danger {
               color: #BA0000;
            }
        
            .status-warning {
               color: #e7a029;
            }
        
            .status-info {
               color: #3e84e5;
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
                            return this.generateMessage(mes);
                    }).join('')}
                  </div>
                  <a href="http://localhost:5173/verify-position">LOL ewaeaw</a>
                </div>
              </section>
        `

        console.log(this.messages)

        this.shadowRoot.querySelector('#start').addEventListener('click', this.start_stream.bind(this))
        this.shadowRoot.querySelector('#stop').addEventListener('click', this.stop_stream.bind(this))
        this.shadowRoot.querySelector('#dispose_rescources').addEventListener('click', this.dispose_rescources.bind(this))
    }

    generateMessage(message) {
        let htmlExtra = ``;
        if(message.status === 'succes') {
            htmlExtra = `<svg v-if="status == 'succes'" width="23" height="23" viewBox="0 0 23 23" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
                <circle cx="11.5" cy="11.5" r="10.5" fill="#00A825" stroke="#00A825" stroke-width="2"/>
                <path d="M6.83913 11.9327L9.80762 15.8706L16.3227 6.37966" stroke="white" stroke-width="2.3"
                      stroke-linecap="round"/>
            </svg>`
        }
        if (message.status === 'danger') {
            htmlExtra = `
            <svg  width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="12" r="12" fill="#BA0000"/>
                <path d="M20 6L8 18" stroke="white" stroke-width="2"/>
                <path d="M8 6L20 18" stroke="white" stroke-width="2"/>
            </svg>
        `
        }

        if (message.status === 'info') {
            htmlExtra = `
            <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.35 17.25H12.65V10.35H10.35V17.25ZM11.5 8.05C11.8258 8.05 12.0991 7.9396 12.3199 7.7188C12.5407 7.498 12.6508 7.22507 12.65 6.9C12.65 6.57417 12.5396 6.30085 12.3188 6.08005C12.098 5.85925 11.8251 5.74923 11.5 5.75C11.1742 5.75 10.9008 5.8604 10.68 6.0812C10.4592 6.302 10.3492 6.57493 10.35 6.9C10.35 7.22583 10.4604 7.49915 10.6812 7.71995C10.902 7.94075 11.1749 8.05077 11.5 8.05ZM11.5 23C9.90917 23 8.41417 22.6979 7.015 22.0938C5.61583 21.4897 4.39875 20.6705 3.36375 19.6362C2.32875 18.6012 1.50957 17.3842 0.9062 15.985C0.302833 14.5858 0.000766667 13.0908 0 11.5C0 9.90917 0.302067 8.41417 0.9062 7.015C1.51033 5.61583 2.32952 4.39875 3.36375 3.36375C4.39875 2.32875 5.61583 1.50957 7.015 0.9062C8.41417 0.302833 9.90917 0.000766667 11.5 0C13.0908 0 14.5858 0.302067 15.985 0.9062C17.3842 1.51033 18.6012 2.32952 19.6362 3.36375C20.6712 4.39875 21.4908 5.61583 22.0949 7.015C22.6991 8.41417 23.0008 9.90917 23 11.5C23 13.0908 22.6979 14.5858 22.0938 15.985C21.4897 17.3842 20.6705 18.6012 19.6362 19.6362C18.6012 20.6712 17.3842 21.4908 15.985 22.0949C14.5858 22.6991 13.0908 23.0008 11.5 23ZM11.5 20.7C14.0683 20.7 16.2437 19.8087 18.0262 18.0262C19.8087 16.2437 20.7 14.0683 20.7 11.5C20.7 8.93167 19.8087 6.75625 18.0262 4.97375C16.2437 3.19125 14.0683 2.3 11.5 2.3C8.93167 2.3 6.75625 3.19125 4.97375 4.97375C3.19125 6.75625 2.3 8.93167 2.3 11.5C2.3 14.0683 3.19125 16.2437 4.97375 18.0262C6.75625 19.8087 8.93167 20.7 11.5 20.7Z" fill="#3e84e5"/>
            </svg>
`
        }
        if (message.status === 'warning') {
            htmlExtra = `
            <svg  width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 23L11.5 0L23 23H0ZM3.60682 20.5789H19.3932L11.5 4.84211L3.60682 20.5789ZM11.5 19.3684C11.7962 19.3684 12.0447 19.2522 12.2454 19.0198C12.4461 18.7874 12.5462 18.5001 12.5455 18.1579C12.5455 17.8149 12.4451 17.5272 12.2444 17.2948C12.0436 17.0624 11.7955 16.9466 11.5 16.9474C11.2038 16.9474 10.9553 17.0636 10.7546 17.296C10.5539 17.5284 10.4538 17.8157 10.4545 18.1579C10.4545 18.5009 10.5549 18.7886 10.7556 19.021C10.9564 19.2534 11.2045 19.3692 11.5 19.3684ZM10.4545 15.7368H12.5455V9.68421H10.4545V15.7368Z" fill="#e7a029"/>
            </svg>
        `
        }
        return `
            <div class="wrapper wrapper-${message.status}">
            <p class="message">${ message.message }</p>
            <div class="status-wrapper">
              <span class="status status-${message.status}"</span>
              ${htmlExtra}
            </div>
          </div>
        `;
    }

    connectedCallback(){
        this.content();

        Janus.init({
            debug: "all",
            callback: this.janusInit.bind(this)
        });
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
        this.shadowRoot.querySelector("#stop").style.display = "none";
        this.shadowRoot.querySelector("#start").style.display = "block";

        await this.janus.destroy();
        await this.socket.close();
    }

    createInterval(callback, interval) {
        let counter = 0;
        const intervalId = setInterval(async () => {
            await callback();

            if (counter >= 25) {
                clearInterval(intervalId);
            }
            counter++;
        }, interval);

        return intervalId;
    }

    async sendStartMessage() {
        await this.socket.send(JSON.stringify({
            sender: "player",
            body: { request: "start" },
        }));
    }

    async sendPauzeMessage() {
        await this.socket.send(JSON.stringify({
            sender: "player",
            body: {request: "pause"},
        }));
    }

    async sendStopMessage() {
        await this.socket.send(JSON.stringify({
            sender: "player",
            body: {request: "stop"},
        }));
    }

    async sendInitMessage() {
        this.socket.send(JSON.stringify({
            sender: "player",
            body: { request: "ping" },
        }));
    }

    async start_stream() {
        if(this.is_start_stream_clicked)
            return
        this.is_start_stream_clicked = true;

        this.createInterval(this.sendStartMessage.bind(this), 1000);

        this.shadowRoot.querySelector("#start").style.display = "none";
        this.shadowRoot.querySelector("#stop").style.display = "block";
    }

    async stop_stream() {
        if(this.is_stop_stream_clicked)
            return;

        this.is_stop_stream_clicked = true;
        this.createInterval(this.sendPauzeMessage.bind(this), 1000);
        this.createInterval(this.sendStopMessage.bind(this), 1000);
    }

    socketOpen() {
        this.createInterval(this.sendInitMessage.bind(this), 1000);
    }

    socketOnMessage() {
        const response = JSON.parse(event.data);

        if(!response.body.status || !response.body.response)
            return;

        if(response.body.response === 'invalid request')
            return;

        if (response.body.response === 'pong') {
            this.shadowRoot.querySelector("#start").style.display = "block";
        }

        const message = {
            status: response.body.status,
            message: response.body.response
        };

        this.messages.push(message)

        this.shadowRoot.querySelector('.message-wrapper').innerHTML += this.generateMessage(message);
    }

    setup_socket() {
        this.socket = new WebSocket(
            "ws://localhost:8081/api/v1/session/ws/" + this.sessionCode
        );

        this.socket.onopen = this.socketOpen.bind(this)
        this.socket.onmessage = this.socketOnMessage.bind(this)

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
        console.log(server, iceServers)
        this.janus = new Janus({
            server: server,
            iceServers: iceServers,
            success: function () {
                _this.janus.attach({
                    plugin: "janus.plugin.videoroom",
                    opaqueId: _this.opaqueId,
                    success: function (pluginHandle) {
                        _this.sfutest = pluginHandle;
                        _this.registerUsername();
                    },
                    error: function (error) {
                        console.log(error)
                    },
                    consentDialog: function (on) {
                        console.log(on)
                    },
                    iceState: function (state) {
                        console.log(state)
                    },
                    mediaState: function (medium, on, mid) {
                        console.log(medium, on, mid)
                    },
                    webrtcState: function (on) {
                        window.$("#videolocal").parent().parent().unblock();
                        if (!on) return;
                        _this.sfutest.send({
                            message: { request: "configure", bitrate: 0 },
                        });
                    },
                    slowLink: function (uplink, lost, mid) {
                        console.log(uplink, lost, mid)
                    },
                    onmessage: function (msg, jsep) {
                        let event = msg["videoroom"];
                        if (event) {
                            if (event === "joined") {
                                // Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
                                _this.myid = msg["id"];
                                _this.mypvtid = msg["private_id"];
                                Janus.log(
                                    "Successfully joined room " + msg["room"] + " with ID " + _this.myid
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

                            //@TODO make boolean and cut this html out and put into sepperate function that is just in the content
                            // And then just call _this.content() here to force reload the rendering of the component

                            _this.shadowRoot.querySelector("#videolocal").innerHTML +=
                                '<video class="rounded centered" id="myvideo' +
                                trackId +
                                '" width=100% autoplay playsinline muted="muted"/>'

                            console.log('test  :   ' + trackId)
                            console.log(_this.shadowRoot.querySelector("#myvideo" + trackId), stream)
                            Janus.attachMediaStream(_this.shadowRoot.querySelector("#myvideo" + trackId), stream);
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
                        console.log(track, mid, on)
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
                console.log(error)
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
                            let target = document.getElementById(
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
