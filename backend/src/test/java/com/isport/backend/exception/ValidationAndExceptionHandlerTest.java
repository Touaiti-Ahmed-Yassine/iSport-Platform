package com.isport.backend.exception;

import com.isport.backend.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Import(ValidationAndExceptionHandlerTest.DummyValidationController.class)
class ValidationAndExceptionHandlerTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @TestConfiguration
    static class DummyValidationController {

        @RestController
        static class TestAuthValidationController {

            @PostMapping("/api/auth/test-register")
            public ResponseEntity<String> testRegister(@Valid @RequestBody RegisterRequest request) {
                return ResponseEntity.ok("valid");
            }

            @GetMapping("/api/auth/test-crash")
            public ResponseEntity<String> testCrash() {
                throw new RuntimeException("Sensitive internal SQL detail");
            }
        }
    }

    @Test
    void validRegisterRequest_returns200() throws Exception {
        String payload = """
                {
                  "email": "amine@isport.tn",
                  "password": "StrongPassword123",
                  "confirmPassword": "StrongPassword123"
                }
                """;

        mockMvc.perform(post("/api/auth/test-register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());
    }

    @Test
    void invalidEmail_returns400WithEmailFieldError() throws Exception {
        String payload = """
                {
                  "email": "not-an-email",
                  "password": "StrongPassword123",
                  "confirmPassword": "StrongPassword123"
                }
                """;

        mockMvc.perform(post("/api/auth/test-register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.email").value("Please provide a valid email address"));
    }

    @Test
    void shortPassword_returns400WithPasswordFieldError() throws Exception {
        String payload = """
                {
                  "email": "amine@isport.tn",
                  "password": "short",
                  "confirmPassword": "short"
                }
                """;

        mockMvc.perform(post("/api/auth/test-register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.password").value("Password must be at least 8 characters long"));
    }

    @Test
    void mismatchedConfirmPassword_returns400WithConfirmPasswordFieldError() throws Exception {
        String payload = """
                {
                  "email": "amine@isport.tn",
                  "password": "StrongPassword123",
                  "confirmPassword": "DifferentPassword123"
                }
                """;

        mockMvc.perform(post("/api/auth/test-register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.confirmPassword").value("Passwords do not match"));
    }

    @Test
    void malformedJson_returns400WithoutStackTrace() throws Exception {
        mockMvc.perform(post("/api/auth/test-register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ invalid json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Malformed JSON request body"));
    }

    @Test
    void unhandledException_returns500WithoutLeakingInternalDetails() throws Exception {
        mockMvc.perform(get("/api/auth/test-crash"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.message").value("An unexpected error occurred. Please try again later."))
                .andExpect(jsonPath("$.message", not(containsString("Sensitive internal SQL detail"))));
    }
}