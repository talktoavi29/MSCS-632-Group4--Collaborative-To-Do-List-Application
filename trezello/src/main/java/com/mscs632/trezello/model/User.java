package com.mscs632.trezello.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

@Data
public class User {
    private String id;
    private String username;
    private String role;
//    @JsonIgnore
    private String passwordHash;
}
