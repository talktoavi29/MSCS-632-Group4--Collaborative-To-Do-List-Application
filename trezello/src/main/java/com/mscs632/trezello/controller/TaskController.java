package com.mscs632.trezello.controller;

import com.mscs632.trezello.dto.*;
import com.mscs632.trezello.model.Task;
import com.mscs632.trezello.model.UserRole;
import com.mscs632.trezello.service.TaskService;
import com.mscs632.trezello.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskController {
    private final TaskService service;
    private final UserService userService;
    public TaskController(TaskService service, UserService userService)
    { this.service = service;
        this.userService = userService;
    }

    private UserRole role(String r) { return UserRole.valueOf(r.toUpperCase()); }

    @GetMapping
    public List<Task> list(@RequestHeader("X-User-Id") String userId,
                           @RequestParam(required=false) String status,
                           @RequestParam(required=false) String category,
                           @RequestParam(required=false) String assigneeId) {
        UserRole role = userService.resolveRole(userId);
        return service.list(status, category, assigneeId, userId, role);
    }

    @PostMapping
    public Task create(@RequestHeader("X-User-Id") String userId,
                       @Valid @RequestBody CreateTaskRequest req) {
        UserRole role = userService.resolveRole(userId);
        return service.create(req, userId, role);
    }

    @PutMapping("/{id}")
    public Task update(@RequestHeader("X-User-Id") String userId,
                       @PathVariable String id,
                       @Valid @RequestBody UpdateTaskRequest req) {
        UserRole role = userService.resolveRole(userId);
        return service.update(id, req, userId, role);
    }

    @PatchMapping("/{id}/complete")
    public Task complete(@RequestHeader("X-User-Id") String userId,
                         @PathVariable String id,
                         @RequestBody CompleteTaskRequest req) {
        UserRole role = userService.resolveRole(userId);
        return service.complete(id, req.version(), userId, role);
    }

    @DeleteMapping("/{id}")
    public void delete(@RequestHeader("X-User-Id") String userId,
                       @PathVariable String id) {
        UserRole role = userService.resolveRole(userId);
        service.delete(id, userId, role);
    }
}
