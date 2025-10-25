package com.mscs632.trezello.store;

import com.mscs632.trezello.model.Task;
import java.util.*;

public interface TaskStore {
    List<Task> findAll();
    Optional<Task> findById(String id);
    Task upsert(Task t);
    void deleteById(String id);
}
