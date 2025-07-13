package com.example.printnparcel.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class PrintOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fileName;
    private int pageCount;
    private boolean color;
    private String status;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "printer_id")
    private Printer printer;
}
