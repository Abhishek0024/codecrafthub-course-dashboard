package com.spring.codecrafthub.service;

import com.spring.codecrafthub.model.Course;
import com.spring.codecrafthub.model.CourseStatus;
import com.spring.codecrafthub.repository.CourseFileRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class CourseService {

    private final CourseFileRepository repository;

    public CourseService(CourseFileRepository repository) {
        this.repository = repository;
    }

    public List<Course> getAllCourses(CourseStatus status) {
        if (status == null) {
            return repository.findAll();
        }

        return repository.findAll()
                .stream()
                .filter(course -> course.getStatus() == status)
                .toList();
    }

    public Course getCourseById(String id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Course not found: " + id)
                );
    }

    public Course createCourse(Course course) {
        course.setId(Course.generateId());

        if (course.getStatus() == null) {
            course.setStatus(CourseStatus.NOT_STARTED);
        }

        return repository.save(course);
    }

    public Course updateCourse(String id, Course updatedCourse) {
        getCourseById(id);

        updatedCourse.setId(id);
        return repository.save(updatedCourse);
    }

    public Course updateStatus(String id, CourseStatus status) {
        Course course = getCourseById(id);
        course.setStatus(status);

        return repository.save(course);
    }

    public void deleteCourse(String id) {
        getCourseById(id);
        repository.deleteById(id);
    }
}