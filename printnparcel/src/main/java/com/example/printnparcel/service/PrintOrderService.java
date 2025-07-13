package com.example.printnparcel.service;

import com.example.printnparcel.model.PrintOrder;
import com.example.printnparcel.repository.PrintOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PrintOrderService {
    @Autowired private PrintOrderRepository repo;

    public PrintOrder saveOrder(PrintOrder order) {
        return repo.save(order);
    }

    public List<PrintOrder> getOrdersByUser(Long userId) {
        return repo.findByUserId(userId);
    }
}

