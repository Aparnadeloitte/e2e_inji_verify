package io.mosip.verifyservice.controller;

import io.mosip.verifycore.dto.authorizationRequest.VPRequestCreateDto;
import io.mosip.verifycore.dto.authorizationRequest.VPRequestResponseDto;
import io.mosip.verifycore.dto.authorizationRequest.StatusDto;
import io.mosip.verifycore.enums.SubmissionState;
import io.mosip.verifycore.spi.VerifiablePresentationRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/vp-request")
@RestController
@CrossOrigin(origins = "*")
public class VpRequestController {

    @Autowired
    VerifiablePresentationRequestService verifiablePresentationRequestService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<VPRequestResponseDto> createVpRequest(@Valid @RequestBody VPRequestCreateDto vpRequestCreate) {
        if (vpRequestCreate.getPresentationDefinition() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        VPRequestResponseDto authorizationRequestResponse = verifiablePresentationRequestService.createAuthorizationRequest(vpRequestCreate);
        return new ResponseEntity<>(authorizationRequestResponse, HttpStatus.CREATED);
    }

    @GetMapping(path = "/{requestId}/status")
    public ResponseEntity<StatusDto> getStatus(@PathVariable String requestId) {

        String transactionId = verifiablePresentationRequestService.getTransactionIdFor(requestId);
        SubmissionState currentSubmissionState = verifiablePresentationRequestService.getCurrentSubmissionStateFor(requestId);
        if (currentSubmissionState == null || transactionId == null)
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);

        return new ResponseEntity<>(new StatusDto(transactionId, requestId, currentSubmissionState), HttpStatus.OK);
    }
}
