package com.mscs632.trezello.store;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mscs632.trezello.model.Task;
import org.springframework.stereotype.Repository;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

@Repository
public class JsonTaskStore implements TaskStore {
    private final ObjectMapper om;
    private final Path file;
    private final ReentrantLock lock = new ReentrantLock();

    public JsonTaskStore(ObjectMapper om, Path dataDir) {
        this.om = om;
        this.file = dataDir.resolve("tasks.json");
    }

    @Override public List<Task> findAll() {
        try {
            return om.readValue(Files.readString(file),
                new TypeReference<>(){}); }
        catch (Exception e) { throw new RuntimeException(e); }
    }

    @Override public Optional<Task> findById(String id) {
        return findAll().stream()
                .filter(t -> Objects.equals(t.getId(), id))
                .findFirst();
    }

    @Override public Task upsert(Task t) {
        lock.lock();
        try {
            List<Task> all = findAll();
            int idx = -1;
            for (int i=0;i<all.size();i++) if (Objects.equals(all.get(i).getId(), t.getId())) { idx=i; break; }
            if (idx == -1) all.add(t); else all.set(idx, t);
            Files.writeString(file, om.writeValueAsString(all));
            return t;
        } catch (Exception e)
        {
            throw new RuntimeException(e);
        }
        finally {
            lock.unlock();
        }
    }

    @Override public void deleteById(String id) {
        lock.lock();
        try {
            List<Task> all = findAll();
            all.removeIf(t -> Objects.equals(t.getId(), id));
            Files.writeString(file, om.writeValueAsString(all));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        finally {
            lock.unlock();
        }
    }
}
