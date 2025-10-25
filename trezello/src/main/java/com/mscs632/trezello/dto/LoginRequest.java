package com.mscs632.trezello.dto;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(@NotBlank String username,
                           @NotBlank String password) {}