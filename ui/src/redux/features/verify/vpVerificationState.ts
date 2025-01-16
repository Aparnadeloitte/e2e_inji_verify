import { createSlice } from "@reduxjs/toolkit";
import { verifiableClaims, VerificationSteps } from "../../../utils/config";
import { claim, VerifyState, VpSubmissionResultInt } from "../../../types/data-types";

const calculateUnverifiedClaims = (
  selectedClaims: claim[],
  verificationSubmissionResult: VpSubmissionResultInt[]
) => {
  if (selectedClaims.length > 1) return [];
  return selectedClaims.filter((claim) =>
    verificationSubmissionResult.some(
      (vc) => vc.vc.credentialConfigurationId !== claim.type
    )
  );
};

const PreloadedState: VerifyState = {
  isLoading: false,
  status: "ACTIVE",
  qrData: "",
  txnId: "",
  reqId: "",
  method: "VERIFY",
  activeScreen: VerificationSteps["VERIFY"].InitiateVpRequest,
  SelectionPanel: false,
  verificationSubmissionResult: [],
  selectedClaims: verifiableClaims.filter((claim) => claim.essential),
  unVerifiedClaims: [],
};

const vpVerificationState = createSlice({
  name: "vpVerification",
  initialState: PreloadedState,
  reducers: {
    setSelectedClaims: (state, actions) => {
      state.selectedClaims = actions.payload.selectedClaims;
    },
    getVpRequest: (state, actions) => {
      state.isLoading = true;
      state.verificationSubmissionResult = [];
      state.unVerifiedClaims = [];
    },
    setSelectCredential: (state) => {
      state.activeScreen = VerificationSteps[state.method].SelectCredential;
      state.SelectionPanel = true;
      state.verificationSubmissionResult = [];
      state.unVerifiedClaims = [];
      state.selectedClaims =  verifiableClaims.filter((claim) => claim.essential);
    },
    setVpRequestResponse: (state, action) => {
      state.qrData = action.payload.qrData;
      state.txnId = action.payload.txnId;
      state.reqId = action.payload.reqId;
      state.isLoading = false;
      state.activeScreen = VerificationSteps[state.method].ScanQrCode;
      state.SelectionPanel = false;
    },
    setVpRequestStatus: (state, action) => {
      state.status = action.payload.status;
      state.txnId = action.payload.txnId;
      state.reqId = action.payload.reqId;
    },
    verificationSubmissionComplete: (state, action) => {
      state.verificationSubmissionResult.push(
        ...action.payload.verificationResult
      );
      state.unVerifiedClaims = calculateUnverifiedClaims(
        state.selectedClaims,
        state.verificationSubmissionResult);
      const isPartiallyShared = state.unVerifiedClaims.length > 0;
      state.activeScreen = isPartiallyShared
        ? VerificationSteps[state.method].RequestMissingCredential
        : VerificationSteps[state.method].DisplayResult;
      state.txnId = "";
      state.qrData = "";
      state.reqId = "";
      state.status = "ACTIVE";
    },
    resetVpRequest: (state) => {
      state.activeScreen = VerificationSteps[state.method].InitiateVpRequest;
      state.verificationSubmissionResult = [];
      state.isLoading = false;
      state.activeScreen = VerificationSteps["VERIFY"].InitiateVpRequest;
      state.SelectionPanel = false;
      state.unVerifiedClaims = [];
      state.selectedClaims =  verifiableClaims.filter((claim) => claim.essential);
      state.txnId = "";
      state.qrData = "";
      state.reqId = "";
      state.status = "ACTIVE";
    },
  },
});

export const {
  getVpRequest,
  setSelectCredential,
  setVpRequestResponse,
  setVpRequestStatus,
  resetVpRequest,
  verificationSubmissionComplete,
  setSelectedClaims
} = vpVerificationState.actions;

export default vpVerificationState.reducer;
