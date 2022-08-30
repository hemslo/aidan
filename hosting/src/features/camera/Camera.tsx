import Button from "@mui/material/Button";
import CameraIcon from '@mui/icons-material/Camera';
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import Typography from "@mui/material/Typography";
import { ListDevicesResponse, useGenerateWebRtcStreamQuery, useListDevicesQuery, useStopWebRtcStreamMutation } from "./sdmApi";
import { WebRTC } from "./webrtc";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadString } from "firebase/storage";
import { selectAccessToken, selectProjectId } from "../oauth2/oauth2Slice";
import { selectDeviceId, selectMediaSessionId, updateDeviceId, updateMediaSessionId } from "./cameraSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useCallback, useState } from "react";
import { useEffect, useRef } from "react";
import { useFirestore, useSigninCheck, useStorage } from "reactfire";
import { useInterval } from "usehooks-ts";


const REGENERATE_WEBRTC_STREAM_INTERVAL = 5 * 60 * 1000;
const SNAPSHOT_INTERVAL = 10 * 1000;

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

const takeSnapshot = (video: HTMLVideoElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
};

export function Camera() {
    const projectId = useAppSelector(selectProjectId);
    const accessToken = useAppSelector(selectAccessToken);
    const deviceId = useAppSelector(selectDeviceId);
    const mediaSessionId = useAppSelector(selectMediaSessionId);
    const dispatch = useAppDispatch();
    const storage = useStorage();
    const firestore = useFirestore();

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
    }, REGENERATE_WEBRTC_STREAM_INTERVAL);

    const { data: signInCheckResult } = useSigninCheck({ requiredClaims: { admin: 'true' } });
    const [enableSnapshot, setEnableSnapshot] = useState(false);
    const handleSnapshotSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEnableSnapshot(event.target.checked);
    };

    const handleSnapshot = useCallback(async () => {
        if (videoRef.current) {
            const filename = `${new Date().toISOString()}.jpeg`;
            console.log(`taking snapshot: ${filename}`);
            const snapshot = takeSnapshot(videoRef.current);
            const path = `snapshots/${filename}`;
            const snapshotRef = ref(storage, path);
            await uploadString(snapshotRef, snapshot, 'data_url');
            await setDoc(doc(firestore, 'snapshots', filename), { imageGcsUri: snapshotRef.toString() });
            console.log(`${filename} uploaded to ${snapshotRef}`);
        }
    }, [firestore, storage]);

    useInterval(() => handleSnapshot(), enableSnapshot ? SNAPSHOT_INTERVAL : null);

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
            {signInCheckResult && signInCheckResult.hasRequiredClaims && (
                <CardActions>
                    <FormGroup>
                        <FormControlLabel
                            control={<Switch
                                checked={enableSnapshot}
                                onChange={handleSnapshotSwitch} />}
                            label="Take snapshot every 10s" />
                    </FormGroup>
                    <Button
                        startIcon={<CameraIcon />}
                        onClick={handleSnapshot}>
                        Snapshot
                    </Button>
                </CardActions>
            )}
        </Card>
    );
};
