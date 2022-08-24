import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAccessToken, selectProjectId } from "../auth/authSlice";
import { selectDeviceId, updateDeviceId } from "./cameraSlice";
import { ListDevicesResponse, useListDevicesQuery } from "./sdmApi";

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
    const dispatch = useAppDispatch();
    const { data: listDevicesResponse } = useListDevicesQuery(projectId, { skip: !projectId || !accessToken });

    useEffect(() => {
        if (listDevicesResponse) {
            dispatch(updateDeviceId(getCameraDeviceId(listDevicesResponse)));
        }
    }, [listDevicesResponse, dispatch]);

    return (
        <Card>
            <CardContent>
                <Typography component="div" variant="h6">
                    Id: {deviceId}
                </Typography>
            </CardContent>
        </Card>
    );
};
