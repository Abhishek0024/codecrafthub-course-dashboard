package com.spring.codecrafthub.repository;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.spring.codecrafthub.model.Course;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class CourseFileRepository {

    private final ObjectMapper objectMapper;
    private final Path filePath = Path.of("data", "courses.json");

    public CourseFileRepository(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        initializeFile();
    }

    private void initializeFile() {
        try {
            Files.createDirectories(filePath.getParent());

            if (!Files.exists(filePath)) {
                Files.writeString(filePath, "[]");
            }
        } catch (IOException exception) {
            throw new RuntimeException("Could not initialize courses file", exception);
        }
    }

    public synchronized List<Course> findAll() {
        try {
            String json = Files.readString(filePath);

            if (json.isBlank()) {
                return new ArrayList<>();
            }

            return objectMapper.readValue(
                    json,
                    new TypeReference<List<Course>>() {
                    }
            );
        } catch (IOException exception) {
            throw new RuntimeException("Could not read courses file", exception);
        }
    }

    public synchronized Optional<Course> findById(String id) {
        return findAll()
                .stream()
                .filter(course -> course.getId().equals(id))
                .findFirst();
    }

    public synchronized Course save(Course course) {
        List<Course> courses = findAll();

        courses.removeIf(existingCourse ->
                existingCourse.getId().equals(course.getId())
        );

        courses.add(course);
        writeAll(courses);

        return course;
    }

    public synchronized void deleteById(String id) {
        List<Course> courses = findAll();

        courses.removeIf(course -> course.getId().equals(id));
        writeAll(courses);
    }

    private void writeAll(List<Course> courses) {
        try {
            String json = objectMapper
                    .writerWithDefaultPrettyPrinter()
                    .writeValueAsString(courses);

            Files.writeString(filePath, json);
        } catch (IOException exception) {
            throw new RuntimeException("Could not write courses file", exception);
        }
    }
}