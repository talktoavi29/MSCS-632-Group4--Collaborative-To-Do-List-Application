package com.mscs632.trezello.dto;

import jakarta.validation.constraints.NotBlank;
import com.mscs632.trezello.model.UserRole;

public record CreateUserRequest(
        @NotBlank String username,
        UserRole role
) {}