package com.example.printnparcel.service;

import com.example.printnparcel.model.Printer;
import com.example.printnparcel.repository.PrinterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PrinterService {
    @Autowired private PrinterRepository repo;

    public Printer savePrinter(Printer printer) {
        return repo.save(printer);
    }

    public List<Printer> getAllPrinters() {
        return repo.findAll();
    }
}
