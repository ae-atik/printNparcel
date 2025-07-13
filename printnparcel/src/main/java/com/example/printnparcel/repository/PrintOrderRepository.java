package com.example.printnparcel.repository;

import com.example.printnparcel.model.PrintOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrintOrderRepository extends JpaRepository<PrintOrder, Long> {
    List<PrintOrder> findByUserId(Long userId);
}
