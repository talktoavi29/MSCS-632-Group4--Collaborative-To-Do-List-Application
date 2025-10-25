package com.mscs632.trezello.store;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mscs632.trezello.model.User;
import org.springframework.stereotype.Repository;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

@Repository
public class JsonUserStore implements UserStore {
    private final ObjectMapper om;
    private final Path file;
    private final ReentrantLock lock = new ReentrantLock();

    public JsonUserStore(ObjectMapper om, Path dataDir) {
        this.om = om;
        this.file = dataDir.resolve("users.json");
    }

    @Override public List<User> findAll() {
        try {
            return om.readValue(Files.readString(file),
            new TypeReference<>(){});
        }
        catch (Exception e) { throw new RuntimeException(e); }
    }

    @Override public Optional<User> findById(String id) {
        return findAll().stream()
                .filter(u -> Objects.equals(u.getId(), id))
                .findFirst();
    }

    @Override public User save(User u) {
        lock.lock();
        try {
            List<User> all = findAll();
            all.add(u);
            Files.writeString(file, om.writeValueAsString(all));
            return u;
        } catch (Exception e)
        {
            throw new RuntimeException(e);
        }
        finally {
            lock.unlock();
        }
    }
}
