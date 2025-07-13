package com.example.printnparcel.controller;

import com.example.printnparcel.model.PrintOrder;
import com.example.printnparcel.service.PrintOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/orders")
public class PrintOrderController {
    @Autowired private PrintOrderService service;

    @PostMapping("/")
    public PrintOrder createOrder(@RequestBody PrintOrder order) {
        return service.saveOrder(order);
    }

    @GetMapping("/user/{userId}")
    public List<PrintOrder> ordersByUser(@PathVariable Long userId) {
        return service.getOrdersByUser(userId);
    }
}
