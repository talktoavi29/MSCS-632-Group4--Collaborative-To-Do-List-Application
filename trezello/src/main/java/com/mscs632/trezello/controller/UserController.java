package com.mscs632.trezello.controller;

import com.mscs632.trezello.dto.CreateUserRequest;
import com.mscs632.trezello.model.User;
import com.mscs632.trezello.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService service;
    public UserController(UserService service) { this.service = service; }

    @PostMapping
    public User create(@Valid @RequestBody CreateUserRequest req) { return service.create(req); }

    @GetMapping
    public List<User> list() { return service.list(); }
}
