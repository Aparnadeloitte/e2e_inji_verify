package io.mosip.verifycore.utils;

import io.mosip.vercred.vcverifier.data.VerificationResult;
import io.mosip.verifycore.enums.VerificationStatus;
import io.mosip.vercred.vcverifier.constants.CredentialValidatorConstants;

import java.util.UUID;

public class Utils {
    public static String createID(String prefix){
        return prefix+"_"+UUID.randomUUID();
    }

    public static VerificationStatus getVerificationStatus(VerificationResult verificationResult){
        if (verificationResult.getVerificationStatus()){
            if (verificationResult.getVerificationErrorCode() == CredentialValidatorConstants.ERROR_CODE_VC_EXPIRED){
                return VerificationStatus.EXPIRED;
            }
            return VerificationStatus.SUCCESS;
        }
        return VerificationStatus.INVALID;
    }
}
