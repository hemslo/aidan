const localOfferOptions = {
    offerToReceiveVideo: true,
    offerToReceiveAudio: true,
};

const servers = { 'sdpSemantics': 'unified-plan', 'iceServers': [] };

export class WebRTC {
    localPeerConnection: RTCPeerConnection;
    offer?: RTCSessionDescriptionInit;
    rtcTrackEventHandler: (event: RTCTrackEvent) => void;
    initialised = false;

    constructor(rtcTrackEventHandler: (event: RTCTrackEvent) => void) {
        this.localPeerConnection = new RTCPeerConnection(servers);
        this.rtcTrackEventHandler = rtcTrackEventHandler;
    }

    async createOffer() {
        if (this.initialised) {
            return;
        }
        this.initialised = true;
        this.localPeerConnection.ondatachannel = this.receiveChannelCallback;
        this.localPeerConnection.createDataChannel('dataSendChannel');
        this.localPeerConnection.addEventListener('iceconnectionstatechange', this.handleIceConnectionStateChange);
        this.localPeerConnection.addEventListener('track', this.gotRemoteMediaTrack);
        console.log('create Offer');
        const offer = await this.localPeerConnection.createOffer(localOfferOptions);
        await this.localPeerConnection.setLocalDescription(offer);
        this.offer = offer;
    }

    async updateWebRTC(answerSDP: string) {
        await this.localPeerConnection.setRemoteDescription({ "type": "answer", "sdp": answerSDP })
    }

    handleIceConnectionStateChange = (event: Event) => {
        console.log('ICE state change event: ', event);
    }

    gotRemoteMediaTrack = (event: RTCTrackEvent) => {
        console.log('gotRemoteMediaTrack()');
        this.rtcTrackEventHandler(event);
        console.log('Received remote track.');
    }

    handleReceiveMessage = (event: MessageEvent) => {
        console.log(`Incoming DataChannel push: ${event.data}`);
    };

    receiveChannelCallback = (event: RTCDataChannelEvent) => {
        console.log('receiveChannelCallback');
        const receiveChannel = event.channel;
        receiveChannel.onmessage = this.handleReceiveMessage;
    };
}