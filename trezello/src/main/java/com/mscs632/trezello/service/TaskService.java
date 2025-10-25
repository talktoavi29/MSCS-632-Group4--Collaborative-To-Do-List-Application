package com.mscs632.trezello.service;

import com.mscs632.trezello.dto.*;
import com.mscs632.trezello.exception.*;
import com.mscs632.trezello.model.*;
import com.mscs632.trezello.store.TaskStore;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TaskService {
    private final TaskStore store;
    public TaskService(TaskStore store) { this.store = store; }

    public List<Task> list(String status, String category, String assigneeId) {
        return store.findAll().stream()
                .filter(t -> status == null || t.getStatus().name().equalsIgnoreCase(status))
                .filter(t -> category == null || Objects.equals(t.getCategory(), category))
                .filter(t -> assigneeId == null || Objects.equals(t.getAssigneeId(), assigneeId))
                .collect(Collectors.toList());
    }

    public Task create(CreateTaskRequest req, String actorId, UserRole role) {
        if (role == UserRole.USER && !Objects.equals(actorId, req.assigneeId()))
            throw new ForbiddenException("Users can only create tasks for themselves");
        Task t = new Task();
        t.setId(UUID.randomUUID().toString());
        t.setTitle(req.title());
        t.setDescription(req.description());
        t.setCategory(req.category());
        t.setAssigneeId(req.assigneeId());
        t.setStatus(TaskStatus.PENDING);
        t.setVersion(1);
        String now = Instant.now().toString();
        t.setCreatedAt(now); t.setUpdatedAt(now);
        return store.upsert(t);
    }

    public Task update(String id, UpdateTaskRequest req, String actorId, UserRole role) {
        Task cur = store.findById(id).orElseThrow(() -> new NotFoundException("Task not found"));
        if (role == UserRole.USER && !Objects.equals(actorId, cur.getAssigneeId()))
            throw new ForbiddenException("Users can only modify their tasks");
        if (cur.getVersion() != req.version())
            throw new ConflictException("Version mismatch. Reload and retry.");
        cur.setTitle(req.title());
        cur.setDescription(req.description());
        cur.setCategory(req.category());
        if (req.status() != null) cur.setStatus(req.status());
        cur.setAssigneeId(req.assigneeId());
        cur.setVersion(cur.getVersion()+1);
        cur.setUpdatedAt(Instant.now().toString());
        return store.upsert(cur);
    }

    public Task complete(String id, int version, String actorId, UserRole role) {
        Task cur = store.findById(id).orElseThrow(() -> new NotFoundException("Task not found"));
        if (role == UserRole.USER && !Objects.equals(actorId, cur.getAssigneeId()))
            throw new ForbiddenException("Users can only modify their tasks");
        if (cur.getVersion() != version)
            throw new ConflictException("Version mismatch. Reload and retry.");
        cur.setStatus(TaskStatus.COMPLETED);
        cur.setVersion(cur.getVersion()+1);
        cur.setUpdatedAt(Instant.now().toString());
        return store.upsert(cur);
    }

    public void delete(String id, String actorId, UserRole role) {
        if (role != UserRole.ADMIN) throw new ForbiddenException("Only admins can delete");
        store.findById(id).orElseThrow(() -> new NotFoundException("Task not found"));
        store.deleteById(id);
    }
}
