package com.mscs632.trezello.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateTaskRequest(
        @NotBlank String title,
        String description,
        @NotBlank String category,
        @NotBlank String assigneeId
) {}