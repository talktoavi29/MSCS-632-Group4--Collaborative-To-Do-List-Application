package com.mscs632.trezello.dto;

import com.mscs632.trezello.model.UserRole;

public record UserPublic(String id, String username, UserRole role) {}