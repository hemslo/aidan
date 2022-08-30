import { CardMedia } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useCallback } from "react";
import { useEffect, useRef } from "react";
import { useInterval } from "usehooks-ts";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAccessToken, selectProjectId } from "../oauth2/oauth2Slice";
import { selectDeviceId, selectMediaSessionId, updateDeviceId, updateMediaSessionId } from "./cameraSlice";
import { ListDevicesResponse, useGenerateWebRtcStreamQuery, useListDevicesQuery, useStopWebRtcStreamMutation } from "./sdmApi";
import { WebRTC } from "./webrtc";

const getCameraDeviceId = (response?: ListDevicesResponse) => {
    if (!response) {
        return '';
    }
    const camera = response.devices.find(device => device.type === "sdm.devices.types.CAMERA");
    if (camera) {
        const parts = camera.name.split('/');
        return parts[parts.length - 1];
    }
    return '';
}

export function Camera() {
    const projectId = useAppSelector(selectProjectId);
    const accessToken = useAppSelector(selectAccessToken);
    const deviceId = useAppSelector(selectDeviceId);
    const mediaSessionId = useAppSelector(selectMediaSessionId);
    const dispatch = useAppDispatch();
    const { data: listDevicesResponse } = useListDevicesQuery(projectId, { skip: !projectId || !accessToken });

    useEffect(() => {
        if (listDevicesResponse) {
            dispatch(updateDeviceId(getCameraDeviceId(listDevicesResponse)));
        }
    }, [listDevicesResponse, dispatch]);

    const mediaStream = useRef(new MediaStream());
    const videoRef = useRef<HTMLVideoElement>(null);

    const rtcTrackEventHandler = useCallback((event: RTCTrackEvent) => {
        mediaStream.current.addTrack(event.track);
        if (videoRef.current) {
            videoRef.current.srcObject = mediaStream.current;
        }
    }, [mediaStream, videoRef]);

    const webRTC = useRef(new WebRTC(rtcTrackEventHandler));

    useEffect(() => {
        webRTC.current.createOffer();
    }, [webRTC]);

    const { data: generateWebRtcStreamResponse } = useGenerateWebRtcStreamQuery({
        projectId,
        deviceId,
        offerSdp: webRTC.current.offer?.sdp!
    }, {
        skip: !projectId || !deviceId || !webRTC.current.offer || !accessToken,
    });

    const [stopWebRtcStream] = useStopWebRtcStreamMutation();

    useEffect(() => {
        const handleGenerateWebRtcStreamResponse = async () => {
            if (generateWebRtcStreamResponse) {
                await webRTC.current.updateWebRTC(generateWebRtcStreamResponse.results.answerSdp);
                dispatch(updateMediaSessionId(generateWebRtcStreamResponse.results.mediaSessionId));
            }
        };
        handleGenerateWebRtcStreamResponse();
    }, [generateWebRtcStreamResponse, webRTC, dispatch])

    useInterval(async () => {
        console.log('regenerate webRTC stream');
        if (projectId && deviceId && mediaSessionId) {
            await stopWebRtcStream({
                projectId,
                deviceId,
                mediaSessionId,
            });
            dispatch(updateMediaSessionId(''));
            console.log('reset webRTC');
            mediaStream.current.getTracks().forEach(track => {
                mediaStream.current.removeTrack(track);
            });
            await webRTC.current.recreateOffer();
        }
    }, 5 * 60 * 1000);

    return (
        <Card>
            <CardMedia
                component="video"
                ref={videoRef}
                autoPlay
                controls
                muted
                playsInline
            />
            <CardContent>
                <Typography component="div" variant="h6">
                    Id: {deviceId}
                </Typography>
            </CardContent>
        </Card>
    );
};
