package com.mscs632.trezello.dto;

import jakarta.validation.constraints.NotBlank;
import com.mscs632.trezello.model.TaskStatus;

public record UpdateTaskRequest(
        @NotBlank String title,
        String description,
        @NotBlank String category,
        @NotBlank String assigneeId,
        TaskStatus status,
        int version
) {}