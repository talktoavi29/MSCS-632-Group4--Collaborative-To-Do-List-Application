package com.mscs632.trezello.store;

import com.mscs632.trezello.model.User;
import java.util.List;
import java.util.Optional;

public interface UserStore {
    List<User> findAll();
    Optional<User> findById(String id);
    User save(User u);
}