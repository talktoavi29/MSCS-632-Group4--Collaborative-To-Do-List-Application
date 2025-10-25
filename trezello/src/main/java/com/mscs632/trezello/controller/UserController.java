package com.mscs632.trezello.controller;

import com.mscs632.trezello.dto.CreateUserRequest;
import com.mscs632.trezello.model.User;
import com.mscs632.trezello.model.UserRole;
import com.mscs632.trezello.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService service;
    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping
    public User create(@Valid @RequestBody CreateUserRequest req)
    {
        return service.create(req);
    }

    @GetMapping
    public List<User> list(@RequestHeader("X-User-Id") String userId,
                           @RequestHeader("X-Role") String role) {
        return service.list(userId, UserRole.valueOf(role.toUpperCase()));
    }

}
