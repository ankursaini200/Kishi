package com.kishi;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class VaultControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createVaultEntryShouldReturn200() throws Exception {

        String token = createAndLoginUser();

        String requestBody = """
                {
                    "title": "GitHub",
                    "username": "testuser",
                    "encryptedPassword": "encrypted-test-password",
                    "website": "https://github.com"
                }
                """;

        mockMvc.perform(
                post("/api/vault")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
        .andExpect(status().isOk());
    }

    @Test
    void getAllVaultEntriesShouldReturn200() throws Exception {

        String token = createAndLoginUser();

        mockMvc.perform(
                get("/api/vault")
                        .header("Authorization", "Bearer " + token)
        )
        .andExpect(status().isOk());
    }

    @Test
    void getSingleVaultEntryShouldReturn200() throws Exception {

        String token = createAndLoginUser();

        String requestBody = """
                {
                    "title": "GitHub",
                    "username": "testuser",
                    "encryptedPassword": "encrypted-test-password",
                    "website": "https://github.com"
                }
                """;

        MvcResult createResult = mockMvc.perform(
                post("/api/vault")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
        .andExpect(status().isOk())
        .andReturn();

        JsonNode response =
                objectMapper.readTree(
                        createResult.getResponse().getContentAsString()
                );

        Long id = response.get("id").asLong();

        mockMvc.perform(
                get("/api/vault/" + id)
                        .header("Authorization", "Bearer " + token)
        )
        .andExpect(status().isOk());
    }

    @Test
    void searchVaultEntriesShouldReturn200() throws Exception {

        String token = createAndLoginUser();

        String requestBody = """
                {
                    "title": "GitHub",
                    "username": "testuser",
                    "encryptedPassword": "encrypted-test-password",
                    "website": "https://github.com"
                }
                """;

        mockMvc.perform(
                post("/api/vault")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
        .andExpect(status().isOk());

        mockMvc.perform(
                get("/api/vault/search")
                        .param("title", "GitHub")
                        .header("Authorization", "Bearer " + token)
        )
        .andExpect(status().isOk());
    }

    @Test
    void updateVaultEntryShouldReturn200() throws Exception {

        String token = createAndLoginUser();

        String createBody = """
                {
                    "title": "GitHub",
                    "username": "testuser",
                    "encryptedPassword": "encrypted-old-password",
                    "website": "https://github.com"
                }
                """;

        MvcResult createResult = mockMvc.perform(
                post("/api/vault")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody)
        )
        .andExpect(status().isOk())
        .andReturn();

        JsonNode response =
                objectMapper.readTree(
                        createResult.getResponse().getContentAsString()
                );

        Long id = response.get("id").asLong();

        String updateBody = """
                {
                    "title": "GitHub Updated",
                    "username": "updated-user",
                    "encryptedPassword": "encrypted-new-password",
                    "website": "https://github.com"
                }
                """;

        mockMvc.perform(
                put("/api/vault/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody)
        )
        .andExpect(status().isOk());
    }

    @Test
    void deleteVaultEntryShouldReturn200() throws Exception {

        String token = createAndLoginUser();

        String requestBody = """
                {
                    "title": "GitHub",
                    "username": "testuser",
                    "encryptedPassword": "encrypted-test-password",
                    "website": "https://github.com"
                }
                """;

        MvcResult createResult = mockMvc.perform(
                post("/api/vault")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
        .andExpect(status().isOk())
        .andReturn();

        JsonNode response =
                objectMapper.readTree(
                        createResult.getResponse().getContentAsString()
                );

        Long id = response.get("id").asLong();

        mockMvc.perform(
                delete("/api/vault/" + id)
                        .header("Authorization", "Bearer " + token)
        )
        .andExpect(status().isOk());
    }

    @Test
    void userShouldNotAccessAnotherUsersVaultEntry() throws Exception {

        String userAToken = createAndLoginUser();
        String userBToken = createAndLoginUser();

        String requestBody = """
                {
                    "title": "Private GitHub",
                    "username": "userA",
                    "encryptedPassword": "user-a-encrypted-password",
                    "website": "https://github.com"
                }
                """;

        MvcResult createResult = mockMvc.perform(
                post("/api/vault")
                        .header("Authorization", "Bearer " + userAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
        .andExpect(status().isOk())
        .andReturn();

        JsonNode response =
                objectMapper.readTree(
                        createResult.getResponse().getContentAsString()
                );

        Long id = response.get("id").asLong();

        mockMvc.perform(
                get("/api/vault/" + id)
                        .header("Authorization", "Bearer " + userBToken)
        )
        .andExpect(status().isNotFound());
    }

    @Test
    void getVaultVerifierWhenAbsentShouldReturnHasVerifierFalse() throws Exception {

        String token = createAndLoginUser();

        mockMvc.perform(
                get("/api/vault/verifier")
                        .header("Authorization", "Bearer " + token)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.hasVerifier").value(false))
        .andExpect(jsonPath("$.encryptedVerifier").isEmpty());
    }

    @Test
    void createVaultVerifierShouldInitializeAndReturnVerifier() throws Exception {

        String token = createAndLoginUser();

        String verifierPayload = "{\"version\":1,\"algorithm\":\"AES-256-GCM\"}";
        String requestBody = """
                {
                    "encryptedVerifier": %s
                }
                """.formatted(objectMapper.writeValueAsString(verifierPayload));

        mockMvc.perform(
                post("/api/vault/verifier")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.hasVerifier").value(true))
        .andExpect(jsonPath("$.encryptedVerifier").value(verifierPayload));

        mockMvc.perform(
                get("/api/vault/verifier")
                        .header("Authorization", "Bearer " + token)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.hasVerifier").value(true))
        .andExpect(jsonPath("$.encryptedVerifier").value(verifierPayload));
    }

    @Test
    void createVaultVerifierTwiceShouldReturn409() throws Exception {

        String token = createAndLoginUser();

        String firstBody = """
                {
                    "encryptedVerifier": "encrypted-verifier-v1"
                }
                """;

        mockMvc.perform(
                post("/api/vault/verifier")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(firstBody)
        )
        .andExpect(status().isOk());

        String secondBody = """
                {
                    "encryptedVerifier": "encrypted-verifier-overwrite-attempt"
                }
                """;

        mockMvc.perform(
                post("/api/vault/verifier")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(secondBody)
        )
        .andExpect(status().isConflict());

        mockMvc.perform(
                get("/api/vault/verifier")
                        .header("Authorization", "Bearer " + token)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.hasVerifier").value(true))
        .andExpect(jsonPath("$.encryptedVerifier").value("encrypted-verifier-v1"));
    }

    @Test
    void userShouldNotAccessAnotherUsersVaultVerifier() throws Exception {

        String userAToken = createAndLoginUser();
        String userBToken = createAndLoginUser();

        String userABody = """
                {
                    "encryptedVerifier": "user-a-verifier"
                }
                """;

        mockMvc.perform(
                post("/api/vault/verifier")
                        .header("Authorization", "Bearer " + userAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userABody)
        )
        .andExpect(status().isOk());

        mockMvc.perform(
                get("/api/vault/verifier")
                        .header("Authorization", "Bearer " + userBToken)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.hasVerifier").value(false))
        .andExpect(jsonPath("$.encryptedVerifier").isEmpty());
    }

    private String createAndLoginUser() throws Exception {

        String email =
                "vault-" + UUID.randomUUID() + "@example.com";

        String password = "password123";

        String registerBody = """
                {
                    "email": "%s",
                    "password": "%s"
                }
                """.formatted(email, password);

        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody)
        )
        .andExpect(status().isOk());

        String loginBody = """
                {
                    "email": "%s",
                    "password": "%s"
                }
                """.formatted(email, password);

        MvcResult loginResult = mockMvc.perform(
                post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody)
        )
        .andExpect(status().isOk())
        .andReturn();

        JsonNode response =
                objectMapper.readTree(
                        loginResult.getResponse().getContentAsString()
                );

        return response.get("token").asText();
    }
}