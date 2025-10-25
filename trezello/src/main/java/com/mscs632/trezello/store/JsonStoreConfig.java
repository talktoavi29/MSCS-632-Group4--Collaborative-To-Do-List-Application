package com.mscs632.trezello.store;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import java.nio.file.*;

@Configuration
public class JsonStoreConfig {
    @Bean public ObjectMapper objectMapper() {
        return new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);
    }

    @Bean(name="dataDir")
    public Path dataDir(@Value("${trezello.dataDir}") String dir) throws Exception {
        Path path = Path.of(dir);
        if (!Files.exists(path)) Files.createDirectories(path);
        Path users = path.resolve("users.json");
        Path tasks = path.resolve("tasks.json");
        if (!Files.exists(users)) Files.writeString(users, "[]");
        if (!Files.exists(tasks)) Files.writeString(tasks, "[]");
        return path;
    }
}
