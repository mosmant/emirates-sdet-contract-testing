package com.emirates.apigateway.consumer;

import au.com.dius.pact.consumer.MockServer;
import au.com.dius.pact.consumer.dsl.PactBuilder;
import au.com.dius.pact.consumer.junit5.PactConsumerTestExt;
import au.com.dius.pact.consumer.junit5.PactTestFor;
import au.com.dius.pact.core.model.V4Pact;
import au.com.dius.pact.core.model.annotations.Pact;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "backend-provider")
public class BackendConsumerPactTest {

    private final WebClient webClient = WebClient.builder().build();

    @Pact(consumer = "api-gateway")
    public V4Pact getAllAppsPact(PactBuilder builder) {
        return builder
                .usingLegacyDsl()
                .given("apps exist")
                .uponReceiving("a request for all apps")
                .path("/api/apps")
                .method("GET")
                .willRespondWith()
                .status(200)
                .headers(Map.of("Content-Type", "application/json"))
                .body("{\"success\": true, \"data\": [{\"appName\": \"appOne\", \"appData\": {\"appPath\": \"/appSix\", \"appOwner\": \"Osman\", \"isValid\": true}}], \"count\": 1}")
                .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "getAllAppsPact")
    void testGetAllApps(MockServer mockServer) {
        String baseUrl = mockServer.getUrl();
        Mono<String> result = webClient.get()
                .uri(baseUrl + "/api/apps")
                .retrieve()
                .bodyToMono(String.class);

        StepVerifier.create(result)
                .expectNextMatches(response -> {
                    assertTrue(response.contains("\"success\": true"));
                    assertTrue(response.contains("\"data\":"));
                    assertTrue(response.contains("\"count\": 1"));
                    return true;
                })
                .verifyComplete();
    }

    @Pact(consumer = "api-gateway")
    public V4Pact searchAppsPact(PactBuilder builder) {
        return builder
                .usingLegacyDsl()
                .given("apps exist for search")
                .uponReceiving("a search request for apps")
                .path("/api/apps/search")
                .query("appName=app")
                .method("GET")
                .willRespondWith()
                .status(200)
                .headers(Map.of("Content-Type", "application/json"))
                .body("{\"success\": true, \"data\": [{\"appName\": \"appOne\", \"appData\": {\"appPath\": \"/appSix\", \"appOwner\": \"Osman\", \"isValid\": true}}], \"count\": 1, \"criteria\": {\"appName\": \"app\"}}")
                .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "searchAppsPact")
    void testSearchApps(MockServer mockServer) {
        String baseUrl = mockServer.getUrl();
        Mono<String> result = webClient.get()
                .uri(baseUrl + "/api/apps/search?appName=app")
                .retrieve()
                .bodyToMono(String.class);

        StepVerifier.create(result)
                .expectNextMatches(response -> {
                    assertTrue(response.contains("\"success\": true"));
                    assertTrue(response.contains("\"criteria\":"));
                    return true;
                })
                .verifyComplete();
    }

    @Pact(consumer = "api-gateway")
    public V4Pact getAppByNamePact(PactBuilder builder) {
        return builder
                .usingLegacyDsl()
                .given("app appOne exists")
                .uponReceiving("a request for app appOne")
                .path("/api/apps/appOne")
                .method("GET")
                .willRespondWith()
                .status(200)
                .headers(Map.of("Content-Type", "application/json"))
                .body("{\"success\": true, \"data\": {\"appName\": \"appOne\", \"appData\": {\"appPath\": \"/appSix\", \"appOwner\": \"Osman\", \"isValid\": true}}}")
                .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "getAppByNamePact")
    void testGetAppByName(MockServer mockServer) {
        String baseUrl = mockServer.getUrl();
        Mono<String> result = webClient.get()
                .uri(baseUrl + "/api/apps/appOne")
                .retrieve()
                .bodyToMono(String.class);

        StepVerifier.create(result)
                .expectNextMatches(response -> {
                    assertTrue(response.contains("\"appName\": \"appOne\""));
                    return true;
                })
                .verifyComplete();
    }

    @Pact(consumer = "api-gateway")
    public V4Pact healthCheckPact(PactBuilder builder) {
        return builder
                .usingLegacyDsl()
                .given("backend is healthy")
                .uponReceiving("a health check request")
                .path("/health")
                .method("GET")
                .willRespondWith()
                .status(200)
                .headers(Map.of("Content-Type", "application/json"))
                .body("{\"status\": \"UP\", \"service\": \"Backend Service\", \"timestamp\": \"2024-01-01T00:00:00Z\"}")
                .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "healthCheckPact")
    void testHealthCheck(MockServer mockServer) {
        String baseUrl = mockServer.getUrl();
        Mono<String> result = webClient.get()
                .uri(baseUrl + "/health")
                .retrieve()
                .bodyToMono(String.class);

        StepVerifier.create(result)
                .expectNextMatches(response -> {
                    assertTrue(response.contains("\"status\": \"UP\""));
                    return true;
                })
                .verifyComplete();
    }
}
