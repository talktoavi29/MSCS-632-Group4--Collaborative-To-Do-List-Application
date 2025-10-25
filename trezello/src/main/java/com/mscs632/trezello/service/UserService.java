package com.mscs632.trezello.service;

import com.mscs632.trezello.dto.CreateUserRequest;
import com.mscs632.trezello.exception.BadRequestException;
import com.mscs632.trezello.model.User;
import com.mscs632.trezello.model.UserRole;
import com.mscs632.trezello.store.UserStore;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {
    private final UserStore store;
    public UserService(UserStore store) { this.store = store; }

    public User create(CreateUserRequest req) {
        if (req.role() == null) throw new BadRequestException("role required");
        User u = new User();
        u.setId(UUID.randomUUID().toString());
        u.setUsername(req.username());
        u.setRole(String.valueOf(req.role()));
        return store.save(u);
    }

    public List<User> list() { return store.findAll(); }
}
