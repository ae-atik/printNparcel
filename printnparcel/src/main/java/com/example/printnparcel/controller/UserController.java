package com.example.printnparcel.controller;

import com.example.printnparcel.model.User;
import com.example.printnparcel.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired private UserService service;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return service.saveUser(user);
    }

    @GetMapping("/")
    public List<User> allUsers() {
        return service.getAllUsers();
    }
}

