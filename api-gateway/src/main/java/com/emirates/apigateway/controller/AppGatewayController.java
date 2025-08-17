package com.emirates.apigateway.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@Tag(name = "Emirates API Gateway", description = "API Gateway for Emirates SDET Case Study")
public class AppGatewayController {
    private final WebClient webClient;
    private final String backendBaseUrl = "http://localhost:3000";

    public AppGatewayController() {
        this.webClient = WebClient.builder().baseUrl(backendBaseUrl).build();
    }

    
    @GetMapping("/")
    @Operation(
        summary = "Get API Gateway Information",
        description = "Returns information about the API Gateway service and available endpoints"
    )
    @ApiResponse(responseCode = "200", description = "Gateway information retrieved successfully")
    public ResponseEntity<Map<String, Object>> getGatewayInfo() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "Emirates API Gateway");
        response.put("version", "1.0.0");
        response.put("status", "UP");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        response.put("endpoints", Map.of(
            "getAllApps", "/api/apps",
            "searchApps", "/api/apps/search",
            "getAppByName", "/api/apps/{appName}",
            "health", "/health"
        ));
        return ResponseEntity.ok(response);
    }

    
    @GetMapping("/health")
    @Operation(
        summary = "Health Check",
        description = "Returns the health status of the API Gateway"
    )
    @ApiResponse(responseCode = "200", description = "Service is healthy")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Emirates API Gateway");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    
    @GetMapping("/api/apps")
    @Operation(
        summary = "Get All Applications",
        description = "Retrieves all applications from the backend service"
    )
    @ApiResponse(responseCode = "200", description = "Applications retrieved successfully")
    @ApiResponse(responseCode = "500", description = "Backend service unavailable")
    public Mono<String> getAllApps() {
        return webClient.get()
                        .uri("/api/apps")
                        .retrieve()
                        .bodyToMono(String.class)
                        .onErrorResume(e -> {
                            Map<String, Object> errorResponse = new HashMap<>();
                            errorResponse.put("error", "Backend service unavailable");
                            errorResponse.put("message", "Cannot connect to backend service");
                            return Mono.just(errorResponse.toString());
                        });
    }

    
    @GetMapping("/api/apps/search")
    @Operation(
        summary = "Search Applications",
        description = "Search applications by name, owner, or validity status"
    )
    @ApiResponse(responseCode = "200", description = "Search completed successfully")
    @ApiResponse(responseCode = "500", description = "Backend service unavailable")
    public Mono<String> searchApps(
            @Parameter(description = "Application name to search") @RequestParam(required = false) String appName,
            @Parameter(description = "Application owner to search") @RequestParam(required = false) String appOwner,
            @Parameter(description = "Application validity status to search") @RequestParam(required = false) Boolean isValid) {

        return webClient.get()
                        .uri(uriBuilder -> {
                            uriBuilder.path("/api/apps/search");
                            if (appName != null) {
                                uriBuilder.queryParam("appName", appName);
                            }
                            if (appOwner != null) {
                                uriBuilder.queryParam("appOwner", appOwner);
                            }
                            if (isValid != null) {
                                uriBuilder.queryParam("isValid", isValid);
                            }
                            return uriBuilder.build();
                        })
                        .retrieve()
                        .bodyToMono(String.class)
                        .onErrorResume(e -> {
                            Map<String, Object> errorResponse = new HashMap<>();
                            errorResponse.put("error", "Backend service unavailable");
                            errorResponse.put("message", "Cannot connect to backend service");
                            return Mono.just(errorResponse.toString());
                        });
    }

    
    @GetMapping("/api/apps/{appName}")
    @Operation(
        summary = "Get Application by Name",
        description = "Retrieves a specific application by its name"
    )
    @ApiResponse(responseCode = "200", description = "Application retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Application not found")
    @ApiResponse(responseCode = "500", description = "Backend service unavailable")
    public Mono<String> getAppByName(
            @Parameter(description = "Name of the application to retrieve") @PathVariable String appName) {
        return webClient.get()
                        .uri("/api/apps/{appName}", appName)
                        .retrieve()
                        .bodyToMono(String.class)
                        .onErrorResume(e -> {
                            Map<String, Object> errorResponse = new HashMap<>();
                            errorResponse.put("error", "Backend service unavailable");
                            errorResponse.put("message", "Cannot connect to backend service");
                            return Mono.just(errorResponse.toString());
                        });
    }
}
