package com.example.printnparcel.repository;

import com.example.printnparcel.model.Printer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrinterRepository extends JpaRepository<Printer, Long> { }
