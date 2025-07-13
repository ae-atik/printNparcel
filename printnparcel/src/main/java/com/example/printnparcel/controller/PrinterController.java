package com.example.printnparcel.controller;

import com.example.printnparcel.model.Printer;
import com.example.printnparcel.service.PrinterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/printers")
public class PrinterController {
    @Autowired private PrinterService service;

    @PostMapping("/")
    public Printer createPrinter(@RequestBody Printer printer) {
        return service.savePrinter(printer);
    }

    @GetMapping("/")
    public List<Printer> allPrinters() {
        return service.getAllPrinters();
    }
}

