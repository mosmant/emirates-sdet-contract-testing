package com.emirates.apigateway.provider;

import au.com.dius.pact.provider.junit5.HttpTestTarget;
import au.com.dius.pact.provider.junit5.PactVerificationContext;
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider;
import au.com.dius.pact.provider.junitsupport.Provider;
import au.com.dius.pact.provider.junitsupport.State;
import au.com.dius.pact.provider.junitsupport.loader.PactUrl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestTemplate;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Provider("api-gateway-provider")
@PactUrl(urls = "file:../frontend/pacts/external-consumer-api-gateway-provider.json")
@TestPropertySource(properties = {
        "backend.service.url=http://localhost:3000",
        "logging.level.au.com.dius.pact=DEBUG"
})
public class ExternalConsumerProviderTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp(PactVerificationContext context) {
        System.out.println("🔹 Setting up API Gateway Provider Verification for External Consumers...");
        System.out.println("🌐 API Gateway running on port: " + port);

        context.setTarget(new HttpTestTarget("localhost", port));
    }

@TestTemplate
@ExtendWith(PactVerificationInvocationContextProvider.class)
void pactVerificationTestTemplate(PactVerificationContext context) {
    System.out.println("🧪 Verifying pact: " +
            context.getPact().getConsumer().getName() + " → " +
            context.getPact().getProvider().getName());

    context.verifyInteraction();
}

    // State handlers
    @State("apps exist and api gateway is ready")
    void appsExistAndApiGatewayReady() {
        System.out.println("🎭 State: Setting up 'apps exist and api gateway is ready'");
    }

    @State("searchable apps exist and api gateway is ready")
    void searchableAppsExistAndApiGatewayReady() {
        System.out.println("🎭 State: Setting up 'searchable apps exist and api gateway is ready'");
    }

    @State("app appOne exists and api gateway is ready")
    void appOneExistsAndApiGatewayReady() {
        System.out.println("🎭 State: Setting up 'app appOne exists and api gateway is ready'");
    }

    @State("api gateway is healthy")
    void apiGatewayIsHealthy() {
        System.out.println("🎭 State: Setting up 'api gateway is healthy'");
    }
}
