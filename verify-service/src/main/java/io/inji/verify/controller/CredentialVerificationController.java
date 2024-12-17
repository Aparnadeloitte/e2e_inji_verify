package io.inji.verify.controller;

import io.inji.verify.dto.verification.VerificationStatusDto;
import io.inji.verify.spi.CredentialVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping(path = "/vc-verification")
@RestController
public class CredentialVerificationController {
    @Autowired
    CredentialVerificationService credentialVerificationService;
    @PostMapping()
    public VerificationStatusDto verify(@RequestBody String vc) {
        return credentialVerificationService.verify(vc);
    }
}