const localOfferOptions = {
    offerToReceiveVideo: true,
    offerToReceiveAudio: true,
};

const servers = { 'sdpSemantics': 'unified-plan', 'iceServers': [] };

export class WebRTC {
    initialised = false;
    localPeerConnection = new RTCPeerConnection(servers);
    offer?: RTCSessionDescriptionInit;
    rtcTrackEventHandler: (event: RTCTrackEvent) => void;

    constructor(rtcTrackEventHandler: (event: RTCTrackEvent) => void) {
        this.rtcTrackEventHandler = rtcTrackEventHandler;
    }

    async createOffer() {
        if (this.initialised) {
            return;
        }
        this.initialised = true;
        this.localPeerConnection.ondatachannel = this.receiveChannelCallback;
        this.localPeerConnection.addTransceiver('audio', { direction: 'recvonly' });
        this.localPeerConnection.addTransceiver('video', { direction: 'recvonly' });
        this.localPeerConnection.createDataChannel('dataSendChannel');
        this.localPeerConnection.addEventListener('iceconnectionstatechange', this.handleIceConnectionStateChange);
        this.localPeerConnection.addEventListener('track', this.gotRemoteMediaTrack);

        console.log('create Offer');
        const offer = await this.localPeerConnection.createOffer(localOfferOptions);
        await this.localPeerConnection.setLocalDescription(offer);
        this.offer = offer;
    }

    async updateWebRTC(answerSdp: string) {
        await this.localPeerConnection.setRemoteDescription({ "type": "answer", "sdp": answerSdp })
    }

    async recreateOffer() {
        this.localPeerConnection.close();
        this.localPeerConnection = new RTCPeerConnection(servers);
        this.offer = undefined;
        this.initialised = false;
        return this.createOffer();
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
