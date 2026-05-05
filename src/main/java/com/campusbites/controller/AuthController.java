package com.campusbites.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${app.manager-password}")
    private String managerPassword;

    /**
     * POST /api/auth/login — Simple manager password check.
     * Request body: { "password": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String password = body.get("password");
        if (managerPassword.equals(password)) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Welcome, Manager!"));
        }
        return ResponseEntity.status(401).body(Map.of("success", false, "message", "Incorrect password."));
    }
}
