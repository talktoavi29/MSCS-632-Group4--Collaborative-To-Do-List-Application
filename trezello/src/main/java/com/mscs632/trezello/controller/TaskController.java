package com.mscs632.trezello.controller;

import com.mscs632.trezello.dto.*;
import com.mscs632.trezello.model.Task;
import com.mscs632.trezello.model.UserRole;
import com.mscs632.trezello.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskController {
    private final TaskService service;
    public TaskController(TaskService service) { this.service = service; }

    private UserRole role(String r) { return UserRole.valueOf(r.toUpperCase()); }

    @GetMapping
    public List<Task> list(@RequestParam(required=false) String status,
                           @RequestParam(required=false) String category,
                           @RequestParam(required=false) String assigneeId) {
        return service.list(status, category, assigneeId);
    }

    @PostMapping
    public Task create(@RequestHeader("X-User-Id") String userId,
                       @RequestHeader("X-Role") String role,
                       @Valid @RequestBody CreateTaskRequest req) {
        return service.create(req, userId, role(role));
    }

    @PutMapping("/{id}")
    public Task update(@RequestHeader("X-User-Id") String userId,
                       @RequestHeader("X-Role") String role,
                       @PathVariable String id,
                       @Valid @RequestBody UpdateTaskRequest req) {
        return service.update(id, req, userId, role(role));
    }

    @PatchMapping("/{id}/complete")
    public Task complete(@RequestHeader("X-User-Id") String userId,
                         @RequestHeader("X-Role") String role,
                         @PathVariable String id,
                         @RequestBody CompleteTaskRequest req) {
        return service.complete(id, req.version(), userId, role(role));
    }

    @DeleteMapping("/{id}")
    public void delete(@RequestHeader("X-User-Id") String userId,
                       @RequestHeader("X-Role") String role,
                       @PathVariable String id) {
        service.delete(id, userId, role(role));
    }
}
