package com.spring.codecrafthub.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public class Course {

    private String id;

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private LocalDate targetCompletionDate;

    @NotNull
    private CourseStatus status;

    public Course() {
    }

    public Course(
            String id,
            String name,
            String description,
            LocalDate targetCompletionDate,
            CourseStatus status
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.targetCompletionDate = targetCompletionDate;
        this.status = status;
    }

    public static String generateId() {
        return UUID.randomUUID().toString();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getTargetCompletionDate() {
        return targetCompletionDate;
    }

    public void setTargetCompletionDate(LocalDate targetCompletionDate) {
        this.targetCompletionDate = targetCompletionDate;
    }

    public CourseStatus getStatus() {
        return status;
    }

    public void setStatus(CourseStatus status) {
        this.status = status;
    }
}