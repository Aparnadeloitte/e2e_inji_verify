import {OvpClientId, OvpQrHeader} from "./config";

export const extractRedirectUrlFromQrData = (qrData: string) => {
    // qr data format = OVP://payload:text-content
    const regex = new RegExp(`^${OvpQrHeader}(.*)$`);
    const match = qrData.match(regex);
    return match ? match[1] : null;
}

export const initiateOvpFlow = (redirectUri: string) => {
    const encodedClintIdUrl = window.encodeURIComponent(OvpClientId);
    const encodedRedirectUrl = window.encodeURIComponent(window.location.origin);
    window.location.href = `${redirectUri}&client_id=${encodedClintIdUrl}&redirect_uri=${encodedRedirectUrl}/redirect`;
}
