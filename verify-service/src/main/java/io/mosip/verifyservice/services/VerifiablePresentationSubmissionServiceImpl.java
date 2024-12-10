package io.mosip.verifyservice.services;


import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import io.mosip.vercred.vcverifier.CredentialsVerifier;
import io.mosip.vercred.vcverifier.constants.CredentialFormat;
import io.mosip.vercred.vcverifier.data.VerificationResult;
import io.mosip.verifycore.dto.submission.VpSubmissionDto;
import io.mosip.verifycore.dto.submission.ResponseAcknowledgementDto;
import io.mosip.verifycore.dto.submission.VpTokenResultDto;
import io.mosip.verifycore.enums.SubmissionState;
import io.mosip.verifycore.enums.SubmissionStatus;
import io.mosip.verifycore.enums.VerificationStatus;
import io.mosip.verifycore.exception.VerificationFailedException;
import io.mosip.verifycore.models.VcResult;
import io.mosip.verifycore.models.VpSubmission;
import io.mosip.verifycore.shared.Constants;
import io.mosip.verifycore.spi.VerifiablePresentationSubmissionService;
import io.mosip.verifyservice.repository.AuthorizationRequestCreateResponseRepository;
import io.mosip.verifyservice.repository.VpSubmissionRepository;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import static io.mosip.verifycore.utils.SecurityUtils.*;
import static io.mosip.verifycore.utils.Utils.getVerificationStatus;

@Service
public class VerifiablePresentationSubmissionServiceImpl implements VerifiablePresentationSubmissionService {

    @Autowired
    AuthorizationRequestCreateResponseRepository authorizationRequestCreateResponseRepository;
    @Autowired
    VpSubmissionRepository vpSubmissionRepository;

    @Override
    public ResponseAcknowledgementDto submit(VpSubmissionDto vpSubmissionDto) {
        new Thread(() -> {
            processSubmission(vpSubmissionDto);
        }).start();
        return new ResponseAcknowledgementDto("", "", "");

    }

    private void processSubmission(VpSubmissionDto vpSubmissionDto) {
        JSONObject vpProof = new JSONObject(vpSubmissionDto.getVpToken()).getJSONObject(Constants.KEY_PROOF);
        String jws = getFormattedJws(vpProof.getString(Constants.KEY_JWS));
        String publicKeyPem = vpProof.getString(Constants.KEY_VERIFICATION_METHOD);

        //TODO: Dynamic algo type
        try {
            Algorithm algorithm = Algorithm.RSA256(getPublicKeyFromString(publicKeyPem), null);
            JWTVerifier verifier = JWT.require(algorithm).build();
            verifier.verify(jws);

            JSONArray verifiableCredentials = new JSONObject(vpSubmissionDto.getVpToken()).getJSONArray(Constants.KEY_VERIFIABLE_CREDENTIAL);
            List<VcResult> verificationResults = getVcVerificationResults(verifiableCredentials);
            boolean combinedVerificationStatus = true;
            for (VcResult verificationResult : verificationResults) {
                combinedVerificationStatus = combinedVerificationStatus && (verificationResult.getVerificationStatus() == VerificationStatus.SUCCESS);
            }
            if (!combinedVerificationStatus) {
                throw new VerificationFailedException();
            }
            vpSubmissionRepository.save(new VpSubmission(vpSubmissionDto.getState(), vpSubmissionDto.getVpToken(), vpSubmissionDto.getPresentationSubmission(), SubmissionStatus.SUCCESS));
        } catch (Exception e) {
            e.printStackTrace();
            vpSubmissionRepository.save(new VpSubmission(vpSubmissionDto.getState(), vpSubmissionDto.getVpToken(), vpSubmissionDto.getPresentationSubmission(), SubmissionStatus.FAILED));
        }

        authorizationRequestCreateResponseRepository.findById(vpSubmissionDto.getState()).map(authorizationRequestCreateResponse -> {
            authorizationRequestCreateResponse.setSubmissionState(SubmissionState.COMPLETED);
            authorizationRequestCreateResponseRepository.save(authorizationRequestCreateResponse);
            return null;
        });
    }

    @Override
    public VpTokenResultDto getSubmissionResult(String requestId, String transactionId) {
        VpSubmission vpSubmissionResult = vpSubmissionRepository.findById(requestId).orElse(null);
        if (vpSubmissionResult == null || vpSubmissionResult.getSubmissionStatus() == SubmissionStatus.FAILED){
            return new VpTokenResultDto(transactionId,SubmissionStatus.FAILED,null);
        }
        JSONArray verifiableCredentials = new JSONObject(vpSubmissionResult.getVpToken()).getJSONArray(Constants.KEY_VERIFIABLE_CREDENTIAL);
        List<VcResult> vcVerificationResults = getVcVerificationResults(verifiableCredentials);
        return new VpTokenResultDto(transactionId,SubmissionStatus.SUCCESS,vcVerificationResults);
    }

    private static List<VcResult> getVcVerificationResults(JSONArray verifiableCredentials) {
        List<VcResult> verificationResults = new ArrayList<>();
        for (Object verifiableCredential : verifiableCredentials) {
            JSONObject credential = new JSONObject((String) verifiableCredential).getJSONObject(Constants.KEY_VERIFIABLE_CREDENTIAL).getJSONObject(Constants.KEY_CREDENTIAL);
            VerificationResult verificationResult = new CredentialsVerifier().verify(credential.toString(), CredentialFormat.LDP_VC);
            VerificationStatus singleVcVerification = getVerificationStatus(verificationResult);
            System.out.println(singleVcVerification);
            verificationResults.add(new VcResult(credential.toString(),singleVcVerification));
        }
        return verificationResults;
    }
}

