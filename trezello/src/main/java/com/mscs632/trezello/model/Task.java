package com.mscs632.trezello.model;

import lombok.Data;

@Data
public class Task {
    private String id;
    private String title;
    private String description;
    private TaskStatus status;
    private String category;
    private String assigneeId;
    private int version;
    private String createdAt;
    private String updatedAt;
}
