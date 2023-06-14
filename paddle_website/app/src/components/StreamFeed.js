class StreamFeed extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});

        this.is_stop_stream_clicked = false;
        this.is_start_stream_clicked = false;
        
        this.stop_init_loop = false;
        this.stop_start_loop = false;
        this.stop_pause_loop = false;
        this.stop_stop_loop = false;

        this.janus = null;
        this.sfutest = null;
        this.opaqueId = "videoroomtest-" + Janus.randomString(12);

        this.myusername = null;
        this.myroom = null;
        this.sessionCode = null;
        this.socket = null;
        this.messages = [];
        this.intervalTimer = 3000;

        this.myid = null;
        this.mystream = null;
        this.mypvtid = null;

        this.localTracks = {};
        this.localVideos = 0;
        this.feeds = [];
        this.feedStreams = {};

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
               height: 100%;
               padding: 10px;
            }
            
            .message-wrapper {
               width: 45%;
               height: 100%;
               padding: 10px;
               box-sizing: border-box;
            
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
               cursor: pointer;
               display: none;
            }
            
            .btn-stop {
               width: 100%;
               background-color: red;
               border: none;
               color: #fff;
               cursor: pointer;
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
            
            .loading {
              display: none; 
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
            
            .spinner {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              border: 4px solid #ccc;
              border-top-color: #777;
              animation: spin 1s infinite linear;
            }
            
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
            
            .redirect-modal {
              display: none;
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            
              flex-direction: column;
              align-items: center;
              padding: 10px;
            
              border: 1px solid lightgrey;
              border-radius: 5px;
              background-color: white;
            }
            
            .redirect-modal h1 {
              margin: 0;
              font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
              font-weight: 500;
              line-height: 1.2;
              color: #317eac;
            }
            
            .redirect-modal p {
              color: gray;
              font-style: italic;
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
                    <div class="timer">${this.generateDateTime()}</div>
                    <div class="panel-body" id="videolocal"></div>
                  </div>
                  <div class="message-wrapper">
                  </div>
                </div>
                
                <div id="loadingElement" class="loading">
                  <div class="spinner"></div>
                </div>
              </section>
              
              <div id="redirect-modal" class="redirect-modal">
                <h1>
                  Session finished
                </h1>
                <p>You will be redirected in a few seconds.</p>
                <span id="countdown"></span>
              </div>
        `

        console.log(this.messages)

        this.shadowRoot.querySelector('#start').addEventListener('click', this.start_stream.bind(this))
        this.shadowRoot.querySelector('#stop').addEventListener('click', this.stop_stream.bind(this))
    }

     generateDateTime() {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

        const now = new Date();
        const dayOfWeek = daysOfWeek[now.getDay()];
        const year = now.getFullYear().toString().slice(-2);
        const month = months[now.getMonth()];
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");

        return `${dayOfWeek} ${day}-${month}-${year} ${hours}:${minutes}`;
    }

     updateTimer() {
        const timerElement = this.shadowRoot.querySelector(".timer");
        if (timerElement) {
            timerElement.textContent = this.generateDateTime();
        }
    }

    countdown() {
      var span = this.shadowRoot.querySelector("#countdown")
      var count = 5;

      var interval = setInterval(() => {
        span.textContent = count
        count--;

        if (count < 0) {
          clearInterval(interval);
          window.location.href = window.location.origin + '/dashboard'
        }
      }, 1000);
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
        this.content()
        this.shadowRoot.querySelector("#loadingElement").style.display = "block";
        setInterval(this.updateTimer.bind(this), 1000);
        Janus.init({
            debug: "all",
            callback: this.janusInit.bind(this)
        });
    }

    async disconnectedCallback() {
        await this.dispose_rescources();

        //@todo Delete all active event listererns in js for omtimization
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

        this.shadowRoot.querySelector("#redirect-modal").style.display = "flex";
        this.countdown()
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
            body: { request: "connect" },
        }));
    }

    async start_stream() {
        if(this.is_start_stream_clicked)
            return

        this.shadowRoot.querySelector("#loadingElement").style.display = "block";

        this.is_start_stream_clicked = true;

        this.createInterval(this.sendStartMessage.bind(this), this.intervalTimer);

        this.shadowRoot.querySelector("#start").style.display = "none";
        this.shadowRoot.querySelector("#stop").style.display = "block";
    }

    createInterval(callback, interval) {
        let counter = 0;
        const intervalId = setInterval(async () => {
            await callback();

            if (
                counter >= 25 || 
                this.stop_init_loop|| 
                this.stop_start_loop || 
                this.stop_pause_loop || 
                this.stop_stop_loop
                ) {
                clearInterval(intervalId);
            }
            counter++;
        }, interval);

        return intervalId;
    }

    async stop_stream() {
        if(this.is_stop_stream_clicked)
            return;

        this.is_stop_stream_clicked = true;
        this.createInterval(this.sendPauzeMessage.bind(this), this.intervalTimer);
        this.createInterval(this.sendStopMessage.bind(this), this.intervalTimer);
    }

    socketOpen() {
        this.createInterval(this.sendInitMessage.bind(this), this.intervalTimer);
    }

    socketOnMessage(event) {
        const response = JSON.parse(event.data);

        if(!response.body.status || !response.body.response)
            return;

        if(response.body.response === 'invalid request')
            return;

        if (response.body.response === 'connected') {
            this.stop_init_loop = true;
            this.shadowRoot.querySelector("#start").style.display = "block";
            this.shadowRoot.querySelector("#loadingElement").style.display = "none";
        }

        if (response.body.response === 'started') {
            this.stop_start_loop = true;
            this.shadowRoot.querySelector("#loadingElement").style.display = "none";
        }

        if (response.body.response === 'paused') {
            this.stop_pause_loop = true;
        }

        if (response.body.response === 'stopped') {
            this.stop_stop_loop = true;
            this.dispose_rescources();
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

        const _this = this;
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
                                _this.publishOwnFeed(true);

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
                        let stream = _this.localTracks[trackId];
                        if (stream)
                            return;

                        if(track.kind !== "audio") {
                            // New video track: create a stream out of it
                            _this.localVideos++;
                            window.$("#videolocal .no-video-container").remove();
                            stream = new MediaStream([track]);
                            _this.localTracks[trackId] = stream;
                            Janus.log("Created local stream:", stream);
                            Janus.log(stream.getTracks());
                            Janus.log(stream.getVideoTracks());

                            console.log(_this.shadowRoot)
                            _this.shadowRoot.querySelector("#videolocal").innerHTML +=
                                '<video class="rounded centered" id="myvideo' +
                                trackId +
                                '" width=100% autoplay playsinline muted="muted"/>'

                            Janus.attachMediaStream(_this.shadowRoot.querySelector("#myvideo" + trackId), stream);
                        }
                    },
                    onremotetrack: function (track, mid, on) {
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
            },
            destroyed: function () {},
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
            onmessage: function (msg, jsep) {},
            onlocaltrack: function (track, on) {},
            onremotetrack: function (track, mid, on, metadata) {},
            oncleanup: function () {},
        });
    }

    escapeXmlTags(value) {
        if (value) {
            let escapedValue = value.replace(new RegExp("<", "g"), "&lt");
            escapedValue = escapedValue.replace(new RegExp(">", "g"), "&gt");
            return escapedValue;
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
